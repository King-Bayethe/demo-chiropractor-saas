import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProviderAvailability } from '@/hooks/useProviderAvailability';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Plus, Edit, Trash2, Coffee } from 'lucide-react';

interface ProviderAvailabilityManagerProps {
  providerId?: string;
}

export const ProviderAvailabilityManager: React.FC<ProviderAvailabilityManagerProps> = ({
  providerId
}) => {
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProviderId, setSelectedProviderId] = useState(providerId || '');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<any>(null);
  const [isBlockTimeDialogOpen, setIsBlockTimeDialogOpen] = useState(false);

  const {
    availability,
    blockedSlots,
    loading,
    fetchProviderAvailability,
    fetchBlockedSlots,
    createAvailability,
    updateAvailability,
    createBlockedSlot
  } = useProviderAvailability();

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProviderId) {
      fetchProviderAvailability(selectedProviderId);
      fetchBlockedSlots(selectedProviderId);
    }
  }, [selectedProviderId]);

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
      
      if (!selectedProviderId && formattedProviders.length > 0) {
        setSelectedProviderId(formattedProviders[0].id);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const handleSaveAvailability = async (availabilityData: any) => {
    try {
      if (editingAvailability?.id) {
        await updateAvailability(editingAvailability.id, availabilityData);
      } else {
        await createAvailability({
          ...availabilityData,
          provider_id: selectedProviderId
        });
      }
      setIsEditDialogOpen(false);
      setEditingAvailability(null);
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const handleBlockTime = async (blockData: any) => {
    try {
      await createBlockedSlot({
        ...blockData,
        provider_id: selectedProviderId
      });
      setIsBlockTimeDialogOpen(false);
    } catch (error) {
      console.error('Error blocking time:', error);
    }
  };

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.find(a => a.provider_id === selectedProviderId && a.day_of_week === dayOfWeek);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Provider Availability Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider-select">Select Provider</Label>
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
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

          {selectedProviderId && (
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                <TabsTrigger value="blocked">Blocked Time</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Weekly Availability</h3>
                  <Button 
                    onClick={() => {
                      setEditingAvailability(null);
                      setIsEditDialogOpen(true);
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>

                <div className="grid gap-3">
                  {daysOfWeek.map(day => {
                    const dayAvailability = getAvailabilityForDay(day.value);
                    
                    return (
                      <Card key={day.value} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium w-20">{day.label}</span>
                              {dayAvailability ? (
                                <div className="flex items-center gap-4">
                                  <Badge variant={dayAvailability.is_available ? "default" : "secondary"}>
                                    {dayAvailability.is_available ? 'Available' : 'Unavailable'}
                                  </Badge>
                                  {dayAvailability.is_available && (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{dayAvailability.start_time} - {dayAvailability.end_time}</span>
                                      </div>
                                      {dayAvailability.break_start_time && (
                                        <div className="flex items-center gap-2">
                                          <Coffee className="h-4 w-4" />
                                          <span>Break: {dayAvailability.break_start_time} - {dayAvailability.break_end_time}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline">Not Set</Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingAvailability(dayAvailability || { day_of_week: day.value });
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="blocked" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Blocked Time Slots</h3>
                  <Button 
                    onClick={() => setIsBlockTimeDialogOpen(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Block Time
                  </Button>
                </div>

                <div className="grid gap-3">
                  {blockedSlots
                    .filter(slot => slot.provider_id === selectedProviderId)
                    .map(slot => (
                      <Card key={slot.id} className="border border-destructive/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{slot.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                              </p>
                              {slot.reason && (
                                <p className="text-sm text-muted-foreground mt-1">{slot.reason}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {slot.is_recurring && (
                                <Badge variant="secondary">Recurring</Badge>
                              )}
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {blockedSlots.filter(slot => slot.provider_id === selectedProviderId).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No blocked time slots
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Edit Availability Dialog */}
      <AvailabilityEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingAvailability(null);
        }}
        availability={editingAvailability}
        onSave={handleSaveAvailability}
      />

      {/* Block Time Dialog */}
      <BlockTimeDialog
        isOpen={isBlockTimeDialogOpen}
        onClose={() => setIsBlockTimeDialogOpen(false)}
        onSave={handleBlockTime}
      />
    </div>
  );
};

// ... keep existing code and add the dialog components
const AvailabilityEditDialog: React.FC<any> = ({ isOpen, onClose, availability, onSave }) => {
  const [formData, setFormData] = useState({
    day_of_week: 1,
    is_available: true,
    start_time: '09:00',
    end_time: '17:00',
    break_start_time: '12:00',
    break_end_time: '13:00'
  });

  useEffect(() => {
    if (availability) {
      setFormData({
        day_of_week: availability.day_of_week ?? 1,
        is_available: availability.is_available ?? true,
        start_time: availability.start_time || '09:00',
        end_time: availability.end_time || '17:00',
        break_start_time: availability.break_start_time || '12:00',
        break_end_time: availability.break_end_time || '13:00'
      });
    }
  }, [availability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Availability</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Day of Week</Label>
            <Select value={formData.day_of_week.toString()} onValueChange={(value) => setFormData({...formData, day_of_week: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.is_available} 
              onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
            />
            <Label>Available</Label>
          </div>

          {formData.is_available && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Break Start (Optional)</Label>
                  <Input 
                    type="time" 
                    value={formData.break_start_time}
                    onChange={(e) => setFormData({...formData, break_start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Break End (Optional)</Label>
                  <Input 
                    type="time" 
                    value={formData.break_end_time}
                    onChange={(e) => setFormData({...formData, break_end_time: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BlockTimeDialog: React.FC<any> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    reason: '',
    is_recurring: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      title: '',
      start_time: '',
      end_time: '',
      reason: '',
      is_recurring: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Lunch Break, Conference"
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
            <Label>Reason (Optional)</Label>
            <Input 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Reason for blocking this time"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.is_recurring} 
              onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked})}
            />
            <Label>Recurring</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Block Time</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
