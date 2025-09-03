import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarIcon, Clock, User, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile, useIsTablet, useDeviceType } from '@/hooks/use-breakpoints';

interface DisplayAppointment {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
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
  onTimeSlotClick?: (date: Date, time: string) => void;
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
  const timeDisplay = format(appointment.startTime, 'h:mm a');
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-sm border-l-4",
        getStatusColor(appointment.status),
        compact ? "p-0.5 mb-1" : "p-2 mb-2"
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? "p-1" : "p-2"}>
        {compact ? (
          // Compact view for month and week
          <div className="space-y-0.5">
            <div className="font-medium text-xs text-primary leading-tight">
              {timeDisplay}
            </div>
            <div className="text-xs font-medium leading-tight truncate" title={appointment.patientName}>
              {appointment.patientName}
            </div>
            <div className="text-xs text-muted-foreground leading-tight truncate" title={appointment.type}>
              {appointment.type}
            </div>
          </div>
        ) : (
          // Full view for day view and details
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm leading-tight">
                {appointment.patientName}
              </h4>
              <Badge variant="outline" className="text-xs">
                {appointment.status}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm">{appointment.type}</span>
              </div>
              
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function CalendarGrid({ view, currentDate, appointments, onAppointmentClick, onAppointmentEdit, onDateSelect, onTimeSlotClick }: CalendarGridProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const deviceType = useDeviceType();
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
            <div key={day} className={cn("text-center font-medium text-muted-foreground", 
              deviceType === 'mobile' ? "p-2 text-xs" : 
              deviceType === 'tablet' ? "p-2.5 text-sm" : 
              "p-3 text-sm"
            )}>
              {deviceType === 'mobile' ? day.slice(0, 1) : day}
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
                  "bg-background overflow-y-auto touch-manipulation",
                  deviceType === 'mobile' ? "p-1 min-h-[80px]" : 
                  deviceType === 'tablet' ? "p-1.5 min-h-[100px]" : 
                  "p-2 min-h-[120px]",
                  !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/30",
                  isToday(day) && "bg-primary/5 border-2 border-primary/20"
                )}
                >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    deviceType === 'mobile' ? "h-6 w-6 p-0 text-xs font-normal mb-1" : 
                    deviceType === 'tablet' ? "h-7 w-7 p-0 text-sm font-normal mb-1 touch-manipulation" : 
                    "h-8 w-8 p-0 font-normal mb-1",
                    isToday(day) && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  {format(day, 'd')}
                </Button>
                
                <div className="space-y-0.5">
                  {dayAppointments.slice(0, 4).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => onAppointmentClick(appointment)}
                      compact
                    />
                  ))}
                  {dayAppointments.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center py-0.5 bg-muted/50 rounded">
                      +{dayAppointments.length - 4} more
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

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b border-border bg-background sticky top-0 z-20">
          <div className={cn(
            "border-r border-border text-center font-medium text-muted-foreground",
            deviceType === 'tablet' ? "p-2 text-xs" : "p-3 text-sm"
          )}>
            Time
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className={cn(
              "text-center border-r border-border last:border-r-0",
              deviceType === 'tablet' ? "p-2" : "p-3"
            )}>
              <div className={cn(
                "font-medium",
                deviceType === 'tablet' ? "text-xs" : "text-sm"
              )}>{format(day, 'EEE')}</div>
              <div className={cn(
                "font-semibold mt-1",
                deviceType === 'tablet' ? "text-base" : "text-lg",
                isToday(day) && cn(
                  "bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto",
                  deviceType === 'tablet' ? "w-7 h-7" : "w-8 h-8"
                )
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Main calendar grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 min-h-full">
            {/* Time labels column */}
            <div className="bg-background border-r border-border sticky left-0 z-10">
              {hours.map((hour) => (
                <div key={hour} className={cn(
                  "border-b border-border flex items-start justify-end pt-1",
                  deviceType === 'tablet' ? "h-16 pr-2" : "h-20 pr-3"
                )}>
                  <span className={cn(
                    "text-muted-foreground font-medium",
                    deviceType === 'tablet' ? "text-xs" : "text-xs"
                  )}>
                    {hour === 0 ? '12 AM' : 
                     hour === 12 ? '12 PM' :
                     hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = appointments.filter(apt => 
                isSameDay(apt.startTime, day)
              );
              
              return (
                <div key={day.toISOString()} className="border-r border-border last:border-r-0 relative">
                  {hours.map((hour) => {
                    const cellDate = new Date(day);
                    cellDate.setHours(hour, 0, 0, 0);
                    
                    return (
                      <div 
                        key={hour} 
                        className={cn(
                          "border-b border-border relative cursor-pointer hover:bg-muted/30 transition-colors touch-manipulation",
                          deviceType === 'tablet' ? "h-16" : "h-20"
                        )}
                        onClick={() => onTimeSlotClick?.(day, `${hour.toString().padStart(2, '0')}:00`)}
                      >
                        {/* 30-minute divider */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50"></div>
                        
                        {/* Half-hour click zones */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-1/2 cursor-pointer hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTimeSlotClick?.(day, `${hour.toString().padStart(2, '0')}:00`);
                          }}
                        />
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTimeSlotClick?.(day, `${hour.toString().padStart(2, '0')}:30`);
                          }}
                        />
                      </div>
                    );
                  })}
                  
                  {/* Absolute positioned appointments */}
                  {dayAppointments.map((appointment) => {
                    const startHour = appointment.startTime.getHours();
                    const startMinutes = appointment.startTime.getMinutes();
                    const durationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
                    const durationHours = durationMs / (1000 * 60 * 60);
                    
                    // Calculate position and height (tablet: 64px per hour, desktop: 80px per hour)
                    const hourHeight = deviceType === 'tablet' ? 64 : 80;
                    const topPosition = (startHour * hourHeight) + (startMinutes / 60 * hourHeight);
                    const height = Math.max(durationHours * hourHeight, 20); // Minimum 20px height
                    
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 z-10 rounded-md shadow-sm"
                        style={{
                          top: `${topPosition}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div 
                          className={cn(
                            "h-full rounded-md border-l-4 p-1 overflow-hidden cursor-pointer",
                            "bg-primary/10 border-primary hover:bg-primary/20 transition-colors"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                        >
                          <div className="text-xs font-medium text-primary truncate">
                            {appointment.patientName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {format(appointment.startTime, 'h:mm a')}
                          </div>
                          {height > 40 && (
                            <div className="text-xs text-muted-foreground truncate">
                              {appointment.type}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Day view - Google Calendar style
  const dayAppointments = appointments.filter(apt => 
    isSameDay(apt.startTime, currentDate)
  ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Day header */}
      <div className="p-4 border-b border-border bg-background sticky top-0 z-20">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <span>{format(currentDate, 'EEEE, MMMM d, yyyy')}</span>
          {isToday(currentDate) && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">Today</Badge>
          )}
        </h2>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-12 min-h-full">
          {/* Time labels column */}
          <div className="col-span-2 bg-background border-r border-border sticky left-0 z-10">
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-border flex items-start justify-end pr-3 pt-1">
                <span className="text-sm text-muted-foreground font-medium">
                  {hour === 0 ? '12:00 AM' : 
                   hour === 12 ? '12:00 PM' :
                   hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Main appointment area */}
          <div className="col-span-10 relative">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-20 border-b border-border relative cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onTimeSlotClick?.(currentDate, `${hour.toString().padStart(2, '0')}:00`)}
              >
                {/* 30-minute divider */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50"></div>
                
                {/* Half-hour click zones */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 cursor-pointer hover:bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeSlotClick?.(currentDate, `${hour.toString().padStart(2, '0')}:00`);
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer hover:bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeSlotClick?.(currentDate, `${hour.toString().padStart(2, '0')}:30`);
                  }}
                />
              </div>
            ))}
            
            {/* Absolute positioned appointments */}
            {dayAppointments.map((appointment) => {
              const startHour = appointment.startTime.getHours();
              const startMinutes = appointment.startTime.getMinutes();
              const durationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
              const durationHours = durationMs / (1000 * 60 * 60);
              
              // Calculate position and height
              const topPosition = (startHour * 80) + (startMinutes / 60 * 80); // 80px per hour (h-20)
              const height = Math.max(durationHours * 80, 20); // Minimum 20px height
              
              return (
                <div
                  key={appointment.id}
                  className="absolute left-2 right-2 z-10 rounded-md shadow-sm"
                  style={{
                    top: `${topPosition}px`,
                    height: `${height}px`,
                  }}
                >
                  <div 
                    className={cn(
                      "h-full rounded-md border-l-4 p-2 overflow-hidden cursor-pointer",
                      "bg-primary/10 border-primary hover:bg-primary/20 transition-colors"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
                    }}
                  >
                    <div className="font-medium text-sm text-primary truncate">
                      {appointment.patientName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
                    </div>
                    {height > 60 && (
                      <>
                         <div className="text-sm text-muted-foreground truncate mt-1">
                           {appointment.type}
                         </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};