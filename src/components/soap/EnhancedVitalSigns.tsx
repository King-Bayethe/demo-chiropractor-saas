import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface VitalSigns {
  height: string;
  weight: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  bmi?: number;
}

interface EnhancedVitalSignsProps {
  data: VitalSigns;
  onChange: (data: VitalSigns) => void;
}

const normalRanges = {
  heartRate: { min: 60, max: 100, unit: "bpm" },
  temperature: { min: 36.1, max: 37.2, unit: "°C" },
  oxygenSaturation: { min: 95, max: 100, unit: "%" },
  respiratoryRate: { min: 12, max: 20, unit: "/min" },
  systolicBP: { min: 90, max: 140, unit: "mmHg" },
  diastolicBP: { min: 60, max: 90, unit: "mmHg" },
  bmi: { min: 18.5, max: 24.9, unit: "kg/m²" }
};

export function EnhancedVitalSigns({ data, onChange }: EnhancedVitalSignsProps) {
  const [showBMICalculator, setShowBMICalculator] = useState(false);

  const updateField = (field: keyof VitalSigns, value: string) => {
    const newData = { ...data, [field]: value };
    
    // Auto-calculate BMI when height or weight changes
    if ((field === "height" || field === "weight") && newData.height && newData.weight) {
      const heightM = parseFloat(newData.height) / 100; // Convert cm to m
      const weightKg = parseFloat(newData.weight);
      if (heightM > 0 && weightKg > 0) {
        newData.bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
      }
    }
    
    onChange(newData);
  };

  const getStatusColor = (value: string, range: { min: number; max: number }) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "text-muted-foreground";
    
    if (numValue >= range.min && numValue <= range.max) {
      return "text-indicator-normal";
    }
    return "text-indicator-abnormal";
  };

  const getStatusIcon = (value: string, range: { min: number; max: number }) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    
    if (numValue >= range.min && numValue <= range.max) {
      return <CheckCircle className="w-4 h-4 text-indicator-normal" />;
    }
    return <AlertTriangle className="w-4 h-4 text-indicator-abnormal" />;
  };

  const getBPStatus = () => {
    if (!data.bloodPressure) return { icon: null, color: "text-muted-foreground" };
    
    const bpMatch = data.bloodPressure.match(/(\d+)\/(\d+)/);
    if (!bpMatch) return { icon: null, color: "text-muted-foreground" };
    
    const systolic = parseInt(bpMatch[1]);
    const diastolic = parseInt(bpMatch[2]);
    
    const systolicNormal = systolic >= normalRanges.systolicBP.min && systolic <= normalRanges.systolicBP.max;
    const diastolicNormal = diastolic >= normalRanges.diastolicBP.min && diastolic <= normalRanges.diastolicBP.max;
    
    if (systolicNormal && diastolicNormal) {
      return { icon: <CheckCircle className="w-4 h-4 text-indicator-normal" />, color: "text-indicator-normal" };
    }
    return { icon: <AlertTriangle className="w-4 h-4 text-indicator-abnormal" />, color: "text-indicator-abnormal" };
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-warning" };
    if (bmi < 25) return { category: "Normal", color: "text-indicator-normal" };
    if (bmi < 30) return { category: "Overweight", color: "text-warning" };
    return { category: "Obese", color: "text-indicator-abnormal" };
  };

  const bpStatus = getBPStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-medical-blue" />
            <span>Vital Signs</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBMICalculator(!showBMICalculator)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            BMI Calculator
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Measurements */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Basic Measurements
            </h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Height (cm)</label>
              <Input
                type="number"
                value={data.height}
                onChange={(e) => updateField("height", e.target.value)}
                placeholder="170"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input
                type="number"
                value={data.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="70"
              />
            </div>

            {data.bmi && (
              <div className="p-3 bg-medical-blue-light rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">BMI</span>
                  <Badge variant="outline" className={getBMICategory(data.bmi).color}>
                    {getBMICategory(data.bmi).category}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-medical-blue">
                  {data.bmi} kg/m²
                </div>
              </div>
            )}
          </div>

          {/* Cardiovascular */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Cardiovascular
            </h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <span>Blood Pressure (mmHg)</span>
                {bpStatus.icon}
              </label>
              <Input
                value={data.bloodPressure}
                onChange={(e) => updateField("bloodPressure", e.target.value)}
                placeholder="120/80"
                className={bpStatus.color}
              />
              <div className="text-xs text-muted-foreground">
                Normal: 90-140/60-90 mmHg
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <span>Heart Rate (bpm)</span>
                {getStatusIcon(data.heartRate, normalRanges.heartRate)}
              </label>
              <Input
                type="number"
                value={data.heartRate}
                onChange={(e) => updateField("heartRate", e.target.value)}
                placeholder="72"
                className={getStatusColor(data.heartRate, normalRanges.heartRate)}
              />
              <div className="text-xs text-muted-foreground">
                Normal: 60-100 bpm
              </div>
            </div>
          </div>

          {/* Respiratory & Temperature */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Respiratory & Temperature
            </h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <span>Temperature (°C)</span>
                {getStatusIcon(data.temperature, normalRanges.temperature)}
              </label>
              <Input
                type="number"
                step="0.1"
                value={data.temperature}
                onChange={(e) => updateField("temperature", e.target.value)}
                placeholder="36.5"
                className={getStatusColor(data.temperature, normalRanges.temperature)}
              />
              <div className="text-xs text-muted-foreground">
                Normal: 36.1-37.2°C
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <span>Oxygen Saturation (%)</span>
                {getStatusIcon(data.oxygenSaturation, normalRanges.oxygenSaturation)}
              </label>
              <Input
                type="number"
                value={data.oxygenSaturation}
                onChange={(e) => updateField("oxygenSaturation", e.target.value)}
                placeholder="98"
                className={getStatusColor(data.oxygenSaturation, normalRanges.oxygenSaturation)}
              />
              <div className="text-xs text-muted-foreground">
                Normal: 95-100%
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <span>Respiratory Rate (/min)</span>
                {getStatusIcon(data.respiratoryRate, normalRanges.respiratoryRate)}
              </label>
              <Input
                type="number"
                value={data.respiratoryRate}
                onChange={(e) => updateField("respiratoryRate", e.target.value)}
                placeholder="16"
                className={getStatusColor(data.respiratoryRate, normalRanges.respiratoryRate)}
              />
              <div className="text-xs text-muted-foreground">
                Normal: 12-20/min
              </div>
            </div>
          </div>
        </div>

        {showBMICalculator && (
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h4 className="font-medium mb-3">BMI Reference</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-2 bg-background rounded">
                <div className="font-medium text-warning">Underweight</div>
                <div className="text-muted-foreground">&lt; 18.5</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="font-medium text-indicator-normal">Normal</div>
                <div className="text-muted-foreground">18.5 - 24.9</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="font-medium text-warning">Overweight</div>
                <div className="text-muted-foreground">25.0 - 29.9</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="font-medium text-indicator-abnormal">Obese</div>
                <div className="text-muted-foreground">≥ 30.0</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}