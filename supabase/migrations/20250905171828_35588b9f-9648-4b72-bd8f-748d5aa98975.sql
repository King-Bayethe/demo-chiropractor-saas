-- Clean up duplicate Maria Rodriguez submissions, keeping only the most recent one
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