import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecurringAppointments, RecurrencePattern } from '@/hooks/useRecurringAppointments';
import { CreateAppointmentData } from '@/hooks/useAppointments';
import { Repeat, Calendar, Clock, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface RecurringAppointmentManagerProps {
  onCreateAppointment?: (appointmentData: CreateAppointmentData) => void;
}

export const RecurringAppointmentManager: React.FC<RecurringAppointmentManagerProps> = ({
  onCreateAppointment
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    series,
    loading,
    createRecurringSeries,
    updateSeriesFromDate,
    cancelSeriesFromDate,
    createException
  } = useRecurringAppointments();

  const handleCreateRecurringSeries = async (seriesData: {
    baseAppointment: CreateAppointmentData;
    pattern: RecurrencePattern;
    generateCount: number;
  }) => {
    try {
      await createRecurringSeries(
        seriesData.baseAppointment,
        seriesData.pattern,
        seriesData.generateCount
      );
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating recurring series:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurring Appointments
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Recurring Series
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {series.map((seriesItem) => (
              <Card key={seriesItem.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{seriesItem.base_appointment.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(seriesItem.base_appointment.start_time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat className="h-4 w-4" />
                          <span>{getPatternDescription(seriesItem.pattern)}</span>
                        </div>
                        <span>{seriesItem.created_instances} appointments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={seriesItem.is_active ? "default" : "secondary"}>
                        {seriesItem.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSeries(seriesItem.id);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {series.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No recurring appointment series found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateRecurringSeriesDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleCreateRecurringSeries}
      />

      <EditRecurringSeriesDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        seriesId={selectedSeries}
        onUpdate={updateSeriesFromDate}
        onCancel={cancelSeriesFromDate}
        onCreateException={createException}
      />
    </div>
  );
};

const getPatternDescription = (pattern: RecurrencePattern): string => {
  switch (pattern.type) {
    case 'daily':
      return `Every ${pattern.interval} day${pattern.interval > 1 ? 's' : ''}`;
    case 'weekly':
      if (pattern.days_of_week && pattern.days_of_week.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `Weekly on ${pattern.days_of_week.map(day => dayNames[day]).join(', ')}`;
      }
      return `Every ${pattern.interval} week${pattern.interval > 1 ? 's' : ''}`;
    case 'monthly':
      return `Every ${pattern.interval} month${pattern.interval > 1 ? 's' : ''}`;
    case 'yearly':
      return `Every ${pattern.interval} year${pattern.interval > 1 ? 's' : ''}`;
    default:
      return 'Unknown pattern';
  }
};

const CreateRecurringSeriesDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    contact_id: '',
    start_time: '',
    end_time: '',
    type: 'consultation' as any,
    location: '',
    notes: '',
    pattern: {
      type: 'weekly' as any,
      interval: 1,
      days_of_week: [1], // Monday
      end_date: '',
      max_occurrences: 10
    },
    generateCount: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseAppointment: CreateAppointmentData = {
      title: formData.title,
      contact_id: formData.contact_id,
      start_time: formData.start_time,
      end_time: formData.end_time,
      type: formData.type,
      location: formData.location,
      notes: formData.notes
    };

    onSave({
      baseAppointment,
      pattern: formData.pattern,
      generateCount: formData.generateCount
    });

    // Reset form
    setFormData({
      title: '',
      contact_id: '',
      start_time: '',
      end_time: '',
      type: 'consultation',
      location: '',
      notes: '',
      pattern: {
        type: 'weekly',
        interval: 1,
        days_of_week: [1],
        end_date: '',
        max_occurrences: 10
      },
      generateCount: 10
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recurring Appointment Series</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="appointment" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointment">Appointment Details</TabsTrigger>
              <TabsTrigger value="recurrence">Recurrence Pattern</TabsTrigger>
            </TabsList>

            <TabsContent value="appointment" className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
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
                <Label>Location (Optional)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </TabsContent>

            <TabsContent value="recurrence" className="space-y-4">
              <div>
                <Label>Repeat</Label>
                <Select 
                  value={formData.pattern.type} 
                  onValueChange={(value: any) => setFormData({
                    ...formData, 
                    pattern: {...formData.pattern, type: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={formData.pattern.interval}
                    onChange={(e) => setFormData({
                      ...formData, 
                      pattern: {...formData.pattern, interval: parseInt(e.target.value)}
                    })}
                    className="w-20"
                  />
                  <span>{formData.pattern.type.slice(0, -2)}{formData.pattern.interval > 1 ? 's' : ''}</span>
                </div>
              </div>

              {formData.pattern.type === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 mt-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.pattern.days_of_week?.includes(index)}
                          onCheckedChange={(checked) => {
                            const currentDays = formData.pattern.days_of_week || [];
                            const newDays = checked
                              ? [...currentDays, index]
                              : currentDays.filter(d => d !== index);
                            setFormData({
                              ...formData,
                              pattern: {...formData.pattern, days_of_week: newDays}
                            });
                          }}
                        />
                        <label className="text-sm">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Number of Appointments to Generate</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.generateCount}
                  onChange={(e) => setFormData({...formData, generateCount: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.pattern.end_date}
                  onChange={(e) => setFormData({
                    ...formData,
                    pattern: {...formData.pattern, end_date: e.target.value}
                  })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Series</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditRecurringSeriesDialog: React.FC<any> = ({ 
  isOpen, 
  onClose, 
  seriesId, 
  onUpdate, 
  onCancel, 
  onCreateException 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Recurring Series</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">
              Changes will affect all future appointments in this series.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                // Handle edit single instance
                onClose();
              }}
            >
              Edit Single Appointment
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                // Handle edit from this point forward
                onClose();
              }}
            >
              Edit This and Future Appointments
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive"
              onClick={() => {
                if (seriesId) {
                  onCancel(seriesId, new Date().toISOString(), 'Series cancelled by user');
                }
                onClose();
              }}
            >
              Cancel Remaining Appointments
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};