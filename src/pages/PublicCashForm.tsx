import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DocumentUpload } from "@/components/DocumentUpload";
import { PublicFormLayout } from "@/components/ui/public-form-layout";
import { FormSection } from "@/components/ui/form-section";
import { FormFieldGrid, FormField, DocumentUploadSection } from "@/components/ui/form-field-grid";

const PublicCashForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    driversLicense: "",
    driversLicenseState: "",
    emergencyContact: "",
    emergencyPhone: "",
    sex: "",
    maritalStatus: "",
    dob: "",
    ssn: "",
    age: "",
    employmentStatus: "",
    employerName: "",
    employerAddress: "",
    studentStatus: "",
    language: "en", // Default to English
    autoInsurance: "",
    policyNumber: "",
    claimNumber: "",
    adjusterName: "",
    healthInsurance: "",
    groupNumber: "",
    attorneyName: "",
    attorneyPhone: "",
    accidentDate: "",
    accidentTime: "",
    accidentDescription: "",
    roleInAccident: "",
    weather: "",
    streetSurface: "",
    bodyPartHit: "",
    whatItHit: "",
    systems: {
      fever: false,
      chills: false,
      fatigue: false,
      blurredVision: false,
      doubleVision: false,
      eyePain: false,
      ringingInEars: false,
      nasalCongestion: false,
      chestPains: false,
      palpitations: false,
      nausea: false,
      abdominalPain: false,
      weakness: false,
      numbness: false,
      dizziness: false,
    },
    
    // Medical History
    currentMedications: "",
    allergies: "",
    pastInjuries: "",
    previousSurgeries: "",
    chronicConditions: "",
    otherMedicalHistory: "",
    painLocation: "",
    painSeverity: "5",
    familyMedicalHistory: "",
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
    smokingStatus: "",
    smokingHistory: "",
    
    consentAcknowledgement: false,
    signature: "",
    date: "",
  });

  const [honeypot, setHoneypot] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemChange = (system: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      systems: {
        ...prev.systems,
        [system]: checked
      }
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
    
    if (!formData.consentAcknowledgement) {
      toast.error("Please acknowledge that you have read and agree to all authorizations");
      return;
    }
    
    if (!formData.signature) {
      toast.error("Please provide your signature");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'cash',
          formData: formData,
          honeypot: honeypot
        }
      });

      if (error) {
        throw error;
      }

      // Show success message instead of redirecting
      toast.success("Your cash form has been submitted successfully! We will contact you soon.");
      
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
      title="Cash Patient Intake Form"
      subtitle="Formulario de Admisión para Paciente de Pago Directo"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field for bot protection - hidden from users */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />
        
        {/* General Information Section */}
        <FormSection
          number={1}
          title="General Information"
          subtitle="INFORMACIÓN GENERAL"
          defaultOpen={true}
        >
          <FormFieldGrid>
            <FormField>
              <Input
                type="text"
                placeholder="Last Name / Apellido"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="First Name / Nombre"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </FormField>
            <FormField fullWidth>
              <Input
                type="text"
                placeholder="Address / Dirección"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="City / Ciudad"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="State / Estado"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Zip / Código Postal"
                value={formData.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="tel"
                placeholder="Home Phone / Teléfono (Casa)"
                value={formData.homePhone}
                onChange={(e) => handleInputChange("homePhone", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="tel"
                placeholder="Work Phone / Teléfono (Trabajo)"
                value={formData.workPhone}
                onChange={(e) => handleInputChange("workPhone", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="tel"
                placeholder="Cell Phone / Teléfono (Celular)"
                value={formData.cellPhone}
                onChange={(e) => handleInputChange("cellPhone", e.target.value)}
              />
            </FormField>
            <FormField fullWidth>
              <Input
                type="email"
                placeholder="Email / Correo Electrónico"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Driver's License # / Núm. de Licencia"
                value={formData.driversLicense}
                onChange={(e) => handleInputChange("driversLicense", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Driver's License State / Estado de Licencia"
                value={formData.driversLicenseState}
                onChange={(e) => handleInputChange("driversLicenseState", e.target.value)}
              />
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
          
          <FormFieldGrid>
            <FormField>
              <Input
                type="text"
                placeholder="Emergency Contact / Contacto de Emergencia"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="tel"
                placeholder="Emergency Phone / Teléfono de Emergencia"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
              />
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sex / Sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male / Masculino</SelectItem>
                  <SelectItem value="female">Female / Femenino</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Marital Status / Estado Civil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single / Soltero(a)</SelectItem>
                  <SelectItem value="married">Married / Casado(a)</SelectItem>
                  <SelectItem value="divorced">Divorced / Divorciado(a)</SelectItem>
                  <SelectItem value="widowed">Widowed / Viudo(a)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Select 
                value={formData.language} 
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Preferred Language / Idioma Preferido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField fullWidth>
              <Label className="text-muted-foreground text-sm">Date of Birth / Fecha de Nacimiento</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Social Security # / Núm. Seguro Social"
                value={formData.ssn}
                onChange={(e) => handleInputChange("ssn", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="number"
                placeholder="Age / Edad"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
              />
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Employment & Student Status */}
        <FormSection
          number={2}
          title="Employment & Student Status"
          subtitle="ESTADO LABORAL Y ESTUDIANTIL"
        >
          <FormFieldGrid>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("employmentStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Status / Estado Laboral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullTime">Full Time / Tiempo Completo</SelectItem>
                  <SelectItem value="partTime">Part Time / Tiempo Parcial</SelectItem>
                  <SelectItem value="retired">Retired / Retirado</SelectItem>
                  <SelectItem value="unemployed">Not Employed / Desempleado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Employer Name / Nombre del Empleador"
                value={formData.employerName}
                onChange={(e) => handleInputChange("employerName", e.target.value)}
              />
            </FormField>
            <FormField fullWidth>
              <Input
                type="text"
                placeholder="Employer Address / Dirección del Empleador"
                value={formData.employerAddress}
                onChange={(e) => handleInputChange("employerAddress", e.target.value)}
              />
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("studentStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Student Status / Estado Estudiantil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullTime">Full Time / Tiempo Completo</SelectItem>
                  <SelectItem value="partTime">Part Time / Tiempo Parcial</SelectItem>
                  <SelectItem value="nonStudent">Non Student / No Estudia</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Insurance & Attorney Information */}
        <FormSection
          number={3}
          title="Insurance & Attorney"
          subtitle="SEGURO Y ABOGADO"
        >
          <FormFieldGrid>
            <FormField>
              <Input
                type="text"
                placeholder="Auto Insurance Company / Cía. de Seguro de Auto"
                value={formData.autoInsurance}
                onChange={(e) => handleInputChange("autoInsurance", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Policy # / Núm. de Póliza"
                value={formData.policyNumber}
                onChange={(e) => handleInputChange("policyNumber", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Claim # / Núm. de Reclamo"
                value={formData.claimNumber}
                onChange={(e) => handleInputChange("claimNumber", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Adjuster's Name / Nombre del Ajustador"
                value={formData.adjusterName}
                onChange={(e) => handleInputChange("adjusterName", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Health Insurance / Seguro Médico"
                value={formData.healthInsurance}
                onChange={(e) => handleInputChange("healthInsurance", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Group # / Núm. de Grupo"
                value={formData.groupNumber}
                onChange={(e) => handleInputChange("groupNumber", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="text"
                placeholder="Attorney's Name / Nombre del Abogado"
                value={formData.attorneyName}
                onChange={(e) => handleInputChange("attorneyName", e.target.value)}
              />
            </FormField>
            <FormField>
              <Input
                type="tel"
                placeholder="Attorney's Phone / Teléfono del Abogado"
                value={formData.attorneyPhone}
                onChange={(e) => handleInputChange("attorneyPhone", e.target.value)}
              />
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Medical History */}
        <FormSection
          number={4}
          title="Medical History"
          subtitle="HISTORIAL MÉDICO"
        >
          <FormFieldGrid>
            <FormField fullWidth>
              <Textarea
                placeholder="Current Medications / Medicamentos Actuales"
                rows={3}
                value={formData.currentMedications}
                onChange={(e) => handleInputChange("currentMedications", e.target.value)}
              />
            </FormField>
            <FormField fullWidth>
              <Textarea
                placeholder="Allergies / Alergias"
                rows={3}
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
              />
            </FormField>
            <FormField>
              <Textarea
                placeholder="Past Injuries / Lesiones Pasadas"
                rows={3}
                value={formData.pastInjuries}
                onChange={(e) => handleInputChange("pastInjuries", e.target.value)}
              />
            </FormField>
            <FormField>
              <Textarea
                placeholder="Previous Surgeries / Cirugías Previas"
                rows={3}
                value={formData.previousSurgeries}
                onChange={(e) => handleInputChange("previousSurgeries", e.target.value)}
              />
            </FormField>
            <FormField>
              <Textarea
                placeholder="Chronic Conditions / Condiciones Crónicas"
                rows={3}
                value={formData.chronicConditions}
                onChange={(e) => handleInputChange("chronicConditions", e.target.value)}
              />
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("smokingStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Do you smoke? / ¿Fuma?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never / Nunca</SelectItem>
                  <SelectItem value="current">Current / Actualmente</SelectItem>
                  <SelectItem value="former">Former / Antes</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Current Symptoms */}
        <FormSection
          number={5}
          title="Current Symptoms"
          subtitle="SÍNTOMAS ACTUALES"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Pain / Dolor</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headache"
                    checked={formData.currentSymptoms.headache}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "headache", checked)}
                  />
                  <Label htmlFor="headache" className="text-sm">Headache / Dolor de cabeza</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neckPain"
                    checked={formData.currentSymptoms.neckPain}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "neckPain", checked)}
                  />
                  <Label htmlFor="neckPain" className="text-sm">Neck pain / Dolor de cuello</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowerBackPain"
                    checked={formData.currentSymptoms.lowerBackPain}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "lowerBackPain", checked)}
                  />
                  <Label htmlFor="lowerBackPain" className="text-sm">Lower back pain / Dolor lumbar</Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Neurological / Neurológico</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dizzinessSymptom"
                    checked={formData.currentSymptoms.dizziness}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "dizziness", checked)}
                  />
                  <Label htmlFor="dizzinessSymptom" className="text-sm">Dizziness / Mareo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbnessArmsHands"
                    checked={formData.currentSymptoms.numbnessArmsHands}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "numbnessArmsHands", checked)}
                  />
                  <Label htmlFor="numbnessArmsHands" className="text-sm">Numbness in arms/hands / Entumecimiento brazos/manos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tinglingArmsHands"
                    checked={formData.currentSymptoms.tinglingArmsHands}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "tinglingArmsHands", checked)}
                  />
                  <Label htmlFor="tinglingArmsHands" className="text-sm">Tingling in arms/hands / Hormigueo brazos/manos</Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">General / General</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fatigueSymptom"
                    checked={formData.currentSymptoms.fatigue}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "fatigue", checked)}
                  />
                  <Label htmlFor="fatigueSymptom" className="text-sm">Fatigue / Fatiga</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="irritability"
                    checked={formData.currentSymptoms.irritability}
                    onCheckedChange={(checked) => handleNestedChange("currentSymptoms", "irritability", checked)}
                  />
                  <Label htmlFor="irritability" className="text-sm">Irritability / Irritabilidad</Label>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Authorizations & Consents */}
        <FormSection
          number={6}
          title="Authorizations & Consents"
          subtitle="AUTORIZACIONES"
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Payment Agreement / <span className="font-medium">Acuerdo de Pago</span></h3>
              <div className="bg-muted/30 border-l-4 border-primary p-4 text-xs max-h-36 overflow-y-auto rounded-r-lg">
                <p>
                  I agree to pay for all services rendered to me as they are provided. I understand that payment is due at the time of service unless other arrangements have been made...
                </p>
                <p className="mt-2 italic">
                  Acepto pagar por todos los servicios prestados a medida que se proporcionen. Entiendo que el pago vence al momento del servicio a menos que se hayan hecho otros arreglos...
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Consent to Medical Care / <span className="font-medium">Consentimiento para Atención Médica</span></h3>
              <div className="bg-muted/30 border-l-4 border-primary p-4 text-xs max-h-36 overflow-y-auto rounded-r-lg">
                <p>
                  I authorize Silverman Chiropractic and Rehabilitation Center to determine what kinds of pathological procedures (tests) must be done... I also authorize my doctor to determine what kind of treatment is to be given...
                </p>
                <p className="mt-2 italic">
                  Autorizo al Silverman Chiropractic and Rehabilitation Center a determinar qué tipo de procedimientos patológicos (pruebas) deben realizarse... También autorizo a mi médico a determinar qué tipo de tratamiento se debe administrar...
                </p>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Signature Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-start space-x-3 mb-6">
            <Checkbox
              id="consent_acknowledgement"
              checked={formData.consentAcknowledgement}
              onCheckedChange={(checked) => handleInputChange("consentAcknowledgement", checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent_acknowledgement" className="text-sm leading-relaxed">
              By checking this box, I confirm I have read and agree to all authorizations.
              <br />
              <span className="italic">Al marcar esta casilla, confirmo que he leído y acepto todas las autorizaciones.</span>
            </Label>
          </div>
          <FormFieldGrid>
            <FormField>
              <Label className="text-muted-foreground text-sm">Patient Signature / <span className="italic">Firma del Paciente</span></Label>
              <Input
                type="text"
                value={formData.signature}
                onChange={(e) => handleInputChange("signature", e.target.value)}
                placeholder="Type your full name to sign"
              />
            </FormField>
            <FormField>
              <Label className="text-muted-foreground text-sm">Date / <span className="italic">Fecha</span></Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </FormField>
          </FormFieldGrid>
        </div>

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

export default PublicCashForm;