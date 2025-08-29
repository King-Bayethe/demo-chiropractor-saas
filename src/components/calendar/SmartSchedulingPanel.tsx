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
  ChevronsUpDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatTimeSlot } from "@/utils/timezone";

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

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-[500px] bg-background border-l border-border shadow-xl overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-medical-blue" />
              <h2 className="text-xl font-semibold">Smart Scheduling</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>

          {/* Patient Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <User className="w-4 h-4 mr-2" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="patient">Patient *</Label>
                <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={patientSearchOpen}
                      className="w-full justify-between bg-background"
                    >
                      {selectedPatient
                        ? getPatientDisplayName(selectedPatient)
                        : "Select patient..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                  "mr-2 h-4 w-4",
                                  selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{getPatientDisplayName(patient)}</span>
                                {patient.email && (
                                  <span className="text-xs text-muted-foreground">{patient.email}</span>
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
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="text-sm space-y-1">
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
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="appointmentType">Appointment Type *</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${type.color}`} />
                          <span>{type.label} ({type.duration}min)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="15"
                  max="120"
                  step="15"
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="w-full pointer-events-auto"
              />
            </CardContent>
          </Card>

          {/* Available Time Slots */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Available Time Slots
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {availableTimeSlots.length} slots
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedTimeSlot === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className="text-xs"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, index) => {
                  const IconComponent = rec.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                      <IconComponent className={`w-4 h-4 mt-0.5 ${
                        rec.type === 'optimal' ? 'text-success' : 
                        rec.type === 'warning' ? 'text-warning' : 'text-primary'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-medium">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes for this appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSchedule}
              disabled={!selectedPatient || !appointmentType}
              className="flex-1"
            >
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}