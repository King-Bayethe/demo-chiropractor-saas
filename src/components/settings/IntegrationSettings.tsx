import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Puzzle, 
  ExternalLink, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Mail,
  MessageSquare,
  Calendar,
  Database
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "connected" | "disconnected" | "error";
  category: "communication" | "calendar" | "storage" | "analytics";
  features: string[];
}

export const IntegrationSettings = () => {
  const { toast } = useToast();
  const [integrations] = useState<Integration[]>([
    {
      id: "ghl",
      name: "Go High Level",
      description: "CRM and marketing automation platform",
      icon: Zap,
      status: "connected",
      category: "communication",
      features: ["Contact sync", "SMS/Email", "Pipelines", "Appointments"]
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync appointments with Google Calendar",
      icon: Calendar,
      status: "disconnected",
      category: "calendar",
      features: ["Two-way sync", "Event notifications", "Multiple calendars"]
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      description: "Sync with Outlook calendar and email",
      icon: Mail,
      status: "disconnected",
      category: "calendar",
      features: ["Calendar sync", "Email integration", "Teams meetings"]
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Cloud storage for patient documents",
      icon: Database,
      status: "error",
      category: "storage",
      features: ["File backup", "Document sharing", "Automatic sync"]
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "SMS and voice communication",
      icon: MessageSquare,
      status: "disconnected",
      category: "communication",
      features: ["SMS messaging", "Voice calls", "WhatsApp integration"]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const handleConnect = (integrationId: string) => {
    toast({
      title: "Integration setup",
      description: "Redirecting to authentication...",
    });
  };

  const handleDisconnect = (integrationId: string) => {
    toast({
      title: "Integration disconnected",
      description: "The integration has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="w-5 h-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connect external services to enhance your practice management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Integration Cards */}
          <div className="space-y-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="border border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {getStatusIcon(integration.status)}
                            {getStatusBadge(integration.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === "connected" ? (
                          <>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-1" />
                              Configure
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisconnect(integration.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(integration.id)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {integration.status === "error" && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Connection Error</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          Unable to sync data. Please check your configuration and try reconnecting.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">API Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-domain.com/webhook"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    value="sk-••••••••••••••••"
                    readOnly
                  />
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sync Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sync Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Instantly sync data changes across all connected platforms
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup data to connected storage services
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Error Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when sync errors occur
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};