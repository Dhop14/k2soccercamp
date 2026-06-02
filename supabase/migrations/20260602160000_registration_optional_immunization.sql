-- Immunization status is optional (no longer tied to NJ youth camp / SSYC requirements).

ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_immunization_status_check;

ALTER TABLE public.registrations
  ALTER COLUMN immunization_status DROP NOT NULL;

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
  p_allergies TEXT,
  p_emergency_contact_name TEXT,
  p_emergency_contact_phone TEXT,
  p_health_form_version TEXT,
  p_emergency_consent_version TEXT,
  p_health_form_ack BOOLEAN,
  p_emergency_medical_consent_ack BOOLEAN,
  p_skill_level TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_sibling_note TEXT DEFAULT NULL,
  p_medical_conditions TEXT DEFAULT NULL,
  p_medications TEXT DEFAULT NULL,
  p_activity_restrictions TEXT DEFAULT NULL,
  p_physician_name TEXT DEFAULT NULL,
  p_physician_phone TEXT DEFAULT NULL,
  p_immunization_status TEXT DEFAULT NULL,
  p_immunization_notes TEXT DEFAULT NULL,
  p_secondary_emergency_contact TEXT DEFAULT NULL
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
  IF NOT p_eligibility_ack OR NOT p_health_form_ack OR NOT p_emergency_medical_consent_ack THEN
    RAISE EXCEPTION 'consent_required';
  END IF;

  IF p_immunization_status IS NOT NULL
    AND p_immunization_status NOT IN ('up_to_date', 'in_progress', 'medical_exemption', 'religious_exemption') THEN
    RAISE EXCEPTION 'invalid_immunization_status';
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
    status,
    allergies,
    medical_conditions,
    medications,
    activity_restrictions,
    physician_name,
    physician_phone,
    immunization_status,
    immunization_notes,
    emergency_contact_name,
    emergency_contact_phone,
    secondary_emergency_contact,
    health_form_version,
    health_form_accepted_at,
    emergency_consent_version,
    emergency_consent_accepted_at
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
    'pending',
    p_allergies,
    p_medical_conditions,
    p_medications,
    p_activity_restrictions,
    p_physician_name,
    p_physician_phone,
    p_immunization_status,
    p_immunization_notes,
    p_emergency_contact_name,
    p_emergency_contact_phone,
    p_secondary_emergency_contact,
    p_health_form_version,
    now(),
    p_emergency_consent_version,
    now()
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id, 'status', 'pending');
END;
$$;
