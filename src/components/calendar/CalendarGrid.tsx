import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  User, 
  MapPin, 
  MoreVertical,
  Calendar as CalendarIcon
} from "lucide-react";

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

interface CalendarGridProps {
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  appointments: DisplayAppointment[];
  onAppointmentClick: (appointment: DisplayAppointment) => void;
  onAppointmentEdit: (appointment: DisplayAppointment) => void;
  onDateSelect?: (date: Date) => void;
}

export function CalendarGrid({
  view,
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentEdit,
  onDateSelect
}: CalendarGridProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<DisplayAppointment | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "scheduled": return "bg-medical-blue/10 text-medical-blue border-medical-blue/20";
      case "completed": return "bg-muted text-muted-foreground border-border";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Treatment": return "bg-medical-teal/10 text-medical-teal";
      case "Consultation": return "bg-primary/10 text-primary";
      case "Physical Therapy": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.startTime.toDateString() === date.toDateString()
    );
  };

  const handleDragStart = (e: React.DragEvent, appointment: DisplayAppointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedAppointment) {
      // Calculate time difference
      const timeDiff = draggedAppointment.endTime.getTime() - draggedAppointment.startTime.getTime();
      const newStartTime = new Date(targetDate);
      newStartTime.setHours(draggedAppointment.startTime.getHours());
      newStartTime.setMinutes(draggedAppointment.startTime.getMinutes());
      
      // TODO: Implement appointment rescheduling
      console.log('Reschedule appointment', draggedAppointment.id, 'to', newStartTime);
      setDraggedAppointment(null);
    }
  };

  if (view === 'month') {
    return <MonthView 
      currentDate={currentDate}
      appointments={appointments}
      onAppointmentClick={onAppointmentClick}
      onDateSelect={onDateSelect}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      getStatusColor={getStatusColor}
      getAppointmentsForDate={getAppointmentsForDate}
    />;
  }

  if (view === 'week') {
    return <WeekView 
      currentDate={currentDate}
      appointments={appointments}
      onAppointmentClick={onAppointmentClick}
      onAppointmentEdit={onAppointmentEdit}
      getStatusColor={getStatusColor}
      getTypeColor={getTypeColor}
    />;
  }

  return <DayView 
    currentDate={currentDate}
    appointments={appointments}
    onAppointmentClick={onAppointmentClick}
    onAppointmentEdit={onAppointmentEdit}
    getStatusColor={getStatusColor}
    getTypeColor={getTypeColor}
  />;
}

function MonthView({ 
  currentDate, 
  appointments, 
  onAppointmentClick, 
  onDateSelect,
  onDragStart,
  onDragOver,
  onDrop,
  getStatusColor,
  getAppointmentsForDate 
}: any) {
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
    const currentIteratorDate = new Date(iteratorDate);
    
    days.push(
      <div
        key={iteratorDate.toISOString()}
        className={`min-h-[120px] border border-border/30 p-2 hover:bg-muted/30 transition-colors cursor-pointer ${
          isCurrentMonth ? 'bg-background' : 'bg-muted/10'
        } ${isToday ? 'ring-2 ring-medical-blue bg-medical-blue/5' : ''}`}
        onClick={() => onDateSelect?.(currentIteratorDate)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, currentIteratorDate)}
      >
        <div className={`text-sm font-medium mb-2 ${
          isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
        } ${isToday ? 'text-medical-blue font-semibold' : ''}`}>
          {iteratorDate.getDate()}
        </div>
        <div className="space-y-1">
          {dayAppointments.slice(0, 3).map((apt: any) => (
            <div
              key={apt.id}
              className={`text-xs p-1.5 rounded cursor-pointer transition-all hover:shadow-sm ${getStatusColor(apt.status)}`}
              onClick={(e) => {
                e.stopPropagation();
                onAppointmentClick(apt);
              }}
              draggable
              onDragStart={(e) => onDragStart(e, apt)}
            >
              <div className="font-medium truncate">{apt.patientName}</div>
              <div className="text-xs opacity-75">
                {apt.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {dayAppointments.length > 3 && (
            <div className="text-xs text-muted-foreground font-medium">
              +{dayAppointments.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
    
    iteratorDate.setDate(iteratorDate.getDate() + 1);
  }
  
  return (
    <Card className="border border-border/50 shadow-sm">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 gap-0">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="p-4 text-center font-semibold text-sm bg-muted/50 border-b border-border/30">
              <span className="hidden sm:block">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
          {days}
        </div>
      </CardContent>
    </Card>
  );
}

function WeekView({ currentDate, appointments, onAppointmentClick, onAppointmentEdit, getStatusColor, getTypeColor }: any) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const filteredAppointments = appointments.filter((apt: any) => {
    const startOfWeekTime = startOfWeek.getTime();
    const endOfWeekTime = startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000);
    const aptTime = apt.startTime.getTime();
    return aptTime >= startOfWeekTime && aptTime < endOfWeekTime;
  });

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className="text-sm font-medium text-muted-foreground">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${
              day.toDateString() === new Date().toDateString() 
                ? 'text-medical-blue' 
                : 'text-foreground'
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-7 gap-4 min-h-[600px]">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="space-y-2">
            {appointments
              .filter((apt: any) => apt.startTime.toDateString() === day.toDateString())
              .map((apt: any) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onClick={() => onAppointmentClick(apt)}
                  onEdit={() => onAppointmentEdit(apt)}
                  getStatusColor={getStatusColor}
                  getTypeColor={getTypeColor}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({ currentDate, appointments, onAppointmentClick, onAppointmentEdit, getStatusColor, getTypeColor }: any) {
  const dayAppointments = appointments.filter((apt: any) => 
    apt.startTime.toDateString() === currentDate.toDateString()
  );

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-muted/20 rounded-lg">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dayAppointments.length} appointments scheduled
        </p>
      </div>

      <div className="space-y-3">
        {dayAppointments.map((apt: any) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            onClick={() => onAppointmentClick(apt)}
            onEdit={() => onAppointmentEdit(apt)}
            getStatusColor={getStatusColor}
            getTypeColor={getTypeColor}
            showFullDetails
          />
        ))}
        {dayAppointments.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No appointments today</h3>
            <p className="text-sm text-muted-foreground">You have a clear schedule for today</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ 
  appointment, 
  onClick, 
  onEdit, 
  getStatusColor, 
  getTypeColor, 
  showFullDetails = false 
}: any) {
  return (
    <Card 
      className="border border-border/50 cursor-pointer hover:shadow-md hover:border-medical-blue/30 transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-foreground">{appointment.title}</h4>
              <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
              <Badge variant="secondary" className={getTypeColor(appointment.type)}>
                {appointment.type}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{appointment.patientName}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {appointment.startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {appointment.endTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              {showFullDetails && (
                <>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{appointment.provider}</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment);
            }}
            className="h-8 w-8"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}