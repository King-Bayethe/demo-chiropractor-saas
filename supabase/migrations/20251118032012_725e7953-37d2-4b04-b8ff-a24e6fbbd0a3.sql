-- Create payment_orders table
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'custom')),
  custom_frequency_days INTEGER,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  total_payments INTEGER,
  payments_made INTEGER NOT NULL DEFAULT 0,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled', 'failed')),
  payment_method TEXT NOT NULL,
  auto_process BOOLEAN NOT NULL DEFAULT true,
  payment_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'adjustment', 'fee')),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'check', 'ach', 'insurance')),
  payment_details JSONB,
  invoice_id UUID,
  date DATE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'voided')),
  processed_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  date_issued TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_name TEXT NOT NULL,
  assignee_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  subtasks JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_patient_id ON public.payment_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_next_payment_date ON public.payment_orders(next_payment_date);

CREATE INDEX IF NOT EXISTS idx_transactions_patient_id ON public.transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

CREATE INDEX IF NOT EXISTS idx_estimates_patient_id ON public.estimates(patient_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON public.estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_date_created ON public.estimates(date_created DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_date_issued ON public.invoices(date_issued DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Enable Row Level Security
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_orders
CREATE POLICY "Healthcare staff can view all payment orders"
  ON public.payment_orders FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Healthcare staff can create payment orders"
  ON public.payment_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
    AND auth.uid() = created_by
  );

CREATE POLICY "Healthcare staff can update payment orders"
  ON public.payment_orders FOR UPDATE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Admins and creators can delete payment orders"
  ON public.payment_orders FOR DELETE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord') 
    OR auth.uid() = created_by
  );

-- RLS Policies for transactions
CREATE POLICY "Healthcare staff can view all transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Healthcare staff can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Admins can update transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'staff')
  );

CREATE POLICY "Only admins can delete transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord')
  );

-- RLS Policies for estimates
CREATE POLICY "Healthcare staff can view all estimates"
  ON public.estimates FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Healthcare staff can create estimates"
  ON public.estimates FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
    AND auth.uid() = created_by
  );

CREATE POLICY "Healthcare staff can update estimates"
  ON public.estimates FOR UPDATE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Admins and creators can delete estimates"
  ON public.estimates FOR DELETE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord')
    OR auth.uid() = created_by
  );

-- RLS Policies for invoices
CREATE POLICY "Healthcare staff can view all invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Healthcare staff can create invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
    AND auth.uid() = created_by
  );

CREATE POLICY "Healthcare staff can update invoices"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider')
  );

CREATE POLICY "Admins can delete invoices"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (
    get_current_user_role() IN ('admin', 'overlord')
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks assigned to them or created by them"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = assignee_id 
    OR auth.uid() = created_by
    OR get_current_user_role() IN ('admin', 'overlord')
  );

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Task assignees and admins can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = assignee_id 
    OR auth.uid() = created_by
    OR get_current_user_role() IN ('admin', 'overlord')
  );

CREATE POLICY "Task creators and admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR get_current_user_role() IN ('admin', 'overlord')
  );

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_payment_orders_updated_at 
  BEFORE UPDATE ON public.payment_orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON public.transactions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at 
  BEFORE UPDATE ON public.estimates 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON public.invoices 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();