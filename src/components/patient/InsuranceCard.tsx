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
  Building,
  Phone,
  User,
  Hash,
  ShieldCheck
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InsuranceCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  isSensitiveVisible: boolean;
  onToggleSensitive: () => void;
  form?: any; // Add form prop for editing
}

export const InsuranceCard: React.FC<InsuranceCardProps> = ({
  patient,
  isEditing,
  onEdit,
  isSensitiveVisible,
  onToggleSensitive,
  form
}) => {
  const maskData = (data: string) => {
    if (!data || isSensitiveVisible) return data;
    return data.replace(/./g, '*');
  };

  const hasHealthInsurance = patient.health_insurance || patient.health_insurance_id || patient.group_number || patient.medicaid_medicare_id;
  const hasAutoInsurance = patient.auto_insurance_company || patient.auto_policy_number || patient.claim_number || patient.adjuster_name;
  const hasInsuranceContact = patient.insurance_phone_number;
  

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
          disabled={isEditing}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && form ? (
          // Edit Mode - Always show form fields when editing
          <div className="space-y-6">
            {/* Auto Insurance Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-foreground">Auto Insurance</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="autoInsuranceCompany">Insurance Company (Auto)</Label>
                  <Input 
                    id="autoInsuranceCompany"
                    placeholder="Enter auto insurance company" 
                    value={form?.watch('autoInsuranceCompany') || ''}
                    onChange={(e) => form?.setValue('autoInsuranceCompany', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="claimNumber">Claim Number</Label>
                  <Input 
                    id="claimNumber"
                    placeholder="Enter claim number" 
                    value={form?.watch('claimNumber') || ''}
                    onChange={(e) => form?.setValue('claimNumber', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input 
                    id="policyNumber"
                    placeholder="Enter policy number" 
                    value={form?.watch('policyNumber') || ''}
                    onChange={(e) => form?.setValue('policyNumber', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="adjustersName">Adjuster's Name</Label>
                  <Input 
                    id="adjustersName"
                    placeholder="Enter adjuster's name" 
                    value={form?.watch('adjustersName') || ''}
                    onChange={(e) => form?.setValue('adjustersName', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Health Insurance Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-foreground">Health Insurance</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="healthInsurance">Health Insurance</Label>
                  <Input 
                    id="healthInsurance"
                    placeholder="Enter health insurance provider" 
                    value={form?.watch('healthInsurance') || ''}
                    onChange={(e) => form?.setValue('healthInsurance', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="healthInsuranceId">ID#</Label>
                  <Input 
                    id="healthInsuranceId"
                    placeholder="Enter health insurance ID" 
                    value={form?.watch('healthInsuranceId') || ''}
                    onChange={(e) => form?.setValue('healthInsuranceId', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="groupNumber">Group #</Label>
                  <Input 
                    id="groupNumber"
                    placeholder="Enter group number" 
                    value={form?.watch('groupNumber') || ''}
                    onChange={(e) => form?.setValue('groupNumber', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medicaidMedicareId">Medicaid/Medicare ID #</Label>
                  <Input 
                    id="medicaidMedicareId"
                    placeholder="Enter Medicaid/Medicare ID" 
                    value={form?.watch('medicaidMedicareId') || ''}
                    onChange={(e) => form?.setValue('medicaidMedicareId', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Insurance Contact Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-foreground">Insurance Contact</h4>
              </div>
              
              <div>
                <Label htmlFor="insurancePhoneNumber">Insurance Phone Number</Label>
                <Input 
                  id="insurancePhoneNumber"
                  placeholder="Enter insurance phone number" 
                  value={form?.watch('insurancePhoneNumber') || ''}
                  onChange={(e) => form?.setValue('insurancePhoneNumber', e.target.value)}
                />
              </div>
            </div>

          </div>
        ) : (
          // Display Mode - Show data or empty state
          <div className="space-y-4">
            {/* Auto Insurance */}
            {hasAutoInsurance && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Car className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-foreground">Auto Insurance</h4>
            </div>
            
            {patient.auto_insurance_company && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Insurance Company
                </h5>
                <p className="text-sm">{patient.auto_insurance_company}</p>
              </div>
            )}
            
            {patient.claim_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Claim Number
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.claim_number)}
                </p>
              </div>
            )}
            
            {patient.auto_policy_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Policy Number
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.auto_policy_number)}
                </p>
              </div>
            )}
            
            {patient.adjuster_name && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Adjuster's Name
                </h5>
                <p className="text-sm">{patient.adjuster_name}</p>
              </div>
            )}
          </div>
        )}

        {/* Health Insurance */}
        {hasHealthInsurance && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-red-500" />
              <h4 className="font-medium text-foreground">Health Insurance</h4>
            </div>
            
            {patient.health_insurance && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Health Insurance
                </h5>
                <p className="text-sm">{patient.health_insurance}</p>
              </div>
            )}
            
            {patient.health_insurance_id && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  ID#
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.health_insurance_id)}
                </p>
              </div>
            )}
            
            {patient.group_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Group #
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.group_number)}
                </p>
              </div>
            )}

            {patient.medicaid_medicare_id && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Medicaid/Medicare ID #
                </h5>
                <p className="text-sm font-mono">
                  {maskData(patient.medicaid_medicare_id)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Insurance Contact Information */}
        {hasInsuranceContact && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-4 w-4 text-green-500" />
              <h4 className="font-medium text-foreground">Insurance Contact</h4>
            </div>
            
            {patient.insurance_phone_number && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Insurance Phone Number
                </h5>
                <p className="text-sm">{patient.insurance_phone_number}</p>
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
            {!hasHealthInsurance && !hasAutoInsurance && !hasInsuranceContact && (
              <div className="text-center py-6 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No insurance information recorded</p>
              </div>
            )}
          </div>
        )}

        {/* Sensitive Data Toggle */}
        {!isEditing && !isSensitiveVisible && (hasHealthInsurance || hasAutoInsurance || hasInsuranceContact) && (
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