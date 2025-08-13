import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PublicLOPForm = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    address: "",
    cellPhone: "",
    email: "",
    dob: "",
    ssn: "",
    accidentDate: "",
    accidentDescription: "",
    attorneyName: "",
    attorneyPhone: "",
    signature: "",
    date: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.signature) {
      toast.error("Please provide your signature");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'lop',
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
        cellPhone: "",
        email: "",
        dob: "",
        ssn: "",
        accidentDate: "",
        accidentDescription: "",
        attorneyName: "",
        attorneyPhone: "",
        signature: "",
        date: "",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              LOP Intake Form
            </CardTitle>
            <CardDescription className="text-lg">
              Formulario de Admisión (Carta de Protección)
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

              {/* Accident & Attorney Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Accident & Attorney / <span className="font-medium">ACCIDENTE Y ABOGADO</span>
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
                    <Label htmlFor="attorney-name">Attorney's Name / <span className="italic">Nombre del Abogado</span></Label>
                    <Input
                      id="attorney-name"
                      value={formData.attorneyName}
                      onChange={(e) => handleInputChange("attorneyName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attorney-phone">Attorney's Phone # / <span className="italic">Teléfono del Abogado</span></Label>
                    <Input
                      id="attorney-phone"
                      type="tel"
                      value={formData.attorneyPhone}
                      onChange={(e) => handleInputChange("attorneyPhone", e.target.value)}
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
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Doctor's Lien / <span className="font-medium">Gravamen del Médico</span></h3>
                    <div className="bg-muted/50 border-l-4 border-primary p-4 rounded text-sm">
                      <p>
                        I hereby authorize and direct you, my attorney, to pay directly to said doctor such sums as may be due and owing...for professional services rendered...and to withhold such sums from any settlement, judgment, or verdict as may be necessary to protect the said center. I hereby give a lien on my case to the said center against any and all proceeds from any settlement, judgment, or verdict... I fully understand that I am directly and fully responsible to SILVERMAN CHIROPRACTIC & REHABILITATION CENTER, INC for all professional bills submitted for services rendered to me.
                      </p>
                      <br />
                      <p className="italic">
                        Por la presente autorizo y le ordeno a usted, mi abogado, que pague directamente a dicho médico las sumas que se adeuden... por los servicios profesionales prestados... y que retenga dichas sumas de cualquier acuerdo, sentencia o veredicto según sea necesario para proteger a dicho centro. Por la presente, otorgo un gravamen sobre mi caso a dicho centro contra todos y cada uno de los ingresos de cualquier acuerdo, sentencia o veredicto... Entiendo perfectamente que soy directa y totalmente responsable ante SILVERMAN CHIROPRACTIC & REHABILITATION CENTER, INC por todas las facturas profesionales presentadas por los servicios que se me prestaron.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Consent to Medical Care / <span className="font-medium">Consentimiento para Atención Médica</span></h3>
                    <div className="bg-muted/50 border-l-4 border-primary p-4 rounded text-sm">
                      <p>
                        I authorize Silverman Chiropractic and Rehabilitation Center to determine what kinds of pathological procedures (tests) must be done... I also authorize my doctor to determine what kind of treatment is to be given, and to perform such procedures as he/she may deem necessary...to preserve my health.
                      </p>
                      <br />
                      <p className="italic">
                        Autorizo al Silverman Chiropractic and Rehabilitation Center a determinar qué tipo de procedimientos patológicos (pruebas) deben realizarse... También autorizo a mi médico a determinar qué tipo de tratamiento se debe administrar y a realizar los procedimientos que considere necesarios... para preservar mi salud.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Signature Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      By signing below, I acknowledge that I have read, understood, and agree to the terms outlined in this document, including the Doctor's Lien and Consent to Medical Care.
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      Al firmar a continuación, reconozco que he leído, entendido y acepto los términos descritos en este documento, incluidos el Gravamen del Médico y el Consentimiento para la Atención Médica.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="signature-lop">Patient Signature / <span className="italic">Firma del Paciente</span></Label>
                      <Input
                        id="signature-lop"
                        value={formData.signature}
                        onChange={(e) => handleInputChange("signature", e.target.value)}
                        placeholder="Type your full name to sign"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-lop">Date / <span className="italic">Fecha</span></Label>
                      <Input
                        id="date-lop"
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

export default PublicLOPForm;