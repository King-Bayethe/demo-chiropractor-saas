import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Edit, 
  Clock, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  Building,
  Activity
} from 'lucide-react';

interface AccidentDetailsCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  form?: any;
}

export const AccidentDetailsCard: React.FC<AccidentDetailsCardProps> = ({
  patient,
  isEditing,
  onEdit,
  form
}) => {
  const hasAccidentData = patient.accident_date || patient.accident_description || 
                         patient.weather_conditions || patient.street_surface ||
                         patient.body_part_hit || patient.what_body_hit ||
                         patient.loss_of_consciousness || patient.emergency_hospital_visit;

  const formatDateTime = (date: string, time?: string) => {
    if (!date) return null;
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString();
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Car className="h-5 w-5" />
          Accident Details
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
        {!hasAccidentData ? (
          <div className="text-center py-6 text-muted-foreground">
            <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No accident details recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Accident Date & Time */}
            {(patient.accident_date || patient.accident_time) && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Date & Time
                </h4>
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700">
                    {formatDateTime(patient.accident_date, patient.accident_time)}
                  </p>
                </div>
              </div>
            )}

            {/* Accident Description */}
            {patient.accident_description && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground">Description</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {patient.accident_description}
                </p>
              </div>
            )}

            {/* Conditions */}
            {(patient.weather_conditions || patient.street_surface) && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  Environmental Conditions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {patient.weather_conditions && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Weather:</span>
                      <Badge variant="outline" className="ml-2">{patient.weather_conditions}</Badge>
                    </div>
                  )}
                  {patient.street_surface && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Surface:</span>
                      <Badge variant="outline" className="ml-2">{patient.street_surface}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Impact Details */}
            {(patient.body_part_hit || patient.what_body_hit) && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  Impact Details
                </h4>
                <div className="space-y-2">
                  {patient.body_part_hit && (
                    <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                      <span className="text-xs font-medium text-orange-600">Body Part Hit:</span>
                      <p className="text-sm text-orange-700 mt-1">{patient.body_part_hit}</p>
                    </div>
                  )}
                  {patient.what_body_hit && (
                    <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                      <span className="text-xs font-medium text-orange-600">What Hit Body:</span>
                      <p className="text-sm text-orange-700 mt-1">{patient.what_body_hit}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Response */}
            {(patient.loss_of_consciousness || patient.emergency_hospital_visit || patient.hospital_name) && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Medical Response
                </h4>
                <div className="space-y-3">
                  {patient.loss_of_consciousness && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <span className="text-xs font-medium text-red-600">Loss of Consciousness:</span>
                      <p className="text-sm text-red-700 mt-1">{patient.loss_of_consciousness}</p>
                      {patient.consciousness_duration && (
                        <p className="text-xs text-red-600 mt-1">
                          Duration: {patient.consciousness_duration}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {patient.emergency_hospital_visit && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <span className="text-xs font-medium text-red-600">Emergency Hospital Visit:</span>
                      <Badge variant="destructive" className="ml-2">Yes</Badge>
                    </div>
                  )}

                  {patient.hospital_name && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Hospital:
                      </span>
                      <p className="text-sm text-red-700 mt-1">{patient.hospital_name}</p>
                    </div>
                  )}

                  {patient.emergency_hospital_details && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <span className="text-xs font-medium text-red-600">Additional Details:</span>
                      <p className="text-sm text-red-700 mt-1">{patient.emergency_hospital_details}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous Accidents */}
            {patient.previous_accidents && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Previous Accidents
                </h4>
                <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-200 text-purple-700">
                  {patient.previous_accidents}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};