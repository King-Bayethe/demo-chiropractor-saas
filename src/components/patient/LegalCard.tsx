import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Scale, 
  Edit, 
  User, 
  Phone, 
  Building, 
  FileText,
  Calendar,
  Car
} from 'lucide-react';

interface LegalCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  isSensitiveVisible: boolean;
  onToggleSensitive: () => void;
  form?: any; // Add form prop for editing
}

export const LegalCard: React.FC<LegalCardProps> = ({
  patient,
  isEditing,
  onEdit,
  isSensitiveVisible,
  onToggleSensitive,
  form
}) => {
  const isMobile = useIsMobile();
  const maskPhone = (phone: string) => {
    if (!phone || isSensitiveVisible) return phone;
    return '***-***-****';
  };

  const hasLegalInfo = patient.attorney_name || patient.attorney_phone || patient.attorney_firm || 
                      patient.adjuster_name || patient.adjuster_phone || patient.adjuster_firm ||
                      patient.case_type || patient.accident_description;

  return (
    <Card className="h-full">
      <CardHeader className={cn(
        "pb-4",
        isMobile ? "flex-col space-y-2" : "flex flex-row items-center justify-between space-y-0"
      )}>
        <CardTitle className={cn(
          "flex items-center gap-2 font-semibold",
          isMobile ? "text-base self-start" : "text-lg"
        )}>
          <Scale className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
          Legal Information
        </CardTitle>
        <Button 
          onClick={onEdit} 
          variant="outline" 
          size={isMobile ? "sm" : "sm"}
          className={cn(
            "flex items-center gap-2",
            isMobile && "w-full"
          )}
        >
          <Edit className="h-4 w-4" />
          {isMobile ? "Edit Legal Info" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && form ? (
          // Edit Mode - Show form fields
          <div className="space-y-6">
            {/* Attorney Information Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-foreground">Attorney Information</h4>
              </div>
              
              <div className={cn(
                "gap-4",
                isMobile ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-2"
              )}>
                <div>
                  <Label htmlFor="attorneyName">Attorney's Name</Label>
                  <Input 
                    id="attorneyName"
                    placeholder="Enter attorney's name" 
                    value={form?.watch('attorneyName') || ''}
                    onChange={(e) => form?.setValue('attorneyName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="attorneyPhone">Phone Number</Label>
                  <Input 
                    id="attorneyPhone"
                    placeholder="Enter attorney's phone number" 
                    value={form?.watch('attorneyPhone') || ''}
                    onChange={(e) => form?.setValue('attorneyPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="space-y-4">
            {/* Attorney Information */}
            {(patient.attorney_name || patient.attorney_phone || patient.attorney_firm) && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground">Attorney Information</h4>
                
                {patient.attorney_name && (
                  <div>
                    <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Attorney Name
                    </h5>
                    <p className="text-sm">{patient.attorney_name}</p>
                  </div>
                )}
                
                {patient.attorney_firm && (
                  <div>
                    <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      Law Firm
                    </h5>
                    <p className="text-sm">{patient.attorney_firm}</p>
                  </div>
                )}
                
                {patient.attorney_phone && (
                  <div>
                    <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </h5>
                    <p className="text-sm font-mono">{maskPhone(patient.attorney_phone)}</p>
                  </div>
                )}
              </div>
            )}

        {/* Adjuster Information */}
        {(patient.adjuster_name || patient.adjuster_phone || patient.adjuster_firm) && (
          <div className="space-y-3 pb-4 border-b">
            <h4 className="font-medium text-foreground">Insurance Adjuster</h4>
            
            {patient.adjuster_name && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Adjuster Name
                </h5>
                <p className="text-sm">{patient.adjuster_name}</p>
              </div>
            )}
            
            {patient.adjuster_firm && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Insurance Company
                </h5>
                <p className="text-sm">{patient.adjuster_firm}</p>
              </div>
            )}
            
            {patient.adjuster_phone && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </h5>
                <p className="text-sm font-mono">{maskPhone(patient.adjuster_phone)}</p>
              </div>
            )}
          </div>
        )}

        {/* Case Information */}
        {(patient.case_type || patient.accident_description) && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Case Information</h4>
            
            {patient.case_type && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Case Type
                </h5>
                <Badge variant="secondary">{patient.case_type}</Badge>
              </div>
            )}
            
            {patient.accident_description && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  Accident Description
                </h5>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {patient.accident_description}
                </p>
              </div>
            )}
          </div>
        )}

            {/* No Legal Data */}
            {!hasLegalInfo && (
              <div className="text-center py-6 text-muted-foreground">
                <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No legal information recorded</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};