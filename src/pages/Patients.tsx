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
      // GHL data can be nested under a `contacts` property
      const response = await ghlApi.contacts.getAll();
      const allContacts = response.contacts || [];

      const patientContacts = allContacts.filter((contact: any) => 
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
        // MODIFIED: Use standard 'firstName' and 'lastName' properties
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

  const handlePatientSelect = (patient: any) => navigate(`/patients/${patient.id}`);
  const handleMessagePatient = (patient: any) => toast({ title: "Message Feature", description: `Opening conversation with ${patient.firstName || patient.name}` });
  const handleBookAppointment = (patient: any) => toast({ title: "Appointment Booking", description: `Opening appointment booking for ${patient.firstName || patient.name}` });
  
  const getPatientType = (patient: any) => {
    const tags = patient.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) return 'PIP Patient';
    if (tags.some((tag: string) => tag.toLowerCase().includes('general'))) return 'General Patient';
    return 'Patient';
  };

  const getLastAppointment = (patient: any) => { /* Mock data, unchanged */ return 'Yesterday'; };
  const getTotalVisits = (patient: any) => { /* Mock data, unchanged */ return 10; };
  const handleAddPatient = () => setIsAddPatientOpen(true);
  const handleFormChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSubmitPatient = async (e: React.FormEvent) => { /* Unchanged */ };
  
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header and Filter sections remain unchanged */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            {/* ... */}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
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
                          currentPatients.map((patient: any) => (
                            <tr key={patient.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                                      {/* MODIFIED: Use standard 'firstName' and 'lastName' */}
                                      {`${patient.firstName?.[0]?.toUpperCase() || ''}${patient.lastName?.[0]?.toUpperCase() || ''}` || patient.name?.[0] || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm cursor-pointer hover:text-medical-blue" onClick={() => handlePatientSelect(patient)}>
                                      {/* MODIFIED: Use standard 'firstName' and 'lastName' */}
                                      {patient.firstName && patient.lastName 
                                        ? `${patient.firstName} ${patient.lastName}`
                                        : patient.name || "Unknown Patient"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">GHL ID: {patient.id}</p>
                                  </div>
                                </div>
                              </td>
                              {/* Other table cells remain functionally the same as they use correct properties like .phone and .email */}
                              <td className="p-4">{/* Contact Info */}</td>
                              <td className="p-4">{/* Type Badge */}</td>
                              <td className="p-4">{/* Last Appointment */}</td>
                              <td className="p-4">{/* Total Visits */}</td>
                              <td className="p-4">{/* Action Buttons */}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              {/* Pagination Controls Section remains unchanged */}
              <div className="flex items-center justify-between pt-4">
                {/* ... */}
              </div>
            </div>
          </div>
          {/* Modals remain unchanged */}
        </div>
      </Layout>
    </AuthGuard>
  );
}