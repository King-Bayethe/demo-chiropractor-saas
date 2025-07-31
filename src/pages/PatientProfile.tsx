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
const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.date().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  didGoToHospital: z.string().optional(),
  hospitalName: z.string().optional(),
  dateOfAccident: z.date().optional(),
  claimNumber: z.string().optional(),
  policyNumber: z.string().optional(),
  autoInsuranceCompany: z.string().optional(),
  healthInsurance: z.string().optional(),
  healthInsuranceId: z.string().optional(),
  attorneyName: z.string().optional(),
  attorneyPhone: z.string().optional(),
  adjustersName: z.string().optional(),
  insurancePhoneNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  medicaidMedicareId: z.string().optional(),
  maritalStatus: z.string().optional(),
  licenseState: z.string().optional(),
});
type PatientFormData = z.infer<typeof patientFormSchema>;

// Form schema for booking an appointment
const appointmentFormSchema = z.object({
    calendarId: z.string().min(1, "Please select a calendar."),
    title: z.string().min(1, "Appointment title is required."),
    startTime: z.date({ required_error: "Please select a date and time." }),
    notes: z.string().optional(),
});
type AppointmentFormData = z.infer<typeof appointmentFormSchema>;


// Helper to find custom field value by its unique ID
const getCustomFieldValueById = (customFields: any[], fieldId: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.value : undefined;
};

