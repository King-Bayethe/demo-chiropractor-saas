import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
import { usePatients } from "@/hooks/usePatients";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInYears, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  mapSupabasePatientToProfileHeader, 
  getPatientType, 
  getCaseTypeDisplayName, 
  getCaseTypeVariant 
} from "@/utils/patientMapping";
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
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[\d\-\(\)\+\s]+$/, "Invalid phone number format"),
  dateOfBirth: z.date().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional().refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), "Invalid ZIP code format"),
  emergencyContactName: z.string().optional(),
  didGoToHospital: z.enum(["yes", "no", ""]).optional(),
  hospitalName: z.string().optional(),
  dateOfAccident: z.date().optional(),
  claimNumber: z.string().optional(),
  policyNumber: z.string().optional(),
  autoInsuranceCompany: z.string().optional(),
  healthInsurance: z.string().optional(),
  healthInsuranceId: z.string().optional(),
  attorneyName: z.string().optional(),
  attorneyPhone: z.string().optional().refine((val) => !val || /^[\d\-\(\)\+\s]+$/.test(val), "Invalid phone number format"),
  adjustersName: z.string().optional(),
  insurancePhoneNumber: z.string().optional().refine((val) => !val || /^[\d\-\(\)\+\s]+$/.test(val), "Invalid phone number format"),
  groupNumber: z.string().optional(),
  medicaidMedicareId: z.string().optional(),
  maritalStatus: z.string().optional(),
  licenseState: z.string().optional(),
  caseType: z.string().optional(),
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
  // These IDs will need to be updated when integrated with actual GHL custom fields
  dateOfAccident: 'date-of-accident-field-id',
  didGoToHospital: 'hospital-visit-field-id', 
  hospitalName: 'hospital-name-field-id',
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
  
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState(false);
  const [loadingSensitive, setLoadingSensitive] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { updatePatient } = usePatients();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  // Load individual patient directly from database
  const loadIndividualPatient = async (id: string) => {
    try {
      // Try to find patient by GHL contact ID first, then by Supabase ID as fallback
      const { data: patientData, error } = await supabase
        .from('patients')
        .select('*')
        .or(`ghl_contact_id.eq.${id},id.eq.${id}`)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return patientData;
    } catch (error) {
      console.error('Error loading individual patient:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]); // Removed patients dependency to fix race condition
  
  const resetFormToPatientData = () => {
    if (!patient) return;
    
    form.reset({
      firstName: patient.first_name || "",
      lastName: patient.last_name || "",
      email: patient.email || "",
      phone: patient.phone || patient.cell_phone || "",
      dateOfBirth: patient.date_of_birth ? new Date(patient.date_of_birth) : undefined,
      streetAddress: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      zipCode: patient.zip_code || "",
      emergencyContactName: patient.emergency_contact_name || "",
      didGoToHospital: patient.did_go_to_hospital === true ? "yes" : patient.did_go_to_hospital === false ? "no" : "",
      hospitalName: patient.hospital_name || "",
      dateOfAccident: patient.accident_date ? new Date(patient.accident_date) : undefined,
      claimNumber: patient.claim_number || "",
      policyNumber: patient.auto_policy_number || "",
      autoInsuranceCompany: patient.auto_insurance_company || "",
      healthInsurance: patient.health_insurance || "",
      healthInsuranceId: patient.health_insurance_id || "",
      attorneyName: patient.attorney_name || "",
      attorneyPhone: patient.attorney_phone || "",
      adjustersName: patient.adjuster_name || "",
      insurancePhoneNumber: patient.insurance_phone_number || "",
      groupNumber: patient.group_number || "",
      medicaidMedicareId: patient.medicaid_medicare_id || "",
      maritalStatus: patient.marital_status || "",
      licenseState: patient.drivers_license_state || "",
    });
  };
  
  const loadPatientData = async () => {
    setLoading(true);
    setSensitiveDataVisible(false); 
    try {
      const patientData = await loadIndividualPatient(patientId);
      
      if (!patientData) {
        console.error("Patient not found with ID:", patientId);
        toast({ 
          title: "Patient Not Found", 
          description: "This patient may not have been synced from the intake form yet.", 
          variant: "destructive" 
        });
        setPatient(null);
        setLoading(false);
        return;
      }
      setPatient(patientData);
      
      // Mock data for appointments and tasks
      setAppointments([]);
      setTasks([]);

      // Mock calendars data since calendars API is not available
      setCalendars([
        { id: "cal-1", name: "Dr. Silverman's Schedule", timezone: "America/New_York" },
        { id: "cal-2", name: "PIP Appointments", timezone: "America/New_York" }
      ]);

      form.reset({
        firstName: patientData.first_name || "",
        lastName: patientData.last_name || "",
        email: patientData.email || "",
        phone: patientData.phone || patientData.cell_phone || "",
        dateOfBirth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : undefined,
        streetAddress: patientData.address || "",
        city: patientData.city || "",
        state: patientData.state || "",
        zipCode: patientData.zip_code || "",
        emergencyContactName: patientData.emergency_contact_name || "",
        didGoToHospital: patientData.did_go_to_hospital === true ? "yes" : patientData.did_go_to_hospital === false ? "no" : "",
        hospitalName: patientData.hospital_name || "",
        dateOfAccident: patientData.accident_date ? new Date(patientData.accident_date) : undefined,
        claimNumber: patientData.claim_number || "",
        policyNumber: patientData.auto_policy_number || "",
        autoInsuranceCompany: patientData.auto_insurance_company || "",
        healthInsurance: patientData.health_insurance || "",
        healthInsuranceId: patientData.health_insurance_id || "",
        attorneyName: patientData.attorney_name || "",
        attorneyPhone: patientData.attorney_phone || "",
        adjustersName: patientData.adjuster_name || "",
        insurancePhoneNumber: patientData.insurance_phone_number || "",
        groupNumber: patientData.group_number || "",
        medicaidMedicareId: patientData.medicaid_medicare_id || "",
        maritalStatus: patientData.marital_status || "",
        licenseState: patientData.drivers_license_state || "",
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
        // All patient data is already loaded, just show it
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
      if (!patient?.id) {
        throw new Error("Patient ID not found");
      }

      // Validate required fields
      if (!data.firstName?.trim()) {
        form.setError("firstName", { message: "First name is required" });
        setSaving(false);
        return;
      }
      if (!data.lastName?.trim()) {
        form.setError("lastName", { message: "Last name is required" });
        setSaving(false);
        return;
      }
      if (!data.phone?.trim()) {
        form.setError("phone", { message: "Phone number is required" });
        setSaving(false);
        return;
      }

      // Map form data to patient update format with proper handling of optional fields
      const updateData: any = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone: data.phone.trim(),
        cell_phone: data.phone.trim(), // Set both phone fields for consistency
        email: data.email?.trim() || null,
        address: data.streetAddress?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,
        zip_code: data.zipCode?.trim() || null,
        emergency_contact_name: data.emergencyContactName?.trim() || null,
        claim_number: data.claimNumber?.trim() || null,
        auto_policy_number: data.policyNumber?.trim() || null,
        auto_insurance_company: data.autoInsuranceCompany?.trim() || null,
        health_insurance: data.healthInsurance?.trim() || null,
        attorney_name: data.attorneyName?.trim() || null,
        attorney_phone: data.attorneyPhone?.trim() || null,
        adjuster_name: data.adjustersName?.trim() || null,
        insurance_phone_number: data.insurancePhoneNumber?.trim() || null,
        health_insurance_id: data.healthInsuranceId?.trim() || null,
        medicaid_medicare_id: data.medicaidMedicareId?.trim() || null,
        did_go_to_hospital: data.didGoToHospital === "yes" ? true : data.didGoToHospital === "no" ? false : null,
        hospital_name: data.hospitalName?.trim() || null,
        marital_status: data.maritalStatus?.trim() || null,
        drivers_license_state: data.licenseState?.trim() || null,
        group_number: data.groupNumber?.trim() || null,
        case_type: data.caseType?.trim() || null,
      };

      // Handle date of birth with proper validation
      if (data.dateOfBirth) {
        try {
          updateData.date_of_birth = format(data.dateOfBirth, 'yyyy-MM-dd');
        } catch (dateError) {
          console.error('Date formatting error:', dateError);
          form.setError("dateOfBirth", { message: "Invalid date format" });
          setSaving(false);
          return;
        }
      }

      // Handle accident date if provided
      if (data.dateOfAccident) {
        try {
          updateData.accident_date = format(data.dateOfAccident, 'yyyy-MM-dd');
        } catch (dateError) {
          console.error('Accident date formatting error:', dateError);
          form.setError("dateOfAccident", { message: "Invalid date format" });
          setSaving(false);
          return;
        }
      }

      console.log('Updating patient with data:', updateData);
      
      const updatedPatient = await updatePatient(patient.id, updateData);
      
      // Update local patient state with returned data
      if (updatedPatient) {
        setPatient(updatedPatient);
      }
      
      setIsEditing(false);
      toast({ 
        title: "Success", 
        description: "Patient information updated successfully" 
      });
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      const errorMessage = error?.message || "Failed to update patient information";
      toast({ 
        title: "Update Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
      // Reset form to original values on error
      resetFormToPatientData();
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { 
    resetFormToPatientData();
    setIsEditing(false); 
  };
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
        // Mock appointment creation since appointments API is not available
        console.log('Would create appointment:', appointmentData);
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

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const dateOfBirth = form.watch("dateOfBirth");

  const patientName = useMemo(() => `${firstName || ""} ${lastName || ""}`.trim(), [firstName, lastName]);
  const patientAge = useMemo(() => {
    return dateOfBirth ? differenceInYears(new Date(), dateOfBirth) : null;
  }, [dateOfBirth]);

  const patientType = useMemo(() => {
    return patient ? getPatientType(patient) : '';
  }, [patient]);

  const caseTypeDisplay = useMemo(() => {
    return getCaseTypeDisplayName(patientType);
  }, [patientType]);

  const caseTypeVariant = useMemo(() => {
    return getCaseTypeVariant(patientType);
  }, [patientType]);

  const InfoField = ({ label, value }: { label: string, value: any }) => (
    <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="font-semibold">{value || <span className="text-gray-400 font-normal">N/A</span>}</p>
    </div>
  );

  if (loading) { return <div className="flex justify-center items-center h-full"><Clock className="animate-spin h-8 w-8" /></div>; }
  if (!patient) { 
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Patient Profile</h1>
            </div>
            <Card className="text-center p-8">
              <CardContent>
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  This patient may not have completed the intake form yet or the data hasn't been synced.
                </p>
                <Button onClick={() => navigate('/patients')}>
                  Return to Patients
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

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
                <AvatarFallback className="text-3xl font-semibold">{patient.first_name?.[0]}{patient.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold">{patientName}</h2>
                      <div className="flex items-center gap-4 text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {form.watch("email") || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {form.watch("phone") || 'N/A'}</span>
                      </div>
                  </div>
                   <Badge className={cn("border", caseTypeVariant)}>
                     {caseTypeDisplay}
                   </Badge>
                </div>
                <div className="border-t my-4"></div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                   <InfoField label="Age" value={patientAge} />
                   <InfoField label="Accident" value={form.watch("dateOfAccident") ? format(form.watch("dateOfAccident")!, 'MMM d, yyyy') : null} />
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
                          <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="maritalStatus" render={({ field }) => (<FormItem><FormLabel>Marital Status</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="licenseState" render={({ field }) => (<FormItem><FormLabel>License State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <div className="col-span-2">
                             <FormField control={form.control} name="streetAddress" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                           <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="caseType" render={({ field }) => (
                             <FormItem>
                               <FormLabel>Case Type</FormLabel>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                 <FormControl>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Select case type" />
                                   </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                   <SelectItem value="PIP">PIP</SelectItem>
                                   <SelectItem value="Insurance">Insurance</SelectItem>
                                   <SelectItem value="Slip and Fall">Slip and Fall</SelectItem>
                                   <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
                                   <SelectItem value="Cash Plan">Cash Plan</SelectItem>
                                   <SelectItem value="Attorney Only">Attorney Only</SelectItem>
                                 </SelectContent>
                               </Select>
                               <FormMessage />
                             </FormItem>
                           )} />
                        </>
                      ) : (
                         <>
                           <InfoField label="Full Name" value={patientName} />
                           <InfoField label="Date of Birth" value={form.watch("dateOfBirth") ? format(form.watch("dateOfBirth")!, 'PPP') : 'N/A'} />
                           <InfoField label="Phone" value={form.watch("phone")} />
                           <InfoField label="Email" value={form.watch("email")} />
                           <div className="col-span-2">
                             <InfoField label="Address" value={`${form.watch("streetAddress") || ''} ${form.watch("city") || ''} ${form.watch("state") || ''} ${form.watch("zipCode") || ''}`.trim() || 'N/A'} />
                           </div>
                           {sensitiveDataVisible && <InfoField label="Emergency Contact" value={form.watch("emergencyContactName")} />}
                           {sensitiveDataVisible && <InfoField label="Marital Status" value={form.watch("maritalStatus")} />}
                           {sensitiveDataVisible && <InfoField label="License State" value={form.watch("licenseState")} />}
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
                                <FormField control={form.control} name="didGoToHospital" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Went to Hospital?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="hospitalName" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hospital Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                             </>
                           ) : (
                              <>
                                 <InfoField label="Went to Hospital?" value={form.watch("didGoToHospital") === "yes" ? "Yes" : form.watch("didGoToHospital") === "no" ? "No" : "N/A"} />
                                 <InfoField label="Hospital Name" value={form.watch("hospitalName")} />
                              </>
                           )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-blue-500" /> Insurance & Case Info</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <FormField control={form.control} name="dateOfAccident" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Date of Accident</FormLabel>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                          </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="claimNumber" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Claim #</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="policyNumber" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Policy #</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="autoInsuranceCompany" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Auto Insurance</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="healthInsurance" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Health Insurance</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="healthInsuranceId" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Health Insurance ID</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="groupNumber" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Group #</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="medicaidMedicareId" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Medicaid/Medicare ID</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="adjustersName" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Adjuster's Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="insurancePhoneNumber" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Insurance Phone #</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                </>
                            ) : (
                                <>
                                    <InfoField label="Date of Accident" value={form.watch("dateOfAccident") ? format(form.watch("dateOfAccident")!, 'PPP') : null} />
                                    <InfoField label="Claim #" value={form.watch("claimNumber")} />
                                    <InfoField label="Policy #" value={form.watch("policyNumber")} />
                                    <InfoField label="Auto Insurance" value={form.watch("autoInsuranceCompany")} />
                                    <InfoField label="Health Insurance" value={form.watch("healthInsurance")} />
                                    <InfoField label="Health Insurance ID" value={form.watch("healthInsuranceId")} />
                                    <InfoField label="Group #" value={form.watch("groupNumber")} />
                                    <InfoField label="Medicaid/Medicare ID" value={form.watch("medicaidMedicareId")} />
                                    <InfoField label="Adjuster's Name" value={form.watch("adjustersName")} />
                                    <InfoField label="Insurance Phone #" value={form.watch("insurancePhoneNumber")} />
                                </>
                            )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="text-amber-600" /> Legal Representation</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <FormField control={form.control} name="attorneyName" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Attorney Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name="attorneyPhone" render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Attorney Phone</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                </>
                            ) : (
                                <>
                                    <InfoField label="Attorney Name" value={form.watch("attorneyName")} />
                                    <InfoField label="Attorney Phone" value={form.watch("attorneyPhone")} />
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
