import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  User,
  Clock,
  MapPin,
  Plus,
  Download,
  Eye,
  Upload
} from "lucide-react";

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
  const { toast } = useToast();
  const ghlApi = useGHLApi();

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
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-medical-blue/10 text-medical-blue text-xl font-medium">
                        {patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h2 className="text-2xl font-bold">{patientName}</h2>
                        <p className="text-muted-foreground">GHL ID: {patient.id}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {patient.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{patient.phone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-medical-blue">{patient.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {patient.tags && patient.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Visit</p>
                      <p className="font-medium">
                        {lastVisit ? lastVisit.toLocaleDateString() : 'No visits yet'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                      <p className="font-medium">{totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Primary Provider</p>
                      <p className="font-medium">Dr. Silverman</p>
                    </div>
                  </div>
                </div>
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