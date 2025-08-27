import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { useCalendars } from "@/hooks/useCalendars";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { AppointmentDetailDialog } from "@/components/appointments/AppointmentDetailDialog";
import { GHLHealthCheck } from "@/components/GHLHealthCheck";
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

// Define display appointment interface for calendar UI
interface DisplayAppointment {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  provider: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  startTime: Date;
  endTime: Date;
  location?: string;
  notes?: string;
}

export default function Calendar() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayAppointments, setDisplayAppointments] = useState<DisplayAppointment[]>([]);
  const [contacts, setContacts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<DisplayAppointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const { appointments, loading, createAppointment, fetchAppointments } = useAppointments();
  const { calendars, loading: calendarsLoading } = useCalendars();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Convert appointments to display format when appointments change
    const convertedAppointments: DisplayAppointment[] = appointments.map(apt => ({
      id: apt.id,
      title: apt.title,
      patientName: apt.contact_name || 'Unknown Patient',
      patientId: apt.contact_id,
      provider: apt.provider_name || 'Unassigned',
      type: apt.type,
      status: apt.status,
      startTime: new Date(apt.start_time),
      endTime: new Date(apt.end_time),
      location: apt.location,
      notes: apt.notes
    }));
    setDisplayAppointments(convertedAppointments);
  }, [appointments]);

  const loadData = async () => {
    try {
      // Load patients from Supabase
      const { data: patientsData, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email')
        .eq('is_active', true)
        .order('first_name');

      if (error) {
        console.error('Error loading patients:', error);
      } else {
        const formattedContacts = (patientsData || []).map((patient: any) => ({
          id: patient.id,
          name: patient.first_name && patient.last_name 
            ? `${patient.first_name} ${patient.last_name}`
            : patient.email || 'Unknown Patient'
        }));
        setContacts(formattedContacts);
      }

      // Load providers from profiles
      const { data: providersData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('is_active', true)
        .in('role', ['doctor', 'provider', 'staff'])
        .order('first_name');

      const formattedProviders = (providersData || []).map((provider: any) => ({
        id: provider.user_id,
        name: provider.first_name && provider.last_name 
          ? `${provider.first_name} ${provider.last_name}`
          : provider.email || 'Provider'
      }));
      setProviders(formattedProviders);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      await createAppointment(appointmentData);
      setIsCreateAppointmentOpen(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to create appointment:', error);
    }
  };

  const handleAppointmentClick = (appointment: DisplayAppointment) => {
    setSelectedAppointment(appointment);
    setIsDetailDialogOpen(true);
  };

  const handleEditAppointment = (appointment: DisplayAppointment) => {
    // Close detail dialog and open edit form
    setIsDetailDialogOpen(false);
    // TODO: Implement edit functionality
    console.log('Edit appointment:', appointment);
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
    return displayAppointments.filter(apt => 
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
                className="text-xs p-1 rounded bg-medical-blue/10 text-medical-blue truncate cursor-pointer hover:bg-medical-blue/20 transition-colors"
                onClick={() => handleAppointmentClick(apt)}
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
      : displayAppointments.filter(apt => {
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
          <Card 
            key={apt.id} 
            className="border border-border/50 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => handleAppointmentClick(apt)}
          >
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAppointment(apt);
                  }}
                >
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
                <GHLHealthCheck />
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
            <AppointmentForm
              contacts={contacts}
              providers={providers}
              calendars={calendars}
              onSubmit={handleCreateAppointment}
              onCancel={() => setIsCreateAppointmentOpen(false)}
              loading={loading || calendarsLoading}
            />
          </Dialog>

          {/* Appointment Detail Dialog */}
          <AppointmentDetailDialog
            appointment={selectedAppointment}
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            onEdit={handleEditAppointment}
          />
        </div>
      </Layout>
    </AuthGuard>
  );
}