import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageStatusIndicatorProps {
  status: 'sending' | 'delivered' | 'failed' | 'read';
  errorInfo?: string;
  onRetry?: () => void;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({ 
  status, 
  errorInfo, 
  onRetry 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'delivered':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'failed':
        return errorInfo || 'Failed to send';
      default:
        return '';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
          </TooltipContent>
        </Tooltip>
        
        {status === 'failed' && onRetry && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-6 w-6 p-0 ml-1"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retry sending</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};