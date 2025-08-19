-- Fix search_path security issue for the trigger function
CREATE OR REPLACE FUNCTION public.update_patient_primary_phone()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set the primary phone field based on available phone numbers
  -- Priority: cell_phone > home_phone > work_phone
  NEW.phone = COALESCE(NEW.cell_phone, NEW.home_phone, NEW.work_phone);
  
  RETURN NEW;
END;
$$;