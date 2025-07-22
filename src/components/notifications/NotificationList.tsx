import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Trash2, MessageSquare, AlertTriangle, Info, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  onClose?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Handle navigation based on entity_type if needed
    if (notification.entity_type === 'chat' && notification.entity_id) {
      // Navigate to specific chat - would need router integration
      console.log('Navigate to chat:', notification.entity_id);
    }
    onClose?.();
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>
      
      <Separator />

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-muted/50",
                  !notification.read && "bg-muted/30"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                      "text-sm font-medium leading-tight",
                      !notification.read && "font-semibold"
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};