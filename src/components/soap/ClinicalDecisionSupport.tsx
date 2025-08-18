import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Brain, CheckCircle, Code, DollarSign, Info, Pill, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClinicalDecisionSupportProps {
  formData: any;
  onSuggestionApply?: (field: string, value: string) => void;
}

interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}

interface ComplianceWarning {
  guideline: string;
  issue: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'critical';
}

interface BillingCode {
  code: string;
  type: 'ICD-10' | 'CPT';
  description: string;
  confidence: number;
}

interface RealtimeSuggestion {
  suggestions: string[];
  type: 'completion' | 'correction' | 'enhancement';
  confidence: number;
  reasoning?: string;
}

export function ClinicalDecisionSupport({ formData, onSuggestionApply }: ClinicalDecisionSupportProps) {
  const { toast } = useToast();
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [complianceWarnings, setComplianceWarnings] = useState<ComplianceWarning[]>([]);
  const [billingCodes, setBillingCodes] = useState<BillingCode[]>([]);
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<RealtimeSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeChecks, setActiveChecks] = useState({
    drugInteractions: true,
    compliance: true,
    billing: true,
    realtime: true
  });

  // Extract medications from form data
  const getMedications = useCallback(() => {
    const medications: string[] = [];
    if (formData?.plan?.medications) {
      formData.plan.medications.forEach((med: any) => {
        if (typeof med === 'string') {
          medications.push(med);
        } else if (med.name) {
          medications.push(med.name);
        }
      });
    }
    return medications;
  }, [formData]);

  // Extract diagnoses from form data
  const getDiagnoses = useCallback(() => {
    const diagnoses: string[] = [];
    if (formData?.assessment?.diagnoses) {
      formData.assessment.diagnoses.forEach((diag: any) => {
        if (typeof diag === 'string') {
          diagnoses.push(diag);
        } else if (diag.name || diag.diagnosis) {
          diagnoses.push(diag.name || diag.diagnosis);
        }
      });
    }
    return diagnoses;
  }, [formData]);

  // Extract treatments from form data
  const getTreatments = useCallback(() => {
    const treatments: string[] = [];
    if (formData?.plan?.treatments) {
      formData.plan.treatments.forEach((treatment: any) => {
        if (typeof treatment === 'string') {
          treatments.push(treatment);
        } else if (treatment.name || treatment.treatment) {
          treatments.push(treatment.name || treatment.treatment);
        }
      });
    }
    return treatments;
  }, [formData]);

  // Drug interaction checking
  const checkDrugInteractions = useCallback(async () => {
    const medications = getMedications();
    if (medications.length < 2) {
      setDrugInteractions([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-smart-templates', {
        body: {
          action: 'drugInteraction',
          medications
        }
      });

      if (error) throw error;

      setDrugInteractions(data.interactions || []);
      
      if (data.hasInteractions && data.interactions?.length > 0) {
        const severeInteractions = data.interactions.filter((i: DrugInteraction) => i.severity === 'major');
        if (severeInteractions.length > 0) {
          toast({
            title: "⚠️ Major Drug Interactions Detected",
            description: `Found ${severeInteractions.length} major interaction(s). Review immediately.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error checking drug interactions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [getMedications, toast]);

  // Clinical guideline compliance checking
  const checkCompliance = useCallback(async () => {
    const diagnoses = getDiagnoses();
    const treatments = getTreatments();
    
    if (!formData?.chiefComplaint && diagnoses.length === 0) {
      setComplianceWarnings([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-smart-templates', {
        body: {
          action: 'complianceCheck',
          chiefComplaint: formData.chiefComplaint,
          diagnoses,
          treatments
        }
      });

      if (error) throw error;

      setComplianceWarnings(data.warnings || []);
      
      const criticalWarnings = data.warnings?.filter((w: ComplianceWarning) => w.severity === 'critical') || [];
      if (criticalWarnings.length > 0) {
        toast({
          title: "🚨 Critical Compliance Issues",
          description: `Found ${criticalWarnings.length} critical guideline violation(s).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking compliance:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, getDiagnoses, getTreatments, toast]);

  // Billing code optimization
  const optimizeBillingCodes = useCallback(async () => {
    const diagnoses = getDiagnoses();
    const treatments = getTreatments();
    
    if (!formData?.chiefComplaint && diagnoses.length === 0) {
      setBillingCodes([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-smart-templates', {
        body: {
          action: 'billingCodes',
          chiefComplaint: formData.chiefComplaint,
          diagnoses,
          treatments
        }
      });

      if (error) throw error;

      setBillingCodes(data.codes || []);
    } catch (error) {
      console.error('Error optimizing billing codes:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, getDiagnoses, getTreatments]);

  // Real-time suggestions for specific fields
  const getRealtimeSuggestions = useCallback(async (field: string, value: string) => {
    if (!activeChecks.realtime || !value || value.length < 3) {
      setRealtimeSuggestions(null);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gemini-smart-templates', {
        body: {
          action: 'realtimeSuggestion',
          currentField: field,
          currentValue: value,
          formData
        }
      });

      if (error) throw error;

      setRealtimeSuggestions(data);
    } catch (error) {
      console.error('Error getting realtime suggestions:', error);
    }
  }, [formData, activeChecks.realtime]);

  // Auto-run checks when form data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeChecks.drugInteractions) checkDrugInteractions();
      if (activeChecks.compliance) checkCompliance();
      if (activeChecks.billing) optimizeBillingCodes();
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [formData, activeChecks, checkDrugInteractions, checkCompliance, optimizeBillingCodes]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'major':
        return 'destructive';
      case 'warning':
      case 'moderate':
        return 'default';
      case 'info':
      case 'minor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'major':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
      case 'moderate':
        return <Info className="h-4 w-4" />;
      case 'info':
      case 'minor':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Clinical Decision Support
          {isAnalyzing && <Zap className="h-4 w-4 animate-pulse text-yellow-500" />}
        </CardTitle>
        <CardDescription>
          AI-powered clinical insights and safety checks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="interactions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interactions" className="flex items-center gap-1">
              <Pill className="h-3 w-3" />
              Drug Interactions
              {drugInteractions.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {drugInteractions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Guidelines
              {complianceWarnings.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {complianceWarnings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              Billing Codes
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="mt-4">
            <ScrollArea className="h-[300px]">
              {drugInteractions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Pill className="h-8 w-8 mb-2 opacity-50" />
                  <p>No drug interactions detected</p>
                  <p className="text-xs">Add medications to check for interactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drugInteractions.map((interaction, index) => (
                    <Alert key={index}>
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(interaction.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {interaction.medication1} ⚡ {interaction.medication2}
                            </span>
                            <Badge variant={getSeverityColor(interaction.severity)}>
                              {interaction.severity}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            <p className="mb-2">{interaction.description}</p>
                            <p className="font-medium text-primary">Recommendation: {interaction.recommendation}</p>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <ScrollArea className="h-[300px]">
              {complianceWarnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p>No compliance issues detected</p>
                  <p className="text-xs">Following clinical guidelines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complianceWarnings.map((warning, index) => (
                    <Alert key={index}>
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(warning.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{warning.guideline}</span>
                            <Badge variant={getSeverityColor(warning.severity)}>
                              {warning.severity}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            <p className="mb-2">{warning.issue}</p>
                            <p className="font-medium text-primary">Recommendation: {warning.recommendation}</p>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="billing" className="mt-4">
            <ScrollArea className="h-[300px]">
              {billingCodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Code className="h-8 w-8 mb-2 opacity-50" />
                  <p>No billing codes suggested</p>
                  <p className="text-xs">Add diagnoses and treatments for code suggestions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {billingCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{code.code}</span>
                          <Badge variant={code.type === 'ICD-10' ? 'default' : 'secondary'}>
                            {code.type}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(code.confidence * 100)}% confident
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{code.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <ScrollArea className="h-[300px]">
              {!realtimeSuggestions ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Zap className="h-8 w-8 mb-2 opacity-50" />
                  <p>AI suggestions will appear here</p>
                  <p className="text-xs">Start typing in form fields for real-time suggestions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Smart Suggestions</span>
                    <Badge variant="outline">
                      {Math.round(realtimeSuggestions.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  {realtimeSuggestions.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1 text-sm">{suggestion}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSuggestionApply?.('current', suggestion)}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                  {realtimeSuggestions.reasoning && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      <strong>Reasoning:</strong> {realtimeSuggestions.reasoning}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}