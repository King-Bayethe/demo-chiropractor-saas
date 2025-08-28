import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Shield, Lock, Clock, AlertTriangle, FileText, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SecuritySettings = () => {
  const { settings, loading, updateSetting } = useSystemSettings();
  const { toast } = useToast();

  const handleForceLogoutAll = () => {
    toast({
      title: "Force Logout",
      description: "This feature will be implemented with the authentication system",
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Password Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password-length">Minimum Password Length</Label>
              <Input
                id="password-length"
                type="number"
                value={settings.password_min_length || 8}
                onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                min="6"
                max="32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-failed-logins">Max Failed Login Attempts</Label>
              <Input
                id="max-failed-logins"
                type="number"
                value={settings.max_failed_logins || 5}
                onChange={(e) => updateSetting('max_failed_logins', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Password Requirements</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Uppercase Letters</Label>
                  <p className="text-sm text-muted-foreground">A-Z</p>
                </div>
                <Switch
                  checked={settings.password_require_uppercase || false}
                  onCheckedChange={(checked) => updateSetting('password_require_uppercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Lowercase Letters</Label>
                  <p className="text-sm text-muted-foreground">a-z</p>
                </div>
                <Switch
                  checked={settings.password_require_lowercase || false}
                  onCheckedChange={(checked) => updateSetting('password_require_lowercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">0-9</p>
                </div>
                <Switch
                  checked={settings.password_require_numbers || false}
                  onCheckedChange={(checked) => updateSetting('password_require_numbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Symbols</Label>
                  <p className="text-sm text-muted-foreground">!@#$%</p>
                </div>
                <Switch
                  checked={settings.password_require_symbols || false}
                  onCheckedChange={(checked) => updateSetting('password_require_symbols', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.session_timeout || 120}
                onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                min="30"
                max="1440"
                step="30"
              />
              <p className="text-sm text-muted-foreground">
                Users will be logged out after this period of inactivity
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
              <Input
                id="lockout-duration"
                type="number"
                value={settings.account_lockout_duration || 30}
                onChange={(e) => updateSetting('account_lockout_duration', parseInt(e.target.value))}
                min="5"
                max="1440"
                step="5"
              />
              <p className="text-sm text-muted-foreground">
                How long accounts are locked after too many failed attempts
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Force Logout All Users</Label>
              <p className="text-sm text-muted-foreground">
                Immediately log out all users from all devices
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleForceLogoutAll}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Force Logout All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all users
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>IP Whitelisting</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Button variant="outline">
                Manage IPs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>HIPAA Compliance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced security and audit logging
                </p>
              </div>
              <Switch
                checked={settings.hipaa_compliance_mode || false}
                onCheckedChange={(checked) => updateSetting('hipaa_compliance_mode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enhanced Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all user actions and data access
                </p>
              </div>
              <Switch
                checked={settings.enhanced_audit_logging || false}
                onCheckedChange={(checked) => updateSetting('enhanced_audit_logging', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify admins of security events
                </p>
              </div>
              <Switch
                checked={settings.security_alerts || false}
                onCheckedChange={(checked) => updateSetting('security_alerts', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Export Audit Logs</Label>
              <p className="text-sm text-muted-foreground">
                Download security audit logs for compliance
              </p>
            </div>
            <Button variant="outline">
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};