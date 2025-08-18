import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Edit, Trash2, Eye, BarChart3, Settings, Clock, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TemplateBuilder } from './TemplateBuilder';
import { CustomTemplate, TemplateUsage } from '@/types/templates';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateManager({ isOpen, onClose }: TemplateManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [usage, setUsage] = useState<TemplateUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadUsageAnalytics();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform database data to match interface
      const transformedData = (data || []).map(item => ({
        ...item,
        ageGroups: item.age_groups || [],
        urgencyLevel: item.urgency_level as 'low' | 'medium' | 'high',
        templateData: typeof item.template_data === 'object' && item.template_data ? 
          item.template_data as any : {
            chiefComplaint: '',
            subjectiveTemplate: { symptoms: [], painDescription: '', otherSymptoms: '' },
            objectiveTemplate: { systemExams: [], specialTests: [] },
            assessmentTemplate: { diagnoses: [], clinicalImpression: '' },
            planTemplate: { treatments: [], medications: [], followUpPeriod: '', additionalInstructions: '' }
          }
      })) as CustomTemplate[];
      
      setTemplates(transformedData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('template_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsage(data || []);
    } catch (error) {
      console.error('Error loading usage analytics:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const toggleTemplateStatus = async (templateId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_templates')
        .update({ is_active: !isActive })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, is_active: !isActive } : t
      ));

      toast({
        title: isActive ? "Template Deactivated" : "Template Activated",
        description: `Template has been ${isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      console.error('Error updating template status:', error);
      toast({
        title: "Error",
        description: "Failed to update template status.",
        variant: "destructive",
      });
    }
  };

  const getUsageStats = () => {
    const totalUsage = usage.length;
    const uniqueTemplates = new Set(usage.map(u => u.template_id)).size;
    const thisWeek = usage.filter(u => {
      const usageDate = new Date(u.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return usageDate >= weekAgo;
    }).length;

    return { totalUsage, uniqueTemplates, thisWeek };
  };

  const getPopularTemplates = () => {
    const templateUsageCount = usage.reduce((acc, u) => {
      acc[u.template_name] = (acc[u.template_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(templateUsageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myTemplates = filteredTemplates;
  const pendingApproval = filteredTemplates.filter(t => !t.is_approved);
  const approvedTemplates = filteredTemplates.filter(t => t.is_approved);

  const stats = getUsageStats();
  const popularTemplates = getPopularTemplates();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl h-[90vh] overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Template Manager
                </CardTitle>
                <CardDescription>
                  Manage your custom SOAP templates and view usage analytics
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowBuilder(true)}
                  className="bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="my-templates">My Templates</TabsTrigger>
                  <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
              </div>

              {/* Search and Filter Controls */}
              <div className="px-6 py-4 border-b">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Musculoskeletal">Musculoskeletal</SelectItem>
                      <SelectItem value="Neurological">Neurological</SelectItem>
                      <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="Respiratory">Respiratory</SelectItem>
                      <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                      <SelectItem value="Dermatological">Dermatological</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[calc(90vh-240px)]">
                <TabsContent value="my-templates" className="p-6 pt-0">
                  <TemplateList
                    templates={myTemplates}
                    onEdit={(template) => {
                      setEditingTemplate(template);
                      setShowBuilder(true);
                    }}
                    onDelete={deleteTemplate}
                    onToggleStatus={toggleTemplateStatus}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="pending" className="p-6 pt-0">
                  <TemplateList
                    templates={pendingApproval}
                    onEdit={(template) => {
                      setEditingTemplate(template);
                      setShowBuilder(true);
                    }}
                    onDelete={deleteTemplate}
                    onToggleStatus={toggleTemplateStatus}
                    isLoading={isLoading}
                    showApprovalStatus
                  />
                </TabsContent>

                <TabsContent value="approved" className="p-6 pt-0">
                  <TemplateList
                    templates={approvedTemplates}
                    onEdit={(template) => {
                      setEditingTemplate(template);
                      setShowBuilder(true);
                    }}
                    onDelete={deleteTemplate}
                    onToggleStatus={toggleTemplateStatus}
                    isLoading={isLoading}
                    showApprovalStatus
                  />
                </TabsContent>

                <TabsContent value="analytics" className="p-6 pt-0">
                  <div className="space-y-6">
                    {/* Usage Statistics */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.totalUsage}</div>
                          <p className="text-xs text-muted-foreground">
                            Templates used this month
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.uniqueTemplates}</div>
                          <p className="text-xs text-muted-foreground">
                            Unique templates used
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.thisWeek}</div>
                          <p className="text-xs text-muted-foreground">
                            Uses in the last 7 days
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Popular Templates */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Most Popular Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {popularTemplates.map(([name, count], index) => (
                            <div key={name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{index + 1}</Badge>
                                <span className="font-medium">{name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{count} uses</span>
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(count / Math.max(...popularTemplates.map(([,c]) => c))) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Usage */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Recent Template Usage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Template</TableHead>
                              <TableHead>Chief Complaint</TableHead>
                              <TableHead>Date Used</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usage.slice(0, 10).map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.template_name}</TableCell>
                                <TableCell>{item.chief_complaint}</TableCell>
                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Template Builder Dialog */}
      <TemplateBuilder
        isOpen={showBuilder}
        onClose={() => {
          setShowBuilder(false);
          setEditingTemplate(null);
          loadTemplates(); // Refresh templates after saving
        }}
        existingTemplate={editingTemplate}
      />
    </div>
  );
}

interface TemplateListProps {
  templates: CustomTemplate[];
  onEdit: (template: CustomTemplate) => void;
  onDelete: (templateId: string) => void;
  onToggleStatus: (templateId: string, isActive: boolean) => void;
  isLoading: boolean;
  showApprovalStatus?: boolean;
}

function TemplateList({ 
  templates, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isLoading, 
  showApprovalStatus 
}: TemplateListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <Settings className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No templates found</h3>
        <p className="text-muted-foreground">Create your first custom template to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{template.icon}</span>
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="outline">{template.category}</Badge>
                  {showApprovalStatus && (
                    <Badge variant={template.is_approved ? "default" : "secondary"}>
                      {template.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  )}
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {template.keywords.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.keywords.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(template.id, template.is_active)}
                >
                  {template.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{template.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(template.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}