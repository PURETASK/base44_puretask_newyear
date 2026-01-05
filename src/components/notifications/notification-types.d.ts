/**
 * Type Definitions for Notification Services
 * 
 * Provides TypeScript definitions for notification-related services
 * to enable type checking and autocomplete.
 */

// ============================================================================
// NOTIFICATION OPTIONS
// ============================================================================

export interface NotificationOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export interface NotificationServiceInterface {
  /**
   * Show a success notification
   */
  success(message: string, title?: string): void;
  
  /**
   * Show an error notification
   */
  error(message: string, title?: string): void;
  
  /**
   * Show a warning notification
   */
  warning(message: string, title?: string): void;
  
  /**
   * Show an info notification
   */
  info(message: string, title?: string): void;
  
  /**
   * Show a custom notification
   */
  custom(options: NotificationOptions): void;
  
  /**
   * Clear all notifications
   */
  clearAll(): void;
}

declare const NotificationService: NotificationServiceInterface;
export default NotificationService;

// ============================================================================
// EMAIL NOTIFICATION SERVICE
// ============================================================================

export interface EmailTemplate {
  templateId: string;
  subject: string;
  variables: Record<string, any>;
}

export interface EmailNotificationParams {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailNotificationServiceInterface {
  /**
   * Send an email notification
   */
  sendNotification(params: EmailNotificationParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  
  /**
   * Send a templated email
   */
  sendTemplated(params: {
    to: string | string[];
    templateId: string;
    variables: Record<string, any>;
  }): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  
  /**
   * Validate an email address
   */
  validateEmail(email: string): boolean;
  
  /**
   * Get available email templates
   */
  getTemplates(): Promise<EmailTemplate[]>;
}

export const EmailNotificationService: EmailNotificationServiceInterface;

// ============================================================================
// SMS NOTIFICATION TYPES
// ============================================================================

export interface SMSNotificationParams {
  to: string;
  message: string;
  from?: string;
}

export interface SMSNotificationServiceInterface {
  /**
   * Send an SMS notification
   */
  send(params: SMSNotificationParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  
  /**
   * Validate a phone number
   */
  validatePhoneNumber(phone: string): boolean;
}

// ============================================================================
// PUSH NOTIFICATION TYPES
// ============================================================================

export interface PushNotificationParams {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationServiceInterface {
  /**
   * Request permission for push notifications
   */
  requestPermission(): Promise<NotificationPermission>;
  
  /**
   * Subscribe to push notifications
   */
  subscribe(): Promise<PushSubscriptionData | null>;
  
  /**
   * Unsubscribe from push notifications
   */
  unsubscribe(): Promise<boolean>;
  
  /**
   * Send a push notification
   */
  send(userId: string, params: PushNotificationParams): Promise<{
    success: boolean;
    error?: string;
  }>;
  
  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean;
  
  /**
   * Get current subscription
   */
  getSubscription(): Promise<PushSubscriptionData | null>;
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    jobUpdates: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
  sms: {
    enabled: boolean;
    jobUpdates: boolean;
    reminders: boolean;
  };
  push: {
    enabled: boolean;
    jobUpdates: boolean;
    messages: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

// ============================================================================
// NOTIFICATION CHANNELS
// ============================================================================

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export interface NotificationMessage {
  id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  NotificationServiceInterface,
  EmailNotificationServiceInterface,
  SMSNotificationServiceInterface,
  PushNotificationServiceInterface
};

