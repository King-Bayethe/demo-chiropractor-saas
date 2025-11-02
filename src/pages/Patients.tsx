import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
// AuthGuard removed for public portfolio
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimplePatientForm } from "@/components/SimplePatientForm";
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useNavigate } from "react-router-dom";
import { mapSupabasePatientToListItem, getPatientType, getCaseTypeVariant, getCaseTypeDisplayName } from "@/utils/patientMapping";
import { createPatientFromCashForm } from "@/utils/createCashPatient";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Search, 
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
  Languages,
  Users,
  Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
        email: formData.email?.trim() || undefined,
        phone: formData.phone.trim(),
        date_of_birth: formData.dateOfBirth || undefined,
        preferred_language: formData.language || 'en',
        case_type: formData.paymentMethod || undefined,
        attorney_name: formData.referralSource || undefined,
        notes: formData.notes?.trim() || undefined,
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
            <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Search className="text-muted-foreground w-5 h-5" />
                    </div>
                    <Input 
                      placeholder={isMobile ? "Search patients..." : "Search by name, phone, or email..."} 
                      className="pl-11 h-12 text-base bg-background border-2 focus:border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className={cn("flex gap-2",
                    isMobile ? "flex-col" : "flex-wrap"
                  )}>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className={cn(isMobile ? "text-sm" : "w-44")}>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Private Insurance">Private Insurance</SelectItem>
                        <SelectItem value="Medicare">Medicare/Medicaid</SelectItem>
                        <SelectItem value="Self-Pay">Self-Pay (Cash)</SelectItem>
                        <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                        <SelectItem value="Workers Compensation">Workers Comp</SelectItem>
                        <SelectItem value="PIP">Auto Insurance (PIP)</SelectItem>
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

                  <div className={cn("flex flex-wrap gap-2 pt-2 border-t",
                    isMobile ? "justify-center" : ""
                  )}>
                    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
                      <Users className="mr-2 h-4 w-4" />
                      Total: {patients.length}
                    </Badge>
                    <Badge className="px-3 py-1.5 text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0">
                      Insurance: {filteredPatients.filter((p: any) => getPatientType(p) === 'Private Insurance' || getPatientType(p) === 'Insurance').length}
                    </Badge>
                    <Badge className="px-3 py-1.5 text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0">
                      Self-Pay: {filteredPatients.filter((p: any) => getPatientType(p) === 'Self-Pay' || getPatientType(p) === 'Cash Plan').length}
                    </Badge>
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
                      <ShimmerSkeleton count={5} />
                    ) : currentPatients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="relative mb-6">
                          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Users className="h-16 w-16 text-primary" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                            <Plus className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-semibold mb-2">
                          {searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No Matches Found" : "No Patients Yet"}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                          {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                            ? "Try adjusting your filters to find what you're looking for."
                            : "Start building your patient database by adding your first patient record. You can always add more details later."
                          }
                        </p>
                        
                        {!searchTerm && selectedType === "all" && selectedStatus === "all" && (
                          <div className="flex gap-3">
                            <Button onClick={handleAddPatient}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Your First Patient
                            </Button>
                            <Button variant="outline">
                              <Upload className="mr-2 h-4 w-4" />
                              Import Patients
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      currentPatients.map((patient: Patient) => {
                        const patientType = getPatientType(patient);
                        const caseTypeDisplay = getCaseTypeDisplayName(patientType);
                        const caseTypeVariant = getCaseTypeVariant(patientType);
                        const displayPhone = patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone;
                        return (
                          <Card 
                            key={patient.id} 
                            className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                  <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-transparent group-hover:ring-primary/30 transition-all">
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                                      {`${patient.first_name?.[0]?.toUpperCase() || ''}${patient.last_name?.[0]?.toUpperCase() || ''}` || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {[patient.first_name, patient.last_name].filter(Boolean).join(' ') || "Unknown Patient"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    ID: {patient.id.slice(-8)}
                                  </p>
                                  <Badge className={cn("mt-2 text-xs font-medium border-0 shadow-sm", caseTypeVariant)}>
                                    {caseTypeDisplay}
                                  </Badge>
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientSelect(patient); }}>
                                      <User className="mr-2 h-4 w-4" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMessagePatient(patient); }}>
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      Send Message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleBookAppointment(patient); }}>
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Schedule Appointment
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={(e) => { e.stopPropagation(); setDeletePatientId(patient.id); }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Patient
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div className="space-y-2.5 mb-4 border-t pt-3">
                                {displayPhone && (
                                  <div className="flex items-center gap-2.5 text-sm">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-foreground">{displayPhone}</span>
                                  </div>
                                )}
                                {patient.email && (
                                  <div className="flex items-center gap-2.5 text-sm">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                                      <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-primary truncate">{patient.email}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1">Last Visit</div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {getLastAppointment(patient)}
                                  </div>
                                </div>
                                <div className="text-center border-x">
                                  <div className="text-xs text-muted-foreground mb-1">Total Visits</div>
                                  <div className="text-sm font-semibold text-success">
                                    {getTotalVisits(patient)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-1">Language</div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {patient.preferred_language || 'EN'}
                                  </div>
                                </div>
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
          <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto",
            isMobile ? "w-[95vw] p-4" : ""
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Add New Patient</h2>
                <p className="text-sm text-muted-foreground">
                  Create a new patient record. Additional details can be added later.
                </p>
              </div>
            </div>
            <SimplePatientForm 
              onSubmit={handleSubmitPatient} 
              onCancel={handleCancelAddPatient}
              isSubmitting={isSubmitting}
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
  );
}
