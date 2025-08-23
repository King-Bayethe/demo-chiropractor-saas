import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedDateInput } from '@/components/EnhancedDateInput';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Phone, Mail, MapPin, User, Calendar, Shield, Upload, Camera } from 'lucide-react';

interface DemographicsCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  isSensitiveVisible: boolean;
  onToggleSensitive: () => void;
  form?: any;
  onPatientUpdate?: (updates: any) => void;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  patient,
  isEditing,
  onEdit,
  isSensitiveVisible,
  onToggleSensitive,
  form,
  onPatientUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
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

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${patient.id}-${Date.now()}.${fileExt}`;
      const filePath = `patient-profiles/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update patient record
      const { error: updateError } = await supabase
        .from('patients')
        .update({ profile_picture_url: publicUrl })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      // Update local state
      if (onPatientUpdate) {
        onPatientUpdate({ profile_picture_url: publicUrl });
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
        {/* Profile Picture Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={patient.profile_picture_url} 
                alt={`${patient.first_name} ${patient.last_name}`}
              />
              <AvatarFallback className="text-xl">
                {getInitials(patient.first_name, patient.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0">
              <label htmlFor="profile-picture-upload" className="cursor-pointer">
                <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {isEditing && form ? (
          /* Edit Mode */
          <Form {...form}>
            <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter first name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <EnhancedDateInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date of birth"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-foreground">Contact Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter street address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter ZIP code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            </div>
          </Form>
        ) : (
          /* View Mode */
          <div className="space-y-4">
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

              {patient.marital_status && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Marital Status</h4>
                  <Badge variant="secondary">{patient.marital_status}</Badge>
                </div>
              )}

              {patient.preferred_language && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Preferred Language</h4>
                  <Badge variant="secondary">{patient.preferred_language}</Badge>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};