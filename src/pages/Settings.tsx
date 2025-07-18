import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Users,
  Building,
  Languages,
  FileText,
  Mail,
  Plug,
  Upload,
  Plus,
  Edit,
  Trash2,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SettingsCategory = 
  | "general" 
  | "users" 
  | "referrals" 
  | "language" 
  | "forms" 
  | "email" 
  | "integrations";

interface StaffUser {
  id: string;
  name: string;
  role: string;
  email: string;
  lastLogin: string;
  status: "active" | "disabled";
}

interface Attorney {
  id: string;
  name: string;
  firmName: string;
  phone: string;
  notes: string;
}

const settingsCategories = [
  { id: "general", label: "General Settings", icon: SettingsIcon },
  { id: "users", label: "User Management", icon: Users },
  { id: "referrals", label: "Referral Sources", icon: Building },
  { id: "language", label: "Language Preferences", icon: Languages },
  { id: "forms", label: "Form Settings", icon: FileText },
  { id: "email", label: "Email & Notifications", icon: Mail },
  { id: "integrations", label: "Integrations", icon: Plug },
] as const;

const mockStaffUsers: StaffUser[] = [
  {
    id: "1",
    name: "Dr. Silverman",
    role: "Admin",
    email: "dr.silverman@clinic.com",
    lastLogin: "2024-01-18",
    status: "active",
  },
  {
    id: "2",
    name: "Front Desk",
    role: "Staff",
    email: "frontdesk@clinic.com",
    lastLogin: "2024-01-18",
    status: "active",
  },
];

