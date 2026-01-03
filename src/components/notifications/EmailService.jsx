/**
 * Email Notification Service
 * Handles transactional email notifications
 */

import { base44 } from '@/api/base44Client';

/**
 * Send booking confirmation email
 * @param {Object} booking - Booking details
 * @param {Object} client - Client user
 * @param {Object} cleaner - Cleaner profile
 */
export async function sendBookingConfirmation(booking, client, cleaner) {
  try {
    const subject = `Booking Confirmed - ${new Date(booking.date).toLocaleDateString()}`;
    
    const body = `
      <h2>Your Cleaning is Confirmed!</h2>
      <p>Hi ${client.full_name},</p>
      <p>Your cleaning has been successfully booked with ${cleaner.full_name}.</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${booking.start_time}</li>
        <li><strong>Duration:</strong> ${booking.hours} hours</li>
        <li><strong>Address:</strong> ${booking.address}</li>
        <li><strong>Total:</strong> $${booking.total_price.toFixed(2)}</li>
      </ul>
      
      <p>Your cleaner will check in via GPS when they arrive. You'll receive photo proof of work completion.</p>
      
      <p>Need to make changes? <a href="${window.location.origin}">Visit your dashboard</a></p>
      
      <p>Thanks,<br>The PureTask Team</p>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: client.email,
      subject,
      body
    });

    // Log delivery
    await logEmailDelivery('booking_confirmation', client.email, booking.id);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking reminder (24h before)
 * @param {Object} booking - Booking details
 * @param {Object} user - User to notify
 * @param {string} userType - 'client' or 'cleaner'
 */
export async function sendBookingReminder(booking, user, userType) {
  try {
    const subject = `Reminder: Cleaning ${userType === 'client' ? 'Tomorrow' : 'Job Tomorrow'}`;
    
    const body = userType === 'client' 
      ? `
        <h2>Cleaning Reminder</h2>
        <p>Hi ${user.full_name},</p>
        <p>This is a friendly reminder that your cleaning is scheduled for tomorrow.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.start_time}</li>
          <li><strong>Address:</strong> ${booking.address}</li>
        </ul>
        
        <p>Please ensure someone is available to provide access.</p>
        
        <p>Need to cancel or reschedule? Do it now to avoid fees.</p>
      `
      : `
        <h2>Job Reminder</h2>
        <p>Hi ${user.full_name},</p>
        <p>Reminder: You have a cleaning job scheduled for tomorrow.</p>
        
        <h3>Job Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.start_time}</li>
          <li><strong>Address:</strong> ${booking.address}</li>
          <li><strong>Duration:</strong> ${booking.hours} hours</li>
        </ul>
        
        <p>Remember to:</p>
        <ul>
          <li>Check in via GPS when you arrive (within 250m)</li>
          <li>Upload at least 3 photos during/after cleaning</li>
          <li>Check out when finished</li>
        </ul>
      `;

    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: user.email,
      subject,
      body
    });

    await logEmailDelivery('booking_reminder', user.email, booking.id);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending booking reminder:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send cancellation notification
 * @param {Object} booking - Booking details
 * @param {Object} user - User to notify
 * @param {string} cancelledBy - Who cancelled ('client' or 'cleaner')
 * @param {number} fee - Cancellation fee amount
 */
export async function sendCancellationNotification(booking, user, cancelledBy, fee = 0) {
  try {
    const subject = `Booking Cancelled - ${new Date(booking.date).toLocaleDateString()}`;
    
    const body = `
      <h2>Booking Cancellation</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your booking scheduled for ${new Date(booking.date).toLocaleDateString()} at ${booking.start_time} has been cancelled.</p>
      
      ${fee > 0 ? `
        <p><strong>Cancellation Fee:</strong> $${fee.toFixed(2)}</p>
        <p>This fee has been deducted from your credit balance.</p>
      ` : `
        <p>No cancellation fee was charged.</p>
      `}
      
      <p>We hope to serve you again soon!</p>
      
      <p>Thanks,<br>The PureTask Team</p>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: user.email,
      subject,
      body
    });

    await logEmailDelivery('cancellation', user.email, booking.id);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send job completion notification
 * @param {Object} booking - Booking details
 * @param {Object} client - Client user
 */