// Using actual Custom Field IDs from your latest GHL screenshot
const CUSTOM_FIELD_IDS = {
  emergencyContactName: 'l7yGH2qMIQ16VhyaxLMM',
  licenseState: '5GIdwGCEYt75pVaFQK99',
  passengersInVehicle: 'pRFYSE2e2bo45V7wvAZw',
  autoInsuranceCompany: 'hzC43VG8BgpXdhZn6e7A',
  claimNumber: 'yh0BLG1EUyPxPJRZJBHC',
  policyNumber: 'gNjgQtJpI71rgDR28BUV',
  adjustersName: '7tZahjAuelIjP9lUG4Er',
  insurancePhoneNumber: 'e5gX4XyLb3hBlbKy186Y',
  attorneyPhone: '4rSH8n1ANAYLFU9Cby9W',
  attorneyName: 'Kdh3NRFD0DIfhoE86TzT',
  healthInsurance: '1zrW9idqNMbLWrZvcPee',
  groupNumber: '"3CFGGeMzAwkv49z096aB',
  healthInsuranceId: 'tCxf5IqN97TJev00wzkO',
  medicaidMedicareId: 'Y7PjcJSaTjDsmwxHLtpe',
  maritalStatus: 'YX017UhulJCX03IMTWYg',
  // NOTE: These IDs are not visible in the log, please find them in your GHL settings
  dateOfAccident: 'REPLACE_WITH_REAL_ID_FROM_GHL',
  didGoToHospital: 'REPLACE_WITH_REAL_ID_FROM_GHL',
  hospitalName: 'REPLACE_WITH_REAL_ID_FROM_GHL',
};

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
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const ghlApi = useGHLApi();
  
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState(false);
  const [loadingSensitive, setLoadingSensitive] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

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

      const calendarsResponse = await ghlApi.calendars.getAll();
      setCalendars(calendarsResponse.calendars || []);

      form.reset({
        firstName: patientData.firstName || "",
        lastName: patientData.lastName || "",
        email: patientData.email || "",
        phone: patientData.phone || "",
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined,
        streetAddress: patientData.address1 || "",
        city: patientData.city || "",
        state: patientData.state || "",
        zipCode: patientData.postalCode || "",
      });

      setSoapNotes([
         { id: "soap-1", date: new Date("2025-05-22"), provider: "Dr. Silverman", chiefComplaint: "Neck and back pain post-MVA", appointmentId: "apt-1" },
         { id: "soap-2", date: new Date("2025-06-15"), provider: "Dr. Silverman", chiefComplaint: "Follow-up on cervical spine", appointmentId: "apt-2" }
      ]);
      setInvoices([
        { id: "INV-PIP-001", date: new Date("2025-05-22"), amount: 350.00, description: "Initial PIP Exam & X-Rays", status: "pending" },
        { id: "INV-PIP-002", date: new Date("2025-06-15"), amount: 150.00, description: "Chiropractic Adjustment", status: "pending" },
      ]);
      setFiles([
        { id: "file-1", name: "Police_Report_MVA.pdf", type: "Legal", uploadDate: new Date("2025-05-21"), uploadedBy: "Front Desk" },
        { id: "file-2", name: "Patient_Intake_Form.pdf", type: "Admin", uploadDate: new Date("2025-05-22"), uploadedBy: "Patient" },
        { id: "file-3", name: "Cervical_XRay_Report.pdf", type: "Imaging", uploadDate: new Date("2025-05-23"), uploadedBy: "Dr. Silverman" }
      ]);
      setForms([
        { id: "form-1", name: "PIP Intake Form", status: "completed", submissionDate: new Date("2025-05-22") },
        { id: "form-2", name: "Medical History Questionnaire", status: "completed", submissionDate: new Date("2025-05-22") },
        { id: "form-3", name: "HIPAA Acknowledgment", status: "completed", submissionDate: new Date("2025-05-22") },
      ]);

    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({ title: "Error", description: "Failed to load patient information.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadSensitiveData = async () => {
    setLoadingSensitive(true);
    try {
        const response = await ghlApi.contacts.getById(patientId);
        const patientData = response.contact || response;
        if (!patientData) throw new Error("Patient data could not be found.");
        
        const customFields = patientData.customFields || [];
        form.reset({
            ...form.getValues(), 
            emergencyContactName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.emergencyContactName),
            didGoToHospital: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.didGoToHospital),
            hospitalName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.hospitalName),
            dateOfAccident: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.dateOfAccident) ? new Date(getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.dateOfAccident)) : undefined,
            claimNumber: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.claimNumber),
            policyNumber: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.policyNumber),
            autoInsuranceCompany: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.autoInsuranceCompany),
            healthInsurance: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.healthInsurance),
            healthInsuranceId: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.healthInsuranceId),
            attorneyName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.attorneyName),
            attorneyPhone: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.attorneyPhone),
            adjustersName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.adjustersName),
            insurancePhoneNumber: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.insurancePhoneNumber),
            groupNumber: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.groupNumber),
            medicaidMedicareId: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.medicaidMedicareId),
            maritalStatus: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.maritalStatus),
            licenseState: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.licenseState),
        });
        setSensitiveDataVisible(true);
    } catch (error) {
        toast({ title: "Error", description: "Could not load sensitive patient details.", variant: "destructive" });
    } finally {
        setLoadingSensitive(false);
    }
  }

  const handleSave = async (data: PatientFormData) => {
    setSaving(true);
    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address1: data.streetAddress,
        city: data.city,
        state: data.state,
        postalCode: data.zipCode,
        dateOfBirth: data.dateOfBirth?.toISOString(),
        customFields: Object.entries(CUSTOM_FIELD_IDS)
          .map(([key, id]) => {
            if (id.startsWith('REPLACE')) return null;
            const value = data[key as keyof PatientFormData];
            return { id, value: value instanceof Date ? value.toISOString() : value || '' };
          })
          .filter(Boolean),
      };

      await ghlApi.contacts.update(patientId, updateData);
      setIsEditing(false);
      toast({ title: "Success", description: "Patient information updated successfully" });
      await loadPatientData();
    } catch (error) {
      console.error('Failed to update patient:', error);
      toast({ title: "Error", description: "Failed to update patient information", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); loadPatientData(); };
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "scheduled":
      case "pending":
        return "bg-blue-500/10 text-blue-600";
      case "cancelled": return "bg-red-500/10 text-red-600";
      case "noshow": return "bg-gray-500/10 text-gray-600";
      default: return "bg-muted text-muted-foreground";
    }
  };
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    setSaving(true);
    try {
        const appointmentData = {
            calendarId: data.calendarId,
            contactId: patientId,
            title: data.title,
            startTime: data.startTime.toISOString(),
            notes: data.notes,
            appointmentStatus: 'confirmed',
        };
        await ghlApi.appointments.create({ data: appointmentData });
        toast({ title: "Success", description: "Appointment booked successfully." });
        setIsBookingModalOpen(false);
        appointmentForm.reset();
        await loadPatientData();
    } catch (error) {
        console.error("Failed to create appointment:", error);
        toast({ title: "Error", description: "Failed to book appointment.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  const patientName = useMemo(() => `${form.getValues("firstName")} ${form.getValues("lastName")}`, [form.watch("firstName"), form.watch("lastName")]);
  const patientAge = useMemo(() => {
    const dob = form.getValues("dateOfBirth");
    return dob ? differenceInYears(new Date(), dob) : null;
  }, [form.watch("dateOfBirth")]);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/patients')}><ArrowLeft className="h-4 w-4" /></Button>
              <h1 className="text-2xl font-bold text-foreground">Patient Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={handleEdit}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                  <Button onClick={() => {}}><MessageSquare className="w-4 h-4 mr-2" /> Message</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={saving}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                  <Button onClick={form.handleSubmit(handleSave)} disabled={saving}>
                    {saving ? <Clock className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="shadow-md">
            <CardContent className="p-6 flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={patient.profilePictureUrl || ''} alt={patientName} />
                <AvatarFallback className="text-3xl font-semibold">{patient.firstName?.[0]}{patient.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold">{patientName}</h2>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                      <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {form.getValues("email") || 'N/A'}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {form.getValues("phone") || 'N/A'}</span>
                    </div>
                  </div>
                   <Badge variant="outline" className="border-green-500 text-green-600">Active PIP Case</Badge>
                </div>
                <div className="border-t my-4"></div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                   <InfoField label="Age" value={patientAge} />
                   <InfoField label="Accident" value={form.getValues("dateOfAccident") ? format(form.getValues("dateOfAccident")!, 'MMM d, yyyy') : null} />
                   <InfoField label="Last Visit" value={appointments[0] ? format(new Date(appointments[0].startTime), 'MMM d, yyyy') : 'N/A'} />
                   <InfoField label="Balance" value={<span className="text-destructive">{formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</span>} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(handleSave)}>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-primary" /> Demographics</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isEditing ? (
                        <>
                          <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover></FormItem>)} />
                          <FormField control={form.control} name="maritalStatus" render={({ field }) => (<FormItem><FormLabel>Marital Status</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name="licenseState" render={({ field }) => (<FormItem><FormLabel>License State</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        </>
                      ) : (
                        <>
                          <InfoField label="Full Name" value={patientName} />
                          <InfoField label="Date of Birth" value={form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, 'PPP') : 'N/A'} />
                          <div className="col-span-2"><InfoField label="Address" value={form.getValues("streetAddress")} /></div>
                          {sensitiveDataVisible && <InfoField label="Emergency Contact" value={form.getValues("emergencyContactName")} />}
                          {sensitiveDataVisible && <InfoField label="Marital Status" value={form.getValues("maritalStatus")} />}
                          {sensitiveDataVisible && <InfoField label="License State" value={form.getValues("licenseState")} />}
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  {sensitiveDataVisible ? (
                    <>
                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="text-red-500" /> Medical Info</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {isEditing ? (
                             <>
                                <FormField control={form.control} name="didGoToHospital" render={({ field }) => (<FormItem><FormLabel>Went to Hospital?</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="hospitalName" render={({ field }) => (<FormItem><FormLabel>Hospital Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                             </>
                           ) : (
                             <>
                                <InfoField label="Went to Hospital?" value={form.getValues("didGoToHospital")} />
                                <InfoField label="Hospital Name" value={form.getValues("hospitalName")} />
                             </>
                           )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-blue-500" /> Insurance & Case Info</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <FormField control={form.control} name="dateOfAccident" render={({ field }) => (<FormItem><FormLabel>Date of Accident</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>)} />
                                    <FormField control={form.control} name="claimNumber" render={({ field }) => (<FormItem><FormLabel>Claim #</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="policyNumber" render={({ field }) => (<FormItem><FormLabel>Policy #</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="autoInsuranceCompany" render={({ field }) => (<FormItem><FormLabel>Auto Insurance</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="healthInsurance" render={({ field }) => (<FormItem><FormLabel>Health Insurance</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="healthInsuranceId" render={({ field }) => (<FormItem><FormLabel>Health Insurance ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="groupNumber" render={({ field }) => (<FormItem><FormLabel>Group #</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="medicaidMedicareId" render={({ field }) => (<FormItem><FormLabel>Medicaid/Medicare ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="adjustersName" render={({ field }) => (<FormItem><FormLabel>Adjuster's Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="insurancePhoneNumber" render={({ field }) => (<FormItem><FormLabel>Insurance Phone #</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                </>
                            ) : (
                                <>
                                    <InfoField label="Date of Accident" value={form.getValues("dateOfAccident") ? format(form.getValues("dateOfAccident")!, 'PPP') : null} />
                                    <InfoField label="Claim #" value={form.getValues("claimNumber")} />
                                    <InfoField label="Policy #" value={form.getValues("policyNumber")} />
                                    <InfoField label="Auto Insurance" value={form.getValues("autoInsuranceCompany")} />
                                    <InfoField label="Health Insurance" value={form.getValues("healthInsurance")} />
                                    <InfoField label="Health Insurance ID" value={form.getValues("healthInsuranceId")} />
                                    <InfoField label="Group #" value={form.getValues("groupNumber")} />
                                    <InfoField label="Medicaid/Medicare ID" value={form.getValues("medicaidMedicareId")} />
                                    <InfoField label="Adjuster's Name" value={form.getValues("adjustersName")} />
                                    <InfoField label="Insurance Phone #" value={form.getValues("insurancePhoneNumber")} />
                                </>
                            )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="text-amber-600" /> Legal Representation</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <FormField control={form.control} name="attorneyName" render={({ field }) => (<FormItem><FormLabel>Attorney Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="attorneyPhone" render={({ field }) => (<FormItem><FormLabel>Attorney Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                </>
                            ) : (
                                <>
                                    <InfoField label="Attorney Name" value={form.getValues("attorneyName")} />
                                    <InfoField label="Attorney Phone" value={form.getValues("attorneyPhone")} />
                                </>
                            )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className="border-dashed border-yellow-500 bg-yellow-500/5">
                        <CardContent className="p-6 text-center">
                           <Lock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold">Sensitive Information</h3>
                            <p className="text-sm text-muted-foreground mb-4">Medical, Insurance, and Legal details are protected.</p>
                            <Button onClick={loadSensitiveData} disabled={loadingSensitive}>
                                {loadingSensitive ? <Clock className="animate-spin h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                View Sensitive Info
                            </Button>
                        </CardContent>
                    </Card>
                  )}
                </form>
              </Form>
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
                <TabsContent value="tasks">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Tasks</CardTitle>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {tasks.length > 0 ? tasks.map(task => (
                            <div key={task.id} className="flex justify-between items-center p-2 border-b">
                                <div>
                                    <p className="font-semibold">{task.title || 'Task'}</p>
                                    <p className="text-sm text-muted-foreground">Due: {format(new Date(task.dueDate), 'PPP')}</p>
                                </div>
                                <Badge variant="secondary" className={getStatusColor(task.status)}>{task.status}</Badge>
                            </div>
                        )) : <p className="text-center text-muted-foreground p-4">No tasks found.</p>}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="soap-notes">
                   <Card><CardHeader><CardTitle>SOAP Notes</CardTitle></CardHeader><CardContent className="space-y-2">{soapNotes.map(note => <div key={note.id} className="flex justify-between items-center p-2 border-b"><p>{note.chiefComplaint} - {format(note.date, 'PPP')}</p><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></div>)}</CardContent></Card>
                </TabsContent>
                <TabsContent value="forms">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Form Submissions</CardTitle>
                        <Button><Plus className="w-4 h-4 mr-2" /> Send Form</Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {forms.length > 0 ? forms.map(form => (
                            <div key={form.id} className="flex justify-between items-center p-2 border-b">
                                <div>
                                    <p className="font-semibold">{form.name}</p>
                                    <p className="text-sm text-muted-foreground">Submitted: {format(form.submissionDate, 'PPP')}</p>
                                </div>
                                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            </div>
                        )) : <p className="text-center text-muted-foreground p-4">No form submissions found.</p>}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="invoices">
                   <Card><CardHeader><CardTitle>Invoices</CardTitle></CardHeader><CardContent className="space-y-2">{invoices.map(inv => <div key={inv.id} className="flex justify-between items-center p-2 border-b"><div><p>{inv.id} - {inv.description}</p><p className="text-sm text-muted-foreground">{formatCurrency(inv.amount)}</p></div><Badge variant="secondary" className={getStatusColor(inv.status)}>{inv.status}</Badge></div>)}</CardContent></Card>
                </TabsContent>
                 <TabsContent value="files">
                   <Card><CardHeader><CardTitle>Files</CardTitle></CardHeader><CardContent className="space-y-2">{files.map(file => <div key={file.id} className="flex justify-between items-center p-2 border-b"><p>{file.name}</p><div className="flex gap-2"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button></div></div>)}</CardContent></Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

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
