// SMS Service with Twilio Integration
// Sends time-sensitive notifications via SMS

import { base44 } from '@/api/base44Client';

/**
 * SMS Service
 * Handles SMS notifications via Twilio for time-sensitive alerts
 * 
 * Setup Instructions:
 * 1. Sign up at https://www.twilio.com
 * 2. Get your Account SID and Auth Token
 * 3. Purchase a phone number
 * 4. Add to .env.local:
 *    VITE_TWILIO_ACCOUNT_SID=your_account_sid
 *    VITE_TWILIO_AUTH_TOKEN=your_auth_token
 *    VITE_TWILIO_PHONE_NUMBER=+1234567890
 * 
 * For production, use Twilio Functions (serverless) to keep credentials secure
 */

interface SMSMessage {
  to: string;
  message: string;
  priority?: 'high' | 'normal' | 'low';
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export class SMSService {
  private enabled: boolean = false;
  private twilioAccountSid: string | undefined;
  private twilioAuthToken: string | undefined;
  private twilioPhoneNumber: string | undefined;

  constructor() {
    // Check if Twilio credentials are configured
    this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

    this.enabled = !!(this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber);

    if (!this.enabled) {
      console.warn('[SMSService] Twilio credentials not configured. SMS notifications will be logged only.');
    } else {
      console.log('[SMSService] Twilio configured. SMS notifications enabled.');
    }
  }

  /**
   * Send SMS via Twilio
   * 
   * Note: For production, this should be a serverless function to keep credentials secure
   * Never expose Twilio credentials in frontend code
   */
  async sendSMS({ to, message, priority = 'normal' }: SMSMessage): Promise<SMSResult> {
    const timestamp = new Date().toISOString();

    // Validate phone number format
    if (!this.isValidPhoneNumber(to)) {
      console.error(`[SMSService] Invalid phone number: ${to}`);
      return {
        success: false,
        error: 'Invalid phone number format',
        timestamp
      };
    }

    // If Twilio not configured, log only (dev mode)
    if (!this.enabled) {
      console.log(`[SMSService] [${priority.toUpperCase()}] Would send SMS to ${to}: ${message}`);
      
      // Store in database for tracking (even in dev mode)
      await this.logSMS({ to, message, priority, status: 'dev_mode', timestamp });
      
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
        timestamp
      };
    }

    try {
      // PRODUCTION: Use Base44 serverless function to send SMS securely
      // This keeps Twilio credentials on the backend
      const result = await base44.integrations.Core.InvokeServerlessFunction({
        functionName: 'sendTwilioSMS',
        payload: {
          to: to,
          from: this.twilioPhoneNumber,
          body: message,
          accountSid: this.twilioAccountSid,
          authToken: this.twilioAuthToken
        }
      });

      console.log(`[SMSService] SMS sent successfully to ${to}. SID: ${result.sid}`);

      // Log to database for tracking
      await this.logSMS({ to, message, priority, status: 'sent', timestamp, sid: result.sid });

      return {
        success: true,
        messageId: result.sid,
        timestamp
      };

    } catch (error: any) {
      console.error('[SMSService] Failed to send SMS:', error);

      // Log failed attempt
      await this.logSMS({ to, message, priority, status: 'failed', timestamp, error: error.message });

      return {
        success: false,
        error: error.message || 'Failed to send SMS',
        timestamp
      };
    }
  }

  /**
   * Send batch SMS messages
   */
  async sendBatchSMS(messages: SMSMessage[]): Promise<SMSResult[]> {
    console.log(`[SMSService] Sending batch of ${messages.length} SMS messages`);
    
    // Send in parallel with rate limiting (Twilio allows ~1 per second)
    const results: SMSResult[] = [];
    
    for (const msg of messages) {
      const result = await this.sendSMS(msg);
      results.push(result);
      
      // Small delay to avoid rate limiting
      if (this.enabled) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Validate phone number format (E.164 format)
   * Examples: +14155552671, +442071838750
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Must start with + and have 10-15 digits
    const e164Regex = /^\+[1-9]\d{9,14}$/;
    return e164Regex.test(phone);
  }

  /**
   * Format phone number to E.164 format
   * Examples: (415) 555-2671 -> +14155552671
   */
  formatPhoneNumber(phone: string, countryCode: string = '+1'): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If already has country code, return as-is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Add country code
    return `${countryCode}${cleaned}`;
  }

