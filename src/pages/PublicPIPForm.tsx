import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Upload, IdCard, CreditCard } from "lucide-react";

const PublicPIPForm = () => {
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
    driversLicense: "",
    driversLicenseState: "",
    emergencyContact: "",
    emergencyPhone: "",
    sex: "",
    maritalStatus: "",
    dob: "",
    ssn: "",
    age: "",
    
    // Employment & Student Status
    employmentStatus: "",
    employerName: "",
    employerAddress: "",
    studentStatus: "",
    
    // Insurance & Attorney
    autoInsuranceCo: "",
    policyNumber: "",
    claimNumber: "",
    adjusterName: "",
    healthInsurance: "",
    groupNumber: "",
    attorneyName: "",
    attorneyPhone: "",
    
    // Auto Accident Details
    accidentDate: "",
    accidentTime: "",
    accidentDescription: "",
    personType: "",
    weather: "",
    streetSurface: "",
    bodyPart: "",
    whatItHit: "",
    
    // Review of Systems
    systems: {
      fever: false,
      chills: false,
      fatigue: false,
      blurredVision: false,
      doubleVision: false,
      eyePain: false,
      ringingEars: false,
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

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [documentType]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `form-documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      setUploadedFiles(prev => ({ ...prev, [documentType]: fileName }));
      toast.success(`${documentType} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${documentType}`);
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
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
      toast.error("Please acknowledge consent to all authorizations");
      return;
    }

    if (!formData.signature) {
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
      
      // Reset form
      setFormData({
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
        autoInsuranceCo: "",
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
        personType: "",
        weather: "",
        streetSurface: "",
        bodyPart: "",
        whatItHit: "",
        systems: {
          fever: false,
          chills: false,
          fatigue: false,
          blurredVision: false,
          doubleVision: false,
          eyePain: false,
          ringingEars: false,
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
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-background p-6 sm:p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Comprehensive Patient Intake Form</h1>
          <p className="text-lg text-muted-foreground mt-2">Formulario Completo de Admisión de Paciente</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information Section */}
          <details className="border border-border rounded-lg" open>
            <summary className="p-4 flex justify-between items-center bg-muted/50 rounded-t-lg cursor-pointer">
              <h2 className="text-xl font-semibold text-primary">1. General Information / <span className="font-medium">INFORMACIÓN GENERAL</span></h2>
              <ChevronRight className="h-5 w-5 text-primary transition-transform" />
            </summary>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  placeholder="Last Name / Apellido" 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full"
                />
                <Input 
                  placeholder="First Name / Nombre" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full"
                />
                <div className="md:col-span-2">
                  <Input 
                    placeholder="Address / Dirección" 
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full"
                  />
                </div>
                <Input 
                  placeholder="City / Ciudad" 
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full"
                />
                <Input 
                  placeholder="State / Estado" 
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full"
                />
                <Input 
                  placeholder="Zip / Código Postal" 
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  className="w-full"
                />
                <Input 
                  type="tel" 
                  placeholder="Home Phone / Teléfono (Casa)" 
                  value={formData.homePhone}
                  onChange={(e) => handleInputChange("homePhone", e.target.value)}
                  className="w-full"
                />
                <Input 
                  type="tel" 
                  placeholder="Work Phone / Teléfono (Trabajo)" 
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange("workPhone", e.target.value)}
                  className="w-full"
                />
                <Input 
                  type="tel" 
                  placeholder="Cell Phone / Teléfono (Celular)" 
                  value={formData.cellPhone}
                  onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                  className="w-full"
                />
                <Input 
                  type="email" 
                  placeholder="Email / Correo Electrónico" 
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="md:col-span-2 w-full"
                />
                <Input 
                  placeholder="Driver's License # / Núm. de Licencia" 
                  value={formData.driversLicense}
                  onChange={(e) => handleInputChange("driversLicense", e.target.value)}
                  className="w-full"
                />
                <Input 
                  placeholder="Driver's License State / Estado de Licencia" 
                  value={formData.driversLicenseState}
                  onChange={(e) => handleInputChange("driversLicenseState", e.target.value)}
                  className="w-full"
                />
                
                {/* ID Upload Buttons */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Driver's License Front / Frente de Licencia</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading['id-front']}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'id-front');
                          };
                          input.click();
                        }}
                      >
                        <IdCard className="h-4 w-4" />
                        {uploading['id-front'] ? 'Uploading...' : 'Upload ID Front'}
                      </Button>
                      {uploadedFiles['id-front'] && (
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Driver's License Back / Reverso de Licencia</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading['id-back']}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'id-back');
                          };
                          input.click();
                        }}
                      >
                        <IdCard className="h-4 w-4" />
                        {uploading['id-back'] ? 'Uploading...' : 'Upload ID Back'}
                      </Button>
                      {uploadedFiles['id-back'] && (
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Emergency Contact / Contacto de Emergencia" 
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="w-full"
                />
                <Input 
                  type="tel" 
                  placeholder="Emergency Phone / Teléfono de Emergencia" 
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  className="w-full"
                />
                <Select onValueChange={(value) => handleInputChange("sex", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sex / Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male / Masculino</SelectItem>
                    <SelectItem value="female">Female / Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Marital Status / Estado Civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single / Soltero(a)</SelectItem>
                    <SelectItem value="married">Married / Casado(a)</SelectItem>
                    <SelectItem value="divorced">Divorced / Divorciado(a)</SelectItem>
                    <SelectItem value="widowed">Widowed / Viudo(a)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Date of Birth / Fecha de Nacimiento</Label>
                  <Input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
                <Input 
                  placeholder="Social Security # / Núm. Seguro Social" 
                  value={formData.ssn}
                  onChange={(e) => handleInputChange("ssn", e.target.value)}
                  className="w-full"
                />
                <Input 
                  type="number" 
                  placeholder="Age / Edad" 
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </details>

          {/* Employment & Student Status */}
          <details className="border border-border rounded-lg">
            <summary className="p-4 flex justify-between items-center bg-muted/50 rounded-t-lg cursor-pointer">
              <h2 className="text-xl font-semibold text-primary">2. Employment & Student Status / <span className="font-medium">ESTADO LABORAL Y ESTUDIANTIL</span></h2>
              <ChevronRight className="h-5 w-5 text-primary transition-transform" />
            </summary>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select onValueChange={(value) => handleInputChange("employmentStatus", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Employment Status / Estado Laboral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full Time / Tiempo Completo</SelectItem>
                  <SelectItem value="parttime">Part Time / Tiempo Parcial</SelectItem>
                  <SelectItem value="retired">Retired / Retirado</SelectItem>
                  <SelectItem value="unemployed">Not Employed / Desempleado</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Employer Name / Nombre del Empleador" 
                value={formData.employerName}
                onChange={(e) => handleInputChange("employerName", e.target.value)}
                className="w-full"
              />
              <div className="md:col-span-2">
                <Input 
                  placeholder="Employer Address / Dirección del Empleador" 
                  value={formData.employerAddress}
                  onChange={(e) => handleInputChange("employerAddress", e.target.value)}
                  className="w-full"
                />
              </div>
              <Select onValueChange={(value) => handleInputChange("studentStatus", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Student Status / Estado Estudiantil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full Time / Tiempo Completo</SelectItem>
                  <SelectItem value="parttime">Part Time / Tiempo Parcial</SelectItem>
                  <SelectItem value="nonstudent">Non Student / No Estudia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </details>

          {/* Insurance & Attorney Information */}
          <details className="border border-border rounded-lg">
            <summary className="p-4 flex justify-between items-center bg-muted/50 rounded-t-lg cursor-pointer">
              <h2 className="text-xl font-semibold text-primary">3. Insurance & Attorney / <span className="font-medium">SEGURO Y ABOGADO</span></h2>
              <ChevronRight className="h-5 w-5 text-primary transition-transform" />
            </summary>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                placeholder="Auto Insurance Company / Cía. de Seguro de Auto" 
                value={formData.autoInsuranceCo}
                onChange={(e) => handleInputChange("autoInsuranceCo", e.target.value)}
                className="w-full"
              />
              <Input 
                placeholder="Policy # / Núm. de Póliza" 
                value={formData.policyNumber}
                onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                className="w-full"
              />
              <Input 
                placeholder="Claim # / Núm. de Reclamo" 
                value={formData.claimNumber}
                onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                className="w-full"
              />
              <Input 
                placeholder="Adjuster's Name / Nombre del Ajustador" 
                value={formData.adjusterName}
                onChange={(e) => handleInputChange("adjusterName", e.target.value)}
                className="w-full"
              />
              <Input 
                placeholder="Health Insurance / Seguro Médico" 
                value={formData.healthInsurance}
                onChange={(e) => handleInputChange("healthInsurance", e.target.value)}
                className="w-full"
              />
              <Input 
                placeholder="Group # / Núm. de Grupo" 
                value={formData.groupNumber}
                onChange={(e) => handleInputChange("groupNumber", e.target.value)}
                className="w-full"
              />
              <Input 
                placeholder="Attorney's Name / Nombre del Abogado" 
                value={formData.attorneyName}
                onChange={(e) => handleInputChange("attorneyName", e.target.value)}
                className="w-full"
              />
                <Input 
                  type="tel" 
                  placeholder="Attorney's Phone / Teléfono del Abogado" 
                  value={formData.attorneyPhone}
                  onChange={(e) => handleInputChange("attorneyPhone", e.target.value)}
                  className="w-full"
                />
                
                {/* Insurance Upload Buttons */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Insurance Card Front / Frente de Tarjeta de Seguro</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading['insurance-front']}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'insurance-front');
                          };
                          input.click();
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                        {uploading['insurance-front'] ? 'Uploading...' : 'Upload Insurance Front'}
                      </Button>
                      {uploadedFiles['insurance-front'] && (
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Insurance Card Back / Reverso de Tarjeta de Seguro</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading['insurance-back']}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'insurance-back');
                          };
                          input.click();
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                        {uploading['insurance-back'] ? 'Uploading...' : 'Upload Insurance Back'}
                      </Button>
                      {uploadedFiles['insurance-back'] && (
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </details>

          {/* Auto Accident Details */}
          <details className="border border-border rounded-lg">
            <summary className="p-4 flex justify-between items-center bg-muted/50 rounded-t-lg cursor-pointer">
              <h2 className="text-xl font-semibold text-primary">4. Auto Accident Details / <span className="font-medium">DETALLES DEL ACCIDENTE</span></h2>
              <ChevronRight className="h-5 w-5 text-primary transition-transform" />
            </summary>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground">Date of Accident / Fecha del Accidente</Label>
                  <Input 
                    type="date" 
                    value={formData.accidentDate}
                    onChange={(e) => handleInputChange("accidentDate", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Time of Accident / Hora del Accidente</Label>
                  <Input 
                    type="time" 
                    value={formData.accidentTime}
                    onChange={(e) => handleInputChange("accidentTime", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea 
                    placeholder="Describe how the accident took place / Describe cómo ocurrió el accidente" 
                    rows={3} 
                    value={formData.accidentDescription}
                    onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={(value) => handleInputChange("personType", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Were you the... / Usted era..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver / Chofer</SelectItem>
                    <SelectItem value="passenger">Passenger / Pasajero</SelectItem>
                    <SelectItem value="pedestrian">Pedestrian / Peatón</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("weather", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Weather / Clima" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny / Soleado</SelectItem>
                    <SelectItem value="rainy">Rainy / Lluvioso</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleInputChange("streetSurface", value)}>
                  <SelectTrigger className="w-full">
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
                <Label className="text-muted-foreground">Did your body hit anything inside the car? / ¿Su cuerpo golpeó algo dentro del carro?</Label>
                <div className="mt-2 flex gap-4">
                  <Input 
                    placeholder="Body Part / Parte del Cuerpo" 
                    value={formData.bodyPart}
                    onChange={(e) => handleInputChange("bodyPart", e.target.value)}
                    className="w-1/2"
                  />
                  <Input 
                    placeholder="What it hit / Qué golpeó" 
                    value={formData.whatItHit}
                    onChange={(e) => handleInputChange("whatItHit", e.target.value)}
                    className="w-1/2"
                  />
                </div>
              </div>
            </div>
          </details>
          
          {/* Review of Systems */}
          <details className="border border-border rounded-lg">
            <summary className="p-4 flex justify-between items-center bg-muted/50 rounded-t-lg cursor-pointer">
              <h2 className="text-xl font-semibold text-primary">5. Review of Systems / <span className="font-medium">REVISIÓN DE SISTEMAS</span></h2>
              <ChevronRight className="h-5 w-5 text-primary transition-transform" />
            </summary>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Do you currently have any of the following problems? / <span className="italic">¿Tiene actualmente alguno de los siguientes problemas?</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">General</h4>
                  <div className="space-y-2">
                    {[
                      { key: "fever", label: "Fever / Fiebre" },
                      { key: "chills", label: "Chills / Escalofríos" },
                      { key: "fatigue", label: "Fatigue / Fatiga" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <Checkbox 
                          checked={formData.systems[item.key as keyof typeof formData.systems]}
                          onCheckedChange={(checked) => handleSystemChange(item.key, checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label className="ml-2 text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Eyes / Ojos</h4>
                  <div className="space-y-2">
                    {[
                      { key: "blurredVision", label: "Blurred vision / Visión borrosa" },
                      { key: "doubleVision", label: "Double vision / Visión doble" },
                      { key: "eyePain", label: "Eye pain / Dolor de ojos" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <Checkbox 
                          checked={formData.systems[item.key as keyof typeof formData.systems]}
                          onCheckedChange={(checked) => handleSystemChange(item.key, checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label className="ml-2 text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">ENT / Oído, Nariz, Garganta</h4>
                  <div className="space-y-2">
                    {[
                      { key: "ringingEars", label: "Ringing in ears / Zumbido" },
                      { key: "nasalCongestion", label: "Nasal congestion / Congestión" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <Checkbox 
                          checked={formData.systems[item.key as keyof typeof formData.systems]}
                          onCheckedChange={(checked) => handleSystemChange(item.key, checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label className="ml-2 text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cardiovascular</h4>
                  <div className="space-y-2">
                    {[
                      { key: "chestPains", label: "Chest pains / Dolor de pecho" },
                      { key: "palpitations", label: "Palpitations / Palpitaciones" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <Checkbox 
                          checked={formData.systems[item.key as keyof typeof formData.systems]}
                          onCheckedChange={(checked) => handleSystemChange(item.key, checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label className="ml-2 text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Gastrointestinal</h4>
                  <div className="space-y-2">
                    {[
                      { key: "nausea", label: "Nausea / Náuseas" },
                      { key: "abdominalPain", label: "Abdominal pain / Dolor abdominal" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <Checkbox 
                          checked={formData.systems[item.key as keyof typeof formData.systems]}
                          onCheckedChange={(checked) => handleSystemChange(item.key, checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label className="ml-2 text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Neurologic / Neurológico</h4>
                  <div className="space-y-2">
                    {[
                      { key: "weakness", label: "Weakness / Debilidad" },
                      { key: "numbness", label: "Numbness / Entumecimiento" },
                      { key: "dizziness", label: "Dizziness / Mareo" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <Checkbox 
                          checked={formData.systems[item.key as keyof typeof formData.systems]}
                          onCheckedChange={(checked) => handleSystemChange(item.key, checked as boolean)}
                          className="h-4 w-4"
                        />
                        <Label className="ml-2 text-sm">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Authorizations & Consents */}
          <details className="border border-border rounded-lg" open>
            <summary className="p-4 flex justify-between items-center bg-muted/50 rounded-t-lg cursor-pointer">
              <h2 className="text-xl font-semibold text-primary">6. Authorizations & Consents / <span className="font-medium">AUTORIZACIONES</span></h2>
              <ChevronRight className="h-5 w-5 text-primary transition-transform" />
            </summary>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg">Assignment of Benefits / <span className="font-medium">Asignación de Beneficios</span></h3>
                <p className="mt-2 bg-muted/50 border-l-4 border-primary text-sm max-h-40 overflow-y-auto p-3 rounded">
                  I hereby assign the rights and benefits of insurance to the applicable personal injury protection...to Silverman Chiropractic & Rehabilitation Center, Inc... This assignment includes but is not limited to all rights to collect benefits directly from the insurance company...
                  <br /><br />
                  <span className="italic">Yo, por el presente, asigno los derechos y beneficios del seguro de protección contra lesiones personales aplicable... a Silverman Chiropractic & Rehabilitation Center, Inc... Esta asignación incluye, entre otros, todos los derechos a cobrar los beneficios directamente de la compañía de seguros...</span>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Doctor's Lien / <span className="font-medium">Gravamen del Médico</span></h3>
                <p className="mt-2 bg-muted/50 border-l-4 border-primary text-sm max-h-40 overflow-y-auto p-3 rounded">
                  I hereby authorize and direct you, my attorney, to pay directly to said doctor such sums as may be due...from any settlement, judgment, or verdict... I hereby give a lien on my case to the said center...
                  <br /><br />
                  <span className="italic">Por la presente autorizo y le ordeno a usted, mi abogado, que pague directamente a dicho médico las sumas adeudadas... de cualquier acuerdo, sentencia o veredicto... Por la presente otorgo un gravamen sobre mi caso a dicho centro...</span>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Consent to Medical Care / <span className="font-medium">Consentimiento para Atención Médica</span></h3>
                <p className="mt-2 bg-muted/50 border-l-4 border-primary text-sm max-h-40 overflow-y-auto p-3 rounded">
                  I authorize Silverman Chiropractic and Rehabilitation Center to determine what kinds of pathological procedures (tests) must be done... I also authorize my doctor to determine what kind of treatment is to be given...
                  <br /><br />
                  <span className="italic">Autorizo al Silverman Chiropractic and Rehabilitation Center a determinar qué tipo de procedimientos patológicos (pruebas) deben realizarse... También autorizo a mi médico a determinar qué tipo de tratamiento se debe administrar...</span>
                </p>
              </div>
            </div>
          </details>

          {/* Signature Section */}
          <div className="mt-8 pt-5 border-t border-border">
            <div className="flex items-center mb-4">
              <Checkbox 
                checked={formData.consentAcknowledgement}
                onCheckedChange={(checked) => handleInputChange("consentAcknowledgement", checked)}
                className="h-4 w-4"
              />
              <Label className="ml-3 block text-sm">
                By checking this box, I confirm I have read and agree to all authorizations.
                <br />
                <span className="italic">Al marcar esta casilla, confirmo que he leído y acepto todas las autorizaciones.</span>
              </Label>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex-1 w-full">
                <Label className="block text-sm font-medium text-muted-foreground">Patient Signature / <span className="italic">Firma del Paciente</span></Label>
                <Input 
                  placeholder="Type your full name to sign"
                  value={formData.signature}
                  onChange={(e) => handleInputChange("signature", e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <Label className="block text-sm font-medium text-muted-foreground">Date / <span className="italic">Fecha</span></Label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-10 text-right">
            <Button type="submit" className="inline-flex justify-center py-3 px-8 text-base font-medium">
              Submit Form / Enviar Formulario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicPIPForm;