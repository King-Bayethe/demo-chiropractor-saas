import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInYears, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Phone, Mail, Calendar as CalendarIcon, FileText, MessageSquare, DollarSign,
  User, Clock, MapPin, Plus, Download, Eye, Upload, Edit, Shield, AlertTriangle,
  BarChart3, Save, X, Check, Gavel, Car, HeartPulse, Briefcase, Lock, CheckSquare
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";


// Form schema for the main patient profile
const patientFormSchema = z.object({ /* ... */ });
type PatientFormData = z.infer<typeof patientFormSchema>;

// NEW: Form schema for booking an appointment
const appointmentFormSchema = z.object({
    calendarId: z.string().min(1, "Please select a calendar."),
    title: z.string().min(1, "Appointment title is required."),
    startTime: z.date({ required_error: "Please select a date and time." }),
    notes: z.string().optional(),
});
type AppointmentFormData = z.infer<typeof appointmentFormSchema>;


// Helper to find custom field value by its unique ID
const getCustomFieldValueById = (customFields: any[], fieldId: string): any => { /* ... */ };

// Using actual Custom Field IDs from your latest GHL screenshot
const CUSTOM_FIELD_IDS = { /* ... */ };

export default function PatientProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [soapNotes, setSoapNotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<any[]>([]); // State for calendars
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const ghlApi = useGHLApi();
  
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState(false);
  const [loadingSensitive, setLoadingSensitive] = useState(false);
  
  // NEW: State for the booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

  // NEW: Form hook for the appointment modal
  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);
  
  const loadPatientData = async () => {
    setLoading(true);
    setSensitiveDataVisible(false); 
    try {
      const response = await ghlApi.contacts.getById(patientId);
      const patientData = response.contact || response;
      if (!patientData) throw new Error("Patient data could not be found.");
      setPatient(patientData);
      
      const sortedAppointments = (response.appointments || []).sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setAppointments(sortedAppointments);

      const sortedTasks = (response.tasks || []).sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      setTasks(sortedTasks);

      // Fetch calendars for the booking form
      const calendarsResponse = await ghlApi.calendars.getAll();
      setCalendars(calendarsResponse.calendars || []);

      form.reset({ /* ... */ });
      setSoapNotes([/* ... */]);
      setInvoices([/* ... */]);
      setFiles([/* ... */]);
      setForms([/* ... */]);

    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({ title: "Error", description: "Failed to load patient information.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadSensitiveData = async () => { /* ... */ };
  const handleSave = async (data: PatientFormData) => { /* ... */ };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); loadPatientData(); };
  const getStatusColor = (status: string) => { /* ... */ };
  const formatCurrency = (amount: number) => { /* ... */ };

  // NEW: Handler to create an appointment
  const handleCreateAppointment = async (data: AppointmentFormData) => {
    setSaving(true);
    try {
        const appointmentData = {
            calendarId: data.calendarId,
            contactId: patientId,
            title: data.title,
            startTime: data.startTime.toISOString(),
            notes: data.notes,
            appointmentStatus: 'confirmed', // or 'new'
        };
        await ghlApi.appointments.create({ data: appointmentData });
        toast({ title: "Success", description: "Appointment booked successfully." });
        setIsBookingModalOpen(false);
        appointmentForm.reset();
        await loadPatientData(); // Refresh data
    } catch (error) {
        console.error("Failed to create appointment:", error);
        toast({ title: "Error", description: "Failed to book appointment.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  const patientName = useMemo(() => `${form.getValues("firstName")} ${form.getValues("lastName")}`, [form.watch("firstName"), form.watch("lastName")]);
  const patientAge = useMemo(() => { /* ... */ }, [form.watch("dateOfBirth")]);

  const InfoField = ({ label, value }: { label: string, value: any }) => (
    <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="font-semibold">{value || <span className="text-gray-400 font-normal">N/A</span>}</p>
    </div>
  );

  if (loading) { return <div className="flex justify-center items-center h-full"><Clock className="animate-spin h-8 w-8" /></div>; }
  if (!patient) { return <div className="text-center p-8">Patient not found.</div>; }

  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
          {/* ... Header and Banner ... */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* ... Demographics and other info cards ... */}
            </div>
            <div className="lg:col-span-2">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
                  <TabsTrigger value="forms">Forms</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="appointments">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Appointment History</CardTitle>
                        {/* MODIFIED: Button now opens the modal */}
                        <Button onClick={() => setIsBookingModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Book Appointment</Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {appointments.length > 0 ? appointments.map(apt => (
                            <div key={apt.id} className="flex justify-between items-center p-2 border-b">
                                <div>
                                    <p className="font-semibold">{apt.title || 'Appointment'}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(apt.startTime), 'PPP p')}</p>
                                </div>
                                <Badge variant="secondary" className={getStatusColor(apt.status)}>{apt.status}</Badge>
                            </div>
                        )) : <p className="text-center text-muted-foreground p-4">No appointments found.</p>}
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* ... Other Tabs ... */}
              </Tabs>
            </div>
          </div>
        </div>

        {/* NEW: Appointment Booking Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a new appointment for {patientName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...appointmentForm}>
                    <form onSubmit={appointmentForm.handleSubmit(handleCreateAppointment)} className="space-y-4">
                        <FormField control={appointmentForm.control} name="calendarId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Calendar</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a calendar" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {calendars.map(cal => <SelectItem key={cal.id} value={cal.id}>{cal.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={appointmentForm.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title / Service</FormLabel>
                                <FormControl><Input placeholder="e.g., Chiropractic Adjustment" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={appointmentForm.control} name="startTime" render={({ field }) => (
                             <FormItem className="flex flex-col">
                                <FormLabel>Date & Time</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        <div className="p-3 border-t border-border">
                                            <div className="flex items-center gap-2">
                                                <Label>Time:</Label>
                                                <Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : ""} onChange={e => {
                                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                                    const newDate = setMinutes(setHours(field.value || new Date(), hours), minutes);
                                                    field.onChange(newDate);
                                                }} />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={appointmentForm.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl><Textarea placeholder="Add any notes for the appointment..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <Clock className="animate-spin h-4 w-4 mr-2" /> : null}
                                Book Appointment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </Layout>
    </AuthGuard>
  );
}
