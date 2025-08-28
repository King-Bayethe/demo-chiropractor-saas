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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
              <p className="text-muted-foreground">
                Manage patient communications and email campaigns
              </p>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-16">
                <Mail className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Email management and communication features are currently in development. 
                  Check back soon for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Emails;