export async function sendJobCompletionNotification(booking, client) {
  try {
    const subject = `Cleaning Completed - ${new Date(booking.date).toLocaleDateString()}`;
    
    const body = `
      <h2>Cleaning Completed!</h2>
      <p>Hi ${client.full_name},</p>
      <p>Great news! Your cleaning has been marked as complete.</p>
      
      <h3>Job Summary:</h3>
      <ul>
        <li><strong>Duration:</strong> ${booking.actual_hours} hours</li>
        <li><strong>Check-in:</strong> ${new Date(booking.check_in_time).toLocaleTimeString()}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.check_out_time).toLocaleTimeString()}</li>
        <li><strong>Photos uploaded:</strong> ${booking.photo_count || 0}</li>
      </ul>
      
      <p>Please review the work and leave feedback for your cleaner!</p>
      
      <p><a href="${window.location.origin}">View Photos & Leave Review</a></p>
      
      <p>Thanks,<br>The PureTask Team</p>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: client.email,
      subject,
      body
    });

    await logEmailDelivery('job_completion', client.email, booking.id);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending job completion notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send review request email
 * @param {Object} booking - Booking details
 * @param {Object} client - Client user
 * @param {Object} cleaner - Cleaner profile
 */
export async function sendReviewRequest(booking, client, cleaner) {
  try {
    const subject = `How was your cleaning with ${cleaner.full_name}?`;
    
    const body = `
      <h2>Share Your Experience</h2>
      <p>Hi ${client.full_name},</p>
      <p>We hope you loved your cleaning with ${cleaner.full_name}!</p>
      
      <p>Your feedback helps maintain quality and helps other clients make informed decisions.</p>
      
      <p><a href="${window.location.origin}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">Leave a Review</a></p>
      
      <p>It only takes a minute and makes a big difference.</p>
      
      <p>Thanks,<br>The PureTask Team</p>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: client.email,
      subject,
      body
    });

    await logEmailDelivery('review_request', client.email, booking.id);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending review request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send payment receipt
 * @param {Object} transaction - Transaction details
 * @param {Object} user - User who made payment
 */
export async function sendPaymentReceipt(transaction, user) {
  try {
    const subject = `Payment Receipt - ${transaction.amount_credits} Credits`;
    
    const body = `
      <h2>Payment Receipt</h2>
      <p>Hi ${user.full_name},</p>
      <p>Thank you for your purchase!</p>
      
      <h3>Transaction Details:</h3>
      <ul>
        <li><strong>Credits Purchased:</strong> ${transaction.amount_credits}</li>
        <li><strong>Amount:</strong> $${(transaction.amount_credits / 10).toFixed(2)}</li>
        <li><strong>New Balance:</strong> ${transaction.balance_after} credits</li>
        <li><strong>Date:</strong> ${new Date(transaction.created_date).toLocaleString()}</li>
      </ul>
      
      <p>Credits have been added to your account and are ready to use!</p>
      
      <p>Thanks,<br>The PureTask Team</p>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: user.email,
      subject,
      body
    });

    await logEmailDelivery('payment_receipt', user.email, null);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log email delivery for tracking
 * @param {string} eventName - Type of email
 * @param {string} recipientEmail - Who received it
 * @param {string} bookingId - Related booking (if any)
 */
async function logEmailDelivery(eventName, recipientEmail, bookingId) {
  try {
    await base44.entities.MessageDeliveryLog.create({
      delivery_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_name: eventName,
      channel: 'email',
      status: 'sent',
      recipient_email: recipientEmail,
      sent_at: new Date().toISOString(),
      metadata: bookingId ? { booking_id: bookingId } : {}
    });
  } catch (error) {
    console.error('Error logging email delivery:', error);
  }
}

export default {
  sendBookingConfirmation,
  sendBookingReminder,
  sendCancellationNotification,
  sendJobCompletionNotification,
  sendReviewRequest,
  sendPaymentReceipt
};