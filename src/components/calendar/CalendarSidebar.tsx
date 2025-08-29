import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Calendar as CalendarIcon,
  Users,
  Clock,
  CheckCircle2,
  ChevronDown,
  Settings
} from "lucide-react";


interface CalendarSidebarProps {
  isCollapsed: boolean;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  filters: {
    status: string[];
    types: string[];
  };
  onFiltersChange: (filters: any) => void;
  onToggle: () => void;
  todaysStats?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
}

export function CalendarSidebar({
  isCollapsed,
  currentDate,
  onDateChange,
  filters,
  onFiltersChange,
  onToggle,
  todaysStats
}: CalendarSidebarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
  };


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

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border bg-card flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-10 h-10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="w-8 h-px bg-border"></div>
        <CalendarIcon className="w-5 h-5 text-muted-foreground" />
        <Filter className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Calendar</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {/* Mini Calendar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="w-full"
            />
          </CardContent>
        </Card>


        {/* Filters */}
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

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Appointments</span>
              <span className="font-medium">{todaysStats?.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-success">{todaysStats?.completed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-warning">{todaysStats?.pending || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cancelled</span>
              <span className="font-medium text-destructive">{todaysStats?.cancelled || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}