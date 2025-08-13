import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PublicCashForm = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cellPhone: "",
    email: "",
    dob: "",
    accidentDate: "",
    accidentType: "",
    accidentDescription: "",
    symptoms: {
      headache: false,
      neckPain: false,
      backPain: false,
      dizziness: false,
      tingling: false,
      numbness: false,
      legPain: false,
      irritability: false,
      sleepingProblems: false,
    },
    signature: "",
    date: "",
  });

  const handleInputChange = (field: string, value: string) => {
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
    
    if (!formData.signature) {
      toast.error("Please provide your signature");
      return;
    }

    toast.success("Form submitted successfully! We will contact you soon.");
    console.log("Cash Patient Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              Cash Patient Intake Form
            </CardTitle>
            <CardDescription className="text-lg">
              Formulario de Admisión para Paciente de Pago Directo
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
                    <Label htmlFor="city">City / <span className="italic">Ciudad</span></Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State / <span className="italic">Estado</span></Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Zip Code / <span className="italic">Código Postal</span></Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => handleInputChange("zip", e.target.value)}
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
                </CardContent>
              </Card>

              {/* Accident Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Accident Information / <span className="font-medium">INFORMACIÓN DEL ACCIDENTE</span>
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
                    <Label>Type of Accident / <span className="italic">Tipo de Accidente</span></Label>
                    <Select onValueChange={(value) => handleInputChange("accidentType", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select accident type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto / Auto</SelectItem>
                        <SelectItem value="work">Work / Trabajo</SelectItem>
                        <SelectItem value="fall">Fall / Caída</SelectItem>
                        <SelectItem value="other">Other / Otro</SelectItem>
                      </SelectContent>
                    </Select>
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
                </CardContent>
              </Card>

              {/* Symptoms Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Symptoms / <span className="font-medium">SÍNTOMAS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm font-medium mb-4 block">
                      Please check any symptoms you are now experiencing: / <span className="italic">Marque los síntomas que experimenta:</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[
                        { key: "headache", label: "Headache / Dolor de cabeza" },
                        { key: "neckPain", label: "Neck Pain / Dolor de cuello" },
                        { key: "backPain", label: "Back Pain / Dolor de Espalda" },
                        { key: "dizziness", label: "Dizziness / Mareo" },
                        { key: "tingling", label: "Tingling in arms/hands / Hormigueo" },
                        { key: "numbness", label: "Numbness in arms/hands / Entumecimiento" },
                        { key: "legPain", label: "Pain in legs/feet / Dolor en piernas/pies" },
                        { key: "irritability", label: "Irritability / Irritabilidad" },
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
                </CardContent>
              </Card>

              {/* Authorizations Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Authorizations & Consents / <span className="font-medium">AUTORIZACIONES</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Hardship Agreement / <span className="font-medium">Acuerdo de Dificultad Económica</span></h3>
                    <div className="bg-muted/50 border-l-4 border-primary p-4 rounded text-sm">
                      <p>
                        By my signature below I am requesting that my doctor reduce normal and customary fees charged so as to allow me to receive chiropractic care. My financial circumstances are such that if I were to pay customary fees charged, I would be forced (due to economic reasons) to not receive care. I recognize that any agreement made to assist me is purely confidential.
                      </p>
                      <br />
                      <p className="italic">
                        Con mi firma a continuación, solicito que mi médico reduzca las tarifas normales y acostumbradas para permitirme recibir atención quiropráctica. Mis circunstancias financieras son tales que, si tuviera que pagar las tarifas habituales, me vería obligado (por razones económicas) a no recibir atención. Reconozco que cualquier acuerdo para ayudarme es puramente confidencial.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Release and Assignment / <span className="font-medium">Divulgación y Asignación</span></h3>
                    <div className="bg-muted/50 border-l-4 border-primary p-4 rounded text-sm">
                      <p>
                        I authorize release of any information necessary to process my insurance claims and assign and request payment directly to my physicians.
                      </p>
                      <br />
                      <p className="italic">
                        Autorizo la divulgación de cualquier información necesaria para procesar mis reclamaciones de seguros y asigno y solicito que el pago se haga directamente a mis médicos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Signature Section */}
              <Card>
                <CardContent className="pt-6">
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

export default PublicCashForm;