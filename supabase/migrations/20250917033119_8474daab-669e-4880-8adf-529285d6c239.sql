-- Comprehensive database cleanup - Clear all user data while preserving system structure
-- Handle circular dependencies between opportunities and form_submissions

-- Priority 1: Clear dependent records first
DELETE FROM public.patient_messages;
DELETE FROM public.patient_conversations;
DELETE FROM public.patient_notes;
DELETE FROM public.patient_files;
DELETE FROM public.patient_providers;
DELETE FROM public.appointment_notes;
DELETE FROM public.appointment_reminders;
DELETE FROM public.appointment_notifications;

-- Priority 2: Clear opportunities first (they reference form_submissions)
DELETE FROM public.opportunities;

-- Priority 3: Clear form submissions (now safe to delete)
DELETE FROM public.form_submission_audit;
DELETE FROM public.form_submissions;

-- Priority 4: Clear remaining main user data tables
DELETE FROM public.appointments;
DELETE FROM public.soap_notes;
DELETE FROM public.patients;
DELETE FROM public.documents;

-- Priority 5: Clear audit and tracking data
DELETE FROM public.audit_logs;
DELETE FROM public.notifications;
DELETE FROM public.notification_subscriptions;

-- Priority 6: Clear template and custom data
DELETE FROM public.custom_templates;

-- Priority 7: Clear communication data
DELETE FROM public.team_chat_participants;
DELETE FROM public.team_messages;
DELETE FROM public.team_chats;

-- Priority 8: Clear rate limiting data
DELETE FROM public.form_submission_rate_limits;