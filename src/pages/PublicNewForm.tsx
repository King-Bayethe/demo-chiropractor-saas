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

const PublicNewForm = () => {
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
    
    // Honeypot field for spam protection
    website: "",
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
    
    // Check honeypot field
    if (formData.website) {
      console.log('Spam submission detected');
      return;
    }
    
    if (!formData.patientSignature) {
      toast.error("Please provide your signature");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'new',
          formData: formData
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Your form has been submitted successfully! We will contact you soon.");
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
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
      subtitle="New Patient Intake Form / Formulario de Nuevo Paciente"
    >
      <form onSubmit={handleSubmit}>
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={(e) => handleInputChange("website", e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Section 1: General Information */}
        <FormSection
          title="General Information"
          subtitle="Información General"
          number={1}
          defaultOpen={true}
          isCompleted={isSectionCompleted("general")}
          className="mb-6"
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
              <Label htmlFor="emergency-contact">Emergency Contact <span className="text-muted-foreground">(Contacto de Emergencia)</span></Label>
              <Input 
                id="emergency-contact" 
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label htmlFor="emergency-phone">Emergency Phone <span className="text-muted-foreground">(Teléfono de Emergencia)</span></Label>
              <Input 
                id="emergency-phone" 
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label htmlFor="employment">Employment <span className="text-muted-foreground">(Empleo)</span></Label>
              <Input 
                id="employment" 
                value={formData.employment}
                onChange={(e) => handleInputChange("employment", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label>Student <span className="text-muted-foreground">(Estudiante)</span></Label>
              <Select onValueChange={(value) => handleInputChange("student", value)}>
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

        {/* Section 2: Accident Information */}
        <FormSection
          title="Accident Information"
          subtitle="Información del Accidente"
          number={2}
          isCompleted={isSectionCompleted("accident")}
          className="mb-6"
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
              <Label htmlFor="accident-location">Location of Accident <span className="text-muted-foreground">(Ubicación del Accidente)</span></Label>
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
            <FormField fullWidth>
              <Label htmlFor="accident-description">Describe how the accident happened <span className="text-muted-foreground">(Describe cómo ocurrió el accidente)</span></Label>
              <Textarea 
                id="accident-description" 
                value={formData.accidentDescription}
                onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                rows={4}
              />
            </FormField>
            <FormField>
              <Label>Were you the driver or passenger? <span className="text-muted-foreground">(¿Eras conductor o pasajero?)</span></Label>
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
              <Label>Was your vehicle in motion? <span className="text-muted-foreground">(¿Estaba su vehículo en movimiento?)</span></Label>
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
              <Label>Position of head at impact <span className="text-muted-foreground">(Posición de la cabeza al impacto)</span></Label>
              <Select onValueChange={(value) => handleInputChange("headPosition", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight">Straight ahead (Hacia adelante)</SelectItem>
                  <SelectItem value="left">Looking left (Mirando izquierda)</SelectItem>
                  <SelectItem value="right">Looking right (Mirando derecha)</SelectItem>
                  <SelectItem value="down">Looking down (Mirando abajo)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Label>Were you thrown in any direction? <span className="text-muted-foreground">(¿Fue lanzado en alguna dirección?)</span></Label>
              <Select onValueChange={(value) => handleInputChange("thrownDirection", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="forward">Forward (Hacia adelante)</SelectItem>
                  <SelectItem value="backward">Backward (Hacia atrás)</SelectItem>
                  <SelectItem value="left">Left (Izquierda)</SelectItem>
                  <SelectItem value="right">Right (Derecha)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Label>Did you see the impact coming? <span className="text-muted-foreground">(¿Vio venir el impacto?)</span></Label>
              <RadioGroup 
                value={formData.sawImpact} 
                onValueChange={(value) => handleInputChange("sawImpact", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="saw-yes" />
                  <Label htmlFor="saw-yes">Yes (Sí)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="saw-no" />
                  <Label htmlFor="saw-no">No</Label>
                </div>
              </RadioGroup>
            </FormField>
            <FormField>
              <Label>Did you brace for impact? <span className="text-muted-foreground">(¿Se preparó para el impacto?)</span></Label>
              <RadioGroup 
                value={formData.braceForImpact} 
                onValueChange={(value) => handleInputChange("braceForImpact", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="brace-yes" />
                  <Label htmlFor="brace-yes">Yes (Sí)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="brace-no" />
                  <Label htmlFor="brace-no">No</Label>
                </div>
              </RadioGroup>
            </FormField>
            <FormField>
              <Label>Did you hit any part of the car? <span className="text-muted-foreground">(¿Golpeó alguna parte del auto?)</span></Label>
              <RadioGroup 
                value={formData.hitCar} 
                onValueChange={(value) => handleInputChange("hitCar", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="hit-yes" />
                  <Label htmlFor="hit-yes">Yes (Sí)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="hit-no" />
                  <Label htmlFor="hit-no">No</Label>
                </div>
              </RadioGroup>
            </FormField>
            {formData.hitCar === "yes" && (
              <FormField fullWidth>
                <Label htmlFor="hit-car-details">What part of the car did you hit? <span className="text-muted-foreground">(¿Qué parte del auto golpeó?)</span></Label>
                <Input 
                  id="hit-car-details" 
                  value={formData.hitCarDetails}
                  onChange={(e) => handleInputChange("hitCarDetails", e.target.value)}
                />
              </FormField>
            )}
            <FormField>
              <Label>Did you go to the hospital? <span className="text-muted-foreground">(¿Fue al hospital?)</span></Label>
              <RadioGroup 
                value={formData.wentToHospital} 
                onValueChange={(value) => handleInputChange("wentToHospital", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="hospital-yes" />
                  <Label htmlFor="hospital-yes">Yes (Sí)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="hospital-no" />
                  <Label htmlFor="hospital-no">No</Label>
                </div>
              </RadioGroup>
            </FormField>
            {formData.wentToHospital === "yes" && (
              <FormField fullWidth>
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
              <RadioGroup 
                value={formData.lossOfConsciousness} 
                onValueChange={(value) => handleInputChange("lossOfConsciousness", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="consciousness-yes" />
                  <Label htmlFor="consciousness-yes">Yes (Sí)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="consciousness-no" />
                  <Label htmlFor="consciousness-no">No</Label>
                </div>
              </RadioGroup>
            </FormField>
            {formData.lossOfConsciousness === "yes" && (
              <FormField>
                <Label htmlFor="consciousness-length">How long? <span className="text-muted-foreground">(¿Por cuánto tiempo?)</span></Label>
                <Input 
                  id="consciousness-length" 
                  value={formData.consciousnessLength}
                  onChange={(e) => handleInputChange("consciousnessLength", e.target.value)}
                />
              </FormField>
            )}
          </FormFieldGrid>
        </FormSection>

        {/* Section 3: Insurance Information */}
        <FormSection
          title="Insurance Information"
          subtitle="Información del Seguro"
          number={3}
          isCompleted={isSectionCompleted("insurance")}
          className="mb-6"
        >
          <FormFieldGrid>
            <FormField>
              <Label htmlFor="vehicle-owner">Who owns the vehicle you were in? <span className="text-muted-foreground">(¿Quién es dueño del vehículo?)</span></Label>
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
              <Label htmlFor="vehicle-driver">Who was driving? <span className="text-muted-foreground">(¿Quién conducía?)</span></Label>
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
            <FormField fullWidth>
              <Label htmlFor="household-members">List all members of your household <span className="text-muted-foreground">(Lista de miembros del hogar)</span></Label>
              <Textarea 
                id="household-members" 
                value={formData.householdMembers}
                onChange={(e) => handleInputChange("householdMembers", e.target.value)}
                rows={3}
              />
            </FormField>
            <FormField fullWidth>
              <Label htmlFor="owned-vehicles">List all vehicles owned by household members <span className="text-muted-foreground">(Lista de vehículos del hogar)</span></Label>
              <Textarea 
                id="owned-vehicles" 
                value={formData.ownedVehicles}
                onChange={(e) => handleInputChange("ownedVehicles", e.target.value)}
                rows={3}
              />
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Section 4: Medical History */}
        <FormSection
          title="Medical History"
          subtitle="Historial Médico"
          number={4}
          isCompleted={isSectionCompleted("medical")}
          className="mb-6"
        >
          <FormFieldGrid>
            <FormField fullWidth>
              <Label htmlFor="previous-accidents">Previous accidents/injuries <span className="text-muted-foreground">(Accidentes/lesiones previas)</span></Label>
              <Textarea 
                id="previous-accidents" 
                value={formData.previousAccidents}
                onChange={(e) => handleInputChange("previousAccidents", e.target.value)}
                rows={3}
              />
            </FormField>
            <FormField fullWidth>
              <Label htmlFor="allergies">Allergies (medications, foods, environmental) <span className="text-muted-foreground">(Alergias)</span></Label>
              <Textarea 
                id="allergies" 
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                rows={3}
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
                  <SelectItem value="rarely">Rarely (Raramente)</SelectItem>
                  <SelectItem value="occasionally">Occasionally (Ocasionalmente)</SelectItem>
                  <SelectItem value="frequently">Frequently (Frecuentemente)</SelectItem>
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
                  <SelectItem value="former">Former smoker (Ex-fumador)</SelectItem>
                  <SelectItem value="current">Current smoker (Fumador actual)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormFieldGrid>

          <div className="mt-6">
            <Label className="text-base font-semibold">Family History <span className="text-muted-foreground">(Historial Familiar)</span></Label>
            <p className="text-sm text-muted-foreground mb-4">Check all that apply in your family history</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'heartTrouble', label: 'Heart Trouble', spanish: 'Problemas Cardíacos' },
                { key: 'stroke', label: 'Stroke', spanish: 'Derrame Cerebral' },
                { key: 'diabetes', label: 'Diabetes', spanish: 'Diabetes' },
                { key: 'cancer', label: 'Cancer', spanish: 'Cáncer' },
                { key: 'arthritis', label: 'Arthritis', spanish: 'Artritis' },
                { key: 'highBloodPressure', label: 'High Blood Pressure', spanish: 'Presión Alta' },
                { key: 'kidneyDisease', label: 'Kidney Disease', spanish: 'Enfermedad Renal' },
                { key: 'mentalIllness', label: 'Mental Illness', spanish: 'Enfermedad Mental' },
                { key: 'asthma', label: 'Asthma', spanish: 'Asma' },
                { key: 'epilepsy', label: 'Epilepsy', spanish: 'Epilepsia' },
                { key: 'kyphosis', label: 'Kyphosis', spanish: 'Cifosis' },
                { key: 'lungDisease', label: 'Lung Disease', spanish: 'Enfermedad Pulmonar' },
                { key: 'osteoporosis', label: 'Osteoporosis', spanish: 'Osteoporosis' },
                { key: 'migraines', label: 'Migraines', spanish: 'Migrañas' },
                { key: 'scoliosis', label: 'Scoliosis', spanish: 'Escoliosis' },
                { key: 'spineProblems', label: 'Spine Problems', spanish: 'Problemas de Columna' },
                { key: 'other', label: 'Other', spanish: 'Otros' },
              ].map((condition) => (
                <div key={condition.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`family-${condition.key}`}
                    checked={formData.familyHistory[condition.key]}
                    onCheckedChange={(checked) => 
                      handleNestedChange("familyHistory", condition.key, checked)
                    }
                  />
                  <Label htmlFor={`family-${condition.key}`} className="text-sm">
                    {condition.label} <span className="text-muted-foreground">({condition.spanish})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </FormSection>

        {/* Section 5: Current Symptoms */}
        <FormSection
          title="Current Symptoms"
          subtitle="Síntomas Actuales"
          number={5}
          isCompleted={isSectionCompleted("symptoms")}
          className="mb-6"
        >
          <FormFieldGrid>
            <FormField fullWidth>
              <Label htmlFor="pain-location">Describe location of pain/discomfort <span className="text-muted-foreground">(Describe ubicación del dolor)</span></Label>
              <Textarea 
                id="pain-location" 
                value={formData.painLocation}
                onChange={(e) => handleInputChange("painLocation", e.target.value)}
                rows={3}
              />
            </FormField>
          </FormFieldGrid>

          <div className="mt-6">
            <Label className="text-base font-semibold">Pain Description <span className="text-muted-foreground">(Descripción del Dolor)</span></Label>
            <p className="text-sm text-muted-foreground mb-4">Check all that describe your pain</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'sharp', label: 'Sharp', spanish: 'Agudo' },
                { key: 'dull', label: 'Dull', spanish: 'Sordo' },
                { key: 'achy', label: 'Achy', spanish: 'Adolorido' },
                { key: 'burning', label: 'Burning', spanish: 'Ardor' },
                { key: 'shooting', label: 'Shooting', spanish: 'Punzante' },
                { key: 'stabbing', label: 'Stabbing', spanish: 'Apuñalamiento' },
                { key: 'deep', label: 'Deep', spanish: 'Profundo' },
                { key: 'spasm', label: 'Spasm', spanish: 'Espasmo' },
              ].map((pain) => (
                <div key={pain.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pain-${pain.key}`}
                    checked={formData.painDescription[pain.key]}
                    onCheckedChange={(checked) => 
                      handleNestedChange("painDescription", pain.key, checked)
                    }
                  />
                  <Label htmlFor={`pain-${pain.key}`} className="text-sm">
                    {pain.label} <span className="text-muted-foreground">({pain.spanish})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Label className="text-base font-semibold">Current Symptoms <span className="text-muted-foreground">(Síntomas Actuales)</span></Label>
            <p className="text-sm text-muted-foreground mb-4">Check all symptoms you are currently experiencing</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'headache', label: 'Headache', spanish: 'Dolor de Cabeza' },
                { key: 'neckPain', label: 'Neck Pain', spanish: 'Dolor de Cuello' },
                { key: 'neckStiff', label: 'Neck Stiffness', spanish: 'Rigidez de Cuello' },
                { key: 'upperBackPain', label: 'Upper Back Pain', spanish: 'Dolor Espalda Alta' },
                { key: 'midBackPain', label: 'Mid Back Pain', spanish: 'Dolor Espalda Media' },
                { key: 'lowerBackPain', label: 'Lower Back Pain', spanish: 'Dolor Espalda Baja' },
                { key: 'painArmsHands', label: 'Pain in Arms/Hands', spanish: 'Dolor Brazos/Manos' },
                { key: 'painLegsFeet', label: 'Pain in Legs/Feet', spanish: 'Dolor Piernas/Pies' },
                { key: 'lossStrengthArms', label: 'Loss of Strength in Arms', spanish: 'Pérdida Fuerza Brazos' },
                { key: 'lossStrengthLegs', label: 'Loss of Strength in Legs', spanish: 'Pérdida Fuerza Piernas' },
                { key: 'numbnessArmsHands', label: 'Numbness in Arms/Hands', spanish: 'Entumecimiento Brazos/Manos' },
                { key: 'numbnessLegsFeet', label: 'Numbness in Legs/Feet', spanish: 'Entumecimiento Piernas/Pies' },
                { key: 'tinglingArmsHands', label: 'Tingling in Arms/Hands', spanish: 'Hormigueo Brazos/Manos' },
                { key: 'tinglingLegsFeet', label: 'Tingling in Legs/Feet', spanish: 'Hormigueo Piernas/Pies' },
                { key: 'dizziness', label: 'Dizziness', spanish: 'Mareos' },
                { key: 'fatigue', label: 'Fatigue', spanish: 'Fatiga' },
                { key: 'irritability', label: 'Irritability', spanish: 'Irritabilidad' },
              ].map((symptom) => (
                <div key={symptom.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`symptom-${symptom.key}`}
                    checked={formData.currentSymptoms[symptom.key]}
                    onCheckedChange={(checked) => 
                      handleNestedChange("currentSymptoms", symptom.key, checked)
                    }
                  />
                  <Label htmlFor={`symptom-${symptom.key}`} className="text-sm">
                    {symptom.label} <span className="text-muted-foreground">({symptom.spanish})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </FormSection>

        {/* Section 6: Review of Systems */}
        <FormSection
          title="Review of Systems"
          subtitle="Revisión de Sistemas"
          number={6}
          isCompleted={isSectionCompleted("review")}
          className="mb-6"
        >
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Please indicate if you have experienced any of the following symptoms:
            </p>
            
            {[
              { key: 'fever', label: 'Fever', spanish: 'Fiebre' },
              { key: 'chills', label: 'Chills', spanish: 'Escalofríos' },
              { key: 'fatigue', label: 'Fatigue', spanish: 'Fatiga' },
              { key: 'blurredVision', label: 'Blurred Vision', spanish: 'Visión Borrosa' },
              { key: 'doubleVision', label: 'Double Vision', spanish: 'Visión Doble' },
              { key: 'eyePain', label: 'Eye Pain', spanish: 'Dolor de Ojos' },
              { key: 'ringingEars', label: 'Ringing in Ears', spanish: 'Zumbido en Oídos' },
              { key: 'decreasedHearing', label: 'Decreased Hearing', spanish: 'Disminución Auditiva' },
              { key: 'difficultySwallowing', label: 'Difficulty Swallowing', spanish: 'Dificultad para Tragar' },
              { key: 'chestPains', label: 'Chest Pains', spanish: 'Dolor de Pecho' },
              { key: 'palpitations', label: 'Palpitations', spanish: 'Palpitaciones' },
              { key: 'swollenAnkles', label: 'Swollen Ankles', spanish: 'Tobillos Hinchados' },
              { key: 'chronicCough', label: 'Chronic Cough', spanish: 'Tos Crónica' },
              { key: 'difficultyBreathing', label: 'Difficulty Breathing', spanish: 'Dificultad para Respirar' },
              { key: 'nausea', label: 'Nausea', spanish: 'Náuseas' },
              { key: 'vomiting', label: 'Vomiting', spanish: 'Vómito' },
              { key: 'abdominalPain', label: 'Abdominal Pain', spanish: 'Dolor Abdominal' },
              { key: 'backPain', label: 'Back Pain', spanish: 'Dolor de Espalda' },
              { key: 'neckPain', label: 'Neck Pain', spanish: 'Dolor de Cuello' },
              { key: 'shoulderPain', label: 'Shoulder Pain', spanish: 'Dolor de Hombro' },
              { key: 'weakness', label: 'Weakness', spanish: 'Debilidad' },
              { key: 'dizziness', label: 'Dizziness', spanish: 'Mareos' },
              { key: 'numbness', label: 'Numbness', spanish: 'Entumecimiento' },
              { key: 'depression', label: 'Depression', spanish: 'Depresión' },
              { key: 'anxiety', label: 'Anxiety', spanish: 'Ansiedad' },
              { key: 'memoryLoss', label: 'Memory Loss', spanish: 'Pérdida de Memoria' },
            ].map((system) => (
              <div key={system.key} className="flex items-center justify-between py-2 border-b border-border/50">
                <Label className="text-sm">
                  {system.label} <span className="text-muted-foreground">({system.spanish})</span>
                </Label>
                <RadioGroup
                  value={formData.systemReview[system.key]}
                  onValueChange={(value) => handleNestedChange("systemReview", system.key, value)}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${system.key}-yes`} />
                    <Label htmlFor={`${system.key}-yes`} className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${system.key}-no`} />
                    <Label htmlFor={`${system.key}-no`} className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </FormSection>

        {/* Section 7: Communications */}
        <FormSection
          title="Communications"
          subtitle="Comunicaciones"
          number={7}
          isCompleted={isSectionCompleted("communications")}
          className="mb-6"
        >
          <FormFieldGrid>
            <FormField fullWidth>
              <Label htmlFor="alternative-communication">
                Alternative method of communication <span className="text-muted-foreground">(Método alternativo de comunicación)</span>
              </Label>
              <Input 
                id="alternative-communication" 
                value={formData.alternativeCommunication}
                onChange={(e) => handleInputChange("alternativeCommunication", e.target.value)}
                placeholder="Text, call, email preference / Preferencia de texto, llamada, email"
              />
            </FormField>
            <FormField>
              <Label>Email consent for communications <span className="text-muted-foreground">(Consentimiento para comunicación por email)</span></Label>
              <RadioGroup 
                value={formData.emailConsent} 
                onValueChange={(value) => handleInputChange("emailConsent", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="email-yes" />
                  <Label htmlFor="email-yes">Yes, I consent (Sí, consiento)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="email-no" />
                  <Label htmlFor="email-no">No, I do not consent (No, no consiento)</Label>
                </div>
              </RadioGroup>
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Section 8: Release of Information */}
        <FormSection
          title="Release of Information"
          subtitle="Liberación de Información"
          number={8}
          isCompleted={isSectionCompleted("release")}
          className="mb-6"
        >
          <FormFieldGrid>
            <FormField>
              <Label htmlFor="release-person">Person/Organization to release info to <span className="text-muted-foreground">(Persona/Organización)</span></Label>
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
              <Label htmlFor="release-reason">Reason for release <span className="text-muted-foreground">(Razón para liberación)</span></Label>
              <Input 
                id="release-reason" 
                value={formData.releaseReason}
                onChange={(e) => handleInputChange("releaseReason", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label htmlFor="healthcare-facility">Healthcare facility <span className="text-muted-foreground">(Centro médico)</span></Label>
              <Input 
                id="healthcare-facility" 
                value={formData.healthcareFacility}
                onChange={(e) => handleInputChange("healthcareFacility", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label htmlFor="healthcare-address">Facility Address <span className="text-muted-foreground">(Dirección del centro)</span></Label>
              <Input 
                id="healthcare-address" 
                value={formData.healthcareFacilityAddress}
                onChange={(e) => handleInputChange("healthcareFacilityAddress", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label htmlFor="healthcare-phone">Facility Phone <span className="text-muted-foreground">(Teléfono del centro)</span></Label>
              <Input 
                id="healthcare-phone" 
                type="tel"
                value={formData.healthcareFacilityPhone}
                onChange={(e) => handleInputChange("healthcareFacilityPhone", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label htmlFor="treatment-dates">Treatment dates <span className="text-muted-foreground">(Fechas de tratamiento)</span></Label>
              <Input 
                id="treatment-dates" 
                value={formData.treatmentDates}
                onChange={(e) => handleInputChange("treatmentDates", e.target.value)}
                placeholder="From - To / Desde - Hasta"
              />
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Section 9: Authorizations */}
        <FormSection
          title="Authorizations"
          subtitle="Autorizaciones"
          number={9}
          isCompleted={isSectionCompleted("auth")}
          className="mb-6"
        >
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-3">Patient Authorization / Autorización del Paciente</h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>
                  I authorize the healthcare providers at this facility to examine and treat my condition. 
                  I understand that no guarantee has been made as to the outcome of examination or treatment.
                </p>
                <p className="italic">
                  Autorizo a los proveedores de atención médica de esta clínica a examinar y tratar mi condición. 
                  Entiendo que no se ha hecho ninguna garantía en cuanto al resultado del examen o tratamiento.
                </p>
              </div>
            </div>

            <FormFieldGrid>
              <FormField>
                <Label htmlFor="radiology-signature">Radiology Authorization Signature <span className="text-muted-foreground">(Firma Autorización Radiología)</span></Label>
                <Input 
                  id="radiology-signature" 
                  value={formData.radiologySignature}
                  onChange={(e) => handleInputChange("radiologySignature", e.target.value)}
                  placeholder="Type your full name / Escriba su nombre completo"
                />
              </FormField>
              <FormField>
                <Label htmlFor="radiology-date">Date <span className="text-muted-foreground">(Fecha)</span></Label>
                <Input 
                  id="radiology-date" 
                  type="date"
                  value={formData.radiologyDate}
                  onChange={(e) => handleInputChange("radiologyDate", e.target.value)}
                />
              </FormField>
              <FormField>
                <Label htmlFor="patient-signature">Patient Signature * <span className="text-muted-foreground">(Firma del Paciente *)</span></Label>
                <Input 
                  id="patient-signature" 
                  value={formData.patientSignature}
                  onChange={(e) => handleInputChange("patientSignature", e.target.value)}
                  placeholder="Type your full name / Escriba su nombre completo"
                  required
                />
              </FormField>
              <FormField>
                <Label htmlFor="final-date">Date * <span className="text-muted-foreground">(Fecha *)</span></Label>
                <Input 
                  id="final-date" 
                  type="date"
                  value={formData.finalDate}
                  onChange={(e) => handleInputChange("finalDate", e.target.value)}
                  required
                />
              </FormField>
            </FormFieldGrid>
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full sm:w-auto px-8"
          >
            Submit Form / Enviar Formulario
          </Button>
        </div>
      </form>
    </PublicFormLayout>
  );
};

export default PublicNewForm;