import { base44 } from '@/api/base44Client';

/**
 * CommunicationService - Centralized service for all automated messaging
 * Handles message template processing, channel delivery, and logging
 */
class CommunicationService {
  /**
   * Send automated message via configured channels
   */
  static async sendMessage({
    cleaner_email,
    client_email,
    message_type,
    booking_id,
    custom_data = {}
  }) {
    try {
      // Fetch cleaner's communication settings
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: cleaner_email });
      if (cleanerProfiles.length === 0) {
        console.log('Cleaner profile not found:', cleaner_email);
        return { success: false, error: 'Cleaner profile not found' };
      }

      const cleanerProfile = cleanerProfiles[0];
      const commSettings = cleanerProfile.communication_settings || {};
      const messageConfig = commSettings[message_type];

      if (!messageConfig || !messageConfig.enabled) {
        console.log(`Message type ${message_type} is not enabled for cleaner ${cleaner_email}`);
        return { success: false, error: 'Message type not enabled' };
      }

      // Get template and replace variables
      const template = messageConfig.custom_template || '';
      const message = this.replaceVariables(template, {
        ...custom_data,
        cleaner_name: cleanerProfile.full_name || 'Your cleaner'
      });

      const channels = messageConfig.channels || [];
      const deliveryResults = [];

      // Send via all enabled channels
      for (const channel of channels) {
        try {
          let result;
          if (channel === 'sms') {
            result = await this.sendViaSMS(custom_data.client_phone, message);
          } else if (channel === 'email') {
            result = await this.sendViaEmail(client_email, `PureTask - ${message_type}`, message);
          } else if (channel === 'in_app') {
            result = await this.sendViaInApp(booking_id, client_email, cleaner_email, message);
          }
          deliveryResults.push({ channel, success: true, result });
        } catch (error) {
          deliveryResults.push({ channel, success: false, error: error.message });
        }
      }

      // Log delivery
      await this.logDelivery(message_type, cleaner_email, client_email, channels, deliveryResults);

      return {
        success: true,
        message: 'Message sent successfully',
        deliveryResults
      };

    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Replace template variables with actual data
   */
  static replaceVariables(template, data) {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, data[key] || '');
    });

    return result;
  }

  /**
   * Send message via SMS
   */
  static async sendViaSMS(to_number, message_body) {
    if (!to_number) {
      throw new Error('Phone number not available for SMS');
    }

    const response = await base44.functions.invoke('sendSMS', {
      to_number,
      message_body
    });

    return response;
  }

  /**
   * Send message via Email
   */
  static async sendViaEmail(to, subject, body) {
    const response = await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject,
      body
    });

    return response;
  }

  /**
   * Send message via In-App messaging
   */
  static async sendViaInApp(booking_id, client_email, cleaner_email, message) {
    // Find or create conversation thread
    let thread = null;
    
    if (booking_id) {
      const threads = await base44.asServiceRole.entities.ConversationThread.filter({
        booking_id: booking_id
      });
      if (threads.length > 0) {
        thread = threads[0];
      }
    }

    if (!thread) {
      // Find general thread between these users
      const generalThreads = await base44.asServiceRole.entities.ConversationThread.filter({
        participants: { $all: [client_email, cleaner_email] }
      });
      
      if (generalThreads.length > 0) {
        thread = generalThreads[0];
      } else {
        // Create new thread
        thread = await base44.asServiceRole.entities.ConversationThread.create({
          participants: [client_email, cleaner_email],
          booking_id: booking_id || null,
          subject: 'Booking Communication',
          last_message_at: new Date().toISOString(),
          unread_count_client: 1
        });
      }
    }

    // Create message
    const msg = await base44.asServiceRole.entities.Message.create({
      thread_id: thread.id,
      sender_email: cleaner_email,
      content: message,
      type: 'system_message',
      timestamp: new Date().toISOString()
    });

    // Update thread unread count
    await base44.asServiceRole.entities.ConversationThread.update(thread.id, {
      last_message_at: new Date().toISOString(),
      last_message_content: message.substring(0, 100),
      unread_count_client: (thread.unread_count_client || 0) + 1
    });

    return msg;
  }

  /**
   * Log message delivery for tracking and analytics
   */
  static async logDelivery(message_type, cleaner_email, client_email, channels, results) {
    try {
      await base44.asServiceRole.entities.MessageDeliveryLog.create({
        message_type,
        cleaner_email,
        client_email,
        channels,
        delivery_results: results,
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log delivery:', error);
    }
  }
}

export default CommunicationService;