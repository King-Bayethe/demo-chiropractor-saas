import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Plus, Search, Check } from "lucide-react";

interface AssessmentSectionProps {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
}

export interface ICD10Code {
  code: string;
  description: string;
}

export interface AssessmentData {
  diagnoses: ICD10Code[];
  clinicalImpression: string;
}

// Common musculoskeletal ICD-10 codes
const commonICD10Codes: ICD10Code[] = [
  { code: "M54.5", description: "Low back pain" },
  { code: "M54.2", description: "Cervicalgia" },
  { code: "M25.511", description: "Pain in right shoulder" },
  { code: "M25.512", description: "Pain in left shoulder" },
  { code: "M79.1", description: "Myalgia" },
  { code: "M79.3", description: "Panniculitis, unspecified" },
  { code: "M54.6", description: "Pain in thoracic spine" },
  { code: "M54.89", description: "Other dorsalgia" },
  { code: "M25.561", description: "Pain in right knee" },
  { code: "M25.562", description: "Pain in left knee" },
  { code: "M70.20", description: "Olecranon bursitis, unspecified elbow" },
  { code: "M75.30", description: "Calcific tendinitis of unspecified shoulder" },
  { code: "M76.11", description: "Psoas tendinitis" },
  { code: "M79.81", description: "Nontraumatic hematoma of soft tissue" },
  { code: "M62.838", description: "Other muscle spasm" },
  { code: "M53.3", description: "Sacrococcygeal disorders, not elsewhere classified" },
  { code: "M54.30", description: "Sciatica, unspecified side" },
  { code: "M54.31", description: "Sciatica, right side" },
  { code: "M54.32", description: "Sciatica, left side" },
  { code: "M25.571", description: "Pain in right ankle and joints of right foot" },
  { code: "M25.572", description: "Pain in left ankle and joints of left foot" },
  { code: "M79.2", description: "Neuralgia and neuritis, unspecified" },
  { code: "M62.81", description: "Muscle weakness (generalized)" },
  { code: "M25.50", description: "Pain in unspecified joint" },
  { code: "M54.50", description: "Low back pain, unspecified" },
  { code: "M54.12", description: "Radiculopathy, cervical region" },
  { code: "M54.16", description: "Radiculopathy, lumbar region" },
  { code: "M99.00", description: "Segmental and somatic dysfunction of head region" },
  { code: "M99.01", description: "Segmental and somatic dysfunction of cervical region" },
  { code: "M99.02", description: "Segmental and somatic dysfunction of thoracic region" },
  { code: "M99.03", description: "Segmental and somatic dysfunction of lumbar region" },
  { code: "M99.04", description: "Segmental and somatic dysfunction of sacral region" },
  { code: "S13.4XXA", description: "Sprain of ligaments of cervical spine, initial encounter" },
  { code: "S33.5XXA", description: "Sprain of ligaments of lumbar spine, initial encounter" }
];

export function AssessmentSection({ data, onChange }: AssessmentSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const filteredCodes = commonICD10Codes.filter(code =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addDiagnosis = (icd10Code: ICD10Code) => {
    // Check if diagnosis already exists
    const exists = data.diagnoses.some(d => d.code === icd10Code.code);
    if (!exists) {
      onChange({
        ...data,
        diagnoses: [...data.diagnoses, icd10Code]
      });
    }
    setIsPopoverOpen(false);
    setSearchQuery("");
  };

  const removeDiagnosis = (codeToRemove: string) => {
    onChange({
      ...data,
      diagnoses: data.diagnoses.filter(d => d.code !== codeToRemove)
    });
  };

  const addCustomDiagnosis = () => {
    const customCode = searchQuery.toUpperCase();
    if (customCode && !data.diagnoses.some(d => d.code === customCode)) {
      onChange({
        ...data,
        diagnoses: [...data.diagnoses, { code: customCode, description: "Custom diagnosis" }]
      });
      setSearchQuery("");
      setIsPopoverOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">A - Assessment</CardTitle>
        <p className="text-sm text-muted-foreground">Clinical diagnosis and impressions</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ICD-10 Diagnosis Codes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">ICD-10 Diagnosis Codes</Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Diagnosis
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search ICD-10 codes or descriptions..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No matching codes found</p>
                        {searchQuery && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={addCustomDiagnosis}
                          >
                            Add "{searchQuery}" as custom code
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Common Musculoskeletal Diagnoses">
                      {filteredCodes.map((code) => (
                        <CommandItem
                          key={code.code}
                          value={`${code.code} ${code.description}`}
                          onSelect={() => addDiagnosis(code)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium">{code.code}</span>
                            <span className="text-sm text-muted-foreground">{code.description}</span>
                          </div>
                          {data.diagnoses.some(d => d.code === code.code) && (
                            <Check className="w-4 h-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Diagnoses */}
          <div className="space-y-2">
            {data.diagnoses.map((diagnosis) => (
              <div
                key={diagnosis.code}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {diagnosis.code}
                  </Badge>
                  <span className="text-sm">{diagnosis.description}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDiagnosis(diagnosis.code)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {data.diagnoses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No diagnoses selected</p>
                <p className="text-xs">Click "Add Diagnosis" to search ICD-10 codes</p>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Impression */}
        <div>
          <Label htmlFor="clinicalImpression" className="text-base font-semibold">Clinical Impression</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Detailed assessment, differential diagnosis, and clinical reasoning
          </p>
          <textarea
            id="clinicalImpression"
            value={data.clinicalImpression}
            onChange={(e) => onChange({ ...data, clinicalImpression: e.target.value })}
            placeholder="Based on the subjective and objective findings, the patient presents with... Differential diagnosis includes... Functional limitations noted..."
            rows={6}
            className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>

        {/* Summary Statistics */}
        {data.diagnoses.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Assessment Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Primary Diagnosis:</span>
                <p className="font-medium">{data.diagnoses[0]?.code}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Diagnoses:</span>
                <p className="font-medium">{data.diagnoses.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Assessment Type:</span>
                <p className="font-medium">
                  {data.diagnoses.length > 1 ? "Complex" : "Single Diagnosis"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}