import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PatientSelector } from '@/components/PatientSelector';
import { useState } from 'react';
import { Patient } from '@/hooks/usePatients';
import { MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';

const formSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  case_type: z.string().optional(),
  estimated_value: z.number().optional(),
  insurance_coverage_amount: z.number().optional(),
  pipeline_stage: z.string(),
  expected_close_date: z.string().optional(),
  source: z.string().optional(),
  referral_source: z.string().optional(),
  assigned_provider_name: z.string().optional(),
  notes: z.string().optional(),
});

const CASE_TYPES = [
  'Private Insurance',
  'Medicare',
  'Medicaid',
  'Self-Pay',
  'Payment Plan',
  'Workers Compensation',
  'Auto Insurance'
];

const SOURCES = [
  'Online Form',
  'Phone Call',
  'Walk-in',
  'Physician Referral',
  'Patient Referral',
  'Insurance Company',
  'Online Marketing',
  'Google Ads',
  'Social Media',
  'Website',
  'Community Outreach',
  'Healthcare Network'
];

interface AddMedicalOpportunityFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export function AddMedicalOpportunityForm({ onSubmit, onCancel }: AddMedicalOpportunityFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      case_type: '',
      estimated_value: undefined,
      insurance_coverage_amount: undefined,
      pipeline_stage: 'lead',
      expected_close_date: '',
      source: '',
      referral_source: '',
      assigned_provider_name: '',
      notes: '',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert empty date strings to null to avoid database errors
    const processedValues = {
      ...values,
      expected_close_date: values.expected_close_date && values.expected_close_date.trim() !== '' 
        ? values.expected_close_date 
        : null,
      // Convert empty strings to null for other optional fields
      name: values.name && values.name.trim() !== '' ? values.name : null,
      description: values.description && values.description.trim() !== '' ? values.description : null,
      case_type: values.case_type && values.case_type.trim() !== '' ? values.case_type : null,
      source: values.source && values.source.trim() !== '' ? values.source : null,
      referral_source: values.referral_source && values.referral_source.trim() !== '' ? values.referral_source : null,
      assigned_provider_name: values.assigned_provider_name && values.assigned_provider_name.trim() !== '' ? values.assigned_provider_name : null,
      notes: values.notes && values.notes.trim() !== '' ? values.notes : null,
    };

    const submissionData = {
      ...processedValues,
      patient_id: selectedPatient?.id,
      patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}`.trim() : undefined,
      patient_email: selectedPatient?.email,
      patient_phone: selectedPatient?.phone,
    };
    
    onSubmit(submissionData);
    form.reset();
    setSelectedPatient(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter opportunity name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="case_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {CASE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Patient</FormLabel>
          <PatientSelector
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
            className="mt-1"
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter opportunity description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimated_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Value ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="insurance_coverage_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Coverage ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pipeline_stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pipeline Stage</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {MEDICAL_PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expected_close_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Close Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_provider_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Provider</FormLabel>
                <FormControl>
                  <Input placeholder="Enter provider name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes or comments" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            Add Opportunity
          </Button>
        </div>
      </form>
    </Form>
  );
}