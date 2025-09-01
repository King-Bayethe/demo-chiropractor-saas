import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Edit, 
  MapPin, 
  BarChart3, 
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface PainAssessmentCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  form?: any;
}

export const PainAssessmentCard: React.FC<PainAssessmentCardProps> = ({
  patient,
  isEditing,
  onEdit,
  form
}) => {
  const isMobile = useIsMobile();
  const hasPainData = patient.pain_location || patient.pain_severity || 
                     patient.pain_description || patient.current_symptoms ||
                     patient.pain_frequency || patient.pain_quality ||
                     patient.symptom_changes || patient.functional_limitations;

  const renderPainSeverity = (severity: number) => {
    const color = severity <= 3 ? 'bg-green-500' : severity <= 6 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="flex items-center space-x-3">
        <span className="text-2xl font-bold">{severity}/10</span>
        <div className="flex space-x-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-6 rounded-sm ${
                i < severity ? color : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSymptoms = (symptoms: any) => {
    if (!symptoms || typeof symptoms !== 'object') return null;
    
    return Object.entries(symptoms).map(([key, value]) => {
      if (value === true || (typeof value === 'string' && value.length > 0)) {
        return (
          <Badge key={key} variant="secondary" className="mr-2 mb-2">
            {key.replace(/([A-Z])/g, ' $1').trim()}
            {typeof value === 'string' && value !== 'true' && `: ${value}`}
          </Badge>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const renderPainDescriptions = (descriptions: any) => {
    if (!descriptions || typeof descriptions !== 'object') return null;
    
    return Object.entries(descriptions).map(([key, value]) => {
      if (value === true) {
        return (
          <Badge key={key} variant="outline" className="mr-2 mb-2">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Badge>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <Card className="h-full">
      <CardHeader className={cn(
        "pb-4",
        isMobile ? "flex-col space-y-2" : "flex flex-row items-center justify-between space-y-0"
      )}>
        <CardTitle className={cn(
          "flex items-center gap-2 font-semibold",
          isMobile ? "text-base self-start" : "text-lg"
        )}>
          <Activity className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
          Pain Assessment
        </CardTitle>
        <Button 
          onClick={onEdit} 
          variant="outline" 
          size={isMobile ? "sm" : "sm"}
          className={cn(
            "flex items-center gap-2",
            isMobile && "w-full"
          )}
        >
          <Edit className="h-4 w-4" />
          {isMobile ? "Edit Pain Assessment" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && form ? (
          /* Edit Mode */
          <Form {...form}>
            <div className="space-y-6">
              {/* Pain Location Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium text-foreground">Pain Location</h4>
                </div>
                
                <FormField
                  control={form.control}
                  name="painLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where is the pain located?</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the location of pain (e.g., lower back, neck, head)"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pain Severity Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium text-foreground">Pain Severity Level</h4>
                </div>
                
                <FormField
                  control={form.control}
                  name="painSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate your pain (0-10 scale)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            value={[field.value || 0]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>0 - No Pain</span>
                            <span className="font-medium text-lg">{field.value || 0}/10</span>
                            <span>10 - Worst Pain</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pain Characteristics Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-foreground">Pain Characteristics</h4>
                </div>
                
                <div className={cn(
                  "gap-4",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-2"
                )}>
                  <FormField
                    control={form.control}
                    name="painFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pain Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How often?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="constant">Constant</SelectItem>
                            <SelectItem value="intermittent">Intermittent</SelectItem>
                            <SelectItem value="occasional">Occasional</SelectItem>
                            <SelectItem value="rare">Rare</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="painQuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pain Quality</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="What type?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sharp">Sharp</SelectItem>
                            <SelectItem value="dull">Dull</SelectItem>
                            <SelectItem value="burning">Burning</SelectItem>
                            <SelectItem value="stabbing">Stabbing</SelectItem>
                            <SelectItem value="throbbing">Throbbing</SelectItem>
                            <SelectItem value="aching">Aching</SelectItem>
                            <SelectItem value="cramping">Cramping</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Symptom Changes Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-foreground">Symptom Changes</h4>
                </div>
                
                <FormField
                  control={form.control}
                  name="symptomChanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How have your symptoms changed since the accident?</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe any changes in pain, mobility, or other symptoms"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Functional Limitations Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  <h4 className="font-medium text-foreground">Functional Limitations</h4>
                </div>
                
                <FormField
                  control={form.control}
                  name="functionalLimitations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What activities are difficult or impossible due to your injury?</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe limitations in work, daily activities, sports, etc."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        ) : (
          /* View Mode */
          !hasPainData ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pain assessment data recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pain Location */}
            {patient.pain_location && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Pain Location
                </h4>
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-sm text-red-700">{patient.pain_location}</p>
                </div>
              </div>
            )}

            {/* Pain Severity */}
            {patient.pain_severity !== null && patient.pain_severity !== undefined && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  Pain Severity Level
                </h4>
                <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                  {renderPainSeverity(patient.pain_severity)}
                </div>
              </div>
            )}

            {/* Pain Characteristics */}
            {(patient.pain_frequency || patient.pain_quality) && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  Pain Characteristics
                </h4>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-2"
                )}>
                  {patient.pain_frequency && (
                    <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                      <span className="text-xs font-medium text-purple-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Frequency:
                      </span>
                      <p className="text-sm text-purple-700 mt-1">{patient.pain_frequency}</p>
                    </div>
                  )}
                  {patient.pain_quality && (
                    <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                      <span className="text-xs font-medium text-purple-600">Quality:</span>
                      <p className="text-sm text-purple-700 mt-1">{patient.pain_quality}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pain Descriptions */}
            {patient.pain_description && Object.keys(patient.pain_description).length > 0 && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground">Pain Descriptors</h4>
                <div className="flex flex-wrap">
                  {renderPainDescriptions(patient.pain_description)}
                </div>
              </div>
            )}

            {/* Current Symptoms */}
            {patient.current_symptoms && Object.keys(patient.current_symptoms).length > 0 && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Current Symptoms
                </h4>
                <div className="flex flex-wrap">
                  {renderSymptoms(patient.current_symptoms)}
                </div>
              </div>
            )}

            {/* Symptom Changes */}
            {patient.symptom_changes && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Symptom Changes
                </h4>
                <p className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-700">
                  {patient.symptom_changes}
                </p>
              </div>
            )}

            {/* Functional Limitations */}
            {patient.functional_limitations && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  Functional Limitations
                </h4>
                <p className="text-sm bg-indigo-50 p-3 rounded-md border border-indigo-200 text-indigo-700">
                  {patient.functional_limitations}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};