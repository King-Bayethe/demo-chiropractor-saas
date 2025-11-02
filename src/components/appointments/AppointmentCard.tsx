import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, MapPin, User, Clock } from 'lucide-react';
import { Appointment } from '@/hooks/useAppointments';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onStatusChange: (appointmentId: string, status: Appointment['status']) => void;
}

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'scheduled':
      return 'bg-info/10 text-info border-info/20';
    case 'confirmed':
      return 'bg-success/10 text-success border-success/20';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'completed':
      return 'bg-muted text-muted-foreground border-border';
    case 'no_show':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getTypeColor = (type: Appointment['type']) => {
  switch (type) {
    case 'initial_consultation':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'follow_up_visit':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'annual_physical':
      return 'bg-info/10 text-info border-info/20';
    case 'wellness_exam':
      return 'bg-success/10 text-success border-success/20';
    case 'diagnostic_procedure':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'therapy_session':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'lab_work':
      return 'bg-info/10 text-info border-info/20';
    case 'telemedicine':
      return 'bg-success/10 text-success border-success/20';
    case 'urgent_care':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'specialist_consultation':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'vaccination':
      return 'bg-success/10 text-success border-success/20';
    case 'preventive_care':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const startTime = parseISO(appointment.start_time);
  const endTime = parseISO(appointment.end_time);
  const isMobile = useIsMobile();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={cn("pb-2", isMobile ? "p-3" : "p-4")}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>
              {appointment.title}
            </h3>
            <div className={cn("flex gap-2 text-muted-foreground", 
              isMobile ? "flex-col text-xs space-y-1" : "items-center gap-4 text-sm"
            )}>
              <div className="flex items-center gap-1">
                <Calendar className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                {format(startTime, 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={isMobile ? "sm" : "sm"} className={cn(isMobile ? "h-8 w-8 p-0" : "")}>
                <MoreHorizontal className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
              <DropdownMenuItem onClick={() => onEdit(appointment)}>
                Edit Appointment
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
                disabled={appointment.status === 'confirmed'}
              >
                Mark as Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(appointment.id, 'completed')}
                disabled={appointment.status === 'completed'}
              >
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
                disabled={appointment.status === 'cancelled'}
              >
                Cancel Appointment
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(appointment.id)}
                className="text-destructive"
              >
                Delete Appointment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", isMobile ? "p-3 pt-0" : "")}>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn(getStatusColor(appointment.status), isMobile ? "text-xs" : "")}>
            {appointment.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className={cn(getTypeColor(appointment.type), isMobile ? "text-xs" : "")}>
            {appointment.type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        {appointment.contact_name && (
          <div className={cn("flex items-center gap-2", isMobile ? "text-xs" : "text-sm")}>
            <User className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "text-muted-foreground")} />
            <span>{appointment.contact_name}</span>
          </div>
        )}
        
        {appointment.location && (
          <div className={cn("flex items-center gap-2", isMobile ? "text-xs" : "text-sm")}>
            <MapPin className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "text-muted-foreground")} />
            <span>{appointment.location}</span>
          </div>
        )}
        
        {appointment.notes && (
          <div className={cn("text-muted-foreground bg-muted p-2 rounded", isMobile ? "text-xs" : "text-sm")}>
            {appointment.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};