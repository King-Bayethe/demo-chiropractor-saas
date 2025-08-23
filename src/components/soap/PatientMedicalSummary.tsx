import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Activity, 
  Pill, 
  AlertTriangle,
  Heart,
  Brain,
  Stethoscope,
  User,
  ExternalLink
} from "lucide-react";

interface PatientMedicalSummaryProps {
  patient: any;
  showNavigationButton?: boolean;
}

export function PatientMedicalSummary({ patient, showNavigationButton = true }: PatientMedicalSummaryProps) {
  console.log('PatientMedicalSummary - Received patient data:', patient);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pain: false,
    history: false,
    systems: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const parseList = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return data.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const renderPainSeverity = (severity: number | null | undefined) => {
    if (!severity) return null;
    
    const getColor = (level: number) => {
      if (level <= 3) return "bg-success/20 text-success";
      if (level <= 6) return "bg-warning/20 text-warning";
      return "bg-destructive/20 text-destructive";
    };

    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={getColor(severity)}>
          Pain: {severity}/10
        </Badge>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm ${
                i < severity 
                  ? severity <= 3 
                    ? 'bg-success' 
                    : severity <= 6 
                    ? 'bg-warning' 
                    : 'bg-destructive'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSystemsFindings = (systemsData: any) => {
    if (!systemsData || typeof systemsData !== 'object') return null;

    const findings: Array<{ system: string; data: any; icon: any; color: string }> = [];
    
    const systemMap = [
      { key: 'neurological', name: 'Neurological', icon: Brain, color: 'text-purple-600' },
      { key: 'cardiovascular', name: 'Cardiovascular', icon: Heart, color: 'text-red-600' },
      { key: 'respiratory', name: 'Respiratory', icon: Stethoscope, color: 'text-blue-600' },
      { key: 'musculoskeletal', name: 'Musculoskeletal', icon: Activity, color: 'text-green-600' },
      { key: 'gastrointestinal', name: 'GI', icon: User, color: 'text-orange-600' },
      { key: 'genitourinary', name: 'GU', icon: User, color: 'text-teal-600' },
    ];

    systemMap.forEach(({ key, name, icon, color }) => {
      const systemData = systemsData[key];
      if (systemData && Object.keys(systemData).length > 0) {
        findings.push({ system: name, data: systemData, icon, color });
      }
    });

    if (findings.length === 0) return <p className="text-sm text-muted-foreground">No significant findings recorded</p>;

    return (
      <div className="grid grid-cols-2 gap-2">
        {findings.map(({ system, data, icon: Icon, color }) => (
          <div key={system} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-sm font-medium">{system}</span>
            <Badge variant="secondary" className="ml-auto">
              {Object.keys(data).length}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  const hasPainData = patient?.pain_severity || patient?.pain_location || patient?.pain_description;
  const hasMedicalHistory = patient?.current_medications || patient?.allergies || patient?.chronic_conditions || patient?.past_injuries;
  const hasSystemsReview = patient?.systems_review || patient?.medical_systems_review;

  return (
    <Card className="mb-4 bg-muted/30 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Medical Context
          </CardTitle>
          {showNavigationButton && (
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Full Profile
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Reference information from patient profile</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pain Assessment Summary - Always show */}
        <Collapsible open={openSections.pain} onOpenChange={() => toggleSection('pain')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Pain Assessment</span>
                {!hasPainData && <Badge variant="outline" className="text-xs text-muted-foreground">No data</Badge>}
              </div>
              {openSections.pain ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-6 space-y-2">
            {hasPainData ? (
              <>
                {patient?.pain_severity && renderPainSeverity(patient.pain_severity)}
                {patient?.pain_location && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Location:</p>
                    <p className="text-sm">{patient.pain_location}</p>
                  </div>
                )}
                {patient?.pain_frequency && (
                  <Badge variant="outline" className="text-xs">
                    Frequency: {patient.pain_frequency}
                  </Badge>
                )}
                {patient?.pain_quality && (
                  <Badge variant="outline" className="text-xs">
                    Quality: {patient.pain_quality}
                  </Badge>
                )}
                {patient?.functional_limitations && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Functional Impact:</p>
                    <p className="text-sm">{patient.functional_limitations}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                No pain assessment data recorded for this patient. Pain information can be added in the patient profile.
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Medical History Summary - Always show */}
        <Collapsible open={openSections.history} onOpenChange={() => toggleSection('history')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Medical History</span>
                {!hasMedicalHistory && <Badge variant="outline" className="text-xs text-muted-foreground">No data</Badge>}
              </div>
              {openSections.history ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-6 space-y-3">
            {hasMedicalHistory ? (
              <>
                {patient?.allergies && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Allergies:</p>
                    <div className="flex flex-wrap gap-1">
                      {parseList(patient.allergies).map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {patient?.current_medications && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Medications:</p>
                    <div className="flex flex-wrap gap-1">
                      {parseList(patient.current_medications).map((medication, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {patient?.chronic_conditions && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Chronic Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {parseList(patient.chronic_conditions).map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {patient?.past_injuries && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Past Injuries:</p>
                    <p className="text-sm">{patient.past_injuries}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                No medical history recorded for this patient. Medical history (medications, allergies, conditions) can be added in the patient profile.
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Systems Review Summary - Always show */}
        <Collapsible open={openSections.systems} onOpenChange={() => toggleSection('systems')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Systems Review</span>
                {!hasSystemsReview && <Badge variant="outline" className="text-xs text-muted-foreground">No data</Badge>}
              </div>
              {openSections.systems ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-6">
            {hasSystemsReview ? (
              <>
                {renderSystemsFindings(patient?.systems_review || patient?.medical_systems_review)}
                
                {patient?.current_symptoms && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {parseList(patient.current_symptoms).map((symptom, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                No systems review data recorded for this patient. Systems review information can be added in the patient profile.
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}