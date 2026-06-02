-- Registration is open/closed only — no public capacity or waitlist logic

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
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.submit_registration(
  p_player_name TEXT,
  p_player_age INTEGER,
  p_player_grade SMALLINT,
  p_grade_basis TEXT,
  p_parent_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_emergency_contact TEXT,
  p_eligibility_ack BOOLEAN,
  p_waiver_version TEXT,
  p_photo_release BOOLEAN,
  p_skill_level TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_sibling_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_open BOOLEAN;
  v_id UUID;
BEGIN
  IF NOT p_eligibility_ack THEN
    RAISE EXCEPTION 'eligibility_required';
  END IF;

  SELECT COALESCE(
    (SELECT registrations_open FROM public.camp_settings ORDER BY updated_at DESC LIMIT 1),
    true
  ) INTO v_open;

  IF NOT v_open THEN
    RAISE EXCEPTION 'registration_closed';
  END IF;

  INSERT INTO public.registrations (
    player_name,
    player_age,
    player_grade,
    grade_basis,
    parent_name,
    email,
    phone,
    emergency_contact,
    skill_level,
    notes,
    sibling_note,
    eligibility_ack,
    waiver_version,
    waiver_accepted_at,
    photo_release,
    status
  ) VALUES (
    p_player_name,
    p_player_age,
    p_player_grade,
    p_grade_basis,
    p_parent_name,
    lower(trim(p_email)),
    p_phone,
    p_emergency_contact,
    p_skill_level,
    p_notes,
    p_sibling_note,
    p_eligibility_ack,
    p_waiver_version,
    now(),
    COALESCE(p_photo_release, false),
    'pending'
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id, 'status', 'pending');
END;
$$;
