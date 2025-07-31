import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Phone, Mail, Calendar, CalendarIcon, FileText, MessageSquare, DollarSign,
  User, Clock, MapPin, Plus, Download, Eye, Upload, Edit, Shield, AlertTriangle,
  BarChart3, Save, X, Check
} from "lucide-react";

// Form validation schema (no changes)
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
  medicalInsurance: z.string().optional(),
  autoInsurance: z.string().optional(),
  attorneyName: z.string().optional(),
  attorneyPhone: z.string().optional(),
  allergies: z.string().optional(),
  nextAppointment: z.date().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

// --- HELPER FUNCTIONS ---

// UPDATED: Helper to get patient name from standard GHL fields
const getPatientName = (patient: any): string => {
  if (!patient) return 'Unknown Patient';
  const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
  return fullName || patient.name || 'Unknown Patient';
};

// NEW: GHL custom fields are often an array. This finds a value by its name.
// NOTE: For better performance and reliability, finding by ID is preferred if possible.
const getCustomFieldValue = (customFields: any[], fieldName: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.name?.toLowerCase() === fieldName.toLowerCase());
    return field ? field.value : undefined;
};

// NEW: Store your GHL Custom Field IDs here.
// !! IMPORTANT: You MUST replace these placeholder values with your actual IDs from GHL. !!
const CUSTOM_FIELD_IDS = {
  emergencyContactName: 'REPLACE_WITH_ID',
  emergencyContactPhone: 'REPLACE_WITH_ID',
  medicalInsurance: 'REPLACE_WITH_ID',
  autoInsurance: 'REPLACE_WITH_ID',
  attorneyName: 'REPLACE_WITH_ID',
  attorneyPhone: 'REPLACE_WITH_ID',
  allergies: 'REPLACE_WITH_ID',
  nextAppointment: 'REPLACE_WITH_ID',
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
      // UPDATED: Fetch patient details from GHL
      // The wrapper might nest the response, so we destructure { contact }
      const response = await ghlApi.contacts.getById(patientId);
      const patientData = response.contact || response; // Handle both nested and direct responses
      
      if (!patientData) {
          throw new Error("Patient data could not be found.");
      }
      setPatient(patientData);

      // UPDATED: Populate form with live data from GHL, parsing custom fields
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
        // Use the helper to get values from the customFields array
        emergencyContactName: getCustomFieldValue(patientData.customField, 'Emergency Contact Name'),
        emergencyContactPhone: getCustomFieldValue(patientData.customField, 'Emergency Contact Phone'),
        medicalInsurance: getCustomFieldValue(patientData.customField, 'Medical Insurance'),
        autoInsurance: getCustomFieldValue(patientData.customField, 'Auto Insurance'),
        attorneyName: getCustomFieldValue(patientData.customField, 'Attorney Name'),
        attorneyPhone: getCustomFieldValue(patientData.customField, 'Attorney Phone'),
        allergies: getCustomFieldValue(patientData.customField, 'Allergies'),
        nextAppointment: getCustomFieldValue(patientData.customField, 'Next Appointment')
          ? new Date(getCustomFieldValue(patientData.customField, 'Next Appointment'))
          : undefined,
      });

      // KEPT: Mock data is still used here as requested
      const mockAppointments = [
         { id: "apt-1", date: new Date(2024, 0, 20), time: "09:00 AM", provider: "Dr. Silverman", service: "Chiropractic Adjustment", status: "completed", location: "Treatment Room 1" },
         { id: "apt-2", date: new Date(2024, 0, 15), time: "02:00 PM", provider: "Dr. Silverman", service: "Initial Consultation", status: "completed", location: "Consultation Room" },
         { id: "apt-3", date: new Date(), time: "10:30 AM", provider: "Dr. Silverman", service: "Follow-up Treatment", status: "scheduled", location: "Treatment Room 1" }
      ];
      setAppointments(mockAppointments);

      const mockSOAPNotes = [
         { id: "soap-1", date: new Date(2024, 0, 20), provider: "Dr. Silverman", chiefComplaint: "Lower back pain", appointmentId: "apt-1" },
         { id: "soap-2", date: new Date(2024, 0, 15), provider: "Dr. Silverman", chiefComplaint: "Initial assessment", appointmentId: "apt-2" }
      ];
      setSoapNotes(mockSOAPNotes);

      const mockInvoices = [
        { id: "INV-001", date: new Date(2024, 0, 20), amount: 150.00, description: "Chiropractic Treatment", status: "paid" },
        { id: "INV-002", date: new Date(2024, 0, 15), amount: 200.00, description: "Initial Consultation", status: "paid" },
        { id: "INV-003", date: new Date(), amount: 150.00, description: "Follow-up Treatment", status: "pending" }
      ];
      setInvoices(mockInvoices);

      const mockFiles = [
        { id: "file-1", name: "Insurance_Card.pdf", type: "Insurance", uploadDate: new Date(2024, 0, 10), uploadedBy: "Dr. Silverman" },
        { id: "file-2", name: "X-Ray_Lumbar_Spine.jpg", type: "X-Ray", uploadDate: new Date(2024, 0, 18), uploadedBy: "Dr. Silverman" }
      ];
      setFiles(mockFiles);

    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({
        title: "Error",
        description: "Failed to load patient information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original data by re-running the load function
    if (patient) {
      loadPatientData();
    }
  };

  const handleSave = async (data: PatientFormData) => {
    setSaving(true);
    try {
      // UPDATED: Prepare update data in the correct format for GHL API
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address1: data.streetAddress, // Use address1 for GHL
        city: data.city,
        state: data.state,
        postalCode: data.zipCode,     // Use postalCode for GHL
        dateOfBirth: data.dateOfBirth?.toISOString(),
        // Format custom fields with their unique IDs for the update
        customField: Object.entries(CUSTOM_FIELD_IDS).reduce((acc: any[], [key, id]) => {
            const value = data[key as keyof PatientFormData];
            if (id !== 'REPLACE_WITH_ID') { // Only include fields with a real ID
                acc.push({ 
                    id, 
                    value: value instanceof Date ? value.toISOString() : value || '' 
                });
            }
            return acc;
        }, []),
      };

      await ghlApi.contacts.update(patientId, updateData);
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });
      // Refresh patient data from the server
      await loadPatientData();
    } catch (error) {
      console.error('Failed to update patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Other functions (handleBookAppointment, handleSendMessage, getStatusColor, etc.)
  // do not need changes.
  const handleBookAppointment = () => { /* ... */ };
  const handleSendMessage = () => { /* ... */ };
  const getStatusColor = (status: string) => { /* ... */ };
  const formatCurrency = (amount: number) => { /* ... */ };

  // The rest of the component (loading/error states and the return JSX)
  // remains the same. The UI will now be powered by the corrected data fetching logic.
  if (loading) { /* ... */ }
  if (!patient) { /* ... */ }

  const patientName = getPatientName(patient);
  const lastVisit = appointments.length > 0 ? appointments[0].date : null;
  const totalVisits = appointments.filter(apt => apt.status === 'completed').length;
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

  return (
      <AuthGuard>
          <Layout>
              {/* ... Paste your original full return() JSX here ... */}
          </Layout>
      </AuthGuard>
  );
}