-- Camp settings singleton
CREATE TABLE public.camp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  max_spots INTEGER NOT NULL DEFAULT 40 CHECK (max_spots > 0),
  registrations_open BOOLEAN NOT NULL DEFAULT true,
  waitlist_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.camp_settings (max_spots, registrations_open, waitlist_enabled)
VALUES (40, true, true);

ALTER TABLE public.camp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read camp settings"
  ON public.camp_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Extend registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS player_grade SMALLINT,
  ADD COLUMN IF NOT EXISTS grade_basis TEXT,
  ADD COLUMN IF NOT EXISTS eligibility_ack BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS waiver_version TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS photo_release BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sibling_note TEXT;

UPDATE public.registrations
SET
  player_grade = COALESCE(player_grade, 5),
  grade_basis = COALESCE(grade_basis, 'current'),
  status = COALESCE(status, 'pending')
WHERE player_grade IS NULL OR grade_basis IS NULL;

ALTER TABLE public.registrations
  ALTER COLUMN player_grade SET NOT NULL,
  ALTER COLUMN grade_basis SET NOT NULL;

UPDATE public.registrations
SET player_age = GREATEST(8, LEAST(15, player_age))
WHERE player_age < 8 OR player_age > 15;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_player_grade_check CHECK (player_grade BETWEEN 3 AND 8),
  ADD CONSTRAINT registrations_grade_basis_check CHECK (grade_basis IN ('current', 'rising_fall_2026')),
  ADD CONSTRAINT registrations_status_check CHECK (status IN ('pending', 'waitlisted')),
  ADD CONSTRAINT registrations_player_age_check CHECK (player_age BETWEEN 8 AND 15);

ALTER TABLE public.registrations
  ALTER COLUMN emergency_contact SET NOT NULL;

-- Tighten emergency_contact for any nulls from legacy rows
UPDATE public.registrations
SET emergency_contact = 'Not provided (legacy)'
WHERE emergency_contact IS NULL;

-- Atomic submit with capacity
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
  v_settings public.camp_settings%ROWTYPE;
  v_count INTEGER;
  v_status TEXT;
  v_id UUID;
BEGIN
  IF NOT p_eligibility_ack THEN
    RAISE EXCEPTION 'eligibility_required';
  END IF;

  SELECT * INTO v_settings FROM public.camp_settings ORDER BY updated_at DESC LIMIT 1;
  IF NOT FOUND OR NOT v_settings.registrations_open THEN
    RAISE EXCEPTION 'registration_closed';
  END IF;

  SELECT count(*)::INTEGER INTO v_count
  FROM public.registrations
  WHERE status = 'pending';

  IF v_count >= v_settings.max_spots THEN
    IF v_settings.waitlist_enabled THEN
      v_status := 'waitlisted';
    ELSE
      RAISE EXCEPTION 'camp_full';
    END IF;
  ELSE
    v_status := 'pending';
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
    v_status
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id, 'status', v_status);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_registration FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_registration TO service_role;

-- Stop direct client inserts
REVOKE INSERT ON public.registrations FROM anon;
REVOKE INSERT ON public.registrations FROM authenticated;

DROP POLICY IF EXISTS "Anyone can submit a registration" ON public.registrations;
