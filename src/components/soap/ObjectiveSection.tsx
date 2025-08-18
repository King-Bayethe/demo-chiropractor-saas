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
import { ChevronDown, Plus, X } from "lucide-react";

interface ObjectiveSectionProps {
  data: ObjectiveData;
  onChange: (data: ObjectiveData) => void;
}

export interface VitalSigns {
  height: string;
  weight: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
}

export interface SystemExam {
  system: string;
  isNormal: boolean;
  isAbnormal: boolean;
  notes: string;
  isRefused: boolean;
}

export interface SpecialTest {
  name: string;
  result: string;
  notes: string;
}

export interface ImagingLab {
  type: string;
  name: string;
  date: string;
  results: string;
}

export interface Procedure {
  name: string;
  cptCode: string;
  description: string;
}

export interface ObjectiveData {
  vitalSigns: VitalSigns;
  systemExams: SystemExam[];
  specialTests: SpecialTest[];
  imagingLabs: ImagingLab[];
  procedures: Procedure[];
}

const systemsList = [
  'Neurological',
  'Pulmonary',
  'Cardiovascular',
  'Gastrointestinal',
  'Genitourinary',
  'ENT (Head/Neck)',
  'Musculoskeletal',
  'Integumentary',
  'Psychiatric',
  'Endocrine'
];

const commonSpecialTests = [
  "Spurling's Test",
  "Distraction Test",
  "Straight Leg Raise",
  "Patrick's Test",
  "Trendelenburg Test",
  "McMurray Test",
  "Lachman Test",
  "Drawer Test",
  "Apley's Test",
  "Neer Test",
  "Hawkins Test"
];

