-- First, clean up audit logs for duplicate form submissions
WITH duplicate_submissions AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY patient_name, patient_email, form_type ORDER BY created_at DESC) as rn
  FROM form_submissions 
  WHERE patient_name = 'Maria Rodriguez'
)
DELETE FROM form_submission_audit 
WHERE form_submission_id IN (
  SELECT id FROM duplicate_submissions WHERE rn > 1
);

-- Then delete the duplicate form submissions
WITH duplicate_submissions AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY patient_name, patient_email, form_type ORDER BY created_at DESC) as rn
  FROM form_submissions 
  WHERE patient_name = 'Maria Rodriguez'
)
DELETE FROM form_submissions 
WHERE id IN (
  SELECT id FROM duplicate_submissions WHERE rn > 1
);