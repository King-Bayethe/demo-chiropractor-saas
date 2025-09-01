import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Stethoscope, 
  Edit, 
  Heart, 
  Wind, 
  Brain,
  Eye,
  Ear,
  Bone,
  Apple,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SystemsReviewCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  form?: any;
}

export const SystemsReviewCard: React.FC<SystemsReviewCardProps> = ({
  patient,
  isEditing,
  onEdit,
  form
}) => {
  const isMobile = useIsMobile();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const hasSystemsData = patient.systems_review && 
                        Object.keys(patient.systems_review).length > 0;

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const systemCategories = [
    {
      key: 'cardiovascular',
      title: 'Cardiovascular',
      icon: Heart,
      color: 'text-red-500 bg-red-50 border-red-200'
    },
    {
      key: 'respiratory',
      title: 'Respiratory',
      icon: Wind,
      color: 'text-blue-500 bg-blue-50 border-blue-200'
    },
    {
      key: 'neurological',
      title: 'Neurological',
      icon: Brain,
      color: 'text-purple-500 bg-purple-50 border-purple-200'
    },
    {
      key: 'musculoskeletal',
      title: 'Musculoskeletal',
      icon: Bone,
      color: 'text-orange-500 bg-orange-50 border-orange-200'
    },
    {
      key: 'gastrointestinal',
      title: 'Gastrointestinal',
      icon: Apple,
      color: 'text-green-500 bg-green-50 border-green-200'
    },
    {
      key: 'genitourinary',
      title: 'Genitourinary',
      icon: Zap,
      color: 'text-yellow-500 bg-yellow-50 border-yellow-200'
    },
    {
      key: 'ent',
      title: 'ENT (Eyes, Nose, Throat)',
      icon: Eye,
      color: 'text-indigo-500 bg-indigo-50 border-indigo-200'
    },
    {
      key: 'endocrine',
      title: 'Endocrine',
      icon: Stethoscope,
      color: 'text-pink-500 bg-pink-50 border-pink-200'
    }
  ];

  const renderSystemReview = (systemKey: string, systemData: any) => {
    if (!systemData || typeof systemData !== 'object') return null;

    const positiveFindings = Object.entries(systemData).filter(([_, value]) => value === true);
    const notes = systemData.notes || systemData.other || '';

    if (positiveFindings.length === 0 && !notes) return null;

    return (
      <div className="space-y-2">
        {positiveFindings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {positiveFindings.map(([finding, _]) => (
              <Badge key={finding} variant="secondary" className="text-xs">
                {finding.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            ))}
          </div>
        )}
        {notes && (
          <p className="text-sm text-muted-foreground italic bg-muted/30 p-2 rounded">
            {notes}
          </p>
        )}
      </div>
    );
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
          <Stethoscope className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
          Systems Review
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
          {isMobile ? "Edit Systems Review" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && form ? (
          /* Edit Mode */
          <Form {...form}>
            <div className="space-y-6">
              {/* Cardiovascular System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium text-foreground">Cardiovascular System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Chest Pain', 'Palpitations', 'Shortness of Breath', 'Swelling', 'Dizziness', 'Fainting'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`cardio-${symptom}`} />
                      <Label htmlFor={`cardio-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Respiratory System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-foreground">Respiratory System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Cough', 'Wheezing', 'Shortness of Breath', 'Chest Pain', 'Sputum Production', 'Night Sweats'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`resp-${symptom}`} />
                      <Label htmlFor={`resp-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neurological System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-foreground">Neurological System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Headache', 'Dizziness', 'Numbness', 'Tingling', 'Weakness', 'Memory Loss', 'Seizures', 'Vision Changes'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`neuro-${symptom}`} />
                      <Label htmlFor={`neuro-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Musculoskeletal System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Bone className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium text-foreground">Musculoskeletal System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Joint Pain', 'Muscle Pain', 'Stiffness', 'Swelling', 'Limited Range of Motion', 'Back Pain'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`musculo-${symptom}`} />
                      <Label htmlFor={`musculo-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gastrointestinal System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Apple className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium text-foreground">Gastrointestinal System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Constipation', 'Loss of Appetite'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`gi-${symptom}`} />
                      <Label htmlFor={`gi-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Genitourinary System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium text-foreground">Genitourinary System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Frequent Urination', 'Painful Urination', 'Blood in Urine', 'Incontinence', 'Kidney Pain'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`gu-${symptom}`} />
                      <Label htmlFor={`gu-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENT (Eyes, Nose, Throat) */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  <h4 className="font-medium text-foreground">ENT (Eyes, Nose, Throat)</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Vision Changes', 'Eye Pain', 'Hearing Loss', 'Ear Pain', 'Sore Throat', 'Nasal Congestion'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`ent-${symptom}`} />
                      <Label htmlFor={`ent-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endocrine System */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="h-4 w-4 text-pink-500" />
                  <h4 className="font-medium text-foreground">Endocrine System</h4>
                </div>
                <div className={cn(
                  "gap-3",
                  isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-3"
                )}>
                  {['Excessive Thirst', 'Frequent Urination', 'Weight Changes', 'Fatigue', 'Heat/Cold Intolerance'].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={`endo-${symptom}`} />
                      <Label htmlFor={`endo-${symptom}`} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Additional Notes</h4>
                <Textarea 
                  placeholder="Any additional symptoms or concerns not listed above..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </Form>
        ) : (
          /* View Mode */
          !hasSystemsData ? (
          <div className="text-center py-6 text-muted-foreground">
            <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No systems review data recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {systemCategories.map(category => {
              const Icon = category.icon;
              const systemData = patient.systems_review[category.key];
              const isOpen = openSections[category.key];
              const hasData = systemData && typeof systemData === 'object' && 
                           (Object.values(systemData).some(v => v === true) || 
                            systemData.notes || systemData.other);

              if (!hasData) return null;

              return (
                <Collapsible 
                  key={category.key} 
                  open={isOpen} 
                  onOpenChange={() => toggleSection(category.key)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-3 h-auto border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${category.color.split(' ')[0]}`} />
                        <span className="font-medium">{category.title}</span>
                        <Badge variant="secondary" className="ml-2">
                          {Object.values(systemData).filter(v => v === true).length} findings
                        </Badge>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className={`p-4 rounded-lg border ${category.color}`}>
                      {renderSystemReview(category.key, systemData)}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {/* Additional/Other Systems */}
            {patient.medical_systems_review && Object.keys(patient.medical_systems_review).length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-foreground mb-3">Additional Systems Review</h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(patient.medical_systems_review, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};