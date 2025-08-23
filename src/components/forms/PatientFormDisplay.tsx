import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { 
  FileText, 
  Users, 
  ClipboardList, 
  Eye,
  CheckCircle,
  Clock,
  Stethoscope,
  UserPlus,
  Activity
} from "lucide-react";

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: any;
  submitted_at: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  status: string;
}

interface PatientFormDisplayProps {
  forms: FormSubmission[];
  loading?: boolean;
}

export function PatientFormDisplay({ forms, loading = false }: PatientFormDisplayProps) {
  const getFormTypeDisplay = (type: string) => {
    switch (type) {
      case 'pip':
        return { name: 'PIP Patient Form', icon: ClipboardList, color: 'bg-blue-500/10 text-blue-700' };
      case 'lop':
        return { name: 'LOP Form', icon: FileText, color: 'bg-green-500/10 text-green-700' };
      case 'cash':
        return { name: 'Cash Patient Form', icon: Users, color: 'bg-purple-500/10 text-purple-700' };
      case 'soap_questionnaire':
        return { name: 'Chiropractic SOAP Questionnaire', icon: Stethoscope, color: 'bg-medical-teal/10 text-medical-teal' };
      case 'lead_intake':
        return { name: 'Lead Intake Form', icon: UserPlus, color: 'bg-orange-500/10 text-orange-700' };
      default:
        return { name: type, icon: FileText, color: 'bg-gray-500/10 text-gray-700' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700"><Eye className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderFormData = (formData: any, formType: string) => {
    const sections = [];

    // Personal Information
    if (formData.firstName || formData.lastName) {
      sections.push(
        <div key="personal" className="space-y-3">
          <h4 className="font-semibold text-primary">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formData.firstName && (
              <div>
                <span className="font-medium">First Name:</span> {formData.firstName}
              </div>
            )}
            {formData.lastName && (
              <div>
                <span className="font-medium">Last Name:</span> {formData.lastName}
              </div>
            )}
            {formData.email && (
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
            )}
            {formData.cellPhone && (
              <div>
                <span className="font-medium">Phone:</span> {formData.cellPhone}
              </div>
            )}
            {formData.dob && (
              <div>
                <span className="font-medium">Date of Birth:</span> {formData.dob}
              </div>
            )}
            {formData.streetAddress && (
              <div className="col-span-2">
                <span className="font-medium">Address:</span> {formData.streetAddress}, {formData.city}, {formData.state} {formData.zipCode}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Medical History
    if (formData.painLocation || formData.painSeverity || formData.familyMedicalHistory || formData.smokingStatus || formData.smokingHistory) {
      sections.push(
        <div key="medical" className="space-y-3">
          <h4 className="font-semibold text-primary">Medical History</h4>
          <div className="space-y-2 text-sm">
            {formData.painLocation && (
              <div>
                <span className="font-medium">Pain Location:</span> {formData.painLocation}
              </div>
            )}
            {formData.painSeverity && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Pain Severity:</span> 
                <div className="flex items-center gap-2">
                  <span>{formData.painSeverity}/10</span>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < formData.painSeverity 
                            ? formData.painSeverity <= 3 
                              ? 'bg-green-500' 
                              : formData.painSeverity <= 6 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {formData.familyMedicalHistory && (
              <div>
                <span className="font-medium">Family Medical History:</span>
                <p className="mt-1 p-2 bg-muted rounded">{formData.familyMedicalHistory}</p>
              </div>
            )}
            {formData.smokingStatus && (
              <div>
                <span className="font-medium">Smoking Status:</span> {formData.smokingStatus}
              </div>
            )}
            {formData.smokingHistory && (
              <div>
                <span className="font-medium">Smoking History:</span>
                <p className="mt-1 p-2 bg-muted rounded">{formData.smokingHistory}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Accident Information
    if (formData.accidentDate || formData.accidentDescription) {
      sections.push(
        <div key="accident" className="space-y-3">
          <h4 className="font-semibold text-primary">Accident Information</h4>
          <div className="space-y-2 text-sm">
            {formData.accidentDate && (
              <div>
                <span className="font-medium">Date of Accident:</span> {formData.accidentDate}
              </div>
            )}
            {formData.accidentTime && (
              <div>
                <span className="font-medium">Time of Accident:</span> {formData.accidentTime}
              </div>
            )}
            {formData.accidentType && (
              <div>
                <span className="font-medium">Type of Accident:</span> {formData.accidentType}
              </div>
            )}
            {formData.accidentDescription && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 p-2 bg-muted rounded">{formData.accidentDescription}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Insurance Information
    if (formData.autoInsuranceCompany || formData.healthInsurance || formData.attorneyName) {
      sections.push(
        <div key="insurance" className="space-y-3">
          <h4 className="font-semibold text-primary">Insurance & Legal</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formData.autoInsuranceCompany && (
              <div>
                <span className="font-medium">Auto Insurance:</span> {formData.autoInsuranceCompany}
              </div>
            )}
            {formData.policyNumber && (
              <div>
                <span className="font-medium">Policy Number:</span> {formData.policyNumber}
              </div>
            )}
            {formData.healthInsurance && (
              <div>
                <span className="font-medium">Health Insurance:</span> {formData.healthInsurance}
              </div>
            )}
            {formData.attorneyName && (
              <div>
                <span className="font-medium">Attorney:</span> {formData.attorneyName}
              </div>
            )}
            {formData.attorneyPhone && (
              <div>
                <span className="font-medium">Attorney Phone:</span> {formData.attorneyPhone}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Symptoms (for forms that have them)
    if (formData.symptoms && typeof formData.symptoms === 'object') {
      const activeSymptoms = Object.entries(formData.symptoms)
        .filter(([_, active]) => active)
        .map(([symptom, _]) => symptom);

      if (activeSymptoms.length > 0) {
        sections.push(
          <div key="symptoms" className="space-y-3">
            <h4 className="font-semibold text-primary">Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {activeSymptoms.map((symptom) => (
                <Badge key={symptom} variant="outline" className="text-xs">
                  {symptom.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              ))}
            </div>
          </div>
        );
      }
    }

    return sections;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Forms Submitted</h3>
        <p className="text-muted-foreground">This patient hasn't submitted any forms yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {forms.map((form) => {
        const formTypeInfo = getFormTypeDisplay(form.form_type);
        const IconComponent = formTypeInfo.icon;
        
        return (
          <Card key={form.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${formTypeInfo.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">{formTypeInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {format(new Date(form.submitted_at), 'PPP')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(form.status)}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {formTypeInfo.name}
                      </DialogTitle>
                      <DialogDescription>
                        Submitted on {format(new Date(form.submitted_at), 'PPP')} at {format(new Date(form.submitted_at), 'HH:mm')}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      <div className="space-y-6">
                        {renderFormData(form.form_data, form.form_type)}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Quick preview of key form data */}
            <div className="text-sm text-muted-foreground">
              {form.form_data.firstName && form.form_data.lastName && (
                <span className="font-medium">{form.form_data.firstName} {form.form_data.lastName}</span>
              )}
              {form.form_data.email && (
                <span className="ml-2">• {form.form_data.email}</span>
              )}
              {form.form_data.cellPhone && (
                <span className="ml-2">• {form.form_data.cellPhone}</span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}