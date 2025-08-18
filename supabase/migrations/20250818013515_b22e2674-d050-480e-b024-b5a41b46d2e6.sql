-- Fix remaining function search path security warnings
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_chats
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_soap_notes_with_patient_info(limit_count integer DEFAULT 50, offset_count integer DEFAULT 0)
RETURNS TABLE(id uuid, patient_id uuid, patient_name text, provider_id uuid, provider_name text, appointment_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, date_of_service timestamp with time zone, chief_complaint text, is_draft boolean, subjective_data jsonb, objective_data jsonb, assessment_data jsonb, plan_data jsonb, vital_signs jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sn.id,
    sn.patient_id,
    COALESCE(
      NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''),
      p.email,
      'Unknown Patient'
    ) as patient_name,
    sn.provider_id,
    sn.provider_name,
    sn.appointment_id,
    sn.created_at,
    sn.updated_at,
    sn.date_of_service,
    sn.chief_complaint,
    sn.is_draft,
    sn.subjective_data,
    sn.objective_data,
    sn.assessment_data,
    sn.plan_data,
    sn.vital_signs
  FROM public.soap_notes sn
  LEFT JOIN public.patients p ON sn.patient_id = p.id
  WHERE auth.uid() IS NOT NULL
  ORDER BY sn.date_of_service DESC, sn.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This query finds the best available name for the new participant and assigns it.
  -- It prefers First + Last Name, then falls back to Email, then to 'Unknown User'.
  SELECT
    COALESCE(
      NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''),
      p.email,
      'Unknown User'
    )
  INTO NEW.name
  FROM public.profiles p
  WHERE p.user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_profile_name_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This query finds all instances of a user in the participants table and updates their name.
  UPDATE public.team_chat_participants
  SET name = COALESCE(
               NULLIF(TRIM(NEW.first_name || ' ' || NEW.last_name), ''),
               NEW.email,
               'Unknown User'
             )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_chat_admin(chat_id_to_check uuid, user_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_chat_participants
    WHERE chat_id = chat_id_to_check
      AND user_id = user_id_to_check
      AND is_admin = true
  );
END;
$$;