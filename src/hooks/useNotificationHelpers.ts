import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationHelpers = () => {
  const { createNotification } = useNotifications();
  const { user } = useAuth();

  const notifyNewMessage = useCallback(async (
    recipientId: string,
    senderName: string,
    chatName: string,
    chatId: string,
    messagePreview: string
  ) => {
    if (recipientId === user?.id) return; // Don't notify yourself
    if (!user?.id) {
      console.warn('Cannot send notification: User not authenticated');
      return;
    }

    const notification = await createNotification({
      user_id: recipientId,
      title: `New message from ${senderName}`,
      message: `${chatName}: ${messagePreview}`,
      type: 'message',
      entity_type: 'chat',
      entity_id: chatId,
      priority: 'normal'
    });

    // Send push and email notifications
    if (notification) {
      await sendMultiChannelNotification(recipientId, {
        title: `New message from ${senderName}`,
        message: `${chatName}: ${messagePreview}`,
        entity_type: 'chat',
        entity_id: chatId,
        notification_id: notification.id,
        priority: 'normal'
      });
    }
  }, [createNotification, user?.id]);

  const notifyMention = useCallback(async (
    recipientId: string,
    senderName: string,
    chatName: string,
    chatId: string,
    messageContent: string
  ) => {
    if (recipientId === user?.id) return; // Don't notify yourself
    if (!user?.id) {
      console.warn('Cannot send mention notification: User not authenticated');
      return;
    }

    const notification = await createNotification({
      user_id: recipientId,
      title: `${senderName} mentioned you`,
      message: `${chatName}: ${messageContent}`,
      type: 'mention',
      entity_type: 'chat',
      entity_id: chatId,
      priority: 'high'
    });

    // Send push and email notifications for mentions (higher priority)
    if (notification) {
      await sendMultiChannelNotification(recipientId, {
        title: `${senderName} mentioned you`,
        message: `${chatName}: ${messageContent}`,
        entity_type: 'chat',
        entity_id: chatId,
        notification_id: notification.id,
        priority: 'high'
      });
    }
  }, [createNotification, user?.id]);

  const notifyNewChat = useCallback(async (
    recipientId: string,
    creatorName: string,
    chatName: string,
    chatId: string
  ) => {
    if (recipientId === user?.id) return; // Don't notify yourself
    if (!user?.id) {
      console.warn('Cannot send new chat notification: User not authenticated');
      return;
    }

    await createNotification({
      user_id: recipientId,
      title: 'Added to new conversation',
      message: `${creatorName} added you to "${chatName}"`,
      type: 'info',
      entity_type: 'chat',
      entity_id: chatId
    });
  }, [createNotification, user?.id]);

  const notifyUserJoined = useCallback(async (
    recipientId: string,
    userName: string,
    chatName: string,
    chatId: string
  ) => {
    if (recipientId === user?.id) return; // Don't notify yourself
    if (!user?.id) {
      console.warn('Cannot send user joined notification: User not authenticated');
      return;
    }

    await createNotification({
      user_id: recipientId,
      title: 'New member joined',
      message: `${userName} joined "${chatName}"`,
      type: 'info',
      entity_type: 'chat',
      entity_id: chatId
    });
  }, [createNotification, user?.id]);

  const notifySystemUpdate = useCallback(async (
    recipientId: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ) => {
    if (!user?.id) {
      console.warn('Cannot send system update notification: User not authenticated');
      return;
    }

    const notification = await createNotification({
      user_id: recipientId,
      title,
      message,
      type: 'info',
      entity_type: 'system',
      priority
    });

    // Send multi-channel notifications for system updates
    if (notification) {
      await sendMultiChannelNotification(recipientId, {
        title,
        message,
        entity_type: 'system',
        notification_id: notification.id,
        priority
      });
    }
  }, [createNotification]);

  const notifyError = useCallback(async (
    recipientId: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string
  ) => {
    if (!user?.id) {
      console.warn('Cannot send error notification: User not authenticated');
      return;
    }

    const notification = await createNotification({
      user_id: recipientId,
      title,
      message,
      type: 'error',
      entity_type: entityType,
      entity_id: entityId,
      priority: 'critical'
    });

    // Critical error notifications should go through all channels
    if (notification) {
      await sendMultiChannelNotification(recipientId, {
        title,
        message,
        entity_type: entityType,
        entity_id: entityId,
        notification_id: notification.id,
        priority: 'critical'
      });
    }
  }, [createNotification]);

  const notifySuccess = useCallback(async (
    recipientId: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string
  ) => {
    if (!user?.id) {
      console.warn('Cannot send success notification: User not authenticated');
      return;
    }

    const notification = await createNotification({
      user_id: recipientId,
      title,
      message,
      type: 'success',
      entity_type: entityType,
      entity_id: entityId,
      priority: 'low'
    });

    // Success notifications are usually low priority
    if (notification) {
      await sendMultiChannelNotification(recipientId, {
        title,
        message,
        entity_type: entityType,
        entity_id: entityId,
        notification_id: notification.id,
        priority: 'low'
      });
    }
  }, [createNotification]);

  const sendMultiChannelNotification = useCallback(async (
    userId: string,
    payload: {
      title: string;
      message: string;
      entity_type?: string;
      entity_id?: string;
      notification_id?: string;
      priority: 'low' | 'normal' | 'high' | 'critical';
    }
  ) => {
    try {
      // Send push notification
      const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          ...payload
        }
      });

      if (pushError) {
        console.error('Error sending push notification:', pushError);
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
        body: {
          user_id: userId,
          ...payload
        }
      });

      if (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    } catch (error) {
      console.error('Error sending multi-channel notification:', error);
    }
  }, []);

  return {
    notifyNewMessage,
    notifyMention,
    notifyNewChat,
    notifyUserJoined,
    notifySystemUpdate,
    notifyError,
    notifySuccess
  };
};