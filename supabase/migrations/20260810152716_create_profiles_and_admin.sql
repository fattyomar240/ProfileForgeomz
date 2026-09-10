/*
# Create profiles table with admin/user roles, account status, and admin functions

## Overview
Adds the core data model for ProfileForge multi-user support: a `profiles` table
linked to Supabase Auth that stores each user's professional profile, their role
(`user` or `admin`), and account status (`active` or `disabled`). Includes
row-level security so users only see their own profile while admins can see all,
plus SECURITY DEFINER functions for privileged admin actions (disable/enable and
delete users). A trigger automatically creates a profile row whenever a new auth
user signs up. Realtime is enabled so the admin dashboard updates live.

## 1. New Tables
- `public.profiles`
  - `id` (uuid, primary key) — references `auth.users(id)`, ON DELETE CASCADE.
    Same ID as the auth user, so `auth.uid() = id` is the ownership check.
  - `full_name` (text) — display name.
  - `title` (text) — professional title.
  - `bio` (text) — short biography.
  - `location` (text) — user location string.
  - `email` (text) — denormalized copy of the auth email for fast listing/search.
  - `phone` (text) — phone number.
  - `photo_url` (text) — profile photo URL or data URL.
  - `skills` (text[]) — array of skill strings.
  - `github_url` (text) — GitHub profile URL.
  - `linkedin_url` (text) — LinkedIn profile URL.
  - `portfolio_url` (text) — personal portfolio URL.
  - `role` (text, not null, default 'user') — 'user' or 'admin'. Admin-only writes.
  - `status` (text, not null, default 'active') — 'active' or 'disabled'. Admin-only writes.
  - `created_at` (timestamptz, default now()) — registration timestamp.
  - `last_seen_at` (timestamptz, default now()) — updated on login for "active users" metric.

## 2. Security — Row Level Security
- RLS enabled on `profiles`.
- SELECT: authenticated users can read their own row; admins can read all rows.
- INSERT: a user can insert only their own row.
- UPDATE: a user can update only their own row, AND only the user-editable
  content columns (role/status/created_at are protected by column grants below).
- DELETE: admins can delete any row.

## 3. Security — Column-level privileges
- `role`, `status`, `created_at`, `last_seen_at`, and `email` are NOT writable
  by the `authenticated` role via the data API. `role` and `status` are changed
  only through SECURITY DEFINER admin functions. `email` mirrors the auth email
  and is set only by the signup trigger.

## 4. Helper functions
- `public.is_admin()` — returns true when the current caller's profile has
  `role = 'admin'` and `status = 'active'`. Used in RLS policies and admin functions.
- `public.set_user_status(p_user uuid, p_status text)` — SECURITY DEFINER.
  Admin-only. Validates caller is admin, validates status value, refuses to
  disable the last remaining admin, refuses self-disable.
- `public.delete_user_account(p_user uuid)` — SECURITY DEFINER. Admin-only.
  Validates caller is admin, refuses self-delete, refuses deleting the last
  remaining admin, then deletes the auth user (cascades to the profile row).

## 5. Trigger
- `public.handle_new_user()` — SECURITY DEFINER. AFTER INSERT on `auth.users`.
  Inserts a profiles row with the new user's id and email, role 'user',
  status 'active'.

## 6. Realtime
- `public.profiles` added to the supabase_realtime publication.

## 7. Important notes
- Admin accounts are NOT created by this migration. The project owner signs up
  as a normal user, then promotes that account by running:
    UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
  This manual step keeps admin credentials out of frontend code.
- Normal users cannot access admin data: the RLS SELECT policy returns only
  their own row, so every admin query returns zero rows for non-admins.
*/

-- ============================================================
-- 1. Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  title text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  photo_url text DEFAULT '',
  skills text[] DEFAULT '{}',
  github_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  portfolio_url text DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles (status);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- ============================================================
-- 2. Helper functions (defined BEFORE policies that reference them)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- 3. RLS policies
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_delete_admin"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 4. Column-level privileges: protect privileged columns
-- ============================================================
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  full_name, title, bio, location, phone, photo_url,
  skills, github_url, linkedin_url, portfolio_url
) ON public.profiles TO authenticated;

-- ============================================================
-- 5. Admin action functions (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_user_status(p_user uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_count int;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_user = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own account status';
  END IF;

  IF p_status NOT IN ('active', 'disabled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  IF p_status = 'disabled' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.profiles
    WHERE role = 'admin' AND status = 'active';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot disable the last remaining admin';
    END IF;
  END IF;

  UPDATE public.profiles SET status = p_status WHERE id = p_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_user_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_user_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_user_account(p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  v_admin_count int;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_user = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  SELECT count(*) INTO v_admin_count
  FROM public.profiles
  WHERE role = 'admin' AND status = 'active';
  IF v_admin_count <= 1 THEN
    RAISE EXCEPTION 'Cannot delete the last remaining admin';
  END IF;

  DELETE FROM auth.users WHERE id = p_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;

-- ============================================================
-- 6. Signup trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, last_seen_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
