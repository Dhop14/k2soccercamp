-- Health history, immunization status, and emergency medical consent

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
  ADD COLUMN IF NOT EXISTS medications TEXT,
  ADD COLUMN IF NOT EXISTS activity_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS physician_name TEXT,
  ADD COLUMN IF NOT EXISTS physician_phone TEXT,
  ADD COLUMN IF NOT EXISTS immunization_status TEXT,
  ADD COLUMN IF NOT EXISTS immunization_notes TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS secondary_emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS health_form_version TEXT,
  ADD COLUMN IF NOT EXISTS health_form_accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS emergency_consent_version TEXT,
  ADD COLUMN IF NOT EXISTS emergency_consent_accepted_at TIMESTAMP WITH TIME ZONE;

UPDATE public.registrations
SET
  allergies = COALESCE(allergies, 'Legacy registration — follow up required'),
  immunization_status = COALESCE(immunization_status, 'up_to_date'),
  emergency_contact_name = COALESCE(
    emergency_contact_name,
    split_part(emergency_contact, ' — ', 1),
    emergency_contact,
    'Not provided'
  ),
  emergency_contact_phone = COALESCE(
    emergency_contact_phone,
    NULLIF(split_part(emergency_contact, ' — ', 2), ''),
    'Not provided'
  ),
  health_form_version = COALESCE(health_form_version, 'legacy'),
  health_form_accepted_at = COALESCE(health_form_accepted_at, created_at),
  emergency_consent_version = COALESCE(emergency_consent_version, 'legacy'),
  emergency_consent_accepted_at = COALESCE(emergency_consent_accepted_at, created_at)
WHERE allergies IS NULL OR immunization_status IS NULL;

ALTER TABLE public.registrations
  ALTER COLUMN allergies SET NOT NULL,
  ALTER COLUMN immunization_status SET NOT NULL,
  ALTER COLUMN emergency_contact_name SET NOT NULL,
  ALTER COLUMN emergency_contact_phone SET NOT NULL,
  ALTER COLUMN health_form_version SET NOT NULL,
  ALTER COLUMN health_form_accepted_at SET NOT NULL,
  ALTER COLUMN emergency_consent_version SET NOT NULL,
  ALTER COLUMN emergency_consent_accepted_at SET NOT NULL;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_immunization_status_check CHECK (
    immunization_status IN ('up_to_date', 'in_progress', 'medical_exemption', 'religious_exemption')
  );

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
  p_immunization_status TEXT,
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

  IF p_immunization_status NOT IN ('up_to_date', 'in_progress', 'medical_exemption', 'religious_exemption') THEN
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
