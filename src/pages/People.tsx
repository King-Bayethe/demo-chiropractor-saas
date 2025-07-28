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
  Activity,
  Download,
  Users,
  UserPlus,
  Tag
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function People() {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination constants
  const PEOPLE_PER_PAGE = 25;
  const totalPages = Math.ceil(filteredPeople.length / PEOPLE_PER_PAGE);
  const startIndex = (currentPage - 1) * PEOPLE_PER_PAGE;
  const endIndex = startIndex + PEOPLE_PER_PAGE;
  const currentPeople = filteredPeople.slice(startIndex, endIndex);

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, searchTerm, selectedType, selectedStatus]);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const data = await ghlApi.contacts.getAll();
      setPeople(data.contacts || []);
    } catch (error) {
      console.error('Failed to load people:', error);
      toast({
        title: "Error",
        description: "Failed to load people data from GoHighLevel API.",
        variant: "destructive",
      });
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPeople = () => {
    let filtered = [...people];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((person: any) => {
        const name = `${person.firstNameLowerCase || ''} ${person.lastNameLowerCase || ''}`.toLowerCase();
        const email = (person.email || '').toLowerCase();
        const phone = (person.phone || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((person: any) => {
        const personType = getPersonType(person);
        return personType.toLowerCase().includes(selectedType.toLowerCase());
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

    setFilteredPeople(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getPersonType = (person: any) => {
    const tags = person.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase().includes('patient'))) {
      if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) {
        return 'PIP Patient';
      }
      return 'Patient';
    }
    if (tags.some((tag: string) => tag.toLowerCase().includes('referral'))) {
      return 'Referral';
    }
    if (tags.some((tag: string) => tag.toLowerCase().includes('staff'))) {
      return 'Staff';
    }
    return 'Lead';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PIP Patient": return "bg-medical-teal/10 text-medical-teal";
      case "Patient": return "bg-primary/10 text-primary";
      case "Lead": return "bg-yellow-500/10 text-yellow-700";
      case "Referral": return "bg-purple-500/10 text-purple-700";
      case "Staff": return "bg-green-500/10 text-green-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getLastActivity = (person: any) => {
    // Mock data - in production, this would come from actual activity logs
    const mockDates = [
      'Today',
      'Yesterday', 
      '2 days ago',
      'Last week',
      '2 weeks ago',
      'Last month'
    ];
    return mockDates[Math.floor(Math.random() * mockDates.length)];
  };

  const getTotalVisits = (person: any) => {
    const type = getPersonType(person);
    if (type.includes('Patient')) {
      return Math.floor(Math.random() * 20) + 1;
    }
    return 0;
  };

  const getOutstandingBalance = (person: any) => {
    const type = getPersonType(person);
    if (type.includes('Patient')) {
      const hasBalance = Math.random() > 0.7;
      return hasBalance ? Math.floor(Math.random() * 5000) + 100 : 0;
    }
    return 0;
  };

  const handlePersonSelect = (person: any) => {
    const type = getPersonType(person);
    if (type.includes('Patient')) {
      navigate(`/patients/${person.id}`);
    } else {
      // For non-patients, could open a contact detail view
      toast({
        title: "Contact Details",
        description: `Opening details for ${person.firstNameLowerCase || person.name}`,
      });
    }
  };

  const handleMessagePerson = (person: any) => {
    toast({
      title: "Message Feature",
      description: `Opening conversation with ${person.firstNameLowerCase || person.name}`,
    });
  };

  const handleBookAppointment = (person: any) => {
    toast({
      title: "Appointment Booking",
      description: `Opening appointment booking for ${person.firstNameLowerCase || person.name}`,
    });
  };

  const handleAddPerson = () => {
    setIsAddPersonOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPerson = async (e: React.FormEvent) => {
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
      let tags = [formData.type];
      
      // Add specific tags based on type
      if (formData.type === 'lead' && formData.patientType === 'pip') {
        tags = ['lead', 'pip-prospect'];
      } else if (formData.type === 'lead' && formData.patientType === 'general') {
        tags = ['lead', 'general-prospect'];
      } else if (formData.type === 'patient') {
        tags = formData.patientType === 'pip' ? ['patient', 'pip'] : ['patient', 'general'];
      }

      const contactData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        type: formData.type,
        tags: tags,
        customFields: formData.notes.trim() ? [
          { key: 'notes', field_value: formData.notes.trim() }
        ] : []
      };

      await ghlApi.contacts.create(contactData);
      
      toast({
        title: "Success",
        description: `${formData.firstName} has been added successfully!`,
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
      setIsAddPersonOpen(false);
      
      // Reload people list
      loadPeople();
      
    } catch (error) {
      console.error('Failed to add person:', error);
      toast({
        title: "Error",
        description: "Failed to add person. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get summary statistics
  const totalPeople = people.length;
  const patients = people.filter((p: any) => getPersonType(p).includes('Patient')).length;
  const leads = people.filter((p: any) => getPersonType(p) === 'Lead').length;
  const referrals = people.filter((p: any) => getPersonType(p) === 'Referral').length;

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">People Directory</h1>
                <p className="text-muted-foreground">Unified directory for patients, leads, referrals, and staff</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Campaign
                </Button>
                <Button size="sm" onClick={handleAddPerson}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Person
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
                      placeholder="Search by name, phone, email..." 
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
                        <SelectItem value="patient">Patients</SelectItem>
                        <SelectItem value="lead">Leads</SelectItem>
                        <SelectItem value="referral">Referrals</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
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
                    <Badge variant="secondary">Total: {totalPeople}</Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Patients: {patients}
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
                      Leads: {leads}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700">
                      Referrals: {referrals}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
              
              {/* People Table */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>All People ({filteredPeople.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50 bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm">Name</th>
                          <th className="text-left p-4 font-medium text-sm">Contact</th>
                          <th className="text-left p-4 font-medium text-sm">Type</th>
                          <th className="text-left p-4 font-medium text-sm">Last Activity</th>
                          <th className="text-left p-4 font-medium text-sm">Visits</th>
                          <th className="text-left p-4 font-medium text-sm">Balance</th>
                          <th className="text-left p-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              Loading people...
                            </td>
                          </tr>
                        ) : currentPeople.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                                ? "No people match your filters" 
                                : "No people found"}
                            </td>
                          </tr>
                        ) : (
                          currentPeople.map((person: any) => {
                            const personType = getPersonType(person);
                            const visits = getTotalVisits(person);
                            const balance = getOutstandingBalance(person);
                            
                            return (
                              <tr key={person.id} className="hover:bg-muted/20 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                                        {`${person.firstNameLowerCase?.[0]?.toUpperCase() || ''}${person.lastNameLowerCase?.[0]?.toUpperCase() || ''}` || person.name?.[0] || 'P'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm cursor-pointer hover:text-medical-blue"
                                         onClick={() => handlePersonSelect(person)}>
                                        {person.firstNameLowerCase && person.lastNameLowerCase 
                                          ? `${person.firstNameLowerCase.charAt(0).toUpperCase() + person.firstNameLowerCase.slice(1)} ${person.lastNameLowerCase.charAt(0).toUpperCase() + person.lastNameLowerCase.slice(1)}`
                                          : person.name || "Unknown"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">ID: {person.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1">
                                    {person.phone && (
                                      <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{person.phone}</span>
                                      </div>
                                    )}
                                    {person.email && (
                                      <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-medical-blue">{person.email}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="secondary" className={getTypeColor(personType)}>
                                    <Tag className="w-3 h-3 mr-1" />
                                    {personType}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{getLastActivity(person)}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {visits > 0 ? (
                                    <div className="flex items-center space-x-2">
                                      <Activity className="w-4 h-4 text-success" />
                                      <span className="font-medium text-sm">{visits}</span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {balance > 0 ? (
                                    <span className="font-medium text-sm text-red-600">
                                      ${balance.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">$0</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleMessagePerson(person)}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                    {personType.includes('Patient') && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleBookAppointment(person)}
                                      >
                                        <Calendar className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handlePersonSelect(person)}
                                    >
                                      <User className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>

          {/* Add Person Modal */}
          <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Person</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitPerson} className="space-y-4">
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
                    placeholder="(786) 123-4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleFormChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="referral">Referral Source</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.type === 'lead' || formData.type === 'patient') && (
                  <div className="space-y-2">
                    <Label htmlFor="patientType">Category</Label>
                    <Select value={formData.patientType} onValueChange={(value) => handleFormChange('patientType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="pip">PIP (Personal Injury Protection)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddPersonOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Person"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}