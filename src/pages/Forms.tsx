import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  ClipboardList, 
  UserPlus, 
  Stethoscope, 
  Scale, 
  FileText,
  Save,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formTypes = [
  {
    id: "new-patient",
    title: "New Patient Intake",
    description: "Complete intake form for new patients",
    icon: UserPlus,
    color: "bg-medical-blue/10 text-medical-blue"
  },
  {
    id: "pip-patient", 
    title: "PIP Patient Form",
    description: "Personal Injury Protection patient intake",
    icon: Stethoscope,
    color: "bg-medical-teal/10 text-medical-teal"
  },
  {
    id: "lead-capture",
    title: "Lead Capture Form", 
    description: "Capture new leads and referral information",
    icon: FileText,
    color: "bg-success/10 text-success"
  },
  {
    id: "pain-assessment",
    title: "Pain Assessment",
    description: "Detailed pain evaluation form",
    icon: Scale,
    color: "bg-yellow-500/10 text-yellow-700"
  }
];

const referringAttorneys = [
  "Johnson & Associates",
  "Miller Law Firm", 
  "Davis Legal Group",
  "Rodriguez & Partners",
  "Thompson Legal",
  "Other"
];

export default function Forms() {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would integrate with GoHighLevel API
    toast({
      title: "Form Submitted Successfully",
      description: "Patient information has been saved to the system.",
    });
    setSelectedForm(null);
    setFormData({});
  };

  const renderFormContent = () => {
    switch (selectedForm) {
      case "new-patient":
        return (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" required />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" />
            </div>

            <div>
              <Label htmlFor="insurance">Insurance Company</Label>
              <Input id="insurance" />
            </div>

            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Textarea id="chiefComplaint" rows={3} />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setSelectedForm(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-medical-blue hover:bg-medical-blue-dark">
                <Save className="w-4 h-4 mr-2" />
                Submit Form
              </Button>
            </div>
          </form>
        );

      case "pip-patient":
        return (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" required />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" />
              </div>
            </div>

            <div>
              <Label htmlFor="referringAttorney">Referring Attorney *</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Select referring attorney" />
                </SelectTrigger>
                <SelectContent>
                  {referringAttorneys.map((attorney) => (
                    <SelectItem key={attorney} value={attorney}>
                      {attorney}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accidentDate">Date of Accident *</Label>
              <Input id="accidentDate" type="date" required />
            </div>

            <div>
              <Label htmlFor="accidentDescription">Accident Description</Label>
              <Textarea id="accidentDescription" rows={3} />
            </div>

            <div>
              <Label htmlFor="currentSymptoms">Current Symptoms</Label>
              <Textarea id="currentSymptoms" rows={3} />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setSelectedForm(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-medical-blue hover:bg-medical-blue-dark">
                <Save className="w-4 h-4 mr-2" />
                Submit PIP Form
              </Button>
            </div>
          </form>
        );

      case "lead-capture":
        return (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" required />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" required />
            </div>

            <div>
              <Label htmlFor="referralSource">How did you hear about us?</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select referral source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attorney">Attorney Referral</SelectItem>
                  <SelectItem value="google">Google Search</SelectItem>
                  <SelectItem value="friend">Friend/Family</SelectItem>
                  <SelectItem value="insurance">Insurance Company</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" rows={3} />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setSelectedForm(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-medical-blue hover:bg-medical-blue-dark">
                <Save className="w-4 h-4 mr-2" />
                Capture Lead
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  if (selectedForm) {
    const form = formTypes.find(f => f.id === selectedForm);
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedForm(null)}
              className="mb-4"
            >
              ← Back to Forms
            </Button>
            <div className="flex items-center space-x-3">
              {form && <form.icon className="w-6 h-6 text-medical-blue" />}
              <h1 className="text-2xl font-bold">{form?.title}</h1>
            </div>
            <p className="text-muted-foreground">{form?.description}</p>
          </div>

          <Card className="border border-border/50 shadow-sm">
            <CardContent className="p-6">
              {renderFormContent()}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Forms</h1>
            <p className="text-muted-foreground">Data entry for patient intake and lead capture</p>
          </div>
          <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue">
            Data Entry Only
          </Badge>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formTypes.map((form) => {
            const Icon = form.icon;
            return (
              <Card 
                key={form.id} 
                className="border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedForm(form.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${form.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {form.description}
                  </p>
                  <Button className="w-full bg-medical-blue hover:bg-medical-blue-dark">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Open Form
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-medical-blue/5 rounded-lg">
                <div className="text-2xl font-bold text-medical-blue">12</div>
                <div className="text-sm text-muted-foreground">Forms Today</div>
              </div>
              <div className="text-center p-4 bg-success/5 rounded-lg">
                <div className="text-2xl font-bold text-success">8</div>
                <div className="text-sm text-muted-foreground">New Patients</div>
              </div>
              <div className="text-center p-4 bg-medical-teal/5 rounded-lg">
                <div className="text-2xl font-bold text-medical-teal">4</div>
                <div className="text-sm text-muted-foreground">PIP Cases</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">16</div>
                <div className="text-sm text-muted-foreground">Leads Captured</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}