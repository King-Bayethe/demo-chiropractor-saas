-- Migration 2: Add Foreign Key Constraints Part 1
-- This migration adds foreign key constraints for appointments, patient communications,
-- and patient data tables to ensure referential integrity

-- ==========================================
-- APPOINTMENTS & RELATED TABLES
-- ==========================================

-- appointment_notes -> appointments
ALTER TABLE public.appointment_notes
ADD CONSTRAINT fk_appointment_notes_appointment
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;

-- appointment_reminders -> appointments
ALTER TABLE public.appointment_reminders
ADD CONSTRAINT fk_appointment_reminders_appointment
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;

-- appointment_reminders -> profiles (created_by)
ALTER TABLE public.appointment_reminders
ADD CONSTRAINT fk_appointment_reminders_creator
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- appointment_notifications -> appointments
ALTER TABLE public.appointment_notifications
ADD CONSTRAINT fk_appointment_notifications_appointment
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;

-- appointment_notifications -> profiles (user_id)
ALTER TABLE public.appointment_notifications
ADD CONSTRAINT fk_appointment_notifications_user
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- appointments -> patients
ALTER TABLE public.appointments
ADD CONSTRAINT fk_appointments_patient
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;

-- appointments -> profiles (provider_id)
ALTER TABLE public.appointments
ADD CONSTRAINT fk_appointments_provider
FOREIGN KEY (provider_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- ==========================================
-- PATIENT COMMUNICATIONS
-- ==========================================

-- patient_conversations -> patients
ALTER TABLE public.patient_conversations
ADD CONSTRAINT fk_patient_conversations_patient
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- patient_conversations -> profiles (created_by)
ALTER TABLE public.patient_conversations
ADD CONSTRAINT fk_patient_conversations_creator
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- patient_messages -> patient_conversations
ALTER TABLE public.patient_messages
ADD CONSTRAINT fk_patient_messages_conversation
FOREIGN KEY (conversation_id) REFERENCES public.patient_conversations(id) ON DELETE CASCADE;

-- patient_messages: Add check constraint for sender_id based on sender_type
ALTER TABLE public.patient_messages
ADD CONSTRAINT chk_patient_messages_sender
CHECK (
  (sender_type = 'patient' AND sender_id IS NOT NULL) OR
  (sender_type = 'provider' AND sender_id IS NOT NULL) OR
  (sender_type = 'system')
);

-- ==========================================
-- PATIENT DATA TABLES
-- ==========================================

-- patient_notes -> patients
ALTER TABLE public.patient_notes
ADD CONSTRAINT fk_patient_notes_patient
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- patient_notes -> profiles (created_by)
ALTER TABLE public.patient_notes
ADD CONSTRAINT fk_patient_notes_creator
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- patient_files -> patients
ALTER TABLE public.patient_files
ADD CONSTRAINT fk_patient_files_patient
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- patient_files -> profiles (uploaded_by)
ALTER TABLE public.patient_files
ADD CONSTRAINT fk_patient_files_uploader
FOREIGN KEY (uploaded_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- patient_providers -> patients
ALTER TABLE public.patient_providers
ADD CONSTRAINT fk_patient_providers_patient
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- patient_providers -> profiles (provider_id)
ALTER TABLE public.patient_providers
ADD CONSTRAINT fk_patient_providers_provider
FOREIGN KEY (provider_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- patient_providers -> profiles (assigned_by)
ALTER TABLE public.patient_providers
ADD CONSTRAINT fk_patient_providers_assigner
FOREIGN KEY (assigned_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- ==========================================
-- BLOCKED TIME SLOTS
-- ==========================================

-- blocked_time_slots -> profiles (provider_id)
ALTER TABLE public.blocked_time_slots
ADD CONSTRAINT fk_blocked_slots_provider
FOREIGN KEY (provider_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- blocked_time_slots -> profiles (created_by)
ALTER TABLE public.blocked_time_slots
ADD CONSTRAINT fk_blocked_slots_creator
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;