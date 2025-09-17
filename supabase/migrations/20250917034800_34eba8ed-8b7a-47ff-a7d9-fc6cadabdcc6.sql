-- Create demo user with confirmed email status
-- Insert demo user directly into auth.users table with confirmed email
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'demo@healthcare-portfolio.com',
  crypt('DemoPortfolio2024!', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Demo", "last_name": "User", "role": "demo"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO UPDATE SET
  email_confirmed_at = now(),
  raw_user_meta_data = '{"first_name": "Demo", "last_name": "User", "role": "demo"}',
  updated_at = now();

-- Ensure demo user has a profile
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'Demo',
  'User',
  'demo',
  true,
  now(),
  now()
FROM auth.users u
WHERE u.email = 'demo@healthcare-portfolio.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'demo',
  first_name = 'Demo',
  last_name = 'User',
  is_active = true,
  updated_at = now();