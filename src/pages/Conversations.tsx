import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Send, 
  Phone, 
  Mail, 
  MoreHorizontal,
  MessageSquare,
  User
} from "lucide-react";

const mockConversations = [
  {
    id: 1,
    contact: {
      name: "Vito Silveiro",
      phone: "(786) 806-9212",
      email: "designerprintingusa@gmail.com",
      language: "English",
      attorney: "Johnson & Associates",
      tags: ["PIP Patient", "Active"],
      avatar: "VS"
    },
    lastMessage: "Thank you for the appointment reminder.",
    timestamp: "2 hours ago",
    unread: 0
  },
  {
    id: 2,
    contact: {
      name: "Islen Martinez",
      phone: "(786) 726-5877",
      email: "",
      language: "Spanish",
      attorney: "",
      tags: ["General Patient"],
      avatar: "IM"
    },
    lastMessage: "¿Puedo reprogramar mi cita?",
    timestamp: "1 day ago",
    unread: 2
  },
  {
    id: 3,
    contact: {
      name: "Bayethe Rowell",
      phone: "(330) 722-7379",
      email: "bayethe.rowell@gmail.com",
      language: "English",
      attorney: "Miller Law Firm",
      tags: ["PIP Patient", "Follow-up"],
      avatar: "BR"
    },
    lastMessage: "I need copies of my treatment records.",
    timestamp: "3 days ago",
    unread: 1
  }
];

const mockMessages = [
  { id: 1, sender: "contact", message: "Hi, I need to reschedule my appointment for tomorrow.", timestamp: "10:30 AM" },
  { id: 2, sender: "staff", message: "Of course! What time works better for you?", timestamp: "10:35 AM" },
  { id: 3, sender: "contact", message: "Would Friday at 2 PM be available?", timestamp: "10:40 AM" },
  { id: 4, sender: "staff", message: "Let me check... Yes, Friday at 2 PM is available. I'll reschedule you now.", timestamp: "10:42 AM" },
  { id: 5, sender: "contact", message: "Thank you so much!", timestamp: "10:45 AM" }
];

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would integrate with GoHighLevel API to send message
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
            <p className="text-muted-foreground">Chat with patients and manage communications</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Conversations List */}
          <div className="col-span-4">
            <Card className="border border-border/50 shadow-sm h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>All Conversations</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  {mockConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/20 ${
                        selectedConversation.id === conversation.id ? 'bg-medical-blue/10' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                            {conversation.contact.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{conversation.contact.name}</p>
                            {conversation.unread > 0 && (
                              <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conversation.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-span-5">
            <Card className="border border-border/50 shadow-sm h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-sm">
                      {selectedConversation.contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedConversation.contact.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedConversation.contact.phone}</p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'staff'
                            ? 'bg-medical-blue text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'staff' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Info Panel */}
          <div className="col-span-3">
            <Card className="border border-border/50 shadow-sm h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Contact Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-lg">
                      {selectedConversation.contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{selectedConversation.contact.name}</h3>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedConversation.contact.phone}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>

                  {selectedConversation.contact.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{selectedConversation.contact.email}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Language</p>
                    <p className="text-sm">{selectedConversation.contact.language}</p>
                  </div>

                  {selectedConversation.contact.attorney && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Attorney Referral</p>
                      <p className="text-sm">{selectedConversation.contact.attorney}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedConversation.contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Contact
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}