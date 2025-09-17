-- Comprehensive database cleanup - Clear all user data while preserving system structure
-- Execute in order to handle foreign key dependencies

-- Priority 1: Clear dependent records first
DELETE FROM public.patient_messages;
DELETE FROM public.patient_conversations;
DELETE FROM public.patient_notes;
DELETE FROM public.patient_files;
DELETE FROM public.patient_providers;
DELETE FROM public.appointment_notes;
DELETE FROM public.appointment_reminders;
DELETE FROM public.appointment_notifications;

-- Priority 2: Clear main user data tables
DELETE FROM public.appointments;
DELETE FROM public.soap_notes;
DELETE FROM public.patients;
DELETE FROM public.opportunities;
DELETE FROM public.documents;

-- Priority 3: Clear form submission related data
DELETE FROM public.form_submission_audit;
DELETE FROM public.form_submissions;

-- Priority 4: Clear audit and tracking data
DELETE FROM public.audit_logs;
DELETE FROM public.notifications;
DELETE FROM public.notification_subscriptions;

-- Priority 5: Clear template and custom data
DELETE FROM public.custom_templates;

-- Priority 6: Clear communication data
DELETE FROM public.team_chat_participants;
DELETE FROM public.team_messages;
DELETE FROM public.team_chats;

-- Priority 7: Clear rate limiting data (will reset automatically)
DELETE FROM public.form_submission_rate_limits;