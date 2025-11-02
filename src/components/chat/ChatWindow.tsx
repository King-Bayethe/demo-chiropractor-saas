import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatEmptyState } from '@/components/ui/chat-empty-state';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { 
  Send,
  Paperclip,
  Smile,
  MessageCircle
} from 'lucide-react';
import { QuickActionsDropdown } from '@/components/conversations/QuickActionsDropdown';
import { useNotificationHelpers } from '@/hooks/useNotificationHelpers';
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
      <ChatEmptyState 
        type="no-selection"
        title="Welcome to Team Chat"
        description="Select a conversation from the sidebar to start messaging with your team members, or create a new chat to begin collaborating."
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-muted/10 via-background to-muted/5">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-2 md:p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {groupedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-16">
              <ChatEmptyState type="no-messages" />
            </div>
          ) : (
            groupedMessages.map((group, groupIndex) => {
              const isOwn = group.sender.id === currentUserId;
              
              return (
                <div 
                  key={groupIndex} 
                  className={cn(
                    "flex gap-2 md:gap-3 animate-fade-in",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${groupIndex * 50}ms` }}
                >
                  {!isOwn && (
                    <Avatar className="w-6 h-6 md:w-8 md:h-8 mt-auto flex-shrink-0 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-medium">
                        {getSenderAvatar(group.sender)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn("space-y-1 max-w-[85%] md:max-w-[70%] min-w-0", isOwn ? "items-end" : "items-start")}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <span className="text-xs md:text-sm font-medium text-foreground truncate flex-shrink">
                          {getSenderDisplayName(group.sender)}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatMessageTime(group.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-1 min-w-0">
                      {group.messages.map((message: Message, messageIndex: number) => (
                        <div
                          key={message.id}
                          className={cn(
                            "px-3 py-2 md:px-4 rounded-2xl text-sm break-words overflow-wrap-anywhere min-w-0 shadow-sm transition-all hover:shadow-md",
                            isOwn
                              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm"
                              : "bg-card border border-border rounded-bl-sm hover:border-primary/30"
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
                    <Avatar className="w-6 h-6 md:w-8 md:h-8 mt-auto flex-shrink-0 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground text-xs font-medium">
                        {getSenderAvatar(group.sender)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          
          {isTyping && <TypingIndicator userName="Team Member" userInitials="TM" />}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-2 md:p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 min-w-0">
            <div className="flex-1 min-w-0 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-12 md:pr-20 py-2 md:py-3 rounded-full border-2 focus:border-primary/50 transition-colors text-sm min-w-0"
                maxLength={1000}
              />
              <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <div className="hidden md:block">
                  <QuickActionsDropdown onSendMessage={onSendMessage} />
                </div>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 md:h-8 md:w-8 p-0 flex-shrink-0">
                  <Paperclip className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <div className="hidden md:block">
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12 flex-shrink-0"
              disabled={!newMessage.trim()}
            >
              <Send className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span className="hidden md:block">Press Enter to send, Shift+Enter for new line</span>
            <span className="md:hidden">Tap to send</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </form>
      </div>
    </div>
  );
};