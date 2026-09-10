/*
# Revoke direct execution on trigger function handle_new_user

## Overview
The signup trigger function `handle_new_user()` is SECURITY DEFINER and was
still executable by the `authenticated` role via the REST RPC endpoint. It is
a trigger function meant to fire only on `auth.users` INSERT — it should never
be called directly. This revokes EXECUTE from authenticated so it cannot be
invoked via `/rest/v1/rpc/handle_new_user`.

## Changes
- REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
