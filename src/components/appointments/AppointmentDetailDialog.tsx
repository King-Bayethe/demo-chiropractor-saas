import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  MapPin,
  FileText,
  Calendar,
  Edit,
  X
} from "lucide-react";

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

interface AppointmentDetailDialogProps {
  appointment: DisplayAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (appointment: DisplayAppointment) => void;
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onEdit
}: AppointmentDetailDialogProps) {
  if (!appointment) return null;

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
      case "Physical Therapy": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {appointment.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Type Badges */}
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={getStatusColor(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
            <Badge variant="secondary" className={getTypeColor(appointment.type)}>
              {appointment.type}
            </Badge>
          </div>

          <Separator />

          {/* Appointment Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Patient</div>
                <div className="text-sm text-muted-foreground">{appointment.patientName}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Date</div>
                <div className="text-sm text-muted-foreground">
                  {appointment.startTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Time</div>
                <div className="text-sm text-muted-foreground">
                  {appointment.startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {appointment.endTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>


            {appointment.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{appointment.location}</div>
                </div>
              </div>
            )}

            {appointment.notes && (
              <div className="flex items-start space-x-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Notes</div>
                  <div className="text-sm text-muted-foreground">{appointment.notes}</div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(appointment)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Appointment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}