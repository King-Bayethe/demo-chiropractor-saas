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
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

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
  const hasAttorney = patient.attorney_name || patient.attorney_phone;

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
          // Edit Mode - Form Fields
          <div className="space-y-6">
            {/* Auto Insurance Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-foreground">Auto Insurance</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="autoInsuranceCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Company (Auto)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter auto insurance company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="claimNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter claim number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter policy number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="adjustersName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjuster's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter adjuster's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Health Insurance Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-foreground">Health Insurance</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="healthInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Insurance</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter health insurance provider" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="healthInsuranceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID#</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter health insurance ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="groupNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group #</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="medicaidMedicareId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicaid/Medicare ID #</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Medicaid/Medicare ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Insurance Contact Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-foreground">Insurance Contact</h4>
              </div>
              
              <FormField
                control={form.control}
                name="insurancePhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter insurance phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Attorney Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-foreground">Attorney Information</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="attorneyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attorney's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter attorney's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="attorneyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter attorney's phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        ) : (
          // Display Mode - Read Only
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

        {/* Attorney Information */}
        {hasAttorney && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-purple-500" />
              <h4 className="font-medium text-foreground">Attorney Information</h4>
            </div>
            
            {patient.attorney_name && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Attorney's Name
                </h5>
                <p className="text-sm">{patient.attorney_name}</p>
              </div>
            )}
            
            {patient.attorney_phone && (
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </h5>
                <p className="text-sm">{patient.attorney_phone}</p>
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
        {!hasHealthInsurance && !hasAutoInsurance && !hasInsuranceContact && !hasAttorney && (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insurance information recorded</p>
          </div>
        )}
          </div>
        )}

        {/* Sensitive Data Toggle */}
        {!isEditing && !isSensitiveVisible && (hasHealthInsurance || hasAutoInsurance || hasInsuranceContact || hasAttorney) && (
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