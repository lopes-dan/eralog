/*
  # Revoke public EXECUTE on handle_new_user

  The handle_new_user() function is a trigger-only function and should never
  be callable directly via the REST API. Revoke EXECUTE from anon and
  authenticated roles to prevent exposure as a SECURITY DEFINER RPC endpoint.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
