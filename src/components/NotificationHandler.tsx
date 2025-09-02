import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const NotificationHandler = () => {
  const navigate = useNavigate();
  const { requestPermission } = usePushNotifications();

  useEffect(() => {
    // Request permission on app load
    requestPermission();

    // Listen for service worker messages (notification clicks)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        const { url, data } = event.data;
        
        // Navigate to the notification URL
        if (url && url !== '/') {
          navigate(url);
        }

        // Handle specific entity types
        if (data?.entity_type && data?.entity_id) {
          switch (data.entity_type) {
            case 'chat':
              navigate(`/team-chat?chat=${data.entity_id}`);
              break;
            case 'patient':
              navigate(`/patients/${data.entity_id}`);
              break;
            case 'appointment':
              navigate(`/calendar?appointment=${data.entity_id}`);
              break;
            case 'soap_note':
              navigate(`/soap-notes/view/${data.entity_id}`);
              break;
            default:
              if (url) navigate(url);
              break;
          }
        }
      }
    };

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [navigate, requestPermission]);

  return null;
};