import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useNavigate } from "react-router-dom";
import { format, setHours, setMinutes } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  MessageSquare,
  User,
  Clock,
  Activity,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";


// NEW: Schema for the appointment booking form
const appointmentFormSchema = z.object({
    calendarId: z.string().min(1, "Please select a calendar."),
    title: z.string().min(1, "Appointment title is required."),
    startTime: z.date({ required_error: "Please select a date and time." }),
});
type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// NEW: Add the custom field ID for Total Visits
const CUSTOM_FIELD_IDS = {
    totalVisits: 'REPLACE_WITH_YOUR_TOTAL_VISITS_FIELD_ID'
};

// Helper to get custom field value
const getCustomFieldValueById = (customFields: any[], fieldId: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.value : undefined;
};


export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(20);
  
  // NEW: State for booking modal and calendars
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState(null);
  const [calendars, setCalendars] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'lead',
    patientType: 'general',
    notes: ''
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();
  const navigate = useNavigate();

  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, selectedType, selectedStatus]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Fetch patients and calendars in parallel
      const [patientsResponse, calendarsResponse] = await Promise.all([
        ghlApi.contacts.getAll(),
        ghlApi.calendars.getAll()
      ]);

      const patientContacts = (patientsResponse.contacts || []).filter((contact: any) => 
        contact.tags?.some((tag: string) => 
          tag.toLowerCase().includes('patient') || 
          tag.toLowerCase().includes('treatment')
        ) || !contact.tags?.length
      );
      setPatients(patientContacts);
      setCalendars(calendarsResponse.calendars || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load page data from GoHighLevel.",
        variant: "destructive",
      });
      setPatients([]);
      setCalendars([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter((patient: any) => {
        const name = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = (patient.phone || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((patient: any) => {
        const patientType = getPatientType(patient);
        return patientType.toLowerCase().includes(selectedType.toLowerCase());
      });
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "inactive") {
        filtered = [];
      }
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  };
  
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = useMemo(() => filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient), [filteredPatients, indexOfFirstPatient, indexOfLastPatient]);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handlePatientSelect = (patient: any) => navigate(`/patients/${patient.id}`);
  const handleMessagePatient = (patient: any) => toast({ title: "Message Feature", description: `Opening conversation with ${patient.firstName || patient.name}` });
  
  // MODIFIED: Opens the booking modal
  const handleBookAppointment = (patient: any) => {
    setSelectedPatientForBooking(patient);
    setIsBookingModalOpen(true);
  };
  
  const getPatientType = (patient: any) => {
    const tags = patient.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) return 'PIP Patient';
    if (tags.some((tag: string) => tag.toLowerCase().includes('general'))) return 'General Patient';
    return 'Patient';
  };

  // MODIFIED: Functions now use dynamic data from the patient object
  const getLastAppointment = (patient: any) => {
    const appointments = patient.appointments || [];
    if (appointments.length === 0) return "N/A";
    const sorted = [...appointments].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    return format(new Date(sorted[0].startTime), 'MMM d, yyyy');
  };

  const getTotalVisits = (patient: any) => {
    return getCustomFieldValueById(patient.customFields, CUSTOM_FIELD_IDS.totalVisits) || 0;
  };

  const handleAddPatient = () => setIsAddPatientOpen(true);
  const handleFormChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSubmitPatient = async (e: React.FormEvent) => { /* ... */ };
  
  // NEW: Handler to create appointment via edge function
  const handleCreateAppointment = async (data: AppointmentFormData) => {
      setIsSubmitting(true);
      try {
          const appointmentData = {
              calendarId: data.calendarId,
              contactId: selectedPatientForBooking.id,
              title: data.title,
              startTime: data.startTime.toISOString(),
              appointmentStatus: 'confirmed',
          };
          await ghlApi.appointments.create({ data: appointmentData });
          toast({ title: "Success", description: "Appointment booked successfully." });
          setIsBookingModalOpen(false);
          appointmentForm.reset();
          await loadInitialData(); // Refresh all data
      } catch (error) {
          console.error("Failed to create appointment:", error);
          toast({ title: "Error", description: "Failed to book appointment.", variant: "destructive" });
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            {/* ... Header content ... */}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto px-6 py-6">
            <Card className="border border-border/50 shadow-sm">
              <CardHeader><CardTitle>All Patients ({filteredPatients.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border/50 bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Patient</th>
                        <th className="text-left p-4 font-medium text-sm">Contact</th>
                        <th className="text-left p-4 font-medium text-sm">Type</th>
                        <th className="text-left p-4 font-medium text-sm">Last Appointment</th>
                        <th className="text-left p-4 font-medium text-sm">Total Visits</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {loading ? (
                        <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading patients...</td></tr>
                      ) : currentPatients.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No patients match your filters" : "No patients found"}</td></tr>
                      ) : (
                        currentPatients.map((patient: any) => (
                          <tr key={patient.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">{`${patient.firstName?.[0]?.toUpperCase() || ''}${patient.lastName?.[0]?.toUpperCase() || ''}` || 'P'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm cursor-pointer hover:text-medical-blue" onClick={() => handlePatientSelect(patient)}>
                                    {patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : patient.name || "Unknown Patient"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">GHL ID: {patient.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{/* ... Contact Info ... */}</td>
                            <td className="p-4">{/* ... Type Badge ... */}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{getLastAppointment(patient)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-success" />
                                <span className="font-medium text-sm">{getTotalVisits(patient)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleMessagePatient(patient)}><MessageSquare className="w-4 h-4 mr-1" />Message</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleBookAppointment(patient)}><Calendar className="w-4 h-4 mr-1" />Book</Button>
                                <Button variant="ghost" size="sm" onClick={() => handlePatientSelect(patient)}><User className="w-4 h-4 mr-1" />View</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-background border-t border-border/50">
            {/* ... Pagination Controls ... */}
          </div>

          {/* Add Patient Modal */}
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>{/* ... */}</Dialog>

          {/* NEW: Appointment Booking Modal */}
          <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a new appointment for {selectedPatientForBooking?.firstName} {selectedPatientForBooking?.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...appointmentForm}>
                    <form onSubmit={appointmentForm.handleSubmit(handleCreateAppointment)} className="space-y-4 py-4">
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Clock className="animate-spin h-4 w-4 mr-2" /> : null}
                                Book Appointment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}
