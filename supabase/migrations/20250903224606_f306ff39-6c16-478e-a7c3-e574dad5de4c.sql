-- Standardize pipeline stage values to match MEDICAL_PIPELINE_STAGES
UPDATE public.opportunities 
SET pipeline_stage = CASE 
  WHEN pipeline_stage = 'new lead' THEN 'lead'
  WHEN pipeline_stage = 'visitcomplete' THEN 'visit-complete'
  WHEN pipeline_stage = 'checkedin' THEN 'checked-in'
  ELSE pipeline_stage
END
WHERE pipeline_stage IN ('new lead', 'visitcomplete', 'checkedin');