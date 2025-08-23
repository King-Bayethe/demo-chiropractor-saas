import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  AlertCircle, 
  Edit, 
  User, 
  Phone, 
  Users,
  Shield
} from 'lucide-react';

interface EmergencyContactCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  isSensitiveVisible: boolean;
  onToggleSensitive: () => void;
  form?: any;
}

export const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({
  patient,
  isEditing,
  onEdit,
  isSensitiveVisible,
  onToggleSensitive,
  form
}) => {
  const maskPhone = (phone: string) => {
    if (!phone || isSensitiveVisible) return phone;
    return '***-***-****';
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const hasEmergencyContact = patient.emergency_contact_name || patient.emergency_contact_phone || patient.emergency_contact_relationship;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Emergency Contact
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
        {isEditing && form ? (
          /* Edit Mode */
          <Form {...form}>
            <div className="space-y-4">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter emergency contact name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Spouse, Parent, Sibling" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter emergency contact phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </Form>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            {hasEmergencyContact ? (
              <div className="space-y-3">
                {patient.emergency_contact_name && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Contact Name
                    </h4>
                    <p className="font-medium">{patient.emergency_contact_name}</p>
                  </div>
                )}
                
                {patient.emergency_contact_relationship && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Relationship
                    </h4>
                    <p className="text-sm">{patient.emergency_contact_relationship}</p>
                  </div>
                )}
                
                {patient.emergency_contact_phone && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone Number
                    </h4>
                    <p className="text-sm font-mono">
                      {isSensitiveVisible 
                        ? formatPhone(patient.emergency_contact_phone)
                        : maskPhone(patient.emergency_contact_phone)
                      }
                    </p>
                  </div>
                )}
                
                {/* Sensitive Data Toggle */}
                {!isSensitiveVisible && patient.emergency_contact_phone && (
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
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No emergency contact information recorded</p>
                <Button 
                  onClick={onEdit}
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                >
                  Add Emergency Contact
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};