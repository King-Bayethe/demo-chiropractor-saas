import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Search, Plus, Eye, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

// Mock data for emails
const mockEmails = [
  {
    id: 1,
    subject: "Appointment Reminder - Tomorrow at 2:00 PM",
    recipient: "John Smith",
    sentDate: "2024-01-15",
    status: "opened",
    preview: "Don't forget about your appointment tomorrow..."
  },
  {
    id: 2,
    subject: "Insurance Update Required",
    recipient: "Maria Garcia",
    sentDate: "2024-01-14",
    status: "sent",
    preview: "We need to update your insurance information..."
  },
  {
    id: 3,
    subject: "Follow-up Treatment Plan",
    recipient: "Dr. Johnson",
    sentDate: "2024-01-13",
    status: "opened",
    preview: "Please review the attached treatment plan..."
  }
];

const mockContacts = [
  { id: 1, name: "John Smith", email: "john@example.com" },
  { id: 2, name: "Maria Garcia", email: "maria@example.com" },
  { id: 3, name: "Dr. Johnson", email: "johnson@example.com" }
];

const Emails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const filteredEmails = mockEmails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "opened":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "sent":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Emails</h1>
            <p className="text-muted-foreground">Manage patient communications and attorney updates</p>
          </div>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4DA8FF] hover:bg-[#3A96E8] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient">To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.email}>
                          {contact.name} ({contact.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Enter subject line" />
                </div>
                <div>
                  <Label htmlFor="body">Message</Label>
                  <Textarea 
                    id="body" 
                    placeholder="Enter your message here..."
                    className="min-h-[200px]"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#4DA8FF] hover:bg-[#3A96E8] text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start space-x-4 flex-1">
                    {getStatusIcon(email.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-sm truncate">{email.subject}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {email.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">To: {email.recipient}</p>
                      <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{email.sentDate}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </Layout>
    </AuthGuard>
  );
};

export default Emails;