import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, ChevronDown } from "lucide-react";

interface CalendarFiltersProps {
  filters: {
    status: string[];
    types: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const statusOptions = [
    { value: "scheduled", label: "Scheduled", color: "bg-medical-blue" },
    { value: "confirmed", label: "Confirmed", color: "bg-success" },
    { value: "completed", label: "Completed", color: "bg-muted" },
    { value: "cancelled", label: "Cancelled", color: "bg-destructive" },
  ];

  const typeOptions = [
    { value: "consultation", label: "Consultation" },
    { value: "treatment", label: "Treatment" },
    { value: "follow-up", label: "Follow-up" },
    { value: "therapy", label: "Physical Therapy" },
  ];

  return (
    <Card>
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.status.includes(status.value)}
                      onCheckedChange={(checked) => {
                        const newStatus = checked
                          ? [...filters.status, status.value]
                          : filters.status.filter(s => s !== status.value);
                        onFiltersChange({ ...filters, status: newStatus });
                      }}
                    />
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      <label htmlFor={`status-${status.value}`} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Appointment Type</h4>
              <div className="space-y-2">
                {typeOptions.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.types.includes(type.value)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked
                          ? [...filters.types, type.value]
                          : filters.types.filter(t => t !== type.value);
                        onFiltersChange({ ...filters, types: newTypes });
                      }}
                    />
                    <label htmlFor={`type-${type.value}`} className="text-sm">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}