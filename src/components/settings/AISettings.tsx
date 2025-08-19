import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAI } from "@/contexts/AIContext";
import { Brain, AlertTriangle, CheckCircle } from "lucide-react";

export const AISettings = () => {
  const { settings, updateSetting, quotaExceeded } = useAI();

  const aiFeatures = [
    {
      key: 'smartTemplates' as const,
      title: 'Smart Templates',
      description: 'AI-powered template suggestions based on chief complaint and patient data',
    },
    {
      key: 'clinicalDecisionSupport' as const,
      title: 'Clinical Decision Support',
      description: 'Drug interaction checks, compliance warnings, and billing code optimization',
    },
    {
      key: 'realtimeSuggestions' as const,
      title: 'Real-time Suggestions',
      description: 'Live AI assistance while documenting patient encounters',
    },
    {
      key: 'aiInsights' as const,
      title: 'AI Insights & Analysis',
      description: 'Diagnostic suggestions, recommended questions, and clinical notes enhancement',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Features Configuration
          </CardTitle>
          <CardDescription>
            Control which AI-powered features are enabled in your medical practice management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {quotaExceeded && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI features are temporarily unavailable due to quota limits. Please try again later or contact support.
              </AlertDescription>
            </Alert>
          )}

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Enable AI Features</h3>
                <Badge variant={settings.masterToggle ? "default" : "secondary"}>
                  {settings.masterToggle ? "Active" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Master control for all AI-powered functionality
              </p>
            </div>
            <Switch
              checked={settings.masterToggle}
              onCheckedChange={(checked) => updateSetting('masterToggle', checked)}
              disabled={quotaExceeded}
            />
          </div>

          {/* Individual Features */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Individual Features</h4>
            {aiFeatures.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{feature.title}</h5>
                    {settings[feature.key] && settings.masterToggle && !quotaExceeded && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <Switch
                  checked={settings[feature.key]}
                  onCheckedChange={(checked) => updateSetting(feature.key, checked)}
                  disabled={!settings.masterToggle || quotaExceeded}
                />
              </div>
            ))}
          </div>

          {/* Status Information */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>AI Engine Status:</span>
                <Badge variant={quotaExceeded ? "destructive" : "default"}>
                  {quotaExceeded ? "Quota Exceeded" : "Operational"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Features:</span>
                <span className="text-muted-foreground">
                  {settings.masterToggle && !quotaExceeded
                    ? Object.values(settings).filter(Boolean).length - 1
                    : 0} / {aiFeatures.length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};