export function ObjectiveSection({ data, onChange }: ObjectiveSectionProps) {
  const [openSystems, setOpenSystems] = useState<string[]>(['Musculoskeletal']);

  const toggleSystem = (system: string) => {
    setOpenSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const updateVitalSigns = (field: keyof VitalSigns, value: string) => {
    onChange({
      ...data,
      vitalSigns: { ...data.vitalSigns, [field]: value }
    });
  };

  const updateSystemExam = (system: string, updates: Partial<SystemExam>) => {
    const systemExams = data.systemExams || [];
    const existingIndex = systemExams.findIndex(exam => exam.system === system);
    const updatedExam = existingIndex >= 0 
      ? { ...systemExams[existingIndex], ...updates }
      : { system, isNormal: false, isAbnormal: false, notes: '', isRefused: false, ...updates };

    const newSystemExams = existingIndex >= 0
      ? systemExams.map((exam, index) => index === existingIndex ? updatedExam : exam)
      : [...systemExams, updatedExam];

    onChange({ ...data, systemExams: newSystemExams });
  };

  const addSpecialTest = () => {
    const specialTests = data.specialTests || [];
    onChange({
      ...data,
      specialTests: [...specialTests, { name: '', result: '', notes: '' }]
    });
  };

  const updateSpecialTest = (index: number, updates: Partial<SpecialTest>) => {
    const specialTests = data.specialTests || [];
    const newTests = specialTests.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    );
    onChange({ ...data, specialTests: newTests });
  };

  const removeSpecialTest = (index: number) => {
    const specialTests = data.specialTests || [];
    onChange({
      ...data,
      specialTests: specialTests.filter((_, i) => i !== index)
    });
  };

  const addImagingLab = () => {
    const imagingLabs = data.imagingLabs || [];
    onChange({
      ...data,
      imagingLabs: [...imagingLabs, { type: '', name: '', date: '', results: '' }]
    });
  };

  const updateImagingLab = (index: number, updates: Partial<ImagingLab>) => {
    const imagingLabs = data.imagingLabs || [];
    const newLabs = imagingLabs.map((lab, i) => 
      i === index ? { ...lab, ...updates } : lab
    );
    onChange({ ...data, imagingLabs: newLabs });
  };

  const removeImagingLab = (index: number) => {
    const imagingLabs = data.imagingLabs || [];
    onChange({
      ...data,
      imagingLabs: imagingLabs.filter((_, i) => i !== index)
    });
  };

  const addProcedure = () => {
    const procedures = data.procedures || [];
    onChange({
      ...data,
      procedures: [...procedures, { name: '', cptCode: '', description: '' }]
    });
  };

  const updateProcedure = (index: number, updates: Partial<Procedure>) => {
    const procedures = data.procedures || [];
    const newProcedures = procedures.map((proc, i) => 
      i === index ? { ...proc, ...updates } : proc
    );
    onChange({ ...data, procedures: newProcedures });
  };

  const removeProcedure = (index: number) => {
    const procedures = data.procedures || [];
    onChange({
      ...data,
      procedures: procedures.filter((_, i) => i !== index)
    });
  };

  const getSystemExam = (system: string): SystemExam => {
    const systemExams = data.systemExams || [];
    return systemExams.find(exam => exam.system === system) || {
      system,
      isNormal: false,
      isAbnormal: false,
      notes: '',
      isRefused: false
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">O - Objective</CardTitle>
        <p className="text-sm text-muted-foreground">Observable and measurable findings</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vital Signs */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Vital Signs</Label>
          <div className="grid grid-cols-4 gap-4">
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
              <Label htmlFor="bloodPressure" className="text-sm">Blood Pressure</Label>
              <Input
                id="bloodPressure"
                value={data.vitalSigns.bloodPressure}
                onChange={(e) => updateVitalSigns('bloodPressure', e.target.value)}
                placeholder="120/80"
              />
            </div>
            <div>
              <Label htmlFor="heartRate" className="text-sm">Heart Rate</Label>
              <Input
                id="heartRate"
                value={data.vitalSigns.heartRate}
                onChange={(e) => updateVitalSigns('heartRate', e.target.value)}
                placeholder="72 bpm"
              />
            </div>
            <div>
              <Label htmlFor="temperature" className="text-sm">Temperature</Label>
              <Input
                id="temperature"
                value={data.vitalSigns.temperature}
                onChange={(e) => updateVitalSigns('temperature', e.target.value)}
                placeholder="98.6°F"
              />
            </div>
            <div>
              <Label htmlFor="oxygenSaturation" className="text-sm">O₂ Saturation</Label>
              <Input
                id="oxygenSaturation"
                value={data.vitalSigns.oxygenSaturation}
                onChange={(e) => updateVitalSigns('oxygenSaturation', e.target.value)}
                placeholder="99%"
              />
            </div>
            <div>
              <Label htmlFor="respiratoryRate" className="text-sm">Respiratory Rate</Label>
              <Input
                id="respiratoryRate"
                value={data.vitalSigns.respiratoryRate}
                onChange={(e) => updateVitalSigns('respiratoryRate', e.target.value)}
                placeholder="16/min"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* System Examinations */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Head-to-Toe System Examination</Label>
          <div className="space-y-2">
            {systemsList.map((system) => {
              const exam = getSystemExam(system);
              const isOpen = openSystems.includes(system);
              
              return (
                <Collapsible key={system} open={isOpen} onOpenChange={() => toggleSystem(system)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{system}</span>
                        {(exam.isNormal || exam.isAbnormal || exam.isRefused) && (
                          <Badge variant="secondary" className="text-xs">
                            {exam.isRefused ? 'Refused' : exam.isNormal ? 'Normal' : 'Abnormal'}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3">
                    <div className="space-y-3 border-l-2 border-border/50 pl-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${system}-normal`}
                            checked={exam.isNormal}
                            onCheckedChange={(checked) => updateSystemExam(system, { 
                              isNormal: checked as boolean,
                              isAbnormal: checked ? false : exam.isAbnormal
                            })}
                          />
                          <Label htmlFor={`${system}-normal`} className="text-sm">Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${system}-abnormal`}
                            checked={exam.isAbnormal}
                            onCheckedChange={(checked) => updateSystemExam(system, { 
                              isAbnormal: checked as boolean,
                              isNormal: checked ? false : exam.isNormal
                            })}
                          />
                          <Label htmlFor={`${system}-abnormal`} className="text-sm">Abnormal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${system}-refused`}
                            checked={exam.isRefused}
                            onCheckedChange={(checked) => updateSystemExam(system, { isRefused: checked })}
                          />
                          <Label htmlFor={`${system}-refused`} className="text-sm">Refused</Label>
                        </div>
                      </div>
                      <Textarea
                        value={exam.notes}
                        onChange={(e) => updateSystemExam(system, { notes: e.target.value })}
                        placeholder={`${system} examination notes...`}
                        rows={2}
                        disabled={exam.isRefused}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Special Tests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Physical Special Tests</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSpecialTest}>
              <Plus className="w-4 h-4 mr-1" />
              Add Test
            </Button>
          </div>
          <div className="space-y-3">
            {(data.specialTests || []).map((test, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Test Name</Label>
                    <Input
                      value={test.name}
                      onChange={(e) => updateSpecialTest(index, { name: e.target.value })}
                      placeholder="Select or type test name"
                      list={`special-tests-${index}`}
                    />
                    <datalist id={`special-tests-${index}`}>
                      {commonSpecialTests.map(testName => (
                        <option key={testName} value={testName} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <Label className="text-xs">Result</Label>
                    <Input
                      value={test.result}
                      onChange={(e) => updateSpecialTest(index, { result: e.target.value })}
                      placeholder="Positive/Negative"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Input
                      value={test.notes}
                      onChange={(e) => updateSpecialTest(index, { notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSpecialTest(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(data.specialTests || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No special tests recorded</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Imaging/Lab Results */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Imaging & Lab Results</Label>
            <Button type="button" variant="outline" size="sm" onClick={addImagingLab}>
              <Plus className="w-4 h-4 mr-1" />
              Add Result
            </Button>
          </div>
          <div className="space-y-3">
            {(data.imagingLabs || []).map((lab, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Input
                        value={lab.type}
                        onChange={(e) => updateImagingLab(index, { type: e.target.value })}
                        placeholder="X-ray, MRI, Blood work..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Name/Description</Label>
                      <Input
                        value={lab.name}
                        onChange={(e) => updateImagingLab(index, { name: e.target.value })}
                        placeholder="Lumbar spine X-ray"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={lab.date}
                        onChange={(e) => updateImagingLab(index, { date: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImagingLab(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Results/Findings</Label>
                  <Textarea
                    value={lab.results}
                    onChange={(e) => updateImagingLab(index, { results: e.target.value })}
                    placeholder="Describe findings, abnormalities, or normal results..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
            {(data.imagingLabs || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No imaging or lab results recorded</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Procedures */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Procedures Performed</Label>
            <Button type="button" variant="outline" size="sm" onClick={addProcedure}>
              <Plus className="w-4 h-4 mr-1" />
              Add Procedure
            </Button>
          </div>
          <div className="space-y-3">
            {(data.procedures || []).map((procedure, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Procedure Name</Label>
                    <Input
                      value={procedure.name}
                      onChange={(e) => updateProcedure(index, { name: e.target.value })}
                      placeholder="Manual therapy, adjustment..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CPT Code</Label>
                    <Input
                      value={procedure.cptCode}
                      onChange={(e) => updateProcedure(index, { cptCode: e.target.value })}
                      placeholder="98940, 98941..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={procedure.description}
                      onChange={(e) => updateProcedure(index, { description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProcedure(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(data.procedures || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No procedures recorded</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}