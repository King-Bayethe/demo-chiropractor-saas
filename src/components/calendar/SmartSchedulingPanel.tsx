import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Zap,
  Search,
  Check,
  ChevronsUpDown,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatTimeSlot } from "@/utils/timezone";
import { useIsMobile } from "@/hooks/use-mobile";

interface Patient {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface SmartSchedulingPanelProps {
  onScheduleAppointment: (appointmentData: any) => void;
  patientId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SmartSchedulingPanel({
  onScheduleAppointment,
  patientId,
  isOpen,
  onClose
}: SmartSchedulingPanelProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearchValue, setPatientSearchValue] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<string>("");
  
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const appointmentTypes = [
    { value: "consultation", label: "Consultation", duration: 30, color: "bg-primary" },
    { value: "treatment", label: "Treatment", duration: 60, color: "bg-medical-teal" },
    { value: "follow-up", label: "Follow-up", duration: 15, color: "bg-success" },
    { value: "therapy", label: "Physical Therapy", duration: 45, color: "bg-warning" },
  ];

  // Load patients on component mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const { data: patientsData, error } = await supabase
          .from('patients')
          .select('id, first_name, last_name, email, phone')
          .eq('is_active', true)
          .order('first_name');

        if (error) {
          console.error('Error loading patients:', error);
          return;
        }

