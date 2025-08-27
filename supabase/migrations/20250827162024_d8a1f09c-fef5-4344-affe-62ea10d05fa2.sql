-- Clean up provider data - Phase 1: Remove orphaned data

-- Step 1: Clean up patient_providers table
-- Remove assignments to providers that don't exist in profiles table
DELETE FROM public.patient_providers 
WHERE provider_id NOT IN (
  SELECT user_id FROM public.profiles 
  WHERE user_id IN (
    'd3fd21bf-7993-433e-a3ed-2d1b77bbc772', -- Dr. Gabriel Mazzo
    'b445494c-b780-477c-8705-e8858c028d72', -- Dr. Erick Perez
    'a3478ded-d2cf-409a-a367-be7ceeb14cff'  -- Bayethe Rowell
  )
);

-- Step 2: Clean up appointments table
-- Update appointments with invalid provider_id to NULL (or assign to Dr. Mazzo as default)
UPDATE public.appointments 
SET provider_id = 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772', -- Default to Dr. Mazzo
    provider_name = 'Dr. Gabriel Mazzo'
WHERE provider_id IS NOT NULL 
  AND provider_id NOT IN (
    'd3fd21bf-7993-433e-a3ed-2d1b77bbc772', -- Dr. Gabriel Mazzo
    'b445494c-b780-477c-8705-e8858c028d72', -- Dr. Erick Perez
    'a3478ded-d2cf-409a-a367-be7ceeb14cff'  -- Bayethe Rowell
  );

-- Step 3: Clean up provider_availability table
-- Remove availability records for non-existent providers
DELETE FROM public.provider_availability 
WHERE provider_id NOT IN (
  'd3fd21bf-7993-433e-a3ed-2d1b77bbc772', -- Dr. Gabriel Mazzo
  'b445494c-b780-477c-8705-e8858c028d72', -- Dr. Erick Perez
  'a3478ded-d2cf-409a-a367-be7ceeb14cff'  -- Bayethe Rowell
);

-- Step 4: Clean up blocked_time_slots table
-- Remove blocked slots for non-existent providers
DELETE FROM public.blocked_time_slots 
WHERE provider_id IS NOT NULL 
  AND provider_id NOT IN (
    'd3fd21bf-7993-433e-a3ed-2d1b77bbc772', -- Dr. Gabriel Mazzo
    'b445494c-b780-477c-8705-e8858c028d72', -- Dr. Erick Perez
    'a3478ded-d2cf-409a-a367-be7ceeb14cff'  -- Bayethe Rowell
  );

-- Phase 2: Ensure correct provider setup
-- Update provider names in appointments to match the correct doctors
UPDATE public.appointments 
SET provider_name = CASE 
  WHEN provider_id = 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772' THEN 'Dr. Gabriel Mazzo'
  WHEN provider_id = 'b445494c-b780-477c-8705-e8858c028d72' THEN 'Dr. Erick Perez'
  WHEN provider_id = 'a3478ded-d2cf-409a-a367-be7ceeb14cff' THEN 'Bayethe Rowell'
  ELSE provider_name
END
WHERE provider_id IN (
  'd3fd21bf-7993-433e-a3ed-2d1b77bbc772',
  'b445494c-b780-477c-8705-e8858c028d72', 
  'a3478ded-d2cf-409a-a367-be7ceeb14cff'
);

-- Phase 3: Set up basic availability for both doctors (Monday-Friday, 9 AM - 5 PM)
-- Dr. Gabriel Mazzo availability
INSERT INTO public.provider_availability (
  provider_id, day_of_week, start_time, end_time, is_available, created_by
) VALUES 
  ('d3fd21bf-7993-433e-a3ed-2d1b77bbc772', 1, '09:00:00', '17:00:00', true, 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772'),
  ('d3fd21bf-7993-433e-a3ed-2d1b77bbc772', 2, '09:00:00', '17:00:00', true, 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772'),
  ('d3fd21bf-7993-433e-a3ed-2d1b77bbc772', 3, '09:00:00', '17:00:00', true, 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772'),
  ('d3fd21bf-7993-433e-a3ed-2d1b77bbc772', 4, '09:00:00', '17:00:00', true, 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772'),
  ('d3fd21bf-7993-433e-a3ed-2d1b77bbc772', 5, '09:00:00', '17:00:00', true, 'd3fd21bf-7993-433e-a3ed-2d1b77bbc772')
ON CONFLICT (provider_id, day_of_week) DO NOTHING;

-- Dr. Erick Perez availability  
INSERT INTO public.provider_availability (
  provider_id, day_of_week, start_time, end_time, is_available, created_by
) VALUES 
  ('b445494c-b780-477c-8705-e8858c028d72', 1, '09:00:00', '17:00:00', true, 'b445494c-b780-477c-8705-e8858c028d72'),
  ('b445494c-b780-477c-8705-e8858c028d72', 2, '09:00:00', '17:00:00', true, 'b445494c-b780-477c-8705-e8858c028d72'),
  ('b445494c-b780-477c-8705-e8858c028d72', 3, '09:00:00', '17:00:00', true, 'b445494c-b780-477c-8705-e8858c028d72'),
  ('b445494c-b780-477c-8705-e8858c028d72', 4, '09:00:00', '17:00:00', true, 'b445494c-b780-477c-8705-e8858c028d72'),
  ('b445494c-b780-477c-8705-e8858c028d72', 5, '09:00:00', '17:00:00', true, 'b445494c-b780-477c-8705-e8858c028d72')
ON CONFLICT (provider_id, day_of_week) DO NOTHING;