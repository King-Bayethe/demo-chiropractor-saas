import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { Check, ChevronsUpDown, Search, User, Calendar as CalendarIcon, Clock, MapPin, Stethoscope, FileText } from 'lucide-react';
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
import { Calendar as CalendarType } from '@/hooks/useCalendars';
import { Calendar } from '@/components/ui/calendar';

const appointmentSchema = z.object({
  title: z.string().optional(),
  contact_id: z.string().optional(),
  start_date: z.date().optional(),
  start_time: z.string().optional(),
  end_date: z.date().optional(),
  end_time: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']),
  type: z.enum(['consultation', 'treatment', 'follow_up', 'procedure']),
  notes: z.string().optional(),
  location: z.string().optional(),
  provider_id: z.string().optional(),
  calendarId: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  contacts: Array<{ id: string; name: string }>;
  providers: Array<{ id: string; name: string }>;
  calendars: CalendarType[];
  onSubmit: (data: CreateAppointmentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  contacts,
  providers,
  calendars,
  onSubmit,
  onCancel,
  loading = false,
 }) => {
  const [contactOpen, setContactOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: appointment?.title || '',
      contact_id: appointment?.contact_id || '',
      start_date: appointment?.start_time ? new Date(appointment.start_time) : new Date(),
      start_time: appointment?.start_time ? format(parseISO(appointment.start_time), 'HH:mm') : '09:00',
      end_date: appointment?.end_time ? new Date(appointment.end_time) : new Date(),
      end_time: appointment?.end_time ? format(parseISO(appointment.end_time), 'HH:mm') : '10:00',
      status: appointment?.status || 'scheduled',
      type: appointment?.type || 'consultation',
      notes: appointment?.notes || '',
      location: appointment?.location || '',
      provider_id: appointment?.provider_id || '',
      calendarId: calendars.length > 0 ? calendars[0].id : '',
    },
  });

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      // Combine date and time for start and end times
      const startDateTime = new Date(data.start_date!);
      const [startHour, startMin] = data.start_time!.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMin));

      const endDateTime = new Date(data.end_date!);
      const [endHour, endMin] = data.end_time!.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMin));

      const submitData: CreateAppointmentData = {
        title: data.title,
        contact_id: data.contact_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: data.status,
        type: data.type,
        notes: data.notes,
        location: data.location,
        provider_id: data.provider_id === 'none' ? '' : data.provider_id,
        calendarId: data.calendarId,
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting appointment:', error);
    }
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader className="pb-3">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-4 w-4 text-primary" />
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
                  Select Contact
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
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    Start Date
                  </FormLabel>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setStartDateOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input type="time" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    End Date
                  </FormLabel>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
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
                    <Input type="time" className="h-11" {...field} />
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
                  <CalendarIcon className="h-4 w-4" />
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
                  Notes (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add appointment notes..." 
                    className="min-h-[80px] resize-none"
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