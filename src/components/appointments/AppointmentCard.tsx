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
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'no_show':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type: Appointment['type']) => {
  switch (type) {
    case 'consultation':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'treatment':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'follow_up':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'procedure':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
                className="text-red-600"
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