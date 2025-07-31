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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Phone, Mail, Calendar as CalendarIcon, FileText, MessageSquare, DollarSign,
  User, Clock, MapPin, Plus, Download, Eye, Upload, Edit, Shield, AlertTriangle,
  BarChart3, Save, X, Check, Gavel, Car, HeartPulse, Briefcase, Hospital
} from "lucide-react";

// UPDATED: Form schema with fields matching GHL
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
  
  // Medical
  allergies: z.string().optional(),
  didGoToHospital: z.string().optional(),
  hospitalName: z.string().optional(),

  // Case & Insurance
  dateOfAccident: z.date().optional(),
  claimNumber: z.string().optional(),
  policyNumber: z.string().optional(),
  autoInsuranceCompany: z.string().optional(),
  healthInsurance: z.string().optional(),
  healthInsuranceId: z.string().optional(),
  
  // Legal
  attorneyName: z.string().optional(),
  attorneyPhone: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

// UPDATED: Find custom field value by its unique key (e.g., 'claim_number')
const getCustomFieldValue = (customFields: any[], fieldKey: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.key === fieldKey);
    return field ? field.value : undefined;
};

// UPDATED: Using actual Unique Keys from your GHL screenshots
const CUSTOM_FIELD_KEYS = {
  emergencyContactName: 'emergency_contact_name',
  didGoToHospital: 'did_you_go_to_the_hospital',
  hospitalName: 'if_yes_name',
  dateOfAccident: 'date_of_accident',
  claimNumber: 'claim_number',
  policyNumber: 'policy_number',
  autoInsuranceCompany: 'auto_insurance_company',
  healthInsurance: 'health_insurance',
  healthInsuranceId: 'health_insurance_id',
  attorneyName: 'attorneys_name',
  attorneyPhone: 'attorneys_phone_number',
  // Add other keys as needed
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
      const response = await ghlApi.contacts.getById(patientId);
      const patientData = response.contact || response;
      if (!patientData) throw new Error("Patient data could not be found.");
      setPatient(patientData);

      // UPDATED: Populate form with live data using the correct keys
      const customFields = patientData.customField || [];
      form.reset({
        // Standard Fields
        firstName: patientData.firstName || "",
        lastName: patientData.lastName || "",
        email: patientData.email || "",
        phone: patientData.phone || "",
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined,
        streetAddress: patientData.address1 || "",
        city: patientData.city || "",
        state: patientData.state || "",
        zipCode: patientData.postalCode || "",
        
        // Custom Fields
        emergencyContactName: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.emergencyContactName),
        didGoToHospital: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.didGoToHospital),
        hospitalName: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.hospitalName),
        dateOfAccident: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.dateOfAccident) ? new Date(getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.dateOfAccident)) : undefined,
        claimNumber: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.claimNumber),
        policyNumber: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.policyNumber),
        autoInsuranceCompany: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.autoInsuranceCompany),
        healthInsurance: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.healthInsurance),
        healthInsuranceId: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.healthInsuranceId),
        attorneyName: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.attorneyName),
        attorneyPhone: getCustomFieldValue(customFields, CUSTOM_FIELD_KEYS.attorneyPhone),
      });

      // Mock data for related records (as requested)
      setAppointments([/* ... */]);
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

  const handleSave = async (data: PatientFormData) => { /* ... */ };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); loadPatientData(); };
  const getStatusColor = (status: string) => { /* ... */ };
  const formatCurrency = (amount: number) => { /* ... */ };

  const patientName = useMemo(() => `${form.getValues("firstName")} ${form.getValues("lastName")}`, [form.watch("firstName"), form.watch("lastName")]);
  const patientAge = useMemo(() => {
    const dob = form.getValues("dateOfBirth");
    return dob ? differenceInYears(new Date(), dob) : null;
  }, [form.watch("dateOfBirth")]);

  // Helper component for displaying fields
  const InfoField = ({ label, value }: { label: string, value: any }) => (
    <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="font-semibold">{value || <span className="text-gray-400 font-normal">N/A</span>}</p>
    </div>
  );

  if (loading) { /* ... Loading UI ... */ }
  if (!patient) { /* ... Not Found UI ... */ }

  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
          {/* Header and Banner remain the same */}
          <div className="flex items-center justify-between">{/* ... */}</div>
          <Card className="shadow-md">{/* ... */}</Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Form {...form}>
                <form className="space-y-6">
                  {/* Demographics Section */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-primary" /> Demographics</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isEditing ? <> {/* Edit fields here */} </> : <>
                        <InfoField label="Full Name" value={patientName} />
                        <InfoField label="Date of Birth" value={form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, 'PPP') : null} />
                        <div className="col-span-2"><InfoField label="Address" value={form.getValues("streetAddress")} /></div>
                        <InfoField label="Emergency Contact" value={form.getValues("emergencyContactName")} />
                      </>}
                    </CardContent>
                  </Card>
                  
                  {/* UPDATED: Medical Info Card */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="text-red-500" /> Medical Info</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isEditing ? <> {/* Edit fields here */} </> : <>
                         <InfoField label="Went to Hospital?" value={form.getValues("didGoToHospital")} />
                         <InfoField label="Hospital Name" value={form.getValues("hospitalName")} />
                      </>}
                    </CardContent>
                  </Card>

                  {/* UPDATED: Insurance & Case Info Card */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-blue-500" /> Insurance & Case Info</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {isEditing ? <> {/* Edit fields here */} </> : <>
                        <InfoField label="Date of Accident" value={form.getValues("dateOfAccident") ? format(form.getValues("dateOfAccident")!, 'PPP') : null} />
                        <InfoField label="Claim #" value={form.getValues("claimNumber")} />
                        <InfoField label="Policy #" value={form.getValues("policyNumber")} />
                        <InfoField label="Auto Insurance" value={form.getValues("autoInsuranceCompany")} />
                        <InfoField label="Health Insurance" value={form.getValues("healthInsurance")} />
                        <InfoField label="Health Insurance ID" value={form.getValues("healthInsuranceId")} />
                      </>}
                    </CardContent>
                  </Card>

                  {/* UPDATED: Legal Info Card */}
                   <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="text-amber-600" /> Legal Representation</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {isEditing ? <> {/* Edit fields here */} </> : <>
                        <InfoField label="Attorney Name" value={form.getValues("attorneyName")} />
                        <InfoField label="Attorney Phone" value={form.getValues("attorneyPhone")} />
                      </>}
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>

            {/* Right Column: Tabs (Unchanged) */}
            <div className="lg:col-span-2">
              {/* ... */}
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}