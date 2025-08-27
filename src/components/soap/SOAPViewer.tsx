import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SOAPNote } from "@/hooks/useSOAPNotes";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  Target, 
  Clipboard,
  Stethoscope,
  Heart,
  Thermometer,
  Weight,
  Pill,
  CalendarCheck
} from "lucide-react";
import { format } from "date-fns";

interface SOAPViewerProps {
  soapNote: SOAPNote;
}

export function SOAPViewer({ soapNote }: SOAPViewerProps) {
  const getPatientName = () => {
    if (soapNote.patients) {
      return `${soapNote.patients.first_name} ${soapNote.patients.last_name}`.trim();
    }
    return 'Unknown Patient';
  };

  const renderVitalSigns = (vitalSigns: any) => {
    if (!vitalSigns || Object.keys(vitalSigns).length === 0) {
      return (
        <div className="text-muted-foreground text-sm italic">
          No vital signs recorded
        </div>
      );
    }

    const vitals = [
      { label: 'Height', value: vitalSigns.height, unit: 'cm', icon: Activity },
      { label: 'Weight', value: vitalSigns.weight, unit: 'kg', icon: Weight },
      { label: 'Blood Pressure', value: vitalSigns.bloodPressure, unit: 'mmHg', icon: Heart },
      { label: 'Heart Rate', value: vitalSigns.heartRate, unit: 'bpm', icon: Activity },
      { label: 'Temperature', value: vitalSigns.temperature, unit: '°C', icon: Thermometer },
      { label: 'O₂ Saturation', value: vitalSigns.oxygenSaturation, unit: '%', icon: Activity },
      { label: 'Respiratory Rate', value: vitalSigns.respiratoryRate, unit: '/min', icon: Activity },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {vitals.map((vital) => {
          if (!vital.value) return null;
          const Icon = vital.icon;
          
          return (
            <div key={vital.label} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{vital.label}</span>
              </div>
              <div className="text-lg font-semibold">
                {vital.value} <span className="text-sm text-muted-foreground">{vital.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSymptoms = (symptoms: string[]) => {
    if (!symptoms || symptoms.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {symptoms.map((symptom, index) => (
          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
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
          <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-orange-900">
                {diagnosis.condition || diagnosis.description || diagnosis.name}
              </h4>
              {(diagnosis.icd10 || diagnosis.code) && (
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  {diagnosis.icd10 || diagnosis.code}
                </Badge>
              )}
            </div>
            {diagnosis.description && diagnosis.condition && (
              <p className="text-sm text-orange-800">{diagnosis.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTreatments = (treatments: string[]) => {
    if (!treatments || treatments.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {treatments.map((treatment, index) => (
          <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm font-medium text-purple-900">{treatment}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderMedications = (medications: any[]) => {
    if (!medications || medications.length === 0) return null;

    return (
      <div className="space-y-3">
        {medications.map((med, index) => (
          <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Pill className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">
                    {med.brandName || med.genericName || med.name || 'Medication'}
                  </h4>
                  {med.isPrescribed !== undefined && (
                    <Badge variant={med.isPrescribed ? "default" : "secondary"}>
                      {med.isPrescribed ? "Prescribed" : "OTC"}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                  {med.strength && <div><span className="font-medium">Strength:</span> {med.strength}</div>}
                  {med.quantity && <div><span className="font-medium">Quantity:</span> {med.quantity}</div>}
                  {med.frequency && <div><span className="font-medium">Frequency:</span> {med.frequency}</div>}
                  {med.refills && <div><span className="font-medium">Refills:</span> {med.refills}</div>}
                  {med.dosage && <div><span className="font-medium">Dosage:</span> {med.dosage}</div>}
                  {med.duration && <div><span className="font-medium">Duration:</span> {med.duration}</div>}
                  {med.route && <div><span className="font-medium">Route:</span> {med.route}</div>}
                  {med.diagnosisCode && <div><span className="font-medium">Diagnosis Code:</span> {med.diagnosisCode}</div>}
                </div>
                {med.instructions && (
                  <div className="mt-2 text-sm text-green-700">
                    <span className="font-medium">Instructions:</span> {med.instructions}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{soapNote.chief_complaint || 'SOAP Note'}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {getPatientName()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(soapNote.date_of_service), 'PPP')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {format(new Date(soapNote.created_at), 'p')}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {soapNote.provider_name}
              </Badge>
              {soapNote.is_draft ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Draft
                </Badge>
              ) : (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SOAP Content */}
      <Tabs defaultValue="subjective" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="subjective" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
            <Clipboard className="w-4 h-4 mr-2" />
            Subjective
          </TabsTrigger>
          <TabsTrigger value="objective" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
            <Stethoscope className="w-4 h-4 mr-2" />
            Objective
          </TabsTrigger>
          <TabsTrigger value="assessment" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800">
            <Target className="w-4 h-4 mr-2" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="plan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
            <CalendarCheck className="w-4 h-4 mr-2" />
            Plan
          </TabsTrigger>
        </TabsList>

        {/* Subjective Tab */}
        <TabsContent value="subjective">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-300/10 border-b border-blue-200/20">
              <CardTitle className="flex items-center text-blue-800">
                <Clipboard className="w-5 h-5 mr-2" />
                Subjective Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {soapNote.subjective_data?.symptoms && (
                    <div>
                      <h3 className="font-semibold mb-3">Reported Symptoms</h3>
                      {renderSymptoms(soapNote.subjective_data.symptoms)}
                    </div>
                  )}

                  {soapNote.subjective_data?.painScale !== null && soapNote.subjective_data?.painScale !== undefined && (
                    <div>
                      <h3 className="font-semibold mb-3">Pain Assessment</h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-blue-800">
                            {soapNote.subjective_data.painScale}/10
                          </div>
                          <div className="text-sm text-blue-700">Pain Scale</div>
                        </div>
                        {soapNote.subjective_data.painDescription && typeof soapNote.subjective_data.painDescription === 'string' && (
                          <div className="mt-3 text-sm text-blue-800">
                            <span className="font-medium">Description:</span> {soapNote.subjective_data.painDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {soapNote.subjective_data?.otherSymptoms && (
                    <div>
                      <h3 className="font-semibold mb-3">Additional Information</h3>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm">{soapNote.subjective_data.otherSymptoms}</p>
                      </div>
                    </div>
                  )}

                  {(soapNote.subjective_data?.isRefused || soapNote.subjective_data?.isWithinNormalLimits) && (
                    <div>
                      <h3 className="font-semibold mb-3">Status</h3>
                      <div className="flex gap-2">
                        {soapNote.subjective_data.isRefused && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Patient Refused Assessment
                          </Badge>
                        )}
                        {soapNote.subjective_data.isWithinNormalLimits && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Within Normal Limits
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objective Tab */}
        <TabsContent value="objective">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-300/10 border-b border-green-200/20">
              <CardTitle className="flex items-center text-green-800">
                <Stethoscope className="w-5 h-5 mr-2" />
                Objective Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Vital Signs</h3>
                    {renderVitalSigns(soapNote.vital_signs || soapNote.objective_data?.vitalSigns)}
                  </div>

                  {soapNote.objective_data?.systemExams && soapNote.objective_data.systemExams.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-3">System Examinations</h3>
                      <div className="space-y-3">
                        {soapNote.objective_data.systemExams.map((exam: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="font-medium text-green-900 mb-1">{exam.system}</div>
                            <div className="text-sm text-green-800">{exam.findings}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {soapNote.objective_data?.specialTests && soapNote.objective_data.specialTests.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-3">Special Tests</h3>
                      <div className="space-y-3">
                        {soapNote.objective_data.specialTests.map((test: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="font-medium text-green-900 mb-1">{test.name}</div>
                            <div className="text-sm text-green-800">{test.result}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-300/10 border-b border-orange-200/20">
              <CardTitle className="flex items-center text-orange-800">
                <Target className="w-5 h-5 mr-2" />
                Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {soapNote.assessment_data?.diagnoses && (
                    <div>
                      <h3 className="font-semibold mb-4">Diagnoses</h3>
                      {renderDiagnoses(soapNote.assessment_data.diagnoses)}
                    </div>
                  )}

                  {soapNote.assessment_data?.clinicalImpression && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-3">Clinical Impression</h3>
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">{soapNote.assessment_data.clinicalImpression}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-300/10 border-b border-purple-200/20">
              <CardTitle className="flex items-center text-purple-800">
                <CalendarCheck className="w-5 h-5 mr-2" />
                Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {soapNote.plan_data?.treatments && soapNote.plan_data.treatments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">Treatments</h3>
                      {renderTreatments(soapNote.plan_data.treatments)}
                    </div>
                  )}

                  {soapNote.plan_data?.medications && soapNote.plan_data.medications.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-4">Medications</h3>
                      {renderMedications(soapNote.plan_data.medications)}
                    </div>
                  )}

                  {soapNote.plan_data?.followUpPeriod && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-3">Follow-up</h3>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CalendarCheck className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">{soapNote.plan_data.followUpPeriod}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {soapNote.plan_data?.additionalInstructions && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-3">Additional Instructions</h3>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-purple-800">{soapNote.plan_data.additionalInstructions}</p>
                      </div>
                    </div>
                  )}

                  {soapNote.plan_data?.legalTags && soapNote.plan_data.legalTags.length > 0 && (
                    <div>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-3">Legal Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {soapNote.plan_data.legalTags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}