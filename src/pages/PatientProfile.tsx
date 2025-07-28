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
  ArrowLeft,
  Phone, 
  Mail, 
  Calendar,
  CalendarIcon,
  FileText,
  MessageSquare,
  DollarSign,
  User,
  Clock,
  MapPin,
  Plus,
  Download,
  Eye,
  Upload,
  Edit,
  Shield,
  AlertTriangle,
  BarChart3,
  Save,
  X,
  Check
} from "lucide-react";

// Form validation schema
const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
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

// Helper function to safely get patient name
const getPatientName = (patient: any): string => {
  if (!patient) return 'Unknown Patient';
  
  const firstName = patient.firstNameLowerCase || '';
  const lastName = patient.lastNameLowerCase || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || patient.name || 'Unknown Patient';
};

export default function PatientProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [soapNotes, setSoapNotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const ghlApi = useGHLApi();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalInsurance: "",
      autoInsurance: "",
      attorneyName: "",
      attorneyPhone: "",
      allergies: "",
    },
  });

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Load patient details from GHL
      const patientData = await ghlApi.contacts.getById(patientId);
      setPatient(patientData);

      // Populate form with patient data
      if (patientData) {
        form.reset({
          firstName: patientData.firstNameLowerCase || "",
          lastName: patientData.lastNameLowerCase || "",
          email: patientData.email || "",
          phone: patientData.phone || "",
          streetAddress: patientData.address?.streetAddress || "",
          city: patientData.address?.city || "",
          state: patientData.address?.state || "",
          zipCode: patientData.address?.postalCode || "",
          emergencyContactName: patientData.customFields?.emergencyContactName || "",
          emergencyContactPhone: patientData.customFields?.emergencyContactPhone || "",
          medicalInsurance: patientData.customFields?.medicalInsurance || "",
          autoInsurance: patientData.customFields?.autoInsurance || "",
          attorneyName: patientData.customFields?.attorneyName || "",
          attorneyPhone: patientData.customFields?.attorneyPhone || "",
          allergies: patientData.customFields?.allergies || "",
          dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined,
          nextAppointment: patientData.customFields?.nextAppointment ? new Date(patientData.customFields.nextAppointment) : undefined,
        });
      }
      
      // Mock appointments data - in production, this would come from GHL Calendar API
      const mockAppointments = [
        {
          id: "apt-1",
          date: new Date(2024, 0, 20),
          time: "09:00 AM",
          provider: "Dr. Silverman",
          service: "Chiropractic Adjustment",
          status: "completed",
          location: "Treatment Room 1"
        },
        {
          id: "apt-2",
          date: new Date(2024, 0, 15),
          time: "02:00 PM", 
          provider: "Dr. Silverman",
          service: "Initial Consultation",
          status: "completed",
          location: "Consultation Room"
        },
        {
          id: "apt-3",
          date: new Date(2024, 0, 25),
          time: "10:30 AM",
          provider: "Dr. Silverman", 
          service: "Follow-up Treatment",
          status: "scheduled",
          location: "Treatment Room 1"
        }
      ];
      setAppointments(mockAppointments);

      // Mock SOAP notes - in production, this would be filtered by patient ID from Supabase
      const mockSOAPNotes = [
        {
          id: "soap-1",
          date: new Date(2024, 0, 20),
          provider: "Dr. Silverman",
          chiefComplaint: "Lower back pain",
          appointmentId: "apt-1"
        },
        {
          id: "soap-2", 
          date: new Date(2024, 0, 15),
          provider: "Dr. Silverman",
          chiefComplaint: "Initial assessment",
          appointmentId: "apt-2"
        }
      ];
      setSoapNotes(mockSOAPNotes);

      // Mock invoices - in production, this would be filtered by patient ID
      const mockInvoices = [
        {
          id: "INV-001",
          date: new Date(2024, 0, 20),
          amount: 150.00,
          description: "Chiropractic Treatment",
          status: "paid"
        },
        {
          id: "INV-002",
          date: new Date(2024, 0, 15), 
          amount: 200.00,
          description: "Initial Consultation",
          status: "paid"
        },
        {
          id: "INV-003",
          date: new Date(2024, 0, 25),
          amount: 150.00,
          description: "Follow-up Treatment", 
          status: "pending"
        }
      ];
      setInvoices(mockInvoices);

      // Mock files
      const mockFiles = [
        {
          id: "file-1",
          name: "Insurance_Card.pdf",
          type: "Insurance",
          uploadDate: new Date(2024, 0, 10),
          uploadedBy: "Dr. Silverman"
        },
        {
          id: "file-2",
          name: "X-Ray_Lumbar_Spine.jpg", 
          type: "X-Ray",
          uploadDate: new Date(2024, 0, 18),
          uploadedBy: "Dr. Silverman"
        }
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

  const handleBookAppointment = () => {
    // Navigate to calendar page with patient pre-filled
    toast({
      title: "Appointment Booking",
      description: `Opening appointment booking for ${getPatientName(patient)}`,
    });
  };

  const handleSendMessage = () => {
    // Integrate with GHL conversations
    toast({
      title: "Message",
      description: `Opening conversation with ${getPatientName(patient)}`,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original patient data
    if (patient) {
      form.reset({
        firstName: patient.firstNameLowerCase || "",
        lastName: patient.lastNameLowerCase || "",
        email: patient.email || "",
        phone: patient.phone || "",
        streetAddress: patient.address?.streetAddress || "",
        city: patient.address?.city || "",
        state: patient.address?.state || "",
        zipCode: patient.address?.postalCode || "",
        emergencyContactName: patient.customFields?.emergencyContactName || "",
        emergencyContactPhone: patient.customFields?.emergencyContactPhone || "",
        medicalInsurance: patient.customFields?.medicalInsurance || "",
        autoInsurance: patient.customFields?.autoInsurance || "",
        attorneyName: patient.customFields?.attorneyName || "",
        attorneyPhone: patient.customFields?.attorneyPhone || "",
        allergies: patient.customFields?.allergies || "",
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
        nextAppointment: patient.customFields?.nextAppointment ? new Date(patient.customFields.nextAppointment) : undefined,
      });
    }
  };

  const handleSave = async (data: PatientFormData) => {
    try {
      setSaving(true);
      
      // Prepare update data for GHL
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: {
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          postalCode: data.zipCode,
        },
        customFields: {
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          medicalInsurance: data.medicalInsurance,
          autoInsurance: data.autoInsurance,
          attorneyName: data.attorneyName,
          attorneyPhone: data.attorneyPhone,
          allergies: data.allergies,
          nextAppointment: data.nextAppointment?.toISOString(),
        },
        dateOfBirth: data.dateOfBirth?.toISOString(),
      };

      // Update patient via GHL API
      await ghlApi.contacts.update(patientId, updateData);
      
      // Refresh patient data
      await loadPatientData();
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
              <p className="text-destructive mb-4">Patient not found</p>
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

  const patientName = getPatientName(patient);
  const lastVisit = appointments.length > 0 ? appointments[0].date : null;
  const totalVisits = appointments.filter(apt => apt.status === 'completed').length;
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Patient Profile</h1>
                  <p className="text-muted-foreground">Complete medical record and history</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleSendMessage}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" onClick={handleBookAppointment}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>

            {/* Patient Header Card */}
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-xl font-semibold">
                        {patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-3xl">{patientName}</CardTitle>
                      <div className="flex flex-col space-y-1 text-muted-foreground">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {patient.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={form.handleSubmit(handleSave)}
                          disabled={saving}
                        >
                          {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSendMessage}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" onClick={handleBookAppointment}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Personal Information */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Personal Information</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          {isEditing ? (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">First Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="h-8 text-xs" />
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
                                      <FormLabel className="text-xs">Last Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="h-8 text-xs" />
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
                                  <FormItem>
                                    <FormLabel className="text-xs">Date of Birth</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full h-8 text-xs font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              format(field.value, "PPP")
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
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
                                          className="p-3 pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="streetAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Street Address</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name="city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">City</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="h-8 text-xs" />
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
                                      <FormLabel className="text-xs">State</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="h-8 text-xs" />
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
                                    <FormLabel className="text-xs">ZIP Code</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" />
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
                                    <FormLabel className="text-xs">Emergency Contact Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" />
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
                                    <FormLabel className="text-xs">Emergency Contact Phone</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-muted-foreground">Date of Birth:</span>
                                <div className="font-medium">
                                  {form.getValues('dateOfBirth') 
                                    ? format(form.getValues('dateOfBirth')!, "PPP")
                                    : "Not specified"
                                  }
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Address:</span>
                                <div className="font-medium">
                                  {form.getValues('streetAddress') && (
                                    <>
                                      {form.getValues('streetAddress')}<br />
                                      {form.getValues('city')}, {form.getValues('state')} {form.getValues('zipCode')}
                                    </>
                                  ) || "Not specified"}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Emergency Contact:</span>
                                <div className="font-medium">
                                  {form.getValues('emergencyContactName') && (
                                    <>
                                      {form.getValues('emergencyContactName')}<br />
                                      {form.getValues('emergencyContactPhone')}
                                    </>
                                  ) || "Not specified"}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Insurance & Attorney Information */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Insurance & Attorney</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          {isEditing ? (
                            <>
                              <FormField
                                control={form.control}
                                name="medicalInsurance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Medical Insurance</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" placeholder="e.g. Blue Cross Blue Shield" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="autoInsurance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Auto Insurance</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" placeholder="e.g. State Farm" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="attorneyName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Attorney Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" placeholder="e.g. Smith & Associates Law Firm" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="attorneyPhone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Attorney Phone</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="h-8 text-xs" placeholder="(305) 555-0199" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-muted-foreground">Medical Insurance:</span>
                                <div className="font-medium">{form.getValues('medicalInsurance') || "Not specified"}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Auto Insurance:</span>
                                <div className="font-medium">{form.getValues('autoInsurance') || "Not specified"}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Attorney:</span>
                                <div className="font-medium">
                                  {form.getValues('attorneyName') && (
                                    <>
                                      {form.getValues('attorneyName')}<br />
                                      {form.getValues('attorneyPhone')}
                                    </>
                                  ) || "Not specified"}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Medical Alerts */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <h4 className="font-semibold">Medical Alerts</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          {isEditing ? (
                            <>
                              <FormField
                                control={form.control}
                                name="allergies"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Allergies</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        className="min-h-[60px] text-xs" 
                                        placeholder="e.g. Penicillin, Shellfish"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="nextAppointment"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Next Appointment</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full h-8 text-xs font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              format(field.value, "PPP")
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                          className="p-3 pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-muted-foreground">Allergies:</span>
                                <div className="font-medium">
                                  {form.getValues('allergies') ? (
                                    <div className="text-red-600">
                                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                                      {form.getValues('allergies')}
                                    </div>
                                  ) : (
                                    "None reported"
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Last Visit:</span>
                                <div className="font-medium">
                                  {lastVisit ? format(lastVisit, "PPP") : "No visits"}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Next Appointment:</span>
                                <div className="font-medium text-green-600">
                                  {form.getValues('nextAppointment') 
                                    ? format(form.getValues('nextAppointment')!, "PPP")
                                    : "Not scheduled"
                                  }
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Quick Stats (Read-only) */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Quick Stats</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Visits:</span>
                            <div className="font-medium">{totalVisits}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Outstanding Balance:</span>
                            <div className="font-medium text-orange-600">
                              {formatCurrency(unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {patient?.tags && patient.tags.length > 0 ? (
                              patient.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">No tags</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Content Area with Tabs */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto px-6 py-6">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Appointments */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Appointments</CardTitle>
                        <Button variant="ghost" size="sm">View All</Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {appointments.slice(0, 5).map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{appointment.service}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {appointment.date.toLocaleDateString()} at {appointment.time}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Outstanding Invoices */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Outstanding Invoices</CardTitle>
                        <Button variant="ghost" size="sm">View All</Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {unpaidInvoices.length > 0 ? (
                            unpaidInvoices.map((invoice) => (
                              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{invoice.id}</p>
                                    <p className="text-xs text-muted-foreground">{invoice.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                                  <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-4 text-muted-foreground">No outstanding invoices</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* SOAP Notes Summary */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent SOAP Notes</CardTitle>
                      <Button variant="ghost" size="sm">View All</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {soapNotes.map((note) => (
                          <div key={note.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{note.chiefComplaint}</p>
                                <p className="text-xs text-muted-foreground">
                                  {note.date.toLocaleDateString()} by {note.provider}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="mt-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>All Appointments</CardTitle>
                      <Button onClick={handleBookAppointment}>
                        <Plus className="w-4 h-4 mr-2" />
                        Book New Appointment
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-border/50 bg-muted/30">
                            <tr>
                              <th className="text-left p-4 font-medium text-sm">Date</th>
                              <th className="text-left p-4 font-medium text-sm">Time</th>
                              <th className="text-left p-4 font-medium text-sm">Provider</th>
                              <th className="text-left p-4 font-medium text-sm">Service</th>
                              <th className="text-left p-4 font-medium text-sm">Status</th>
                              <th className="text-left p-4 font-medium text-sm">Location</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {appointments.map((appointment) => (
                              <tr key={appointment.id} className="hover:bg-muted/20 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{appointment.date.toLocaleDateString()}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{appointment.time}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{appointment.provider}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-sm">{appointment.service}</span>
                                </td>
                                <td className="p-4">
                                  <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{appointment.location}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SOAP Notes Tab */}
                <TabsContent value="soap-notes" className="mt-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>SOAP Notes</CardTitle>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New SOAP Note
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {soapNotes.map((note) => (
                          <Card key={note.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FileText className="w-4 h-4 text-medical-blue" />
                                    <h4 className="font-medium">{note.chiefComplaint}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {note.date.toLocaleDateString()} by {note.provider}
                                  </p>
                                  {note.appointmentId && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Linked to appointment: {note.appointmentId}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4 mr-1" />
                                    Export
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="mt-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Invoices</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export All
                        </Button>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Invoice
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-border/50 bg-muted/30">
                            <tr>
                              <th className="text-left p-4 font-medium text-sm">Invoice ID</th>
                              <th className="text-left p-4 font-medium text-sm">Date</th>
                              <th className="text-left p-4 font-medium text-sm">Description</th>
                              <th className="text-left p-4 font-medium text-sm">Amount</th>
                              <th className="text-left p-4 font-medium text-sm">Status</th>
                              <th className="text-left p-4 font-medium text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                                <td className="p-4">
                                  <span className="font-medium text-sm">{invoice.id}</span>
                                </td>
                                <td className="p-4">
                                  <span className="text-sm">{invoice.date.toLocaleDateString()}</span>
                                </td>
                                <td className="p-4">
                                  <span className="text-sm">{invoice.description}</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-medium text-sm">{formatCurrency(invoice.amount)}</span>
                                </td>
                                <td className="p-4">
                                  <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files" className="mt-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Patient Files</CardTitle>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-8 h-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.type} • Uploaded {file.uploadDate.toLocaleDateString()} by {file.uploadedBy}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                        {files.length === 0 && (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No files uploaded yet</p>
                            <Button>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload First File
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}