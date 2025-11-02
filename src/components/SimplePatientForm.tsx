import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface SimplePatientFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phone: string;
  email: string;
  language: string;
  paymentMethod: string;
  referralSource: string;
  notes: string;
}

export function SimplePatientForm({ onSubmit, onCancel, isSubmitting = false }: SimplePatientFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PatientFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      language: "en",
      paymentMethod: "",
      referralSource: "",
      notes: "",
    },
  });

  const dateOfBirth = watch("dateOfBirth");

  const handleFormSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            {...register("firstName", { required: "First name is required" })}
            className={cn(errors.firstName && "border-destructive")}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            {...register("lastName", { required: "Last name is required" })}
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            {...register("phone", { required: "Phone number is required" })}
            className={cn(errors.phone && "border-destructive")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="patient@example.com"
            {...register("email")}
          />
        </div>
      </div>

      {/* DOB and Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={(date) => setValue("dateOfBirth", date)}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium">
            Preferred Language
          </Label>
          <Select defaultValue="en" onValueChange={(value) => setValue("language", value)}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="paymentMethod" className="text-sm font-medium">
          Insurance / Payment Type
        </Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value)}>
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Private Insurance">Private Insurance</SelectItem>
            <SelectItem value="Medicare">Medicare</SelectItem>
            <SelectItem value="Medicaid">Medicaid</SelectItem>
            <SelectItem value="Self-Pay">Self-Pay</SelectItem>
            <SelectItem value="Payment Plan">Payment Plan</SelectItem>
            <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Referral Source */}
      <div className="space-y-2">
        <Label htmlFor="referralSource" className="text-sm font-medium">
          How did they find us?
        </Label>
        <Select onValueChange={(value) => setValue("referralSource", value)}>
          <SelectTrigger id="referralSource">
            <SelectValue placeholder="Select referral source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Physician Referral">Physician Referral</SelectItem>
            <SelectItem value="Patient Referral">Patient Referral</SelectItem>
            <SelectItem value="Online Search">Online Search</SelectItem>
            <SelectItem value="Insurance Network">Insurance Network</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
            <SelectItem value="Walk-in">Walk-in</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Initial Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any important information to note..."
          rows={3}
          {...register("notes")}
          className="resize-none"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Patient...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Patient
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
