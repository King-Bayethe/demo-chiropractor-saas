import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check, Circle } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";

const PublicPIPForm = () => {
  const [currentTab, setCurrentTab] = useState("general");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    // General Information
    lastName: "",
    firstName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    homePhone: "",
    workPhone: "",
    cellPhone: "",
    email: "",
    licenseNumber: "",
    licenseState: "",
    dob: "",
    ssn: "",
    sex: "",
    maritalStatus: "",
    emergencyContact: "",
    emergencyPhone: "",
    employment: "",
    student: "",
    
    // Accident Information
    accidentDate: "",
    accidentTime: "",
    accidentDescription: "",
    accidentLocation: "",
    accidentCity: "",
    personRole: "",
    vehicleMotion: "",
    headPosition: "",
    thrownDirection: "",
    sawImpact: "",
    braceForImpact: "",
    hitCar: "",
    hitCarDetails: "",
    wentToHospital: "",
    hospitalName: "",
    lossOfConsciousness: "",
    consciousnessLength: "",
    
    // Insurance & Legal
    vehicleOwner: "",
    relationshipToOwner: "",
    vehicleDriver: "",
    relationshipToDriver: "",
    householdMembers: "",
    ownedVehicles: "",
    
    // Medical History
    previousAccidents: "",
    allergies: "",
    drinksAlcohol: "",
    smokes: "",
    familyHistory: {
      heartTrouble: false,
      stroke: false,
      diabetes: false,
      cancer: false,
      arthritis: false,
      highBloodPressure: false,
      kidneyDisease: false,
      mentalIllness: false,
      asthma: false,
      epilepsy: false,
      kyphosis: false,
      lungDisease: false,
      osteoporosis: false,
      migraines: false,
      scoliosis: false,
      spineProblems: false,
      other: false,
    },
    
    // Pain & Symptoms
    painLocation: "",
    painDescription: {
      sharp: false,
      dull: false,
      achy: false,
      burning: false,
      shooting: false,
      stabbing: false,
      deep: false,
      spasm: false,
    },
    currentSymptoms: {
      headache: false,
      neckPain: false,
      neckStiff: false,
      upperBackPain: false,
      midBackPain: false,
      lowerBackPain: false,
      painArmsHands: false,
      painLegsFeet: false,
      lossStrengthArms: false,
      lossStrengthLegs: false,
      numbnessArmsHands: false,
      numbnessLegsFeet: false,
      tinglingArmsHands: false,
      tinglingLegsFeet: false,
      dizziness: false,
      fatigue: false,
      irritability: false,
    },
    
    // Review of Systems
    systemReview: {
      fever: "",
      chills: "",
      fatigue: "",
      blurredVision: "",
      doubleVision: "",
      eyePain: "",
      ringingEars: "",
      decreasedHearing: "",
      difficultySwallowing: "",
      chestPains: "",
      palpitations: "",
      swollenAnkles: "",
      chronicCough: "",
      difficultyBreathing: "",
      nausea: "",
      vomiting: "",
      abdominalPain: "",
      backPain: "",
      neckPain: "",
      shoulderPain: "",
      weakness: "",
      dizziness: "",
      numbness: "",
      depression: "",
      anxiety: "",
      memoryLoss: "",
    },
    
    // Communications
    alternativeCommunication: "",
    emailConsent: "",
    
    // Release Information
    releasePersonOrganization: "",
    releaseAddress: "",
    releasePhone: "",
    releaseReason: "",
    healthcareFacility: "",
    healthcareFacilityAddress: "",
    healthcareFacilityPhone: "",
    treatmentDates: "",
    
    // Authorizations
    radiologySignature: "",
    radiologyDate: "",
    patientSignature: "",
    finalDate: "",
  });

  // Check if a section is completed based on required fields
  const isSectionCompleted = (section: string) => {
    switch (section) {
      case "general":
        return formData.lastName && formData.firstName && formData.email && formData.dob;
      case "accident":
        return formData.accidentDate && formData.accidentDescription;
      case "insurance":
        return formData.vehicleOwner && formData.vehicleDriver;
      case "medical":
        return formData.allergies !== "" || formData.previousAccidents;
      case "symptoms":
        return formData.painLocation;
      case "review":
        return Object.values(formData.systemReview).some(value => value !== "");
      case "communications":
        return formData.emailConsent;
      case "release":
        return formData.releasePersonOrganization || formData.healthcareFacility;
      case "auth":
        return formData.patientSignature;
      default:
        return false;
    }
  };

  const tabs = [
    // First row
    { id: "general", label: "General", spanish: "", row: 1 },
    { id: "accident", label: "Accident", spanish: "(Accidente)", row: 1 },
    { id: "insurance", label: "Insurance", spanish: "(Seguro)", row: 1 },
    { id: "medical", label: "Medical History", spanish: "(Historial)", row: 1 },
    { id: "symptoms", label: "Symptoms", spanish: "(Síntomas)", row: 1 },
    // Second row
    { id: "review", label: "System Review", spanish: "(Revisión)", row: 2 },
    { id: "communications", label: "Communications", spanish: "(Comunicaciones)", row: 2 },
    { id: "release", label: "Release of Info", spanish: "", row: 2 },
    { id: "auth", label: "Authorizations", spanish: "(Autorizaciones)", row: 2 }
  ];

  const firstRowTabs = tabs.filter(tab => tab.row === 1);
  const secondRowTabs = tabs.filter(tab => tab.row === 2);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientSignature) {
      toast.error("Please provide your signature");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'pip',
          formData: formData
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Form submitted successfully! We will contact you soon.");
      
      // Reset form would go here if needed
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Silverman Chiropractic & Rehabilitation Center</h1>
          <p className="text-md text-muted-foreground mt-2">
            PIP Intake Form / <span className="text-muted-foreground/70">Formulario de Admisión PIP</span>
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="space-y-4 mb-8">
              {/* First Row of Tabs */}
              <div className="flex flex-wrap justify-center gap-4 border-b border-border pb-2">
                {firstRowTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      currentTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {isSectionCompleted(tab.id) && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    <span>
                      {tab.label} {tab.spanish && <span className="text-muted-foreground">{tab.spanish}</span>}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Second Row of Tabs */}
              <div className="flex flex-wrap justify-center gap-4 border-b border-border pb-2">
                {secondRowTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      currentTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {isSectionCompleted(tab.id) && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    <span>
                      {tab.label} {tab.spanish && <span className="text-muted-foreground">{tab.spanish}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* General Information Tab */}
            <TabsContent value="general">
              <div className="space-y-6 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-3">
                  General Information <span className="text-muted-foreground">(Información General)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="last-name">Last Name <span className="text-muted-foreground">(Apellido)</span></Label>
                    <Input 
                      id="last-name" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="first-name">First Name <span className="text-muted-foreground">(Nombre)</span></Label>
                    <Input 
                      id="first-name" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address <span className="text-muted-foreground">(Dirección)</span></Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City <span className="text-muted-foreground">(Ciudad)</span></Label>
                    <Input 
                      id="city" 
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State <span className="text-muted-foreground">(Estado)</span></Label>
                    <Input 
                      id="state" 
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Zip Code <span className="text-muted-foreground">(Código Postal)</span></Label>
                    <Input 
                      id="zip" 
                      value={formData.zip}
                      onChange={(e) => handleInputChange("zip", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="home-phone">Home Phone <span className="text-muted-foreground">(Teléfono Casa)</span></Label>
                    <Input 
                      id="home-phone" 
                      type="tel"
                      value={formData.homePhone}
                      onChange={(e) => handleInputChange("homePhone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-phone">Work Phone <span className="text-muted-foreground">(Teléfono Trabajo)</span></Label>
                    <Input 
                      id="work-phone" 
                      type="tel"
                      value={formData.workPhone}
                      onChange={(e) => handleInputChange("workPhone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cell-phone">Cell Phone <span className="text-muted-foreground">(Teléfono Celular)</span></Label>
                    <Input 
                      id="cell-phone" 
                      type="tel"
                      value={formData.cellPhone}
                      onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email <span className="text-muted-foreground">(Correo Electrónico)</span></Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="license-number">License # <span className="text-muted-foreground">(Número de Lic #)</span></Label>
                    <Input 
                      id="license-number" 
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license-state">State <span className="text-muted-foreground">(Estado)</span></Label>
                    <Input 
                      id="license-state" 
                      value={formData.licenseState}
                      onChange={(e) => handleInputChange("licenseState", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="dob">Date of Birth <span className="text-muted-foreground">(Fecha de Nacimiento)</span></Label>
                    <Input 
                      id="dob" 
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ssn">Social Security # <span className="text-muted-foreground">(Num. Seguro Social)</span></Label>
                    <Input 
                      id="ssn" 
                      value={formData.ssn}
                      onChange={(e) => handleInputChange("ssn", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sex <span className="text-muted-foreground">(Sexo)</span></Label>
                    <Select onValueChange={(value) => handleInputChange("sex", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male (Masculino)</SelectItem>
                        <SelectItem value="female">Female (Femenino)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Document Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 bg-muted/30 rounded-lg">
                  <h3 className="md:col-span-2 text-lg font-semibold text-foreground border-b pb-2">
                    Document Uploads <span className="text-muted-foreground">(Subida de Documentos)</span>
                  </h3>
                  
                  <DocumentUpload
                    documentType="drivers-license-front"
                    label="Driver's License Front"
                    spanishLabel="Frente de Licencia"
                  />
                  
                  <DocumentUpload
                    documentType="drivers-license-back"
                    label="Driver's License Back"
                    spanishLabel="Reverso de Licencia"
                  />
                  
                  <DocumentUpload
                    documentType="insurance-card-front"
                    label="Insurance Card Front"
                    spanishLabel="Frente de Tarjeta de Seguro"
                  />
                  
                  <DocumentUpload
                    documentType="insurance-card-back"
                    label="Insurance Card Back"
                    spanishLabel="Reverso de Tarjeta de Seguro"
                  />
                </div>
                
                <div>
                  <Label htmlFor="marital-status">Marital Status</Label>
                  <Select onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single (Soltero/a)</SelectItem>
                      <SelectItem value="married">Married (Casado/a)</SelectItem>
                      <SelectItem value="divorced">Divorced (Divorciado/a)</SelectItem>
                      <SelectItem value="widowed">Widowed (Viudo/a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="emergency-contact">Emergency Contact <span className="text-muted-foreground">(Contacto en Caso de Emergencia)</span></Label>
                    <Input 
                      id="emergency-contact" 
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-phone">Emergency Phone <span className="text-muted-foreground">(Teléfono)</span></Label>
                    <Input 
                      id="emergency-phone" 
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold pt-4 border-t">Employment & Student Status <span className="text-muted-foreground">(Trabajo y Tipo de Estudiante)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Employment <span className="text-muted-foreground">(Trabajo)</span></Label>
                    <Select onValueChange={(value) => handleInputChange("employment", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Full-Time (Tiempo Completo)</SelectItem>
                        <SelectItem value="parttime">Part-Time (Medio Tiempo)</SelectItem>
                        <SelectItem value="retired">Retired (Retirado)</SelectItem>
                        <SelectItem value="unemployed">Unemployed (Desempleado)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Student <span className="text-muted-foreground">(Estudiante)</span></Label>
                    <Select onValueChange={(value) => handleInputChange("student", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Full-Time (Tiempo Completo)</SelectItem>
                        <SelectItem value="parttime">Part-Time (Medio Tiempo)</SelectItem>
                        <SelectItem value="not-student">Not a Student (No Estudio)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Accident Details Tab */}
            <TabsContent value="accident">
              <div className="space-y-6 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-3">
                  Accident Information <span className="text-muted-foreground">(Informacion sobre el Accidente)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accident-date">Date of Accident <span className="text-muted-foreground">(Fecha del Accidente)</span></Label>
                    <Input 
                      id="accident-date" 
                      type="date"
                      value={formData.accidentDate}
                      onChange={(e) => handleInputChange("accidentDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accident-time">Time of Accident <span className="text-muted-foreground">(Hora que occurio)</span></Label>
                    <Input 
                      id="accident-time" 
                      type="time"
                      value={formData.accidentTime}
                      onChange={(e) => handleInputChange("accidentTime", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accident-description">Describe how the Accident took place: <span className="text-muted-foreground">(Describe como el Accidente se llevo a cabo)</span></Label>
                  <Textarea 
                    id="accident-description" 
                    rows={3}
                    value={formData.accidentDescription}
                    onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accident-location">Accident Location <span className="text-muted-foreground">(Donde fue el Accidente)</span></Label>
                    <Input 
                      id="accident-location" 
                      placeholder="Street/Address (Calle o direccion)"
                      value={formData.accidentLocation}
                      onChange={(e) => handleInputChange("accidentLocation", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accident-city">City/State <span className="text-muted-foreground">(Ciudad/Estado)</span></Label>
                    <Input 
                      id="accident-city" 
                      value={formData.accidentCity}
                      onChange={(e) => handleInputChange("accidentCity", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Were you the:</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("personRole", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="driver" id="driver" />
                        <Label htmlFor="driver">Driver</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="passenger" id="passenger" />
                        <Label htmlFor="passenger">Passenger</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rear-passenger" id="rear-passenger" />
                        <Label htmlFor="rear-passenger">Rear Passenger</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pedestrian" id="pedestrian" />
                        <Label htmlFor="pedestrian">Pedestrian</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Were you:</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("vehicleMotion", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="slowly-moving" id="slowly-moving" />
                        <Label htmlFor="slowly-moving">Slowly Moving</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moving" id="moving" />
                        <Label htmlFor="moving">Moving</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stopped" id="stopped" />
                        <Label htmlFor="stopped">Stopped</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <h3 className="text-lg font-semibold pt-4 border-t">Impact Details <span className="text-muted-foreground">(Detalles del Impacto)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">On impact, your head was looking:</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("headPosition", value)}>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ahead" id="ahead" />
                          <Label htmlFor="ahead">Ahead</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="behind" id="behind" />
                          <Label htmlFor="behind">Behind</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="up" id="up" />
                          <Label htmlFor="up">Up</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="down" id="down" />
                          <Label htmlFor="down">Down</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="right" />
                          <Label htmlFor="right">Right</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="left" />
                          <Label htmlFor="left">Left</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">On impact, you were thrown:</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("thrownDirection", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="forward" id="forward" />
                        <Label htmlFor="forward">Forward</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="backward" id="backward" />
                        <Label htmlFor="backward">Backward</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sideways" id="sideways" />
                        <Label htmlFor="sideways">Sideways</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Did you see the impact coming?</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("sawImpact", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="saw-yes" />
                        <Label htmlFor="saw-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="saw-no" />
                        <Label htmlFor="saw-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Did you brace for impact?</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("braceForImpact", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="brace-yes" />
                        <Label htmlFor="brace-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="brace-no" />
                        <Label htmlFor="brace-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Did your body hit anything inside the car? <span className="text-muted-foreground">(¿Se golpeo con alguna parte del-carro?)</span></p>
                  <div className="flex gap-4 items-center">
                    <RadioGroup onValueChange={(value) => handleInputChange("hitCar", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="hit-yes" />
                        <Label htmlFor="hit-yes">Yes <span className="text-muted-foreground">(Si)</span></Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="hit-no" />
                        <Label htmlFor="hit-no">No</Label>
                      </div>
                    </RadioGroup>
                    <Input 
                      className="flex-grow" 
                      placeholder="Body Part (Parte del Cuerpo) / Part of Car (Parte del Carro)"
                      value={formData.hitCarDetails}
                      onChange={(e) => handleInputChange("hitCarDetails", e.target.value)}
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold pt-4 border-t">Medical Attention <span className="text-muted-foreground">(Atencion Medica)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Did you go to the hospital? <span className="text-muted-foreground">(¿Fue al Hospital?)</span></p>
                    <RadioGroup onValueChange={(value) => handleInputChange("wentToHospital", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="hospital-yes" />
                        <Label htmlFor="hospital-yes">Yes <span className="text-muted-foreground">(Si)</span></Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="hospital-no" />
                        <Label htmlFor="hospital-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="hospital-name">Name of Hospital <span className="text-muted-foreground">(Nombre del hospital)</span></Label>
                    <Input 
                      id="hospital-name" 
                      value={formData.hospitalName}
                      onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Loss of Consciousness?</p>
                    <RadioGroup onValueChange={(value) => handleInputChange("lossOfConsciousness", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="loc-yes" />
                        <Label htmlFor="loc-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="loc-no" />
                        <Label htmlFor="loc-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>For how long?</Label>
                    <Input 
                      value={formData.consciousnessLength}
                      onChange={(e) => handleInputChange("consciousnessLength", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Insurance Verification Tab */}
            <TabsContent value="insurance">
              <div className="space-y-6 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-3">
                  Insurance & Legal Information <span className="text-muted-foreground">(Informacion del Seguro)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>The OWNER of the vehicle is:</Label>
                    <Input 
                      value={formData.vehicleOwner}
                      onChange={(e) => handleInputChange("vehicleOwner", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>My relationship to the OWNER:</Label>
                    <Input 
                      value={formData.relationshipToOwner}
                      onChange={(e) => handleInputChange("relationshipToOwner", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>The DRIVER of the vehicle is:</Label>
                    <Input 
                      value={formData.vehicleDriver}
                      onChange={(e) => handleInputChange("vehicleDriver", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>My relationship to the DRIVER:</Label>
                    <Input 
                      value={formData.relationshipToDriver}
                      onChange={(e) => handleInputChange("relationshipToDriver", e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Label>List all people you lived with on the date of the accident:</Label>
                  <Textarea 
                    rows={3} 
                    placeholder="Name, Driver's License (Y/N), Relationship to you"
                    value={formData.householdMembers}
                    onChange={(e) => handleInputChange("householdMembers", e.target.value)}
                  />
                </div>
                <div className="pt-4 border-t">
                  <Label>List all vehicles owned/leased by you or anyone you lived with:</Label>
                  <Textarea 
                    rows={3} 
                    placeholder="Year, Make/Model, Owner Name, Insurance Company, Policy #"
                    value={formData.ownedVehicles}
                    onChange={(e) => handleInputChange("ownedVehicles", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="medical">
              <div className="space-y-6 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-3">
                  Medical History <span className="text-muted-foreground">(Historial Medico)</span>
                </h2>
                <div>
                  <Label>List any previous accidents (auto, work, falls, etc.) and date:</Label>
                  <Textarea 
                    rows={3}
                    value={formData.previousAccidents}
                    onChange={(e) => handleInputChange("previousAccidents", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Do you have any allergies?</Label>
                  <Input 
                    id="allergies" 
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Do you drink alcohol? <span className="text-muted-foreground">(¿Bebe alcohol?)</span></p>
                    <RadioGroup onValueChange={(value) => handleInputChange("drinksAlcohol", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="alcohol-yes" />
                        <Label htmlFor="alcohol-yes">Yes <span className="text-muted-foreground">(Si)</span></Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="alcohol-no" />
                        <Label htmlFor="alcohol-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Do you smoke? <span className="text-muted-foreground">(¿Fumas?)</span></p>
                    <RadioGroup onValueChange={(value) => handleInputChange("smokes", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="smoke-yes" />
                        <Label htmlFor="smoke-yes">Yes <span className="text-muted-foreground">(Si)</span></Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="smoke-no" />
                        <Label htmlFor="smoke-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Members of my family suffer with the following:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(formData.familyHistory).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange("familyHistory", key, checked)}
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Symptoms Tab */}
            <TabsContent value="symptoms">
              <div className="space-y-6 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-3">
                  Pain & Symptoms <span className="text-muted-foreground">(Dolor y Síntomas)</span>
                </h2>
                <div>
                  <Label htmlFor="pain-location">Where do you feel the pain? Please be specific. <span className="text-muted-foreground">(¿Dónde siente el dolor?)</span></Label>
                  <Textarea 
                    id="pain-location" 
                    rows={3}
                    value={formData.painLocation}
                    onChange={(e) => handleInputChange("painLocation", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Describe your pain:</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                    {Object.entries(formData.painDescription).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange("painDescription", key, checked)}
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Please check any symptoms you are now experiencing:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(formData.currentSymptoms).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange("currentSymptoms", key, checked)}
                        />
                        <Label htmlFor={key} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* System Review Tab */}
            <TabsContent value="review">
              <div className="space-y-6 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold border-b pb-3">Review of Systems <span className="text-muted-foreground">(Revisión de Sistemas)</span></h2>
                <p className="text-sm text-muted-foreground">Do you currently have or have had any of the following problems? Please check Yes or No for every item. <span className="text-muted-foreground/70">(¿Tiene o ha tenido alguno de los siguientes problemas? Por favor marque Sí o No para cada elemento.)</span></p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-2 border-b">General</h3>
                    {['fever', 'chills', 'fatigue'].map((item) => (
                      <div key={item} className="flex justify-between items-center">
                        <span className="capitalize">{item}</span>
                        <RadioGroup 
                          value={formData.systemReview[item]} 
                          onValueChange={(value) => handleNestedChange("systemReview", item, value)}
                          className="flex gap-2"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="yes" id={`${item}-y`} />
                            <Label htmlFor={`${item}-y`}>Y</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="no" id={`${item}-n`} />
                            <Label htmlFor={`${item}-n`}>N</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-2 border-b">Eyes</h3>
                    {['blurredVision', 'doubleVision', 'eyePain'].map((item) => (
                      <div key={item} className="flex justify-between items-center">
                        <span>{item.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <RadioGroup 
                          value={formData.systemReview[item]} 
                          onValueChange={(value) => handleNestedChange("systemReview", item, value)}
                          className="flex gap-2"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="yes" id={`${item}-y`} />
                            <Label htmlFor={`${item}-y`}>Y</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="no" id={`${item}-n`} />
                            <Label htmlFor={`${item}-n`}>N</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                  {/* ... rest of system review sections ... */}
                </div>
              </div>
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications">
              <div className="space-y-8 bg-background p-6 rounded-lg shadow-sm">
                <div>
                  <h2 className="text-xl font-semibold border-b pb-3">Confidential Communications <span className="text-muted-foreground">(Comunicaciones Confidenciales)</span></h2>
                  <p className="text-sm text-muted-foreground mt-4">I am requesting that SCRC communicate with me by an alternative means or at an alternative address or phone number that is more confidential for me. I understand that the Medical Center will not accommodate unreasonable requests. <span className="text-muted-foreground/70">(Solicito que SCRC se comunique conmigo por medios alternativos o en una dirección o número de teléfono alternativo que sea más confidencial para mí. Entiendo que el Centro Médico no acomodará solicitudes irrazonables.)</span></p>
                  <div className="mt-4">
                    <Label htmlFor="comm-alt">Describe the alternative means of communication you are requesting: <span className="text-muted-foreground">(Describa los medios alternativos de comunicación que solicita:)</span></Label>
                    <Textarea 
                      id="comm-alt" 
                      rows={3}
                      value={formData.alternativeCommunication}
                      onChange={(e) => handleInputChange("alternativeCommunication", e.target.value)}
                    />
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold">E-Mail Consent Form <span className="text-muted-foreground">(Formulario de Consentimiento de Correo Electrónico)</span></h3>
                  <p className="text-sm text-muted-foreground mt-2">I understand the risks associated with communication of e-mail between SCRC and me and consent to the conditions outlined. I agree and consent that SCRC may communicate with me regarding my protected health information by e-mail. <span className="text-muted-foreground/70">(Entiendo los riesgos asociados con la comunicación por correo electrónico entre SCRC y yo, y consiento las condiciones descritas. Acepto y consiento que SCRC pueda comunicarse conmigo sobre mi información de salud protegida por correo electrónico.)</span></p>
                  <div className="mt-4">
                    <Label htmlFor="email-consent">My Consented E-Mail Address is: <span className="text-muted-foreground">(Mi Dirección de Correo Electrónico Consentida es:)</span></Label>
                    <Input 
                      id="email-consent" 
                      type="email"
                      value={formData.emailConsent}
                      onChange={(e) => handleInputChange("emailConsent", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Release of Info Tab */}
            <TabsContent value="release">
              <div className="space-y-8 bg-background p-6 rounded-lg shadow-sm">
                <div>
                  <h2 className="text-xl font-semibold border-b pb-3">Authorization for Release of Health Information <span className="text-muted-foreground">(Autorización para Divulgar Información de Salud)</span></h2>
                  <p className="text-sm text-muted-foreground mt-4">I authorize SILVERMAN CHIROPRACTIC & REHABILITATION CENTER, INC., to release my health information to the person/organization listed below. <span className="text-muted-foreground/70">(Autorizo a SILVERMAN CHIROPRACTIC & REHABILITATION CENTER, INC., a divulgar mi información de salud a la persona/organización listada abajo.)</span></p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Person/Organization <span className="text-muted-foreground">(Persona/Organización)</span></Label>
                      <Input 
                        value={formData.releasePersonOrganization}
                        onChange={(e) => handleInputChange("releasePersonOrganization", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Address <span className="text-muted-foreground">(Dirección)</span></Label>
                      <Input 
                        value={formData.releaseAddress}
                        onChange={(e) => handleInputChange("releaseAddress", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone <span className="text-muted-foreground">(Teléfono)</span></Label>
                      <Input 
                        type="tel"
                        value={formData.releasePhone}
                        onChange={(e) => handleInputChange("releasePhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Reason for Disclosure</Label>
                      <Input 
                        value={formData.releaseReason}
                        onChange={(e) => handleInputChange("releaseReason", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold">Authorization for Release of Health Information from other Healthcare Facilities</h3>
                  <p className="text-sm text-muted-foreground mt-4">I authorize SILVERMAN CHIROPRACTIC & REHABILITATION CENTER, INC., to obtain my health information from the facility listed below.</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Name of Healthcare Facility</Label>
                      <Input 
                        value={formData.healthcareFacility}
                        onChange={(e) => handleInputChange("healthcareFacility", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input 
                        value={formData.healthcareFacilityAddress}
                        onChange={(e) => handleInputChange("healthcareFacilityAddress", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        type="tel"
                        value={formData.healthcareFacilityPhone}
                        onChange={(e) => handleInputChange("healthcareFacilityPhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dates of Treatment Requested</Label>
                      <Input 
                        value={formData.treatmentDates}
                        onChange={(e) => handleInputChange("treatmentDates", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Authorizations Tab */}
            <TabsContent value="auth">
              <div className="space-y-8 bg-background p-6 rounded-lg shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold">Radiology Warning Statement</h3>
                  <p className="text-sm text-muted-foreground mt-2">I authorize the performance of diagnostic x-ray examinations of myself, which the doctor(s) may consider necessary. For female patients: I certify to the best of my knowledge that I AM NOT PREGNANT and give permission to perform diagnostic x-ray examination.</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="Signature (Type Full Name)"
                      value={formData.radiologySignature}
                      onChange={(e) => handleInputChange("radiologySignature", e.target.value)}
                    />
                    <Input 
                      type="date"
                      value={formData.radiologyDate}
                      onChange={(e) => handleInputChange("radiologyDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold">Assignment of Benefits</h3>
                  <p className="text-sm text-muted-foreground mt-2">I assign the rights and benefits of my insurance to the Provider for services rendered. This includes all rights to collect benefits directly from the insurance company and to take legal action if they fail to make payment. I authorize the Provider to endorse any check made payable to myself and Provider.</p>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold">IME & EUO Notice and Financial Responsibility</h3>
                  <p className="text-sm text-muted-foreground mt-2">I understand my insurance company may schedule an Independent Medical Examination (IME) or Examination Under Oath (EUO), and it is my responsibility to attend. Failure to do so may make me responsible for unpaid medical bills. I agree to be financially responsible for all charges, including deductibles, co-payments, and any services rejected by my insurance.</p>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold">Disclosure and Acknowledgement</h3>
                  <p className="text-sm text-muted-foreground mt-2">I affirm that the services were actually rendered, I was not solicited, the services were explained to me, and I have the right to confirm the services. I understand I may be entitled to a portion of any reduction in amounts paid by my insurer if I notify them of a billing error.</p>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold">Consent to Medical Care & Final Signature</h3>
                  <p className="text-sm text-muted-foreground mt-2">I authorize Silverman Chiropractic and Rehabilitation Center to perform necessary tests and treatment. I acknowledge the risks and that the following forms have been explained to me: 1. Assignment of Benefits, 2. IME & EUO Notice, 3. Radiology Warning Statement, 4. Doctor's Lien, 5. Disclosure and Acknowledgement Form, 6. Consent to Medical Care.</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="Patient Signature (Type Full Name)"
                      value={formData.patientSignature}
                      onChange={(e) => handleInputChange("patientSignature", e.target.value)}
                    />
                    <Input 
                      type="date"
                      value={formData.finalDate}
                      onChange={(e) => handleInputChange("finalDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Submission */}
          <div className="mt-8 flex justify-end">
            <Button type="submit" className="px-6 py-3">
              Submit Form <span className="text-muted-foreground">(Enviar)</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicPIPForm;