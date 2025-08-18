import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, X, Save, Eye, Copy, Upload, Download, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { medicalTemplateCategories } from '@/data/medicalTemplates';
import { CustomTemplate } from '@/types/templates';

interface TemplateBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  existingTemplate?: CustomTemplate | null;
}

const AGE_GROUPS = ['Pediatric', 'Adult', 'Geriatric', 'All Ages'];
const URGENCY_LEVELS = ['low', 'medium', 'high'];
const SPECIALTIES = [
  'Primary Care', 'Emergency Medicine', 'Internal Medicine', 'Family Medicine',
  'Pediatrics', 'Geriatrics', 'Orthopedics', 'Neurology', 'Cardiology',
  'Dermatology', 'Psychiatry', 'Physical Therapy', 'Other'
];

export function TemplateBuilder({ isOpen, onClose, existingTemplate }: TemplateBuilderProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [template, setTemplate] = useState<CustomTemplate>(() => {
    const defaultTemplate: CustomTemplate = {
      name: '',
      description: '',
      category: 'Musculoskeletal',
      icon: '🩺',
      specialty: 'Primary Care',
      keywords: [],
      ageGroups: ['Adult'],
      urgencyLevel: 'medium',
      templateData: {
        chiefComplaint: '',
        subjectiveTemplate: {
          symptoms: [],
          painDescription: '',
          otherSymptoms: ''
        },
        objectiveTemplate: {
          systemExams: [],
          specialTests: []
        },
        assessmentTemplate: {
          diagnoses: [],
          clinicalImpression: ''
        },
        planTemplate: {
          treatments: [],
          medications: [],
          followUpPeriod: '',
          additionalInstructions: ''
        }
      }
    };

    return existingTemplate ? { ...defaultTemplate, ...existingTemplate } : defaultTemplate;
  });

  // Keywords management
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword && !template.keywords.includes(newKeyword)) {
      setTemplate(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setTemplate(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // Array field management helpers
  const addArrayItem = (section: string, field: string, item: string) => {
    if (!item.trim()) return;
    
    setTemplate(prev => {
      const sectionData = prev.templateData[section as keyof typeof prev.templateData] as any;
      const currentArray = sectionData[field] || [];
      
      return {
        ...prev,
        templateData: {
          ...prev.templateData,
          [section]: {
            ...sectionData,
            [field]: [...currentArray, item.trim()]
          }
        }
      };
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setTemplate(prev => {
      const sectionData = prev.templateData[section as keyof typeof prev.templateData] as any;
      const currentArray = sectionData[field] || [];
      
      return {
        ...prev,
        templateData: {
          ...prev.templateData,
          [section]: {
            ...sectionData,
            [field]: currentArray.filter((_: any, i: number) => i !== index)
          }
        }
      };
    });
  };

  const handleSave = async () => {
    if (!template.name || !template.description || !template.templateData.chiefComplaint) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, description, chief complaint).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const templateData = {
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        specialty: template.specialty,
        keywords: template.keywords,
        age_groups: template.ageGroups,
        urgency_level: template.urgencyLevel,
        template_data: template.templateData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      let result;
      if (existingTemplate?.id) {
        // Update existing template
        result = await supabase
          .from('custom_templates')
          .update(templateData)
          .eq('id', existingTemplate.id);
      } else {
        // Create new template
        result = await supabase
          .from('custom_templates')
          .insert(templateData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Template Saved",
        description: `${template.name} has been ${existingTemplate ? 'updated' : 'created'} successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl h-[85vh] overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {existingTemplate ? 'Edit Template' : 'Template Builder'}
                </CardTitle>
                <CardDescription>
                  Create custom SOAP templates for your practice
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="subjective">Subjective</TabsTrigger>
                  <TabsTrigger value="objective">Objective</TabsTrigger>
                  <TabsTrigger value="assessment">Assessment</TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[calc(85vh-160px)] px-6 pb-6">
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                          id="name"
                          value={template.name}
                          onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Lower Back Pain Assessment"
                        />
                      </div>
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <Input
                          id="icon"
                          value={template.icon}
                          onChange={(e) => setTemplate(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="🩺"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={template.description}
                        onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of when to use this template"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                      <Input
                        id="chiefComplaint"
                        value={template.templateData.chiefComplaint}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          templateData: {
                            ...prev.templateData,
                            chiefComplaint: e.target.value
                          }
                        }))}
                        placeholder="e.g., Lower back pain"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={template.category}
                          onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {medicalTemplateCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="specialty">Specialty</Label>
                        <Select
                          value={template.specialty}
                          onValueChange={(value) => setTemplate(prev => ({ ...prev, specialty: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SPECIALTIES.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select
                          value={template.urgencyLevel}
                          onValueChange={(value: 'low' | 'medium' | 'high') => 
                            setTemplate(prev => ({ ...prev, urgencyLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {URGENCY_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Age Groups</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AGE_GROUPS.map((age) => (
                          <Button
                            key={age}
                            variant={template.ageGroups.includes(age) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setTemplate(prev => ({
                                ...prev,
                                ageGroups: prev.ageGroups.includes(age)
                                  ? prev.ageGroups.filter(a => a !== age)
                                  : [...prev.ageGroups, age]
                              }));
                            }}
                          >
                            {age}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Keywords</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Add keyword"
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        />
                        <Button onClick={addKeyword} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {keyword}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeKeyword(keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="subjective" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Common Symptoms</Label>
                      <TemplateArrayBuilder
                        items={template.templateData.subjectiveTemplate.symptoms}
                        onAdd={(item) => addArrayItem('subjectiveTemplate', 'symptoms', item)}
                        onRemove={(index) => removeArrayItem('subjectiveTemplate', 'symptoms', index)}
                        placeholder="e.g., Sharp pain, Muscle stiffness"
                      />
                    </div>

                    <div>
                      <Label>Pain Description Template</Label>
                      <Textarea
                        value={template.templateData.subjectiveTemplate.painDescription}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          templateData: {
                            ...prev.templateData,
                            subjectiveTemplate: {
                              ...prev.templateData.subjectiveTemplate,
                              painDescription: e.target.value
                            }
                          }
                        }))}
                        placeholder="Template for pain description..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Other Symptoms Notes</Label>
                      <Textarea
                        value={template.templateData.subjectiveTemplate.otherSymptoms}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          templateData: {
                            ...prev.templateData,
                            subjectiveTemplate: {
                              ...prev.templateData.subjectiveTemplate,
                              otherSymptoms: e.target.value
                            }
                          }
                        }))}
                        placeholder="Additional subjective notes template..."
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="objective" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>System Examinations</Label>
                      <TemplateArrayBuilder
                        items={template.templateData.objectiveTemplate.systemExams}
                        onAdd={(item) => addArrayItem('objectiveTemplate', 'systemExams', item)}
                        onRemove={(index) => removeArrayItem('objectiveTemplate', 'systemExams', index)}
                        placeholder="e.g., Musculoskeletal, Neurological"
                      />
                    </div>

                    <div>
                      <Label>Special Tests</Label>
                      <TemplateArrayBuilder
                        items={template.templateData.objectiveTemplate.specialTests}
                        onAdd={(item) => addArrayItem('objectiveTemplate', 'specialTests', item)}
                        onRemove={(index) => removeArrayItem('objectiveTemplate', 'specialTests', index)}
                        placeholder="e.g., Straight leg raise, McMurray test"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Common Diagnoses</Label>
                      <TemplateArrayBuilder
                        items={template.templateData.assessmentTemplate.diagnoses}
                        onAdd={(item) => addArrayItem('assessmentTemplate', 'diagnoses', item)}
                        onRemove={(index) => removeArrayItem('assessmentTemplate', 'diagnoses', index)}
                        placeholder="e.g., Lumbar strain, Disc herniation"
                      />
                    </div>

                    <div>
                      <Label>Clinical Impression Template</Label>
                      <Textarea
                        value={template.templateData.assessmentTemplate.clinicalImpression}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          templateData: {
                            ...prev.templateData,
                            assessmentTemplate: {
                              ...prev.templateData.assessmentTemplate,
                              clinicalImpression: e.target.value
                            }
                          }
                        }))}
                        placeholder="Clinical impression template..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Common Treatments</Label>
                      <TemplateArrayBuilder
                        items={template.templateData.planTemplate.treatments}
                        onAdd={(item) => addArrayItem('planTemplate', 'treatments', item)}
                        onRemove={(index) => removeArrayItem('planTemplate', 'treatments', index)}
                        placeholder="e.g., Physical therapy, Heat/ice therapy"
                      />
                    </div>

                    <div>
                      <Label>Common Medications</Label>
                      <TemplateArrayBuilder
                        items={template.templateData.planTemplate.medications}
                        onAdd={(item) => addArrayItem('planTemplate', 'medications', item)}
                        onRemove={(index) => removeArrayItem('planTemplate', 'medications', index)}
                        placeholder="e.g., Ibuprofen 400mg TID, Muscle relaxant"
                      />
                    </div>

                    <div>
                      <Label>Follow-up Period</Label>
                      <Input
                        value={template.templateData.planTemplate.followUpPeriod}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          templateData: {
                            ...prev.templateData,
                            planTemplate: {
                              ...prev.templateData.planTemplate,
                              followUpPeriod: e.target.value
                            }
                          }
                        }))}
                        placeholder="e.g., 2 weeks, 1 month"
                      />
                    </div>

                    <div>
                      <Label>Additional Instructions</Label>
                      <Textarea
                        value={template.templateData.planTemplate.additionalInstructions}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          templateData: {
                            ...prev.templateData,
                            planTemplate: {
                              ...prev.templateData.planTemplate,
                              additionalInstructions: e.target.value
                            }
                          }
                        }))}
                        placeholder="Additional plan instructions template..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TemplateArrayBuilderProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

function TemplateArrayBuilder({ items, onAdd, onRemove, placeholder }: TemplateArrayBuilderProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem);
      setNewItem('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
            <span className="text-sm">{item}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}