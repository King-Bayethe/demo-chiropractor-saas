import { useState, useEffect } from "react";
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
import { usePatients, Patient } from "@/hooks/usePatients";
import { useNavigate } from "react-router-dom";
import { mapSupabasePatientToListItem, getPatientType, getCaseTypeVariant, getCaseTypeDisplayName } from "@/utils/patientMapping";
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
import { cn } from "@/lib/utils";

export default function Patients() {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(20);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const { patients, loading, error, findOrCreatePatient } = usePatients();
  const navigate = useNavigate();

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, selectedType, selectedStatus]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load patient data.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter((patient: Patient) => {
        const name = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = (patient.phone || patient.cell_phone || patient.home_phone || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((patient: Patient) => {
        const patientType = getPatientType(patient);
        return patientType === selectedType;
      });
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "inactive") {
        filtered = filtered.filter((patient: Patient) => !patient.is_active);
      } else if (selectedStatus === "active") {
        filtered = filtered.filter((patient: Patient) => patient.is_active !== false);
      }
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  };

  const handlePatientSelect = (patient: Patient) => navigate(`/patients/${patient.id}`);
  const handleMessagePatient = (patient: Patient) => toast({ 
    title: "Message Feature", 
    description: `Opening conversation with ${patient.first_name || 'Unknown Patient'}` 
  });
  const handleBookAppointment = (patient: Patient) => toast({ 
    title: "Appointment Booking", 
    description: `Opening appointment booking for ${patient.first_name || 'Unknown Patient'}` 
  });

  const getLastAppointment = (patient: Patient) => {
    if (patient.updated_at) {
      const date = new Date(patient.updated_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${diffDays > 13 ? 's' : ''} ago`;
      return `${Math.ceil(diffDays / 30)} month${diffDays > 60 ? 's' : ''} ago`;
    }
    return 'No recent appointments';
  };
  
  const getTotalVisits = (patient: Patient) => {
    // TODO: Implement actual visit count from appointments/soap_notes
    return Math.floor(Math.random() * 20) + 1;
  };
  const handleAddPatient = () => setIsAddPatientOpen(true);
  const handleFormChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.phone.trim()) {
      toast({ title: "Validation Error", description: "First name and phone number are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const patientData = {
        patient_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        patient_email: formData.email.trim() || undefined,
        patient_phone: formData.phone.trim(),
      };
      
      await findOrCreatePatient(patientData);
      
      toast({ title: "Success", description: "Patient added successfully!" });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', type: 'lead', patientType: 'general', notes: '' });
      setIsAddPatientOpen(false);
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast({ title: "Error", description: "Failed to add patient. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

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
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Records
                </Button>
                <Button size="sm" onClick={handleAddPatient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search patients by name, phone, email..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="PIP">PIP Patients</SelectItem>
                        <SelectItem value="Insurance">Insurance Patients</SelectItem>
                        <SelectItem value="Slip and Fall">Slip & Fall</SelectItem>
                        <SelectItem value="Workers Compensation">Workers Comp</SelectItem>
                        <SelectItem value="Cash Plan">Cash Plan</SelectItem>
                        <SelectItem value="Attorney Only">Attorney Only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Total: {patients.length}</Badge>
                    <Badge variant="outline" className="bg-case-pip/10 text-case-pip">
                      PIP: {filteredPatients.filter((p: any) => getPatientType(p) === 'PIP').length}
                    </Badge>
                    <Badge variant="outline" className="bg-case-insurance/10 text-case-insurance">
                      Insurance: {filteredPatients.filter((p: any) => getPatientType(p) === 'Insurance').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto px-6 py-6">
            <Card className="border border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
              </CardHeader>
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
                        currentPatients.map((patient: Patient) => {
                          const patientType = getPatientType(patient);
                          const caseTypeDisplay = getCaseTypeDisplayName(patientType);
                          const caseTypeVariant = getCaseTypeVariant(patientType);
                          const displayPhone = patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone;
                          return (
                            <tr key={patient.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                                      {`${patient.first_name?.[0]?.toUpperCase() || ''}${patient.last_name?.[0]?.toUpperCase() || ''}` || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm cursor-pointer hover:text-medical-blue" onClick={() => handlePatientSelect(patient)}>
                                      {[patient.first_name, patient.last_name].filter(Boolean).join(' ') || "Unknown Patient"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">ID: {patient.id.slice(-8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  {displayPhone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">{displayPhone}</span>
                                    </div>
                                  )}
                                  {patient.email && (
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-medical-blue">{patient.email}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge className={cn("border", caseTypeVariant)}>
                                  {caseTypeDisplay}
                                </Badge>
                              </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{getLastAppointment(patient)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-success" />
                                <span className="font-medium text-sm">{getTotalVisits(patient)}</span>
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
                          );
                        })
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
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
                </div>
              </div>
            )}
          </div>

          {/* Add Patient Modal */}
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Add New Patient</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmitPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} placeholder="Enter first name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} placeholder="Enter last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} placeholder="Enter phone number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientType">Patient Type</Label>
                  <Select value={formData.patientType} onValueChange={(value) => handleFormChange('patientType', value)}>
                    <SelectTrigger><SelectValue placeholder="Select patient type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Patient</SelectItem>
                      <SelectItem value="pip">PIP Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => handleFormChange('notes', e.target.value)} placeholder="Enter any additional notes..." rows={3} />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Patient"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}
