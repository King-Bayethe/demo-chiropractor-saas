import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Phone, Mail, MapPin, User, Calendar, Shield } from 'lucide-react';

interface DemographicsCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  isSensitiveVisible: boolean;
  onToggleSensitive: () => void;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  patient,
  isEditing,
  onEdit,
  isSensitiveVisible,
  onToggleSensitive
}) => {
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatAddress = () => {
    const parts = [
      patient.address,
      patient.city,
      patient.state && patient.zip ? `${patient.state} ${patient.zip}` : patient.state || patient.zip
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Demographics
        </CardTitle>
        <Button 
          onClick={onEdit} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Full Name</h4>
            <p className="font-medium">{patient.first_name} {patient.last_name}</p>
          </div>
          
          {patient.date_of_birth && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date of Birth
              </h4>
              <p>{new Date(patient.date_of_birth).toLocaleDateString()}</p>
            </div>
          )}
          
          {patient.gender && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Gender</h4>
              <Badge variant="secondary">{patient.gender}</Badge>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-foreground">Contact Information</h4>
          
          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{isSensitiveVisible ? formatPhone(patient.phone) : '***-***-****'}</span>
            </div>
          )}
          
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{isSensitiveVisible ? patient.email : '***@***.***'}</span>
            </div>
          )}
          
          {formatAddress() && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {isSensitiveVisible ? formatAddress() : '*** *** *** ***'}
              </span>
            </div>
          )}
        </div>

        {/* Sensitive Data Toggle */}
        {!isSensitiveVisible && (
          <Button 
            onClick={onToggleSensitive}
            variant="outline" 
            size="sm"
            className="w-full mt-4 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Reveal Sensitive Information
          </Button>
        )}
      </CardContent>
    </Card>
  );
};