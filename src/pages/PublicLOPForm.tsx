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

const PublicLOPForm = () => {
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
          formType: 'lop',
          formData: formData,
          honeypot: honeypot
        }
      });

      if (error) {
        throw error;
      }

      // Show success message instead of redirecting
      toast.success("Your LOP form has been submitted successfully! We will contact you soon.");
      
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
      title="LOP Intake Form"
      subtitle="Formulario de Admisión (Carta de Protección)"
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

        {/* Auto Accident Details */}
        <FormSection
          number={4}
          title="Auto Accident Details"
          subtitle="DETALLES DEL ACCIDENTE"
        >
          <FormFieldGrid>
            <FormField>
              <Label className="text-muted-foreground text-sm">Date of Accident / Fecha del Accidente</Label>
              <Input
                type="date"
                value={formData.accidentDate}
                onChange={(e) => handleInputChange("accidentDate", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label className="text-muted-foreground text-sm">Time of Accident / Hora del Accidente</Label>
              <Input
                type="time"
                value={formData.accidentTime}
                onChange={(e) => handleInputChange("accidentTime", e.target.value)}
              />
            </FormField>
            <FormField fullWidth>
              <Textarea
                placeholder="Describe how the accident took place / Describe cómo ocurrió el accidente"
                rows={3}
                value={formData.accidentDescription}
                onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
              />
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("roleInAccident", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Were you the... / Usted era..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Driver / Chofer</SelectItem>
                  <SelectItem value="passenger">Passenger / Pasajero</SelectItem>
                  <SelectItem value="pedestrian">Pedestrian / Peatón</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("weather", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Weather / Clima" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">Sunny / Soleado</SelectItem>
                  <SelectItem value="rainy">Rainy / Lluvioso</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Select onValueChange={(value) => handleInputChange("streetSurface", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Street Surface / Superficie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry / Seca</SelectItem>
                  <SelectItem value="wet">Wet / Mojada</SelectItem>
                  <SelectItem value="slick">Slick / Resbaladiza</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <Label className="text-muted-foreground text-sm">Did your body hit anything inside the car? / ¿Su cuerpo golpeó algo dentro del carro?</Label>
              <Input
                type="text"
                placeholder="Body Part / Parte del Cuerpo"
                value={formData.bodyPartHit}
                onChange={(e) => handleInputChange("bodyPartHit", e.target.value)}
              />
            </FormField>
            <FormField>
              <Label className="text-muted-foreground text-sm invisible">Spacer</Label>
              <Input
                type="text"
                placeholder="What it hit / Qué golpeó"
                value={formData.whatItHit}
                onChange={(e) => handleInputChange("whatItHit", e.target.value)}
              />
            </FormField>
          </FormFieldGrid>
        </FormSection>

        {/* Review of Systems */}
        <FormSection
          number={5}
          title="Review of Systems"
          subtitle="REVISIÓN DE SISTEMAS"
        >
          <p className="text-sm text-muted-foreground mb-6">
            Do you currently have any of the following problems? / 
            <span className="italic"> ¿Tiene actualmente alguno de los siguientes problemas?</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">General</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fever"
                    checked={formData.systems.fever}
                    onCheckedChange={(checked) => handleSystemChange("fever", checked as boolean)}
                  />
                  <Label htmlFor="fever" className="text-sm">Fever / <span className="italic">Fiebre</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chills"
                    checked={formData.systems.chills}
                    onCheckedChange={(checked) => handleSystemChange("chills", checked as boolean)}
                  />
                  <Label htmlFor="chills" className="text-sm">Chills / <span className="italic">Escalofríos</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fatigue"
                    checked={formData.systems.fatigue}
                    onCheckedChange={(checked) => handleSystemChange("fatigue", checked as boolean)}
                  />
                  <Label htmlFor="fatigue" className="text-sm">Fatigue / <span className="italic">Fatiga</span></Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Eyes / Ojos</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blurredVision"
                    checked={formData.systems.blurredVision}
                    onCheckedChange={(checked) => handleSystemChange("blurredVision", checked as boolean)}
                  />
                  <Label htmlFor="blurredVision" className="text-sm">Blurred vision / <span className="italic">Visión borrosa</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="doubleVision"
                    checked={formData.systems.doubleVision}
                    onCheckedChange={(checked) => handleSystemChange("doubleVision", checked as boolean)}
                  />
                  <Label htmlFor="doubleVision" className="text-sm">Double vision / <span className="italic">Visión doble</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eyePain"
                    checked={formData.systems.eyePain}
                    onCheckedChange={(checked) => handleSystemChange("eyePain", checked as boolean)}
                  />
                  <Label htmlFor="eyePain" className="text-sm">Eye pain / <span className="italic">Dolor de ojos</span></Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">ENT / Oído, Nariz, Garganta</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ringingInEars"
                    checked={formData.systems.ringingInEars}
                    onCheckedChange={(checked) => handleSystemChange("ringingInEars", checked as boolean)}
                  />
                  <Label htmlFor="ringingInEars" className="text-sm">Ringing in ears / <span className="italic">Zumbido</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nasalCongestion"
                    checked={formData.systems.nasalCongestion}
                    onCheckedChange={(checked) => handleSystemChange("nasalCongestion", checked as boolean)}
                  />
                  <Label htmlFor="nasalCongestion" className="text-sm">Nasal congestion / <span className="italic">Congestión</span></Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Cardiovascular</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chestPains"
                    checked={formData.systems.chestPains}
                    onCheckedChange={(checked) => handleSystemChange("chestPains", checked as boolean)}
                  />
                  <Label htmlFor="chestPains" className="text-sm">Chest pains / <span className="italic">Dolor de pecho</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="palpitations"
                    checked={formData.systems.palpitations}
                    onCheckedChange={(checked) => handleSystemChange("palpitations", checked as boolean)}
                  />
                  <Label htmlFor="palpitations" className="text-sm">Palpitations / <span className="italic">Palpitaciones</span></Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Gastrointestinal</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nausea"
                    checked={formData.systems.nausea}
                    onCheckedChange={(checked) => handleSystemChange("nausea", checked as boolean)}
                  />
                  <Label htmlFor="nausea" className="text-sm">Nausea / <span className="italic">Náuseas</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="abdominalPain"
                    checked={formData.systems.abdominalPain}
                    onCheckedChange={(checked) => handleSystemChange("abdominalPain", checked as boolean)}
                  />
                  <Label htmlFor="abdominalPain" className="text-sm">Abdominal pain / <span className="italic">Dolor abdominal</span></Label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Neurologic / Neurológico</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weakness"
                    checked={formData.systems.weakness}
                    onCheckedChange={(checked) => handleSystemChange("weakness", checked as boolean)}
                  />
                  <Label htmlFor="weakness" className="text-sm">Weakness / <span className="italic">Debilidad</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbness"
                    checked={formData.systems.numbness}
                    onCheckedChange={(checked) => handleSystemChange("numbness", checked as boolean)}
                  />
                  <Label htmlFor="numbness" className="text-sm">Numbness / <span className="italic">Entumecimiento</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dizziness"
                    checked={formData.systems.dizziness}
                    onCheckedChange={(checked) => handleSystemChange("dizziness", checked as boolean)}
                  />
                  <Label htmlFor="dizziness" className="text-sm">Dizziness / <span className="italic">Mareo</span></Label>
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
              <h3 className="font-semibold text-lg mb-2">Assignment of Benefits / <span className="font-medium">Asignación de Beneficios</span></h3>
              <div className="bg-muted/30 border-l-4 border-primary p-4 text-xs max-h-36 overflow-y-auto rounded-r-lg">
                <p>
                  I hereby assign the rights and benefits of insurance to the applicable personal injury protection...to Silverman Chiropractic & Rehabilitation Center, Inc... This assignment includes but is not limited to all rights to collect benefits directly from the insurance company...
                </p>
                <p className="mt-2 italic">
                  Yo, por el presente, asigno los derechos y beneficios del seguro de protección contra lesiones personales aplicable... a Silverman Chiropractic & Rehabilitation Center, Inc... Esta asignación incluye, entre otros, todos los derechos a cobrar los beneficios directamente de la compañía de seguros...
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Doctor's Lien / <span className="font-medium">Gravamen del Médico</span></h3>
              <div className="bg-muted/30 border-l-4 border-primary p-4 text-xs max-h-36 overflow-y-auto rounded-r-lg">
                <p>
                  I hereby authorize and direct you, my attorney, to pay directly to said doctor such sums as may be due...from any settlement, judgment, or verdict... I hereby give a lien on my case to the said center...
                </p>
                <p className="mt-2 italic">
                  Por la presente autorizo y le ordeno a usted, mi abogado, que pague directamente a dicho médico las sumas adeudadas... de cualquier acuerdo, sentencia o veredicto... Por la presente otorgo un gravamen sobre mi caso a dicho centro...
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

export default PublicLOPForm;