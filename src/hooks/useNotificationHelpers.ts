import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

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

    await createNotification({
      user_id: recipientId,
      title: `New message from ${senderName}`,
      message: `${chatName}: ${messagePreview}`,
      type: 'message',
      entity_type: 'chat',
      entity_id: chatId
    });
  }, [createNotification, user?.id]);

  const notifyMention = useCallback(async (
    recipientId: string,
    senderName: string,
    chatName: string,
    chatId: string,
    messageContent: string
  ) => {
    if (recipientId === user?.id) return; // Don't notify yourself

    await createNotification({
      user_id: recipientId,
      title: `${senderName} mentioned you`,
      message: `${chatName}: ${messageContent}`,
      type: 'mention',
      entity_type: 'chat',
      entity_id: chatId
    });
  }, [createNotification, user?.id]);

  const notifyNewChat = useCallback(async (
    recipientId: string,
    creatorName: string,
    chatName: string,
    chatId: string
  ) => {
    if (recipientId === user?.id) return; // Don't notify yourself

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
    message: string
  ) => {
    await createNotification({
      user_id: recipientId,
      title,
      message,
      type: 'info',
      entity_type: 'system'
    });
  }, [createNotification]);

  const notifyError = useCallback(async (
    recipientId: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string
  ) => {
    await createNotification({
      user_id: recipientId,
      title,
      message,
      type: 'error',
      entity_type: entityType,
      entity_id: entityId
    });
  }, [createNotification]);

  const notifySuccess = useCallback(async (
    recipientId: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string
  ) => {
    await createNotification({
      user_id: recipientId,
      title,
      message,
      type: 'success',
      entity_type: entityType,
      entity_id: entityId
    });
  }, [createNotification]);

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