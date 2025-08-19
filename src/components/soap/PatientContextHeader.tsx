import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Phone, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface PatientContextHeaderProps {
  patient: any;
  showNavigationButton?: boolean;
}

export function PatientContextHeader({ 
  patient, 
  showNavigationButton = true 
}: PatientContextHeaderProps) {
  const navigate = useNavigate();

  const getPatientName = (): string => {
    if (!patient) return 'Unknown Patient';
    
    const firstName = patient.first_name || patient.firstNameLowerCase || '';
    const lastName = patient.last_name || patient.lastNameLowerCase || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || patient.email || 'Unknown Patient';
  };

  const getPatientAge = (): string => {
    if (!patient?.date_of_birth) return 'Age unknown';
    
    const birthDate = new Date(patient.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    return `${age} years old`;
  };

  const handleViewProfile = () => {
    if (patient?.id) {
      navigate(`/patients/${patient.id}`);
    }
  };

  if (!patient) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{getPatientName()}</h3>
                {patient.case_type && (
                  <Badge variant="outline" className="text-xs">
                    {patient.case_type}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {patient.date_of_birth && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(patient.date_of_birth), 'MMM d, yyyy')} ({getPatientAge()})
                  </div>
                )}
                
                {patient.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {patient.phone}
                  </div>
                )}
                
                {patient.city && patient.state && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {patient.city}, {patient.state}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showNavigationButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Full Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}