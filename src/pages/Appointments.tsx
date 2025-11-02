import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';

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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { supabase } from '@/integrations/supabase/client';

type CalendarView = 'month' | 'week' | 'day' | 'list';

export default function Appointments() {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(isMobile ? 'list' : 'month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string }>>([]);
  const [searchParams] = useSearchParams();
  
  // Get preselected patient from URL params
  const preselectedPatientId = searchParams.get('patientId');
  
  

  const { 
    appointments, 
    loading, 
    error, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment
  } = useAppointments();

  // Load patients on component mount
  React.useEffect(() => {
    const loadPatients = async () => {
      try {
        const { data: patientsData, error } = await supabase
          .from('patients')
          .select('id, first_name, last_name, email')
          .eq('is_active', true)
          .order('first_name');

        if (error) {
          console.error('Error loading patients:', error);
          return;
        }

        const formattedContacts = (patientsData || []).map((patient: any) => ({
          id: patient.id,
          name: patient.first_name && patient.last_name 
            ? `${patient.first_name} ${patient.last_name}`
            : patient.email || 'Unknown Patient'
        }));
        setContacts(formattedContacts);
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };
    loadPatients();
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
    <Layout>
        <div className="space-y-6">
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col gap-4"
          )}>
            <div className="flex items-center gap-3">
              <CalendarDays className={cn("text-primary", isMobile ? "h-6 w-6" : "h-8 w-8")} />
              <div>
                <h1 className={cn("font-bold", isMobile ? "text-2xl" : "text-3xl")}>Appointments</h1>
                <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "")}>Manage your appointments and schedule</p>
              </div>
            </div>
            
            <div className={cn("flex items-center gap-2", isMobile && "w-full justify-center")}>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"} className={isMobile ? "flex-1" : ""}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isMobile ? "New" : "New Appointment"}
                  </Button>
                </DialogTrigger>
                <AppointmentForm
                  contacts={contacts}
                  onSubmit={handleCreateAppointment}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  loading={loading}
                  preselectedPatientId={preselectedPatientId || undefined}
                />
              </Dialog>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className={cn(
                "flex items-center gap-4",
                isMobile ? "flex-col space-y-4" : "flex-wrap"
              )}>
                <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(isMobile ? "flex-1" : "w-64")}
                  />
                </div>
                
                <div className={cn(
                  "flex items-center gap-2",
                  isMobile ? "w-full justify-between" : ""
                )}>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className={cn(isMobile ? "flex-1" : "w-32")}>
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
                    <SelectTrigger className={cn(isMobile ? "flex-1" : "w-32")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="initial_consultation">Initial Consultation</SelectItem>
                      <SelectItem value="follow_up_visit">Follow-up Visit</SelectItem>
                      <SelectItem value="annual_physical">Annual Physical</SelectItem>
                      <SelectItem value="wellness_exam">Wellness Exam</SelectItem>
                      <SelectItem value="diagnostic_procedure">Diagnostic Procedure</SelectItem>
                      <SelectItem value="therapy_session">Therapy Session</SelectItem>
                      <SelectItem value="lab_work">Lab Work</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      <SelectItem value="urgent_care">Urgent Care</SelectItem>
                      <SelectItem value="specialist_consultation">Specialist Consultation</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="preventive_care">Preventive Care</SelectItem>
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
              <div className={cn(
                "flex items-center justify-between",
                isMobile && "flex-col gap-4"
              )}>
                <div className={cn(
                  "flex items-center gap-4",
                  isMobile && "w-full justify-center"
                )}>
                  <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => navigateDate('prev')}>
                    ←
                  </Button>
                  <h2 className={cn("font-semibold", isMobile ? "text-lg" : "text-xl")}>{getDateRangeText()}</h2>
                  <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => navigateDate('next')}>
                    →
                  </Button>
                  <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                </div>
                
                <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                  <SelectTrigger className={cn(isMobile ? "w-full" : "w-32")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {!isMobile && <SelectItem value="month">Month</SelectItem>}
                    {!isMobile && <SelectItem value="week">Week</SelectItem>}
                    {!isMobile && <SelectItem value="day">Day</SelectItem>}
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {(view === 'month' && !isMobile) ? renderMonthView() : renderListView()}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            {editingAppointment && (
              <AppointmentForm
                appointment={editingAppointment}
                contacts={contacts}
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
    );
}