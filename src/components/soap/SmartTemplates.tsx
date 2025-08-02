import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, Target, Activity } from "lucide-react";

interface Template {
  id: string;
  name: string;
  complaint: string;
  description: string;
  icon: React.ReactNode;
  commonSymptoms: string[];
  commonDiagnoses: string[];
  recommendedTests: string[];
}

interface SmartTemplatesProps {
  onApplyTemplate: (template: Template) => void;
  chiefComplaint: string;
}

const templates: Template[] = [
  {
    id: "lower-back-pain",
    name: "Lower Back Pain",
    complaint: "Lower back pain",
    description: "Comprehensive template for lower back pain assessment",
    icon: <Activity className="w-4 h-4" />,
    commonSymptoms: ["Back pain", "Muscle stiffness", "Limited range of motion", "Pain radiating to legs"],
    commonDiagnoses: ["M54.5 - Low back pain", "M51.2 - Other intervertebral disc displacement"],
    recommendedTests: ["Straight leg raise", "Patrick's test", "Lumbar spine X-ray"]
  },
  {
    id: "neck-pain",
    name: "Neck Pain",
    complaint: "Neck pain and stiffness",
    description: "Structured assessment for cervical spine complaints",
    icon: <Target className="w-4 h-4" />,
    commonSymptoms: ["Neck pain", "Headache", "Shoulder tension", "Limited neck mobility"],
    commonDiagnoses: ["M54.2 - Cervicalgia", "M50.2 - Other cervical disc displacement"],
    recommendedTests: ["Spurling's test", "Distraction test", "Cervical spine X-ray"]
  },
  {
    id: "shoulder-pain",
    name: "Shoulder Pain",
    complaint: "Shoulder pain and weakness",
    description: "Complete shoulder examination protocol",
    icon: <Zap className="w-4 h-4" />,
    commonSymptoms: ["Shoulder pain", "Weakness", "Limited range of motion", "Night pain"],
    commonDiagnoses: ["M75.3 - Calcific tendinitis of shoulder", "M75.1 - Rotator cuff tear"],
    recommendedTests: ["Empty can test", "Hawkins test", "Shoulder MRI"]
  },
  {
    id: "general-pain",
    name: "General Assessment",
    complaint: "General musculoskeletal complaint",
    description: "Basic template for general complaints",
    icon: <Lightbulb className="w-4 h-4" />,
    commonSymptoms: ["Pain", "Stiffness", "Decreased function"],
    commonDiagnoses: ["M79.3 - Panniculitis unspecified"],
    recommendedTests: ["Range of motion assessment", "Strength testing"]
  }
];

export function SmartTemplates({ onApplyTemplate, chiefComplaint }: SmartTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Suggest templates based on chief complaint
  const getSuggestedTemplates = () => {
    const complaint = chiefComplaint.toLowerCase();
    
    if (complaint.includes("back") || complaint.includes("lumbar")) {
      return templates.filter(t => t.id === "lower-back-pain");
    }
    if (complaint.includes("neck") || complaint.includes("cervical")) {
      return templates.filter(t => t.id === "neck-pain");
    }
    if (complaint.includes("shoulder")) {
      return templates.filter(t => t.id === "shoulder-pain");
    }
    
    return templates.slice(0, 2); // Show first 2 as general suggestions
  };

  const suggestedTemplates = getSuggestedTemplates();

  return (
    <Card className="border-dashed border-medical-blue">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-medical-blue" />
          <CardTitle className="text-base">Smart Templates</CardTitle>
          {suggestedTemplates.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {suggestedTemplates.length} suggested
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(suggestedTemplates.length > 0 ? suggestedTemplates : templates.slice(0, 3)).map((template) => (
          <div
            key={template.id}
            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
              selectedTemplate === template.id
                ? "border-medical-blue bg-medical-blue-light"
                : "border-border hover:border-medical-blue/50"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {template.icon}
                <div>
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyTemplate(template);
                }}
                className="text-xs"
              >
                Apply
              </Button>
            </div>
            
            {selectedTemplate === template.id && (
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-medium">Common symptoms:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.commonSymptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs py-0">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Typical diagnoses:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.commonDiagnoses.map((diagnosis, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs py-0">
                        {diagnosis}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}