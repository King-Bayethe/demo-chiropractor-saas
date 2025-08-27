-- Create provider availability table for managing working hours
CREATE TABLE public.provider_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  break_start_time TIME,
  break_end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(provider_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view provider availability" 
ON public.provider_availability 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own availability" 
ON public.provider_availability 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own availability" 
ON public.provider_availability 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own availability" 
ON public.provider_availability 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create time slots table for blocking specific times
CREATE TABLE public.blocked_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID,
  title TEXT NOT NULL,
  provider_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- JSON string for recurrence rules
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (already exists, just adding policies)
CREATE POLICY "Authenticated users can create blocked slots" 
ON public.blocked_time_slots 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view blocked slots" 
ON public.blocked_time_slots 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update blocked slots they created" 
ON public.blocked_time_slots 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete blocked slots they created" 
ON public.blocked_time_slots 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create appointment reminders table
CREATE TABLE public.appointment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push')),
  minutes_before INTEGER NOT NULL DEFAULT 60, -- Send reminder X minutes before appointment
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can create reminders" 
ON public.appointment_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view reminders for appointments they can see" 
ON public.appointment_reminders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update reminders they created" 
ON public.appointment_reminders 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete reminders they created" 
ON public.appointment_reminders 
FOR DELETE 
USING (auth.uid() = created_by);

-- Update appointments table to remove GHL dependency and add more fields
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS recurring_appointment_id UUID,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'confirmed', 'declined')),
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS patient_notes TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_day ON public.provider_availability(provider_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_provider_time ON public.blocked_time_slots(provider_id, start_time, end_time);

-- Create trigger for updated_at
CREATE TRIGGER update_provider_availability_updated_at
BEFORE UPDATE ON public.provider_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();