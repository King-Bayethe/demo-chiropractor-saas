import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Clock, Building, Upload, Palette } from "lucide-react";

const timezones = [
  { value: "America/New_York", label: "Eastern Time (EST/EDT)" },
  { value: "America/Chicago", label: "Central Time (CST/CDT)" },
  { value: "America/Denver", label: "Mountain Time (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PST/PDT)" },
  { value: "UTC", label: "UTC" },
];

export const GeneralSettings = () => {
  const { settings, loading, updateSetting } = useSystemSettings();

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timezone Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="timezone">Default System Timezone</Label>
            <Select 
              value={settings.default_timezone || "America/New_York"}
              onValueChange={(value) => updateSetting('default_timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This timezone will be used for all scheduling and appointment times across the system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-duration">Default Appointment Duration (minutes)</Label>
              <Input
                id="appointment-duration"
                type="number"
                value={settings.default_appointment_duration || 30}
                onChange={(e) => updateSetting('default_appointment_duration', parseInt(e.target.value))}
                min="15"
                max="240"
                step="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-logout">Auto-logout Timeout (minutes)</Label>
              <Input
                id="auto-logout"
                type="number"
                value={settings.auto_logout_timeout || 480}
                onChange={(e) => updateSetting('auto_logout_timeout', parseInt(e.target.value))}
                min="30"
                max="1440"
                step="30"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-start">Business Hours Start</Label>
              <Input
                id="business-start"
                type="time"
                value={settings.business_hours_start?.replace(/"/g, '') || "09:00"}
                onChange={(e) => updateSetting('business_hours_start', `"${e.target.value}"`)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-end">Business Hours End</Label>
              <Input
                id="business-end"
                type="time"
                value={settings.business_hours_end?.replace(/"/g, '') || "17:00"}
                onChange={(e) => updateSetting('business_hours_end', `"${e.target.value}"`)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-retention">Data Retention Period (days)</Label>
            <Input
              id="data-retention"
              type="number"
              value={settings.data_retention_days || 2555}
              onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value))}
              min="365"
              max="3650"
            />
            <p className="text-sm text-muted-foreground">
              How long to retain patient data (minimum 1 year, recommended 7 years for HIPAA compliance)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance & Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Dark Mode by Default</Label>
                <p className="text-sm text-muted-foreground">
                  New users will start with dark mode enabled
                </p>
              </div>
              <Switch
                checked={settings.default_dark_mode || false}
                onCheckedChange={(checked) => updateSetting('default_dark_mode', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground">
                  Upload your company logo (recommended: 200x60px, PNG/JPG)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};