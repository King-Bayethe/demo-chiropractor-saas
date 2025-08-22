import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Car, 
  Heart, 
  Edit, 
  FileText, 
  CreditCard,
  Calendar,
  Building
} from 'lucide-react';

interface InsuranceCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  isSensitiveVisible: boolean;
  onToggleSensitive: () => void;
}

export const InsuranceCard: React.FC<InsuranceCardProps> = ({
  patient,
  isEditing,
  onEdit,
  isSensitiveVisible,
  onToggleSensitive
}) => {
  const maskData = (data: string) => {
    if (!data || isSensitiveVisible) return data;
    return data.replace(/./g, '*');
  };

  const hasHealthInsurance = patient.health_insurance_carrier || patient.health_insurance_policy_number;
  const hasAutoInsurance = patient.auto_insurance_carrier || patient.auto_insurance_policy_number || patient.auto_insurance_claim_number;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Insurance Information
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
        {/* Health Insurance */}
        {hasHealthInsurance && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-red-500" />
              <h4 className="font-medium text-foreground">Health Insurance</h4>
            </div>
            
            {patient.health_insurance_carrier && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Carrier
                </h5>
                <p className="text-sm">{patient.health_insurance_carrier}</p>
              </div>
            )}
            
            {patient.health_insurance_policy_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Policy Number
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.health_insurance_policy_number)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Auto Insurance */}
        {hasAutoInsurance && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Car className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-foreground">Auto Insurance</h4>
            </div>
            
            {patient.auto_insurance_carrier && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Carrier
                </h5>
                <p className="text-sm">{patient.auto_insurance_carrier}</p>
              </div>
            )}
            
            {patient.auto_insurance_policy_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Policy Number
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.auto_insurance_policy_number)}
                </p>
              </div>
            )}
            
            {patient.auto_insurance_claim_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Claim Number
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.auto_insurance_claim_number)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Insurance Info */}
        {(patient.date_of_loss || patient.policy_limits) && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Additional Information</h4>
            
            {patient.date_of_loss && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date of Loss
                </h5>
                <p className="text-sm">{new Date(patient.date_of_loss).toLocaleDateString()}</p>
              </div>
            )}
            
            {patient.policy_limits && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1">Policy Limits</h5>
                <Badge variant="outline">{patient.policy_limits}</Badge>
              </div>
            )}
          </div>
        )}

        {/* No Insurance Data */}
        {!hasHealthInsurance && !hasAutoInsurance && (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insurance information recorded</p>
          </div>
        )}

        {/* Sensitive Data Toggle */}
        {!isSensitiveVisible && (hasHealthInsurance || hasAutoInsurance) && (
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