import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FAMILY_HISTORY_MAPPING } from '@/utils/soapFormMapping';
import { 
  Activity, 
  Pill, 
  AlertTriangle, 
  Bandage, 
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Edit,
  Plus
} from 'lucide-react';

interface MedicalHistoryCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  form?: any;
}

export const MedicalHistoryCard: React.FC<MedicalHistoryCardProps> = ({
  patient,
  isEditing,
  onEdit,
  form
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    medications: false,
    allergies: false,
    injuries: false,
    conditions: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const parseList = (text: string) => {
    if (!text) return [];
    return text.split(',').map(item => item.trim()).filter(Boolean);
  };

  const medications = parseList(patient.current_medications || '');
  const allergies = parseList(patient.allergies || '');
  const injuries = parseList(patient.past_injuries || '');
  const conditions = parseList(patient.chronic_conditions || '');

  // Pain Assessment
  const painInfo = {
    location: patient.pain_location,
    severity: patient.pain_severity
  };

  // Additional medical info
  const familyHistoryText = patient.family_medical_history;
  const smokingInfo = {
    status: patient.smoking_status,
    history: patient.smoking_history
  };
  const alcoholInfo = patient.alcohol_consumption;

  // Parse symptoms and family history from JSON fields
  const currentSymptoms = patient.current_symptoms ? 
    (typeof patient.current_symptoms === 'string' ? JSON.parse(patient.current_symptoms) : patient.current_symptoms) : {};
  
  // Parse family history conditions from family_medical_history field
  let familyHistoryConditionsData = {};
  let familyHistoryAdditionalNotes = '';
  
  if (patient.family_medical_history && typeof patient.family_medical_history === 'object') {
    const { additionalNotes, ...conditions } = patient.family_medical_history;
    familyHistoryConditionsData = conditions;
    familyHistoryAdditionalNotes = additionalNotes || '';
  } else if (typeof patient.family_medical_history === 'string') {
    familyHistoryAdditionalNotes = patient.family_medical_history;
  } else if (patient.systems_review) {
    familyHistoryConditionsData = typeof patient.systems_review === 'string' ? JSON.parse(patient.systems_review) : patient.systems_review;
  }

  // Symptom categories
  const symptomCategories = [
    {
      title: "Head & Neck",
      symptoms: ["headache", "neck_pain", "neck_stiff", "jaw_pain"]
    },
    {
      title: "Arms & Hands", 
      symptoms: ["tingling_arms_hands", "numbness_arms_hands", "pain_arms_hands", "loss_strength_arms"]
    },
    {
      title: "Back & Core",
      symptoms: ["back_pain", "chest_pain_rib", "shortness_breath"]
    },
    {
      title: "Legs & Feet",
      symptoms: ["loss_strength_legs", "pain_legs_feet", "numbness_legs_feet", "tingling_legs_feet"]
    },
    {
      title: "Neurological",
      symptoms: ["dizziness", "loss_memory", "loss_balance", "loss_smell"]
    },
    {
      title: "General",
      symptoms: ["fatigue", "irritability", "sleeping_problems", "nausea", "ears_ring"]
    }
  ];

  const sections = [
    {
      key: 'medications',
      title: 'Current Medications',
      icon: Pill,
      items: medications,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      key: 'allergies',
      title: 'Known Allergies',
      icon: AlertTriangle,
      items: allergies,
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      key: 'injuries',
      title: 'Past Injuries',
      icon: Bandage,
      items: injuries,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      key: 'conditions',
      title: 'Chronic Conditions',
      icon: Stethoscope,
      items: conditions,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Medical History
        </CardTitle>
        <Button 
          onClick={onEdit} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing && form ? (
          /* Edit Mode */
          <Form {...form}>
            <div className="space-y-4">
            <FormField
              control={form.control}
              name="currentMedications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="List current medications (comma-separated)"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Known Allergies</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="List known allergies (comma-separated)"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pastInjuries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Injuries</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="List past injuries (comma-separated)"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chronicConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chronic Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="List chronic conditions (comma-separated)"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="painLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Describe pain location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="painSeverity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Severity (0-10)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0" 
                        max="10" 
                        placeholder="0-10"
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="familyMedicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Medical History</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe family medical history"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="smokingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smoking Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select smoking status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="never_smoked">Never Smoked</SelectItem>
                        <SelectItem value="former_smoker">Former Smoker</SelectItem>
                        <SelectItem value="current_smoker">Current Smoker</SelectItem>
                        <SelectItem value="occasional_smoker">Occasional Smoker</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="smokingHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smoking History Details</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Pack years, quit date, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="alcoholConsumption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Consumption</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alcohol consumption level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="socially">Socially</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                      <SelectItem value="heavily">Heavily</SelectItem>
                      <SelectItem value="former_drinker">Former Drinker</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6 border-t pt-6">
              <div>
                <FormLabel className="text-base font-semibold mb-4 block">Current Symptoms</FormLabel>
                <p className="text-sm text-muted-foreground mb-4">Please check any symptoms you are currently experiencing:</p>
                <div className="space-y-4">
                  {symptomCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                      <h4 className="font-medium text-sm text-primary">{category.title}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.symptoms.map((symptom) => (
                          <FormField
                            key={symptom}
                            control={form.control}
                            name={`currentSymptoms.${symptom}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value || false}
                                    onChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel className="text-base font-semibold mb-4 block">Family Medical History</FormLabel>
                <p className="text-sm text-muted-foreground mb-4">Check conditions that apply to family members (parents, siblings, grandparents, aunts/uncles):</p>
                <div className="grid grid-cols-2 gap-2">
                  {FAMILY_HISTORY_MAPPING.map((mapping) => (
                    <FormField
                      key={mapping.soapField}
                      control={form.control}
                      name={`familyHistory.${mapping.soapField}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {mapping.description}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="otherMedicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Medical History</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any other relevant medical history"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </Form>
        ) : (
          /* View Mode */
          <div className="space-y-3">
            {sections.map(section => {
              const Icon = section.icon;
              const isOpen = openSections[section.key];
              const hasItems = section.items.length > 0;
              
              return (
                <Collapsible key={section.key} open={isOpen} onOpenChange={() => toggleSection(section.key)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-3 h-auto border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{section.title}</span>
                        {hasItems && (
                          <Badge variant="secondary" className="ml-2">
                            {section.items.length}
                          </Badge>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="pl-6 space-y-2">
                      {hasItems ? (
                        section.items.map((item, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-md border text-sm ${section.color}`}
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic p-2">
                          No {section.title.toLowerCase()} recorded
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {/* Pain Assessment */}
            {(painInfo.location || painInfo.severity) && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-red-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Pain Assessment
                </h4>
                <div className="space-y-3 bg-red-50 p-3 rounded-md border border-red-200">
                  {painInfo.location && (
                    <div>
                      <span className="text-xs font-medium text-red-600">Location:</span>
                      <p className="text-sm text-red-700 mt-1">{painInfo.location}</p>
                    </div>
                  )}
                  {painInfo.severity && (
                    <div>
                      <span className="text-xs font-medium text-red-600">Severity Level:</span>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-lg font-bold text-red-700">{painInfo.severity}/10</span>
                        <div className="flex space-x-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < painInfo.severity ? 'bg-red-500' : 'bg-red-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Smoking Status */}
            {(smokingInfo.status || smokingInfo.history) && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-yellow-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Smoking History
                </h4>
                <div className="space-y-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  {smokingInfo.status && (
                    <div>
                      <span className="text-xs font-medium text-yellow-600">Status:</span>
                      <p className="text-sm text-yellow-700 capitalize mt-1">{smokingInfo.status.replace('_', ' ')}</p>
                    </div>
                  )}
                  {smokingInfo.history && (
                    <div>
                      <span className="text-xs font-medium text-yellow-600">Details:</span>
                      <p className="text-sm text-yellow-700 mt-1">{smokingInfo.history}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alcohol Consumption */}
            {alcoholInfo && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-purple-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Alcohol Consumption
                </h4>
                <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                  <p className="text-sm text-purple-700 capitalize">{alcoholInfo.replace('_', ' ')}</p>
                </div>
              </div>
            )}

            {patient.other_medical_history && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Other Medical History</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {patient.other_medical_history}
                </p>
              </div>
            )}

            {/* Current Symptoms */}
            {Object.keys(currentSymptoms).some(key => currentSymptoms[key]) && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-blue-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Current Symptoms
                </h4>
                <div className="space-y-3">
                  {symptomCategories.map((category) => {
                    const categorySymptoms = category.symptoms.filter(symptom => currentSymptoms[symptom]);
                    if (categorySymptoms.length === 0) return null;
                    
                    return (
                      <div key={category.title} className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <h5 className="font-medium text-sm text-blue-600 mb-2">{category.title}</h5>
                        <div className="flex flex-wrap gap-2">
                          {categorySymptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Family Medical History - Using standardized mapping */}
            {((Object.keys(familyHistoryConditionsData).some(key => familyHistoryConditionsData[key])) || 
              (familyHistoryAdditionalNotes && familyHistoryAdditionalNotes.trim() !== '') ||
              (familyHistoryText && typeof familyHistoryText === 'string' && familyHistoryText.trim() !== '')) && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-emerald-700 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Family Medical History
                </h4>
                <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200">
                  {/* Structured condition badges using standardized mapping */}
                  {Object.keys(familyHistoryConditionsData).some(key => familyHistoryConditionsData[key]) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(familyHistoryConditionsData)
                        .filter(([key, value]) => value === true)
                        .map(([condition]) => {
                          // Find the matching mapping for display
                          const mapping = FAMILY_HISTORY_MAPPING.find(m => 
                            m.formField === condition || m.soapField === condition
                          );
                          const displayName = mapping ? mapping.description : 
                            condition.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                          
                          return (
                            <Badge key={condition} variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                              {displayName}
                            </Badge>
                          );
                        })}
                    </div>
                  )}
                  
                  {/* Text notes from new format */}
                  {familyHistoryAdditionalNotes && familyHistoryAdditionalNotes.trim() !== '' && (
                    <div className="text-sm text-emerald-900 leading-relaxed">
                      <span className="font-medium">Additional Notes: </span>
                      {familyHistoryAdditionalNotes}
                    </div>
                  )}
                  
                  {/* Legacy text notes support */}
                  {(!familyHistoryAdditionalNotes || familyHistoryAdditionalNotes.trim() === '') && 
                   familyHistoryText && typeof familyHistoryText === 'string' && familyHistoryText.trim() !== '' && (
                    <div className="text-sm text-emerald-900 leading-relaxed">
                      <span className="font-medium">Additional Notes: </span>
                      {familyHistoryText}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};