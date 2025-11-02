import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userName?: string;
  userInitials?: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  userName = 'Someone',
  userInitials = 'U',
  className 
}) => {
  return (
    <div className={cn("flex items-center gap-3 animate-fade-in", className)}>
      <Avatar className="w-6 h-6 md:w-8 md:h-8">
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex gap-1">
          <div 
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <div 
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" 
            style={{ animationDelay: '150ms', animationDuration: '1s' }}
          />
          <div 
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" 
            style={{ animationDelay: '300ms', animationDuration: '1s' }}
          />
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {userName} is typing...
        </span>
      </div>
    </div>
  );
};
