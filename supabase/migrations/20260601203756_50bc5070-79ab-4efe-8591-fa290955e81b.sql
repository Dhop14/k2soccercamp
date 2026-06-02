-- Revoke any SELECT/UPDATE/DELETE access from public roles on registrations.
-- Submissions still work via the existing INSERT policy for anon/authenticated.
REVOKE SELECT, UPDATE, DELETE ON public.registrations FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.registrations FROM authenticated;
REVOKE ALL ON public.registrations FROM PUBLIC;

-- Ensure service_role retains full access for admin/backend use.
GRANT ALL ON public.registrations TO service_role;

-- Explicit deny SELECT policy for clarity (RLS already blocks without a policy,
-- but this makes intent obvious and satisfies the scanner).
DROP POLICY IF EXISTS "Deny all reads from clients" ON public.registrations;
CREATE POLICY "Deny all reads from clients"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (false);
