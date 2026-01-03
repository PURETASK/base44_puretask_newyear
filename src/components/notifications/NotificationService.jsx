import { base44 } from '@/api/base44Client';

/**
 * NotificationService - Helper functions for creating notifications
 */

export const NotificationService = {
  /**
   * Create a new notification for a user
   */
  async create({ recipientEmail, type, title, message, payload = {}, link = null, priority = 'medium' }) {
    try {
      const notification = await base44.asServiceRole.entities.Notification.create({
        recipient_email: recipientEmail,
        type,
        title,
        message,
        payload,
        link,
        priority,
        is_read: false
      });
      return { success: true, notification };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create booking-related notifications
   */
  async notifyNewBooking({ cleanerEmail, bookingId, clientName, date, time }) {
    return this.create({
      recipientEmail: cleanerEmail,
      type: 'new_booking',
      title: 'New Booking Request',
      message: `${clientName} has requested a cleaning on ${date} at ${time}`,
      payload: { booking_id: bookingId },
      link: `CleanerDashboard?booking=${bookingId}`,
      priority: 'high'
    });
  },

  async notifyBookingAccepted({ clientEmail, bookingId, cleanerName, date, time }) {
    return this.create({
      recipientEmail: clientEmail,
      type: 'booking_accepted',
      title: 'Booking Confirmed!',
      message: `${cleanerName} accepted your booking for ${date} at ${time}`,
      payload: { booking_id: bookingId },
      link: `ClientBookings?booking=${bookingId}`,
      priority: 'high'
    });
  },

  async notifyBookingDeclined({ clientEmail, bookingId, cleanerName }) {
    return this.create({
      recipientEmail: clientEmail,
      type: 'booking_declined',
      title: 'Booking Declined',
      message: `${cleanerName} declined your booking request. Finding alternatives...`,
      payload: { booking_id: bookingId },
      link: `ClientBookings?booking=${bookingId}`,
      priority: 'high'
    });
  },

  async notifyBookingCancelled({ recipientEmail, bookingId, cancelledBy, reason }) {
    return this.create({
      recipientEmail,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking was cancelled by ${cancelledBy}. ${reason || ''}`,
      payload: { booking_id: bookingId },
      link: `ClientBookings?booking=${bookingId}`,
      priority: 'high'
    });
  },

  async notifyBookingCompleted({ clientEmail, bookingId, cleanerName }) {
    return this.create({
      recipientEmail: clientEmail,
      type: 'booking_completed',
      title: 'Cleaning Complete!',
      message: `${cleanerName} has completed your cleaning. Please review and approve.`,
      payload: { booking_id: bookingId },
      link: `ClientBookings?booking=${bookingId}`,
      priority: 'high'
    });
  },

  /**
   * Create message-related notifications
   */
  async notifyNewMessage({ recipientEmail, senderName, threadId, preview }) {
    return this.create({
      recipientEmail,
      type: 'message_received',
      title: `New message from ${senderName}`,
      message: preview || 'You have a new message',
      payload: { thread_id: threadId },
      link: `Inbox?thread=${threadId}`,
      priority: 'medium'
    });
  },

  /**
   * Create dispute-related notifications
   */
  async notifyDisputeFiled({ recipientEmail, bookingId, filedBy }) {
    return this.create({
      recipientEmail,
      type: 'dispute_filed',
      title: 'Dispute Filed',
      message: `A dispute has been filed for your booking by ${filedBy}`,
      payload: { booking_id: bookingId },
      link: `ClientBookings?booking=${bookingId}`,
      priority: 'urgent'
    });
  },

  async notifyDisputeResolved({ recipientEmail, bookingId, resolution }) {
    return this.create({
      recipientEmail,
      type: 'dispute_resolved',
      title: 'Dispute Resolved',
      message: `Your dispute has been resolved: ${resolution}`,
      payload: { booking_id: bookingId },
      link: `ClientBookings?booking=${bookingId}`,
      priority: 'high'
    });
  },

  /**
   * Create payment/credit notifications
   */
  async notifyCreditAdded({ recipientEmail, amount, reason }) {
    return this.create({
      recipientEmail,
      type: 'credit_added',
      title: 'Credits Added',
      message: `${amount} credits added to your account. ${reason || ''}`,
      payload: { amount },
      link: 'BuyCredits',
      priority: 'medium'
    });
  },

  async notifyPayoutProcessed({ recipientEmail, amount, payoutId }) {
    return this.create({
      recipientEmail,
      type: 'payout_processed',
      title: 'Payout Processed',
      message: `Your payout of $${amount} has been processed`,
      payload: { payout_id: payoutId },
      link: 'CleanerPayouts',
      priority: 'medium'
    });
  },

  /**
   * Create review-related notifications
   */
  async notifyReviewReceived({ recipientEmail, rating, reviewerName, bookingId }) {
    return this.create({
      recipientEmail,
      type: 'review_received',
      title: 'New Review',
      message: `${reviewerName} left you a ${rating}-star review`,
      payload: { booking_id: bookingId, rating },
      link: 'Profile',
      priority: 'low'
    });
  }
};

export default NotificationService;