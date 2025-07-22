import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeamChat, ChatMessage } from '@/hooks/useTeamChat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
  chat: TeamChat | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  loading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  loading = false
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const getSenderDisplayName = (sender: ChatMessage['sender']): string => {
    if (!sender) return 'Unknown';
    
    const firstName = sender.first_name?.trim() || '';
    const lastName = sender.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    if (firstName || lastName) {
      return firstName || lastName;
    }
    
    return sender.email || 'Unknown User';
  };

  const getSenderAvatar = (sender: ChatMessage['sender']): string => {
    if (!sender) return 'U';
    
    const firstName = sender.first_name?.trim() || '';
    const lastName = sender.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    if (firstName || lastName) {
      const name = firstName || lastName;
      return name.slice(0, 2).toUpperCase();
    }
    
    if (sender.email) {
      return sender.email.slice(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  const isOwnMessage = (message: ChatMessage): boolean => {
    return message.sender.id === user?.id;
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Group consecutive messages from same sender within 5 minutes
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1];
    const shouldGroup = prevMessage && 
      prevMessage.sender.id === message.sender.id && 
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000;

    if (!shouldGroup) {
      groups.push({
        sender: message.sender,
        messages: [message],
        timestamp: message.created_at
      });
    } else {
      groups[groups.length - 1].messages.push(message);
    }

    return groups;
  }, []);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/5">
        <div className="text-center max-w-md">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">Welcome to Team Chat</h3>
          <p className="text-muted-foreground">
            Select a conversation from the sidebar to start messaging with your team members, 
            or create a new chat to begin collaborating.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-muted/5">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            groupedMessages.map((group, groupIndex) => {
              const isOwn = group.sender.id === user?.id;
              
              return (
                <div key={groupIndex} className={cn("flex gap-3", isOwn ? "justify-end" : "justify-start")}>
                  {!isOwn && (
                    <Avatar className="w-8 h-8 mt-auto">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getSenderAvatar(group.sender)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn("space-y-1 max-w-[70%]", isOwn ? "items-end" : "items-start")}>
                    {!isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {getSenderDisplayName(group.sender)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(group.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {group.messages.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={cn(
                            "px-4 py-2 rounded-2xl text-sm break-words",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-card border border-border rounded-bl-md"
                          )}
                        >
                          {message.content}
                        </div>
                      ))}
                    </div>
                    
                    {isOwn && (
                      <div className="text-xs text-muted-foreground text-right">
                        {formatMessageTime(group.timestamp)}
                      </div>
                    )}
                  </div>
                  
                  {isOwn && (
                    <Avatar className="w-8 h-8 mt-auto">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {getSenderAvatar(group.sender)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-4 py-3 rounded-full border-2 focus:border-primary/50 transition-colors"
                maxLength={1000}
                disabled={sending}
              />
            </div>
            
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full h-12 w-12"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </form>
      </div>
    </div>
  );
};