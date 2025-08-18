import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SOAPNote } from "@/hooks/useSOAPNotes";
import { SubjectiveData } from "./SubjectiveSection";
import { ObjectiveData } from "./ObjectiveSection";
import { AssessmentData } from "./AssessmentSection";
import { PlanData } from "./PlanSection";

interface SOAPNoteDisplayProps {
  note: SOAPNote;
  patientName: string;
}

export function SOAPNoteDisplay({ note, patientName }: SOAPNoteDisplayProps) {
  const subjectiveData = note.subjective_data as SubjectiveData;
  const objectiveData = note.objective_data as ObjectiveData;
  const assessmentData = note.assessment_data as AssessmentData;
  const planData = note.plan_data as PlanData;

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Patient Information</h3>
          <p className="font-medium">{patientName}</p>
          <p className="text-sm text-muted-foreground">ID: {note.patient_id.slice(-8)}</p>
          {note.is_draft && (
            <Badge variant="outline" className="mt-2">Draft</Badge>
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Provider & Date</h3>
          <p className="font-medium">{note.provider_name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(note.date_of_service).toLocaleDateString()} at{' '}
            {new Date(note.date_of_service).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Chief Complaint */}
      {note.chief_complaint && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{note.chief_complaint}</p>
          </CardContent>
        </Card>
      )}

      {/* Subjective Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subjective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjectiveData?.isWithinNormalLimits && (
            <Badge variant="secondary">Within Normal Limits</Badge>
          )}
          {subjectiveData?.isRefused && (
            <Badge variant="outline">Patient Refused Assessment</Badge>
          )}
          
          {subjectiveData?.symptoms && subjectiveData.symptoms.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {subjectiveData.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline">{symptom}</Badge>
                ))}
              </div>
            </div>
          )}

          {subjectiveData?.painScale !== null && subjectiveData?.painScale !== undefined && (
            <div>
              <h4 className="font-medium text-sm mb-2">Pain Scale</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{subjectiveData.painScale}/10</Badge>
                <span className="text-sm text-muted-foreground">
                  {subjectiveData.painScale === 0 ? 'No Pain' :
                   subjectiveData.painScale <= 3 ? 'Mild Pain' :
                   subjectiveData.painScale <= 6 ? 'Moderate Pain' :
                   'Severe Pain'}
                </span>
              </div>
            </div>
          )}

          {subjectiveData?.painDescription && (
            <div>
              <h4 className="font-medium text-sm mb-2">Pain Description</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{subjectiveData.painDescription}</p>
            </div>
          )}

          {subjectiveData?.otherSymptoms && (
            <div>
              <h4 className="font-medium text-sm mb-2">Other Symptoms</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{subjectiveData.otherSymptoms}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objective Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objective</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vital Signs */}
          {objectiveData?.vitalSigns && Object.values(objectiveData.vitalSigns).some(v => v) && (
            <div>
              <h4 className="font-medium text-sm mb-2">Vital Signs</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-3 rounded-md">
                {objectiveData.vitalSigns.height && (
                  <div>
                    <span className="text-xs text-muted-foreground">Height</span>
                    <p className="font-medium">{objectiveData.vitalSigns.height}</p>
                  </div>
                )}
                {objectiveData.vitalSigns.weight && (
                  <div>
                    <span className="text-xs text-muted-foreground">Weight</span>
                    <p className="font-medium">{objectiveData.vitalSigns.weight}</p>
                  </div>
                )}
                {objectiveData.vitalSigns.bloodPressure && (
                  <div>
                    <span className="text-xs text-muted-foreground">Blood Pressure</span>
                    <p className="font-medium">{objectiveData.vitalSigns.bloodPressure}</p>
                  </div>
                )}
                {objectiveData.vitalSigns.heartRate && (
                  <div>
                    <span className="text-xs text-muted-foreground">Heart Rate</span>
                    <p className="font-medium">{objectiveData.vitalSigns.heartRate}</p>
                  </div>
                )}
                {objectiveData.vitalSigns.temperature && (
                  <div>
                    <span className="text-xs text-muted-foreground">Temperature</span>
                    <p className="font-medium">{objectiveData.vitalSigns.temperature}</p>
                  </div>
                )}
                {objectiveData.vitalSigns.oxygenSaturation && (
                  <div>
                    <span className="text-xs text-muted-foreground">O2 Sat</span>
                    <p className="font-medium">{objectiveData.vitalSigns.oxygenSaturation}</p>
                  </div>
                )}
                {objectiveData.vitalSigns.respiratoryRate && (
                  <div>
                    <span className="text-xs text-muted-foreground">Respiratory Rate</span>
                    <p className="font-medium">{objectiveData.vitalSigns.respiratoryRate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Exams */}
          {objectiveData?.systemExams && objectiveData.systemExams.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">System Examinations</h4>
              <div className="space-y-2">
                {objectiveData.systemExams.map((exam, index) => (
                  <div key={index} className="bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{exam.system}</span>
                      <Badge variant={exam.isNormal ? "secondary" : "outline"}>
                        {exam.isNormal ? "Normal" : "Abnormal"}
                      </Badge>
                    </div>
                    {exam.notes && <p className="text-sm text-muted-foreground">{exam.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessmentData?.diagnoses && assessmentData.diagnoses.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Diagnoses</h4>
              <div className="space-y-2">
                {assessmentData.diagnoses.map((diagnosis, index) => (
                  <div key={index} className="bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{diagnosis.description}</span>
                      {diagnosis.code && (
                        <Badge variant="outline">{diagnosis.code}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assessmentData?.clinicalImpression && (
            <div>
              <h4 className="font-medium text-sm mb-2">Clinical Impression</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{assessmentData.clinicalImpression}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Treatments */}
          {planData?.treatments && planData.treatments.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Treatments</h4>
              <div className="flex flex-wrap gap-2">
                {planData.treatments.map((treatment, index) => (
                  <Badge key={index} variant="outline">{treatment}</Badge>
                ))}
              </div>
            </div>
          )}

          {planData?.customTreatment && (
            <div>
              <h4 className="font-medium text-sm mb-2">Custom Treatment Notes</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{planData.customTreatment}</p>
            </div>
          )}

          {/* Medications */}
          {planData?.medications && planData.medications.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Medications</h4>
              <div className="space-y-2">
                {planData.medications.map((medication, index) => (
                  <div key={index} className="bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {medication.genericName}
                        {medication.brandName && ` (${medication.brandName})`}
                      </span>
                      {medication.strength && (
                        <Badge variant="outline">{medication.strength}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-4">
                      {medication.quantity && <span>Qty: {medication.quantity}</span>}
                      {medication.frequency && <span>Freq: {medication.frequency}</span>}
                      {medication.refills && <span>Refills: {medication.refills}</span>}
                    </div>
                    {medication.isPrescribed && (
                      <Badge variant="secondary" className="mt-1">Prescribed</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {(planData?.followUpPeriod || planData?.customFollowUp) && (
            <div>
              <h4 className="font-medium text-sm mb-2">Follow-up</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md">
                {planData.customFollowUp || planData.followUpPeriod}
              </p>
            </div>
          )}

          {/* Legal Tags */}
          {planData?.legalTags && planData.legalTags.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Legal/Insurance Tags</h4>
              <div className="flex flex-wrap gap-2">
                {planData.legalTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Instructions */}
          {planData?.additionalInstructions && (
            <div>
              <h4 className="font-medium text-sm mb-2">Additional Instructions</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{planData.additionalInstructions}</p>
            </div>
          )}

          {/* Emergency Disclaimer */}
          {planData?.hasEmergencyDisclaimer && (
            <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded-r-md">
              <p className="text-xs text-amber-800">
                <strong>Emergency Disclaimer:</strong> If you experience severe pain, difficulty breathing, 
                chest pain, or any life-threatening symptoms, seek immediate medical attention by calling 911 
                or going to the nearest emergency room.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}