import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
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
        {isEditing && form ? (
          /* Edit Mode */
          <Form {...form}>
            <div className="space-y-6">
              {/* Date & Time Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-foreground">Accident Date & Time</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accidentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field}
                            placeholder="HH:MM"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4 pb-4 border-b">
                <h4 className="font-medium text-foreground">Accident Description</h4>
                <FormField
                  control={form.control}
                  name="accidentDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe what happened</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Provide detailed description of the accident"
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditions Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium text-foreground">Environmental Conditions</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weatherConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weather Conditions</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select weather" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clear">Clear</SelectItem>
                            <SelectItem value="rainy">Rainy</SelectItem>
                            <SelectItem value="foggy">Foggy</SelectItem>
                            <SelectItem value="snowy">Snowy</SelectItem>
                            <SelectItem value="windy">Windy</SelectItem>
                            <SelectItem value="cloudy">Cloudy</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="streetSurface"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Surface</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select surface" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dry">Dry</SelectItem>
                            <SelectItem value="wet">Wet</SelectItem>
                            <SelectItem value="icy">Icy</SelectItem>
                            <SelectItem value="debris">Debris</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Impact Details Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium text-foreground">Impact Details</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bodyPartHit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Part Hit</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Head, Back, Neck" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="whatBodyHit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What Hit Body</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Dashboard, Steering wheel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Medical Response Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium text-foreground">Medical Response</h4>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="lossOfConsciousness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loss of Consciousness</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No</SelectItem>
                            <SelectItem value="brief">Yes - Brief</SelectItem>
                            <SelectItem value="extended">Yes - Extended</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consciousnessDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (if applicable)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2 minutes, 30 seconds" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyHospitalVisit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Emergency Hospital Visit</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hospitalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name of hospital or medical facility" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyHospitalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Medical Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Treatment received, tests performed, etc."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Previous Accidents Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-foreground">Previous Accidents</h4>
                </div>
                
                <FormField
                  control={form.control}
                  name="previousAccidents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Accident History</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe any previous accidents or injuries"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        ) : (
          /* View Mode */
          !hasAccidentData ? (
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
        ))}
      </CardContent>
    </Card>
  );
};