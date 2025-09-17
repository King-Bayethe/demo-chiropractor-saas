import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Phone, Voicemail, Send, Search, Filter, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender: 'patient' | 'staff';
  timestamp: Date;
  type: 'sms' | 'call' | 'voicemail';
  status?: 'delivered' | 'read' | 'failed';
}

interface Conversation {
  id: string;
  patientName: string;
  patientPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
  caseType: string;
  status: 'active' | 'completed' | 'pending';
}

const DemoConversations = () => {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Demo conversation data
  const conversations: Conversation[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientPhone: '(555) 123-4567',
      lastMessage: 'Thank you for the appointment reminder!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 0,
      caseType: 'PIP',
      status: 'active',
      messages: [
        {
          id: '1',
          content: 'Hi Sarah, this is a reminder that you have an appointment tomorrow at 2:00 PM with Dr. Smith.',
          sender: 'staff',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          type: 'sms',
          status: 'read'
        },
        {
          id: '2',
          content: 'Thank you for the appointment reminder!',
          sender: 'patient',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          type: 'sms',
          status: 'delivered'
        }
      ]
    },
    {
      id: '2',
      patientName: 'Michael Rodriguez',
      patientPhone: '(555) 234-5678',
      lastMessage: 'Is it possible to reschedule my appointment?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 2,
      caseType: 'Insurance',
      status: 'pending',
      messages: [
        {
          id: '3',
          content: 'Hello Michael, your insurance claim has been processed successfully.',
          sender: 'staff',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          type: 'sms',
          status: 'read'
        },
        {
          id: '4',
          content: 'Great! Is it possible to reschedule my appointment?',
          sender: 'patient',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          type: 'sms',
          status: 'delivered'
        },
        {
          id: '5',
          content: 'I need to come in earlier in the week if possible.',
          sender: 'patient',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000), // 2 hours ago + 30 seconds
          type: 'sms',
          status: 'delivered'
        }
      ]
    },
    {
      id: '3',
      patientName: 'Emily Chen',
      patientPhone: '(555) 345-6789',
      lastMessage: 'Missed call - please call back',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      unreadCount: 1,
      caseType: 'Cash Plan',
      status: 'active',
      messages: [
        {
          id: '6',
          content: 'Missed call - please call back',
          sender: 'patient',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          type: 'call',
          status: 'delivered'
        }
      ]
    }
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    // Demo: Just clear the input and show a success message
    setMessageInput('');
    // In a real app, this would send the message via API
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'voicemail':
        return <Voicemail className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCaseTypeColor = (caseType: string) => {
    switch (caseType) {
      case 'PIP':
        return 'bg-case-pip/10 text-case-pip border-case-pip/20';
      case 'Insurance':
        return 'bg-case-insurance/10 text-case-insurance border-case-insurance/20';
      case 'Cash Plan':
        return 'bg-case-cash-plan/10 text-case-cash-plan border-case-cash-plan/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.patientPhone.includes(searchTerm)
  );

  return (
    <Layout>
      {/* Demo Header */}
      <div className="bg-medical-blue/5 border-b border-medical-blue/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/landing')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Landing
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Demo Conversations</h1>
              <p className="text-sm text-muted-foreground">Interactive patient messaging demonstration</p>
            </div>
          </div>
          <Alert className="max-w-md">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a demo environment. All conversations and messages are fictional.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Patient Conversations</h2>
              <Badge className="bg-medical-blue/10 text-medical-blue border-medical-blue/20">
                Demo Mode
              </Badge>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-medical-blue text-white">
                      {conversation.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {conversation.patientName}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatLastMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={getCaseTypeColor(conversation.caseType)}>
                        {conversation.caseType}
                      </Badge>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-medical-red text-white">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedConversation.patientName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedConversation.patientPhone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getCaseTypeColor(selectedConversation.caseType)}>
                      {selectedConversation.caseType}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === 'staff'
                          ? 'bg-medical-blue text-white'
                          : 'bg-muted text-foreground'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {getMessageIcon(message.type)}
                          <span className="text-xs opacity-75">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.sender === 'staff' && (
                          <div className="text-xs opacity-75 mt-1">
                            {message.status === 'read' ? '✓✓' : '✓'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Demo Mode: Messages are simulated and won't be actually sent
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a patient conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DemoConversations;