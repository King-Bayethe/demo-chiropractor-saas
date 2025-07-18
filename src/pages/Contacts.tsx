import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MoreHorizontal,
  UserPlus,
  Download
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
            <Button size="sm">
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
      </div>
    </Layout>
  );
}