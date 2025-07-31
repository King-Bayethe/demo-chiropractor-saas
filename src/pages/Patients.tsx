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
import { useGHLApi } from "@/hooks/useGHLApi";
import { useNavigate } from "react-router-dom";
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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // NEW: State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(20);

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
        const name = `${patient.firstNameLowerCase || ''} ${patient.lastNameLowerCase || ''}`.toLowerCase();
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
    // NEW: Reset to page 1 whenever filters change
    setCurrentPage(1);
  };

  // Other functions (handlePatientSelect, getPatientType, etc.) remain unchanged
  const handlePatientSelect = (patient: any) => navigate(`/patients/${patient.id}`);
  const handleMessagePatient = (patient: any) => { /* ... */ };
  const handleBookAppointment = (patient: any) => { /* ... */ };
  const getPatientType = (patient: any) => {
    if (patient.tags?.some((tag: string) => tag.toLowerCase().includes('treatment'))) {
      return 'Treatment Patient';
    }
    if (patient.tags?.some((tag: string) => tag.toLowerCase().includes('consultation'))) {
      return 'Consultation';
    }
    return 'General Patient';
  };
  const getLastAppointment = (patient: any) => { /* ... */ };
  const getTotalVisits = (patient: any) => { /* ... */ };
  const handleAddPatient = () => { /* ... */ };
  const handleFormChange = (field: string, value: string) => { /* ... */ };
  const handleSubmitPatient = async (e: React.FormEvent) => { /* ... */ };

  // NEW: Pagination Logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section (Unchanged) */}
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

            {/* Search and Filters (Unchanged) */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                {/* ... filter inputs ... */}
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
              
              {/* Patients Table */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50 bg-muted/30">
                        {/* ... table headers ... */}
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">
                              Loading patients...
                            </td>
                          </tr>
                        ) : currentPatients.length === 0 ? ( // MODIFIED: Check currentPatients length
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">
                              {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                                ? "No patients match your filters" 
                                : "No patients found"}
                            </td>
                          </tr>
                        ) : (
                          // MODIFIED: Map over currentPatients instead of filteredPatients
                          currentPatients.map((patient: any) => (
                            <tr key={patient.id} className="hover:bg-muted/20 transition-colors">
                              {/* ... table cells for each patient ... */}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* NEW: Pagination Controls */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{indexOfFirstPatient + 1}</strong>-<strong>{Math.min(indexOfLastPatient, filteredPatients.length)}</strong> of <strong>{filteredPatients.length}</strong> patients
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={`${patientsPerPage}`}
                      onValueChange={(value) => {
                        setPatientsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={patientsPerPage} />
                      </SelectTrigger>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modals (Add Patient, Profile) remain unchanged */}
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            {/* ... */}
          </Dialog>
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            {/* ... */}
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}