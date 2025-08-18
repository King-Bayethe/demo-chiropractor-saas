import { ChiropracticSubjectiveData } from "@/components/soap/ChiropracticSubjectiveSection";
import { ChiropracticObjectiveData } from "@/components/soap/ChiropracticObjectiveSection";
import { SubjectiveData } from "@/components/soap/SubjectiveSection";
import { ObjectiveData, VitalSigns, SystemExam, SpecialTest } from "@/components/soap/ObjectiveSection";
import { AssessmentData } from "@/components/soap/AssessmentSection";
import { PlanData } from "@/components/soap/PlanSection";

export interface WizardData {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  dateCreated: Date;
  chiefComplaint: string;
  isQuickNote: boolean;
  subjective: ChiropracticSubjectiveData;
  objective: ChiropracticObjectiveData;
  assessment: AssessmentData;
  plan: PlanData;
}

export interface StandardSOAPData {
  patient_id: string;
  provider_name: string;
  date_of_service: Date;
  chief_complaint: string;
  is_draft: boolean;
  subjective_data: SubjectiveData;
  objective_data: ObjectiveData;
  assessment_data: AssessmentData;
  plan_data: PlanData;
  vital_signs?: VitalSigns;
}

/**
 * Converts chiropractic-specific data structure to standard SOAP data structure
 */
export function convertChiropracticToStandardSOAP(wizardData: WizardData): StandardSOAPData {
  console.log('Converting chiropractic data to standard SOAP format:', wizardData);

  // Convert vital signs from chiropractic format to standard format
  const vitalSigns: VitalSigns = {
    height: wizardData.objective.vitalSigns?.height || "",
    weight: wizardData.objective.vitalSigns?.weight || "",
    bloodPressure: wizardData.objective.vitalSigns?.bp || "",
    heartRate: wizardData.objective.vitalSigns?.hr || "",
    temperature: wizardData.objective.vitalSigns?.temp || "",
    oxygenSaturation: wizardData.objective.vitalSigns?.oxygenSaturation || "",
    respiratoryRate: wizardData.objective.vitalSigns?.resp || "",
  };

  // Convert subjective data from chiropractic to standard format
  const subjectiveData: SubjectiveData = {
    symptoms: wizardData.subjective.mainComplaints || [],
    painScale: wizardData.subjective.painRating?.[0] || null,
    painDescription: [
      wizardData.subjective.painDescriptions?.join(', '),
      wizardData.subjective.painBetter ? `Better with: ${wizardData.subjective.painBetter}` : '',
      wizardData.subjective.painWorse ? `Worse with: ${wizardData.subjective.painWorse}` : '',
      wizardData.subjective.painRadiate ? `Radiation: ${wizardData.subjective.painRadiate}` : '',
    ].filter(Boolean).join('. '),
    otherSymptoms: [
      wizardData.subjective.otherSymptoms,
      wizardData.subjective.otherComplaint,
      wizardData.subjective.medications ? `Medications: ${wizardData.subjective.medications}` : '',
    ].filter(Boolean).join('. '),
    isRefused: wizardData.subjective.isRefused || false,
    isWithinNormalLimits: wizardData.subjective.isWithinNormalLimits || false,
  };

  // Convert special tests from chiropractic format
  const specialTests: SpecialTest[] = [];
  const orthopedicTests = wizardData.objective.orthopedicTests;
  
  if (orthopedicTests?.slr) {
    specialTests.push({
      name: "Straight Leg Raise",
      result: orthopedicTests.slr,
      notes: orthopedicTests.slrAngle ? `Angle: ${orthopedicTests.slrAngle}` : ""
    });
  }
  
  if (orthopedicTests?.kemps) {
    specialTests.push({
      name: "Kemp's Test",
      result: orthopedicTests.kemps,
      notes: orthopedicTests.kempsSide ? `Side: ${orthopedicTests.kempsSide}` : ""
    });
  }
  
  if (orthopedicTests?.faber) {
    specialTests.push({
      name: "FABER Test",
      result: orthopedicTests.faber,
      notes: orthopedicTests.faberSide ? `Side: ${orthopedicTests.faberSide}` : ""
    });
  }
  
  if (orthopedicTests?.yeoman) {
    specialTests.push({
      name: "Yeoman Test",
      result: orthopedicTests.yeoman,
      notes: ""
    });
  }
  
  if (orthopedicTests?.otherTests) {
    specialTests.push({
      name: "Other Tests",
      result: "Performed",
      notes: orthopedicTests.otherTests
    });
  }

  // Convert system exams from chiropractic format
  const systemExams: SystemExam[] = [];
  
  // Add musculoskeletal findings as system exam
  const musculoskeletalFindings = [
    wizardData.objective.muscleTone ? `Muscle tone: ${wizardData.objective.muscleTone}` : '',
    wizardData.objective.tenderness ? `Tenderness: ${wizardData.objective.tenderness}` : '',
    wizardData.objective.triggerPoints ? `Trigger points: ${wizardData.objective.triggerPoints}` : '',
    wizardData.objective.jointFixation ? `Joint fixation: ${wizardData.objective.jointFixation}` : '',
    wizardData.objective.edema ? `Edema: ${wizardData.objective.edema}${wizardData.objective.edemaLocation ? ` at ${wizardData.objective.edemaLocation}` : ''}` : '',
    wizardData.objective.reflexes ? `Reflexes: ${wizardData.objective.reflexes}` : '',
    wizardData.objective.sensation ? `Sensation: ${wizardData.objective.sensation}${wizardData.objective.sensationLocation ? ` at ${wizardData.objective.sensationLocation}` : ''}` : '',
    wizardData.objective.strength ? `Strength: ${wizardData.objective.strength}${wizardData.objective.strengthMuscle ? ` - ${wizardData.objective.strengthMuscle}` : ''}` : '',
    wizardData.objective.posture?.length ? `Posture: ${wizardData.objective.posture.join(', ')}` : '',
    wizardData.objective.gait?.length ? `Gait: ${wizardData.objective.gait.join(', ')}${wizardData.objective.gaitOther ? ` - ${wizardData.objective.gaitOther}` : ''}` : '',
  ].filter(Boolean);

  if (musculoskeletalFindings.length > 0) {
    systemExams.push({
      system: "Musculoskeletal",
      isNormal: false,
      isAbnormal: true,
      notes: musculoskeletalFindings.join('. '),
      isRefused: false
    });
  }

  // Add range of motion information
  const romFindings = [];
  const rom = wizardData.objective.rangeOfMotion;
  
  if (rom?.cervical && Object.values(rom.cervical).some(v => v)) {
    const cervicalRom = Object.entries(rom.cervical)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    if (cervicalRom) romFindings.push(`Cervical ROM: ${cervicalRom}`);
  }
  
  if (rom?.thoracic && Object.values(rom.thoracic).some(v => v)) {
    const thoracicRom = Object.entries(rom.thoracic)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    if (thoracicRom) romFindings.push(`Thoracic ROM: ${thoracicRom}`);
  }
  
  if (rom?.lumbar && Object.values(rom.lumbar).some(v => v)) {
    const lumbarRom = Object.entries(rom.lumbar)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    if (lumbarRom) romFindings.push(`Lumbar ROM: ${lumbarRom}`);
  }

  if (romFindings.length > 0) {
    // Add to existing musculoskeletal exam or create new one
    const musculoskeletalIndex = systemExams.findIndex(exam => exam.system === "Musculoskeletal");
    if (musculoskeletalIndex >= 0) {
      systemExams[musculoskeletalIndex].notes += '. ' + romFindings.join('. ');
    } else {
      systemExams.push({
        system: "Musculoskeletal",
        isNormal: false,
        isAbnormal: true,
        notes: romFindings.join('. '),
        isRefused: false
      });
    }
  }

  // Convert objective data from chiropractic to standard format
  const objectiveData: ObjectiveData = {
    vitalSigns,
    systemExams,
    specialTests,
    imagingLabs: wizardData.objective.imagingLabs || [],
    procedures: wizardData.objective.procedures || [],
  };

  const standardData: StandardSOAPData = {
    patient_id: wizardData.patientId,
    provider_name: wizardData.providerName,
    date_of_service: wizardData.dateCreated,
    chief_complaint: wizardData.chiefComplaint,
    is_draft: wizardData.isQuickNote,
    subjective_data: subjectiveData,
    objective_data: objectiveData,
    assessment_data: wizardData.assessment,
    plan_data: wizardData.plan,
    vital_signs: vitalSigns,
  };

  console.log('Converted standard SOAP data:', standardData);
  return standardData;
}

