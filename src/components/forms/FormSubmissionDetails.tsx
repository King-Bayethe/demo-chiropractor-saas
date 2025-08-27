import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Download, FileText, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormSubmissionDetailsProps {
  formData: any;
  formType: string;
  submissionDate: string;
  submissionId: string;
  patientName?: string;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function FormSubmissionDetails({ 
  formData, 
  formType, 
  submissionDate, 
  submissionId,
  patientName,
  onExport 
}: FormSubmissionDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      setCopied(true);
      toast.success("Form data copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const renderSection = (title: string, data: any, keyMap?: Record<string, string>) => {
    if (!data || typeof data !== 'object') return null;

    const filteredData = Object.entries(data).filter(([_, value]) => 
      value !== null && value !== undefined && value !== '' && value !== false
    );

    if (filteredData.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredData.map(([key, value]) => {
            const displayKey = keyMap?.[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            if (typeof value === 'object' && value !== null) {
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{displayKey}:</span>
                    <div className="flex flex-wrap gap-1">
                      {value.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {String(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              } else {
                // Nested object
                return (
                  <div key={key} className="border-l-2 border-muted pl-4">
                    <span className="font-medium text-sm mb-2 block">{displayKey}:</span>
                    {renderSection("", value)}
                  </div>
                );
              }
            }

            return (
              <div key={key} className="grid grid-cols-3 gap-4 py-1">
                <span className="font-medium text-sm text-muted-foreground">{displayKey}:</span>
                <span className="col-span-2 text-sm break-words">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderCompleteFormData = () => {
    const sections = [];

    // Personal Information
    const personalData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      patientName: formData.patientName,
      email: formData.email || formData.patientEmail,
      phone: formData.phone || formData.cellPhone || formData.patientPhone,
      dateOfBirth: formData.dob || formData.dateOfBirth,
      age: formData.age,
      gender: formData.gender || formData.sex,
      address: formData.address || formData.streetAddress,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode || formData.zip,
      maritalStatus: formData.maritalStatus,
      employmentStatus: formData.employmentStatus,
      employer: formData.employer || formData.employerName,
      language: formData.language || formData.preferredLanguage
    };

    sections.push(renderSection("Personal Information", personalData));

    // Accident Information
    if (formType === 'pip' || formType === 'cash') {
      const accidentData = {
        accidentDate: formData.accidentDate,
        accidentTime: formData.accidentTime,
        accidentType: formData.accidentType,
        accidentDescription: formData.accidentDescription,
        personType: formData.personType,
        weatherConditions: formData.weatherConditions,
        streetSurface: formData.streetSurface,
        bodyPartHit: formData.bodyPartHit,
        whatBodyHit: formData.whatBodyHit,
        didGoToHospital: formData.didGoToHospital,
        emergencyHospitalVisit: formData.emergencyHospitalVisit,
        hospitalName: formData.hospitalName,
        emergencyHospitalDetails: formData.emergencyHospitalDetails,
        lossOfConsciousness: formData.lossOfConsciousness,
        consciousnessDuration: formData.consciousnessDuration,
        previousAccidents: formData.previousAccidents
      };

      sections.push(renderSection("Accident Information", accidentData));
    }

    // Medical Information
    const medicalData = {
      painLocation: formData.painLocation,
      painSeverity: formData.painSeverity,
      painRating: formData.painRating,
      painFrequency: formData.painFrequency,
      painQuality: formData.painQuality,
      painDescriptions: formData.painDescriptions,
      painBetter: formData.painBetter,
      painWorse: formData.painWorse,
      painRadiate: formData.painRadiate,
      problemBegin: formData.problemBegin,
      problemStart: formData.problemStart,
      currentSymptoms: formData.currentSymptoms,
      symptoms: formData.symptoms,
      mainComplaints: formData.mainComplaints,
      otherComplaint: formData.otherComplaint,
      otherSymptoms: formData.otherSymptoms,
      functionalLimitations: formData.functionalLimitations,
      symptomChanges: formData.symptomChanges,
      currentMedications: formData.currentMedications || formData.medications,
      allergies: formData.allergies,
      familyMedicalHistory: formData.familyMedicalHistory,
      pastInjuries: formData.pastInjuries,
      chronicConditions: formData.chronicConditions,
      otherMedicalHistory: formData.otherMedicalHistory,
      smokingStatus: formData.smokingStatus,
      smokingHistory: formData.smokingHistory,
      alcoholConsumption: formData.alcoholConsumption
    };

    sections.push(renderSection("Medical Information", medicalData));

    // Insurance Information
    const insuranceData = {
      autoInsuranceCompany: formData.autoInsuranceCompany || formData.insuranceCo,
      autoPolicyNumber: formData.autoPolicyNumber || formData.policyNumber,
      claimNumber: formData.claimNumber,
      adjusterName: formData.adjusterName,
      healthInsurance: formData.healthInsurance,
      healthInsuranceId: formData.healthInsuranceId,
      insuranceProvider: formData.insuranceProvider,
      insurancePolicyNumber: formData.insurancePolicyNumber,
      groupNumber: formData.groupNumber,
      medicaidMedicareId: formData.medicaidMedicareId,
      insurancePhoneNumber: formData.insurancePhoneNumber,
      insuranceName: formData.insuranceName,
      biLimit: formData.biLimit
    };

    sections.push(renderSection("Insurance Information", insuranceData));

    // Legal Information
    const legalData = {
      attorneyName: formData.attorneyName,
      attorneyPhone: formData.attorneyPhone,
      attorneyContact: formData.attorneyContact,
      attorneyReferred: formData.attorneyReferred,
      caseType: formData.caseType
    };

    sections.push(renderSection("Legal Information", legalData));

    // Lead Information (for lead intake forms)
    if (formType === 'lead_intake') {
      const leadData = {
        leadSource: formData.leadSource,
        referredBy: formData.referredBy,
        affiliateOffice: formData.affiliateOffice,
        other: formData.other
      };

      sections.push(renderSection("Lead Information", leadData));
    }

    // Clinical Information (for SOAP questionnaires)
    if (formType === 'soap_questionnaire') {
      if (formData.objective) {
        sections.push(renderSection("Objective Findings", formData.objective));
      }
      if (formData.reviewOfSystems) {
        sections.push(renderSection("Review of Systems", formData.reviewOfSystems));
      }
      if (formData.vitalSigns) {
        sections.push(renderSection("Vital Signs", formData.vitalSigns));
      }
    }

    // Emergency Contact
    const emergencyData = {
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      emergencyContactRelationship: formData.emergencyContactRelationship
    };

    sections.push(renderSection("Emergency Contact", emergencyData));

    // Consent and Signatures
    const consentData = {
      consentAcknowledgement: formData.consentAcknowledgement,
      emailConsent: formData.emailConsent,
      patientSignature: formData.patientSignature,
      signatureDate: formData.signatureDate,
      releaseInformation: formData.releaseInformation
    };

    sections.push(renderSection("Consent & Signatures", consentData));

    return sections.filter(section => section !== null);
  };

  return (
    <div className="space-y-6">
      {/* Header with export options */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">Complete Form Data</h3>
          <p className="text-sm text-muted-foreground">
            Submission ID: {submissionId} • {format(new Date(submissionDate), 'PPP p')}
          </p>
          {patientName && (
            <p className="text-sm font-medium">Patient: {patientName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
          {onExport && (
            <>
              <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Form data sections */}
      <div className="space-y-4">
        {renderCompleteFormData()}
      </div>

      {/* Raw JSON data (collapsible) */}
      <Collapsible open={isRawDataOpen} onOpenChange={setIsRawDataOpen}>
        <Card className="border-dashed">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Raw Form Data (JSON)
                </CardTitle>
                {isRawDataOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-60 border">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}