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
  const familyHistory = patient.family_medical_history;
  const smokingInfo = {
    status: patient.smoking_status,
    history: patient.smoking_history
  };

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

            {/* Family Medical History */}
            {familyHistory && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-green-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Family Medical History
                </h4>
                <p className="text-sm bg-green-50 p-3 rounded-md border border-green-200 text-green-700">
                  {familyHistory}
                </p>
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

            {patient.other_medical_history && (
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Other Medical History</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {patient.other_medical_history}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};