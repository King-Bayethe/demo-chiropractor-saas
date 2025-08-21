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
}

export function LeadIntakeForm({ onSubmit, onCancel }: LeadIntakeFormProps) {
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
    },
  });

  const attorneys = [
    "Scott Bennett", "John Leon", "Marcelo Saenz", "Adrian Reyes", "Jimmy De la Espriella",
    "Fernando Pomares", "Emilio Pastor", "Gallardo Jimenez & Hart", "Theodore Enfield",
    "Kirshner, Groff & Diaz", "Gilbert Lacayo Law Firm", "Charles Mustell", "Robert Rubenstein",
    "Ralph Lopez", "Jany Martinez-Ward", "Goldberg & Rosen", "Brianna Wolfson",
    "Robert W. Rodriguez", "Theodore A. Swaebe", "Hector Piedra", "Jay London", "Victor Gorn",
    "Katiana Fleites", "Morgan & Morgan", "Jose E. Gallego", "Gal Sinclair", "Nuel & Polsky",
    "Gimenez & Carrillo", "Lawlor & Zigler", "Edward J. Abramson", "Todd D. Rosen",
    "J. Erick Santana", "Daniel Sagie", "People's Law Center", "Scott Jay Senft",
    "Florida Advocates", "Hess & Llarena", "Hector Garcia", "Donald M. Kreke",
    "Steven E. Slootsky", "Jerome Pivnik", "David A. Helfand", "Peter De Primo",
    "Andrew Kleid", "Carl Palomino", "Dos Santos & Shirazi", "Paul Schrier",
    "Frank Gonzalez", "Luis A. Torrens", "Gross & Telisman", "The Berman Group",
    "The Soffer Firm, PLLC", "Klemick & Gampel", "Friedman, Rodman & Frank",
    "Tacher & Profeta", "Bernstein & Maryanoff", "Anidjar & Levine", "Pinto & Pelosi",
    "The Funes Law Firm", "Andres Berrio", "Elio Vazquez", "Gallardo Law Firm",
    "Betsy Alvarez-Zane", "Jose L. Lago", "Canor Pato Law Firm", "Feingold & Posner",
    "Daniel Izquierdo", "Ariel Furst", "David Farber", "Engelbert H. Pacheco",
    "Nathan J. Avrunin", "Aric N. Williams", "Ruben Spinrad", "Gonzalez & Associates",
    "Schiller, Kessler & Gomez, PLC", "Mark Tudino", "Theodore Z. Deutsch",
    "Shutter & Saben LLC.", "Alvin J. Rosenfarb", "Stokes & Gonzalez", "Kenneth B. Schurr",
    "Brian N. Greenspoon", "Sharmila D. Bhagwandeen", "Jamie L. Allen",
    "Berman & Tsombanakis", "Steve S. Farbman", "Jackson Lainez", "Stabinski & Funt",
    "Paul E. Suss", "James Jean-Francois", "Denzle G Latty", "Eltringham Law Group",
    "Rina Kaplan", "Irwin Ast, P.A", "Dell & Schaefer", "Jose E. Perdomo", "Jaime Suarez",
    "Evan M. Feldman", "Gladys A. Cardenas", "Craig A. Dernis", "John Ruiz", "Julio Marrero",
    "Eric Taverdi", "Rima C. Bardawil", "Scott A. Ferris",
    "De Cardenas, Freixas, Stein & Zachary", "Joseph Madalon", "Robert Dixon",
    "Robert Behar", "Julio C. Acosta", "Rebecca Nachlas, Esquire", "Cornish Hernandez and Gonzalez"
  ];

  const affiliateOffices = [
    "CCOF Coral Springs ( Broward County )", "CCOF FT. Lauderdale ( Broward County )",
    "CCOF Weston ( Broward County )", "CCOF Plantation ( Broward County )",
    "CCOF Pompano ( Broward County )", "CCOF Aventura ( Miami Dade )",
    "Avalon Medical Center ( Ft Lauderdale )", "Pacific Care Rehab ( Miami Dade )",
    "Hollywood Medical Rehab ( Hollywood )", "Dr. Gletch ( Cape Coral )",
    "PT and Pain Management ( Pinecrest )", "Broward Wellness ( Coral Springs )",
    "Dynamic Healthcare ( Ft, Lauderdale )", "Dr. Gletch ( Fort Myers )",
    "Silverman Miramar", "Silverman Hollywood", "Orlando Dr Gary Boraks",
    "Kissimme Dr. Jordan Wolf", "CCOF Boca Raton ( Palm Beach )",
    "CCOF Lake Worth ( Palm Beach )", "CCOF Boynton Beach ( Palm Beach )"
  ];

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Lead Intake Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
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
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="Language" {...field} />
                    </FormControl>
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

              {/* Referred Lead By Attorneys */}
              <FormField
                control={form.control}
                name="referredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referred Lead By Attorneys</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select attorney" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {attorneys.map((attorney) => (
                          <SelectItem key={attorney} value={attorney}>
                            {attorney}
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
                      <SelectItem value="PIP">PIP</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Slip and Fall">Slip and Fall</SelectItem>
                      <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
                      <SelectItem value="Cash Plan">Cash Plan</SelectItem>
                      <SelectItem value="Attorney Only">Attorney Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                Submit Lead Intake Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
