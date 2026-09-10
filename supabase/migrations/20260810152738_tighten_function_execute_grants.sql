/*
# Tighten EXECUTE grants on admin functions

## Overview
The SECURITY DEFINER functions `is_admin`, `set_user_status`, and
`delete_user_account` were still executable by the `anon` role because
Postgres grants EXECUTE to PUBLIC by default. The previous REVOKE from anon
removed the explicit grant but not the PUBLIC default. This migration revokes
EXECUTE from PUBLIC on all three functions and grants explicitly to
`authenticated` only, so unauthenticated callers cannot invoke them.

## Changes
- REVOKE EXECUTE ON `is_admin()`, `set_user_status(uuid, text)`,
  `delete_user_account(uuid)` FROM PUBLIC.
- GRANT EXECUTE on each TO authenticated.
- `handle_new_user()` is a trigger function (never called directly), revoke
  from PUBLIC for hygiene.
*/

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.set_user_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_status(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
