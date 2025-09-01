import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Activity,
  Heart,
  Stethoscope,
  AlertTriangle,
  Pill,
  Wind,
  Brain,
  BarChart3,
  Zap
} from 'lucide-react';

interface EnhancedPatientContextHeaderProps {
  patient: any;
  showNavigationButton?: boolean;
}

export const EnhancedPatientContextHeader: React.FC<EnhancedPatientContextHeaderProps> = ({
  patient,
  showNavigationButton = true
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    painAssessment: false,
    medicalHistory: false,
    systemsReview: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPatientName = () => {
    if (!patient) return 'Unknown Patient';
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    return `${firstName} ${lastName}`.trim() || patient.email || 'Unknown Patient';
  };

  const getPatientAge = () => {
    if (!patient?.date_of_birth) return null;
    const birthDate = new Date(patient.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleViewProfile = () => {
    navigate(`/patients/${patient.id}`);
  };

  // Parse medical data
  const parseList = (text: string) => {
    if (!text) return [];
    return text.split(',').map(item => item.trim()).filter(Boolean);
  };

  const medications = parseList(patient?.current_medications || '');
  const allergies = parseList(patient?.allergies || '');
  const conditions = parseList(patient?.chronic_conditions || '');

  // Pain assessment summary
  const hasPainData = patient?.pain_location || patient?.pain_severity !== null;
  
  // Systems review summary
  const systemsReview = patient?.systems_review;
  const hasSystemsData = systemsReview && Object.keys(systemsReview).length > 0;

  // Current symptoms
  const currentSymptoms = patient?.current_symptoms || {};
  const hasCurrentSymptoms = Object.keys(currentSymptoms).length > 0;

  const renderPainSeverity = (severity: number) => {
    if (severity === null || severity === undefined) return null;
    const color = severity <= 3 ? 'bg-green-500' : severity <= 6 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold">{severity}/10</span>
        <div className="flex space-x-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm ${
                i < severity ? color : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSystemsFindings = () => {
    if (!hasSystemsData) return null;
    
    const systemCategories = [
      { key: 'cardiovascular', title: 'Cardiovascular', icon: Heart, color: 'text-red-500' },
      { key: 'respiratory', title: 'Respiratory', icon: Wind, color: 'text-blue-500' },
      { key: 'neurological', title: 'Neurological', icon: Brain, color: 'text-purple-500' },
      { key: 'musculoskeletal', title: 'Musculoskeletal', icon: Activity, color: 'text-orange-500' }
    ];

    const findingsCount = systemCategories.reduce((total, category) => {
      const systemData = systemsReview[category.key];
      if (systemData && typeof systemData === 'object') {
        return total + Object.values(systemData).filter(v => v === true).length;
      }
      return total;
    }, 0);

    if (findingsCount === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {findingsCount} findings
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {systemCategories.map(category => {
            const systemData = systemsReview[category.key];
            if (!systemData) return null;
            
            const findings = Object.entries(systemData).filter(([_, value]) => value === true);
            if (findings.length === 0) return null;

            const Icon = category.icon;
            return (
              <div key={category.key} className="bg-muted/50 p-2 rounded text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Icon className={`h-3 w-3 ${category.color}`} />
                  <span className="font-medium">{category.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {findings.length} symptom{findings.length > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("mb-6 shadow-lg border-primary/20", isMobile ? "mx-0" : "")}>
      <CardHeader className={cn("bg-gradient-to-r from-primary/5 to-primary/10 border-b", 
        isMobile ? "p-4" : ""
      )}>
        <div className={cn("flex justify-between",
          isMobile ? "flex-col space-y-3" : "items-center"
        )}>
          <div className={cn("flex space-x-4",
            isMobile ? "items-start" : "items-center"
          )}>
            <div className={cn("bg-primary/20 rounded-full flex items-center justify-center",
              isMobile ? "w-10 h-10 mt-1" : "w-12 h-12"
            )}>
              <User className={cn("text-primary", isMobile ? "w-5 h-5" : "w-6 h-6")} />
            </div>
            <div className="flex-1">
              <CardTitle className={cn("font-bold text-foreground",
                isMobile ? "text-lg" : "text-xl"
              )}>
                {getPatientName()}
              </CardTitle>
              <div className={cn("text-sm text-muted-foreground mt-1",
                isMobile ? "flex flex-col space-y-1" : "flex items-center space-x-4"
              )}>
                {patient?.case_type && (
                  <Badge variant="outline" className={cn("bg-accent/20",
                    isMobile ? "self-start text-xs" : ""
                  )}>
                    {patient.case_type}
                  </Badge>
                )}
                {patient?.date_of_birth && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span className={isMobile ? "text-xs" : ""}>
                      DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                      {getPatientAge() && (
                        <span className="text-xs ml-1">({getPatientAge()} years)</span>
                      )}
                    </span>
                  </div>
                )}
                {patient?.phone && !isMobile && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {(patient?.city || patient?.state) && !isMobile && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{[patient.city, patient.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
              
              {/* Mobile-specific contact info */}
              {isMobile && (patient?.phone || patient?.city || patient?.state) && (
                <div className="flex flex-col space-y-1 mt-2 text-xs text-muted-foreground">
                  {patient?.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {(patient?.city || patient?.state) && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{[patient.city, patient.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {showNavigationButton && (
            <Button 
              onClick={handleViewProfile} 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className={cn("flex items-center gap-2",
                isMobile ? "self-start text-xs px-3 py-1.5" : ""
              )}
            >
              <ExternalLink className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              {isMobile ? "View Profile" : "View Full Profile"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", isMobile ? "p-4" : "p-6")}>
        {/* Pain Assessment Section */}
        {hasPainData && (
          <Collapsible open={openSections.painAssessment} onOpenChange={() => toggleSection('painAssessment')}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn("w-full justify-between border rounded-lg hover:bg-muted/50",
                  isMobile ? "p-2 h-auto" : "p-3 h-auto"
                )}
              >
                <div className="flex items-center gap-2">
                  <Activity className={cn("text-red-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <span className={cn("font-medium", isMobile ? "text-sm" : "")}>Pain Assessment</span>
                  {patient?.pain_severity !== null && (
                    <Badge variant="secondary" className={cn("bg-red-100 text-red-700",
                      isMobile ? "ml-1 text-xs px-1.5 py-0.5" : "ml-2"
                    )}>
                      {patient.pain_severity}/10
                    </Badge>
                  )}
                </div>
                {openSections.painAssessment ? (
                  <ChevronDown className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                ) : (
                  <ChevronRight className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className={cn("bg-red-50 rounded-lg border border-red-200 space-y-3",
                isMobile ? "p-3" : "p-4"
              )}>
                {patient?.pain_location && (
                  <div>
                    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location:
                    </span>
                    <p className="text-sm text-red-700 mt-1">{patient.pain_location}</p>
                  </div>
                )}
                {patient?.pain_severity !== null && (
                  <div>
                    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Severity:
                    </span>
                    <div className="mt-1">
                      {renderPainSeverity(patient.pain_severity)}
                    </div>
                  </div>
                )}
                {(patient?.pain_frequency || patient?.pain_quality) && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {patient?.pain_frequency && (
                      <div>
                        <span className="text-xs font-medium text-red-600">Frequency:</span>
                        <p className="text-sm text-red-700">{patient.pain_frequency}</p>
                      </div>
                    )}
                    {patient?.pain_quality && (
                      <div>
                        <span className="text-xs font-medium text-red-600">Quality:</span>
                        <p className="text-sm text-red-700">{patient.pain_quality}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Medical History Section */}
        {(medications.length > 0 || allergies.length > 0 || conditions.length > 0) && (
          <Collapsible open={openSections.medicalHistory} onOpenChange={() => toggleSection('medicalHistory')}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-3 h-auto border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Medical History</span>
                  <div className="flex gap-1 ml-2">
                    {allergies.length > 0 && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                        {allergies.length} allergies
                      </Badge>
                    )}
                    {medications.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {medications.length} meds
                      </Badge>
                    )}
                  </div>
                </div>
                {openSections.medicalHistory ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-3">
                {allergies.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">Allergies</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {medications.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Current Medications</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {conditions.length > 0 && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">Chronic Conditions</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Systems Review Section */}
        {(hasSystemsData || hasCurrentSymptoms) && (
          <Collapsible open={openSections.systemsReview} onOpenChange={() => toggleSection('systemsReview')}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-3 h-auto border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Current Symptoms & Systems Review</span>
                  {hasCurrentSymptoms && (
                    <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                      {Object.values(currentSymptoms).filter(Boolean).length} symptoms
                    </Badge>
                  )}
                </div>
                {openSections.systemsReview ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                {hasCurrentSymptoms && (
                  <div>
                    <span className="text-sm font-medium text-purple-700 mb-2 block">Current Symptoms:</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(currentSymptoms).map(([symptom, value]) => {
                        if (value === true) {
                          return (
                            <Badge key={symptom} variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                              {symptom.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
                
                {hasSystemsData && (
                  <div>
                    <span className="text-sm font-medium text-purple-700 mb-2 block">Systems Review:</span>
                    {renderSystemsFindings()}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};