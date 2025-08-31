import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

export const ScheduleSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultAppointmentDuration: "30",
    bufferTime: "15",
    maxAdvanceBooking: "30",
    allowWeekendBooking: false,
    allowHolidayBooking: false,
    autoConfirmBookings: true,
    sendReminders: true,
    reminderTime: "24",
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    lunchBreak: {
      enabled: true,
      start: "12:00",
      end: "13:00"
    }
  });

  const handleSave = () => {
    // Save settings logic would go here
    toast({
      title: "Settings saved",
      description: "Your schedule settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Management
          </CardTitle>
          <CardDescription>
            Configure appointment scheduling and calendar settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appointment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appointment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Default Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={settings.defaultAppointmentDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultAppointmentDuration: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  value={settings.bufferTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, bufferTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance">Max Advance Booking (days)</Label>
                <Input
                  id="advance"
                  type="number"
                  value={settings.maxAdvanceBooking}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxAdvanceBooking: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder">Reminder Time (hours before)</Label>
                <Select value={settings.reminderTime} onValueChange={(value) => setSettings(prev => ({ ...prev, reminderTime: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Working Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Lunch Break */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Lunch Break</h3>
              <Switch
                checked={settings.lunchBreak.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  lunchBreak: { ...prev.lunchBreak, enabled: checked }
                }))}
              />
            </div>
            {settings.lunchBreak.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunch-start">Lunch Start</Label>
                  <Input
                    id="lunch-start"
                    type="time"
                    value={settings.lunchBreak.start}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      lunchBreak: { ...prev.lunchBreak, start: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch-end">Lunch End</Label>
                  <Input
                    id="lunch-end"
                    type="time"
                    value={settings.lunchBreak.end}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      lunchBreak: { ...prev.lunchBreak, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Booking Policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Booking Policies
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Weekend Bookings</Label>
                  <p className="text-sm text-muted-foreground">Enable appointments on Saturdays and Sundays</p>
                </div>
                <Switch
                  checked={settings.allowWeekendBooking}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowWeekendBooking: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Holiday Bookings</Label>
                  <p className="text-sm text-muted-foreground">Enable appointments on holidays</p>
                </div>
                <Switch
                  checked={settings.allowHolidayBooking}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowHolidayBooking: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Confirm Bookings</Label>
                  <p className="text-sm text-muted-foreground">Automatically confirm appointments without manual review</p>
                </div>
                <Switch
                  checked={settings.autoConfirmBookings}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoConfirmBookings: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Reminders</Label>
                  <p className="text-sm text-muted-foreground">Automatically send appointment reminders to patients</p>
                </div>
                <Switch
                  checked={settings.sendReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sendReminders: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};