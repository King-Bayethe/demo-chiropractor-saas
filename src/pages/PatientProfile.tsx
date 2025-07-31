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
  BarChart3, Save, X, Check, Gavel, Car, HeartPulse, Briefcase, Lock, CheckSquare
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";


// Form schema updated with all relevant fields
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
});

type PatientFormData = z.infer<typeof patientFormSchema>;

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
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const ghlApi = useGHLApi();
  
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState(false);
  const [loadingSensitive, setLoadingSensitive] = useState(false);

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

      // Mock data for other related records
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
  const getStatusColor = (status: string) => { /* ... */ };
  const formatCurrency = (amount: number) => { /* ... */ };

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

          <Card className="shadow-md">{/* ... Banner Card ... */}</Card>

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
                          <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        </>
                      ) : (
                        <>
                          <InfoField label="Full Name" value={patientName} />
                          <InfoField label="Date of Birth" value={form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, 'PPP') : 'N/A'} />
                          <div className="col-span-2"><InfoField label="Address" value={form.getValues("streetAddress")} /></div>
                          {sensitiveDataVisible && <InfoField label="Emergency Contact" value={form.getValues("emergencyContactName")} />}
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
                                </>
                            ) : (
                                <>
                                    <InfoField label="Date of Accident" value={form.getValues("dateOfAccident") ? format(form.getValues("dateOfAccident")!, 'PPP') : null} />
                                    <InfoField label="Claim #" value={form.getValues("claimNumber")} />
                                    <InfoField label="Policy #" value={form.getValues("policyNumber")} />
                                    <InfoField label="Auto Insurance" value={form.getValues("autoInsuranceCompany")} />
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
                {/* ... All TabsContent sections ... */}
              </Tabs>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
