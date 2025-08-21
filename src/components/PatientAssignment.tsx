import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus } from 'lucide-react';
import { usePatientProviders } from '@/hooks/usePatientProviders';

interface PatientAssignmentProps {
  patientId: string;
  onAssignmentChange?: () => void;
}

export const PatientAssignment = ({ patientId, onAssignmentChange }: PatientAssignmentProps) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('primary_provider');

  const {
    assignments,
    providers,
    loading,
    assignPatientToProvider,
    unassignPatientFromProvider,
    fetchAssignments,
  } = usePatientProviders();

  React.useEffect(() => {
    fetchAssignments(patientId);
  }, [patientId]);

  const handleAssign = async () => {
    if (!selectedProviderId) return;

    const success = await assignPatientToProvider(patientId, selectedProviderId, selectedRole);
    if (success) {
      setSelectedProviderId('');
      setSelectedRole('primary_provider');
      onAssignmentChange?.();
    }
  };

  const handleUnassign = async (providerId: string) => {
    const success = await unassignPatientFromProvider(patientId, providerId);
    if (success) {
      onAssignmentChange?.();
    }
  };

  const currentAssignments = assignments.filter(a => a.patient_id === patientId);
  const availableProviders = providers.filter(
    provider => !currentAssignments.some(a => a.provider_id === provider.user_id)
  );

  const getProviderName = (provider: any) => {
    if (provider.first_name || provider.last_name) {
      return `${provider.first_name || ''} ${provider.last_name || ''}`.trim();
    }
    return provider.email;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'primary_provider':
        return 'default';
      case 'secondary_provider':
        return 'secondary';
      case 'consultant':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Provider Assignments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Assignments */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Assignments</h4>
          {currentAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No providers assigned</p>
          ) : (
            <div className="space-y-2">
              {currentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium">
                        {assignment.profiles 
                          ? getProviderName(assignment.profiles)
                          : 'Unknown Provider'
                        }
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getRoleBadgeVariant(assignment.role)}>
                          {assignment.role.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassign(assignment.provider_id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Assignment */}
        {availableProviders.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Assign New Provider</h4>
            <div className="flex space-x-2">
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider.user_id} value={provider.user_id}>
                      {getProviderName(provider)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary_provider">Primary</SelectItem>
                  <SelectItem value="secondary_provider">Secondary</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssign}
                disabled={!selectedProviderId || loading}
                size="sm"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};