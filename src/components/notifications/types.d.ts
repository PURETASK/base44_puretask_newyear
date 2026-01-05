/**
 * Type Declarations for Notification Services
 * Created: January 4, 2026
 */

// ============================================================================
// NOTIFICATION SERVICE TYPES
// ============================================================================

export interface NotificationCreateParams {
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, any>;
  link?: string | null;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationResult {
  success: boolean;
  notification?: any;
  error?: string;
}

export interface NewBookingParams {
  cleanerEmail: string;
  bookingId: string;
  clientName: string;
  date: string;
  time: string;
}

export interface BookingAcceptedParams {
  clientEmail: string;
  bookingId: string;
  cleanerName: string;
  date: string;
  time: string;
}

export interface BookingDeclinedParams {
  clientEmail: string;
  bookingId: string;
  cleanerName: string;
}

export interface BookingCancelledParams {
  recipientEmail: string;
  bookingId: string;
  cancelledBy: string;
  reason?: string;
}

export interface NotificationServiceType {
  create(params: NotificationCreateParams): Promise<NotificationResult>;
  notifyNewBooking(params: NewBookingParams): Promise<NotificationResult>;
  notifyBookingAccepted(params: BookingAcceptedParams): Promise<NotificationResult>;
  notifyBookingDeclined(params: BookingDeclinedParams): Promise<NotificationResult>;
  notifyBookingCancelled(params: BookingCancelledParams): Promise<NotificationResult>;
  // Add other notification methods as needed
}

export const NotificationService: NotificationServiceType;

// ============================================================================
// EMAIL NOTIFICATION SERVICE TYPES
// ============================================================================

export interface EmailTemplateVars extends Record<string, any> {
  first_name?: string;
  last_name?: string;
  booking_link?: string;
  cleaner_name?: string;
  date?: string;
  time?: string;
  address?: string;
  price?: string;
  manage_booking_link?: string;
  rate_cleaner_link?: string;
  [key: string]: any;
}

export interface SendNotificationParams {
  recipientEmail: string;
  templateId: string;
  templateData: EmailTemplateVars;
  skipEmail?: boolean;
  skipSMS?: boolean;
}

export interface SendNotificationResult {
  success: boolean;
  emailSent?: boolean;
  smsSent?: boolean;
  error?: string;
}

export interface EmailNotificationServiceType {
  sendNotification(params: SendNotificationParams): Promise<SendNotificationResult>;
  getTemplate(templateId: string): { subject: string | ((vars: EmailTemplateVars) => string); html: (vars: EmailTemplateVars) => string; sms: ((vars: EmailTemplateVars) => string) | null } | undefined;
}

declare const EmailNotificationService: EmailNotificationServiceType;

export default EmailNotificationService;

