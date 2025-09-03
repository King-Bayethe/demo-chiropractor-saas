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
  Activity,
  MoreVertical,
  Trash2,
  Languages
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
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const { patients, loading, error, fetchPatients, syncWithGHL, createPatient, updatePatient, deletePatient } = usePatients();
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
        toast({ title: "Success", description: "Cash patient created successfully!" });
        fetchPatients(); // Refresh the patient list
      } else {
        toast({ title: "Error", description: "Failed to create patient from cash form.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to create cash patient:', error);
      toast({ title: "Error", description: "Failed to create patient. Please try again.", variant: "destructive" });
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
        insurance_provider: formData.insuranceName || undefined,
      };
      
      await createPatient(patientData);
      
      toast({ title: "Success", description: "Patient added successfully!" });
      setIsAddPatientOpen(false);
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast({ title: "Error", description: "Failed to add patient. Please try again.", variant: "destructive" });
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
        description: "Patient deleted successfully!",
      });
      setDeletePatientId(null);
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
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
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className={cn("flex-shrink-0 space-y-6 bg-background border-b border-border/50",
            isMobile ? "p-4" : "p-6"
          )}>
            <div className={cn("flex justify-between",
              isMobile ? "flex-col space-y-4" : "items-center"
            )}>
              <div>
                <h1 className={cn("font-bold text-foreground",
                  isMobile ? "text-xl" : "text-3xl"
                )}>Patients</h1>
                <p className={cn("text-muted-foreground",
                  isMobile ? "text-sm" : ""
                )}>Manage patient records and treatment history</p>
              </div>
              <div className={cn("flex justify-end",
                isMobile ? "w-full" : ""
              )}>
                <Button 
                  size={isMobile ? "default" : "sm"} 
                  onClick={handleAddPatient}
                  className={cn(isMobile ? "w-full" : "")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className={cn("space-y-4",
                  isMobile ? "" : "lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4"
                )}>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder={isMobile ? "Search patients..." : "Search patients by name, phone, email..."} 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className={cn("flex space-x-2",
                    isMobile ? "grid grid-cols-2 gap-2 space-x-0" : "items-center"
                  )}>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className={cn(isMobile ? "text-sm" : "w-40")}>
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
                      <SelectTrigger className={cn(isMobile ? "text-sm" : "w-32")}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={cn("flex space-x-2",
                    isMobile ? "flex-wrap gap-1" : "items-center"
                  )}>
                    <Badge variant="secondary" className={cn(isMobile ? "text-xs" : "")}>
                      Total: {patients.length}
                    </Badge>
                    {!isMobile && (
                      <>
                        <Badge variant="outline" className="bg-case-pip/10 text-case-pip">
                          PIP: {filteredPatients.filter((p: any) => getPatientType(p) === 'PIP').length}
                        </Badge>
                        <Badge variant="outline" className="bg-case-insurance/10 text-case-insurance">
                          Insurance: {filteredPatients.filter((p: any) => getPatientType(p) === 'Insurance').length}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className={cn("flex-1 min-h-0 overflow-auto",
            isMobile ? "px-4 py-4" : "px-6 py-6"
          )}>
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className={cn(isMobile ? "p-4" : "")}>
                <CardTitle className={cn(isMobile ? "text-lg" : "")}>
                  All Patients ({filteredPatients.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isMobile ? (
                  // Mobile Card View
                  <div className="space-y-3 p-4">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
                    ) : currentPatients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        {searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No patients match your filters" : "No patients found"}
                      </div>
                    ) : (
                      currentPatients.map((patient: Patient) => {
                        const patientType = getPatientType(patient);
                        const caseTypeDisplay = getCaseTypeDisplayName(patientType);
                        const caseTypeVariant = getCaseTypeVariant(patientType);
                        const displayPhone = patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone;
                        return (
                          <Card key={patient.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-sm">
                                      {`${patient.first_name?.[0]?.toUpperCase() || ''}${patient.last_name?.[0]?.toUpperCase() || ''}` || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm cursor-pointer hover:text-medical-blue truncate" onClick={() => handlePatientSelect(patient)}>
                                      {[patient.first_name, patient.last_name].filter(Boolean).join(' ') || "Unknown Patient"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">ID: {patient.id.slice(-8)}</p>
                                  </div>
                                </div>
                                <Badge className={cn("text-xs", caseTypeVariant)}>
                                  {caseTypeDisplay}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                {displayPhone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs">{displayPhone}</span>
                                  </div>
                                )}
                                {patient.email && (
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-medical-blue truncate">{patient.email}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs">{getLastAppointment(patient)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Activity className="w-3 h-3 text-success" />
                                    <span className="text-xs font-medium">{getTotalVisits(patient)} visits</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Languages className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs">{patient.preferred_language || 'English'}</span>
                                  </div>
                                </div>
                              </div>
                              
                               <div className="flex space-x-1 mt-3 pt-3 border-t">
                                 <Button variant="ghost" size="sm" onClick={() => handleMessagePatient(patient)} className="flex-1 text-xs px-2 py-1">
                                   <MessageSquare className="w-3 h-3 mr-1" />Message
                                 </Button>
                                 <Button variant="ghost" size="sm" onClick={() => handleBookAppointment(patient)} className="flex-1 text-xs px-2 py-1">
                                   <Calendar className="w-3 h-3 mr-1" />Book
                                 </Button>
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   onClick={() => setDeletePatientId(patient.id)} 
                                   className="text-xs px-2 py-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                 >
                                   <Trash2 className="w-3 h-3" />
                                 </Button>
                               </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                ) : (
                  // Desktop Table View
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50 bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm">Patient</th>
                          <th className="text-left p-4 font-medium text-sm">Contact</th>
                          <th className="text-left p-4 font-medium text-sm">Type</th>
                          <th className="text-left p-4 font-medium text-sm">Last Appointment</th>
                          <th className="text-left p-4 font-medium text-sm">Total Visits</th>
                          <th className="text-left p-4 font-medium text-sm">Language</th>
                          <th className="text-left p-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading patients...</td></tr>
                        ) : currentPatients.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">{searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No patients match your filters" : "No patients found"}</td></tr>
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
                                  <Languages className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{patient.preferred_language || 'English'}</span>
                                </div>
                              </td>
                               <td className="p-4">
                                 <div className="flex items-center space-x-1">
                                   <Button variant="ghost" size="sm" onClick={() => handleMessagePatient(patient)}><MessageSquare className="w-4 h-4 mr-1" />Message</Button>
                                   <Button variant="ghost" size="sm" onClick={() => handleBookAppointment(patient)}><Calendar className="w-4 h-4 mr-1" />Book</Button>
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     onClick={() => setDeletePatientId(patient.id)}
                                     className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </div>
                                 </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fixed Footer */}
          <div className={cn("flex-shrink-0 bg-background border-t border-border/50",
            isMobile ? "flex flex-col space-y-2 p-3" : "flex items-center justify-between p-4"
          )}>
            <div className={cn("text-muted-foreground",
              isMobile ? "text-xs text-center" : "text-sm"
            )}>
              {filteredPatients.length > 0 ? 
                `Showing ${indexOfFirstPatient + 1} to ${Math.min(indexOfLastPatient, filteredPatients.length)} of ${filteredPatients.length} patients` : 
                'No patients'
              }
            </div>
            {filteredPatients.length > 0 && (
              <div className={cn("flex space-x-4",
                isMobile ? "items-center justify-center" : "items-center"
              )}>
                <div className={cn("flex space-x-2",
                  isMobile ? "items-center" : "items-center"
                )}>
                  <span className={cn("text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>Rows per page:</span>
                  <Select value={patientsPerPage.toString()} onValueChange={(value) => setPatientsPerPage(Number(value))}>
                    <SelectTrigger className={cn(isMobile ? "w-16 h-8 text-xs" : "w-20")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn("flex space-x-2",
                  isMobile ? "" : "items-center"
                )}>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(isMobile ? "px-2 py-1 text-xs" : "")}
                  >
                    Previous
                  </Button>
                  <span className={cn("text-muted-foreground flex items-center",
                    isMobile ? "text-xs px-2" : "text-sm px-4"
                  )}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(isMobile ? "px-2 py-1 text-xs" : "")}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Patient Dialog */}
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto",
            isMobile ? "w-[95vw] p-0" : ""
          )}>
            <LeadIntakeForm 
              onSubmit={handleSubmitPatient} 
              onCancel={handleCancelAddPatient} 
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletePatientId} onOpenChange={() => setDeletePatientId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the patient record and all associated data.
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
