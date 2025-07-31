import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  MessageSquare,
  User,
  Clock,
  Activity
} from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(20);
  
  // NEW: State to hold detailed data (like appointments) for patients
  const [detailedPatientData, setDetailedPatientData] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'lead',
    patientType: 'general',
    notes: ''
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, selectedType, selectedStatus]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await ghlApi.contacts.getAll();
      const patientContacts = (data.contacts || []).filter((contact: any) => 
        contact.tags?.some((tag: string) => 
          tag.toLowerCase().includes('patient') || 
          tag.toLowerCase().includes('treatment')
        ) || !contact.tags?.length
      );
      setPatients(patientContacts);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data from GoHighLevel API.",
        variant: "destructive",
      });
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter((patient: any) => {
        const name = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = (patient.phone || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((patient: any) => {
        const patientType = getPatientType(patient);
        return patientType.toLowerCase().includes(selectedType.toLowerCase());
      });
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "inactive") {
        filtered = [];
      }
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  };
  
  // Pagination Logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = useMemo(() => filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient), [filteredPatients, indexOfFirstPatient, indexOfLastPatient]);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // NEW: useEffect to fetch details for visible patients
  useEffect(() => {
    const fetchDetailsForCurrentPage = async () => {
      const patientsToFetch = currentPatients.filter(p => !detailedPatientData[p.id]);

      if (patientsToFetch.length > 0) {
        const promises = patientsToFetch.map(patient =>
          ghlApi.appointments.get({ contactId: patient.id })
            .then(response => ({
              id: patient.id,
              appointments: response.events || []
            }))
            .catch(error => {
              console.error(`Failed to fetch appointments for ${patient.id}`, error);
              return { id: patient.id, appointments: [] };
            })
        );

        const results = await Promise.all(promises);
        const newDetails = results.reduce((acc, result) => {
          acc[result.id] = { appointments: result.appointments };
          return acc;
        }, {});

        setDetailedPatientData(prev => ({ ...prev, ...newDetails }));
      }
    };

    if (currentPatients.length > 0 && ghlApi.appointments) {
      fetchDetailsForCurrentPage();
    }
  }, [currentPatients, ghlApi.appointments]);

  const handlePatientSelect = (patient: any) => navigate(`/patients/${patient.id}`);
  const handleMessagePatient = (patient: any) => toast({ title: "Message Feature", description: `Opening conversation with ${patient.firstName || patient.name}` });
  const handleBookAppointment = (patient: any) => toast({ title: "Appointment Booking", description: `Opening appointment booking for ${patient.firstName || patient.name}` });
  
  const getPatientType = (patient: any) => {
    const tags = patient.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) return 'PIP Patient';
    if (tags.some((tag: string) => tag.toLowerCase().includes('general'))) return 'General Patient';
    return 'Patient';
  };

  // MODIFIED: Functions now use dynamic data
  const getLastAppointment = (patientId: string) => {
    const details = detailedPatientData[patientId];
    if (!details || !details.appointments || details.appointments.length === 0) return "N/A";
    const sorted = [...details.appointments].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    return format(new Date(sorted[0].startTime), 'MMM d, yyyy');
  };

  const getTotalVisits = (patientId: string) => {
    const details = detailedPatientData[patientId];
    if (!details || !details.appointments) return "N/A";
    const completedStatuses = ['confirmed', 'showed', 'completed'];
    return details.appointments.filter(apt => completedStatuses.includes(apt.status)).length;
  };

  const handleAddPatient = () => setIsAddPatientOpen(true);
  const handleFormChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSubmitPatient = async (e: React.FormEvent) => { /* ... */ };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Patients</h1>
                <p className="text-muted-foreground">Manage patient records and treatment history</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" />Export Records</Button>
                <Button size="sm" onClick={handleAddPatient}><Plus className="w-4 h-4 mr-2" />Add Patient</Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Search patients by name, phone, email..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="pip">PIP Patients</SelectItem>
                        <SelectItem value="general">General Patients</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Total: {patients.length}</Badge>
                    <Badge variant="outline" className="bg-medical-teal/10 text-medical-teal">PIP: {filteredPatients.filter((p: any) => getPatientType(p) === 'PIP Patient').length}</Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary">General: {filteredPatients.filter((p: any) => getPatientType(p) === 'General Patient').length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto px-6 py-6">
            <Card className="border border-border/50 shadow-sm">
              <CardHeader><CardTitle>All Patients ({filteredPatients.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border/50 bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Patient</th>
                        <th className="text-left p-4 font-medium text-sm">Contact</th>
                        <th className="text-left p-4 font-medium text-sm">Type</th>
                        <th className="text-left p-4 font-medium text-sm">Last Appointment</th>
                        <th className="text-left p-4 font-medium text-sm">Total Visits</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {loading ? (
                        <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading patients...</td></tr>
                      ) : currentPatients.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No patients match your filters" : "No patients found"}</td></tr>
                      ) : (
                        currentPatients.map((patient: any) => (
                          <tr key={patient.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">{`${patient.firstName?.[0]?.toUpperCase() || ''}${patient.lastName?.[0]?.toUpperCase() || ''}` || patient.name?.[0] || 'P'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm cursor-pointer hover:text-medical-blue" onClick={() => handlePatientSelect(patient)}>
                                    {patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : patient.name || "Unknown Patient"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">GHL ID: {patient.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                {patient.phone && <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{patient.phone}</span></div>}
                                {patient.email && <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-medical-blue">{patient.email}</span></div>}
                              </div>
                            </td>
                            <td className="p-4"><Badge variant="secondary" className={getPatientType(patient) === 'PIP Patient' ? "bg-medical-teal/10 text-medical-teal" : "bg-primary/10 text-primary"}>{getPatientType(patient)}</Badge></td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{detailedPatientData[patient.id] ? getLastAppointment(patient.id) : 'Loading...'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-success" />
                                <span className="font-medium text-sm">{detailedPatientData[patient.id] ? getTotalVisits(patient.id) : 'Loading...'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleMessagePatient(patient)}><MessageSquare className="w-4 h-4 mr-1" />Message</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleBookAppointment(patient)}><Calendar className="w-4 h-4 mr-1" />Book</Button>
                                <Button variant="ghost" size="sm" onClick={() => handlePatientSelect(patient)}><User className="w-4 h-4 mr-1" />View</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-background border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {filteredPatients.length > 0 ? `Showing ${indexOfFirstPatient + 1} to ${Math.min(indexOfLastPatient, filteredPatients.length)} of ${filteredPatients.length} patients` : 'No patients'}
            </div>
            {filteredPatients.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select value={`${patientsPerPage}`} onValueChange={(value) => { setPatientsPerPage(Number(value)); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={patientsPerPage} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">Page {currentPage} of {totalPages || 1}</div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
                </div>
              </div>
            )}
          </div>

          {/* Add Patient Modal */}
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>{/* ... */}</Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}
