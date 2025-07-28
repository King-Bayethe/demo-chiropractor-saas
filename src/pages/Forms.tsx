import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
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
  CheckCircle,
  FileCheck,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formTypes = [
  {
    id: "silverman-intake",
    title: "Silverman Chiropractic Intake",
    description: "Comprehensive patient intake with accident info and consent forms",
    icon: FileCheck,
    color: "bg-emerald-500/10 text-emerald-700"
  },
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
    id: "intake-lead",
    title: "Intake Lead Form",
    description: "GoHighLevel intake lead form integration",
    icon: ClipboardList,
    color: "bg-purple-500/10 text-purple-700"
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
      case "silverman-intake":
        return (
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Header */}
            <div className="text-center border-b border-border pb-6">
              <h2 className="text-2xl font-bold text-primary">Silverman Chiropractic & Rehabilitation Center</h2>
              <p className="text-muted-foreground mt-2">Patient Intake Form</p>
              <p className="text-sm text-muted-foreground">946 S.W. 82nd Avenue Miami, Florida 33144 | (305) 595-9920</p>
            </div>

            {/* General Information */}
            <fieldset className="border border-border rounded-lg p-6">
              <legend className="text-lg font-semibold text-primary px-3">General Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="last_name" />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="first_name" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" />
                </div>
                <div>
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input id="zip" name="zip" />
                </div>
                <div>
                  <Label htmlFor="phoneHome">Home Phone</Label>
                  <Input id="phoneHome" name="phone_home" type="tel" />
                </div>
                <div>
                  <Label htmlFor="phoneWork">Work Phone</Label>
                  <Input id="phoneWork" name="phone_work" type="tel" />
                </div>
                <div>
                  <Label htmlFor="phoneCell">Cell Phone</Label>
                  <Input id="phoneCell" name="phone_cell" type="tel" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" />
                </div>
                <div>
                  <Label htmlFor="ssn">Social Security Number</Label>
                  <Input id="ssn" name="ssn" />
                </div>
                <div>
                  <Label htmlFor="licenseNum">Driver's License #</Label>
                  <Input id="licenseNum" name="license_num" />
                </div>
                <div>
                  <Label htmlFor="licenseState">License State</Label>
                  <Input id="licenseState" name="license_state" />
                </div>
                <div>
                  <Label>Gender</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gender" value="male" />
                      Male
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gender" value="female" />
                      Female
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Label>Marital Status</Label>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="marital_status" value="single" />
                      Single
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="marital_status" value="married" />
                      Married
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="marital_status" value="divorced" />
                      Divorced
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="marital_status" value="widowed" />
                      Widowed
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="responsibleParty">Parent or Financially Responsible Person</Label>
                  <Input id="responsibleParty" name="responsible_party" />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input id="emergencyContact" name="emergency_contact" />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input id="emergencyPhone" name="emergency_phone" type="tel" />
                </div>
              </div>
            </fieldset>

            {/* Employment & Student Status */}
            <fieldset className="border border-border rounded-lg p-6">
              <legend className="text-lg font-semibold text-primary px-3">Employment & Student Status</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="employer">Employer Name</Label>
                  <Input id="employer" name="employer" />
                </div>
                <div className="md:col-span-2">
                  <Label>Employment Status</Label>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="employment_status" value="full_time" />
                      Full Time
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="employment_status" value="part_time" />
                      Part Time
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="employment_status" value="retired" />
                      Retired
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="employment_status" value="not_employed" />
                      Not Employed
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Student Status</Label>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="student_status" value="full_time" />
                      Full Time Student
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="student_status" value="part_time" />
                      Part Time Student
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="student_status" value="non_student" />
                      Non-Student
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Accident Information */}
            <fieldset className="border border-border rounded-lg p-6">
              <legend className="text-lg font-semibold text-primary px-3">Accident Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="accidentDate">Date of Accident</Label>
                  <Input id="accidentDate" name="accident_date" type="date" />
                </div>
                <div>
                  <Label>Did you go to the hospital?</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="hospital_visit" value="yes" />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="hospital_visit" value="no" />
                      No
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="hospitalName">If yes, name of hospital</Label>
                  <Input id="hospitalName" name="hospital_name" />
                </div>
                <div className="md:col-span-2">
                  <Label>Have you gone to any other clinic regarding this accident?</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="other_clinic" value="yes" />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="other_clinic" value="no" />
                      No
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="passengers">Passengers in Vehicle</Label>
                  <Textarea id="passengers" name="passengers" rows={3} />
                </div>
              </div>
            </fieldset>

            {/* Insurance Information */}
            <fieldset className="border border-border rounded-lg p-6">
              <legend className="text-lg font-semibold text-primary px-3">Insurance Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="autoInsurance">Auto Insurance Company</Label>
                  <Input id="autoInsurance" name="auto_insurance" />
                </div>
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input id="policyNumber" name="policy_number" />
                </div>
                <div>
                  <Label htmlFor="claimNumber">Claim Number</Label>
                  <Input id="claimNumber" name="claim_number" />
                </div>
                <div>
                  <Label htmlFor="adjusterName">Adjuster's Name</Label>
                  <Input id="adjusterName" name="adjuster_name" />
                </div>
                <div className="lg:col-span-3 border-t border-border pt-4 mt-4">
                  <h4 className="font-medium mb-4">Health Insurance</h4>
                </div>
                <div>
                  <Label htmlFor="healthInsurance">Health Insurance</Label>
                  <Input id="healthInsurance" name="health_insurance" />
                </div>
                <div>
                  <Label htmlFor="healthId">ID#</Label>
                  <Input id="healthId" name="health_id" />
                </div>
                <div>
                  <Label htmlFor="healthGroup">Group #</Label>
                  <Input id="healthGroup" name="health_group" />
                </div>
                <div>
                  <Label htmlFor="healthPhone">Insurance Phone Number</Label>
                  <Input id="healthPhone" name="health_phone" type="tel" />
                </div>
                <div className="lg:col-span-3 border-t border-border pt-4 mt-4">
                  <h4 className="font-medium mb-4">Other</h4>
                </div>
                <div>
                  <Label htmlFor="medicaidId">Medicaid/Medicare ID#</Label>
                  <Input id="medicaidId" name="medicaid_id" />
                </div>
                <div>
                  <Label htmlFor="attorneyName">Attorney's Name</Label>
                  <Input id="attorneyName" name="attorney_name" />
                </div>
                <div>
                  <Label htmlFor="attorneyPhone">Attorney's Phone Number</Label>
                  <Input id="attorneyPhone" name="attorney_phone" type="tel" />
                </div>
              </div>
            </fieldset>

            {/* Symptoms & Medical History */}
            <fieldset className="border border-border rounded-lg p-6">
              <legend className="text-lg font-semibold text-primary px-3">Symptoms & Medical History</legend>
              <div className="space-y-6 mt-4">
                <div>
                  <Label htmlFor="painDescription">Please describe your pain and mark the areas of pain on your body</Label>
                  <Textarea id="painDescription" name="pain_description" rows={4} placeholder="Example: Sharp pain in lower back, dull ache in neck..." />
                </div>
                <div>
                  <Label>Please check any of the following symptoms you are now experiencing:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {[
                      'Headache', 'Neck Pain', 'Neck Stiff', 'Back Pain', 'Jaw Pain', 'Chest/Rib Pain',
                      'Tingling in Arms/Hands', 'Numbness in Arms/Hands', 'Pain in Arms/Hands', 'Loss of Strength - Arms',
                      'Tingling in Legs/Feet', 'Numbness in Legs/Feet', 'Pain in Legs/Feet', 'Loss of Strength - Legs',
                      'Fatigue', 'Irritability', 'Dizziness', 'Loss of Balance', 'Loss of Memory', 'Sleeping Problems',
                      'Ears Ring', 'Loss of Smell', 'Nausea', 'Shortness of Breath'
                    ].map((symptom) => (
                      <label key={symptom} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="symptoms[]" value={symptom.toLowerCase().replace(/\s+/g, '_')} />
                        {symptom}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Consents & Authorizations */}
            <fieldset className="border border-border rounded-lg p-6">
              <legend className="text-lg font-semibold text-primary px-3">Consents & Authorizations</legend>
              <div className="space-y-6 mt-4">
                <div className="bg-muted/50 border-l-4 border-primary p-4 rounded">
                  <h4 className="font-semibold mb-2">Request for Legal Assistance</h4>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="legal_assistance" value="yes" className="mt-1" />
                    I am requesting assistance from Silverman Chiropractic in obtaining legal representation regarding my accident.
                  </label>
                </div>

                <div className="bg-muted/50 border-l-4 border-primary p-4 rounded">
                  <h4 className="font-semibold mb-2">Release and Assignment</h4>
                  <p className="text-sm mb-3">I authorize release of any information necessary to process my insurance claims and assign and request payment directly to my physicians.</p>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="release_assignment_ack" required className="mt-1" />
                    I acknowledge and agree.
                  </label>
                </div>

                <div className="bg-muted/50 border-l-4 border-primary p-4 rounded">
                  <h4 className="font-semibold mb-2">Doctor's Lien</h4>
                  <p className="text-sm mb-3">I hereby authorize and direct my attorney to pay directly to said doctor such sums as may be due and owing for professional services rendered. I give a lien on my case to the said center against any and all proceeds from any settlement, judgment, or verdict.</p>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="lien_ack" required className="mt-1" />
                    I acknowledge and agree.
                  </label>
                </div>

                <div className="bg-muted/50 border-l-4 border-primary p-4 rounded">
                  <h4 className="font-semibold mb-2">Consent to Medical Care</h4>
                  <p className="text-sm mb-3">I authorize Silverman Chiropractic and Rehabilitation Center to determine and perform necessary tests and treatments. I understand that medical tests and treatment may involve certain unavoidable risks.</p>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="consent_care_ack" required className="mt-1" />
                    I acknowledge and agree.
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signature">Patient Signature (type full name) *</Label>
                    <Input id="signature" name="signature" required />
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end space-x-3 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setSelectedForm(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Submit Intake Form
              </Button>
            </div>
          </form>
        );

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
              <Label htmlFor="referringAttorney">Attorney Referral *</Label>
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

      case "intake-lead":
        return (
          <div className="w-full h-[800px]">
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/a54gsPXSCoG54enqSqJU"
              style={{width: '100%', height: '100%', border: 'none', borderRadius: '3px'}}
              id="inline-a54gsPXSCoG54enqSqJU" 
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Intake Lead form"
              data-height="774"
              data-layout-iframe-id="inline-a54gsPXSCoG54enqSqJU"
              data-form-id="a54gsPXSCoG54enqSqJU"
              title="Intake Lead form"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedForm) {
    const form = formTypes.find(f => f.id === selectedForm);
    return (
      <AuthGuard>
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
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}