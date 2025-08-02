import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Phone, Mail, MapPin, FileText, Clock } from "lucide-react";

interface PatientProfileHeaderProps {
  patient: {
    id: string;
    name: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    medicalHistory?: string[];
    allergies?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  isQuickNote?: boolean;
  onToggleMode?: () => void;
}

export function PatientProfileHeader({ patient, isQuickNote = false, onToggleMode }: PatientProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
                <Badge variant="outline" className="text-xs">
                  ID: {patient.id.slice(-8)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{formatAge(patient.dateOfBirth)} years</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                </div>
                
                {patient.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                )}
                
                {patient.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-xs">{patient.email}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {patient.address && (
                <div className="flex items-start space-x-2 mt-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Address</p>
                    <p className="text-sm">{patient.address}</p>
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
        
        {/* Medical History & Allergies */}
        {(patient.medicalHistory?.length || patient.allergies?.length) && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Medical History</h4>
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {patient.emergencyContact && (
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-foreground mb-2">Emergency Contact</h4>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{patient.emergencyContact.name}</span>
                  {' '}({patient.emergencyContact.relationship}) - {patient.emergencyContact.phone}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}