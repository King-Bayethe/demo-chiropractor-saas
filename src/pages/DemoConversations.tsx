import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatEmptyState } from '@/components/ui/chat-empty-state';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { MessageSquare, Phone, Voicemail, Send, Search, Filter, Info, ArrowLeft, Calendar, FileText, Stethoscope, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
  const conversations: Conversation[] = [{
    id: '1',
    patientName: 'Sarah Johnson',
    patientPhone: '(555) 123-4567',
    lastMessage: 'Thank you for the appointment reminder!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    // 30 minutes ago
    unreadCount: 0,
    caseType: 'Primary Care',
    status: 'active',
    messages: [{
      id: '1',
      content: 'Hi Sarah, this is a reminder that you have an appointment tomorrow at 2:00 PM with Dr. Smith.',
      sender: 'staff',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      // 1 hour ago
      type: 'sms',
      status: 'read'
    }, {
      id: '2',
      content: 'Thank you for the appointment reminder!',
      sender: 'patient',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      // 30 minutes ago
      type: 'sms',
      status: 'delivered'
    }]
  }, {
    id: '2',
    patientName: 'Michael Rodriguez',
    patientPhone: '(555) 234-5678',
    lastMessage: 'Is it possible to reschedule my appointment?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    // 2 hours ago
    unreadCount: 2,
    caseType: 'Specialist',
    status: 'pending',
    messages: [{
      id: '3',
      content: 'Hello Michael, your insurance claim has been processed successfully.',
      sender: 'staff',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      // 3 hours ago
      type: 'sms',
      status: 'read'
    }, {
      id: '4',
      content: 'Great! Is it possible to reschedule my appointment?',
      sender: 'patient',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      // 2 hours ago
      type: 'sms',
      status: 'delivered'
    }, {
      id: '5',
      content: 'I need to come in earlier in the week if possible.',
      sender: 'patient',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000),
      // 2 hours ago + 30 seconds
      type: 'sms',
      status: 'delivered'
    }]
  }, {
    id: '3',
    patientName: 'Emily Chen',
    patientPhone: '(555) 345-6789',
    lastMessage: 'Missed call - please call back',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4),
    // 4 hours ago
    unreadCount: 1,
    caseType: 'Wellness',
    status: 'active',
    messages: [{
      id: '6',
      content: 'Missed call - please call back',
      sender: 'patient',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      // 4 hours ago
      type: 'call',
      status: 'delivered'
    }]
  }];
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // Demo: Just clear the input and show a success message
    setMessageInput('');
    // In a real app, this would send the message via API
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case 'Primary Care':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'Specialist':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      case 'Urgent Care':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'Wellness':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const filteredConversations = conversations.filter(conv => conv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || conv.patientPhone.includes(searchTerm));
  return <Layout>
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border-b border-primary/20 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-xl font-semibold text-foreground">Patient Communication Hub</h1>
              <p className="text-sm text-muted-foreground">HIPAA-compliant messaging with SMS & voice integration</p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary w-fit">
            <Sparkles className="h-3 w-3 mr-1" />
            Portfolio Preview
          </Badge>
        </div>
      </div>
      
      <div className="h-[calc(100vh-9rem)] flex">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredConversations.length}
              </Badge>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {filteredConversations.map(conversation => <div key={conversation.id} className={cn("p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 group", "hover:bg-muted/50 hover:shadow-sm hover:translate-x-1", selectedConversation?.id === conversation.id ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary shadow-sm' : 'border-l-4 border-transparent')} onClick={() => setSelectedConversation(conversation)}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {conversation.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background">
                        <span className="text-[10px] font-bold text-white">{conversation.unreadCount}</span>
                      </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {conversation.patientName}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatLastMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs mb-1.5", getCaseTypeColor(conversation.caseType))}>
                      {conversation.caseType}
                    </Badge>
                    <p className="text-sm text-muted-foreground truncate leading-relaxed">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>)}
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-muted/20 via-background to-muted/10">
          {selectedConversation ? <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {selectedConversation.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedConversation.patientName}</h3>
                      <p className="text-xs text-muted-foreground">{selectedConversation.patientPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getCaseTypeColor(selectedConversation.caseType)}>
                      {selectedConversation.caseType}
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline">Call</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {selectedConversation.messages.map((message, index) => {
                const isStaff = message.sender === 'staff';
                const initials = isStaff ? 'MS' : selectedConversation.patientName.split(' ').map(n => n[0]).join('');
                return <div key={message.id} className={cn("flex gap-3 animate-fade-in", isStaff ? 'justify-end' : 'justify-start')} style={{
                  animationDelay: `${index * 50}ms`
                }}>
                        {!isStaff && <Avatar className="w-8 h-8 mt-auto flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>}
                        
                        <div className={cn("max-w-[85%] md:max-w-[70%]", isStaff && "text-right")}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {!isStaff && <>
                                <span className="text-xs font-medium text-foreground">
                                  {selectedConversation.patientName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.timestamp)}
                                </span>
                              </>}
                            {isStaff && <>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.timestamp)}
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  Medical Staff
                                </span>
                              </>}
                          </div>
                          
                          <div className={cn("px-4 py-3 rounded-2xl shadow-sm relative overflow-wrap-anywhere", isStaff ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm' : 'bg-card border border-border rounded-bl-sm')}>
                            <div className="flex items-center gap-2 mb-1">
                              {getMessageIcon(message.type)}
                              <span className={cn("text-xs", isStaff ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                {message.type === 'sms' ? 'SMS' : message.type === 'call' ? 'Phone Call' : 'Voicemail'}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            {isStaff && message.status && <div className={cn("text-xs mt-2 flex items-center justify-end gap-1", message.status === 'read' ? 'text-blue-200' : 'text-primary-foreground/70')}>
                                {message.status === 'read' ? '✓✓ Read' : '✓ Delivered'}
                              </div>}
                          </div>
                        </div>
                        
                        {isStaff && <Avatar className="w-8 h-8 mt-auto flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-medium">
                              MS
                            </AvatarFallback>
                          </Avatar>}
                      </div>;
              })}
                  
                  <TypingIndicator userName="Patient" userInitials="PT" className="opacity-0" />
                </div>
              </ScrollArea>

              {/* Quick Actions Bar */}
              <div className="px-4 py-2 border-t border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="flex gap-2 max-w-4xl mx-auto overflow-x-auto pb-1">
                  <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                    <FileText className="h-3 w-3" />
                    Send Form
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                    <Calendar className="h-3 w-3" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                    <Stethoscope className="h-3 w-3" />
                    View Records
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                    <Phone className="h-3 w-3" />
                    Call Patient
                  </Button>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 rounded-full border-2 focus:border-primary/50 transition-colors" />
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="rounded-full px-6">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Portfolio demo: Messages are simulated for demonstration purposes
                  </p>
                </div>
              </div>
            </> : <ChatEmptyState type="no-selection" title="Patient Communication Hub" description="Select a patient conversation to view message history, send SMS, or initiate calls. This demo showcases HIPAA-compliant messaging workflow." />}
        </div>
      </div>
    </Layout>;
};
export default DemoConversations;