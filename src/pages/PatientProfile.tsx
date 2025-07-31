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
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-semibold">
                    {patientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{patientName}</h1>
                  <p className="text-muted-foreground">Patient ID: {patientId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(handleSave)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVisits}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lastVisit ? format(lastVisit, 'MMM dd') : 'None'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {form.getValues('nextAppointment') ? format(form.getValues('nextAppointment')!, 'MMM dd') : 'None'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Patient Information</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Personal Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
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
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
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
                                    <CalendarComponent
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
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                            <p className="text-sm">{patientName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                            <p className="text-sm">
                              {form.getValues('dateOfBirth') ? format(form.getValues('dateOfBirth')!, 'PPP') : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                            <p className="text-sm">{patient?.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-sm">{patient?.email || 'Not provided'}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Address & Emergency Contact</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <FormField
                            control={form.control}
                            name="streetAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
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
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                            <p className="text-sm">
                              {[patient?.address1, patient?.city, patient?.state, patient?.postalCode]
                                .filter(Boolean)
                                .join(', ') || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                            <p className="text-sm">
                              {form.getValues('emergencyContactName') || 'Not provided'}
                              {form.getValues('emergencyContactPhone') && (
                                <span className="block">{form.getValues('emergencyContactPhone')}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Form>
            </TabsContent>

            {/* Other tabs remain the same but simplified for now */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Appointment management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="soap">
              <Card>
                <CardHeader>
                  <CardTitle>SOAP Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">SOAP notes management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Billing management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">File management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
}