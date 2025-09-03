import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, IdCard, CreditCard } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";

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
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Cash Patient Intake Form</h1>
          <p className="text-lg text-gray-600 mt-2">Formulario de Admisión para Paciente de Pago Directo</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
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
          <Collapsible defaultOpen className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">1. General Information / <span className="font-medium">INFORMACIÓN GENERAL</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  placeholder="Last Name / Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="text"
                  placeholder="First Name / Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Address / Dirección"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <Input
                  type="text"
                  placeholder="City / Ciudad"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="text"
                  placeholder="State / Estado"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="text"
                  placeholder="Zip / Código Postal"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="tel"
                  placeholder="Home Phone / Teléfono (Casa)"
                  value={formData.homePhone}
                  onChange={(e) => handleInputChange("homePhone", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="tel"
                  placeholder="Work Phone / Teléfono (Trabajo)"
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange("workPhone", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="tel"
                  placeholder="Cell Phone / Teléfono (Celular)"
                  value={formData.cellPhone}
                  onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="email"
                  placeholder="Email / Correo Electrónico"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="md:col-span-2 w-full rounded-md border-gray-300"
                />
                <Input
                  type="text"
                  placeholder="Driver's License # / Núm. de Licencia"
                  value={formData.driversLicense}
                  onChange={(e) => handleInputChange("driversLicense", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="text"
                  placeholder="Driver's License State / Estado de Licencia"
                  value={formData.driversLicenseState}
                  onChange={(e) => handleInputChange("driversLicenseState", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                
                {/* Document Upload Section */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="md:col-span-2 text-lg font-semibold text-gray-900 border-b pb-2">
                    Document Uploads / <span className="font-medium">Subida de Documentos</span>
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
                <Input
                  type="text"
                  placeholder="Emergency Contact / Contacto de Emergencia"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="tel"
                  placeholder="Emergency Phone / Teléfono de Emergencia"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Select onValueChange={(value) => handleInputChange("sex", value)}>
                  <SelectTrigger className="w-full rounded-md border-gray-300">
                    <SelectValue placeholder="Sex / Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male / Masculino</SelectItem>
                    <SelectItem value="female">Female / Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                  <SelectTrigger className="w-full rounded-md border-gray-300">
                    <SelectValue placeholder="Marital Status / Estado Civil" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="single">Single / Soltero(a)</SelectItem>
                    <SelectItem value="married">Married / Casado(a)</SelectItem>
                    <SelectItem value="divorced">Divorced / Divorciado(a)</SelectItem>
                    <SelectItem value="widowed">Widowed / Viudo(a)</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => handleInputChange("language", value)}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-300">
                    <SelectValue placeholder="Preferred Language / Idioma Preferido" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
                <div className="md:col-span-2">
                  <Label className="text-gray-600 font-medium">Date of Birth / Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Social Security # / Núm. Seguro Social"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange("ssn", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                <Input
                  type="number"
                  placeholder="Age / Edad"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Employment & Student Status */}
          <Collapsible className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">2. Employment & Student Status / <span className="font-medium">ESTADO LABORAL Y ESTUDIANTIL</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select onValueChange={(value) => handleInputChange("employmentStatus", value)}>
                <SelectTrigger className="w-full rounded-md border-gray-300">
                  <SelectValue placeholder="Employment Status / Estado Laboral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullTime">Full Time / Tiempo Completo</SelectItem>
                  <SelectItem value="partTime">Part Time / Tiempo Parcial</SelectItem>
                  <SelectItem value="retired">Retired / Retirado</SelectItem>
                  <SelectItem value="unemployed">Not Employed / Desempleado</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Employer Name / Nombre del Empleador"
                value={formData.employerName}
                onChange={(e) => handleInputChange("employerName", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Employer Address / Dirección del Empleador"
                  value={formData.employerAddress}
                  onChange={(e) => handleInputChange("employerAddress", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
              </div>
              <Select onValueChange={(value) => handleInputChange("studentStatus", value)}>
                <SelectTrigger className="w-full rounded-md border-gray-300">
                  <SelectValue placeholder="Student Status / Estado Estudiantil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullTime">Full Time / Tiempo Completo</SelectItem>
                  <SelectItem value="partTime">Part Time / Tiempo Parcial</SelectItem>
                  <SelectItem value="nonStudent">Non Student / No Estudia</SelectItem>
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          {/* Insurance & Attorney Information */}
          <Collapsible className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">3. Insurance & Attorney / <span className="font-medium">SEGURO Y ABOGADO</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                placeholder="Auto Insurance Company / Cía. de Seguro de Auto"
                value={formData.autoInsurance}
                onChange={(e) => handleInputChange("autoInsurance", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <Input
                type="text"
                placeholder="Policy # / Núm. de Póliza"
                value={formData.policyNumber}
                onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <Input
                type="text"
                placeholder="Claim # / Núm. de Reclamo"
                value={formData.claimNumber}
                onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <Input
                type="text"
                placeholder="Adjuster's Name / Nombre del Ajustador"
                value={formData.adjusterName}
                onChange={(e) => handleInputChange("adjusterName", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <Input
                type="text"
                placeholder="Health Insurance / Seguro Médico"
                value={formData.healthInsurance}
                onChange={(e) => handleInputChange("healthInsurance", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <Input
                type="text"
                placeholder="Group # / Núm. de Grupo"
                value={formData.groupNumber}
                onChange={(e) => handleInputChange("groupNumber", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
              <Input
                type="text"
                placeholder="Attorney's Name / Nombre del Abogado"
                value={formData.attorneyName}
                onChange={(e) => handleInputChange("attorneyName", e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
                <Input
                  type="tel"
                  placeholder="Attorney's Phone / Teléfono del Abogado"
                  value={formData.attorneyPhone}
                  onChange={(e) => handleInputChange("attorneyPhone", e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
                
            </CollapsibleContent>
          </Collapsible>

          {/* Auto Accident Details */}
          <Collapsible className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">4. Auto Accident Details / <span className="font-medium">DETALLES DEL ACCIDENTE</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-600 font-medium">Date of Accident / Fecha del Accidente</Label>
                  <Input
                    type="date"
                    value={formData.accidentDate}
                    onChange={(e) => handleInputChange("accidentDate", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 font-medium">Time of Accident / Hora del Accidente</Label>
                  <Input
                    type="time"
                    value={formData.accidentTime}
                    onChange={(e) => handleInputChange("accidentTime", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Describe how the accident took place / Describe cómo ocurrió el accidente"
                    rows={3}
                    value={formData.accidentDescription}
                    onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={(value) => handleInputChange("roleInAccident", value)}>
                  <SelectTrigger className="w-full rounded-md border-gray-300">
                    <SelectValue placeholder="Were you the... / Usted era..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver / Chofer</SelectItem>
                    <SelectItem value="passenger">Passenger / Pasajero</SelectItem>
                    <SelectItem value="pedestrian">Pedestrian / Peatón</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("weather", value)}>
                  <SelectTrigger className="w-full rounded-md border-gray-300">
                    <SelectValue placeholder="Weather / Clima" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny / Soleado</SelectItem>
                    <SelectItem value="rainy">Rainy / Lluvioso</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("streetSurface", value)}>
                  <SelectTrigger className="w-full rounded-md border-gray-300">
                    <SelectValue placeholder="Street Surface / Superficie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">Dry / Seca</SelectItem>
                    <SelectItem value="wet">Wet / Mojada</SelectItem>
                    <SelectItem value="slick">Slick / Resbaladiza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-600 font-medium">Did your body hit anything inside the car? / ¿Su cuerpo golpeó algo dentro del carro?</Label>
                <div className="mt-2 flex gap-4">
                  <Input
                    type="text"
                    placeholder="Body Part / Parte del Cuerpo"
                    value={formData.bodyPartHit}
                    onChange={(e) => handleInputChange("bodyPartHit", e.target.value)}
                    className="w-1/2 rounded-md border-gray-300"
                  />
                  <Input
                    type="text"
                    placeholder="What it hit / Qué golpeó"
                    value={formData.whatItHit}
                    onChange={(e) => handleInputChange("whatItHit", e.target.value)}
                    className="w-1/2 rounded-md border-gray-300"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Review of Systems */}
          <Collapsible className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">5. Review of Systems / <span className="font-medium">REVISIÓN DE SISTEMAS</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">Do you currently have any of the following problems? / <span className="italic">¿Tiene actualmente alguno de los siguientes problemas?</span></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">General</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox
                        id="fever"
                        checked={formData.systems.fever}
                        onCheckedChange={(checked) => handleSystemChange("fever", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="fever" className="ml-2 text-sm">Fever / <span className="italic">Fiebre</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="chills"
                        checked={formData.systems.chills}
                        onCheckedChange={(checked) => handleSystemChange("chills", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="chills" className="ml-2 text-sm">Chills / <span className="italic">Escalofríos</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="fatigue"
                        checked={formData.systems.fatigue}
                        onCheckedChange={(checked) => handleSystemChange("fatigue", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="fatigue" className="ml-2 text-sm">Fatigue / <span className="italic">Fatiga</span></Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Eyes / Ojos</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox
                        id="blurredVision"
                        checked={formData.systems.blurredVision}
                        onCheckedChange={(checked) => handleSystemChange("blurredVision", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="blurredVision" className="ml-2 text-sm">Blurred vision / <span className="italic">Visión borrosa</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="doubleVision"
                        checked={formData.systems.doubleVision}
                        onCheckedChange={(checked) => handleSystemChange("doubleVision", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="doubleVision" className="ml-2 text-sm">Double vision / <span className="italic">Visión doble</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="eyePain"
                        checked={formData.systems.eyePain}
                        onCheckedChange={(checked) => handleSystemChange("eyePain", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="eyePain" className="ml-2 text-sm">Eye pain / <span className="italic">Dolor de ojos</span></Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">ENT / Oído, Nariz, Garganta</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox
                        id="ringingInEars"
                        checked={formData.systems.ringingInEars}
                        onCheckedChange={(checked) => handleSystemChange("ringingInEars", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="ringingInEars" className="ml-2 text-sm">Ringing in ears / <span className="italic">Zumbido</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="nasalCongestion"
                        checked={formData.systems.nasalCongestion}
                        onCheckedChange={(checked) => handleSystemChange("nasalCongestion", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="nasalCongestion" className="ml-2 text-sm">Nasal congestion / <span className="italic">Congestión</span></Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cardiovascular</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox
                        id="chestPains"
                        checked={formData.systems.chestPains}
                        onCheckedChange={(checked) => handleSystemChange("chestPains", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="chestPains" className="ml-2 text-sm">Chest pains / <span className="italic">Dolor de pecho</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="palpitations"
                        checked={formData.systems.palpitations}
                        onCheckedChange={(checked) => handleSystemChange("palpitations", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="palpitations" className="ml-2 text-sm">Palpitations / <span className="italic">Palpitaciones</span></Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Gastrointestinal</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox
                        id="nausea"
                        checked={formData.systems.nausea}
                        onCheckedChange={(checked) => handleSystemChange("nausea", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="nausea" className="ml-2 text-sm">Nausea / <span className="italic">Náuseas</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="abdominalPain"
                        checked={formData.systems.abdominalPain}
                        onCheckedChange={(checked) => handleSystemChange("abdominalPain", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="abdominalPain" className="ml-2 text-sm">Abdominal pain / <span className="italic">Dolor abdominal</span></Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Neurologic / Neurológico</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox
                        id="weakness"
                        checked={formData.systems.weakness}
                        onCheckedChange={(checked) => handleSystemChange("weakness", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="weakness" className="ml-2 text-sm">Weakness / <span className="italic">Debilidad</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="numbness"
                        checked={formData.systems.numbness}
                        onCheckedChange={(checked) => handleSystemChange("numbness", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="numbness" className="ml-2 text-sm">Numbness / <span className="italic">Entumecimiento</span></Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="dizziness"
                        checked={formData.systems.dizziness}
                        onCheckedChange={(checked) => handleSystemChange("dizziness", checked as boolean)}
                        className="h-4 w-4 rounded"
                      />
                      <Label htmlFor="dizziness" className="ml-2 text-sm">Dizziness / <span className="italic">Mareo</span></Label>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Medical History Section */}
          <Collapsible className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">6. Medical History / <span className="font-medium">HISTORIAL MÉDICO</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="text-gray-600 font-medium mb-2 block">Current Medications / <span className="italic">Medicamentos Actuales</span></Label>
                  <Textarea 
                    placeholder="List all current medications including dosage / Lista todos los medicamentos actuales incluyendo la dosis"
                    rows={3}
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 font-medium mb-2 block">Allergies / <span className="italic">Alergias</span></Label>
                  <Textarea 
                    placeholder="List all known allergies (medications, foods, environmental) / Lista todas las alergias conocidas (medicamentos, alimentos, ambientales)"
                    rows={3}
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 font-medium mb-2 block">Past Injuries / <span className="italic">Lesiones Previas</span></Label>
                  <Textarea 
                    placeholder="Describe any previous injuries, accidents, or trauma / Describe cualquier lesión, accidente o trauma previo"
                    rows={3}
                    value={formData.pastInjuries}
                    onChange={(e) => handleInputChange("pastInjuries", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 font-medium mb-2 block">Previous Surgeries / <span className="italic">Cirugías Previas</span></Label>
                  <Textarea 
                    placeholder="List all previous surgeries with dates / Lista todas las cirugías previas con fechas"
                    rows={3}
                    value={formData.previousSurgeries}
                    onChange={(e) => handleInputChange("previousSurgeries", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 font-medium mb-2 block">Chronic Conditions / <span className="italic">Condiciones Crónicas</span></Label>
                  <Textarea 
                    placeholder="List any chronic medical conditions (diabetes, hypertension, etc.) / Lista cualquier condición médica crónica (diabetes, hipertensión, etc.)"
                    rows={3}
                    value={formData.chronicConditions}
                    onChange={(e) => handleInputChange("chronicConditions", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 font-medium mb-2 block">Other Medical History / <span className="italic">Otro Historial Médico</span></Label>
                  <Textarea 
                    placeholder="Any other relevant medical history / Cualquier otro historial médico relevante"
                    rows={3}
                    value={formData.otherMedicalHistory}
                    onChange={(e) => handleInputChange("otherMedicalHistory", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>

                {/* Pain Assessment */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800">Pain Assessment / <span className="font-medium italic">Evaluación del Dolor</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-600 font-medium mb-2 block">Where do you feel pain? / <span className="italic">¿Dónde siente dolor?</span></Label>
                      <Textarea
                        placeholder="Describe the location of your pain (e.g., lower back, neck, right shoulder) / Describa la ubicación de su dolor"
                        rows={3}
                        value={formData.painLocation}
                        onChange={(e) => handleInputChange("painLocation", e.target.value)}
                        className="w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-600 font-medium mb-2 block">Pain Level (1-10 scale) / <span className="italic">Nivel de Dolor (escala 1-10)</span></Label>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.painSeverity}
                          onChange={(e) => handleInputChange("painSeverity", e.target.value)}
                          className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>1 (Minimal)</span>
                          <span className="font-bold text-lg bg-blue-100 px-3 py-1 rounded-full">{formData.painSeverity}</span>
                          <span>10 (Severe)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Medical History */}
                <div className="border-t pt-6">
                  <Label className="text-gray-600 font-medium mb-4 block">Family Medical History / <span className="italic">Historial Médico Familiar</span></Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {Object.entries(formData.familyHistory).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`family-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange("familyHistory", key, checked)}
                          className="h-4 w-4 rounded"
                        />
                        <Label htmlFor={`family-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Additional family medical history notes / Notas adicionales del historial médico familiar"
                    rows={2}
                    value={formData.familyMedicalHistory}
                    onChange={(e) => handleInputChange("familyMedicalHistory", e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>

                {/* Current Symptoms */}
                <div className="border-t pt-6">
                  <Label className="text-gray-600 font-medium mb-4 block">Current Symptoms / <span className="italic">Síntomas Actuales</span></Label>
                  <p className="text-sm text-gray-500 mb-4">Check any symptoms you are currently experiencing / Marque cualquier síntoma que esté experimentando actualmente:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Object.entries(formData.currentSymptoms).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`symptom-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange("currentSymptoms", key, checked)}
                          className="h-4 w-4 rounded"
                        />
                        <Label htmlFor={`symptom-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smoking History */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800">Smoking History / <span className="font-medium italic">Historial de Tabaquismo</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-600 font-medium mb-2 block">Do you smoke? / <span className="italic">¿Fuma usted?</span></Label>
                      <Select onValueChange={(value) => handleInputChange("smokingStatus", value)}>
                        <SelectTrigger className="w-full rounded-md border-gray-300">
                          <SelectValue placeholder="Select an option / Seleccione una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never smoked / Nunca he fumado</SelectItem>
                          <SelectItem value="current">Current smoker / Fumador actual</SelectItem>
                          <SelectItem value="former">Former smoker / Ex fumador</SelectItem>
                          <SelectItem value="occasional">Occasional smoker / Fumador ocasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-600 font-medium mb-2 block">Smoking History Details / <span className="italic">Detalles del Historial de Tabaquismo</span></Label>
                      <Textarea
                        placeholder="If applicable, please provide details (packs per day, years smoking, quit date, etc.) / Si aplica, proporcione detalles"
                        rows={3}
                        value={formData.smokingHistory}
                        onChange={(e) => handleInputChange("smokingHistory", e.target.value)}
                        className="w-full rounded-md border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Authorizations & Consents */}
          <Collapsible defaultOpen className="border border-gray-200 rounded-lg">
            <CollapsibleTrigger className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg w-full">
              <h2 className="text-xl font-semibold text-blue-800">7. Authorizations & Consents / <span className="font-medium">AUTORIZACIONES</span></h2>
              <span className="text-blue-600">&#9654;</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg">Assignment of Benefits / <span className="font-medium">Asignación de Beneficios</span></h3>
                <p className="mt-2 bg-gray-50 border-l-4 border-blue-500 text-xs max-h-36 overflow-y-auto p-3">
                  I hereby assign the rights and benefits of insurance to the applicable personal injury protection...to Silverman Chiropractic & Rehabilitation Center, Inc... This assignment includes but is not limited to all rights to collect benefits directly from the insurance company...<br /><br />
                  <span className="italic">Yo, por el presente, asigno los derechos y beneficios del seguro de protección contra lesiones personales aplicable... a Silverman Chiropractic & Rehabilitation Center, Inc... Esta asignación incluye, entre otros, todos los derechos a cobrar los beneficios directamente de la compañía de seguros...</span>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Doctor's Lien / <span className="font-medium">Gravamen del Médico</span></h3>
                <p className="mt-2 bg-gray-50 border-l-4 border-blue-500 text-xs max-h-36 overflow-y-auto p-3">
                  I hereby authorize and direct you, my attorney, to pay directly to said doctor such sums as may be due...from any settlement, judgment, or verdict... I hereby give a lien on my case to the said center...<br /><br />
                  <span className="italic">Por la presente autorizo y le ordeno a usted, mi abogado, que pague directamente a dicho médico las sumas adeudadas... de cualquier acuerdo, sentencia o veredicto... Por la presente otorgo un gravamen sobre mi caso a dicho centro...</span>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Consent to Medical Care / <span className="font-medium">Consentimiento para Atención Médica</span></h3>
                <p className="mt-2 bg-gray-50 border-l-4 border-blue-500 text-xs max-h-36 overflow-y-auto p-3">
                  I authorize Silverman Chiropractic and Rehabilitation Center to determine what kinds of pathological procedures (tests) must be done... I also authorize my doctor to determine what kind of treatment is to be given...<br /><br />
                  <span className="italic">Autorizo al Silverman Chiropractic and Rehabilitation Center a determinar qué tipo de procedimientos patológicos (pruebas) deben realizarse... También autorizo a mi médico a determinar qué tipo de tratamiento se debe administrar...</span>
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Signature Section */}
          <div className="mt-8 pt-5 border-t">
            <div className="flex items-center mb-4">
              <Checkbox
                id="consent_acknowledgement"
                checked={formData.consentAcknowledgement}
                onCheckedChange={(checked) => handleInputChange("consentAcknowledgement", checked as boolean)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <Label htmlFor="consent_acknowledgement" className="ml-3 block text-sm text-gray-900">
                By checking this box, I confirm I have read and agree to all authorizations.
                <br />
                <span className="italic">Al marcar esta casilla, confirmo que he leído y acepto todas las autorizaciones.</span>
              </Label>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex-1 w-full">
                <Label htmlFor="signature" className="block text-sm font-medium text-gray-600">Patient Signature / <span className="italic">Firma del Paciente</span></Label>
                <Input
                  type="text"
                  id="signature"
                  value={formData.signature}
                  onChange={(e) => handleInputChange("signature", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Type your full name to sign"
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor="date" className="block text-sm font-medium text-gray-600">Date / <span className="italic">Fecha</span></Label>
                <Input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-10 text-right">
            <Button
              type="submit"
              className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Form / Enviar Formulario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicCashForm;