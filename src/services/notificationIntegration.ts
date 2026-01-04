// Notification Integration Layer
// Wires together all notification services (Client, SMS, Push, Real-Time)

import { clientNotificationService } from './clientNotificationService';
import { smsService, ClientSMSTemplates, CleanerSMSTemplates } from './smsService';
import { pushNotificationService, ClientPushTemplates, CleanerPushTemplates } from './pushNotificationService';
import { realTimeNotificationService } from './realTimeNotificationService';
import { jobEventBus } from './jobEvents';
import { base44 } from '@/api/base44Client';

/**
 * Notification Integration Service
 * Central orchestrator for all notification channels
 * 
 * Responsibilities:
 * - Wire job events to all notification services
 * - Respect user notification preferences
 * - Send notifications via multiple channels (in-app, email, SMS, push)
 * - Track delivery status
 */

export class NotificationIntegration {
  private initialized: boolean = false;

  /**
   * Initialize notification integration
   * Sets up all event listeners
   */
  async initialize() {
    if (this.initialized) {
      console.log('[NotificationIntegration] Already initialized');
      return;
    }

    console.log('[NotificationIntegration] Initializing...');

    // The clientNotificationService already sets up event listeners
    // We just need to enhance them with SMS and Push notifications

    this.setupEnhancedNotifications();

    this.initialized = true;
    console.log('[NotificationIntegration] Initialized successfully');
  }

  /**
   * Setup enhanced notifications (SMS + Push + Real-time)
   */
  private setupEnhancedNotifications() {
    // ========================================================================
    // CLIENT NOTIFICATIONS (Enhanced with SMS + Push)
    // ========================================================================

    // Cleaner en route - HIGH PRIORITY (anxiety reducer)
    jobEventBus.on('CLEANER_EN_ROUTE', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];

        if (!client) return;

        // Get notification preferences
        const prefs = await this.getNotificationPreferences(job.client_id);

        const eta = '15 minutes'; // Calculate actual ETA

        // SMS notification (HIGH PRIORITY)
        if (prefs.sms && client.phone) {
          await smsService.sendSMS({
            to: client.phone,
            message: ClientSMSTemplates.cleanerEnRoute(cleaner?.name || 'Your cleaner', eta),
            priority: 'high'
          });
        }

        // Push notification (HIGH PRIORITY)
        if (prefs.push) {
          await pushNotificationService.showLocalNotification(
            ClientPushTemplates.cleanerEnRoute(cleaner?.name || 'Your cleaner', eta)
          );
        }
      } catch (error) {
        console.error('[NotificationIntegration] Error in CLEANER_EN_ROUTE:', error);
      }
    });

    // Cleaner arrived
    jobEventBus.on('CLEANER_ARRIVED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];

        if (!client) return;

        const prefs = await this.getNotificationPreferences(job.client_id);

        // SMS notification
        if (prefs.sms && client.phone) {
          await smsService.sendSMS({
            to: client.phone,
            message: ClientSMSTemplates.cleanerArrived(cleaner?.name || 'Your cleaner'),
            priority: 'high'
          });
        }

        // Push notification
        if (prefs.push) {
          await pushNotificationService.showLocalNotification(
            ClientPushTemplates.cleanerArrived(cleaner?.name || 'Your cleaner')
          );
        }
      } catch (error) {
        console.error('[NotificationIntegration] Error in CLEANER_ARRIVED:', error);
      }
    });

    // Extra time requested - CRITICAL (requires immediate client approval)
    jobEventBus.on('EXTRA_TIME_REQUESTED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];

        if (!client) return;

        const prefs = await this.getNotificationPreferences(job.client_id);

        const additionalCost = ((job.total_price / (job.estimated_hours * 60)) * event.minutesRequested).toFixed(2);

        // SMS notification (ALWAYS send for urgent requests, even if disabled)
        if (client.phone) {
          await smsService.sendSMS({
            to: client.phone,
            message: ClientSMSTemplates.extraTimeRequested(
              cleaner?.name || 'Your cleaner',
              event.minutesRequested,
              additionalCost
            ),
            priority: 'high' // HIGHEST PRIORITY
          });
        }

        // Push notification (ALWAYS show for urgent requests)
        await pushNotificationService.showLocalNotification(
          ClientPushTemplates.extraTimeRequested(
            cleaner?.name || 'Your cleaner',
            event.minutesRequested,
            additionalCost
          )
        );
      } catch (error) {
        console.error('[NotificationIntegration] Error in EXTRA_TIME_REQUESTED:', error);
      }
    });

    // Job completed
    jobEventBus.on('JOB_COMPLETED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];

        if (!client) return;

        const prefs = await this.getNotificationPreferences(job.client_id);

        const hours = Math.floor(event.minutesWorked / 60);
        const minutes = event.minutesWorked % 60;
        const durationText = `${hours}h ${minutes}m`;

        // SMS notification
        if (prefs.sms && client.phone) {
          await smsService.sendSMS({
            to: client.phone,
            message: ClientSMSTemplates.jobCompleted(cleaner?.name || 'Your cleaner', durationText),
            priority: 'high'
          });
        }

        // Push notification
        if (prefs.push) {
          await pushNotificationService.showLocalNotification(
            ClientPushTemplates.jobCompleted(cleaner?.name || 'Your cleaner')
          );
        }
      } catch (error) {
        console.error('[NotificationIntegration] Error in JOB_COMPLETED:', error);
      }
    });

    // ========================================================================
    // CLEANER NOTIFICATIONS (Enhanced with SMS + Push)
    // ========================================================================

    // Job offered
    jobEventBus.on('JOB_OFFERED', async (event) => {
      try {
        // Send to all offered cleaners
        for (const cleanerId of event.cleanerIds) {
          const cleaner = await base44.entities.CleanerProfile.filter({ user_email: cleanerId })[0];
          if (!cleaner) continue;

          const job = await base44.entities.Booking.get(event.jobId);
          const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];

          const prefs = await this.getNotificationPreferences(cleanerId);

          const pay = (job.total_price * (cleaner.payout_percentage || 0.8)).toFixed(2);

          // SMS notification
          if (prefs.sms && cleaner.phone) {
            await smsService.sendSMS({
              to: cleaner.phone,
              message: CleanerSMSTemplates.jobOffer(
                client?.first_name || 'Client',
                job.date,
                job.start_time,
                pay
              ),
              priority: 'high'
            });
          }

          // Push notification
          if (prefs.push) {
            await pushNotificationService.showLocalNotification(
              CleanerPushTemplates.jobOffer(client?.first_name || 'Client', pay)
            );
          }
        }
      } catch (error) {
        console.error('[NotificationIntegration] Error in JOB_OFFERED:', error);
      }
    });

    // Extra time approved
    jobEventBus.on('EXTRA_TIME_APPROVED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: job.cleaner_id })[0];

        if (!cleaner) return;

        const prefs = await this.getNotificationPreferences(job.cleaner_id);

        // SMS notification
        if (prefs.sms && cleaner.phone) {
          await smsService.sendSMS({
            to: cleaner.phone,
            message: CleanerSMSTemplates.extraTimeApproved(event.minutesApproved),
            priority: 'high'
          });
        }

        // Push notification
        if (prefs.push) {
          await pushNotificationService.showLocalNotification(
            CleanerPushTemplates.extraTimeApproved(event.minutesApproved)
          );
        }
      } catch (error) {
        console.error('[NotificationIntegration] Error in EXTRA_TIME_APPROVED:', error);
      }
    });

    // Extra time denied
    jobEventBus.on('EXTRA_TIME_DENIED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: job.cleaner_id })[0];

        if (!cleaner) return;

        const prefs = await this.getNotificationPreferences(job.cleaner_id);

        // SMS notification
        if (prefs.sms && cleaner.phone) {
          await smsService.sendSMS({
            to: cleaner.phone,
            message: CleanerSMSTemplates.extraTimeDenied(),
            priority: 'high'
          });
        }
      } catch (error) {
        console.error('[NotificationIntegration] Error in EXTRA_TIME_DENIED:', error);
      }
    });
  }

  /**
   * Get user notification preferences
   * Returns default preferences if not set
   */
  private async getNotificationPreferences(userEmail: string): Promise<{
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  }> {
    try {
      const prefs = await base44.entities.NotificationPreferences?.filter({
        user_email: userEmail
      }).catch(() => null);

      if (prefs && prefs.length > 0) {
        return {
          inApp: prefs[0].in_app ?? true,
          email: prefs[0].email ?? true,
          sms: prefs[0].sms ?? true,
          push: prefs[0].push ?? true
        };
      }
    } catch (error) {
      console.error('[NotificationIntegration] Error fetching preferences:', error);
    }

    // Default: all enabled
    return {
      inApp: true,
      email: true,
      sms: true,
      push: true
    };
  }

  /**
   * Send notification via all enabled channels
   */
  async sendMultiChannelNotification(params: {
    userEmail: string;
    phone?: string;
    inAppTitle: string;
    inAppMessage: string;
    smsMessage?: string;
    pushTitle?: string;
    pushBody?: string;
    priority?: 'low' | 'normal' | 'high';
  }) {
    const prefs = await this.getNotificationPreferences(params.userEmail);

    // In-app notification
    if (prefs.inApp) {
      // Already handled by clientNotificationService
    }

    // SMS
    if (prefs.sms && params.phone && params.smsMessage) {
      await smsService.sendSMS({
        to: params.phone,
        message: params.smsMessage,
        priority: params.priority || 'normal'
      });
    }

    // Push
    if (prefs.push && params.pushTitle && params.pushBody) {
      await pushNotificationService.showLocalNotification({
        title: params.pushTitle,
        body: params.pushBody
      });
    }
  }

  /**
   * Initialize real-time notifications for a user
   */
  async initializeRealTime(userEmail: string) {
    console.log('[NotificationIntegration] Initializing real-time notifications for:', userEmail);

    // Connect to real-time service
    await realTimeNotificationService.connect(userEmail);

    // Subscribe to real-time notifications
    realTimeNotificationService.subscribe((notification) => {
      console.log('[NotificationIntegration] Real-time notification received:', notification);
      
      // Trigger UI updates, show toast, etc.
      // This will be handled by Layout.jsx
    });

    // Monitor connection status
    realTimeNotificationService.onStatusChange((status) => {
      console.log('[NotificationIntegration] Real-time status:', status);
    });
  }

  /**
   * Disconnect real-time notifications
   */
  disconnectRealTime() {
    realTimeNotificationService.disconnect();
  }
}

// Singleton instance
export const notificationIntegration = new NotificationIntegration();

// Export default
export default notificationIntegration;