        setPatients(patientsData || []);
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    if (appointmentType) {
      const type = appointmentTypes.find(t => t.value === appointmentType);
      if (type) {
        setDuration(type.duration);
      }
    }
  }, [appointmentType]);

  const generateRecommendations = () => {
    const recommendations = [];
    
    // Time-based recommendations
    const hour = selectedDate.getHours();
    if (hour >= 8 && hour < 12) {
      recommendations.push({
        type: "optimal",
        title: "Morning Slot",
        description: "Morning appointments often have better patient attendance",
        icon: Clock,
        priority: "high"
      });
    }

    // Appointment type specific recommendations
    if (appointmentType === "treatment") {
      recommendations.push({
        type: "tip",
        title: "Treatment Scheduling",
        description: "Consider allowing extra time for treatment setup and cleanup",
        icon: Lightbulb,
        priority: "medium"
      });
    }

    if (appointmentType === "consultation") {
      recommendations.push({
        type: "tip",
        title: "First-time Patient",
        description: "New consultations may require additional documentation time",
        icon: User,
        priority: "medium"
      });
    }

    setRecommendations(recommendations);
  };

  useEffect(() => {
    if (selectedDate && appointmentType) {
      generateRecommendations();
    }
  }, [selectedDate, appointmentType]);

  const handleSchedule = () => {
    if (!selectedPatient || !selectedDate || !appointmentType) return;
    
    try {
      // Create appointment start time from selected date and current time or default time
      const startTime = new Date(selectedDate);
      if (selectedTimeSlot) {
        const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
        startTime.setHours(hours, minutes, 0, 0);
      } else {
        // Default to next available hour if no specific time selected
        const now = new Date();
        const nextHour = now.getHours() + 1;
        startTime.setHours(nextHour, 0, 0, 0);
      }
      
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const patientName = selectedPatient.first_name && selectedPatient.last_name 
        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
        : selectedPatient.email || 'Unknown Patient';
      
      const appointmentData = {
        title: `${appointmentType} - ${patientName}`,
        contact_id: selectedPatient.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        provider_id: '',
        type: appointmentType,
        notes: notes,
        status: 'scheduled'
      };
      
      onScheduleAppointment(appointmentData);
      onClose();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  const getPatientDisplayName = (patient: Patient) => {
    if (patient.first_name || patient.last_name) {
      return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
    }
    return patient.email || 'Unknown Patient';
  };

  const filteredPatients = patients.filter(patient => {
    const displayName = getPatientDisplayName(patient).toLowerCase();
    const email = patient.email?.toLowerCase() || '';
    const search = patientSearchValue.toLowerCase();
    return displayName.includes(search) || email.includes(search);
  });

  // Generate available time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  const availableTimeSlots = generateTimeSlots();

  if (!isOpen) return null;

  const content = (
    <div className={cn("space-y-4", isMobile ? "p-4" : "p-6")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className={cn("text-medical-blue", isMobile ? "w-4 h-4" : "w-5 h-5")} />
          <h2 className={cn("font-semibold", isMobile ? "text-lg" : "text-xl")}>Smart Scheduling</h2>
        </div>
        {!isMobile && (
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
          <CardTitle className={cn("flex items-center", isMobile ? "text-sm" : "text-sm")}>
            <User className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
            Select Patient
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("space-y-3", isMobile ? "p-3 pt-0" : "")}>
          <div>
            <Label htmlFor="patient" className={cn(isMobile ? "text-sm" : "")}>Patient *</Label>
            <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={patientSearchOpen}
                  className={cn("w-full justify-between bg-background", 
                    isMobile ? "h-10 text-sm" : ""
                  )}
                >
                  {selectedPatient
                    ? getPatientDisplayName(selectedPatient)
                    : "Select patient..."}
                  <ChevronsUpDown className={cn("ml-2 shrink-0 opacity-50", 
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-background border border-border shadow-lg z-50">
                <Command>
                  <CommandInput 
                    placeholder="Search patients..." 
                    value={patientSearchValue}
                    onValueChange={setPatientSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No patients found.</CommandEmpty>
                    <CommandGroup>
                      {filteredPatients.slice(0, 10).map((patient) => (
                        <CommandItem
                          key={patient.id}
                          value={patient.id}
                          onSelect={() => {
                            setSelectedPatient(patient);
                            setPatientSearchOpen(false);
                            setPatientSearchValue("");
                          }}
                          className="bg-background hover:bg-muted/50 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2",
                              isMobile ? "h-3 w-3" : "h-4 w-4",
                              selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className={cn("font-medium", isMobile ? "text-sm" : "")}>
                              {getPatientDisplayName(patient)}
                            </span>
                            {patient.email && (
                              <span className={cn("text-muted-foreground", 
                                isMobile ? "text-xs" : "text-xs"
                              )}>
                                {patient.email}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {selectedPatient && (
            <div className={cn("p-3 bg-muted/30 rounded-lg border", isMobile ? "p-2" : "")}>
              <div className={cn("space-y-1", isMobile ? "text-xs" : "text-sm")}>
                <div><strong>Name:</strong> {getPatientDisplayName(selectedPatient)}</div>
                {selectedPatient.email && <div><strong>Email:</strong> {selectedPatient.email}</div>}
                {selectedPatient.phone && <div><strong>Phone:</strong> {selectedPatient.phone}</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
          <CardTitle className={cn("flex items-center", isMobile ? "text-sm" : "text-sm")}>
            <CalendarIcon className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("space-y-3", isMobile ? "p-3 pt-0" : "")}>
          <div>
            <Label htmlFor="appointmentType" className={cn(isMobile ? "text-sm" : "")}>
              Appointment Type *
            </Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger className={cn(isMobile ? "h-10" : "")}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${type.color}`} />
                      <span className={cn(isMobile ? "text-sm" : "")}>
                        {type.label} ({type.duration}min)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration" className={cn(isMobile ? "text-sm" : "")}>
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="15"
              max="120"
              step="15"
              className={cn(isMobile ? "h-10" : "")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Selection */}
      <Card>
        <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
          <CardTitle className={cn("flex items-center", isMobile ? "text-sm" : "text-sm")}>
            <CalendarIcon className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-3 pt-0" : "")}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => date < new Date()}
            className={cn("w-full pointer-events-auto", isMobile ? "text-sm" : "")}
          />
        </CardContent>
      </Card>

      {/* Available Time Slots */}
      <Card>
        <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
          <CardTitle className={cn("flex items-center justify-between", isMobile ? "text-sm" : "text-sm")}>
            Available Time Slots
            <Badge variant="secondary" className={cn("bg-success/10 text-success", 
              isMobile ? "text-xs" : ""
            )}>
              {availableTimeSlots.length} slots
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-3 pt-0" : "")}>
          <div className={cn("grid gap-2", 
            isMobile ? "grid-cols-2" : "grid-cols-3"
          )}>
            {availableTimeSlots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedTimeSlot === slot ? "default" : "outline"}
                size={isMobile ? "sm" : "sm"}
                onClick={() => setSelectedTimeSlot(slot)}
                className={cn("h-9", isMobile ? "text-xs px-2" : "text-xs")}
              >
                {slot}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
            <CardTitle className={cn("flex items-center", isMobile ? "text-sm" : "text-sm")}>
              <Lightbulb className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className={cn("space-y-3", isMobile ? "p-3 pt-0" : "")}>
            {recommendations.map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <div key={index} className={cn("flex items-start space-x-3 rounded-lg border border-border/50 bg-muted/20",
                  isMobile ? "p-2" : "p-3"
                )}>
                  <IconComponent className={cn("mt-0.5", 
                    isMobile ? "w-3 h-3" : "w-4 h-4",
                    rec.type === 'optimal' ? 'text-success' : 
                    rec.type === 'warning' ? 'text-warning' : 'text-primary'
                  )} />
                  <div className="flex-1 space-y-1">
                    <h4 className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                      {rec.title}
                    </h4>
                    <p className={cn("text-muted-foreground", 
                      isMobile ? "text-xs" : "text-xs"
                    )}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
          <CardTitle className={cn(isMobile ? "text-sm" : "text-sm")}>
            Notes (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-3 pt-0" : "")}>
          <Textarea
            placeholder="Add any additional notes for this appointment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={cn("min-h-[80px]", isMobile ? "text-sm" : "")}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className={cn("flex gap-3 pt-4 border-t", 
        isMobile ? "flex-col" : ""
      )}>
        <Button 
          variant="outline" 
          onClick={onClose} 
          className={cn(isMobile ? "w-full" : "flex-1")}
          size={isMobile ? "default" : "default"}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSchedule}
          disabled={!selectedPatient || !appointmentType}
          className={cn(isMobile ? "w-full" : "flex-1")}
          size={isMobile ? "default" : "default"}
        >
          Schedule Appointment
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-medical-blue" />
              Smart Scheduling
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-[500px] bg-background border-l border-border shadow-xl overflow-y-auto">
        {content}
      </div>
    </div>
  );
}