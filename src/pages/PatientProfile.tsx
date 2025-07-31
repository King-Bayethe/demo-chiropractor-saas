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

// UPDATED: Form schema with new PIP-related fields
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
  emergencyContactPhone: z.string().optional(),
  // Medical Fields
  allergies: z.string().optional(),
  nextAppointment: z.date().optional(),
  // NEW: PIP / Accident Fields
  dateOfAccident: z.date().optional(),
  claimNumber: z.string().optional(),
  medicalInsurance: z.string().optional(),
  autoInsurance: z.string().optional(),
  attorneyName: z.string().optional(),
  attorneyFirm: z.string().optional(),
  attorneyPhone: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

// Helper functions
const getPatientName = (patient: any): string => {
  if (!patient) return "";
  return `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
};

const getCustomFieldValue = (customFields: any[], fieldName: string): any => {
  if (!customFields || !Array.isArray(customFields)) return "";
  const field = customFields.find((f: any) => f.name === fieldName);
  return field ? field.value : "";
};

// UPDATED: Add placeholder IDs for the new PIP custom fields
const CUSTOM_FIELD_IDS = {
  emergencyContactName: 'REPLACE_WITH_ID_EMERGENCY_NAME',
  emergencyContactPhone: 'REPLACE_WITH_ID_EMERGENCY_PHONE',
  allergies: 'REPLACE_WITH_ID_ALLERGIES',
  nextAppointment: 'REPLACE_WITH_ID_NEXT_APPT',
  dateOfAccident: 'REPLACE_WITH_ID_DOA',
  claimNumber: 'REPLACE_WITH_ID_CLAIM_NUM',
  medicalInsurance: 'REPLACE_WITH_ID_MED_INS',
  autoInsurance: 'REPLACE_WITH_ID_AUTO_INS',
  attorneyName: 'REPLACE_WITH_ID_ATTORNEY_NAME',
  attorneyFirm: 'REPLACE_WITH_ID_ATTORNEY_FIRM',
  attorneyPhone: 'REPLACE_WITH_ID_ATTORNEY_PHONE',
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
    defaultValues: { /* ... */ },
  });

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);
  
  const loadPatientData = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch live GHL data (logic remains the same)
      const response = await ghlApi.contacts.getById(patientId);
      const patientData = response.contact || response;
      if (!patientData) throw new Error("Patient data could not be found.");
      setPatient(patientData);

      // Step 2: Populate form with a mix of live GHL data and NEW mock PIP data
      form.reset({
        // Standard Fields from GHL
        firstName: patientData.firstName || "John",
        lastName: patientData.lastName || "Doe",
        email: patientData.email || "john.doe.pip@email.com",
        phone: patientData.phone || "(305) 555-1234",
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : new Date("1988-04-15"),
        streetAddress: patientData.address1 || "123 Injury Lane",
        city: patientData.city || "Miami",
        state: patientData.state || "FL",
        zipCode: patientData.postalCode || "33178",
        emergencyContactName: getCustomFieldValue(patientData.customField, 'Emergency Contact Name') || "Jane Doe",
        emergencyContactPhone: getCustomFieldValue(patientData.customField, 'Emergency Contact Phone') || "(305) 555-5678",
        allergies: getCustomFieldValue(patientData.customField, 'Allergies') || "Penicillin",
        
        // NEW MOCK DATA for PIP Patient
        dateOfAccident: new Date("2025-05-20"),
        claimNumber: "MIA-2025-789C",
        medicalInsurance: "Florida Blue Cross",
        autoInsurance: "State Farm",
        attorneyName: "Saul Goodman",
        attorneyFirm: "Goodman & Associates Law",
        attorneyPhone: "(505) 503-4455",
      });

      // Step 3: Use mock data for related records (as requested)
      // This data is now tailored to a PIP case timeline
      setAppointments([
         { id: "apt-1", date: new Date("2025-05-22"), time: "02:00 PM", provider: "Dr. Silverman", service: "Initial PIP Consultation & Exam", status: "completed", location: "Consultation Room" },
         { id: "apt-2", date: new Date("2025-06-15"), time: "09:00 AM", provider: "Dr. Silverman", service: "Chiropractic Adjustment", status: "completed", location: "Treatment Room 1" },
         { id: "apt-3", date: new Date(), time: "10:30 AM", provider: "Dr. Silverman", service: "Follow-up & Therapy", status: "scheduled", location: "Treatment Room 1" }
      ]);
      setSoapNotes([/* ... */]);
      setInvoices([/* ... */]);
      setFiles([/* ... */]);

    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({ title: "Error", description: "Failed to load patient information.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: PatientFormData) => {
    // Save logic updated to include new fields
    setSaving(true);
    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        // ... other standard fields
        customField: Object.entries(CUSTOM_FIELD_IDS).reduce((acc: any[], [key, id]) => {
            const value = data[key as keyof PatientFormData];
            if (id.startsWith('REPLACE')) return acc; // Don't save fields without a real ID
            acc.push({ id, value: value instanceof Date ? value.toISOString() : value || '' });
            return acc;
        }, []),
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

  // Other handlers and helpers
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); loadPatientData(); };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const patientName = useMemo(() => getPatientName(form.getValues()), [form.watch()]);
  const patientAge = useMemo(() => {
    const dob = form.getValues("dateOfBirth");
    return dob ? differenceInYears(new Date(), dob) : null;
  }, [form.watch("dateOfBirth")]);

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-48"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="h-64 bg-muted rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-96 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!patient) {
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Patient Not Found</h1>
            <p className="text-muted-foreground mb-4">The requested patient could not be found.</p>
            <Button onClick={() => navigate('/patients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
          {/* NEW: Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
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

          {/* NEW: Patient Banner Card */}
          <Card className="shadow-md">
            <CardContent className="p-6 flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={patient.profilePictureUrl || ''} alt={patientName} />
                <AvatarFallback className="text-3xl font-semibold">
                  {patientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold">{patientName}</h2>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                      <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {form.getValues("email")}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {form.getValues("phone")}</span>
                    </div>
                  </div>
                   <Badge variant="outline" className="border-green-500 text-green-600">Active PIP Case</Badge>
                </div>
                <div className="border-t my-4"></div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                   <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="text-muted-foreground">Age:</span> <span className="font-semibold">{patientAge || "N/A"}</span></div>
                   <div className="flex items-center gap-2"><Car className="h-4 w-4 text-primary" /><span className="text-muted-foreground">Accident:</span> <span className="font-semibold">{form.getValues("dateOfAccident") ? format(form.getValues("dateOfAccident")!, 'MMM d, yyyy') : 'N/A'}</span></div>
                   <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /><span className="text-muted-foreground">Last Visit:</span> <span className="font-semibold">{appointments[0] ? format(appointments[0].date, 'MMM d, yyyy') : 'N/A'}</span></div>
                   <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-destructive" /><span className="text-muted-foreground">Balance:</span> <span className="font-semibold text-destructive">{formatCurrency(150.00)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Patient Details */}
            <div className="lg:col-span-1 space-y-6">
              <Form {...form}>
                <form className="space-y-6">
                  {/* Demographics Section */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-primary" /> Demographics</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isEditing ? <>
                        <FormField name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <FormField name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        {/* More edit fields... */}
                      </> : <>
                        <div><Label>Full Name</Label><p>{patientName}</p></div>
                        <div><Label>Date of Birth</Label><p>{form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, 'PPP') : 'N/A'}</p></div>
                        {/* More display fields... */}
                      </>}
                    </CardContent>
                  </Card>
                  
                  {/* NEW: Medical Info */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="text-red-500" /> Medical Info</CardTitle></CardHeader>
                    <CardContent>
                      {isEditing ? <>
                        <FormField name="allergies" render={({ field }) => (<FormItem><FormLabel>Allergies</FormLabel><FormControl><Textarea {...field} placeholder="e.g. Penicillin, Shellfish" /></FormControl></FormItem>)} />
                      </> : <>
                        <Label>Allergies</Label>
                        <div className="text-red-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{form.getValues("allergies") || "None Reported"}</div>
                      </>}
                    </CardContent>
                  </Card>

                  {/* NEW: Insurance & Case Info */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-blue-500" /> Insurance & Case Info</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label>Claim #</Label><p>{form.getValues("claimNumber")}</p></div>
                      <div><Label>Auto Insurance</Label><p>{form.getValues("autoInsurance")}</p></div>
                      <div><Label>Medical Insurance</Label><p>{form.getValues("medicalInsurance")}</p></div>
                    </CardContent>
                  </Card>

                  {/* NEW: Legal Info */}
                   <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="text-amber-600" /> Legal Representation</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label>Attorney</Label><p>{form.getValues("attorneyName")}</p></div>
                      <div><Label>Law Firm</Label><p>{form.getValues("attorneyFirm")}</p></div>
                      <div className="col-span-2"><Label>Attorney Phone</Label><p>{form.getValues("attorneyPhone")}</p></div>
                    </CardContent>
                  </Card>

                </form>
              </Form>
            </div>

            {/* Right Column: Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="appointments">
                  <Card><CardHeader><CardTitle>Appointment History</CardTitle></CardHeader><CardContent>{/* Appointment list/table here */}</CardContent></Card>
                </TabsContent>
                 <TabsContent value="soap-notes">
                   <Card><CardHeader><CardTitle>SOAP Notes</CardTitle></CardHeader><CardContent>{/* SOAP note list here */}</CardContent></Card>
                </TabsContent>
                {/* Other Tabs... */}
              </Tabs>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}