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
import { useProviderAvailability } from "@/hooks/useProviderAvailability";
import { useAppointments } from "@/hooks/useAppointments";
import { useProviders } from "@/hooks/useProviders";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearchValue, setPatientSearchValue] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<string>("");
  
  const { getAvailableSlots, loading: availabilityLoading } = useProviderAvailability();
  const { checkAppointmentConflicts } = useAppointments();
  const { providers, getProviderDisplayName } = useProviders();
  
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
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
    if (selectedProvider && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedProvider, selectedDate, duration]);

  useEffect(() => {
    if (appointmentType) {
      const type = appointmentTypes.find(t => t.value === appointmentType);
      if (type) {
        setDuration(type.duration);
      }
    }
  }, [appointmentType]);

  const loadAvailableSlots = async () => {
    if (!selectedProvider) return;
    
    try {
      const slots = await getAvailableSlots(
        selectedProvider,
        selectedDate.toISOString().split('T')[0],
        duration
      );
      setAvailableSlots(slots);
      generateRecommendations(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  };

  const generateRecommendations = (slots: any[]) => {
    const recommendations = [];
    
    // Morning slots recommendation
    const morningSlots = slots.filter(slot => {
      const hour = new Date(slot.startTime).getHours();
      return hour >= 8 && hour < 12;
    });
    
    if (morningSlots.length > 0) {
      recommendations.push({
        type: "optimal",
        title: "Morning Availability",
        description: `${morningSlots.length} morning slots available - ideal for new patients`,
        icon: Clock,
        priority: "high"
      });
    }

    // Back-to-back prevention
    if (appointmentType === "treatment") {
      recommendations.push({
        type: "tip",
        title: "Treatment Scheduling",
        description: "Consider 15-minute buffer between treatments for better patient care",
        icon: Lightbulb,
        priority: "medium"
      });
    }

    // Lunch break warning
    const lunchSlots = slots.filter(slot => {
      const hour = new Date(slot.startTime).getHours();
      return hour >= 12 && hour < 14;
    });
    
    if (lunchSlots.length > 0) {
      recommendations.push({
        type: "warning",
        title: "Lunch Period",
        description: "Some slots during lunch hours - confirm provider availability",
        icon: AlertTriangle,
        priority: "medium"
      });
    }

    setRecommendations(recommendations);
  };

  const checkForConflicts = async (timeSlot: string) => {
    if (!selectedProvider || !timeSlot) return;
    
    const startTime = new Date(`${selectedDate.toDateString()} ${timeSlot}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    try {
      const hasConflict = await checkAppointmentConflicts(
        startTime.toISOString(),
        endTime.toISOString(),
        selectedProvider
      );
      
      const conflictList = [];
      if (hasConflict) {
        conflictList.push("Time slot conflicts with existing appointment");
      }
      
      // Check for lunch break
      const hour = startTime.getHours();
      if (hour >= 12 && hour < 13) {
        conflictList.push("Scheduled during typical lunch break");
      }
      
      // Check for end of day
      if (hour >= 17) {
        conflictList.push("Scheduled after typical business hours");
      }
      
      setConflicts(conflictList);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedTimeSlot(slot.startTime);
    checkForConflicts(slot.startTime);
  };

  const handleSchedule = () => {
    if (!selectedTimeSlot || !selectedProvider || !selectedPatient) return;
    
    const startTime = new Date(`${selectedDate.toDateString()} ${selectedTimeSlot}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const patientName = selectedPatient.first_name && selectedPatient.last_name 
      ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
      : selectedPatient.email || 'Unknown Patient';
    
    const appointmentData = {
      title: `${appointmentType} - ${patientName}`,
      contact_id: selectedPatient.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      provider_id: selectedProvider,
      type: appointmentType,
      notes: notes,
      status: 'scheduled'
    };
    
    onScheduleAppointment(appointmentData);
    onClose();
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
                <Label htmlFor="provider">Provider *</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.user_id} value={provider.user_id}>
                        {getProviderDisplayName(provider)} - {provider.role === 'doctor' ? 'Physician' : provider.role === 'overlord' ? 'Director' : 'Provider'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
          {selectedProvider && availableSlots.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Available Time Slots
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {availableSlots.length} slots
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTimeSlot === slot.startTime ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSlotSelect(slot)}
                      className="text-xs"
                    >
                      {new Date(`2024-01-01 ${slot.startTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {availableSlots.length === 0 && selectedProvider && !availabilityLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No available slots for selected date</p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    rec.priority === 'high' ? 'bg-success/5 border-success/20' :
                    rec.type === 'warning' ? 'bg-warning/5 border-warning/20' :
                    'bg-muted/30 border-border'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <rec.icon className={`w-4 h-4 mt-0.5 ${
                        rec.priority === 'high' ? 'text-success' :
                        rec.type === 'warning' ? 'text-warning' :
                        'text-muted-foreground'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center text-destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Potential Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-destructive">
                      <div className="w-1 h-1 rounded-full bg-destructive" />
                      <span>{conflict}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSchedule}
              disabled={!selectedTimeSlot || !selectedProvider || !selectedPatient}
              className="flex-1 bg-medical-blue hover:bg-medical-blue-dark"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}