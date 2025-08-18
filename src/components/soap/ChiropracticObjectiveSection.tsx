import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, X, Stethoscope } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ChiropracticObjectiveSectionProps {
  data: ChiropracticObjectiveData;
  onChange: (data: ChiropracticObjectiveData) => void;
}

export interface ChiropracticObjectiveData {
  // Posture and Gait
  posture: string[];
  gait: string[];
  gaitOther: string;
  
  // Clinical Findings
  muscleTone: string;
  tenderness: string;
  triggerPoints: string;
  jointFixation: string;
  edema: string;
  edemaLocation: string;
  
  // Neurological
  reflexes: string;
  sensation: string;
  sensationLocation: string;
  strength: string;
  strengthMuscle: string;
  
  // Vital Signs
  vitalSigns: {
    bp: string;
    hr: string;
    resp: string;
    temp: string;
    height: string;
    weight: string;
    oxygenSaturation: string;
  };
  
  // Range of Motion
  rangeOfMotion: {
    cervical: {
      flexion: string;
      extension: string;
      rotation: string;
      lateralFlexion: string;
    };
    thoracic: {
      rotation: string;
      flexionExtension: string;
    };
    lumbar: {
      flexion: string;
      extension: string;
      lateralFlexion: string;
      rotation: string;
    };
  };
  
  // Orthopedic Tests
  orthopedicTests: {
    slr: string;
    slrAngle: string;
    kemps: string;
    kempsSide: string;
    faber: string;
    faberSide: string;
    yeoman: string;
    otherTests: string;
  };
  
  // Legacy system exams support
  systemExams: any[];
  specialTests: any[];
  imagingLabs: any[];
  procedures: any[];
}

const postureOptions = ["Normal", "Forward Head", "Rounded Shoulders", "Kyphotic", "Lordotic", "Scoliosis", "Pelvic Tilt"];
const gaitOptions = ["Normal", "Antalgic", "Limp", "Shuffling"];

