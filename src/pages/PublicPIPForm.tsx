import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DocumentUpload } from "@/components/DocumentUpload";
import { PublicFormLayout } from "@/components/ui/public-form-layout";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGrid, FormField, DocumentUploadSection } from "@/components/ui/form-field-grid";

const PublicPIPForm = () => {
  const navigate = useNavigate();
  
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
    language: "en", // Default to English
    
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
  const isSectionCompleted = (section: string): boolean => {
    switch (section) {
      case "general":
        return !!(formData.lastName && formData.firstName && formData.email && formData.dob);
      case "accident":
        return !!(formData.accidentDate && formData.accidentDescription);
      case "insurance":
        return !!(formData.vehicleOwner && formData.vehicleDriver);
      case "medical":
        return !!(formData.allergies !== "" || formData.previousAccidents);
      case "symptoms":
        return !!formData.painLocation;
      case "review":
        return Object.values(formData.systemReview).some(value => value !== "");
      case "communications":
        return !!formData.emailConsent;
      case "release":
        return !!(formData.releasePersonOrganization || formData.healthcareFacility);
      case "auth":
        return !!formData.patientSignature;
      default:
        return false;
    }
  };


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

      // Show success message instead of redirecting
      toast.success("Your PIP form has been submitted successfully! We will contact you soon.");
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Check if it's a rate limit error
      if (error?.message?.includes('rate limit') || error?.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error("Too many form submissions. Please wait a few minutes before trying again due to rate limits.");
      } else {
        toast.error("Failed to submit form. Please try again.");
      }
    }
  };

  return (
    <PublicFormLayout
      title="Silverman Chiropractic & Rehabilitation Center"
      subtitle="PIP Intake Form / Formulario de Admisión PIP"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Information */}
        <FormSection
          title="General Information"
          subtitle="Información General"
          number={1}
          isCompleted={isSectionCompleted("general")}
          defaultOpen={true}
        >
            <FormFieldGrid>
              <FormField>
                <Label htmlFor="last-name">Last Name <span className="text-muted-foreground">(Apellido)</span></Label>
                <Input 
                  id="last-name" 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="first-name">First Name <span className="text-muted-foreground">(Nombre)</span></Label>
                <Input 
                  id="first-name" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </FormField>
              <FormField fullWidth>
                <Label htmlFor="address">Address <span className="text-muted-foreground">(Dirección)</span></Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="city">City <span className="text-muted-foreground">(Ciudad)</span></Label>
                <Input 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="state">State <span className="text-muted-foreground">(Estado)</span></Label>
                <Input 
                  id="state" 
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="zip">Zip Code <span className="text-muted-foreground">(Código Postal)</span></Label>
                <Input 
                  id="zip" 
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="home-phone">Home Phone <span className="text-muted-foreground">(Teléfono Casa)</span></Label>
                <Input 
                  id="home-phone" 
                  type="tel"
                  value={formData.homePhone}
                  onChange={(e) => handleInputChange("homePhone", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="work-phone">Work Phone <span className="text-muted-foreground">(Teléfono Trabajo)</span></Label>
                <Input 
                  id="work-phone" 
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange("workPhone", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="cell-phone">Cell Phone <span className="text-muted-foreground">(Teléfono Celular)</span></Label>
                <Input 
                  id="cell-phone" 
                  type="tel"
                  value={formData.cellPhone}
                  onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                />
              </FormField>
              <FormField fullWidth>
                <Label htmlFor="email">Email <span className="text-muted-foreground">(Correo Electrónico)</span></Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="license-number">License # <span className="text-muted-foreground">(Número de Lic #)</span></Label>
                <Input 
                  id="license-number" 
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="license-state">State <span className="text-muted-foreground">(Estado)</span></Label>
                <Input 
                  id="license-state" 
                  value={formData.licenseState}
                  onChange={(e) => handleInputChange("licenseState", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="dob">Date of Birth <span className="text-muted-foreground">(Fecha de Nacimiento)</span></Label>
                <Input 
                  id="dob" 
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="ssn">Social Security # <span className="text-muted-foreground">(Num. Seguro Social)</span></Label>
                <Input 
                  id="ssn" 
                  value={formData.ssn}
                  onChange={(e) => handleInputChange("ssn", e.target.value)}
                />
              </FormField>
              <FormField>
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
              </FormField>
              <FormField>
                <Label>Marital Status <span className="text-muted-foreground">(Estado Civil)</span></Label>
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
              </FormField>
              <FormField>
                <Label>Preferred Language <span className="text-muted-foreground">(Idioma Preferido)</span></Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => handleInputChange("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormFieldGrid>
            
            <DocumentUploadSection>
              <FormField>
                <DocumentUpload
                  documentType="drivers-license-front"
                  label="Driver's License Front"
                  spanishLabel="Frente de Licencia"
                />
              </FormField>
              <FormField>
                <DocumentUpload
                  documentType="drivers-license-back"
                  label="Driver's License Back"
                  spanishLabel="Reverso de Licencia"
                />
              </FormField>
              <FormField>
                <DocumentUpload
                  documentType="insurance-card-front"
                  label="Insurance Card Front"
                  spanishLabel="Frente de Tarjeta de Seguro"
                />
              </FormField>
              <FormField>
                <DocumentUpload
                  documentType="insurance-card-back"
                  label="Insurance Card Back"
                  spanishLabel="Reverso de Tarjeta de Seguro"
                />
              </FormField>
            </DocumentUploadSection>
        </FormSection>

        {/* Accident Information */}
        <FormSection
          title="Accident Information"
          subtitle="Información del Accidente"
          number={2}
          isCompleted={isSectionCompleted("accident")}
        >
            <FormFieldGrid>
              <FormField>
                <Label htmlFor="accident-date">Date of Accident <span className="text-muted-foreground">(Fecha del Accidente)</span></Label>
                <Input 
                  id="accident-date" 
                  type="date"
                  value={formData.accidentDate}
                  onChange={(e) => handleInputChange("accidentDate", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="accident-time">Time of Accident <span className="text-muted-foreground">(Hora del Accidente)</span></Label>
                <Input 
                  id="accident-time" 
                  type="time"
                  value={formData.accidentTime}
                  onChange={(e) => handleInputChange("accidentTime", e.target.value)}
                />
              </FormField>
              <FormField fullWidth>
                <Label htmlFor="accident-description">Describe the accident <span className="text-muted-foreground">(Describe el accidente)</span></Label>
                <Textarea 
                  id="accident-description" 
                  rows={4}
                  value={formData.accidentDescription}
                  onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="accident-location">Location of accident <span className="text-muted-foreground">(Ubicación del accidente)</span></Label>
                <Input 
                  id="accident-location" 
                  value={formData.accidentLocation}
                  onChange={(e) => handleInputChange("accidentLocation", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="accident-city">City <span className="text-muted-foreground">(Ciudad)</span></Label>
                <Input 
                  id="accident-city" 
                  value={formData.accidentCity}
                  onChange={(e) => handleInputChange("accidentCity", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label>Were you the driver or passenger? <span className="text-muted-foreground">(¿Era conductor o pasajero?)</span></Label>
                <Select onValueChange={(value) => handleInputChange("personRole", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver (Conductor)</SelectItem>
                    <SelectItem value="passenger">Passenger (Pasajero)</SelectItem>
                    <SelectItem value="pedestrian">Pedestrian (Peatón)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField>
                <Label>Was your vehicle moving? <span className="text-muted-foreground">(¿Su vehículo se movía?)</span></Label>
                <Select onValueChange={(value) => handleInputChange("vehicleMotion", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes (Sí)</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField>
                <Label>Did you go to the hospital? <span className="text-muted-foreground">(¿Fue al hospital?)</span></Label>
                <Select onValueChange={(value) => handleInputChange("wentToHospital", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes (Sí)</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              {formData.wentToHospital === "yes" && (
                <FormField>
                  <Label htmlFor="hospital-name">Hospital Name <span className="text-muted-foreground">(Nombre del Hospital)</span></Label>
                  <Input 
                    id="hospital-name" 
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                  />
                </FormField>
              )}
              <FormField>
                <Label>Loss of consciousness? <span className="text-muted-foreground">(¿Pérdida de conciencia?)</span></Label>
                <Select onValueChange={(value) => handleInputChange("lossOfConsciousness", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes (Sí)</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormFieldGrid>
        </FormSection>

        {/* Insurance Information */}
        <FormSection
          title="Insurance Information"
          subtitle="Información del Seguro"
          number={3}
          isCompleted={isSectionCompleted("insurance")}
        >
            <FormFieldGrid>
              <FormField>
                <Label htmlFor="vehicle-owner">Who owns the vehicle? <span className="text-muted-foreground">(¿Quién es dueño del vehículo?)</span></Label>
                <Input 
                  id="vehicle-owner" 
                  value={formData.vehicleOwner}
                  onChange={(e) => handleInputChange("vehicleOwner", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="relationship-owner">Relationship to owner <span className="text-muted-foreground">(Relación con el dueño)</span></Label>
                <Input 
                  id="relationship-owner" 
                  value={formData.relationshipToOwner}
                  onChange={(e) => handleInputChange("relationshipToOwner", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="vehicle-driver">Who was driving? <span className="text-muted-foreground">(¿Quién manejaba?)</span></Label>
                <Input 
                  id="vehicle-driver" 
                  value={formData.vehicleDriver}
                  onChange={(e) => handleInputChange("vehicleDriver", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="relationship-driver">Relationship to driver <span className="text-muted-foreground">(Relación con el conductor)</span></Label>
                <Input 
                  id="relationship-driver" 
                  value={formData.relationshipToDriver}
                  onChange={(e) => handleInputChange("relationshipToDriver", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="household-members">Household members <span className="text-muted-foreground">(Miembros del hogar)</span></Label>
                <Input 
                  id="household-members" 
                  value={formData.householdMembers}
                  onChange={(e) => handleInputChange("householdMembers", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="owned-vehicles">Number of vehicles owned <span className="text-muted-foreground">(Número de vehículos propios)</span></Label>
                <Input 
                  id="owned-vehicles" 
                  type="number"
                  value={formData.ownedVehicles}
                  onChange={(e) => handleInputChange("ownedVehicles", e.target.value)}
                />
              </FormField>
            </FormFieldGrid>
        </FormSection>

        {/* Medical History */}
        <FormSection
          title="Medical History"
          subtitle="Historial Médico"
          number={4}
          isCompleted={isSectionCompleted("medical")}
        >
            <FormFieldGrid>
              <FormField fullWidth>
                <Label htmlFor="previous-accidents">Previous accidents or injuries <span className="text-muted-foreground">(Accidentes o lesiones previas)</span></Label>
                <Textarea 
                  id="previous-accidents" 
                  rows={3}
                  value={formData.previousAccidents}
                  onChange={(e) => handleInputChange("previousAccidents", e.target.value)}
                />
              </FormField>
              <FormField fullWidth>
                <Label htmlFor="allergies">Allergies <span className="text-muted-foreground">(Alergias)</span></Label>
                <Textarea 
                  id="allergies" 
                  rows={3}
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label>Do you drink alcohol? <span className="text-muted-foreground">(¿Toma alcohol?)</span></Label>
                <Select onValueChange={(value) => handleInputChange("drinksAlcohol", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never (Nunca)</SelectItem>
                    <SelectItem value="occasionally">Occasionally (Ocasionalmente)</SelectItem>
                    <SelectItem value="regularly">Regularly (Regularmente)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField>
                <Label>Do you smoke? <span className="text-muted-foreground">(¿Fuma?)</span></Label>
                <Select onValueChange={(value) => handleInputChange("smokes", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never (Nunca)</SelectItem>
                    <SelectItem value="current">Current (Actualmente)</SelectItem>
                    <SelectItem value="former">Former (Antes)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormFieldGrid>

            <div className="mt-6">
              <h4 className="font-semibold mb-4">Family History <span className="text-muted-foreground">(Historial Familiar)</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="heart-trouble"
                      checked={formData.familyHistory.heartTrouble}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "heartTrouble", checked)}
                    />
                    <Label htmlFor="heart-trouble" className="text-sm">Heart trouble</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stroke"
                      checked={formData.familyHistory.stroke}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "stroke", checked)}
                    />
                    <Label htmlFor="stroke" className="text-sm">Stroke</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="diabetes"
                      checked={formData.familyHistory.diabetes}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "diabetes", checked)}
                    />
                    <Label htmlFor="diabetes" className="text-sm">Diabetes</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cancer"
                      checked={formData.familyHistory.cancer}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "cancer", checked)}
                    />
                    <Label htmlFor="cancer" className="text-sm">Cancer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="arthritis"
                      checked={formData.familyHistory.arthritis}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "arthritis", checked)}
                    />
                    <Label htmlFor="arthritis" className="text-sm">Arthritis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="high-blood-pressure"
                      checked={formData.familyHistory.highBloodPressure}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "highBloodPressure", checked)}
                    />
                    <Label htmlFor="high-blood-pressure" className="text-sm">High blood pressure</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="migraines"
                      checked={formData.familyHistory.migraines}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "migraines", checked)}
                    />
                    <Label htmlFor="migraines" className="text-sm">Migraines</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spine-problems"
                      checked={formData.familyHistory.spineProblems}
                      onCheckedChange={(checked) => handleNestedChange("familyHistory", "spineProblems", checked)}
                    />
                    <Label htmlFor="spine-problems" className="text-sm">Spine problems</Label>
                  </div>
                </div>
              </div>
            </div>
        </FormSection>

        {/* Current Symptoms */}
        <FormSection
          title="Current Symptoms"
          subtitle="Síntomas Actuales"
          number={5}
          isCompleted={isSectionCompleted("symptoms")}
        >
            <FormFieldGrid>
              <FormField fullWidth>
                <Label htmlFor="pain-location">Where is your pain located? <span className="text-muted-foreground">(¿Dónde está ubicado su dolor?)</span></Label>
                <Textarea 
                  id="pain-location" 
                  rows={3}
                  value={formData.painLocation}
                  onChange={(e) => handleInputChange("painLocation", e.target.value)}
                />
              </FormField>
            </FormFieldGrid>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Head/Neck <span className="text-muted-foreground">(Cabeza/Cuello)</span></h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="headache-symptom"
                      checked={formData.currentSymptoms.headache}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "headache", checked)}
                    />
                    <Label htmlFor="headache-symptom" className="text-sm">Headache</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="neck-pain-symptom"
                      checked={formData.currentSymptoms.neckPain}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "neckPain", checked)}
                    />
                    <Label htmlFor="neck-pain-symptom" className="text-sm">Neck pain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="neck-stiff"
                      checked={formData.currentSymptoms.neckStiff}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "neckStiff", checked)}
                    />
                    <Label htmlFor="neck-stiff" className="text-sm">Neck stiffness</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Back <span className="text-muted-foreground">(Espalda)</span></h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="upper-back-pain"
                      checked={formData.currentSymptoms.upperBackPain}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "upperBackPain", checked)}
                    />
                    <Label htmlFor="upper-back-pain" className="text-sm">Upper back pain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mid-back-pain"
                      checked={formData.currentSymptoms.midBackPain}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "midBackPain", checked)}
                    />
                    <Label htmlFor="mid-back-pain" className="text-sm">Mid back pain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lower-back-pain-symptom"
                      checked={formData.currentSymptoms.lowerBackPain}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "lowerBackPain", checked)}
                    />
                    <Label htmlFor="lower-back-pain-symptom" className="text-sm">Lower back pain</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Extremities <span className="text-muted-foreground">(Extremidades)</span></h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pain-arms-hands"
                      checked={formData.currentSymptoms.painArmsHands}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "painArmsHands", checked)}
                    />
                    <Label htmlFor="pain-arms-hands" className="text-sm">Pain in arms/hands</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pain-legs-feet"
                      checked={formData.currentSymptoms.painLegsFeet}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "painLegsFeet", checked)}
                    />
                    <Label htmlFor="pain-legs-feet" className="text-sm">Pain in legs/feet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbness-arms-hands-symptom"
                      checked={formData.currentSymptoms.numbnessArmsHands}
                      onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "numbnessArmsHands", checked)}
                    />
                    <Label htmlFor="numbness-arms-hands-symptom" className="text-sm">Numbness in arms/hands</Label>
                  </div>
                </div>
              </div>
            </div>
        </FormSection>

        {/* System Review */}
        <FormSection
          title="Review of Systems"
          subtitle="Revisión de Sistemas"
          number={6}
          isCompleted={isSectionCompleted("review")}
        >
            <p className="text-sm text-muted-foreground mb-6">
              Please indicate if you have experienced any of the following symptoms:
              <br />
              <span className="italic">Por favor indique si ha experimentado alguno de los siguientes síntomas:</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">General</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Fever <span className="text-muted-foreground">(Fiebre)</span></Label>
                    <RadioGroup 
                      value={formData.systemReview.fever} 
                      onValueChange={(value) => handleNestedChange("systemReview", "fever", value)}
                      className="flex gap-6 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="fever-yes" />
                        <Label htmlFor="fever-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="fever-no" />
                        <Label htmlFor="fever-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm">Chills <span className="text-muted-foreground">(Escalofríos)</span></Label>
                    <RadioGroup 
                      value={formData.systemReview.chills} 
                      onValueChange={(value) => handleNestedChange("systemReview", "chills", value)}
                      className="flex gap-6 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="chills-yes" />
                        <Label htmlFor="chills-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="chills-no" />
                        <Label htmlFor="chills-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm">Fatigue <span className="text-muted-foreground">(Fatiga)</span></Label>
                    <RadioGroup 
                      value={formData.systemReview.fatigue} 
                      onValueChange={(value) => handleNestedChange("systemReview", "fatigue", value)}
                      className="flex gap-6 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="fatigue-yes" />
                        <Label htmlFor="fatigue-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="fatigue-no" />
                        <Label htmlFor="fatigue-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Neurological <span className="text-muted-foreground">(Neurológico)</span></h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Memory loss <span className="text-muted-foreground">(Pérdida de memoria)</span></Label>
                    <RadioGroup 
                      value={formData.systemReview.memoryLoss} 
                      onValueChange={(value) => handleNestedChange("systemReview", "memoryLoss", value)}
                      className="flex gap-6 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="memory-yes" />
                        <Label htmlFor="memory-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="memory-no" />
                        <Label htmlFor="memory-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm">Dizziness <span className="text-muted-foreground">(Mareo)</span></Label>
                    <RadioGroup 
                      value={formData.systemReview.dizziness} 
                      onValueChange={(value) => handleNestedChange("systemReview", "dizziness", value)}
                      className="flex gap-6 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="dizziness-yes" />
                        <Label htmlFor="dizziness-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="dizziness-no" />
                        <Label htmlFor="dizziness-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm">Weakness <span className="text-muted-foreground">(Debilidad)</span></Label>
                    <RadioGroup 
                      value={formData.systemReview.weakness} 
                      onValueChange={(value) => handleNestedChange("systemReview", "weakness", value)}
                      className="flex gap-6 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="weakness-yes" />
                        <Label htmlFor="weakness-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="weakness-no" />
                        <Label htmlFor="weakness-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
        </FormSection>

        {/* Communications */}
        <FormSection
          title="Communications"
          subtitle="Comunicaciones"
          number={7}
          isCompleted={isSectionCompleted("communications")}
        >
            <FormFieldGrid>
              <FormField fullWidth>
                <Label htmlFor="alternative-communication">Alternative Communication Method <span className="text-muted-foreground">(Método de Comunicación Alternativo)</span></Label>
                <Input 
                  id="alternative-communication" 
                  value={formData.alternativeCommunication}
                  onChange={(e) => handleInputChange("alternativeCommunication", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label>Email Consent <span className="text-muted-foreground">(Consentimiento de Email)</span></Label>
                <Select onValueChange={(value) => handleInputChange("emailConsent", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes (Sí)</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormFieldGrid>
        </FormSection>

        {/* Release Information */}
        <FormSection
          title="Release of Information"
          subtitle="Liberación de Información"
          number={8}
          isCompleted={isSectionCompleted("release")}
        >
            <FormFieldGrid>
              <FormField>
                <Label htmlFor="release-person">Person/Organization <span className="text-muted-foreground">(Persona/Organización)</span></Label>
                <Input 
                  id="release-person" 
                  value={formData.releasePersonOrganization}
                  onChange={(e) => handleInputChange("releasePersonOrganization", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="release-address">Address <span className="text-muted-foreground">(Dirección)</span></Label>
                <Input 
                  id="release-address" 
                  value={formData.releaseAddress}
                  onChange={(e) => handleInputChange("releaseAddress", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="release-phone">Phone <span className="text-muted-foreground">(Teléfono)</span></Label>
                <Input 
                  id="release-phone" 
                  type="tel"
                  value={formData.releasePhone}
                  onChange={(e) => handleInputChange("releasePhone", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="release-reason">Reason for Release <span className="text-muted-foreground">(Razón para la Liberación)</span></Label>
                <Input 
                  id="release-reason" 
                  value={formData.releaseReason}
                  onChange={(e) => handleInputChange("releaseReason", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="healthcare-facility">Healthcare Facility <span className="text-muted-foreground">(Instalación de Salud)</span></Label>
                <Input 
                  id="healthcare-facility" 
                  value={formData.healthcareFacility}
                  onChange={(e) => handleInputChange("healthcareFacility", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="treatment-dates">Treatment Dates <span className="text-muted-foreground">(Fechas de Tratamiento)</span></Label>
                <Input 
                  id="treatment-dates" 
                  value={formData.treatmentDates}
                  onChange={(e) => handleInputChange("treatmentDates", e.target.value)}
                />
              </FormField>
            </FormFieldGrid>
        </FormSection>

        {/* Authorizations */}
        <FormSection
          title="Authorizations"
          subtitle="Autorizaciones"
          number={9}
          isCompleted={isSectionCompleted("auth")}
        >
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Patient Authorization <span className="font-medium">(Autorización del Paciente)</span></h3>
                <div className="bg-muted/30 border-l-4 border-primary p-4 text-xs max-h-36 overflow-y-auto rounded-r-lg">
                  <p>
                    I authorize Silverman Chiropractic & Rehabilitation Center to provide treatment as deemed necessary... I understand that I am financially responsible for all charges...
                  </p>
                  <p className="mt-2 italic">
                    Autorizo al Silverman Chiropractic & Rehabilitation Center a proporcionar el tratamiento que considere necesario... Entiendo que soy financieramente responsable de todos los cargos...
                  </p>
                </div>
              </div>
            </div>
            
            <FormFieldGrid className="mt-6">
              <FormField>
                <Label htmlFor="patient-signature">Patient Signature <span className="text-muted-foreground">(Firma del Paciente)</span></Label>
                <Input 
                  id="patient-signature" 
                  value={formData.patientSignature}
                  onChange={(e) => handleInputChange("patientSignature", e.target.value)}
                  placeholder="Type your full name to sign"
                />
              </FormField>
              <FormField>
                <Label htmlFor="final-date">Date <span className="text-muted-foreground">(Fecha)</span></Label>
                <Input 
                  id="final-date" 
                  type="date"
                  value={formData.finalDate}
                  onChange={(e) => handleInputChange("finalDate", e.target.value)}
                />
              </FormField>
            </FormFieldGrid>
        </FormSection>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            type="submit"
            size="lg"
            className="px-8"
          >
            Submit Form / Enviar Formulario
          </Button>
        </div>
      </form>
    </PublicFormLayout>
  );
};

export default PublicPIPForm;