import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import { useEnhancedSOAPNotes } from "@/hooks/useEnhancedSOAPNotes";
import { FAMILY_HISTORY_MAPPING } from "@/utils/soapFormMapping";
import { SOAPNoteTimeline } from "@/components/soap/SOAPNoteTimeline";
import { SOAPNoteSearch } from "@/components/soap/SOAPNoteSearch";
import { SOAPNoteBulkActions } from "@/components/soap/SOAPNoteBulkActions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInYears, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import {
  mapSupabasePatientToProfileHeader,
  getPatientType,
  getCaseTypeDisplayName,
  getCaseTypeVariant
} from "@/utils/patientMapping";
import {
  ArrowLeft, Phone, Mail, Calendar as CalendarIcon, FileText, MessageSquare, DollarSign,
  User, Clock, MapPin, Plus, Download, Eye, Upload, Edit, Shield, AlertTriangle,
  BarChart3, Save, X, Check, Gavel, Car, HeartPulse, Briefcase, Lock, CheckSquare, CreditCard, IdCard,
  Activity, Scale, AlertCircle
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EnhancedDateInput } from "@/components/EnhancedDateInput";
import { PatientNotes } from "@/components/PatientNotes";
import { PatientFiles } from "@/components/PatientFiles";
import { PatientFormDisplay } from "@/components/forms/PatientFormDisplay";
import { PatientAssignment } from "@/components/PatientAssignment";

// Import new patient card components
import { DemographicsCard } from "@/components/patient/DemographicsCard";
import { MedicalHistoryCard } from "@/components/patient/MedicalHistoryCard";
import { InsuranceCard } from "@/components/patient/InsuranceCard";
import { LegalCard } from "@/components/patient/LegalCard";
import { EmergencyContactCard } from "@/components/patient/EmergencyContactCard";
import { AccidentDetailsCard } from "@/components/patient/AccidentDetailsCard";
import { PainAssessmentCard } from "@/components/patient/PainAssessmentCard";
import { SystemsReviewCard } from "@/components/patient/SystemsReviewCard";
import { CommunicationsCard } from "@/components/patient/CommunicationsCard";

// Form schema for the main patient profile
const patientFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  preferredLanguage: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional().refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), "Invalid ZIP code format"),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().refine((val) => !val || /^[\d\-\(\)\+\s]+$/.test(val), "Invalid phone number format"),
  emergencyContactRelationship: z.string().optional(),
  
  // Medical History
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  pastInjuries: z.string().optional(),
  chronicConditions: z.string().optional(),
  painLocation: z.string().optional(),
  painSeverity: z.number().min(0).max(10).optional().default(0),
  familyMedicalHistory: z.string().optional(),
  smokingStatus: z.string().optional(),
  smokingHistory: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  currentSymptoms: z.object({
    headache: z.boolean().optional(),
    neck_pain: z.boolean().optional(),
    neck_stiff: z.boolean().optional(),
    jaw_pain: z.boolean().optional(),
    tingling_arms_hands: z.boolean().optional(),
    numbness_arms_hands: z.boolean().optional(),
    pain_arms_hands: z.boolean().optional(),
    loss_strength_arms: z.boolean().optional(),
    back_pain: z.boolean().optional(),
    chest_pain_rib: z.boolean().optional(),
    shortness_breath: z.boolean().optional(),
    loss_strength_legs: z.boolean().optional(),
    pain_legs_feet: z.boolean().optional(),
    numbness_legs_feet: z.boolean().optional(),
    tingling_legs_feet: z.boolean().optional(),
    dizziness: z.boolean().optional(),
    loss_memory: z.boolean().optional(),
    loss_balance: z.boolean().optional(),
    loss_smell: z.boolean().optional(),
    fatigue: z.boolean().optional(),
    irritability: z.boolean().optional(),
    sleeping_problems: z.boolean().optional(),
    nausea: z.boolean().optional(),
    ears_ring: z.boolean().optional(),
  }).optional(),
  familyHistory: z.object({
    heart_trouble: z.boolean().optional(),
    stroke: z.boolean().optional(),
    kyphosis: z.boolean().optional(),
    diabetes: z.boolean().optional(),
    cancer: z.boolean().optional(),
    arthritis: z.boolean().optional(),
    lung_disease: z.boolean().optional(),
    osteoporosis: z.boolean().optional(),
    migraines: z.boolean().optional(),
    high_blood_pressure: z.boolean().optional(),
    scoliosis: z.boolean().optional(),
    spine_problems: z.boolean().optional(),
    alcohol_dependence: z.boolean().optional(),
    aneurysm: z.boolean().optional(),
  }).optional(),
  otherMedicalHistory: z.string().optional(),
  
  // Accident Details
  accidentDate: z.date().optional(),
  accidentTime: z.string().optional(),
  accidentDescription: z.string().optional(),
  weatherConditions: z.string().optional(),
  streetSurface: z.string().optional(),
  bodyPartHit: z.string().optional(),
  whatBodyHit: z.string().optional(),
  lossOfConsciousness: z.string().optional(),
  consciousnessDuration: z.string().optional(),
  emergencyHospitalVisit: z.boolean().optional(),
  emergencyHospitalDetails: z.string().optional(),
  previousAccidents: z.string().optional(),
  
  // Pain Assessment
  painFrequency: z.string().optional(),
  painQuality: z.string().optional(),
  symptomChanges: z.string().optional(),
  functionalLimitations: z.string().optional(),
  
  // Communications
  alternativeCommunication: z.string().optional(),
  emailConsent: z.string().optional(),
  
  // Insurance and Legal
  didGoToHospital: z.enum(["yes", "no", ""]).optional(),
  hospitalName: z.string().optional(),
  dateOfAccident: z.date().optional(),
  claimNumber: z.string().optional(),
  policyNumber: z.string().optional(),
  autoInsuranceCompany: z.string().optional(),
  healthInsurance: z.string().optional(),
  healthInsuranceId: z.string().optional(),
  attorneyName: z.string().optional(),
  attorneyPhone: z.string().optional().refine((val) => !val || /^[\d\-\(\)\+\s]+$/.test(val), "Invalid phone number format"),
  adjustersName: z.string().optional(),
  insurancePhoneNumber: z.string().optional().refine((val) => !val || /^[\d\-\(\)\+\s]+$/.test(val), "Invalid phone number format"),
  groupNumber: z.string().optional(),
  medicaidMedicareId: z.string().optional(),
  licenseState: z.string().optional(),
  caseType: z.string().optional(),
});
type PatientFormData = z.infer<typeof patientFormSchema>;

// Form schema for booking an appointment
const appointmentFormSchema = z.object({
    calendarId: z.string().optional(),
    title: z.string().optional(),
    startTime: z.date().optional(),
    notes: z.string().optional(),
});
type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Russian', label: 'Russian' },
  { value: 'German', label: 'German' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Other', label: 'Other' },
];

// Case type options
const CASE_TYPE_OPTIONS = [
  { value: 'PIP', label: 'PIP (Personal Injury Protection)' },
  { value: 'Insurance', label: 'Insurance Claim' },
  { value: 'Slip and Fall', label: 'Slip and Fall' },
  { value: 'Workers Compensation', label: 'Workers Compensation' },
  { value: 'Cash Plan', label: 'Cash Plan' },
  { value: 'Attorney Only', label: 'Attorney Only' },
];

// Helper to find custom field value by its unique ID
const getCustomFieldValueById = (customFields: any[], fieldId: string): any => {
    if (!Array.isArray(customFields)) return undefined;
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.value : undefined;
};

// Using actual Custom Field IDs from your latest GHL screenshot
const CUSTOM_FIELD_IDS = {
  emergencyContactName: 'l7yGH2qMIQ16VhyaxLMM',
  licenseState: '5GIdwGCEYt75pVaFQK99',
  passengersInVehicle: 'pRFYSE2e2bo45V7wvAZw',
  autoInsuranceCompany: 'hzC43VG8BgpXdhZn6e7A',
  claimNumber: 'yh0BLG1EUyPxPJRZJBHC',
  policyNumber: 'gNjgQtJpI71rgDR28BUV',
  adjustersName: '7tZahjAuelIjP9lUG4Er',
  insurancePhoneNumber: 'e5gX4XyLb3hBlbKy186Y',
  attorneyPhone: '4rSH8n1ANAYLFU9Cby9W',
  attorneyName: 'Kdh3NRFD0DIfhoE86TzT',
  healthInsurance: '1zrW9idqNMbLWrZvcPee',
  groupNumber: '"3CFGGeMzAwkv49z096aB',
  healthInsuranceId: 'tCxf5IqN97TJev00wzkO',
  medicaidMedicareId: 'Y7PjcJSaTjDsmwxHLtpe',
  maritalStatus: 'YX017UhulJCX03IMTWYg',
  // These IDs will need to be updated when integrated with actual GHL custom fields
  dateOfAccident: 'date-of-accident-field-id',
  didGoToHospital: 'hospital-visit-field-id', 
  hospitalName: 'hospital-name-field-id',
};

