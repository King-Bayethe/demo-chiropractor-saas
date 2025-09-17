-- Update the demo user to be confirmed and set up properly
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  confirmed_at = now(),
  updated_at = now()
WHERE email = 'demo@testing.com';

-- Insert or update the demo user profile
INSERT INTO public.profiles (
  id,
  user_id, 
  email, 
  first_name, 
  last_name, 
  avatar_url,
  role, 
  is_active, 
  phone,
  language_preference, 
  dark_mode,
  email_signature
) VALUES (
  'demo-profile-id',
  'a682ae22-1235-4ed0-b2fb-aa86ec79343b',
  'demo@testing.com',
  'Dr. Sarah', 
  'Martinez',
  '/lovable-uploads/d20b903a-e010-419b-ae88-29c72575f3ee.png',
  'demo',
  true,
  '+1 (555) 123-4567',
  'en',
  false,
  'Dr. Sarah Martinez, MD
Chiropractor & Pain Management Specialist
Healthcare Demo Clinic
Phone: (555) 123-4567 | Email: demo@testing.com'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  email_signature = EXCLUDED.email_signature,
  updated_at = now();