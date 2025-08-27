import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarIcon, Clock, User, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  onDateSelect: (date: Date) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-primary/10 text-primary border-primary/20';
  }
};

const AppointmentCard: React.FC<{
  appointment: DisplayAppointment;
  onClick: () => void;
  compact?: boolean;
}> = ({ appointment, onClick, compact = false }) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-sm border-l-4",
        getStatusColor(appointment.status),
        compact ? "p-1 mb-1" : "p-2 mb-2"
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? "p-1" : "p-2"}>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "font-medium truncate",
              compact ? "text-xs" : "text-sm"
            )}>
              {appointment.title}
            </h4>
            <Badge variant="outline" className="text-xs">
              {appointment.status}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="text-xs truncate">{appointment.patientName}</span>
            </div>
            
            {!compact && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Stethoscope className="h-3 w-3" />
                <span className="text-xs truncate">{appointment.provider}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  view,
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentEdit,
  onDateSelect,
}) => {
  if (view === 'month') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="h-full flex flex-col">
        {/* Days of the week header */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 gap-px bg-border">
          {calendarDays.map((day) => {
            const dayAppointments = appointments.filter(apt => 
              isSameDay(apt.startTime, day)
            );
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "bg-background p-2 min-h-[120px] overflow-y-auto",
                  !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/30",
                  isToday(day) && "bg-primary/5 border-2 border-primary/20"
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 font-normal mb-1",
                    isToday(day) && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  {format(day, 'd')}
                </Button>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => onAppointmentClick(appointment)}
                      compact
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'week') {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: endOfWeek(currentDate) 
    });

    return (
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-8 border-b border-border">
          <div className="p-3 border-r border-border"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-3 text-center">
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className={cn(
                "text-sm",
                isToday(day) && "font-bold text-primary"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 gap-px bg-border">
            {/* Time column */}
            <div className="bg-background">
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="h-16 border-b border-border p-2 text-sm text-muted-foreground">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayAppointments = appointments.filter(apt => 
                isSameDay(apt.startTime, day)
              );
              
              return (
                <div key={day.toISOString()} className="bg-background">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="h-16 border-b border-border p-1 relative">
                      {dayAppointments
                        .filter(apt => apt.startTime.getHours() === hour)
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onClick={() => onAppointmentClick(appointment)}
                            compact
                          />
                        ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Day view
  const dayAppointments = appointments.filter(apt => 
    isSameDay(apt.startTime, currentDate)
  ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {dayAppointments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No appointments scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => onAppointmentClick(appointment)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};