export default function PatientProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [sensitiveDataVisible, setSensitiveDataVisible] = useState(false);
  const [loadingSensitive, setLoadingSensitive] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState<'id-front' | 'id-back' | 'insurance-front' | 'insurance-back' | null>(null);

  const { updatePatient } = usePatients();
  
  // Enhanced SOAP notes hook with search, pagination, and bulk operations
  const {
    notes: soapNotes,
    filteredNotes,
    loading: soapNotesLoading,
    searchQuery,
    filters,
    handleSearch,
    handleFilterChange,
    paginationState,
    loadMore,
    selectedNotes,
    handleSelectionChange,
    selectAll,
    clearSelection,
    deleteSOAPNote,
    bulkDelete,
    bulkExport,
    stats
  } = useEnhancedSOAPNotes({ 
    patientId: patient?.id,
    pageSize: 20
  });
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleNewSOAPNote = () => {
    navigate(`/soap-notes/new?patientId=${patient?.id}`);
  };

  const handleExportSOAPNote = async (noteId: string) => {
    try {
      const { exportSOAPNoteToPDF } = await import('@/services/pdfExport');
      const note = soapNotes.find(n => n.id === noteId);
      if (note && patient) {
        const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient';
        exportSOAPNoteToPDF(note, patientName);
        toast({
          title: "Success",
          description: "SOAP note exported successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to export SOAP note:', error);
      toast({
        title: "Error",
        description: "Failed to export SOAP note.",
        variant: "destructive",
      });
    }
  };

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  // Load individual patient directly from database
  const loadIndividualPatient = async (id: string) => {
    try {
      // Try to find patient by GHL contact ID first, then by Supabase ID as fallback
      const { data: patientData, error } = await supabase
        .from('patients')
        .select('*')
        .or(`ghl_contact_id.eq.${id},id.eq.${id}`)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return patientData;
    } catch (error) {
      console.error('Error loading individual patient:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]); // Removed patients dependency to fix race condition
  
  // Reset form when patient data loads
  useEffect(() => {
    if (patient && !isEditing) {
      resetFormToPatientData();
    }
  }, [patient]);
  
  const resetFormToPatientData = () => {
    if (!patient) return;
    
    form.reset({
      firstName: patient.first_name || "",
      lastName: patient.last_name || "",
      email: patient.email || "",
      phone: patient.phone || patient.cell_phone || "",
      dateOfBirth: patient.date_of_birth ? new Date(patient.date_of_birth) : undefined,
      preferredLanguage: patient.preferred_language || "",
      streetAddress: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      zipCode: patient.zip_code || "",
      gender: patient.gender || "",
      maritalStatus: patient.marital_status || "",
      // Emergency Contact
      emergencyContactName: patient.emergency_contact_name || "",
      emergencyContactPhone: patient.emergency_contact_phone || "",
      emergencyContactRelationship: (patient as any).emergency_contact_relationship || "",
      // Medical History
      currentMedications: (patient as any).current_medications || "",
      allergies: (patient as any).allergies || "",
      pastInjuries: (patient as any).past_injuries || "",
      chronicConditions: (patient as any).chronic_conditions || "",
      painLocation: patient.pain_location || "",
      painSeverity: patient.pain_severity || 0,
      familyMedicalHistory: patient.family_medical_history || "",
      smokingStatus: patient.smoking_status || "",
      smokingHistory: patient.smoking_history || "",
      alcoholConsumption: patient.alcohol_consumption || "",
      currentSymptoms: patient.current_symptoms ? 
        (typeof patient.current_symptoms === 'string' ? JSON.parse(patient.current_symptoms) : patient.current_symptoms) : {},
      familyHistory: (() => {
        // First try family_medical_history (from forms), then fall back to systems_review
        const familyData = patient.family_medical_history || patient.systems_review;
        if (!familyData) return {};
        
        const parsedData = typeof familyData === 'string' ? JSON.parse(familyData) : familyData;
        
        // Convert from formField format to soapField format for the form
        const convertedData = {};
        Object.entries(parsedData).forEach(([key, value]) => {
          const mapping = FAMILY_HISTORY_MAPPING.find(m => m.formField === key);
          if (mapping) {
            convertedData[mapping.soapField] = value;
          } else {
            // If no mapping found, use the key as-is (might already be in soapField format)
            convertedData[key] = value;
          }
        });
        
        return convertedData;
      })(),
      otherMedicalHistory: (patient as any).other_medical_history || "",
      
      // New PIP Form Fields - Accident Details
      accidentDate: patient.accident_date ? new Date(patient.accident_date) : undefined,
      accidentTime: patient.accident_time || "",
      accidentDescription: patient.accident_description || "",
      weatherConditions: patient.weather_conditions || "",
      streetSurface: patient.street_surface || "",
      bodyPartHit: patient.body_part_hit || "",
      whatBodyHit: patient.what_body_hit || "",
      lossOfConsciousness: patient.loss_of_consciousness || "",
      consciousnessDuration: patient.consciousness_duration || "",
      emergencyHospitalVisit: patient.emergency_hospital_visit || false,
      emergencyHospitalDetails: patient.emergency_hospital_details || "",
      previousAccidents: patient.previous_accidents || "",
      
      // Pain Assessment Fields
      painFrequency: patient.pain_frequency || "",
      painQuality: patient.pain_quality || "",
      symptomChanges: patient.symptom_changes || "",
      functionalLimitations: patient.functional_limitations || "",
      
      // Communication Fields
      alternativeCommunication: patient.alternative_communication || "",
      emailConsent: patient.email_consent || "",
      
      // Insurance and Legal fields continue from here
      didGoToHospital: patient.did_go_to_hospital === true ? "yes" : patient.did_go_to_hospital === false ? "no" : "",
      hospitalName: patient.hospital_name || "",
      dateOfAccident: patient.accident_date ? new Date(patient.accident_date) : undefined,
      claimNumber: patient.claim_number || "",
      policyNumber: patient.auto_policy_number || "",
      autoInsuranceCompany: patient.auto_insurance_company || "",
      healthInsurance: patient.health_insurance || "",
      healthInsuranceId: patient.health_insurance_id || "",
      attorneyName: patient.attorney_name || "",
      attorneyPhone: patient.attorney_phone || "",
      adjustersName: patient.adjuster_name || "",
      insurancePhoneNumber: patient.insurance_phone_number || "",
      groupNumber: patient.group_number || "",
      medicaidMedicareId: patient.medicaid_medicare_id || "",
      licenseState: patient.drivers_license_state || "",
      caseType: patient.case_type || "",
    });
  };
  
  const loadPatientForms = async (patientId: string) => {
    setFormsLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('patient_id', patientId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching patient forms:', error);
        return;
      }

      setForms(data || []);
    } catch (error) {
      console.error('Failed to load patient forms:', error);
    } finally {
      setFormsLoading(false);
    }
  };

  const loadPatientData = async () => {
    setLoading(true);
    setSensitiveDataVisible(false); 
    try {
      const patientData = await loadIndividualPatient(patientId);
      
      if (!patientData) {
        console.error("Patient not found with ID:", patientId);
        toast({ 
          title: "Patient Not Found", 
          description: "This patient may not have been synced from the intake form yet.", 
          variant: "destructive" 
        });
        setPatient(null);
        setLoading(false);
        return;
      }
      setPatient(patientData);
      
      // Mock data for appointments and tasks
      setAppointments([]);
      setTasks([]);

      // Mock calendars data since calendars API is not available
      setCalendars([
        { id: "cal-1", name: "Dr. Silverman's Schedule", timezone: "America/New_York" },
        { id: "cal-2", name: "PIP Appointments", timezone: "America/New_York" }
      ]);

      form.reset({
        firstName: patientData.first_name || "",
        lastName: patientData.last_name || "",
        email: patientData.email || "",
        phone: patientData.phone || patientData.cell_phone || "",
        dateOfBirth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : undefined,
        preferredLanguage: patientData.preferred_language || 'English',
        streetAddress: patientData.address || "",
        city: patientData.city || "",
        state: patientData.state || "",
        zipCode: patientData.zip_code || "",
        gender: patientData.gender || "",
        maritalStatus: patientData.marital_status || "",
        // Emergency Contact
        emergencyContactName: patientData.emergency_contact_name || "",
        emergencyContactPhone: patientData.emergency_contact_phone || "",
        emergencyContactRelationship: (patientData as any).emergency_contact_relationship || "",
        // Medical History
        currentMedications: (patientData as any).current_medications || "",
        allergies: (patientData as any).allergies || "",
        pastInjuries: (patientData as any).past_injuries || "",
        chronicConditions: (patientData as any).chronic_conditions || "",
        painLocation: patientData.pain_location || "",
        painSeverity: patientData.pain_severity || 0,
        familyMedicalHistory: patientData.family_medical_history || "",
        smokingStatus: patientData.smoking_status || "",
        smokingHistory: patientData.smoking_history || "",
        alcoholConsumption: patientData.alcohol_consumption || "",
        currentSymptoms: patientData.current_symptoms ? 
          (typeof patientData.current_symptoms === 'string' ? JSON.parse(patientData.current_symptoms) : patientData.current_symptoms) : {},
        familyHistory: (() => {
          // First try family_medical_history (from forms), then fall back to systems_review
          const familyData = patientData.family_medical_history || patientData.systems_review;
          if (!familyData) return {};
          
          const parsedData = typeof familyData === 'string' ? JSON.parse(familyData) : familyData;
          
          // Convert from formField format to soapField format for the form
          const convertedData = {};
          Object.entries(parsedData).forEach(([key, value]) => {
            const mapping = FAMILY_HISTORY_MAPPING.find(m => m.formField === key);
            if (mapping) {
              convertedData[mapping.soapField] = value;
            } else {
              // If no mapping found, use the key as-is (might already be in soapField format)
              convertedData[key] = value;
            }
          });
          
          return convertedData;
        })(),
        otherMedicalHistory: (patientData as any).other_medical_history || "",
        // Insurance and Legal fields continue from here
        didGoToHospital: patientData.did_go_to_hospital === true ? "yes" : patientData.did_go_to_hospital === false ? "no" : "",
        hospitalName: patientData.hospital_name || "",
        dateOfAccident: patientData.accident_date ? new Date(patientData.accident_date) : undefined,
        claimNumber: patientData.claim_number || "",
        policyNumber: patientData.auto_policy_number || "",
        autoInsuranceCompany: patientData.auto_insurance_company || "",
        healthInsurance: patientData.health_insurance || "",
        healthInsuranceId: patientData.health_insurance_id || "",
        attorneyName: patientData.attorney_name || "",
        attorneyPhone: patientData.attorney_phone || "",
        adjustersName: patientData.adjuster_name || "",
        insurancePhoneNumber: patientData.insurance_phone_number || "",
        groupNumber: patientData.group_number || "",
        medicaidMedicareId: patientData.medicaid_medicare_id || "",
        licenseState: patientData.drivers_license_state || "",
        caseType: patientData.case_type || "",
      });

      // Load patient's SOAP notes - this will be handled by the enhanced hook now
      // await fetchSOAPNotes({ patientId: patientData.id });
      setInvoices([
        { id: "INV-PIP-001", date: new Date("2025-05-22"), amount: 350.00, description: "Initial PIP Exam & X-Rays", status: "pending" },
        { id: "INV-PIP-002", date: new Date("2025-06-15"), amount: 150.00, description: "Chiropractic Adjustment", status: "pending" },
      ]);
      setFiles([
        { id: "file-1", name: "Police_Report_MVA.pdf", type: "Legal", uploadDate: new Date("2025-05-21"), uploadedBy: "Front Desk" },
        { id: "file-2", name: "Patient_Intake_Form.pdf", type: "Admin", uploadDate: new Date("2025-05-22"), uploadedBy: "Patient" },
        { id: "file-3", name: "Cervical_XRay_Report.pdf", type: "Imaging", uploadDate: new Date("2025-05-23"), uploadedBy: "Dr. Silverman" }
      ]);
      // Load real form submissions for this patient
      await loadPatientForms(patientData.id);

    } catch (error) {
      console.error('Failed to load patient data:', error);
      toast({ title: "Error", description: "Failed to load patient information.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadSensitiveData = async () => {
    setLoadingSensitive(true);
    try {
        // All patient data is already loaded, just show it
        setSensitiveDataVisible(true);
    } catch (error) {
        toast({ title: "Error", description: "Could not load sensitive patient details.", variant: "destructive" });
    } finally {
        setLoadingSensitive(false);
    }
  }

  const handleSave = async (data: PatientFormData) => {
    if (!patient?.id) {
      toast({
        title: "Error",
        description: "Patient ID not found. Cannot save changes.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Check form validation state first
      const isValid = await form.trigger();
      
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fix the form errors before saving.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      // Additional manual validation for required fields
      const validationErrors = [];
      if (!data.firstName?.trim()) {
        validationErrors.push("First name is required");
        form.setError("firstName", { message: "First name is required" });
      }
      if (!data.lastName?.trim()) {
        validationErrors.push("Last name is required");
        form.setError("lastName", { message: "Last name is required" });
      }
      if (!data.phone?.trim()) {
        validationErrors.push("Phone number is required");
        form.setError("phone", { message: "Phone number is required" });
      }
      
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(", "),
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      // Map form data to patient update format with proper handling of optional fields
      const updateData: any = {
        // Basic Demographics
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone: data.phone.trim(),
        cell_phone: data.phone.trim(), // Set both phone fields for consistency
        email: data.email?.trim() || null,
        address: data.streetAddress?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,
        zip_code: data.zipCode?.trim() || null,
        gender: data.gender?.trim() || null,
        marital_status: data.maritalStatus?.trim() || null,
        preferred_language: data.preferredLanguage?.trim() || null,
        
        // Emergency Contact
        emergency_contact_name: data.emergencyContactName?.trim() || null,
        emergency_contact_phone: data.emergencyContactPhone?.trim() || null,
        emergency_contact_relationship: data.emergencyContactRelationship?.trim() || null,
        
        // Medical History
        current_medications: data.currentMedications?.trim() || null,
        allergies: data.allergies?.trim() || null,
        past_injuries: data.pastInjuries?.trim() || null,
        chronic_conditions: data.chronicConditions?.trim() || null,
        pain_location: data.painLocation?.trim() || null,
        pain_severity: data.painSeverity || null,
        family_medical_history: (() => {
          // Convert familyHistory form data from soapField format back to formField format
          if (!data.familyHistory) return data.familyMedicalHistory?.trim() || null;
          
          const convertedData = {};
          Object.entries(data.familyHistory).forEach(([key, value]) => {
            const mapping = FAMILY_HISTORY_MAPPING.find(m => m.soapField === key);
            if (mapping) {
              convertedData[mapping.formField] = value;
            } else {
              // If no mapping found, use the key as-is
              convertedData[key] = value;
            }
          });
          
          return JSON.stringify(convertedData);
        })(),
        smoking_status: data.smokingStatus?.trim() || null,
        smoking_history: data.smokingHistory?.trim() || null,
        alcohol_consumption: data.alcoholConsumption?.trim() || null,
        current_symptoms: data.currentSymptoms ? JSON.stringify(data.currentSymptoms) : null,
        systems_review: null, // Clear this field as we're now using family_medical_history
        other_medical_history: data.otherMedicalHistory?.trim() || null,
        
        // Insurance and Legal
        claim_number: data.claimNumber?.trim() || null,
        auto_policy_number: data.policyNumber?.trim() || null,
        auto_insurance_company: data.autoInsuranceCompany?.trim() || null,
        health_insurance: data.healthInsurance?.trim() || null,
        attorney_name: data.attorneyName?.trim() || null,
        attorney_phone: data.attorneyPhone?.trim() || null,
        adjuster_name: data.adjustersName?.trim() || null,
        insurance_phone_number: data.insurancePhoneNumber?.trim() || null,
        health_insurance_id: data.healthInsuranceId?.trim() || null,
        medicaid_medicare_id: data.medicaidMedicareId?.trim() || null,
        drivers_license_state: data.licenseState?.trim() || null,
        case_type: data.caseType?.trim() || null,
        group_number: data.groupNumber?.trim() || null,
        
        // New PIP Form Fields - Accident Details
        accident_time: data.accidentTime?.trim() || null,
        accident_description: data.accidentDescription?.trim() || null,
        weather_conditions: data.weatherConditions?.trim() || null,
        street_surface: data.streetSurface?.trim() || null,
        body_part_hit: data.bodyPartHit?.trim() || null,
        what_body_hit: data.whatBodyHit?.trim() || null,
        loss_of_consciousness: data.lossOfConsciousness?.trim() || null,
        consciousness_duration: data.consciousnessDuration?.trim() || null,
        previous_accidents: data.previousAccidents?.trim() || null,
        emergency_hospital_details: data.emergencyHospitalDetails?.trim() || null,
        
        // Pain Assessment Fields
        pain_frequency: data.painFrequency?.trim() || null,
        pain_quality: data.painQuality?.trim() || null,
        symptom_changes: data.symptomChanges?.trim() || null,
        functional_limitations: data.functionalLimitations?.trim() || null,
        
        // Communication Fields
        alternative_communication: data.alternativeCommunication?.trim() || null,
        email_consent: data.emailConsent?.trim() || null,
        
        // Handle date fields
        date_of_birth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : null,
        accident_date: data.accidentDate ? data.accidentDate.toISOString().split('T')[0] : null,
        
        // Handle boolean fields
        did_go_to_hospital: data.didGoToHospital === "yes" ? true : data.didGoToHospital === "no" ? false : null,
        emergency_hospital_visit: data.emergencyHospitalVisit || false,
        hospital_name: data.hospitalName?.trim() || null,
      };

      // Update patient using the hook
      const result = await updatePatient(patient.id, updateData);
      
      // Update local state
      setPatient(prev => ({ ...prev, ...updateData }));
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Patient information updated successfully.",
      });

    } catch (error) {
      const errorMessage = error?.message || 'Unknown error occurred';
      
      toast({
        title: "Error", 
        description: `Failed to save patient information: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    resetFormToPatientData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetFormToPatientData();
  };

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      // Mock calendar booking since GHL API is not available
      const mockAppointment = {
        id: `mock-${Date.now()}`,
        title: data.title,
        start_time: data.startTime.toISOString(),
        end_time: setHours(setMinutes(data.startTime, data.startTime.getMinutes() + 60), data.startTime.getHours()).toISOString(),
        patient_id: patient?.id,
        patient_name: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim(),
        patient_email: patient?.email,
        patient_phone: patient?.phone,
        notes: data.notes || "",
        status: "scheduled",
        calendar_id: data.calendarId,
        provider_name: "Dr. Silverman"
      };

      setAppointments(prev => [mockAppointment, ...prev]);
      setIsBookingModalOpen(false);
      appointmentForm.reset();
      
      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment.",
        variant: "destructive",
      });
    }
  };

  // Helper component for displaying info fields
  const InfoField = ({ label, value }: { label: string; value?: any }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground font-medium">{label}</Label>
      <p className="text-sm text-foreground">{value || 'N/A'}</p>
    </div>
  );

  // Format currency helper
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Patient name helper
  const patientName = useMemo(() => {
    if (!patient) return 'Loading...';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient';
  }, [patient]);

  // Patient age helper
  const patientAge = useMemo(() => {
    if (!patient?.date_of_birth) return 'N/A';
    return `${differenceInYears(new Date(), new Date(patient.date_of_birth))} years old`;
  }, [patient?.date_of_birth]);

  // Case type helpers
  const caseTypeDisplay = useMemo(() => {
    return getCaseTypeDisplayName(patient?.case_type || '');
  }, [patient?.case_type]);

  const caseTypeVariant = useMemo(() => {
    return getCaseTypeVariant(patient?.case_type || '');
  }, [patient?.case_type]);

  const caseType = useMemo(() => {
    return getPatientType(patient);
  }, [patient]);

  const getCaseTypeGradient = (caseType: string) => {
    switch (caseType) {
      case 'PIP':
        return 'from-case-pip/10 to-case-pip/5';
      case 'Insurance':
        return 'from-case-insurance/10 to-case-insurance/5';
      case 'Slip and Fall':
        return 'from-case-slip-fall/10 to-case-slip-fall/5';
      case 'Workers Compensation':
        return 'from-case-workers-comp/10 to-case-workers-comp/5';
      case 'Cash Plan':
        return 'from-case-cash-plan/10 to-case-cash-plan/5';
      case 'Attorney Only':
        return 'from-case-attorney-only/10 to-case-attorney-only/5';
      default:
        return 'from-secondary/10 to-secondary/5';
    }
  };

  const getCaseTypeBorder = (caseType: string) => {
    switch (caseType) {
      case 'PIP':
        return 'border-case-pip/30';
      case 'Insurance':
        return 'border-case-insurance/30';
      case 'Slip and Fall':
        return 'border-case-slip-fall/30';
      case 'Workers Compensation':
        return 'border-case-workers-comp/30';
      case 'Cash Plan':
        return 'border-case-cash-plan/30';
      case 'Attorney Only':
        return 'border-case-attorney-only/30';
      default:
        return 'border-secondary/30';
    }
  };

  // Document upload functions
  const handleDocumentUpload = (documentType: 'id-front' | 'id-back' | 'insurance-front' | 'insurance-back') => {
    setUploadDocumentType(documentType);
    setIsDocumentUploadOpen(true);
  };

  const getDocumentDetails = (type: 'id-front' | 'id-back' | 'insurance-front' | 'insurance-back') => {
    switch (type) {
      case 'id-front':
        return {
          title: 'Upload Driver\'s License - Front',
          description: 'Upload the front side of the driver\'s license',
          category: 'Legal',
          fileName: 'drivers-license-front'
        };
      case 'id-back':
        return {
          title: 'Upload Driver\'s License - Back',
          description: 'Upload the back side of the driver\'s license',
          category: 'Legal',
          fileName: 'drivers-license-back'
        };
      case 'insurance-front':
        return {
          title: 'Upload Insurance Card - Front',
          description: 'Upload the front side of the insurance card',
          category: 'Insurance',
          fileName: 'insurance-card-front'
        };
      case 'insurance-back':
        return {
          title: 'Upload Insurance Card - Back',
          description: 'Upload the back side of the insurance card',
          category: 'Insurance',
          fileName: 'insurance-card-back'
        };
      default:
        return {
          title: 'Upload Document',
          description: 'Upload document',
          category: 'General',
          fileName: 'document'
        };
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0 || !uploadDocumentType || !patient) return;

    const file = files[0];
    const documentDetails = getDocumentDetails(uploadDocumentType);
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${documentDetails.fileName}-${timestamp}`;

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${patient.id}/${fileName}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('patient_files')
        .insert({
          patient_id: patient.id,
          file_name: `${fileName}.${fileExt}`,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          category: documentDetails.category,
          description: documentDetails.description,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${documentDetails.title} uploaded successfully.`,
      });

      setIsDocumentUploadOpen(false);
      setUploadDocumentType(null);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading patient information...</span>
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
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Patient Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This patient may not have been synced from the intake form yet.
            </p>
            <Button onClick={() => navigate('/patients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen bg-background">
          {/* Header with Back Navigation */}
          <div className={`border-b bg-gradient-to-r ${getCaseTypeGradient(caseType)} backdrop-blur-sm border-border/50`}>
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/patients')}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patients
                </Button>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    {patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient' : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Left Column - Patient Profile (3/5 width) */}
              <div className="xl:col-span-3 space-y-6">
                {/* Main Patient Information Card */}
                <Card className={`shadow-lg backdrop-blur-sm bg-gradient-to-br ${getCaseTypeGradient(caseType)} border-2 ${getCaseTypeBorder(caseType)}`}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className={`h-16 w-16 ring-2 ${getCaseTypeBorder(caseType)} ring-offset-2`}>
                          <AvatarImage src={patient?.avatar_url} />
                          <AvatarFallback className={`bg-gradient-to-br ${getCaseTypeGradient(caseType)} text-foreground text-lg font-semibold border ${getCaseTypeBorder(caseType)}`}>
                            {patient ? `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}` : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                            <h1 className="text-2xl font-bold">
                              {patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient' : 'Loading...'}
                            </h1>
                            {patient?.case_type && (
                              <Badge className={`w-fit ${caseTypeVariant} border shadow-sm`}>
                                {getCaseTypeDisplayName(patient.case_type)}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            {patient?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                            {patient?.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{patient.email}</span>
                              </div>
                            )}
                            {patient?.date_of_birth && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Age {differenceInYears(new Date(), new Date(patient.date_of_birth))}</span>
                              </div>
                            )}
                          </div>
                          {patient?.accident_date && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                              <Car className="h-4 w-4" />
                              <span>Accident: {format(new Date(patient.accident_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {!isEditing ? (
                          <Button 
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleCancel}
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-initial"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              onClick={(e) => {
                                console.log("Save button clicked - about to submit form");
                                e.preventDefault();
                                
                                // Check form validation first
                                const formData = form.getValues();
                                console.log("Current form values:", formData);
                                
                                // Trigger validation and get detailed results
                                form.trigger().then((isValid) => {
                                  const errors = form.formState.errors;
                                  console.log("Form validation result:", isValid);
                                  console.log("Detailed form errors:", errors);
                                  
                                  if (isValid) {
                                    console.log("Form is valid, calling handleSave");
                                    handleSave(formData);
                                  } else {
                                    // Create detailed error message
                                    const errorFields = Object.keys(errors);
                                    const errorMessages = errorFields.map(field => {
                                      const error = errors[field];
                                      return `${field}: ${error?.message || 'Invalid value'}`;
                                    });
                                    
                                    console.log("❌ Form validation failed for fields:", errorFields);
                                    console.log("❌ Error details:", errorMessages);
                                    
                                    toast({
                                      title: "Validation Error",
                                      description: `Please fix these fields: ${errorFields.join(', ')}`,
                                      variant: "destructive"
                                    });
                                    
                                    // Scroll to first error field
                                    if (errorFields.length > 0) {
                                      const firstErrorField = document.querySelector(`[name="${errorFields[0]}"]`);
                                      if (firstErrorField) {
                                        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        (firstErrorField as HTMLElement).focus();
                                      }
                                    }
                                  }
                                });
                              }}
                              disabled={saving}
                              size="sm"
                              className="flex-1 sm:flex-initial"
                            >
                              {saving ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        <Button
                          onClick={() => setIsBookingModalOpen(true)}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Patient Information Tabs */}
                    <Tabs defaultValue="demographics" className="w-full mb-8">
                      <div className="w-full overflow-x-auto scrollbar-hide">
                        <TabsList className="inline-flex w-max min-w-full justify-start gap-1">
                          <TabsTrigger value="demographics" className="flex items-center gap-2 whitespace-nowrap">
                            <User className="h-4 w-4" />
                            Demographics
                          </TabsTrigger>
                          <TabsTrigger value="accident" className="flex items-center gap-2 whitespace-nowrap">
                            <Car className="h-4 w-4" />
                            Accident Details
                          </TabsTrigger>
                          <TabsTrigger value="pain" className="flex items-center gap-2 whitespace-nowrap">
                            <HeartPulse className="h-4 w-4" />
                            Pain Assessment
                          </TabsTrigger>
                          <TabsTrigger value="medical" className="flex items-center gap-2 whitespace-nowrap">
                            <Activity className="h-4 w-4" />
                            Medical History
                          </TabsTrigger>
                          <TabsTrigger value="systems" className="flex items-center gap-2 whitespace-nowrap">
                            <BarChart3 className="h-4 w-4" />
                            Systems Review
                          </TabsTrigger>
                          <TabsTrigger value="insurance" className="flex items-center gap-2 whitespace-nowrap">
                            <Shield className="h-4 w-4" />
                            Insurance
                          </TabsTrigger>
                          <TabsTrigger value="legal" className="flex items-center gap-2 whitespace-nowrap">
                            <Scale className="h-4 w-4" />
                            Legal Information
                          </TabsTrigger>
                          <TabsTrigger value="communications" className="flex items-center gap-2 whitespace-nowrap">
                            <MessageSquare className="h-4 w-4" />
                            Communications
                          </TabsTrigger>
                          <TabsTrigger value="emergency" className="flex items-center gap-2 whitespace-nowrap">
                            <AlertCircle className="h-4 w-4" />
                            Emergency Contact
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="demographics" className="mt-6">
                        <DemographicsCard
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          isSensitiveVisible={sensitiveDataVisible}
                          onToggleSensitive={loadSensitiveData}
                          form={form}
                          onPatientUpdate={(updates) => setPatient(prev => prev ? { ...prev, ...updates } : null)}
                        />
                      </TabsContent>

                      <TabsContent value="accident" className="mt-6">
                        <AccidentDetailsCard
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="pain" className="mt-6">
                        <PainAssessmentCard
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="medical" className="mt-6">
                        <MedicalHistoryCard
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="systems" className="mt-6">
                        <SystemsReviewCard
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="insurance" className="mt-6">
                        <InsuranceCard 
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          isSensitiveVisible={sensitiveDataVisible}
                          onToggleSensitive={loadSensitiveData}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="legal" className="mt-6">
                        <LegalCard 
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          isSensitiveVisible={sensitiveDataVisible}
                          onToggleSensitive={loadSensitiveData}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="communications" className="mt-6">
                        <CommunicationsCard
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          form={form}
                        />
                      </TabsContent>

                      <TabsContent value="emergency" className="mt-6">
                        <EmergencyContactCard 
                          patient={patient}
                          isEditing={isEditing}
                          onEdit={handleEdit}
                          isSensitiveVisible={sensitiveDataVisible}
                          onToggleSensitive={loadSensitiveData}
                          form={form}
                        />
                      </TabsContent>
                    </Tabs>

                    {/* Functional Tabs */}
                    <Tabs defaultValue="appointments" className="w-full">
                      <div className="w-full overflow-x-auto scrollbar-hide">
                        <TabsList className="inline-flex w-max min-w-full justify-start gap-1">
                          <TabsTrigger value="appointments" className="flex items-center gap-2 whitespace-nowrap">
                            <CalendarIcon className="h-4 w-4" />
                            Appointments 
                            <Badge variant="secondary" className="ml-1 text-xs h-5 min-w-5 rounded-full">{appointments.length}</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="soap-notes" className="flex items-center gap-2 whitespace-nowrap">
                            <FileText className="h-4 w-4" />
                            SOAP Notes 
                            <Badge variant="secondary" className="ml-1 text-xs h-5 min-w-5 rounded-full">{filteredNotes.length}</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="files" className="flex items-center gap-2 whitespace-nowrap">
                            <Upload className="h-4 w-4" />
                            Files
                          </TabsTrigger>
                          <TabsTrigger value="invoices" className="flex items-center gap-2 whitespace-nowrap">
                            <DollarSign className="h-4 w-4" />
                            Invoices 
                            <Badge variant="secondary" className="ml-1 text-xs h-5 min-w-5 rounded-full">{invoices.length}</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="forms" className="flex items-center gap-2 whitespace-nowrap">
                            <CheckSquare className="h-4 w-4" />
                            Forms 
                            <Badge variant="secondary" className="ml-1 text-xs h-5 min-w-5 rounded-full">{forms.length}</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="providers" className="flex items-center gap-2 whitespace-nowrap">
                            <User className="h-4 w-4" />
                            Providers
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="appointments" className="space-y-4 mt-6 bg-card/30 rounded-lg p-6 border border-border/30 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <h3 className="text-lg font-semibold">Appointments</h3>
                          <Button 
                            onClick={() => setIsBookingModalOpen(true)}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Book New Appointment
                          </Button>
                        </div>
                        {appointments.length === 0 ? (
                          <Card className="p-8">
                            <div className="text-center text-muted-foreground">
                              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg mb-2">No appointments scheduled</p>
                              <p className="text-sm mb-4">Schedule the first appointment for this patient.</p>
                              <Button onClick={() => setIsBookingModalOpen(true)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Book Appointment
                              </Button>
                            </div>
                          </Card>
                        ) : (
                          <div className="grid gap-4">
                            {appointments.map((appointment) => (
                              <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{appointment.title}</h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm text-muted-foreground mt-2">
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        {format(new Date(appointment.start_time), 'PPP')}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(appointment.start_time), 'p')} - {format(new Date(appointment.end_time), 'p')}
                                      </div>
                                      {appointment.location && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4" />
                                          {appointment.location}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                {appointment.notes && (
                                  <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded-md">{appointment.notes}</p>
                                )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="soap-notes" className="space-y-4 mt-6 bg-card/30 rounded-lg p-6 border border-border/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">SOAP Notes</h3>
                          <Button onClick={handleNewSOAPNote} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New SOAP Note
                          </Button>
                        </div>
                        
                        {soapNotesLoading ? (
                          <div className="text-center py-8">Loading SOAP notes...</div>
                        ) : filteredNotes.length === 0 ? (
                          <Card className="p-8">
                            <div className="text-center text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg mb-2">No SOAP notes found</p>
                              <p className="text-sm mb-4">Create the first SOAP note for this patient.</p>
                              <Button onClick={handleNewSOAPNote}>
                                <Plus className="h-4 w-4 mr-2" />
                                New SOAP Note
                              </Button>
                            </div>
                          </Card>
                        ) : (
                          <div className="grid gap-4">
                            {filteredNotes.map((note) => (
                              <Card key={note.id} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{note.chief_complaint || 'SOAP Note'}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(note.date_of_service), 'PPP')} - {note.provider_name}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/soap-notes/${note.id}/view`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleExportSOAPNote(note.id)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="files" className="space-y-4 mt-6 bg-card/30 rounded-lg p-6 border border-border/30 backdrop-blur-sm">
                        <PatientFiles patientId={patient?.id || ""} />
                      </TabsContent>

                      <TabsContent value="invoices" className="space-y-4 mt-6 bg-card/30 rounded-lg p-6 border border-border/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Invoices</h3>
                          <Badge variant="outline">${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)} total</Badge>
                        </div>
                        <div className="grid gap-4">
                          {invoices.map((invoice) => (
                            <Card key={invoice.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{invoice.id}</h4>
                                  <p className="text-sm text-muted-foreground">{invoice.description}</p>
                                  <p className="text-sm text-muted-foreground">{format(invoice.date, 'PPP')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                    {invoice.status}
                                  </Badge>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="forms" className="space-y-4 mt-6 bg-card/30 rounded-lg p-6 border border-border/30 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold">Submitted Forms</h3>
                        <PatientFormDisplay forms={forms} loading={formsLoading} />
                      </TabsContent>

                      <TabsContent value="providers" className="space-y-4 mt-6 bg-card/30 rounded-lg p-6 border border-border/30 backdrop-blur-sm">
                        <PatientAssignment 
                          patientId={patient?.id || ""} 
                          onAssignmentChange={() => {
                            // Refresh conversations when assignment changes
                            toast({
                              title: "Success",
                              description: "Provider assignment updated. Patient conversations have been refreshed.",
                            });
                          }}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Fixed Notes Panel (2/5 width) */}
              <div className="xl:col-span-2">
                {patient?.id && <PatientNotes patientId={patient.id} />}
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Booking Dialog */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for {patientName}
              </DialogDescription>
            </DialogHeader>
            <Form {...appointmentForm}>
              <form onSubmit={appointmentForm.handleSubmit(handleCreateAppointment)} className="space-y-4">
                <FormField
                  control={appointmentForm.control}
                  name="calendarId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calendar</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select calendar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {calendars.map((calendar) => (
                            <SelectItem key={calendar.id} value={calendar.id}>
                              {calendar.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={appointmentForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Appointment title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={appointmentForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={appointmentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes for the appointment"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Document Upload Dialog */}
        <Dialog open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {uploadDocumentType ? getDocumentDetails(uploadDocumentType).title : 'Upload Document'}
              </DialogTitle>
              <DialogDescription>
                {uploadDocumentType ? getDocumentDetails(uploadDocumentType).description : 'Upload a document for this patient'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground">
                    Supports: Images (JPG, PNG, WebP), PDF files
                  </p>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleFileUpload(files);
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsDocumentUploadOpen(false);
                setUploadDocumentType(null);
              }}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </AuthGuard>
  );
}
