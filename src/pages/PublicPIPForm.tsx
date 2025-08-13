import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PublicPIPForm = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    address: "",
    cellPhone: "",
    email: "",
    dob: "",
    ssn: "",
    accidentDate: "",
    accidentTime: "",
    accidentDescription: "",
    personType: "",
    airbags: "",
    insuranceCo: "",
    policyNumber: "",
    claimNumber: "",
    attorneyName: "",
    vehicleOwner: "",
    symptoms: {
      headache: false,
      neckPain: false,
      backPain: false,
      dizziness: false,
      tingling: false,
      numbness: false,
      jawPain: false,
      sleepingProblems: false,
    },
    medicalHistory: "",
    consentAcknowledgement: false,
    signature: "",
    date: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentAcknowledgement) {
      toast.error("Please acknowledge consent to all authorizations");
      return;
    }

    if (!formData.signature) {
      toast.error("Please provide your signature");
      return;
    }

    toast.success("Form submitted successfully! We will contact you soon.");
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              Comprehensive PIP Patient Intake Form
            </CardTitle>
            <CardDescription className="text-lg">
              Formulario de Admisión de Paciente de PIP (Completo)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    General Information / <span className="font-medium">INFORMACIÓN GENERAL</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="last-name">Last Name / <span className="italic">Apellido</span></Label>
                    <Input
                      id="last-name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="first-name">First Name / <span className="italic">Nombre</span></Label>
                    <Input
                      id="first-name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address / <span className="italic">Dirección</span></Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cell-phone">Cell Phone / <span className="italic">Teléfono (Celular)</span></Label>
                    <Input
                      id="cell-phone"
                      type="tel"
                      value={formData.cellPhone}
                      onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email / <span className="italic">Correo Electrónico</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth / <span className="italic">Fecha de Nacimiento</span></Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ssn">Social Security # / <span className="italic">Núm. Seguro Social</span></Label>
                    <Input
                      id="ssn"
                      value={formData.ssn}
                      onChange={(e) => handleInputChange("ssn", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Accident Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Detailed Accident Information / <span className="font-medium">Información Detallada del Accidente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accident-date">Date of Accident / <span className="italic">Fecha del Accidente</span></Label>
                    <Input
                      id="accident-date"
                      type="date"
                      value={formData.accidentDate}
                      onChange={(e) => handleInputChange("accidentDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accident-time">Time of Accident / <span className="italic">Hora del Accidente</span></Label>
                    <Input
                      id="accident-time"
                      type="time"
                      value={formData.accidentTime}
                      onChange={(e) => handleInputChange("accidentTime", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="accident-description">Please describe the accident / <span className="italic">Por favor describe el accidente</span></Label>
                    <Textarea
                      id="accident-description"
                      value={formData.accidentDescription}
                      onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Were you the: / <span className="italic">Usted era:</span></Label>
                    <Select onValueChange={(value) => handleInputChange("personType", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driver">Driver / Chofer</SelectItem>
                        <SelectItem value="passenger">Passenger / Pasajero</SelectItem>
                        <SelectItem value="pedestrian">Pedestrian / Peatón</SelectItem>
                        <SelectItem value="cyclist">Cyclist / Ciclista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Did airbags deploy? / <span className="italic">¿Se activaron las bolsas de aire?</span></Label>
                    <Select onValueChange={(value) => handleInputChange("airbags", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes / Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Verification Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Insurance Verification / <span className="font-medium">VERIFICACIÓN DE SEGURO</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="insurance-co">Auto Insurance Co. / <span className="italic">Compañía de Seguro de Auto</span></Label>
                    <Input
                      id="insurance-co"
                      value={formData.insuranceCo}
                      onChange={(e) => handleInputChange("insuranceCo", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="policy-number">Policy # / <span className="italic">Número de Póliza</span></Label>
                    <Input
                      id="policy-number"
                      value={formData.policyNumber}
                      onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="claim-number">Claim # / <span className="italic">Núm. de Reclamo</span></Label>
                    <Input
                      id="claim-number"
                      value={formData.claimNumber}
                      onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attorney-name">Attorney's Name / <span className="italic">Nombre del Abogado</span></Label>
                    <Input
                      id="attorney-name"
                      value={formData.attorneyName}
                      onChange={(e) => handleInputChange("attorneyName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="vehicle-owner">Vehicle Owner / <span className="italic">Dueño del Vehículo</span></Label>
                    <Input
                      id="vehicle-owner"
                      value={formData.vehicleOwner}
                      onChange={(e) => handleInputChange("vehicleOwner", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Symptoms & Medical History Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Symptoms & Medical History / <span className="font-medium">SÍNTOMAS E HISTORIAL MÉDICO</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm font-medium mb-4 block">
                      Please check any symptoms you are now experiencing: / <span className="italic">Marque los síntomas que experimenta:</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      {[
                        { key: "headache", label: "Headache / Dolor de cabeza" },
                        { key: "neckPain", label: "Neck Pain / Dolor de cuello" },
                        { key: "backPain", label: "Back Pain / Dolor de Espalda" },
                        { key: "dizziness", label: "Dizziness / Mareo" },
                        { key: "tingling", label: "Tingling / Hormigueo" },
                        { key: "numbness", label: "Numbness / Entumecimiento" },
                        { key: "jawPain", label: "Jaw Pain / Dolor de Mandíbula" },
                        { key: "sleepingProblems", label: "Sleeping Problems / Problemas para dormir" },
                      ].map((symptom) => (
                        <div key={symptom.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom.key}
                            checked={formData.symptoms[symptom.key as keyof typeof formData.symptoms]}
                            onCheckedChange={(checked) => handleSymptomChange(symptom.key, checked as boolean)}
                          />
                          <Label htmlFor={symptom.key} className="text-sm leading-tight">
                            {symptom.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="medical-history">
                      Please list any major illnesses, surgeries, or previous accidents. / <span className="italic">Liste enfermedades, cirugías o accidentes previos.</span>
                    </Label>
                    <Textarea
                      id="medical-history"
                      value={formData.medicalHistory}
                      onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Authorizations & Consents Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Authorizations & Consents / <span className="font-medium">AUTORIZACIONES</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      title: "Assignment of Benefits / Asignación de Beneficios",
                      content: "I hereby assign the rights and benefits of insurance to the applicable personal injury protection...to Silverman Chiropractic & Rehabilitation Center, Inc... This assignment includes but is not limited to all rights to collect benefits directly from the insurance company...\n\nYo, por el presente, asigno los derechos y beneficios del seguro de protección contra lesiones personales aplicable... a Silverman Chiropractic & Rehabilitation Center, Inc... Esta asignación incluye, entre otros, todos los derechos a cobrar los beneficios directamente de la compañía de seguros..."
                    },
                    {
                      title: "Doctor's Lien / Gravamen del Médico",
                      content: "I hereby authorize and direct you, my attorney, to pay directly to said doctor such sums as may be due...from any settlement, judgment, or verdict... I hereby give a lien on my case to the said center...\n\nPor la presente autorizo y le ordeno a usted, mi abogado, que pague directamente a dicho médico las sumas adeudadas... de cualquier acuerdo, sentencia o veredicto... Por la presente otorgo un gravamen sobre mi caso a dicho centro..."
                    },
                    {
                      title: "Consent to Medical Care / Consentimiento para Atención Médica",
                      content: "I authorize Silverman Chiropractic and Rehabilitation Center to determine what kinds of pathological procedures (tests) must be done... I also authorize my doctor to determine what kind of treatment is to be given...\n\nAutorizo al Silverman Chiropractic and Rehabilitation Center a determinar qué tipo de procedimientos patológicos (pruebas) deben realizarse... También autorizo a mi médico a determinar qué tipo de tratamiento se debe administrar..."
                    },
                    {
                      title: "Radiology Warning (Female Patients) / Advertencia de Radiología (Pacientes Femeninas)",
                      content: "I certify to the best of my knowledge that I AM NOT PREGNANT and that the doctor(s) or the facility have my permission to perform diagnostic x-ray examination.\n\nCertifico, a mi leal saber y entender, que NO ESTOY EMBARAZADA y que el/los médico(s) o el centro tienen mi permiso para realizar un examen de rayos X de diagnóstico."
                    },
                    {
                      title: "HIPAA & Privacy / HIPAA y Privacidad",
                      content: "I acknowledge that I have been provided with the \"Notice Of Privacy Practices\".\n\nConfirmo que se me ha proveído la \"Noticia De las Practicas de Privacidad\"."
                    }
                  ].map((section, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                      <div className="bg-muted/50 border-l-4 border-primary p-4 rounded text-sm max-h-40 overflow-y-auto">
                        {section.content.split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className={pIndex > 0 ? "mt-2 italic" : ""}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Signature Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consent"
                        checked={formData.consentAcknowledgement}
                        onCheckedChange={(checked) => handleInputChange("consentAcknowledgement", checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="consent" className="text-sm leading-relaxed">
                        By checking this box, I confirm I have read and agree to all authorizations.
                        <br />
                        <span className="italic">Al marcar esta casilla, confirmo que he leído y acepto todas las autorizaciones.</span>
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="signature">Patient Signature / <span className="italic">Firma del Paciente</span></Label>
                        <Input
                          id="signature"
                          value={formData.signature}
                          onChange={(e) => handleInputChange("signature", e.target.value)}
                          placeholder="Type your full name to sign"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">Date / <span className="italic">Fecha</span></Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" size="lg" className="px-8">
                  Submit Form / Enviar Formulario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicPIPForm;