import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send,
  Paperclip,
  Smile,
  MessageCircle
} from 'lucide-react';
import { QuickActionsDropdown } from '@/components/conversations/QuickActionsDropdown';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  };
}

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: any[];
}

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  currentUserId: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  currentUserId
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  const getSenderDisplayName = (sender: any): string => {
    if (!sender) return 'Unknown';
    const firstName = sender.first_name || '';
    const lastName = sender.last_name || '';
    const role = sender.role === 'admin' ? '(Admin)' : 
                 sender.role === 'doctor' ? '(Dr.)' : 
                 sender.role === 'nurse' ? '(RN)' : '';
    return `${firstName} ${lastName} ${role}`.trim() || 'Medical Staff';
  };

  const getSenderAvatar = (sender: any): string => {
    if (!sender) return 'U';
    const firstName = sender.first_name || '';
    const lastName = sender.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
  };

  const isOwnMessage = (message: Message): boolean => {
    return message.sender.id === currentUserId;
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
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

  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1];
    const shouldGroup = prevMessage && 
      prevMessage.sender.id === message.sender.id && 
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000; // 5 minutes

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
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">Welcome to Team Chat</h3>
          <p className="text-muted-foreground max-w-md">
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
          {groupedMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            groupedMessages.map((group, groupIndex) => {
              const isOwn = group.sender.id === currentUserId;
              
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
                      {group.messages.map((message: Message, messageIndex: number) => (
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
          
          {isTyping && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm">Someone is typing...</span>
            </div>
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
                className="pr-20 py-3 rounded-full border-2 focus:border-primary/50 transition-colors"
                maxLength={1000}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <QuickActionsDropdown onSendMessage={onSendMessage} />
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full h-12 w-12"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </form>
      </div>
    </div>
  );
};