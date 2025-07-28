import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  MessageSquare,
  User,
  Clock,
  Activity
} from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'lead',
    patientType: 'general',
    notes: ''
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, selectedType, selectedStatus]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await ghlApi.contacts.getAll();
      // Filter for patients only (you can adjust this logic based on your tags/fields)
      const patientContacts = (data.contacts || []).filter((contact: any) => 
        contact.tags?.some((tag: string) => 
          tag.toLowerCase().includes('patient') || 
          tag.toLowerCase().includes('treatment')
        ) || !contact.tags?.length // Include contacts without tags as potential patients
      );
      setPatients(patientContacts);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data from GoHighLevel API.",
        variant: "destructive",
      });
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((patient: any) => {
        const name = `${patient.firstNameLowerCase || ''} ${patient.lastNameLowerCase || ''}`.toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = (patient.phone || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((patient: any) => {
        const patientType = getPatientType(patient);
        return patientType.toLowerCase().includes(selectedType.toLowerCase());
      });
    }

    // Filter by status
    if (selectedStatus !== "all") {
      // In a real app, you'd have actual status data
      // For now, we'll assume all are active
      if (selectedStatus === "inactive") {
        filtered = [];
      }
    }

    setFilteredPatients(filtered);
  };

  const handlePatientSelect = (patient: any) => {
    // Navigate to patient profile page
    navigate(`/patients/${patient.id}`);
  };

  const handleMessagePatient = (patient: any) => {
    // This would integrate with GHL conversations API
    toast({
      title: "Message Feature",
      description: `Opening conversation with ${patient.firstNameLowerCase || patient.name}`,
    });
  };

  const handleBookAppointment = (patient: any) => {
    // This would integrate with GHL calendar API
    toast({
      title: "Appointment Booking",
      description: `Opening appointment booking for ${patient.firstNameLowerCase || patient.name}`,
    });
  };

  const getPatientType = (patient: any) => {
    const tags = patient.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) {
      return 'PIP Patient';
    }
    if (tags.some((tag: string) => tag.toLowerCase().includes('general'))) {
      return 'General Patient';
    }
    return 'Patient';
  };

  const getLastAppointment = (patient: any) => {
    // Mock data - in production, this would come from GHL calendar API
    const mockDates = [
      'Last week',
      '3 days ago',
      'Yesterday',
      '2 weeks ago',
      'Last month'
    ];
    return mockDates[Math.floor(Math.random() * mockDates.length)];
  };

  const getTotalVisits = (patient: any) => {
    // Mock data - in production, this would be calculated from appointment history
    return Math.floor(Math.random() * 20) + 1;
  };

  const handleAddPatient = () => {
    setIsAddPatientOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const contactData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        type: formData.type,
        tags: formData.patientType === 'pip' ? ['patient', 'pip'] : ['patient', 'general'],
        customFields: formData.notes.trim() ? [
          { key: 'notes', field_value: formData.notes.trim() }
        ] : []
      };

      await ghlApi.contacts.create(contactData);
      
      toast({
        title: "Success",
        description: "Patient added successfully!",
      });

      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        type: 'lead',
        patientType: 'general',
        notes: ''
      });
      setIsAddPatientOpen(false);
      
      // Reload patients list
      loadPatients();
      
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Patients</h1>
                <p className="text-muted-foreground">Manage patient records and treatment history</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Records
                </Button>
                <Button size="sm" onClick={handleAddPatient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search patients by name, phone, email..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="pip">PIP Patients</SelectItem>
                        <SelectItem value="general">General Patients</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Total: {patients.length}</Badge>
                    <Badge variant="outline" className="bg-medical-teal/10 text-medical-teal">
                      PIP: {filteredPatients.filter((p: any) => getPatientType(p) === 'PIP Patient').length}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      General: {filteredPatients.filter((p: any) => getPatientType(p) === 'General Patient').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
              
              {/* Patients Table */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50 bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm">Patient</th>
                          <th className="text-left p-4 font-medium text-sm">Contact</th>
                          <th className="text-left p-4 font-medium text-sm">Type</th>
                          <th className="text-left p-4 font-medium text-sm">Last Appointment</th>
                          <th className="text-left p-4 font-medium text-sm">Total Visits</th>
                          <th className="text-left p-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">
                              Loading patients...
                            </td>
                          </tr>
                        ) : filteredPatients.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">
                              {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                                ? "No patients match your filters" 
                                : "No patients found"}
                            </td>
                          </tr>
                        ) : (
                          filteredPatients.map((patient: any) => (
                            <tr key={patient.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                                      {`${patient.firstNameLowerCase?.[0]?.toUpperCase() || ''}${patient.lastNameLowerCase?.[0]?.toUpperCase() || ''}` || patient.name?.[0] || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm cursor-pointer hover:text-medical-blue"
                                       onClick={() => handlePatientSelect(patient)}>
                                      {patient.firstNameLowerCase && patient.lastNameLowerCase 
                                        ? `${patient.firstNameLowerCase.charAt(0).toUpperCase() + patient.firstNameLowerCase.slice(1)} ${patient.lastNameLowerCase.charAt(0).toUpperCase() + patient.lastNameLowerCase.slice(1)}`
                                        : patient.name || "Unknown Patient"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">GHL ID: {patient.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  {patient.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">{patient.phone}</span>
                                    </div>
                                  )}
                                  {patient.email && (
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-medical-blue">{patient.email}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="secondary" className={
                                  getPatientType(patient) === 'PIP Patient' 
                                    ? "bg-medical-teal/10 text-medical-teal"
                                    : "bg-primary/10 text-primary"
                                }>
                                  {getPatientType(patient)}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{getLastAppointment(patient)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Activity className="w-4 h-4 text-success" />
                                  <span className="font-medium text-sm">{getTotalVisits(patient)}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleMessagePatient(patient)}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Message
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleBookAppointment(patient)}
                                  >
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Book
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handlePatientSelect(patient)}
                                  >
                                    <User className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add Patient Modal */}
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientType">Patient Type</Label>
                  <Select value={formData.patientType} onValueChange={(value) => handleFormChange('patientType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Patient</SelectItem>
                      <SelectItem value="pip">PIP Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Enter any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPatientOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Patient"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Patient Profile Modal */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Patient Profile</DialogTitle>
              </DialogHeader>
              
              {selectedPatient && (
                <div className="space-y-6">
                  {/* Patient Header */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-medical-blue/10 text-medical-blue text-lg font-medium">
                        {`${selectedPatient.firstNameLowerCase?.[0]?.toUpperCase() || ''}${selectedPatient.lastNameLowerCase?.[0]?.toUpperCase() || ''}` || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {selectedPatient.firstNameLowerCase && selectedPatient.lastNameLowerCase 
                          ? `${selectedPatient.firstNameLowerCase.charAt(0).toUpperCase() + selectedPatient.firstNameLowerCase.slice(1)} ${selectedPatient.lastNameLowerCase.charAt(0).toUpperCase() + selectedPatient.lastNameLowerCase.slice(1)}`
                          : selectedPatient.name || "Unknown Patient"}
                      </h3>
                      <p className="text-muted-foreground">GHL Contact ID: {selectedPatient.id}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className={
                          getPatientType(selectedPatient) === 'PIP Patient' 
                            ? "bg-medical-teal/10 text-medical-teal"
                            : "bg-primary/10 text-primary"
                        }>
                          {getPatientType(selectedPatient)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedPatient.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedPatient.phone}</span>
                        </div>
                      )}
                      {selectedPatient.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedPatient.email}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Custom Fields */}
                  {selectedPatient.customFields && selectedPatient.customFields.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedPatient.customFields.map((field: any) => (
                          <div key={field.key} className="flex justify-between">
                            <span className="text-sm text-muted-foreground capitalize">
                              {field.key.replace('_', ' ')}:
                            </span>
                            <span className="text-sm">{field.field_value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Treatment Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Treatment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Visits:</span>
                        <span className="text-sm font-medium">{getTotalVisits(selectedPatient)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Appointment:</span>
                        <span className="text-sm">{getLastAppointment(selectedPatient)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Patient Since:</span>
                        <span className="text-sm">
                          {new Date(selectedPatient.dateAdded || selectedPatient.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleMessagePatient(selectedPatient)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button onClick={() => handleBookAppointment(selectedPatient)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}