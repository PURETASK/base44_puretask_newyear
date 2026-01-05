// Client Notification Service
// Real-time notifications for clients about their jobs

import { base44 } from '@/api/base44Client';
import { NotificationService } from '@/components/notifications/NotificationService';
import EmailService from '@/components/notifications/EmailNotificationService';
import type { JobRecord } from '@/types/cleanerJobTypes';
import { jobEventBus, type JobEvent } from './jobEvents';

export interface ClientNotificationContext {
  job: JobRecord;
  client: any;
  cleaner: any;
}

/**
 * Client Notification Service
 * Sends real-time notifications to clients about job status changes
 * 
 * Coverage:
 * - Cleaner en route (GPS-based)
 * - Cleaner arrived (GPS check-in)
 * - Job started (with timestamp)
 * - Photos uploaded (before/after)
 * - Extra time requested (URGENT - requires approval)
 * - Job completed (with summary)
 * - Payment processed
 */
export class ClientNotificationService {
  private listeners: Array<(notification: any) => void> = [];

  constructor() {
    this.setupEventListeners();
  }

  // Subscribe to client notifications (for real-time UI updates)
  subscribe(callback: (notification: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Emit notification to all listeners (for real-time updates)
  private emit(notification: any) {
    this.listeners.forEach(callback => callback(notification));
  }

  // Setup job event listeners
  private setupEventListeners() {
    // Cleaner accepted job
    jobEventBus.on('JOB_ASSIGNED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyJobAccepted({ job, client, cleaner });
      } catch (error) {
        console.error('[ClientNotificationService] Error in JOB_ASSIGNED:', error);
      }
    });

    // Cleaner en route (GPS check-in)
    jobEventBus.on('CLEANER_EN_ROUTE', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyCleanerEnRoute({ job, client, cleaner, location: event.location });
      } catch (error) {
        console.error('[ClientNotificationService] Error in CLEANER_EN_ROUTE:', error);
      }
    });

    // Cleaner arrived
    jobEventBus.on('CLEANER_ARRIVED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyCleanerArrived({ job, client, cleaner });
      } catch (error) {
        console.error('[ClientNotificationService] Error in CLEANER_ARRIVED:', error);
      }
    });

    // Job started
    jobEventBus.on('JOB_STARTED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyJobStarted({ job, client, cleaner });
      } catch (error) {
        console.error('[ClientNotificationService] Error in JOB_STARTED:', error);
      }
    });

    // Before photos uploaded
    jobEventBus.on('BEFORE_PHOTO_UPLOADED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyPhotosUploaded({ job, client, cleaner, photoType: 'before' });
      } catch (error) {
        console.error('[ClientNotificationService] Error in BEFORE_PHOTO_UPLOADED:', error);
      }
    });

    // After photos uploaded
    jobEventBus.on('AFTER_PHOTO_UPLOADED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyPhotosUploaded({ job, client, cleaner, photoType: 'after' });
      } catch (error) {
        console.error('[ClientNotificationService] Error in AFTER_PHOTO_UPLOADED:', error);
      }
    });

    // Extra time requested (CRITICAL - requires client approval)
    jobEventBus.on('EXTRA_TIME_REQUESTED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyExtraTimeRequested({
          job,
          client,
          cleaner,
          minutesRequested: event.minutesRequested,
          reason: event.reason
        });
      } catch (error) {
        console.error('[ClientNotificationService] Error in EXTRA_TIME_REQUESTED:', error);
      }
    });

    // Job completed
    jobEventBus.on('JOB_COMPLETED', async (event) => {
      try {
        const job = await base44.entities.Booking.get(event.jobId);
        const cleaner = await base44.entities.CleanerProfile.filter({ user_email: event.cleanerId })[0];
        const client = await base44.entities.ClientProfile.filter({ user_email: job.client_id })[0];
        
        await this.notifyJobCompleted({ job, client, cleaner, minutesWorked: event.minutesWorked });
      } catch (error) {
        console.error('[ClientNotificationService] Error in JOB_COMPLETED:', error);
      }
    });
  }

  // ============================================================================
  // NOTIFICATION METHODS
  // ============================================================================

  /**
   * Notify client that cleaner accepted their job
   */
  async notifyJobAccepted(context: ClientNotificationContext) {
    const { job, client, cleaner } = context;

    console.log(`[ClientNotificationService] Notifying client: Job accepted by ${cleaner?.name}`);

    // In-app notification
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_accepted',
      title: '✅ Booking Confirmed!',
      message: `${cleaner?.name || 'Your cleaner'} accepted your booking for ${job.date} at ${job.time}`,
      payload: { booking_id: job.id },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'high'
    });

    // Email notification
    await EmailService.sendNotification('email.client.booking_confirmation', {
      recipient_email: job.client_id,
      first_name: client?.first_name || 'there',
      cleaner_name: cleaner?.name || 'Your cleaner',
      date: job.date,
      time: job.time,
      address: job.address,
      price: job.pricing_snapshot?.total_price ? `$${job.pricing_snapshot.total_price}` : 'TBD',
      manage_booking_link: `https://puretask.com/ClientBookings?booking=${job.id}`
    });

    // Emit for real-time UI updates
    this.emit({
      type: 'job_accepted',
      jobId: job.id,
      message: `${cleaner?.name || 'Your cleaner'} accepted your booking!`
    });

    // SMS will be sent by smsService (once implemented)
  }

  /**
   * Notify client that cleaner is on the way
   * CRITICAL: This is when anxiety is highest - immediate notification needed
   */
  async notifyCleanerEnRoute(context: ClientNotificationContext & { location: { lat: number; lng: number } }) {
    const { job, client, cleaner, location } = context;

    console.log(`[ClientNotificationService] Notifying client: Cleaner en route (GPS: ${location.lat}, ${location.lng})`);

    // Calculate ETA (simple estimate: 15 minutes)
    const eta = '15 minutes';

    // In-app notification (HIGH PRIORITY)
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_update',
      title: '🚗 Your cleaner is on the way!',
      message: `${cleaner?.name || 'Your cleaner'} is heading to your location. ETA: ${eta}`,
      payload: {
        booking_id: job.id,
        location: location,
        eta: eta
      },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'high'
    });

    // Email notification
    await EmailService.sendNotification('email.client.cleaner_on_way', {
      recipient_email: job.client_id,
      first_name: client?.first_name || 'there',
      cleaner_name: cleaner?.name || 'Your cleaner'
    });

    // Emit for real-time UI updates (live tracking)
    this.emit({
      type: 'cleaner_en_route',
      jobId: job.id,
      location: location,
      eta: eta,
      message: `${cleaner?.name || 'Your cleaner'} is on the way!`
    });

    // SMS will be HIGH PRIORITY once implemented
  }

  /**
   * Notify client that cleaner has arrived
   * CRITICAL: Reduces client anxiety significantly
   */
  async notifyCleanerArrived(context: ClientNotificationContext) {
    const { job, client, cleaner } = context;

    console.log(`[ClientNotificationService] Notifying client: Cleaner arrived`);

    // In-app notification
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_update',
      title: '📍 Your cleaner has arrived!',
      message: `${cleaner?.name || 'Your cleaner'} checked in at your location and will start shortly.`,
      payload: { booking_id: job.id },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'high'
    });

    // Emit for real-time UI updates
    this.emit({
      type: 'cleaner_arrived',
      jobId: job.id,
      message: `${cleaner?.name || 'Your cleaner'} has arrived!`
    });

    // SMS notification (HIGH PRIORITY once implemented)
  }

  /**
   * Notify client that cleaning has started
   */
  async notifyJobStarted(context: ClientNotificationContext) {
    const { job, client, cleaner } = context;

    console.log(`[ClientNotificationService] Notifying client: Job started`);

    const startTime = job.start_at 
      ? new Date(job.start_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      : 'recently';

    // In-app notification
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_update',
      title: '🧹 Cleaning in progress!',
      message: `${cleaner?.name || 'Your cleaner'} started at ${startTime}. You can track progress in real-time.`,
      payload: {
        booking_id: job.id,
        start_time: job.start_at
      },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'medium'
    });

    // Emit for real-time UI updates
    this.emit({
      type: 'job_started',
      jobId: job.id,
      startTime: job.start_at,
      message: 'Cleaning started!'
    });
  }

  /**
   * Notify client that photos have been uploaded
   */
  async notifyPhotosUploaded(context: ClientNotificationContext & { photoType: 'before' | 'after' }) {
    const { job, client, cleaner, photoType } = context;

    console.log(`[ClientNotificationService] Notifying client: ${photoType} photos uploaded`);

    // In-app notification
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_update',
      title: `📸 ${photoType === 'before' ? 'Before' : 'After'} photos uploaded`,
      message: `${cleaner?.name || 'Your cleaner'} uploaded ${photoType} photos. View them in your booking details.`,
      payload: {
        booking_id: job.id,
        photo_type: photoType
      },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'medium'
    });

    // Emit for real-time UI updates (show photos immediately)
    this.emit({
      type: 'photos_uploaded',
      jobId: job.id,
      photoType: photoType,
      message: `${photoType === 'before' ? 'Before' : 'After'} photos uploaded`
    });
  }

  /**
   * Notify client that cleaner is requesting extra time
   * CRITICAL: Requires immediate client approval/denial
   */
  async notifyExtraTimeRequested(
    context: ClientNotificationContext & {
      minutesRequested: number;
      reason: string;
    }
  ) {
    const { job, client, cleaner, minutesRequested, reason } = context;

    console.log(`[ClientNotificationService] URGENT: Extra time requested - ${minutesRequested} minutes`);

    const hourlyRate = job.pricing_snapshot?.hourly_rate || 0;
    const additionalCost = ((hourlyRate / 60) * minutesRequested).toFixed(2);

    // In-app notification (URGENT PRIORITY)
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_update',
      title: '⏰ Extra time requested - Approval needed',
      message: `${cleaner?.name || 'Your cleaner'} requests ${minutesRequested} extra minutes. Additional cost: $${additionalCost}. Reason: ${reason}`,
      payload: {
        booking_id: job.id,
        minutes_requested: minutesRequested,
        reason: reason,
        additional_cost: additionalCost
      },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'urgent' // HIGHEST PRIORITY
    });

    // Email notification (URGENT)
    await EmailService.sendNotification('email.client.extra_time_requested', {
      recipient_email: job.client_id,
      first_name: client?.first_name || 'there',
      cleaner_name: cleaner?.name || 'Your cleaner',
      minutes_requested: minutesRequested.toString(),
      reason: reason,
      additional_cost: additionalCost,
      approve_link: `https://puretask.com/ClientBookings?booking=${job.id}&action=approve_time`,
      deny_link: `https://puretask.com/ClientBookings?booking=${job.id}&action=deny_time`
    });

    // Emit for real-time UI updates (show approval modal immediately)
    this.emit({
      type: 'extra_time_requested',
      jobId: job.id,
      minutesRequested: minutesRequested,
      reason: reason,
      additionalCost: additionalCost,
      message: `Extra time approval needed: ${minutesRequested} minutes`,
      urgent: true
    });

    // SMS notification (URGENT - once implemented, this should be IMMEDIATE)
    // This is the MOST critical notification for client experience
  }

  /**
   * Notify client that cleaning is complete
   */
  async notifyJobCompleted(context: ClientNotificationContext & { minutesWorked: number }) {
    const { job, client, cleaner, minutesWorked } = context;

    console.log(`[ClientNotificationService] Notifying client: Job completed (${minutesWorked} minutes)`);

    const hours = Math.floor(minutesWorked / 60);
    const minutes = minutesWorked % 60;
    const durationText = `${hours}h ${minutes}m`;

    // In-app notification
    await NotificationService.create({
      recipientEmail: job.client_id,
      type: 'booking_completed',
      title: '✅ Cleaning complete!',
      message: `${cleaner?.name || 'Your cleaner'} completed the job in ${durationText}. Please review and approve.`,
      payload: {
        booking_id: job.id,
        minutes_worked: minutesWorked
      },
      link: `ClientBookings?booking=${job.id}`,
      priority: 'high'
    });

    // Email notification
    await EmailService.sendNotification('email.client.cleaning_completed', {
      recipient_email: job.client_id,
      first_name: client?.first_name || 'there',
      cleaner_name: cleaner?.name || 'Your cleaner',
      rate_cleaner_link: `https://puretask.com/ClientReview?booking=${job.id}`
    });

    // Emit for real-time UI updates
    this.emit({
      type: 'job_completed',
      jobId: job.id,
      minutesWorked: minutesWorked,
      message: 'Cleaning complete! Please review.'
    });
  }

  /**
   * Notify client about payment processing
   */
  async notifyPaymentProcessed(jobId: string, amount: number, clientEmail: string) {
    console.log(`[ClientNotificationService] Notifying client: Payment processed - $${amount}`);

    // In-app notification
    await NotificationService.create({
      recipientEmail: clientEmail,
      type: 'payment_received',
      title: '💳 Payment processed',
      message: `Your payment of $${amount.toFixed(2)} has been processed successfully.`,
      payload: { booking_id: jobId, amount: amount },
      link: `ClientBookings?booking=${jobId}`,
      priority: 'medium'
    });

    // Emit for real-time UI updates
    this.emit({
      type: 'payment_processed',
      jobId: jobId,
      amount: amount,
      message: 'Payment processed successfully'
    });
  }
}

// Singleton instance
export const clientNotificationService = new ClientNotificationService();

// Export for testing
export default clientNotificationService;

