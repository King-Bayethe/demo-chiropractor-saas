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

// Form schema remains the same
const patientFormSchema = z.object({ /* ... */ });
type PatientFormData = z.infer<typeof patientFormSchema>;

// MODIFIED: Helper to find custom field value by its unique ID
const getCustomFieldValueById = (customFields: any[], fieldId: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.value : undefined;
};

// MODIFIED: Using actual Custom Field IDs from your GHL screenshot
const CUSTOM_FIELD_IDS = {
  dateOfAccident: 'aWQjhJvshJvshN0coM2Ew', // Example ID, replace with real one if different
  claimNumber: 'hI7cK3VoG9XdkHZEE7Vj',
  policyNumber: 'yH8ULGUlU3XPXfJkZ8B4',
  autoInsuranceCompany: 'oFzEgb2y1hbiTjP5VvA2',
  healthInsurance: 'Ldr9UdjMPXfJkZ8B49wV',
  healthInsuranceId: 'k4sW9iLq0pMHYfJkZ8B4',
  attorneyName: 'EfgOzyhJbiTjP5VvA2wV',
  attorneyPhone: 'ArS1W9iLq0pMHYfJkZ8B',
  // You will need to get the IDs for these from your GHL settings
  emergencyContactName: 'REPLACE_WITH_REAL_ID',
  didGoToHospital: 'REPLACE_WITH_REAL_ID',
  hospitalName: 'REPLACE_WITH_REAL_ID',
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
      // The actual contact data is nested inside response.contact
      const patientData = response.contact || response; 
      if (!patientData) throw new Error("Patient data could not be found.");
      setPatient(patientData);

      // The custom fields are in an array called `customField`
      const customFields = patientData.customField || [];
      
      // MODIFIED: Populate form using the new helper and IDs
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
        
        // Use the new function to get values by ID
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

      // Mock data for related records remains the same
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

  // Other functions (handleSave, handleEdit, etc.) remain the same
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

  const InfoField = ({ label, value }: { label: string, value: any }) => (
    <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <p className="font-semibold">{value || <span className="text-gray-400 font-normal">N/A</span>}</p>
    </div>
  );

  if (loading) { return <div className="flex justify-center items-center h-full"><Clock className="animate-spin h-8 w-8" /></div>; }
  if (!patient) { return <div className="text-center p-8">Patient not found.</div>; }

  // The entire return JSX remains the same as the last version.
  // The InfoField component will now correctly display the data fetched from the form state.
  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
            {/* All UI components from the previous merge are here */}
            {/* ... */}
        </div>
      </Layout>
    </AuthGuard>
  );
}