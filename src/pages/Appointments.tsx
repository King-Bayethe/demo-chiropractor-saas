import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { AuthGuard } from '@/components/AuthGuard';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, RefreshCw, Search, Filter } from 'lucide-react';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { useAppointments, Appointment, CreateAppointmentData } from '@/hooks/useAppointments';
import { useGHLApi } from '@/hooks/useGHLApi';
import { useCalendars } from '@/hooks/useCalendars';

type CalendarView = 'month' | 'week' | 'day' | 'list';

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string }>>([]);
  const [providers] = useState<Array<{ id: string; name: string }>>([
    { id: '1', name: 'Dr. Smith' },
    { id: '2', name: 'Dr. Johnson' },
    { id: '3', name: 'Nurse Wilson' },
  ]);

  const { 
    appointments, 
    loading, 
    error, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment, 
    syncAppointments 
  } = useAppointments();
  
  const ghlApi = useGHLApi();
  const { calendars, loading: calendarsLoading } = useCalendars();

  // Load contacts on component mount
  React.useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactsData = await ghlApi.contacts.getAll();
        const formattedContacts = contactsData.contacts?.map((contact: any) => ({
          id: contact.id,
          name: contact.firstName && contact.lastName 
            ? `${contact.firstName} ${contact.lastName}`
            : contact.email || contact.phone || 'Unknown Contact'
        })) || [];
        setContacts(formattedContacts);
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };
    loadContacts();
  }, []);

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), date)
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (view === 'day') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'list':
        return 'All Appointments';
      default:
        return '';
    }
  };

  const handleCreateAppointment = async (data: CreateAppointmentData) => {
    try {
      await createAppointment(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAppointment = async (data: CreateAppointmentData) => {
    if (!editingAppointment) return;
    
    try {
      await updateAppointment(editingAppointment.id, data);
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleStatusChange = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateAppointment(appointmentId, { status });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-px bg-muted">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-background p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={day.toISOString()}
              className={`bg-background p-2 min-h-[120px] ${
                isCurrentMonth ? '' : 'text-muted-foreground'
              } ${isToday(day) ? 'bg-primary/5' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    onClick={() => handleEditAppointment(appointment)}
                  >
                    {format(new Date(appointment.start_time), 'HH:mm')} {appointment.title}
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
        })}
      </div>
    );
  };

  const renderListView = () => {
    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {appointments.length === 0 ? 'No appointments found.' : 'No appointments match your filters.'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredAppointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    );
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Appointments</h1>
                <p className="text-muted-foreground">Manage your appointments and schedule</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncAppointments}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                  </Button>
                </DialogTrigger>
                <AppointmentForm
                  contacts={contacts}
                  providers={providers}
                  calendars={calendars}
                  onSubmit={handleCreateAppointment}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  loading={loading || calendarsLoading}
                />
              </Dialog>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-1">
                  {filteredAppointments.length !== appointments.length && (
                    <Badge variant="secondary">
                      {filteredAppointments.length} of {appointments.length}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => navigateDate('prev')}>
                    ←
                  </Button>
                  <h2 className="text-xl font-semibold">{getDateRangeText()}</h2>
                  <Button variant="outline" onClick={() => navigateDate('next')}>
                    →
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                </div>
                
                <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {view === 'month' ? renderMonthView() : renderListView()}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            {editingAppointment && (
              <AppointmentForm
                appointment={editingAppointment}
                contacts={contacts}
                providers={providers}
                calendars={calendars}
                onSubmit={handleUpdateAppointment}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingAppointment(null);
                }}
                loading={loading}
              />
            )}
          </Dialog>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}