  /**
   * Log SMS to database for tracking and analytics
   */
  private async logSMS(data: {
    to: string;
    message: string;
    priority: string;
    status: string;
    timestamp: string;
    sid?: string;
    error?: string;
  }) {
    try {
      // Check if SMSLog entity exists, if not, just console log
      await base44.asServiceRole.entities.SMSLog?.create({
        recipient_phone: data.to,
        message_body: data.message,
        priority: data.priority,
        status: data.status,
        twilio_sid: data.sid || null,
        error_message: data.error || null,
        sent_at: data.timestamp
      }).catch(() => {
        // Entity doesn't exist yet, just log
        console.log('[SMSService] SMSLog entity not found, skipping database log');
      });
    } catch (error) {
      // Fail silently - don't let logging errors block SMS sending
      console.error('[SMSService] Failed to log SMS:', error);
    }
  }

  /**
   * Check if SMS is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get SMS delivery status from Twilio
   */
  async getDeliveryStatus(messageSid: string): Promise<any> {
    if (!this.enabled) {
      return { status: 'dev_mode' };
    }

    try {
      const result = await base44.integrations.Core.InvokeServerlessFunction({
        functionName: 'getTwilioMessageStatus',
        payload: {
          messageSid: messageSid,
          accountSid: this.twilioAccountSid,
          authToken: this.twilioAuthToken
        }
      });

      return result;
    } catch (error) {
      console.error('[SMSService] Failed to get delivery status:', error);
      return { status: 'unknown', error: error.message };
    }
  }
}

// Singleton instance
export const smsService = new SMSService();

// ============================================================================
// TEMPLATE FUNCTIONS (ready-to-use SMS messages)
// ============================================================================

/**
 * Client SMS Templates
 */
export const ClientSMSTemplates = {
  bookingConfirmed: (cleanerName: string, date: string, time: string) =>
    `✅ Your cleaning is booked for ${date} at ${time}. Cleaner: ${cleanerName}. -PureTask`,

  cleanerEnRoute: (cleanerName: string, eta: string) =>
    `🚗 ${cleanerName} is on the way! ETA: ${eta}. -PureTask`,

  cleanerArrived: (cleanerName: string) =>
    `📍 ${cleanerName} has arrived and will start shortly. -PureTask`,

  jobStarted: (cleanerName: string, time: string) =>
    `🧹 Cleaning started at ${time} by ${cleanerName}. -PureTask`,

  extraTimeRequested: (cleanerName: string, minutes: number, cost: string) =>
    `⏰ ${cleanerName} requests ${minutes} extra minutes (+$${cost}). Approve in app: https://puretask.com/approve -PureTask`,

  jobCompleted: (cleanerName: string, duration: string) =>
    `✅ Cleaning complete (${duration})! Please review: https://puretask.com/review -PureTask`,

  paymentProcessed: (amount: string) =>
    `💳 Payment of $${amount} processed. Receipt sent to email. -PureTask`,
};

/**
 * Cleaner SMS Templates
 */
export const CleanerSMSTemplates = {
  jobOffer: (clientName: string, date: string, time: string, pay: string) =>
    `🆕 New job offer from ${clientName} on ${date} at ${time}. Pay: $${pay}. Respond in app. -PureTask`,

  jobAccepted: (clientName: string, date: string, time: string, address: string) =>
    `✅ Job confirmed with ${clientName} on ${date} at ${time}. Address: ${address}. -PureTask`,

  jobReminder15: (clientName: string, address: string) =>
    `⏰ Reminder: Job with ${clientName} in 15 min. Address: ${address}. -PureTask`,

  jobReminder30: (clientName: string, time: string) =>
    `⏰ Reminder: Job with ${clientName} at ${time} (30 min). -PureTask`,

  extraTimeApproved: (minutes: number) =>
    `✅ Client approved ${minutes} extra minutes. Continue working! -PureTask`,

  extraTimeDenied: () =>
    `❌ Client denied extra time. Please wrap up soon. -PureTask`,

  payoutProcessed: (amount: string) =>
    `💰 Payout of $${amount} processed to your account. -PureTask`,

  lateArrivalWarning: (minutes: number) =>
    `⚠️ You're ${minutes} min late. Please notify client. -PureTask`,

  photoReminder: () =>
    `📸 Reminder: Upload before/after photos before completing job. -PureTask`,
};

// Export default instance
export default smsService;

