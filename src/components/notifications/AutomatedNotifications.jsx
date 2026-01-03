import { base44 } from '@/api/base44Client';
import EmailNotificationService from './EmailNotificationService';

/**
 * Automated notification triggers based on booking lifecycle events
 * Implements the PureTask messaging automation flows
 */

// Send booking confirmation after booking created
export async function triggerBookingConfirmation(bookingId) {
  try {
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (bookings.length === 0) return;
    
    const booking = bookings[0];
    
    // Get client and cleaner names
    const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
    
    const clientName = clientProfiles[0]?.user_email || booking.client_email;
    const cleanerName = cleanerProfiles[0]?.full_name || booking.cleaner_email;
    
    await EmailNotificationService.sendBookingConfirmation(booking, clientName, cleanerName);
    
    // Also notify cleaner
    await EmailNotificationService.sendJobInvite(booking, booking.cleaner_email, cleanerName);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error: error.message };
  }
}

// Send "cleaner on the way" notification when check-in starts
export async function triggerCleanerOnWay(bookingId) {
  try {
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (bookings.length === 0) return;
    
    const booking = bookings[0];
    const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
    
    const clientName = clientProfiles[0]?.user_email || booking.client_email;
    const cleanerName = cleanerProfiles[0]?.full_name || booking.cleaner_email;
    
    await EmailNotificationService.sendCleanerOnWay(booking, clientName, cleanerName);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending on-the-way notification:', error);
    return { success: false, error: error.message };
  }
}

// Send completion notification - review requests handled by cron
export async function triggerCleaningCompleted(bookingId) {
  try {
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (bookings.length === 0) return;
    
    const booking = bookings[0];
    const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
    
    const clientName = clientProfiles[0]?.user_email || booking.client_email;
    const cleanerName = cleanerProfiles[0]?.full_name || booking.cleaner_email;
    
    // Send completion notification
    await EmailNotificationService.sendCleaningCompleted(booking, clientName);
    
    // Send payment receipt
    await EmailNotificationService.sendPaymentReceipt(booking, booking.client_email, clientName, cleanerName);
    
    // Review requests are now handled by sendReviewReminders cron job
    
    return { success: true };
  } catch (error) {
    console.error('Error sending completion notification:', error);
    return { success: false, error: error.message };
  }
}

// Send review reminders at multiple intervals (2h, 24h, 48h) - run by cron
export async function sendReviewReminders() {
  try {
    // Get config for review reminder intervals
    const globalSettings = await base44.entities.GlobalSetting.filter({ environment: 'production' });
    const reviewIntervals = globalSettings[0]?.settings_data?.['notifications.review_request_hours_after'] || [2, 24, 48];
    
    const now = new Date();
    let totalSent = 0;
    
    // Check each interval
    for (const hoursAfter of reviewIntervals) {
      const targetTime = new Date(now.getTime() - hoursAfter * 60 * 60 * 1000);
      const targetTimeMin = new Date(targetTime.getTime() - 30 * 60 * 1000); // 30 min window
      const targetTimeMax = new Date(targetTime.getTime() + 30 * 60 * 1000);
      
      // Find completed bookings in this time window
      const completedBookings = await base44.entities.Booking.filter({
        status: 'completed',
        check_out_time: { $gte: targetTimeMin.toISOString(), $lte: targetTimeMax.toISOString() }
      });
      
      for (const booking of completedBookings) {
        // Check if review already submitted
        const reviews = await base44.entities.Review.filter({
          booking_id: booking.id,
          client_email: booking.client_email
        });
        
        if (reviews.length > 0) {
          continue; // Review already submitted, skip
        }
        
        // Check if we already sent this specific reminder
        const notifications = await base44.entities.Notification.filter({
          recipient_email: booking.client_email,
          metadata: { booking_id: booking.id, reminder_hours: hoursAfter }
        });
        
        if (notifications.length > 0) {
          continue; // Already sent this reminder
        }
        
        // Get profiles
        const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
        
        const clientName = clientProfiles[0]?.user_email || booking.client_email;
        const cleanerName = cleanerProfiles[0]?.full_name || booking.cleaner_email;
        
        // Send review request
        await EmailNotificationService.sendReviewRequest(booking, booking.client_email, clientName);
        
        // Create notification record to track we sent this
        await base44.entities.Notification.create({
          recipient_email: booking.client_email,
          type: 'review_request',
          title: 'How was your cleaning?',
          message: `Please review your cleaning with ${cleanerName}`,
          metadata: { 
            booking_id: booking.id, 
            reminder_hours: hoursAfter,
            cleaner_name: cleanerName
          },
          is_read: false
        });
        
        totalSent++;
      }
    }
    
    return { success: true, sent: totalSent };
  } catch (error) {
    console.error('Error sending review reminders:', error);
    return { success: false, error: error.message };
  }
}

// Send 24-hour reminder (should be run by cron job)
export async function send24HourReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const allBookings = await base44.entities.Booking.list('-date', 100);
    const upcomingBookings = allBookings.filter(b => 
      b.date === tomorrowStr && 
      (b.status === 'scheduled' || b.status === 'payment_hold')
    );
    
    for (const booking of upcomingBookings) {
      const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
      
      const clientName = clientProfiles[0]?.user_email || booking.client_email;
      const cleanerName = cleanerProfiles[0]?.full_name || booking.cleaner_email;
      
      // Send reminder to client
      await EmailNotificationService.sendNotification(
        'email.client.booking_confirmation',
        booking.client_email,
        {
          first_name: clientName.split(' ')[0],
          cleaner_name: cleanerName,
          date: 'Tomorrow',
          time: booking.start_time,
          address: booking.address,
          price: `$${booking.total_price}`,
          booking_id: booking.id
        },
        { sendSMS: true, phone: booking.client_phone }
      );
    }
    
    return { success: true, sent: upcomingBookings.length };
  } catch (error) {
    console.error('Error sending 24h reminders:', error);
    return { success: false, error: error.message };
  }
}

// Send welcome email after signup
export async function triggerWelcomeEmail(userEmail, userName, userType) {
  try {
    await EmailNotificationService.sendWelcomeEmail(userEmail, userName, userType);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

// Send reliability score update
export async function triggerReliabilityScoreUpdate(cleanerEmail, cleanerName, newScore, oldScore) {
  try {
    await EmailNotificationService.sendReliabilityScoreUpdate(cleanerEmail, cleanerName, newScore, oldScore);
    return { success: true };
  } catch (error) {
    console.error('Error sending score update:', error);
    return { success: false, error: error.message };
  }
}

export default {
  triggerBookingConfirmation,
  triggerCleanerOnWay,
  triggerCleaningCompleted,
  send24HourReminders,
  sendReviewReminders,
  triggerWelcomeEmail,
  triggerReliabilityScoreUpdate
};