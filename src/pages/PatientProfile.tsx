import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Phone, Mail, CalendarIcon, FileText, MessageSquare, DollarSign,
  User, Clock, MapPin, Plus, Download, Eye, Upload, Edit, Shield, AlertTriangle, BarChart3,
  Save, X, Check
} from "lucide-react";

// Form validation schema
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
  // Custom Fields
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

// Safely gets the patient's full name
const getPatientName = (patient: any): string => {
  if (!patient) return 'Unknown Patient';
  const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
  return fullName || patient.name || 'Unknown Patient';
};

// GHL custom fields are returned as an array of objects. This finds the value by the field's name.
const getCustomFieldValue = (customFields: any[], fieldName: string): any => {
  if (!Array.isArray(customFields)) return undefined;
  const field = customFields.find(f => f.name === fieldName);
  return field ? field.value : undefined;
};

// GHL custom fields also have unique IDs. You can use IDs for more reliable updates.
// !! IMPORTANT: Replace these with your actual GHL Custom Field IDs !!
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
  const { patientId } = useParams<{ patientId: string }>();
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
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "", streetAddress: "", city: "", state: "",
      zipCode: "", emergencyContactName: "", emergencyContactPhone: "", medicalInsurance: "",
      autoInsurance: "", attorneyName: "", attorneyPhone: "", allergies: "",
    },
  });

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      // 1. Fetch main contact data from GHL via Supabase Edge Function
      const { contact: patientData } = await ghlApi.contacts.getById(patientId);
      if (!patientData) throw new Error("Patient not found in GHL.");
      setPatient(patientData);

      // 2. Populate form with live data, parsing custom fields correctly
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

      // 3. Initialize empty data for related information (tables don't exist yet)
      setAppointments([]);
      setSoapNotes([]);
      setInvoices([]);
      setFiles([]);

    } catch (error: any) {
      console.error('Failed to load patient data:', error);
      toast({
        title: "Error Loading Patient",
        description: error.message || "Could not retrieve patient information.",
        variant: "destructive",
      });
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: PatientFormData) => {
    if (!patientId) return;
    setSaving(true);
    try {
      // Prepare update data for GHL API
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
        // Format custom fields as an array of objects with IDs
        customField: [
          { id: CUSTOM_FIELD_IDS.emergencyContactName, value: data.emergencyContactName || '' },
          { id: CUSTOM_FIELD_IDS.emergencyContactPhone, value: data.emergencyContactPhone || '' },
          { id: CUSTOM_FIELD_IDS.medicalInsurance, value: data.medicalInsurance || '' },
          { id: CUSTOM_FIELD_IDS.autoInsurance, value: data.autoInsurance || '' },
          { id: CUSTOM_FIELD_IDS.attorneyName, value: data.attorneyName || '' },
          { id: CUSTOM_FIELD_IDS.attorneyPhone, value: data.attorneyPhone || '' },
          { id: CUSTOM_FIELD_IDS.allergies, value: data.allergies || '' },
          { id: CUSTOM_FIELD_IDS.nextAppointment, value: data.nextAppointment?.toISOString() || '' },
        ]
      };

      await ghlApi.contacts.update(patientId, updateData);
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Patient information updated successfully.",
      });
      await loadPatientData(); // Refresh all data
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      toast({
        title: "Error Saving",
        description: error.message || "Failed to update patient information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Other handlers and helper functions (getStatusColor, formatCurrency, etc.) remain the same ---
  // (handleBookAppointment, handleSendMessage, handleEdit, handleCancel)
  const handleBookAppointment = () => { /* ... */ };
  const handleSendMessage = () => { /* ... */ };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    loadPatientData(); // Re-fetch data to discard changes
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-success/10 text-success";
      case "scheduled": return "bg-medical-blue/10 text-medical-blue";
      case "confirmed": return "bg-medical-teal/10 text-medical-teal";
      case "cancelled": return "bg-destructive/10 text-destructive";
      case "paid": return "bg-success/10 text-success";
      case "pending": return "bg-yellow-500/10 text-yellow-700";
      case "overdue": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Memoized values for performance
  const patientName = useMemo(() => getPatientName(patient), [patient]);
  const lastVisit = useMemo(() => appointments[0]?.date ? new Date(appointments[0].date) : null, [appointments]);
  const totalVisits = useMemo(() => appointments.filter(apt => apt.status === 'completed').length, [appointments]);
  const unpaidInvoices = useMemo(() => invoices.filter(inv => inv.status !== 'paid'), [invoices]);

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading patient profile...</p>
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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-destructive mb-4">Patient not found or failed to load.</p>
              <Button onClick={() => navigate('/patients')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Patients
              </Button>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  // --- JSX Rendering ---
  // The JSX structure remains largely the same as your original code.
  // The important changes are in the logic above.
  // The display sections will now correctly show the live data.
  // For example, in the Personal Information display card:
  //
  // <div>
  //   <span className="text-muted-foreground">Address:</span>
  //   <div className="font-medium">
  //     {patient.address1 ? (
  //       <>
  //         {patient.address1}<br />
  //         {patient.city}, {patient.state} {patient.postalCode}
  //       </>
  //     ) : "Not specified"}
  //   </div>
  // </div>
  // This now uses the correct GHL fields (address1, postalCode, etc.).
  
  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/patients')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Patients
              </Button>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getPatientName(patient).split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{patientName}</h1>
                  <p className="text-muted-foreground">Patient ID: {patientId}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={form.handleSubmit(handleSave)} 
                    disabled={saving}
                    className="flex items-center"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Patient
                </Button>
              )}
            </div>
          </div>

          {/* Patient Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <div className="font-medium">{patient.email || "Not provided"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <div className="font-medium">{patient.phone || "Not provided"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <div className="font-medium">
                        {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "PPP") : "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <div className="font-medium">
                        {patient.address1 ? (
                          <>
                            {patient.address1}<br />
                            {patient.city}, {patient.state} {patient.postalCode}
                          </>
                        ) : "Not specified"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <div className="font-medium">
                        {getCustomFieldValue(patient.customField, 'Emergency Contact Name') || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <div className="font-medium">
                        {getCustomFieldValue(patient.customField, 'Emergency Contact Phone') || "Not provided"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleBookAppointment} className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
            <Button variant="outline" onClick={handleSendMessage} className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              View Records
            </Button>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}