import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  X
} from "lucide-react";

// Calendar view types
type CalendarView = 'month' | 'week' | 'day';

// Mock appointment data structure
interface Appointment {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  provider: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  startTime: Date;
  endTime: Date;
  location?: string;
  notes?: string;
}

export default function Calendar() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    title: "",
    type: "",
    provider: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: ""
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load contacts for appointment booking
      const contactsData = await ghlApi.contacts.getAll();
      setContacts(contactsData.contacts || []);
      
      // Mock appointments data - in production this would come from GHL Calendar API
      const mockAppointments: Appointment[] = [
        {
          id: "apt-1",
          title: "Chiropractic Adjustment",
          patientName: "John Smith",
          patientId: "contact-1",
          provider: "Dr. Silverman",
          type: "Treatment",
          status: "confirmed",
          startTime: new Date(2024, new Date().getMonth(), 15, 9, 0),
          endTime: new Date(2024, new Date().getMonth(), 15, 10, 0),
          location: "Treatment Room 1"
        },
        {
          id: "apt-2", 
          title: "Initial Consultation",
          patientName: "Sarah Johnson",
          patientId: "contact-2",
          provider: "Dr. Silverman",
          type: "Consultation",
          status: "scheduled",
          startTime: new Date(2024, new Date().getMonth(), 16, 14, 0),
          endTime: new Date(2024, new Date().getMonth(), 16, 15, 0),
          location: "Consultation Room"
        },
        {
          id: "apt-3",
          title: "Physical Therapy Session",
          patientName: "Mike Davis",
          patientId: "contact-3", 
          provider: "PT Thompson",
          type: "Physical Therapy",
          status: "completed",
          startTime: new Date(2024, new Date().getMonth(), 14, 11, 0),
          endTime: new Date(2024, new Date().getMonth(), 14, 12, 30),
          location: "PT Room"
        }
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedContact = contacts.find((c: any) => c.id === formData.patientId);
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        title: formData.title,
        patientName: selectedContact ? 
          `${selectedContact.firstNameLowerCase || ''} ${selectedContact.lastNameLowerCase || ''}`.trim() || selectedContact.name :
          'Unknown Patient',
        patientId: formData.patientId,
        provider: formData.provider,
        type: formData.type,
        status: 'scheduled',
        startTime: startDateTime,
        endTime: endDateTime,
        location: formData.location,
        notes: formData.notes
      };

      setAppointments(prev => [...prev, newAppointment]);
      setIsCreateAppointmentOpen(false);
      
      toast({
        title: "Appointment Created",
        description: `Appointment with ${newAppointment.patientName} has been scheduled.`,
      });
      
      // Reset form
      setFormData({
        patientId: "",
        title: "",
        type: "",
        provider: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        notes: ""
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success";
      case "scheduled": return "bg-medical-blue/10 text-medical-blue";
      case "completed": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Treatment": return "bg-medical-teal/10 text-medical-teal";
      case "Consultation": return "bg-primary/10 text-primary";
      case "Physical Therapy": return "bg-yellow-500/10 text-yellow-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.startTime.toDateString() === date.toDateString()
    );
  };

  const renderMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const days = [];
    const iteratorDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayAppointments = getAppointmentsForDate(iteratorDate);
      const isCurrentMonth = iteratorDate.getMonth() === firstDayOfMonth.getMonth();
      const isToday = iteratorDate.toDateString() === new Date().toDateString();
      
      days.push(
        <div
          key={iteratorDate.toISOString()}
          className={`min-h-[120px] border border-border/30 p-2 ${
            isCurrentMonth ? 'bg-background' : 'bg-muted/20'
          } ${isToday ? 'ring-2 ring-medical-blue' : ''}`}
        >
          <div className={`text-sm font-medium mb-2 ${
            isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
          } ${isToday ? 'text-medical-blue' : ''}`}>
            {iteratorDate.getDate()}
          </div>
          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map(apt => (
              <div
                key={apt.id}
                className="text-xs p-1 rounded bg-medical-blue/10 text-medical-blue truncate cursor-pointer hover:bg-medical-blue/20"
              >
                {apt.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {apt.patientName}
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayAppointments.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      
      iteratorDate.setDate(iteratorDate.getDate() + 1);
    }
    
    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-4 text-center font-medium text-sm bg-muted/50 border border-border/30">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderAppointmentsList = () => {
    const filteredAppointments = view === 'day' 
      ? getAppointmentsForDate(currentDate)
      : appointments.filter(apt => {
          if (view === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return apt.startTime >= startOfWeek && apt.startTime <= endOfWeek;
          }
          return apt.startTime.getMonth() === currentDate.getMonth();
        });

    return (
      <div className="space-y-3">
        {filteredAppointments.map(apt => (
          <Card key={apt.id} className="border border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{apt.title}</h4>
                    <Badge variant="secondary" className={getStatusColor(apt.status)}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className={getTypeColor(apt.type)}>
                      {apt.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{apt.patientName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {apt.startTime.toLocaleString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })} - {apt.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{apt.provider}</span>
                    </div>
                    {apt.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{apt.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No appointments scheduled for this {view}
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
                <p className="text-muted-foreground">Manage appointments and schedules</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button size="sm" onClick={() => setIsCreateAppointmentOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>

            {/* Calendar Controls */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigateDate('prev')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigateDate('next')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-semibold">{getDateRangeText()}</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex rounded-lg border">
                      <Button
                        variant={view === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('month')}
                        className="rounded-r-none"
                      >
                        Month
                      </Button>
                      <Button
                        variant={view === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('week')}
                        className="rounded-none border-x-0"
                      >
                        Week
                      </Button>
                      <Button
                        variant={view === 'day' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('day')}
                        className="rounded-l-none"
                      >
                        Day
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading calendar...
                </div>
              ) : (
                <div className="space-y-6">
                  {view === 'month' ? (
                    <Card className="border border-border/50 shadow-sm">
                      <CardContent className="p-0">
                        {renderMonthView()}
                      </CardContent>
                    </Card>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {view === 'day' ? 'Today\'s' : 'This Week\'s'} Appointments
                      </h3>
                      {renderAppointmentsList()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Create Appointment Modal */}
          <Dialog open={isCreateAppointmentOpen} onOpenChange={setIsCreateAppointmentOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  New Appointment
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCreateAppointmentOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="patientId">Patient *</Label>
                  <Select 
                    value={formData.patientId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact: any) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {`${contact.firstNameLowerCase || ''} ${contact.lastNameLowerCase || ''}`.trim() || contact.name || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Appointment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Chiropractic Adjustment"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Treatment">Treatment</SelectItem>
                        <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider *</Label>
                    <Select 
                      value={formData.provider} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Silverman">Dr. Silverman</SelectItem>
                        <SelectItem value="PT Thompson">PT Thompson</SelectItem>
                        <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Treatment Room 1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Appointment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}