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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Phone, Mail, Calendar as CalendarIcon, FileText, MessageSquare, DollarSign,
  User, Clock, MapPin, Plus, Download, Eye, Upload, Edit, Shield, AlertTriangle,
  BarChart3, Save, X, Check, Gavel, Car, HeartPulse, Briefcase
} from "lucide-react";

// Form schema with fields matching GHL
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
});

type PatientFormData = z.infer<typeof patientFormSchema>;

// Helper to find custom field value by its unique ID
const getCustomFieldValueById = (customFields: any[], fieldId: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.value : undefined;
};

// Using actual Custom Field IDs from your GHL screenshot
const CUSTOM_FIELD_IDS = {
  dateOfAccident: 'aWQjhJvshJvshN0coM2Ew',
  claimNumber: 'hI7cK3VoG9XdkHZEE7Vj',
  policyNumber: 'yH8ULGUlU3XPXfJkZ8B4',
  autoInsuranceCompany: 'oFzEgb2y1hbiTjP5VvA2',
  healthInsurance: '1zrW9idqNMbLWrZvcPee',
  healthInsuranceId: 'k4sW9iLq0pMHYfJkZ8B4',
  attorneyName: 'Kdh3NRFD0DIfhoE86TzT',
  attorneyPhone: 'ArS1W9iLq0pMHYfJkZ8B',
  emergencyContactName: 'l7yGH2qMIQ16VhyaxLMM',
  didGoToHospital: 'yozLiFhvkMaXG4pW9iLq',
  hospitalName: 'oFzEgb2y1hbiTjP5VvA2',
};

export default function PatientProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [soapNotes, setSoapNotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const ghlApi = useGHLApi();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);
  
  const loadPatientData = async () => {
    setLoading(true);
    try {
      const response = await ghlApi.contacts.getById(patientId);
      const patientData = response.contact || response;
      if (!patientData) throw new Error("Patient data could not be found.");
      setPatient(patientData);

      // CORRECTED: Use `customFields` (plural) to match the API response
      const customFields = patientData.customFields || [];
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
        
        dateOfAccident: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.dateOfAccident) ? new Date(getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.dateOfAccident)) : undefined,
        claimNumber: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.claimNumber),
        policyNumber: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.policyNumber),
        autoInsuranceCompany: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.autoInsuranceCompany),
        healthInsurance: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.healthInsurance),
        healthInsuranceId: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.healthInsuranceId),
        attorneyName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.attorneyName),
        attorneyPhone: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.attorneyPhone),
        emergencyContactName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.emergencyContactName),
        didGoToHospital: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.didGoToHospital),
        hospitalName: getCustomFieldValueById(customFields, CUSTOM_FIELD_IDS.hospitalName),
      });

      // Mock data for related records
      setAppointments([
         { id: "apt-1", date: new Date("2025-05-22"), time: "02:00 PM", provider: "Dr. Silverman", service: "Initial PIP Consultation & Exam", status: "completed", location: "Consultation Room" },
         { id: "apt-2", date: new Date("2025-06-15"), time: "09:00 AM", provider: "Dr. Silverman", service: "Chiropractic Adjustment", status: "completed", location: "Treatment Room 1" },
         { id: "apt-3", date: new Date(), time: "10:30 AM", provider: "Dr. Silverman", service: "Follow-up & Therapy", status: "scheduled", location: "Treatment Room 1" }
      ]);
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

    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({ title: "Error", description: "Failed to load patient information.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: PatientFormData) => { /* ... */ };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); loadPatientData(); };
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-green-500/10 text-green-600";
      case "scheduled": return "bg-blue-500/10 text-blue-600";
      case "paid": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-yellow-500/10 text-yellow-700";
      default: return "bg-muted text-muted-foreground";
    }
  };
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

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
                   <InfoField label="Last Visit" value={appointments[0] ? format(appointments[0].date, 'MMM d, yyyy') : null} />
                   <InfoField label="Balance" value={<span className="text-destructive">{formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</span>} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Form {...form}>
                <form className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-primary" /> Demographics</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoField label="Full Name" value={patientName} />
                      <InfoField label="Date of Birth" value={form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, 'PPP') : null} />
                      <div className="col-span-2"><InfoField label="Address" value={form.getValues("streetAddress")} /></div>
                      <InfoField label="Emergency Contact" value={form.getValues("emergencyContactName")} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="text-red-500" /> Medical Info</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <InfoField label="Went to Hospital?" value={form.getValues("didGoToHospital")} />
                         <InfoField label="Hospital Name" value={form.getValues("hospitalName")} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-blue-500" /> Insurance & Case Info</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField label="Date of Accident" value={form.getValues("dateOfAccident") ? format(form.getValues("dateOfAccident")!, 'PPP') : null} />
                        <InfoField label="Claim #" value={form.getValues("claimNumber")} />
                        <InfoField label="Policy #" value={form.getValues("policyNumber")} />
                        <InfoField label="Auto Insurance" value={form.getValues("autoInsuranceCompany")} />
                        <InfoField label="Health Insurance" value={form.getValues("healthInsurance")} />
                        <InfoField label="Health Insurance ID" value={form.getValues("healthInsuranceId")} />
                    </CardContent>
                  </Card>

                   <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="text-amber-600" /> Legal Representation</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField label="Attorney Name" value={form.getValues("attorneyName")} />
                        <InfoField label="Attorney Phone" value={form.getValues("attorneyPhone")} />
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>

            <div className="lg:col-span-2">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="appointments">
                  <Card><CardHeader><CardTitle>Appointment History</CardTitle></CardHeader><CardContent className="space-y-2">{appointments.map(apt => <div key={apt.id} className="flex justify-between items-center p-2 border-b"><p>{apt.service} - {format(apt.date, 'PPP')}</p><Badge variant="secondary" className={getStatusColor(apt.status)}>{apt.status}</Badge></div>)}</CardContent></Card>
                </TabsContent>
                 <TabsContent value="soap-notes">
                   <Card><CardHeader><CardTitle>SOAP Notes</CardTitle></CardHeader><CardContent className="space-y-2">{soapNotes.map(note => <div key={note.id} className="flex justify-between items-center p-2 border-b"><p>{note.chiefComplaint} - {format(note.date, 'PPP')}</p><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></div>)}</CardContent></Card>
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
      </Layout>
    </AuthGuard>
  );
}
