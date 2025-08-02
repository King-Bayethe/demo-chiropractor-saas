import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { Check, ChevronsUpDown, Search, User, Calendar, Clock, MapPin, Stethoscope, FileText } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Appointment, CreateAppointmentData } from '@/hooks/useAppointments';

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contact_id: z.string().min(1, 'Contact is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']),
  type: z.enum(['consultation', 'treatment', 'follow_up', 'procedure']),
  notes: z.string().optional(),
  location: z.string().optional(),
  provider_id: z.string().optional(),
});

interface AppointmentFormProps {
  appointment?: Appointment;
  contacts: Array<{ id: string; name: string }>;
  providers: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateAppointmentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  contacts,
  providers,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [contactOpen, setContactOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const form = useForm<CreateAppointmentData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: appointment?.title || '',
      contact_id: appointment?.contact_id || '',
      start_time: appointment?.start_time ? format(parseISO(appointment.start_time), "yyyy-MM-dd'T'HH:mm") : '',
      end_time: appointment?.end_time ? format(parseISO(appointment.end_time), "yyyy-MM-dd'T'HH:mm") : '',
      status: appointment?.status || 'scheduled',
      type: appointment?.type || 'consultation',
      notes: appointment?.notes || '',
      location: appointment?.location || '',
      provider_id: appointment?.provider_id || '',
    },
  });

  const handleSubmit = async (data: CreateAppointmentData) => {
    try {
      // Convert datetime-local format to ISO string
      const submitData = {
        ...data,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        // Convert "none" back to empty string for provider_id
        provider_id: data.provider_id === 'none' ? '' : data.provider_id,
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting appointment:', error);
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" />
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Appointment Title
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter appointment title" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Select Contact <span className="text-destructive">*</span>
                </FormLabel>
                <Popover open={contactOpen} onOpenChange={setContactOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={contactOpen}
                        className={cn(
                          "h-11 justify-between bg-background",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? contacts.find((contact) => contact.id === field.value)?.name || "Contact not found"
                          : "Search by name, email or phone"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search contacts..." 
                        className="h-11"
                      />
                      <CommandList>
                        <CommandEmpty>No contact found.</CommandEmpty>
                        <CommandGroup>
                          {contacts.map((contact) => (
                            <CommandItem
                              key={contact.id}
                              value={contact.name}
                              onSelect={() => {
                                field.onChange(contact.id);
                                setContactOpen(false);
                              }}
                              className="flex items-center gap-2 p-3"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{contact.name}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  contact.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    End Time
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Status
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Stethoscope className="h-4 w-4" />
                    Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="provider_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <Stethoscope className="h-4 w-4" />
                  Provider (Optional)
                </FormLabel>
                <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={providerOpen}
                        className={cn(
                          "h-11 justify-between bg-background",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value && field.value !== 'none'
                          ? providers.find((provider) => provider.id === field.value)?.name || "Provider not found"
                          : "Select a provider"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search providers..." 
                        className="h-11"
                      />
                      <CommandList>
                        <CommandEmpty>No provider found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              field.onChange('none');
                              setProviderOpen(false);
                            }}
                            className="flex items-center gap-2 p-3"
                          >
                            <span className="text-muted-foreground">No provider assigned</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                (!field.value || field.value === 'none')
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                          {providers.map((provider) => (
                            <CommandItem
                              key={provider.id}
                              value={provider.name}
                              onSelect={() => {
                                field.onChange(provider.id);
                                setProviderOpen(false);
                              }}
                              className="flex items-center gap-2 p-3"
                            >
                              <Stethoscope className="h-4 w-4 text-muted-foreground" />
                              <span>{provider.name}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  provider.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Location (Optional)
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter appointment location" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Internal Notes (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add internal notes about the appointment"
                    rows={3}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? 'Saving...' : appointment ? 'Update Appointment' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};