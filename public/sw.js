// Service Worker for Push Notifications
// Handles background push messages even when app is closed

/* global self, clients */

console.log('[ServiceWorker] Loading...');

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  self.skipWaiting(); // Activate immediately
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  event.waitUntil(clients.claim()); // Take control of all pages
});

// Push event (when notification arrives)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push event received');

  let data = {
    title: 'PureTask Notification',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {}
  };

  // Parse notification data
  if (event.data) {
    try {
      data = event.data.json();
      console.log('[ServiceWorker] Push data:', data);
    } catch (e) {
      console.error('[ServiceWorker] Push data parse error:', e);
      data.body = event.data.text();
    }
  }

  // Show notification
  const notificationPromise = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    image: data.image,
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {}
  });

  event.waitUntil(notificationPromise);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.notification.tag);

  event.notification.close(); // Close the notification

  // Handle action buttons
  if (event.action) {
    console.log('[ServiceWorker] Action clicked:', event.action);
    
    // Handle different actions
    const actionHandlers = {
      'approve': () => handleApproveAction(event.notification.data),
      'deny': () => handleDenyAction(event.notification.data),
      'accept': () => handleAcceptAction(event.notification.data),
      'decline': () => handleDeclineAction(event.notification.data)
    };

    const handler = actionHandlers[event.action];
    if (handler) {
      event.waitUntil(handler());
      return;
    }
  }

  // Default action: Open app
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const data = event.notification.data;
        let url = '/';

        // Determine URL based on notification type
        if (data.jobId) {
          if (data.type === 'cleaner_en_route' || data.type === 'cleaner_arrived' || data.type === 'job_completed') {
            url = `/ClientBookings?booking=${data.jobId}`;
          } else if (data.type === 'job_offer' || data.type === 'job_reminder') {
            url = `/CleanerJobDetail/${data.jobId}`;
          } else if (data.type === 'extra_time_request') {
            url = `/ClientBookings?booking=${data.jobId}&action=extra_time`;
          }
        }

        // Focus existing window or open new one
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle approve action
async function handleApproveAction(data) {
  console.log('[ServiceWorker] Approve action:', data);
  
  // Send message to open window or open new window with approval
  const url = `/ClientBookings?booking=${data.jobId}&action=approve&type=${data.type}`;
  
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  
  for (let client of clientList) {
    if ('focus' in client) {
      client.focus();
      client.postMessage({ type: 'APPROVE_ACTION', data: data });
      return;
    }
  }
  
  if (clients.openWindow) {
    return clients.openWindow(url);
  }
}

// Handle deny action
async function handleDenyAction(data) {
  console.log('[ServiceWorker] Deny action:', data);
  
  const url = `/ClientBookings?booking=${data.jobId}&action=deny&type=${data.type}`;
  
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  
  for (let client of clientList) {
    if ('focus' in client) {
      client.focus();
      client.postMessage({ type: 'DENY_ACTION', data: data });
      return;
    }
  }
  
  if (clients.openWindow) {
    return clients.openWindow(url);
  }
}

// Handle accept action
async function handleAcceptAction(data) {
  console.log('[ServiceWorker] Accept action:', data);
  
  const url = `/CleanerJobDetail/${data.jobId}?action=accept`;
  
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  
  for (let client of clientList) {
    if ('focus' in client) {
      client.focus();
      client.postMessage({ type: 'ACCEPT_ACTION', data: data });
      return;
    }
  }
  
  if (clients.openWindow) {
    return clients.openWindow(url);
  }
}

// Handle decline action
async function handleDeclineAction(data) {
  console.log('[ServiceWorker] Decline action:', data);
  
  const url = `/CleanerJobDetail/${data.jobId}?action=decline`;
  
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  
  for (let client of clientList) {
    if ('focus' in client) {
      client.focus();
      client.postMessage({ type: 'DECLINE_ACTION', data: data });
      return;
    }
  }
  
  if (clients.openWindow) {
    return clients.openWindow(url);
  }
}

// Background sync event (for offline support)
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Sync notifications when back online
async function syncNotifications() {
  console.log('[ServiceWorker] Syncing notifications...');
  // This would fetch any missed notifications from the server
  // Implementation depends on your backend API
}

// Message event (from pages)
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[ServiceWorker] Loaded successfully');

