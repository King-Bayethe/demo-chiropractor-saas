import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddOpportunityFormProps {
  onSubmit: (data: any) => void;
}

const PIPELINE_STAGES = [
  { id: "lead", title: "Lead Captured" },
  { id: "consultation", title: "Consult Scheduled" },
  { id: "seen", title: "Patient Seen" },
  { id: "billing", title: "Billing Pending" },
  { id: "payment", title: "Payment Collected" },
];

const SOURCES = [
  "Attorney Referral",
  "Website",
  "Social Media",
  "Walk-in",
  "Phone Call",
  "Email",
  "Other",
];

const TEAM_MEMBERS = [
  "Dr. Silverman",
  "Nurse Smith",
  "Admin Johnson",
  "Coordinator Brown",
];

export function AddOpportunityForm({ onSubmit }: AddOpportunityFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Patient Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <Label htmlFor="value">Estimated Value</Label>
          <Input
            id="value"
            type="number"
            {...register("value", { valueAsNumber: true })}
            placeholder="5000"
          />
        </div>

        <div>
          <Label htmlFor="stage">Pipeline Stage</Label>
          <Select onValueChange={(value) => setValue("stage", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="source">Source</Label>
          <Select onValueChange={(value) => setValue("source", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select onValueChange={(value) => setValue("assignedTo", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_MEMBERS.map(member => (
                <SelectItem key={member} value={member}>
                  {member}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="Personal Injury, High Priority"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Additional information..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Cancel
        </Button>
        <Button type="submit">
          Add Opportunity
        </Button>
      </div>
    </form>
  );
}