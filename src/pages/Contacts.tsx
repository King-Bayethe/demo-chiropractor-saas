import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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

const mockContacts = [
  {
    id: 1,
    name: "Vito Silveiro",
    phone: "(786) 806-9212",
    email: "designerprintingusa@gmail.com",
    type: "PIP Patient",
    status: "Active",
    lastActivity: "1 day ago",
    avatar: "VS",
    attorney: "Johnson & Associates"
  },
  {
    id: 2,
    name: "Islen Martinez",
    phone: "(786) 726-5877",
    email: "",
    type: "General Patient",
    status: "Active",
    lastActivity: "1 day ago",
    avatar: "IM",
    attorney: ""
  },
  {
    id: 3,
    name: "Bayethe Rowell",
    phone: "(330) 722-7379",
    email: "bayethe.rowell@gmail.com",
    type: "PIP Patient",
    status: "Active",
    lastActivity: "2 weeks ago",
    avatar: "BR",
    attorney: "Miller Law Firm"
  },
  {
    id: 4,
    name: "Arturo Mata",
    phone: "(786) 487-6893",
    email: "",
    type: "Lead",
    status: "New",
    lastActivity: "3 weeks ago",
    avatar: "AM",
    attorney: "Davis Legal Group"
  },
  {
    id: 5,
    name: "Rafael Valiente",
    phone: "(754) 715-2321",
    email: "",
    type: "General Patient",
    status: "Inactive",
    lastActivity: "3 weeks ago",
    avatar: "RV",
    attorney: ""
  }
];

export default function Contacts() {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with GoHighLevel API
    console.log("New contact data:", formData);
    
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
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground">Manage patients, leads, and attorney contacts</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsAddContactOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by name, phone, email..." 
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Total: {mockContacts.length}</Badge>
                <Badge variant="outline" className="bg-success/10 text-success">
                  Active: {mockContacts.filter(c => c.status === "Active").length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                  {mockContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                              {contact.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">ID: #{contact.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{contact.phone}</span>
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
                        <Badge variant="secondary" className={getTypeColor(contact.type)}>
                          {contact.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {contact.attorney ? (
                          <span className="text-sm">{contact.attorney}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{contact.lastActivity}</span>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                Showing {mockContacts.length} of {mockContacts.length} contacts
              </div>
            </div>
          </CardContent>
        </Card>

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
  );
}