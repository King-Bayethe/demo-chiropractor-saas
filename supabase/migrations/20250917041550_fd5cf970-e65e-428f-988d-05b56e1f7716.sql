-- Delete the existing user first
DELETE FROM auth.users WHERE email = 'demo@testing.com';

-- Create the demo user using the simplified approach
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  'a682ae22-1235-4ed0-b2fb-aa86ec79343b',
  'demo@testing.com',
  crypt('DemoPortfolio2024!', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Dr. Sarah","last_name":"Martinez","role":"demo"}',
  now(),
  now()
);