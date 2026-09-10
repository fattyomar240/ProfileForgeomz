/*
# Create profile-photos storage bucket

## Overview
Creates a private storage bucket `profile-photos` for user profile images.
Each user uploads into a folder named after their auth user id, so one user
cannot overwrite another user's photo. RLS policies on storage.objects enforce
that the owner can read/write/update/delete only their own folder, and anyone
can read profile photos (they are public-facing on profile cards).

## Changes
- Insert bucket `profile-photos` (public read, private write).
- Storage policies:
  - SELECT (read): public — anyone can view a profile photo.
  - INSERT: authenticated, must be in their own folder (storage.foldername = auth.uid()).
  - UPDATE: authenticated, own folder only.
  - DELETE: authenticated, own folder only.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "profile_photos_read_public" ON storage.objects;
CREATE POLICY "profile_photos_read_public"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "profile_photos_insert_own" ON storage.objects;
CREATE POLICY "profile_photos_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "profile_photos_update_own" ON storage.objects;
CREATE POLICY "profile_photos_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "profile_photos_delete_own" ON storage.objects;
CREATE POLICY "profile_photos_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
