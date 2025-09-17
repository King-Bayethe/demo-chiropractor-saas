-- Create some demo patients for the conversations
INSERT INTO public.patients (
  id,
  first_name,
  last_name,
  email,
  phone,
  cell_phone,
  case_type,
  is_active,
  tags
) VALUES 
  (
    gen_random_uuid(),
    'Sarah',
    'Johnson',
    'sarah.johnson@email.com',
    '(555) 123-4567',
    '(555) 123-4567',
    'PIP',
    true,
    ARRAY['demo-patient', 'active-case']
  ),
  (
    gen_random_uuid(),
    'Michael',
    'Rodriguez',
    'michael.rodriguez@email.com',
    '(555) 234-5678',
    '(555) 234-5678',
    'Insurance',
    true,
    ARRAY['demo-patient', 'insurance-claim']
  ),
  (
    gen_random_uuid(),
    'Emily',
    'Chen',
    'emily.chen@email.com',
    '(555) 345-6789',
    '(555) 345-6789',
    'Cash Plan',
    true,
    ARRAY['demo-patient', 'cash-plan']
  )
ON CONFLICT DO NOTHING;