export function ChiropracticObjectiveSection({ data, onChange }: ChiropracticObjectiveSectionProps) {
  const [openSections, setOpenSections] = useState<string[]>(['posture-gait', 'vital-signs']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handlePostureChange = (posture: string, checked: boolean) => {
    const newPosture = checked 
      ? [...data.posture, posture]
      : data.posture.filter(p => p !== posture);
    onChange({ ...data, posture: newPosture });
  };

  const handleGaitChange = (gait: string, checked: boolean) => {
    const newGait = checked 
      ? [...data.gait, gait]
      : data.gait.filter(g => g !== gait);
    onChange({ ...data, gait: newGait });
  };

  const updateVitalSigns = (field: string, value: string) => {
    onChange({
      ...data,
      vitalSigns: { ...data.vitalSigns, [field]: value }
    });
  };

  const updateRangeOfMotion = (spineRegion: string, movement: string, value: string) => {
    onChange({
      ...data,
      rangeOfMotion: {
        ...data.rangeOfMotion,
        [spineRegion]: {
          ...data.rangeOfMotion[spineRegion as keyof typeof data.rangeOfMotion],
          [movement]: value
        }
      }
    });
  };

  const updateOrthopedicTest = (field: string, value: string) => {
    onChange({
      ...data,
      orthopedicTests: {
        ...data.orthopedicTests,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Stethoscope className="w-5 h-5" />
          <span>O - Objective (Chiropractic Assessment)</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Observable and measurable clinical findings</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Posture and Gait */}
        <Collapsible open={openSections.includes('posture-gait')} onOpenChange={() => toggleSection('posture-gait')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="font-semibold text-base">Posture & Gait Assessment</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('posture-gait') ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Posture</Label>
                <div className="space-y-2">
                  {postureOptions.map((posture) => (
                    <div key={posture} className="flex items-center space-x-2">
                      <Checkbox
                        id={`posture-${posture}`}
                        checked={data.posture.includes(posture)}
                        onCheckedChange={(checked) => handlePostureChange(posture, checked as boolean)}
                      />
                      <Label htmlFor={`posture-${posture}`} className="text-sm">{posture}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Gait</Label>
                <div className="space-y-2">
                  {gaitOptions.map((gait) => (
                    <div key={gait} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gait-${gait}`}
                        checked={data.gait.includes(gait)}
                        onCheckedChange={(checked) => handleGaitChange(gait, checked as boolean)}
                      />
                      <Label htmlFor={`gait-${gait}`} className="text-sm">{gait}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gait-other">Other Gait Notes:</Label>
                  <Input
                    id="gait-other"
                    value={data.gaitOther}
                    onChange={(e) => onChange({ ...data, gaitOther: e.target.value })}
                    placeholder="Describe other gait abnormalities"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Vital Signs */}
        <Collapsible open={openSections.includes('vital-signs')} onOpenChange={() => toggleSection('vital-signs')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="font-semibold text-base">Vital Signs</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('vital-signs') ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-3 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="height" className="text-sm">Height</Label>
                <Input
                  id="height"
                  value={data.vitalSigns.height}
                  onChange={(e) => updateVitalSigns('height', e.target.value)}
                  placeholder="5'8&quot;"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-sm">Weight</Label>
                <Input
                  id="weight"
                  value={data.vitalSigns.weight}
                  onChange={(e) => updateVitalSigns('weight', e.target.value)}
                  placeholder="180 lbs"
                />
              </div>
              <div>
                <Label htmlFor="bp" className="text-sm">Blood Pressure</Label>
                <Input
                  id="bp"
                  value={data.vitalSigns.bp}
                  onChange={(e) => updateVitalSigns('bp', e.target.value)}
                  placeholder="120/80"
                />
              </div>
              <div>
                <Label htmlFor="hr" className="text-sm">Heart Rate</Label>
                <Input
                  id="hr"
                  value={data.vitalSigns.hr}
                  onChange={(e) => updateVitalSigns('hr', e.target.value)}
                  placeholder="72 bpm"
                />
              </div>
              <div>
                <Label htmlFor="resp" className="text-sm">Respiratory Rate</Label>
                <Input
                  id="resp"
                  value={data.vitalSigns.resp}
                  onChange={(e) => updateVitalSigns('resp', e.target.value)}
                  placeholder="16/min"
                />
              </div>
              <div>
                <Label htmlFor="temp" className="text-sm">Temperature</Label>
                <Input
                  id="temp"
                  value={data.vitalSigns.temp}
                  onChange={(e) => updateVitalSigns('temp', e.target.value)}
                  placeholder="98.6°F"
                />
              </div>
              <div>
                <Label htmlFor="oxygen" className="text-sm">O₂ Saturation</Label>
                <Input
                  id="oxygen"
                  value={data.vitalSigns.oxygenSaturation}
                  onChange={(e) => updateVitalSigns('oxygenSaturation', e.target.value)}
                  placeholder="99%"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Range of Motion */}
        <Collapsible open={openSections.includes('rom')} onOpenChange={() => toggleSection('rom')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="font-semibold text-base">Range of Motion Assessment</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('rom') ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cervical Spine */}
              <div className="space-y-3">
                <Label className="font-medium">Cervical Spine</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Flexion (Normal ~50°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.cervical.flexion}
                      onChange={(e) => updateRangeOfMotion('cervical', 'flexion', e.target.value)}
                      placeholder="50°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Extension (Normal ~60°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.cervical.extension}
                      onChange={(e) => updateRangeOfMotion('cervical', 'extension', e.target.value)}
                      placeholder="60°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rotation L/R (Normal ~80°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.cervical.rotation}
                      onChange={(e) => updateRangeOfMotion('cervical', 'rotation', e.target.value)}
                      placeholder="80°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Lateral Flexion L/R (Normal ~45°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.cervical.lateralFlexion}
                      onChange={(e) => updateRangeOfMotion('cervical', 'lateralFlexion', e.target.value)}
                      placeholder="45°"
                    />
                  </div>
                </div>
              </div>

              {/* Thoracic Spine */}
              <div className="space-y-3">
                <Label className="font-medium">Thoracic Spine</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rotation L/R:</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.thoracic.rotation}
                      onChange={(e) => updateRangeOfMotion('thoracic', 'rotation', e.target.value)}
                      placeholder="°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Flexion/Extension:</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.thoracic.flexionExtension}
                      onChange={(e) => updateRangeOfMotion('thoracic', 'flexionExtension', e.target.value)}
                      placeholder="°"
                    />
                  </div>
                </div>
              </div>

              {/* Lumbar Spine */}
              <div className="space-y-3">
                <Label className="font-medium">Lumbar Spine</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Flexion (Normal ~60°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.lumbar.flexion}
                      onChange={(e) => updateRangeOfMotion('lumbar', 'flexion', e.target.value)}
                      placeholder="60°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Extension (Normal ~25°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.lumbar.extension}
                      onChange={(e) => updateRangeOfMotion('lumbar', 'extension', e.target.value)}
                      placeholder="25°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Lateral Flexion L/R (Normal ~25°):</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.lumbar.lateralFlexion}
                      onChange={(e) => updateRangeOfMotion('lumbar', 'lateralFlexion', e.target.value)}
                      placeholder="25°"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rotation L/R:</Label>
                    <Input 
                      className="w-20" 
                      value={data.rangeOfMotion.lumbar.rotation}
                      onChange={(e) => updateRangeOfMotion('lumbar', 'rotation', e.target.value)}
                      placeholder="°"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Orthopedic Tests */}
        <Collapsible open={openSections.includes('ortho')} onOpenChange={() => toggleSection('ortho')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="font-semibold text-base">Orthopedic Tests</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('ortho') ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Straight Leg Raise (SLR):</Label>
                  <RadioGroup 
                    value={data.orthopedicTests.slr}
                    onValueChange={(value) => updateOrthopedicTest('slr', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="slr-positive" />
                      <Label htmlFor="slr-positive" className="text-sm">Positive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="slr-negative" />
                      <Label htmlFor="slr-negative" className="text-sm">Negative</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Angle:</Label>
                    <Input
                      className="w-20"
                      value={data.orthopedicTests.slrAngle}
                      onChange={(e) => updateOrthopedicTest('slrAngle', e.target.value)}
                      placeholder="°"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kemp's Test:</Label>
                  <RadioGroup 
                    value={data.orthopedicTests.kemps}
                    onValueChange={(value) => updateOrthopedicTest('kemps', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="kemps-positive" />
                      <Label htmlFor="kemps-positive" className="text-sm">Positive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="kemps-negative" />
                      <Label htmlFor="kemps-negative" className="text-sm">Negative</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Side:</Label>
                    <Input
                      className="w-20"
                      value={data.orthopedicTests.kempsSide}
                      onChange={(e) => updateOrthopedicTest('kempsSide', e.target.value)}
                      placeholder="L/R"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">FABER/Patrick's Test:</Label>
                  <RadioGroup 
                    value={data.orthopedicTests.faber}
                    onValueChange={(value) => updateOrthopedicTest('faber', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="faber-positive" />
                      <Label htmlFor="faber-positive" className="text-sm">Positive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="faber-negative" />
                      <Label htmlFor="faber-negative" className="text-sm">Negative</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Side:</Label>
                    <Input
                      className="w-20"
                      value={data.orthopedicTests.faberSide}
                      onChange={(e) => updateOrthopedicTest('faberSide', e.target.value)}
                      placeholder="L/R"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yeoman's Test:</Label>
                  <RadioGroup 
                    value={data.orthopedicTests.yeoman}
                    onValueChange={(value) => updateOrthopedicTest('yeoman', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="yeoman-positive" />
                      <Label htmlFor="yeoman-positive" className="text-sm">Positive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="yeoman-negative" />
                      <Label htmlFor="yeoman-negative" className="text-sm">Negative</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-tests" className="text-sm font-medium">Other Tests:</Label>
              <Textarea
                id="other-tests"
                value={data.orthopedicTests.otherTests}
                onChange={(e) => updateOrthopedicTest('otherTests', e.target.value)}
                placeholder="Document additional orthopedic tests performed..."
                rows={3}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Clinical Findings */}
        <Collapsible open={openSections.includes('clinical')} onOpenChange={() => toggleSection('clinical')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="font-semibold text-base">Clinical Findings</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('clinical') ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="muscle-tone" className="text-sm">Muscle Tone:</Label>
                <Input
                  id="muscle-tone"
                  value={data.muscleTone}
                  onChange={(e) => onChange({ ...data, muscleTone: e.target.value })}
                  placeholder="Normal, Hypertonic, Hypotonic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenderness" className="text-sm">Tenderness:</Label>
                <Input
                  id="tenderness"
                  value={data.tenderness}
                  onChange={(e) => onChange({ ...data, tenderness: e.target.value })}
                  placeholder="Location and severity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger-points" className="text-sm">Trigger Points:</Label>
                <Input
                  id="trigger-points"
                  value={data.triggerPoints}
                  onChange={(e) => onChange({ ...data, triggerPoints: e.target.value })}
                  placeholder="Location of trigger points"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joint-fixation" className="text-sm">Joint Fixation:</Label>
                <Input
                  id="joint-fixation"
                  value={data.jointFixation}
                  onChange={(e) => onChange({ ...data, jointFixation: e.target.value })}
                  placeholder="Restricted joint motion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edema" className="text-sm">Edema:</Label>
                <RadioGroup 
                  value={data.edema}
                  onValueChange={(value) => onChange({ ...data, edema: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="present" id="edema-present" />
                    <Label htmlFor="edema-present" className="text-sm">Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absent" id="edema-absent" />
                    <Label htmlFor="edema-absent" className="text-sm">Absent</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edema-location" className="text-sm">Edema Location:</Label>
                <Input
                  id="edema-location"
                  value={data.edemaLocation}
                  onChange={(e) => onChange({ ...data, edemaLocation: e.target.value })}
                  placeholder="Location if present"
                  disabled={data.edema !== 'present'}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Neurological Assessment */}
        <Collapsible open={openSections.includes('neuro')} onOpenChange={() => toggleSection('neuro')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="font-semibold text-base">Neurological Assessment</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('neuro') ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reflexes" className="text-sm">Reflexes:</Label>
                <Input
                  id="reflexes"
                  value={data.reflexes}
                  onChange={(e) => onChange({ ...data, reflexes: e.target.value })}
                  placeholder="Normal, Hyperactive, Hypoactive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensation" className="text-sm">Sensation:</Label>
                <RadioGroup 
                  value={data.sensation}
                  onValueChange={(value) => onChange({ ...data, sensation: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intact" id="sensation-intact" />
                    <Label htmlFor="sensation-intact" className="text-sm">Intact</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="altered" id="sensation-altered" />
                    <Label htmlFor="sensation-altered" className="text-sm">Altered</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensation-location" className="text-sm">Sensation Location:</Label>
                <Input
                  id="sensation-location"
                  value={data.sensationLocation}
                  onChange={(e) => onChange({ ...data, sensationLocation: e.target.value })}
                  placeholder="Location of altered sensation"
                  disabled={data.sensation !== 'altered'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength" className="text-sm">Strength:</Label>
                <RadioGroup 
                  value={data.strength}
                  onValueChange={(value) => onChange({ ...data, strength: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="strength-normal" />
                    <Label htmlFor="strength-normal" className="text-sm">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weak" id="strength-weak" />
                    <Label htmlFor="strength-weak" className="text-sm">Weak</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength-muscle" className="text-sm">Weak Muscle Groups:</Label>
                <Input
                  id="strength-muscle"
                  value={data.strengthMuscle}
                  onChange={(e) => onChange({ ...data, strengthMuscle: e.target.value })}
                  placeholder="Specify muscle groups"
                  disabled={data.strength !== 'weak'}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}