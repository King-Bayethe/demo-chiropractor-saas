import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Activity, TrendingUp } from "lucide-react";

interface PainData {
  currentPain: number;
  worstPain: number;
  averagePain: number;
  location: string[];
  quality: string[];
  triggers: string[];
  reliefFactors: string[];
  timePattern: string;
  description: string;
  functionalImpact: string;
}

interface EnhancedPainAssessmentProps {
  data: PainData;
  onChange: (data: PainData) => void;
}

const painQualities = [
  "Sharp", "Dull", "Aching", "Burning", "Stabbing", "Throbbing",
  "Cramping", "Shooting", "Tingling", "Numbness"
];

const commonTriggers = [
  "Movement", "Sitting", "Standing", "Walking", "Bending",
  "Lifting", "Morning stiffness", "Weather changes", "Stress"
];

const reliefFactors = [
  "Rest", "Heat", "Ice", "Medication", "Stretching", "Exercise",
  "Massage", "Positioning", "Sleep"
];

const timePatterns = [
  "Constant", "Intermittent", "Morning worst", "Evening worst",
  "Activity-related", "Night pain", "Progressive worsening"
];

export function EnhancedPainAssessment({ data, onChange }: EnhancedPainAssessmentProps) {
  const updateData = (field: keyof PainData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleArrayItem = (field: keyof PainData, item: string) => {
    const currentArray = data[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateData(field, newArray);
  };

  const getPainColor = (level: number) => {
    if (level === 0) return "text-indicator-normal";
    if (level <= 3) return "text-medical-green";
    if (level <= 6) return "text-warning";
    return "text-medical-red";
  };

  const getFacesEmoji = (level: number) => {
    const faces = ["😊", "🙂", "😐", "😕", "😟", "😢", "😰", "😭", "😱", "😵", "🤮"];
    return faces[level] || "😐";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-medical-red" />
            <span>Pain Scale Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="numeric" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="numeric">Numeric Scale</TabsTrigger>
              <TabsTrigger value="faces">Faces Scale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="numeric" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Current Pain Level</label>
                  <div className="px-3">
                    <Slider
                      value={[data.currentPain]}
                      onValueChange={(value) => updateData("currentPain", value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center">
                    <span className={`text-2xl font-bold ${getPainColor(data.currentPain)}`}>
                      {data.currentPain}/10
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Worst Pain (24h)</label>
                  <div className="px-3">
                    <Slider
                      value={[data.worstPain]}
                      onValueChange={(value) => updateData("worstPain", value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center">
                    <span className={`text-2xl font-bold ${getPainColor(data.worstPain)}`}>
                      {data.worstPain}/10
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Average Pain</label>
                  <div className="px-3">
                    <Slider
                      value={[data.averagePain]}
                      onValueChange={(value) => updateData("averagePain", value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center">
                    <span className={`text-2xl font-bold ${getPainColor(data.averagePain)}`}>
                      {data.averagePain}/10
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faces" className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Select the face that best represents your current pain level</p>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                  {Array.from({ length: 11 }, (_, i) => (
                    <Button
                      key={i}
                      variant={data.currentPain === i ? "default" : "outline"}
                      className="aspect-square text-2xl p-2"
                      onClick={() => updateData("currentPain", i)}
                    >
                      {getFacesEmoji(i)}
                    </Button>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className={`text-xl font-bold ${getPainColor(data.currentPain)}`}>
                    {data.currentPain}/10
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <MapPin className="w-4 h-4 text-medical-blue" />
              <span>Pain Characteristics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pain Quality</label>
              <div className="flex flex-wrap gap-2">
                {painQualities.map((quality) => (
                  <Badge
                    key={quality}
                    variant={data.quality.includes(quality) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("quality", quality)}
                  >
                    {quality}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Pattern</label>
              <div className="flex flex-wrap gap-2">
                {timePatterns.map((pattern) => (
                  <Badge
                    key={pattern}
                    variant={data.timePattern === pattern ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => updateData("timePattern", pattern)}
                  >
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <TrendingUp className="w-4 h-4 text-medical-orange" />
              <span>Aggravating & Relieving Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">What makes it worse?</label>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map((trigger) => (
                  <Badge
                    key={trigger}
                    variant={data.triggers.includes(trigger) ? "destructive" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("triggers", trigger)}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What helps?</label>
              <div className="flex flex-wrap gap-2">
                {reliefFactors.map((factor) => (
                  <Badge
                    key={factor}
                    variant={data.reliefFactors.includes(factor) ? "default" : "outline"}
                    className="cursor-pointer bg-medical-green text-white"
                    onClick={() => toggleArrayItem("reliefFactors", factor)}
                  >
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Clock className="w-4 h-4 text-medical-teal" />
            <span>Additional Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Pain Description</label>
            <Textarea
              value={data.description}
              onChange={(e) => updateData("description", e.target.value)}
              placeholder="Describe the pain in the patient's own words..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Functional Impact</label>
            <Textarea
              value={data.functionalImpact}
              onChange={(e) => updateData("functionalImpact", e.target.value)}
              placeholder="How does this pain affect daily activities, work, sleep, etc.?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}