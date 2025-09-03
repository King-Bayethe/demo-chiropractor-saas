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
  return;
}