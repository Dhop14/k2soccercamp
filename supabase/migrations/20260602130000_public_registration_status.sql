-- Public status for register page loader (no service role required on server)
CREATE OR REPLACE FUNCTION public.get_registration_status()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'open', COALESCE(
      (SELECT registrations_open FROM public.camp_settings ORDER BY updated_at DESC LIMIT 1),
      true
    ),
    'waitlist_enabled', COALESCE(
      (SELECT waitlist_enabled FROM public.camp_settings ORDER BY updated_at DESC LIMIT 1),
      true
    ),
    'max_spots', COALESCE(
      (SELECT max_spots FROM public.camp_settings ORDER BY updated_at DESC LIMIT 1),
      40
    ),
    'pending_count', (
      SELECT count(*)::int FROM public.registrations WHERE status = 'pending'
    )
  );
$$;

REVOKE ALL ON FUNCTION public.get_registration_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_registration_status() TO anon, authenticated, service_role;
