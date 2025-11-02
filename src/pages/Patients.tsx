import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SimplePatientForm } from "@/components/SimplePatientForm";
import { useToast } from "@/hooks/use-toast";
import { usePatients, Patient } from "@/hooks/usePatients";
import { usePatientStats } from "@/hooks/usePatientStats";
import { PatientStatsCards } from "@/components/patients/PatientStatsCards";
import { PatientFilters } from "@/components/patients/PatientFilters";
import { PatientsTable } from "@/components/patients/PatientsTable";
import { useNavigate } from "react-router-dom";
import { getPatientType } from "@/utils/patientMapping";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Patients() {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const { patients, loading, error, fetchPatients, createPatient, deletePatient } = usePatients();
  const stats = usePatientStats(patients);
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
  };

  const handlePatientSelect = (patient: Patient) => navigate(`/patients/${patient.id}`);
  const handleMessagePatient = (patient: Patient) => toast({ 
    title: "Message Feature", 
    description: `Opening conversation with ${patient.first_name || 'Unknown Patient'}` 
  });
  const handleBookAppointment = (patient: Patient) => navigate(`/calendar?patientId=${patient.id}`);
  const handleAddPatient = () => setIsAddPatientOpen(true);
  
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

  const insuranceCount = filteredPatients.filter(p => getPatientType(p) === 'Private Insurance' || getPatientType(p) === 'Insurance').length;
  const selfPayCount = filteredPatients.filter(p => getPatientType(p) === 'Self-Pay' || getPatientType(p) === 'Cash Plan').length;

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Hero Header */}
        <div className={cn(
          "flex-shrink-0 space-y-6 bg-gradient-to-br from-muted/30 via-background to-muted/20",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className={cn("flex justify-between", isMobile ? "flex-col space-y-4" : "items-center")}>
            <div>
              <h1 className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                Patient Management
              </h1>
              <p className={cn("text-muted-foreground mt-2", isMobile ? "text-sm" : "text-lg")}>
                Manage patient records and treatment history
              </p>
            </div>
            <Button onClick={handleAddPatient} className={cn(isMobile && "w-full")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>

          {/* Stats Cards */}
          <PatientStatsCards
            totalActive={stats.totalActive}
            newThisMonth={stats.newThisMonth}
            growthPercentage={stats.growthPercentage}
            insuranceCoverage={stats.insuranceCoverage}
            avgVisits={stats.avgVisits}
          />

          {/* Filters */}
          <PatientFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            totalCount={patients.length}
            filteredCount={filteredPatients.length}
            insuranceCount={insuranceCount}
            selfPayCount={selfPayCount}
          />
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 min-h-0 overflow-auto", isMobile ? "p-4" : "p-6")}>
          <PatientsTable
            patients={filteredPatients}
            loading={loading}
            onPatientSelect={handlePatientSelect}
            onMessagePatient={handleMessagePatient}
            onBookAppointment={handleBookAppointment}
            onDeletePatient={setDeletePatientId}
            searchTerm={searchTerm}
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onAddPatient={handleAddPatient}
          />
        </div>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
