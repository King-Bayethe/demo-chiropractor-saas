-- Auto-assign all existing patients to the first available provider for demo purposes
-- This ensures existing patients are accessible after the security update

DO $$
DECLARE
    first_provider_id UUID;
    patient_record RECORD;
BEGIN
    -- Get the first active provider
    SELECT user_id INTO first_provider_id 
    FROM public.profiles 
    WHERE is_active = true 
    LIMIT 1;

    -- If we have a provider, assign all patients without assignments
    IF first_provider_id IS NOT NULL THEN
        FOR patient_record IN 
            SELECT id FROM public.patients 
            WHERE is_active = true 
            AND NOT EXISTS (
                SELECT 1 FROM public.patient_providers 
                WHERE patient_id = patients.id 
                AND is_active = true
            )
        LOOP
            INSERT INTO public.patient_providers (
                patient_id, 
                provider_id, 
                role, 
                assigned_by, 
                assigned_at
            ) VALUES (
                patient_record.id,
                first_provider_id,
                'primary_provider',
                first_provider_id,
                now()
            );
        END LOOP;
        
        RAISE NOTICE 'Assigned % patients to provider %', 
            (SELECT COUNT(*) FROM public.patients WHERE is_active = true), 
            first_provider_id;
    END IF;
END $$;