import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UnifiedSOAPNote } from "@/types/soap";
import { 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Thermometer, 
  Activity,
  ClipboardList,
  Stethoscope,
  Brain,
  Pill,
  AlertTriangle 
} from "lucide-react";

interface UnifiedSOAPViewerProps {
  soapNote: UnifiedSOAPNote;
  patientName: string;
}

export function UnifiedSOAPViewer({ soapNote, patientName }: UnifiedSOAPViewerProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderVitalSigns = (vitalSigns: any) => {
    if (!vitalSigns || Object.keys(vitalSigns).length === 0) return null;

    const vitals = [
      { label: 'Height', value: vitalSigns.height, icon: <Activity className="w-4 h-4" /> },
      { label: 'Weight', value: vitalSigns.weight, icon: <Activity className="w-4 h-4" /> },
      { label: 'BP', value: vitalSigns.bloodPressure, icon: <Heart className="w-4 h-4" /> },
      { label: 'HR', value: vitalSigns.heartRate, icon: <Heart className="w-4 h-4" /> },
      { label: 'Temp', value: vitalSigns.temperature, icon: <Thermometer className="w-4 h-4" /> },
      { label: 'O2 Sat', value: vitalSigns.oxygenSaturation, icon: <Activity className="w-4 h-4" /> },
      { label: 'RR', value: vitalSigns.respiratoryRate, icon: <Activity className="w-4 h-4" /> }
    ].filter(vital => vital.value);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {vitals.map((vital, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
            {vital.icon}
            <div>
              <p className="text-xs text-muted-foreground">{vital.label}</p>
              <p className="font-medium text-sm">{vital.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSymptoms = (symptoms: string[]) => {
    if (!symptoms || symptoms.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {symptoms.map((symptom, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {symptom}
          </Badge>
        ))}
      </div>
    );
  };

  const renderDiagnoses = (diagnoses: any[]) => {
    if (!diagnoses || diagnoses.length === 0) return null;

    return (
      <div className="space-y-3">
        {diagnoses.map((diagnosis, index) => (
          <div key={index} className="p-3 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{diagnosis.condition}</h4>
              {diagnosis.isPrimary && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  Primary
                </Badge>
              )}
            </div>
            {diagnosis.icd10Code && (
              <p className="text-xs text-muted-foreground mb-1">
                ICD-10: {diagnosis.icd10Code}
              </p>
            )}
            {diagnosis.description && (
              <p className="text-sm">{diagnosis.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMedications = (medications: any[]) => {
    if (!medications || medications.length === 0) return null;

    return (
      <div className="space-y-3">
        {medications.map((medication, index) => (
          <div key={index} className="p-3 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{medication.name}</h4>
              <Badge variant="outline" className="text-xs">
                {medication.route || 'PO'}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
              <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
              {medication.duration && (
                <p><span className="font-medium">Duration:</span> {medication.duration}</p>
              )}
              {medication.instructions && (
                <p><span className="font-medium">Instructions:</span> {medication.instructions}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">SOAP Note</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{patientName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(soapNote.date_of_service)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{soapNote.provider_name}</span>
                </div>
              </div>
            </div>
            <Badge variant={soapNote.is_draft ? "secondary" : "default"}>
              {soapNote.is_draft ? "Draft" : "Complete"}
            </Badge>
          </div>
          {soapNote.chief_complaint && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <h3 className="font-medium text-sm mb-1">Chief Complaint</h3>
              <p className="text-sm">{soapNote.chief_complaint}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* SOAP Sections */}
      <div className="grid gap-6">
        {/* Subjective */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Subjective</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {soapNote.subjective_data?.symptoms && soapNote.subjective_data.symptoms.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Symptoms</h4>
                {renderSymptoms(soapNote.subjective_data.symptoms)}
              </div>
            )}
            
            {soapNote.subjective_data?.painScale !== null && soapNote.subjective_data?.painScale !== undefined && (
              <div>
                <h4 className="font-medium text-sm mb-2">Pain Scale</h4>
                <Badge variant="outline" className="text-sm">
                  {soapNote.subjective_data.painScale}/10
                </Badge>
              </div>
            )}
            
            {soapNote.subjective_data?.painDescription && (
              <div>
                <h4 className="font-medium text-sm mb-2">Pain Description</h4>
                <p className="text-sm">{soapNote.subjective_data.painDescription}</p>
              </div>
            )}
            
            {soapNote.subjective_data?.otherSymptoms && (
              <div>
                <h4 className="font-medium text-sm mb-2">Additional Symptoms</h4>
                <p className="text-sm">{soapNote.subjective_data.otherSymptoms}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objective */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-green-600" />
              <span>Objective</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {soapNote.vital_signs && (
              <div>
                <h4 className="font-medium text-sm mb-3">Vital Signs</h4>
                {renderVitalSigns(soapNote.vital_signs)}
              </div>
            )}
            
            {soapNote.objective_data?.systemExams && soapNote.objective_data.systemExams.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">System Exams</h4>
                <div className="space-y-2">
                  {soapNote.objective_data.systemExams.map((exam: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/20 rounded text-sm">
                      <span className="font-medium">{exam.system}:</span> {exam.findings}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {soapNote.assessment_data?.diagnoses && soapNote.assessment_data.diagnoses.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3">Diagnoses</h4>
                {renderDiagnoses(soapNote.assessment_data.diagnoses)}
              </div>
            )}
            
            {soapNote.assessment_data?.clinicalImpression && (
              <div>
                <h4 className="font-medium text-sm mb-2">Clinical Impression</h4>
                <p className="text-sm">{soapNote.assessment_data.clinicalImpression}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-orange-600" />
              <span>Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {soapNote.plan_data?.treatments && soapNote.plan_data.treatments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3">Treatments</h4>
                <div className="space-y-2">
                  {soapNote.plan_data.treatments.map((treatment: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/20 rounded text-sm">
                      <span className="font-medium">{treatment.name}:</span> {treatment.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {soapNote.plan_data?.medications && soapNote.plan_data.medications.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3">Medications</h4>
                {renderMedications(soapNote.plan_data.medications)}
              </div>
            )}
            
            {soapNote.plan_data?.followUpPeriod && (
              <div>
                <h4 className="font-medium text-sm mb-2">Follow-up</h4>
                <p className="text-sm">{soapNote.plan_data.followUpPeriod}</p>
              </div>
            )}
            
            {soapNote.plan_data?.additionalInstructions && (
              <div>
                <h4 className="font-medium text-sm mb-2">Additional Instructions</h4>
                <p className="text-sm">{soapNote.plan_data.additionalInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}