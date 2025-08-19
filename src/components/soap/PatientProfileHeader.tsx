import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Phone, Mail, MapPin, FileText, Clock } from "lucide-react";
import { Patient } from "@/hooks/usePatients";
import { mapSupabasePatientToProfileHeader } from "@/utils/patientMapping";

interface PatientProfileHeaderProps {
  patient: Patient;
  isQuickNote?: boolean;
  onToggleMode?: () => void;
}

export function PatientProfileHeader({ patient, isQuickNote = false, onToggleMode }: PatientProfileHeaderProps) {
  // Map Supabase patient data to display format
  const displayPatient = mapSupabasePatientToProfileHeader(patient);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={displayPatient.avatar} alt={displayPatient.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(displayPatient.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{displayPatient.name}</h2>
                <Badge variant="outline" className="text-xs">
                  ID: {displayPatient.id.slice(-8)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{displayPatient.age} years</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium">{displayPatient.gender}</p>
                  </div>
                </div>
                
                {displayPatient.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{displayPatient.phone}</p>
                    </div>
                  </div>
                )}
                
                {displayPatient.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-xs">{displayPatient.email}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {displayPatient.address && (
                <div className="flex items-start space-x-2 mt-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Address</p>
                    <p className="text-sm">{displayPatient.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onToggleMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleMode}
                className="flex items-center space-x-2"
              >
                {isQuickNote ? <FileText className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>{isQuickNote ? 'Full Assessment' : 'Quick Note'}</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Medical History & Emergency Contact */}
        {(displayPatient.medicalHistory?.length || displayPatient.emergencyContact) && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPatient.medicalHistory && displayPatient.medicalHistory.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Medical History</h4>
                  <div className="flex flex-wrap gap-1">
                    {displayPatient.medicalHistory.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {displayPatient.emergencyContact && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Emergency Contact</h4>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{displayPatient.emergencyContact.name}</span>
                    {' '}({displayPatient.emergencyContact.relationship}) - {displayPatient.emergencyContact.phone}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}