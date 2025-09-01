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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MoreHorizontal,
  UserPlus,
  Download,
  X
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


export default function Contacts() {
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    language: "",
    referredBy: "",
    tags: ""
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();

  // Pagination constants and calculations
  const CONTACTS_PER_PAGE = 50;
  const totalPages = Math.ceil(contacts.length / CONTACTS_PER_PAGE);
  const startIndex = (currentPage - 1) * CONTACTS_PER_PAGE;
  const endIndex = startIndex + CONTACTS_PER_PAGE;
  const currentContacts = contacts.slice(startIndex, endIndex);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await ghlApi.contacts.getAll();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts from GoHighLevel API.",
        variant: "destructive",
      });
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contactData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        customFields: [
          { key: 'language', field_value: formData.language },
          { key: 'referred_by', field_value: formData.referredBy },
        ].filter(field => field.field_value),
      };

      await ghlApi.contacts.create(contactData);
      
      // Close modal and show success message
      setIsAddContactOpen(false);
      toast({
        title: "Contact Added Successfully",
        description: `${formData.firstName} ${formData.lastName} has been added to your contacts.`,
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        language: "",
        referredBy: "",
        tags: ""
      });
      
      // Reload contacts and reset to first page
      setCurrentPage(1);
      loadContacts();
    } catch (error) {
      console.error('Failed to add contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success/10 text-success";
      case "New": return "bg-medical-blue/10 text-medical-blue";
      case "Inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PIP Patient": return "bg-medical-teal/10 text-medical-teal";
      case "General Patient": return "bg-primary/10 text-primary";
      case "Lead": return "bg-yellow-500/10 text-yellow-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col gap-4"
          )}>
            <div className={isMobile ? "text-center" : ""}>
              <h1 className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl")}>Contacts</h1>
              <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "")}>Manage patients, leads, and attorney contacts</p>
            </div>
            <div className={cn("flex items-center space-x-2", isMobile && "w-full")}>
              <Button variant="outline" size="sm" className={isMobile ? "flex-1" : ""}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setIsAddContactOpen(true)} className={isMobile ? "flex-1" : ""}>
                <Plus className="w-4 h-4 mr-2" />
                {isMobile ? "Add" : "Add Contact"}
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className={cn(
                "flex items-center space-x-4",
                isMobile && "flex-col space-y-4 space-x-0"
              )}>
                <div className={cn("relative", isMobile ? "w-full" : "flex-1")}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search by name, phone, email..." 
                    className="pl-10"
                  />
                </div>
                <div className={cn(
                  "flex items-center space-x-2",
                  isMobile && "w-full justify-between"
                )}>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <div className={cn(
                    "flex items-center space-x-2",
                    isMobile && "flex-col space-y-1 space-x-0"
                  )}>
                    <Badge variant="secondary">Total: {contacts.length}</Badge>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      Active: {contacts.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto px-6 py-6 space-y-6">

        {/* Contacts List - Table on Desktop, Cards on Mobile */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isMobile ? (
              /* Mobile Card View */
              <div className="space-y-3 p-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading contacts...
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No contacts found
                  </div>
                ) : (
                  currentContacts.map((contact: any) => (
                    <Card key={contact.id} className="p-4 border border-border/30">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10 mt-1">
                          <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                            {`${contact.firstNameLowerCase?.[0]?.toUpperCase() || ''}${contact.lastNameLowerCase?.[0]?.toUpperCase() || ''}` || contact.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {contact.firstNameLowerCase && contact.lastNameLowerCase 
                              ? `${contact.firstNameLowerCase.charAt(0).toUpperCase() + contact.firstNameLowerCase.slice(1)} ${contact.lastNameLowerCase.charAt(0).toUpperCase() + contact.lastNameLowerCase.slice(1)}`
                              : contact.name || "No Name"}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{contact.phone || 'No phone'}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-medical-blue truncate">{contact.email}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                              {contact.tags?.[0] || 'Contact'}
                            </Badge>
                            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/50 bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm">Contact</th>
                      <th className="text-left p-4 font-medium text-sm">Phone</th>
                      <th className="text-left p-4 font-medium text-sm">Email</th>
                      <th className="text-left p-4 font-medium text-sm">Type</th>
                      <th className="text-left p-4 font-medium text-sm">Status</th>
                      <th className="text-left p-4 font-medium text-sm">Attorney</th>
                      <th className="text-left p-4 font-medium text-sm">Last Activity</th>
                      <th className="text-left p-4 font-medium text-sm"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          Loading contacts...
                        </td>
                      </tr>
                     ) : contacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          No contacts found
                        </td>
                      </tr>
                    ) : (
                      currentContacts.map((contact: any) => (
                        <tr key={contact.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                                  {`${contact.firstNameLowerCase?.[0]?.toUpperCase() || ''}${contact.lastNameLowerCase?.[0]?.toUpperCase() || ''}` || contact.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {contact.firstNameLowerCase && contact.lastNameLowerCase 
                                    ? `${contact.firstNameLowerCase.charAt(0).toUpperCase() + contact.firstNameLowerCase.slice(1)} ${contact.lastNameLowerCase.charAt(0).toUpperCase() + contact.lastNameLowerCase.slice(1)}`
                                    : contact.name || "No Name"}
                                </p>
                                <p className="text-xs text-muted-foreground">ID: {contact.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{contact.phone || '-'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {contact.email ? (
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-medical-blue hover:underline cursor-pointer">
                                  {contact.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No email</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {contact.tags?.[0] || 'Contact'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              Active
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {contact.customFields?.find((f: any) => f.key === 'referred_by')?.field_value || '-'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(contact.dateAdded || contact.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Bulk Import
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Campaign
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, contacts.length)} of {contacts.length} contacts
              </div>
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

        {/* Add Contact Modal */}
        <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Add New Contact
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddContactOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(786) 123-4567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="referredBy">Attorney Referral</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, referredBy: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select referring attorney" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="johnson-associates">Johnson & Associates</SelectItem>
                    <SelectItem value="miller-law">Miller Law Firm</SelectItem>
                    <SelectItem value="davis-legal">Davis Legal Group</SelectItem>
                    <SelectItem value="rodriguez-partners">Rodriguez & Partners</SelectItem>
                    <SelectItem value="smith-law">Smith Law Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="PIP Patient, New Lead, etc."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddContactOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Contact
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