import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatEmptyStateProps {
  type: 'no-selection' | 'no-messages' | 'no-conversations';
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  type,
  title,
  description,
  onAction,
  actionLabel,
  className
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'no-selection':
        return {
          icon: MessageSquare,
          title: title || 'Select a conversation',
          description: description || 'Choose a conversation from the sidebar to start messaging',
          showAction: false
        };
      case 'no-messages':
        return {
          icon: MessageCircle,
          title: title || 'No messages yet',
          description: description || 'Start the conversation by sending a message',
          showAction: false
        };
      case 'no-conversations':
        return {
          icon: Users,
          title: title || 'Start collaborating',
          description: description || 'Create a direct message or group chat to communicate with your team',
          showAction: true,
          actionLabel: actionLabel || 'New Conversation'
        };
      default:
        return {
          icon: MessageSquare,
          title: title || 'No content',
          description: description || '',
          showAction: false
        };
    }
  };

  const content = getDefaultContent();
  const Icon = content.icon;

  return (
    <div className={cn(
      "flex-1 flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/20",
      className
    )}>
      <div className="text-center max-w-md p-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center animate-scale-in">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3 text-foreground">
          {content.title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {content.description}
        </p>
        {content.showAction && onAction && (
          <div className="flex gap-3 justify-center">
            <Button onClick={onAction} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {content.actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
