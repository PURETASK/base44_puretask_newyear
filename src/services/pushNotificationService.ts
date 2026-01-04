// Push Notification Service
// Browser push notifications for instant alerts (even when app is closed)

import { base44 } from '@/api/base44Client';

/**
 * Push Notification Service
 * Uses Web Push API for browser notifications
 * 
 * Features:
 * - Works even when browser tab is closed
 * - Native OS notifications
 * - Click to open relevant page
 * - Rich notifications with icons and images
 * 
 * Setup Instructions:
 * 1. Generate VAPID keys: https://web-push-codelab.glitch.me/
 * 2. Add to .env.local:
 *    VITE_VAPID_PUBLIC_KEY=your_public_key
 * 3. Add service worker for background notifications
 */

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{ action: string; title: string }>;
  tag?: string;
  requireInteraction?: boolean;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private enabled: boolean = false;
  private vapidPublicKey: string | undefined;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  constructor() {
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    this.initialize();
  }

  /**
   * Initialize push notification service
   */
  private async initialize() {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('[PushNotificationService] Service workers not supported');
      return;
    }

    // Check if Push API is supported
    if (!('PushManager' in window)) {
      console.warn('[PushNotificationService] Push API not supported');
      return;
    }

    // Check if Notification API is supported
    if (!('Notification' in window)) {
      console.warn('[PushNotificationService] Notifications not supported');
      return;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PushNotificationService] Service worker registered');

      // Check existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('[PushNotificationService] Existing push subscription found');
        this.enabled = true;
      } else {
        console.log('[PushNotificationService] No existing push subscription');
      }
    } catch (error) {
      console.error('[PushNotificationService] Initialization error:', error);
    }
  }

  /**
   * Request permission and subscribe to push notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[PushNotificationService] Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('[PushNotificationService] Permission granted');
        
        // Subscribe to push
        const subscribed = await this.subscribe();
        
        if (subscribed) {
          this.enabled = true;
          return true;
        }
      } else if (permission === 'denied') {
        console.warn('[PushNotificationService] Permission denied');
      } else {
        console.log('[PushNotificationService] Permission dismissed');
      }
      
      return false;
    } catch (error) {
      console.error('[PushNotificationService] Permission request error:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribe(): Promise<boolean> {
    if (!this.registration) {
      console.error('[PushNotificationService] No service worker registration');
      return false;
    }

    if (!this.vapidPublicKey) {
      console.error('[PushNotificationService] VAPID public key not configured');
      return false;
    }

    try {
      // Convert VAPID key from base64 to Uint8Array
      const vapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      
      // Subscribe
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      console.log('[PushNotificationService] Subscribed to push notifications');

      // Save subscription to database
      await this.saveSubscription(this.subscription);

      return true;
    } catch (error) {
      console.error('[PushNotificationService] Subscribe error:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      await this.subscription.unsubscribe();
      console.log('[PushNotificationService] Unsubscribed from push notifications');

      // Remove subscription from database
      await this.removeSubscription(this.subscription);

      this.subscription = null;
      this.enabled = false;
      return true;
    } catch (error) {
      console.error('[PushNotificationService] Unsubscribe error:', error);
      return false;
    }
  }

  /**
   * Save push subscription to database
   */
  private async saveSubscription(subscription: PushSubscription) {
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return;

      const subscriptionData = subscription.toJSON();

      await base44.entities.PushSubscription?.create({
        user_email: user.email,
        endpoint: subscriptionData.endpoint,
        p256dh_key: subscriptionData.keys?.p256dh,
        auth_key: subscriptionData.keys?.auth,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      }).catch(() => {
        // Entity doesn't exist yet
        console.log('[PushNotificationService] PushSubscription entity not found');
      });

      console.log('[PushNotificationService] Subscription saved to database');
    } catch (error) {
      console.error('[PushNotificationService] Failed to save subscription:', error);
    }
  }

  /**
   * Remove push subscription from database
   */
  private async removeSubscription(subscription: PushSubscription) {
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return;

      const subscriptionData = subscription.toJSON();

      // Find and delete subscription
      const subs = await base44.entities.PushSubscription?.filter({
        user_email: user.email,
        endpoint: subscriptionData.endpoint
      }).catch(() => []);

      if (subs && subs.length > 0) {
        await base44.entities.PushSubscription.delete(subs[0].id);
        console.log('[PushNotificationService] Subscription removed from database');
      }
    } catch (error) {
      console.error('[PushNotificationService] Failed to remove subscription:', error);
    }
  }

  /**
   * Show local push notification (doesn't require server)
   * Useful for immediate feedback while server-side push is being processed
   */
  async showLocalNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.registration) {
      console.warn('[PushNotificationService] No service worker registration');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('[PushNotificationService] Notification permission not granted');
      return false;
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        image: payload.image,
        data: payload.data,
        actions: payload.actions,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        vibrate: [200, 100, 200]
      });

      console.log('[PushNotificationService] Local notification shown');
      return true;
    } catch (error) {
      console.error('[PushNotificationService] Show notification error:', error);
      return false;
    }
  }

  /**
   * Send push notification via server
   * The server will use the saved subscription to send a push message
   */
  async sendPushNotification(userEmail: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Call backend function to send push
      await base44.integrations.Core.InvokeServerlessFunction({
        functionName: 'sendPushNotification',
        payload: {
          recipientEmail: userEmail,
          notification: payload
        }
      });

      console.log(`[PushNotificationService] Push notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('[PushNotificationService] Send push error:', error);
      return false;
    }
  }

  /**
   * Check if push notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled && Notification.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Check if push is supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();

// ============================================================================
// NOTIFICATION TEMPLATES (ready-to-use push notifications)
// ============================================================================

/**
 * Client Push Notification Templates
 */
export const ClientPushTemplates = {
  cleanerEnRoute: (cleanerName: string, eta: string) => ({
    title: '🚗 Your cleaner is on the way!',
    body: `${cleanerName} is heading to your location. ETA: ${eta}`,
    icon: '/icons/car.png',
    tag: 'cleaner-en-route',
    requireInteraction: true,
    data: { type: 'cleaner_en_route' }
  }),

  cleanerArrived: (cleanerName: string) => ({
    title: '📍 Your cleaner has arrived!',
    body: `${cleanerName} checked in at your location and will start shortly.`,
    icon: '/icons/checkmark.png',
    tag: 'cleaner-arrived',
    requireInteraction: true,
    data: { type: 'cleaner_arrived' }
  }),

  extraTimeRequested: (cleanerName: string, minutes: number, cost: string) => ({
    title: '⏰ Extra time requested - Approval needed',
    body: `${cleanerName} requests ${minutes} extra minutes (+$${cost}). Tap to approve or deny.`,
    icon: '/icons/clock.png',
    tag: 'extra-time-request',
    requireInteraction: true,
    actions: [
      { action: 'approve', title: 'Approve' },
      { action: 'deny', title: 'Deny' }
    ],
    data: { type: 'extra_time_request', urgent: true }
  }),

  jobCompleted: (cleanerName: string) => ({
    title: '✅ Cleaning complete!',
    body: `${cleanerName} has finished. Please review and approve the work.`,
    icon: '/icons/checkmark.png',
    tag: 'job-completed',
    requireInteraction: true,
    data: { type: 'job_completed' }
  })
};

/**
 * Cleaner Push Notification Templates
 */
export const CleanerPushTemplates = {
  jobOffer: (clientName: string, pay: string) => ({
    title: '🆕 New job offer!',
    body: `${clientName} wants to book you. Pay: $${pay}. Tap to respond.`,
    icon: '/icons/briefcase.png',
    tag: 'job-offer',
    requireInteraction: true,
    actions: [
      { action: 'accept', title: 'Accept' },
      { action: 'decline', title: 'Decline' }
    ],
    data: { type: 'job_offer' }
  }),

  jobReminder: (clientName: string, minutes: number) => ({
    title: `⏰ Job starting in ${minutes} minutes`,
    body: `Reminder: Job with ${clientName}. Don't forget to GPS check-in!`,
    icon: '/icons/clock.png',
    tag: 'job-reminder',
    requireInteraction: true,
    data: { type: 'job_reminder' }
  }),

  extraTimeApproved: (minutes: number) => ({
    title: '✅ Extra time approved!',
    body: `Client approved ${minutes} extra minutes. Continue working!`,
    icon: '/icons/checkmark.png',
    tag: 'extra-time-approved',
    data: { type: 'extra_time_approved' }
  }),

  lateWarning: (minutes: number) => ({
    title: '⚠️ Late arrival alert',
    body: `You're ${minutes} min late. Please notify the client.`,
    icon: '/icons/warning.png',
    tag: 'late-warning',
    requireInteraction: true,
    data: { type: 'late_warning', urgent: true }
  })
};

// Export default instance
export default pushNotificationService;

