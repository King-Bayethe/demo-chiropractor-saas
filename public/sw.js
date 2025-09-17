const CACHE_NAME = 'healthcare-portfolio-v3';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/robots.txt'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'New Notification',
        body: event.data.text() || 'You have a new notification',
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      };
    }
  }

  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/icon-192.png',
    badge: notificationData.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/',
      entity_type: notificationData.entity_type,
      entity_id: notificationData.entity_id,
      notification_id: notificationData.notification_id
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: notificationData.priority === 'critical',
    silent: notificationData.priority === 'low'
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'New Notification',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (urlToOpen !== '/') {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen,
                data: event.notification.data
              });
            }
            return;
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );

  // Mark notification as read if we have the ID
  if (event.notification.data?.notification_id) {
    event.waitUntil(
      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: event.notification.data.notification_id
        })
      }).catch(console.error)
    );
  }
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Get pending notifications from IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['pending_notifications'], 'readwrite');
    const store = transaction.objectStore('pending_notifications');
    const pendingNotifications = await store.getAll();
    
    // Send each pending notification
    for (const notification of pendingNotifications) {
      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification.data)
        });
        
        // Remove from pending if successful
        await store.delete(notification.id);
      } catch (error) {
        console.error('Failed to sync notification:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helper for offline support
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending_notifications')) {
        const store = db.createObjectStore('pending_notifications', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});