/**
 * Validates the converted data to ensure required fields are present
 */
export function validateSOAPData(data: StandardSOAPData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.patient_id) {
    errors.push('Patient ID is required');
  }

  if (!data.provider_name) {
    errors.push('Provider name is required');
  }

  if (!data.chief_complaint?.trim()) {
    errors.push('Chief complaint is required');
  }

  if (!data.date_of_service) {
    errors.push('Date of service is required');
  }

  // Check if at least one section has data
  const hasSubjectiveData = data.subjective_data.symptoms?.length > 0 || 
                           data.subjective_data.painScale !== null || 
                           data.subjective_data.painDescription?.trim() || 
                           data.subjective_data.otherSymptoms?.trim() ||
                           data.subjective_data.isRefused ||
                           data.subjective_data.isWithinNormalLimits;

  const hasObjectiveData = Object.values(data.objective_data.vitalSigns || {}).some(v => v) ||
                          data.objective_data.systemExams?.length > 0 ||
                          data.objective_data.specialTests?.length > 0 ||
                          data.objective_data.imagingLabs?.length > 0 ||
                          data.objective_data.procedures?.length > 0;

  const hasAssessmentData = data.assessment_data.diagnoses?.length > 0 || 
                           data.assessment_data.clinicalImpression?.trim();

  const hasPlanData = data.plan_data.treatments?.length > 0 ||
                     data.plan_data.medications?.length > 0 ||
                     data.plan_data.additionalInstructions?.trim();

  if (!hasSubjectiveData && !hasObjectiveData && !hasAssessmentData && !hasPlanData) {
    errors.push('At least one SOAP section must contain data');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}