const mockAttorneys: Attorney[] = [
  {
    id: "1",
    name: "John Rodriguez",
    firmName: "Rodriguez & Associates",
    phone: "(305) 555-0123",
    notes: "Specializes in PIP cases",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    firmName: "Legal Partners LLC",
    phone: "(305) 555-0456",
    notes: "High volume referrals",
  },
];

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("general");
  const [staffUsers] = useState<StaffUser[]>(mockStaffUsers);
  const [attorneys] = useState<Attorney[]>(mockAttorneys);

  // General Settings State
  const [clinicName, setClinicName] = useState("Silverman Chiropractic and Rehabilitation Center");
  const [clinicAddress, setClinicAddress] = useState("123 Medical Plaza, Miami, FL 33101");
  const [clinicPhone, setClinicPhone] = useState("(305) 555-0100");
  const [timeZone, setTimeZone] = useState("America/New_York");

  // Language Settings State
  const [defaultLanguage, setDefaultLanguage] = useState("english");
  const [allowLanguageToggle, setAllowLanguageToggle] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(false);

  // Form Settings State
  const [leadIntakeEnabled, setLeadIntakeEnabled] = useState(true);
  const [patientIntakeEnabled, setPatientIntakeEnabled] = useState(true);
  const [treatmentProgressEnabled, setTreatmentProgressEnabled] = useState(true);

  // Email Settings State
  const [clinicEmail, setClinicEmail] = useState("info@silvermanchiro.com");
  const [replyToEmail, setReplyToEmail] = useState("noreply@silvermanchiro.com");
  const [appointmentConfirmations, setAppointmentConfirmations] = useState(true);
  const [paymentConfirmations, setPaymentConfirmations] = useState(true);
  const [newLeadAlerts, setNewLeadAlerts] = useState(true);
  const [internalNotifications, setInternalNotifications] = useState(false);
  const [emailSignature, setEmailSignature] = useState("Best regards,\nSilverman Chiropractic Team");

  // Integration Settings State
  const [ghlApiKey, setGhlApiKey] = useState("ghl_************************");
  const [syncStatus, setSyncStatus] = useState<"active" | "disconnected">("active");

  const handleSaveChanges = () => {
    // Here you would save all settings to your backend/API
    toast({
      title: "Settings Saved",
      description: "All settings have been successfully updated.",
    });
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clinic-name">Clinic Name</Label>
          <Input
            id="clinic-name"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="clinic-phone">Phone Number</Label>
          <Input
            id="clinic-phone"
            value={clinicPhone}
            onChange={(e) => setClinicPhone(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="clinic-address">Clinic Address</Label>
        <Textarea
          id="clinic-address"
          value={clinicAddress}
          onChange={(e) => setClinicAddress(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="logo-upload">Logo Upload</Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-[#4DA8FF] transition-colors cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            Drag and drop your logo here, or click to browse
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="timezone">Time Zone</Label>
        <Select value={timeZone} onValueChange={setTimeZone}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Staff Users</h3>
        <Button className="bg-[#4DA8FF] hover:bg-[#007BFF] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Invite New User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderReferralSources = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attorney Referral Sources</h3>
        <Button className="bg-[#4DA8FF] hover:bg-[#007BFF] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add New Attorney
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attorney Name</TableHead>
              <TableHead>Firm Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attorneys.map((attorney) => (
              <TableRow key={attorney.id}>
                <TableCell className="font-medium">{attorney.name}</TableCell>
                <TableCell>{attorney.firmName}</TableCell>
                <TableCell className="text-muted-foreground">{attorney.phone}</TableCell>
                <TableCell className="text-muted-foreground">{attorney.notes}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderLanguagePreferences = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="default-language">Default UI Language</Label>
        <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">🇺🇸 English</SelectItem>
            <SelectItem value="spanish">🇪🇸 Español</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Allow Language Toggle for Users</Label>
          <p className="text-sm text-muted-foreground">
            Enable users to switch between languages
          </p>
        </div>
        <Switch checked={allowLanguageToggle} onCheckedChange={setAllowLanguageToggle} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Auto-detect Browser Language</Label>
          <p className="text-sm text-muted-foreground">
            Automatically set language based on browser settings
          </p>
        </div>
        <Switch checked={autoDetectLanguage} onCheckedChange={setAutoDetectLanguage} />
      </div>
    </div>
  );

  const renderFormSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Form Data Entry Options</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Lead Intake Form</Label>
            <p className="text-sm text-muted-foreground">Enable lead intake form submissions</p>
          </div>
          <Switch checked={leadIntakeEnabled} onCheckedChange={setLeadIntakeEnabled} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>New Patient Intake Form</Label>
            <p className="text-sm text-muted-foreground">Enable new patient intake forms</p>
          </div>
          <Switch checked={patientIntakeEnabled} onCheckedChange={setPatientIntakeEnabled} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Treatment Progress Form</Label>
            <p className="text-sm text-muted-foreground">Enable treatment progress tracking</p>
          </div>
          <Switch checked={treatmentProgressEnabled} onCheckedChange={setTreatmentProgressEnabled} />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clinic-email">Clinic Email Address</Label>
          <Input
            id="clinic-email"
            type="email"
            value={clinicEmail}
            onChange={(e) => setClinicEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="reply-to-email">Reply-to Address</Label>
          <Input
            id="reply-to-email"
            type="email"
            value={replyToEmail}
            onChange={(e) => setReplyToEmail(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Appointment Confirmations</Label>
            <Switch checked={appointmentConfirmations} onCheckedChange={setAppointmentConfirmations} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Payment Confirmations</Label>
            <Switch checked={paymentConfirmations} onCheckedChange={setPaymentConfirmations} />
          </div>
          <div className="flex items-center justify-between">
            <Label>New Lead Alerts</Label>
            <Switch checked={newLeadAlerts} onCheckedChange={setNewLeadAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Internal Notes Notifications</Label>
            <Switch checked={internalNotifications} onCheckedChange={setInternalNotifications} />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="email-signature">Email Signature Template</Label>
        <Textarea
          id="email-signature"
          value={emailSignature}
          onChange={(e) => setEmailSignature(e.target.value)}
          rows={4}
          placeholder="Enter your email signature template..."
        />
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="ghl-api-key">GoHighLevel API Key</Label>
        <Input
          id="ghl-api-key"
          type="password"
          value={ghlApiKey}
          onChange={(e) => setGhlApiKey(e.target.value)}
          placeholder="Enter your GoHighLevel API key"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Sync Status</Label>
          <p className="text-sm text-muted-foreground">
            Current connection status with GoHighLevel
          </p>
        </div>
        <Badge variant={syncStatus === "active" ? "default" : "destructive"}>
          {syncStatus === "active" ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div>
        <Label>Last Sync Time</Label>
        <p className="text-sm text-muted-foreground">January 18, 2024 at 3:45 PM</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case "general":
        return renderGeneralSettings();
      case "users":
        return renderUserManagement();
      case "referrals":
        return renderReferralSources();
      case "language":
        return renderLanguagePreferences();
      case "forms":
        return renderFormSettings();
      case "email":
        return renderEmailSettings();
      case "integrations":
        return renderIntegrations();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <Layout>
      <div className="h-full flex">
        {/* Settings Sidebar */}
        <div className="w-80 bg-gradient-to-b from-[#007BFF] to-[#0056CC] text-white flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <SettingsIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            <nav className="space-y-2">
              {settingsCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200",
                      activeCategory === category.id
                        ? "bg-white/15 text-white shadow-lg border-r-4 border-[#4DA8FF]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{category.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Save Button */}
          <div className="h-16 border-b border-border/50 bg-card px-6 flex items-center justify-between shadow-sm">
            <h2 className="text-xl font-semibold">
              {settingsCategories.find(cat => cat.id === activeCategory)?.label}
            </h2>
            <Button 
              onClick={handleSaveChanges}
              className="bg-[#4DA8FF] hover:bg-[#007BFF] text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          {/* Content Panel */}
          <div className="flex-1 overflow-auto p-6">
            <Card>
              <CardContent className="pt-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}