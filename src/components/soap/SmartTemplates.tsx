import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Brain, Lightbulb, Filter, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/contexts/AIContext';
import { 
  medicalTemplates, 
  medicalTemplateCategories,
  getTemplatesByCategory,
  searchTemplates,
  type MedicalTemplate 
} from '@/data/medicalTemplates';
import { TemplateManager } from './TemplateManager';

interface SmartTemplatesProps {
  onApplyTemplate: (template: MedicalTemplate) => void;
  chiefComplaint: string;
}

interface AIInsights {
  possibleDiagnoses: string[];
  recommendedQuestions: string[];
  clinicalNotes: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

// Response comes as flat structure from Gemini API
interface GeminiAnalysisResponse extends AIInsights {
  suggestedTemplates?: string[];
  autocompletions?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
}

export function SmartTemplates({ onApplyTemplate, chiefComplaint }: SmartTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { isAIEnabled, setQuotaExceeded } = useAI();

  // Get AI insights when chief complaint changes
  useEffect(() => {
    if (chiefComplaint && chiefComplaint.length > 10 && isAIEnabled('smartTemplates')) {
      analyzeChiefComplaint();
    }
  }, [chiefComplaint, isAIEnabled]);

  const analyzeChiefComplaint = async () => {
    if (isAnalyzing) return; // Prevent duplicate calls
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-smart-templates', {
        body: {
          action: 'analyze',
          chiefComplaint,
        }
      });

      if (error) {
        // Handle quota exceeded error gracefully
        if (error.message?.includes('quota') || data?.quotaExceeded) {
          setQuotaExceeded(true);
          toast({
            title: "AI Analysis Unavailable",
            description: "AI features are temporarily limited due to quota. You can continue creating SOAP notes manually.",
            variant: "default",
          });
          return;
        }
        throw error;
      }

      // API returns flat structure, not nested under aiInsights
      const response: GeminiAnalysisResponse = data;
      
      // Create AIInsights object from flat response
      const insights: AIInsights = {
        possibleDiagnoses: response.possibleDiagnoses || [],
        recommendedQuestions: response.recommendedQuestions || [],
        clinicalNotes: response.clinicalNotes || '',
        urgencyLevel: response.urgencyLevel || 'low',
      };
      
      setAiInsights(insights);
      
      if (insights.urgencyLevel === 'high') {
        toast({
          title: "High Urgency Alert",
          description: "This presentation may require immediate attention.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error analyzing chief complaint:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze chief complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuggestedTemplates = () => {
    if (!chiefComplaint) return [];
    
    const keywords = chiefComplaint.toLowerCase().split(' ');
    return medicalTemplates.filter(template => 
      keywords.some(keyword => 
        template.keywords.some(templateKeyword => 
          templateKeyword.toLowerCase().includes(keyword) ||
          keyword.includes(templateKeyword.toLowerCase())
        )
      )
    ).slice(0, 6);
  };

  const getFilteredTemplates = () => {
    let filtered = medicalTemplates;
    
    if (selectedCategory !== 'all') {
      filtered = getTemplatesByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      filtered = searchTemplates(searchQuery);
    }
    
    return filtered;
  };

  const handleApplyTemplate = (template: MedicalTemplate) => {
    onApplyTemplate(template);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied.`,
    });
  };

  const suggestedTemplates = getSuggestedTemplates();
  const filteredTemplates = getFilteredTemplates();
  const [showManager, setShowManager] = useState(false);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Smart Templates
              {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowManager(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </CardTitle>
          <CardDescription>
            AI-powered template suggestions and clinical insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {medicalTemplateCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="insights" disabled={!isAIEnabled('aiInsights')}>
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4 mt-4">
            {suggestedTemplates.length > 0 ? (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggested for "{chiefComplaint}"
                </h4>
                <div className="space-y-2">
                  {suggestedTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={setSelectedTemplate}
                      onApply={handleApplyTemplate}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Enter a chief complaint to get AI-powered suggestions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-4">
            {aiInsights ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        aiInsights.urgencyLevel === 'high' ? 'bg-red-500' :
                        aiInsights.urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      Urgency Level: {aiInsights.urgencyLevel.toUpperCase()}
                    </h5>
                    <p className="text-sm text-muted-foreground">{aiInsights.clinicalNotes}</p>
                  </div>

                  {aiInsights.possibleDiagnoses.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Possible Diagnoses</h5>
                      <div className="flex flex-wrap gap-1">
                        {aiInsights.possibleDiagnoses.map((diagnosis, index) => (
                          <Badge key={index} variant="secondary">
                            {diagnosis}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiInsights.recommendedQuestions.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Recommended Questions</h5>
                      <ul className="space-y-1">
                        {aiInsights.recommendedQuestions.map((question, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>AI insights will appear here after analyzing your chief complaint</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-4 mt-4">
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={setSelectedTemplate}
                  onApply={handleApplyTemplate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    <TemplateManager isOpen={showManager} onClose={() => setShowManager(false)} />
    </>
  );
}

interface TemplateCardProps {
  template: MedicalTemplate;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onApply: (template: MedicalTemplate) => void;
}

function TemplateCard({ template, isSelected, onSelect, onApply }: TemplateCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{template.icon}</span>
            <h5 className="font-medium text-sm">{template.name}</h5>
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {template.description}
          </p>
          
          {isSelected && (
            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {template.urgencyLevel} urgency
                </Badge>
                {template.ageGroups.map((age) => (
                  <Badge key={age} variant="outline" className="text-xs">
                    {age}
                  </Badge>
                ))}
              </div>
              
              <div>
                <span className="font-medium">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelect(isSelected ? null : template.id)}
            className="text-xs h-7"
          >
            {isSelected ? 'Hide' : 'View'}
          </Button>
          <Button
            size="sm"
            onClick={() => onApply(template)}
            className="text-xs h-7"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}