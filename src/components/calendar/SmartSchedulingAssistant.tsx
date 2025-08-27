import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProviderAvailability } from '@/hooks/useProviderAvailability';
import { useAppointments } from '@/hooks/useAppointments';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Clock, Calendar as CalendarIcon, AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartSchedulingAssistantProps {
  onScheduleAppointment: (appointmentData: any) => void;
  patientId?: string;
}

export const SmartSchedulingAssistant: React.FC<SmartSchedulingAssistantProps> = ({
  onScheduleAppointment,
  patientId
}) => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [duration, setDuration] = useState(60);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);

  const { getAvailableSlots, loading: availabilityLoading } = useProviderAvailability();
  const { checkAppointmentConflicts } = useAppointments();

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedDate) {
      loadAvailableSlots();
      generateRecommendations();
    }
  }, [selectedProvider, selectedDate, duration]);

  const loadProviders = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('is_active', true)
        .in('role', ['doctor', 'provider', 'staff']);

      const formattedProviders = (data || []).map((provider: any) => ({
        id: provider.user_id,
        name: provider.first_name && provider.last_name 
          ? `${provider.first_name} ${provider.last_name}`
          : provider.email || 'Provider'
      }));
      
      setProviders(formattedProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedProvider || !selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = await getAvailableSlots(selectedProvider, dateStr, duration);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedProvider || !selectedDate) return;

    const recommendations = [];

    // Check for optimal times based on appointment type
    if (appointmentType === 'consultation') {
      recommendations.push({
        type: 'time_preference',
        title: 'Morning appointments recommended',
        description: 'First consultations are typically more effective in the morning when patients are most alert.',
        priority: 'medium'
      });
    }

    // Check for scheduling efficiency
    const adjacentSlots = availableSlots.filter(slot => {
      const slotTime = new Date(slot.start);
      return availableSlots.some(otherSlot => {
        const otherTime = new Date(otherSlot.start);
        const timeDiff = Math.abs(slotTime.getTime() - otherTime.getTime());
        return timeDiff === duration * 60000; // Adjacent slots
      });
    });

    if (adjacentSlots.length > 0) {
      recommendations.push({
        type: 'efficiency',
        title: 'Back-to-back scheduling available',
        description: 'These slots allow for efficient scheduling with minimal gaps.',
        priority: 'high',
        slots: adjacentSlots.slice(0, 3)
      });
    }

    // Check for travel time considerations
    recommendations.push({
      type: 'travel_time',
      title: 'Consider travel time',
      description: '15-minute buffer recommended between appointments for preparation.',
      priority: 'low'
    });

    setRecommendations(recommendations);
  };

  const checkForConflicts = async (startTime: string, endTime: string) => {
    const hasConflict = await checkAppointmentConflicts(startTime, endTime, selectedProvider);
    
    const conflictMessages = [];
    if (hasConflict) {
      conflictMessages.push('Time slot conflicts with existing appointment');
    }

    // Check for lunch break conflicts
    const startHour = new Date(startTime).getHours();
    const endHour = new Date(endTime).getHours();
    if ((startHour <= 12 && endHour >= 13) || (startHour <= 13 && endHour >= 14)) {
      conflictMessages.push('Appointment may conflict with typical lunch break (12:00-13:00)');
    }

    // Check for end-of-day conflicts
    if (endHour >= 17) {
      conflictMessages.push('Appointment extends beyond typical working hours');
    }

    setConflicts(conflictMessages);
    return conflictMessages.length === 0;
  };

  const handleSlotSelect = async (slot: any) => {
    const endTime = new Date(slot.start);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const isValid = await checkForConflicts(slot.start, endTime.toISOString());
    
    if (isValid) {
      onScheduleAppointment({
        contact_id: patientId,
        provider_id: selectedProvider,
        start_time: slot.start,
        end_time: endTime.toISOString(),
        type: appointmentType,
        title: `${appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)} Appointment`
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    }
  };

  const getTimeSlotStatus = (slot: any) => {
    const hour = new Date(slot.start).getHours();
    
    if (hour >= 9 && hour <= 11) return { label: 'Optimal', color: 'bg-success/10 text-success' };
    if (hour >= 14 && hour <= 16) return { label: 'Good', color: 'bg-medical-blue/10 text-medical-blue' };
    if (hour >= 8 && hour <= 9) return { label: 'Early', color: 'bg-yellow-500/10 text-yellow-700' };
    if (hour >= 16 && hour <= 18) return { label: 'Late', color: 'bg-orange-500/10 text-orange-700' };
    
    return { label: 'Available', color: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Scheduling Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Appointment Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duration (minutes)</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium">Available Time Slots</h3>
              
              {conflicts.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {conflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {availableSlots.map((slot, index) => {
                  const status = getTimeSlotStatus(slot);
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-between h-auto p-3"
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(slot.start).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <Badge variant="secondary" className={status.color}>
                        {status.label}
                      </Badge>
                    </Button>
                  );
                })}
                {availableSlots.length === 0 && !availabilityLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No available slots for selected date
                  </div>
                )}
                {availabilityLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading available slots...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Scheduling Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Alert key={index} className={getPriorityColor(rec.priority)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm mt-1">{rec.description}</p>
                      {rec.slots && (
                        <div className="flex gap-2 mt-2">
                          {rec.slots.map((slot: any, slotIndex: number) => (
                            <Button
                              key={slotIndex}
                              size="sm"
                              variant="outline"
                              onClick={() => handleSlotSelect(slot)}
                            >
                              {new Date(slot.start).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};