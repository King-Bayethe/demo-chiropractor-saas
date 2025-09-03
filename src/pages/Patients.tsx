import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";
import { useToast } from "@/hooks/use-toast";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useNavigate } from "react-router-dom";
import { mapSupabasePatientToListItem, getPatientType, getCaseTypeVariant, getCaseTypeDisplayName } from "@/utils/patientMapping";
import { createPatientFromCashForm } from "@/utils/createCashPatient";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Filter, Plus, Phone, Mail, Calendar, FileText, MessageSquare, User, Clock, Activity, MoreVertical, Trash2 } from "lucide-react";
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
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    toast
  } = useToast();
  const {
    patients,
    loading,
    error,
    fetchPatients,
    syncWithGHL,
    createPatient,
    updatePatient,
    deletePatient
  } = usePatients();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, selectedType, selectedStatus]);
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load patient data.",
        variant: "destructive"
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
        return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
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
  const handleBookAppointment = (patient: Patient) => {
    // Navigate to calendar with patient pre-selected
    navigate(`/calendar?patientId=${patient.id}`);
  };
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
  const handleCreateCashPatient = async () => {
    setIsSubmitting(true);
    try {
      const result = await createPatientFromCashForm();
      if (result.success) {
        toast({
          title: "Success",
          description: "Cash patient created successfully!"
        });
        fetchPatients(); // Refresh the patient list
      } else {
        toast({
          title: "Error",
          description: "Failed to create patient from cash form.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create cash patient:', error);
      toast({
        title: "Error",
        description: "Failed to create patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmitPatient = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const patientData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        preferred_language: formData.language || undefined,
        case_type: formData.caseType || undefined,
        attorney_name: formData.referredBy || undefined,
        insurance_provider: formData.insuranceName || undefined
      };
      await createPatient(patientData);
      toast({
        title: "Success",
        description: "Patient added successfully!"
      });
      setIsAddPatientOpen(false);
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancelAddPatient = () => {
    setIsAddPatientOpen(false);
  };
  const handleDeletePatient = async () => {
    if (!deletePatientId) return;
    setIsDeleting(true);
    try {
      await deletePatient(deletePatientId);
      toast({
        title: "Success",
        description: "Patient deleted successfully!"
      });
      setDeletePatientId(null);
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                <p className="text-muted-foreground">
                  Manage your patient records and information
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAddPatient} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Patient
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export Records
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search patients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pip">PIP</SelectItem>
                    <SelectItem value="lop">LOP</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Patients Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : currentPatients.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first patient."}
              </p>
              {!searchTerm && selectedType === "all" && selectedStatus === "all" && (
                <Button onClick={handleAddPatient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Patient
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPatients.map((patient) => {
                const patientType = getPatientType(patient);
                const lastAppointment = getLastAppointment(patient);
                const totalVisits = getTotalVisits(patient);

                return (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {`${patient.first_name?.charAt(0) || ''}${patient.last_name?.charAt(0) || ''}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 
                                className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handlePatientSelect(patient)}
                              >
                                {patient.first_name} {patient.last_name}
                              </h3>
                              <Badge className={`text-xs ${getCaseTypeVariant(patientType)}`}>
                                {getCaseTypeDisplayName(patientType)}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {patient.email && (
                                <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {patient.email}
                                </p>
                              )}
                              {(patient.phone || patient.cell_phone) && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {patient.phone || patient.cell_phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Last Visit</p>
                            <p className="font-medium">{lastAppointment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Total Visits</p>
                            <p className="font-medium">{totalVisits}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBookAppointment(patient)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Book
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMessagePatient(patient)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeletePatientId(patient.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add Patient Dialog */}
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogContent className="max-w-2xl">
            <LeadIntakeForm
              onSubmit={handleSubmitPatient}
              onCancel={handleCancelAddPatient}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Patient Dialog */}
        <AlertDialog open={!!deletePatientId} onOpenChange={() => setDeletePatientId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Patient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this patient? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePatient}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
    </AuthGuard>
  );
}