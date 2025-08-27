import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { useCalendars } from "@/hooks/useCalendars";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { AppointmentDetailDialog } from "@/components/appointments/AppointmentDetailDialog";
import { CalendarLayout } from "@/components/calendar/CalendarLayout";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { SmartSchedulingPanel } from "@/components/calendar/SmartSchedulingPanel";

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
  const [isSmartSchedulingOpen, setIsSmartSchedulingOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<DisplayAppointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    providers: [] as string[],
    status: [] as string[],
    types: [] as string[]
  });
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
      setIsSmartSchedulingOpen(false);
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
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

  // Filter appointments based on current filters
  const filteredAppointments = displayAppointments.filter(apt => {
    if (filters.status.length > 0 && !filters.status.includes(apt.status)) return false;
    if (filters.types.length > 0 && !filters.types.includes(apt.type.toLowerCase())) return false;
    if (filters.providers.length > 0 && !filters.providers.includes(apt.provider)) return false;
    return true;
  });

  return (
    <AuthGuard>
      <Layout>
        <CalendarLayout
          view={view}
          onViewChange={setView}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onCreateAppointment={() => setIsSmartSchedulingOpen(true)}
          filters={filters}
          onFiltersChange={setFilters}
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            </div>
          ) : (
            <div className="h-full p-6">
              <CalendarGrid
                view={view}
                currentDate={currentDate}
                appointments={filteredAppointments}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentEdit={handleEditAppointment}
                onDateSelect={setCurrentDate}
              />
            </div>
          )}
        </CalendarLayout>

        {/* Smart Scheduling Panel */}
        <SmartSchedulingPanel
          isOpen={isSmartSchedulingOpen}
          onClose={() => setIsSmartSchedulingOpen(false)}
          onScheduleAppointment={handleCreateAppointment}
        />

        {/* Legacy Create Appointment Modal */}
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
      </Layout>
    </AuthGuard>
  );
}