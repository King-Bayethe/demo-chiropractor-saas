import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LeadIntakeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface LeadIntakeFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  language: string;
  leadSource: string;
  referredBy: string;
  affiliateOffice: string;
  insuranceName: string;
  biLimit: string;
  caseType: string;
  other: string;
  // Medical History
  currentMedications: string;
  allergies: string;
  pastInjuries: string;
  previousSurgeries: string;
  chronicConditions: string;
  otherMedicalHistory: string;
}

export function LeadIntakeForm({ onSubmit, onCancel }: LeadIntakeFormProps) {
  const isMobile = useIsMobile();
  const form = useForm<LeadIntakeFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      language: "",
      leadSource: "",
      referredBy: "",
      affiliateOffice: "",
      insuranceName: "",
      biLimit: "",
      caseType: "",
      other: "",
      currentMedications: "",
      allergies: "",
      pastInjuries: "",
      previousSurgeries: "",
      chronicConditions: "",
      otherMedicalHistory: "",
    },
  });

  const referralSources = [
    "Primary Care Physician",
    "Specialist Referral", 
    "Patient Referral",
    "Insurance Network",
    "Online Search",
    "Social Media",
    "Walk-in",
    "Emergency Department",
    "Community Health Center",
    "Employer Referral",
    "Family/Friend Referral",
    "Previous Patient",
    "Healthcare Professional",
    "Other"
  ].sort();

  const affiliateOffices = [
    "Avalon Medical Center ( Ft Lauderdale )", "Broward Wellness ( Coral Springs )",
    "CCOF Aventura ( Miami Dade )", "CCOF Boca Raton ( Palm Beach )",
    "CCOF Boynton Beach ( Palm Beach )", "CCOF Coral Springs ( Broward County )", 
    "CCOF FT. Lauderdale ( Broward County )", "CCOF Lake Worth ( Palm Beach )",
    "CCOF Plantation ( Broward County )", "CCOF Pompano ( Broward County )",
    "CCOF Weston ( Broward County )", "Dr. Gletch ( Cape Coral )",
    "Dr. Gletch ( Fort Myers )", "Dynamic Healthcare ( Ft, Lauderdale )",
    "Hollywood Medical Rehab ( Hollywood )", "Kissimme Dr. Jordan Wolf",
    "Orlando Dr Gary Boraks", "Pacific Care Rehab ( Miami Dade )",
    "PT and Pain Management ( Pinecrest )", "Silverman Hollywood", "Silverman Miramar"
  ].sort();

  const handleFormSubmit = (data: LeadIntakeFormData) => {
    const formData = {
      ...data,
      patientName: `${data.firstName} ${data.lastName}`.trim(),
      patientEmail: data.email,
      patientPhone: data.phone,
    };
    
    onSubmit(formData);
    form.reset();
  };

  return (
    <Card className={cn("w-full mx-auto",
      isMobile ? "max-w-full" : "max-w-4xl"
    )}>
      <CardHeader className={cn(isMobile ? "p-4" : "")}>
        <CardTitle className={cn("font-bold",
          isMobile ? "text-lg" : "text-2xl"
        )}>Lead Intake Form</CardTitle>
      </CardHeader>
      <CardContent className={cn(isMobile ? "p-4" : "")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className={cn("gap-6",
              isMobile ? "grid grid-cols-1 space-y-4" : "grid grid-cols-1 md:grid-cols-2"
            )}>
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(isMobile ? "text-sm" : "")}>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="First Name" 
                        {...field} 
                        className={cn(isMobile ? "h-10 text-sm" : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(isMobile ? "text-sm" : "")}>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Last Name" 
                        {...field} 
                        className={cn(isMobile ? "h-10 text-sm" : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(isMobile ? "text-sm" : "")}>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="Phone" 
                        {...field} 
                        className={cn(isMobile ? "h-10 text-sm" : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(isMobile ? "text-sm" : "")}>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Email" 
                        {...field} 
                        className={cn(isMobile ? "h-10 text-sm" : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language / Idioma</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border/50">
                          <SelectValue placeholder="Select language / Seleccionar idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lead Source */}
              <FormField
                control={form.control}
                name="leadSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="TV">TV</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Referral Source */}
              <FormField
                control={form.control}
                name="referredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select referral source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border shadow-lg z-50 max-h-60 overflow-y-auto">
                        {referralSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Affiliate Office */}
              <FormField
                control={form.control}
                name="affiliateOffice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate Office</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select affiliate office" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {affiliateOffices.map((office) => (
                          <SelectItem key={office} value={office}>
                            {office}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Insurance Name */}
              <FormField
                control={form.control}
                name="insuranceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Insurance Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BI Limit */}
              <FormField
                control={form.control}
                name="biLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BI Limit</FormLabel>
                    <FormControl>
                      <Input placeholder="BI Limit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Case Type - Full Width */}
            <FormField
              control={form.control}
              name="caseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Private Insurance">Private Insurance</SelectItem>
                      <SelectItem value="Medicare">Medicare/Medicaid</SelectItem>
                      <SelectItem value="Self-Pay">Self-Pay (Cash)</SelectItem>
                      <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                      <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
                      <SelectItem value="PIP">Auto Insurance (PIP)</SelectItem>
                      <SelectItem value="Acute Care">Acute Care</SelectItem>
                      <SelectItem value="Chronic Care">Chronic Care</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical History Section */}
            <div className={cn("space-y-6 border-t border-border",
              isMobile ? "pt-4" : "pt-6"
            )}>
              <h3 className={cn("font-semibold",
                isMobile ? "text-base" : "text-lg"
              )}>Medical History / Historial Médico</h3>
              
              <div className={cn("gap-6",
                isMobile ? "grid grid-cols-1 space-y-4" : "grid grid-cols-1 md:grid-cols-2"
              )}>
                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(isMobile ? "text-sm" : "")}>
                      Current Medications / Medicamentos Actuales
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List all current medications..."
                        className={cn("min-h-[100px]",
                          isMobile ? "text-sm" : ""
                        )}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies / Alergias</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List all known allergies..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pastInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Injuries / Lesiones Previas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any previous injuries..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousSurgeries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Surgeries / Cirugías Previas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List all previous surgeries..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chronicConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronic Conditions / Condiciones Crónicas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List any chronic medical conditions..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherMedicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Medical History / Otro Historial Médico</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any other relevant medical history..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Other - Full Width */}
            <FormField
              control={form.control}
              name="other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional information..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className={cn("gap-4 pt-4",
              isMobile ? "flex flex-col space-y-2" : "flex"
            )}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className={cn(isMobile ? "w-full" : "flex-1")}
                size={isMobile ? "default" : "default"}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={cn("bg-primary hover:bg-primary/90",
                  isMobile ? "w-full" : "flex-1"
                )}
                size={isMobile ? "default" : "default"}
              >
                {isMobile ? "Submit" : "Submit Lead Intake Form"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
