import { base44 } from '@/api/base44Client';
import { differenceInMinutes, parseISO } from 'date-fns';

/**
 * Job Start Notification Service
 * Sends reminders to cleaners about upcoming jobs and check-in requirements
 */

export async function sendJobStartReminders() {
  try {
    const now = new Date();
    
    // Get all scheduled jobs for today and tomorrow
    const allBookings = await base44.entities.Booking.filter({
      status: { $in: ['scheduled', 'awaiting_cleaner'] }
    });

    const notifications = {
      thirtyMinBefore: [],
      atStartTime: [],
      fifteenMinAfter: []
    };

    for (const booking of allBookings) {
      // Skip if already checked in
      if (booking.check_in_time) continue;

      const jobDateTime = parseISO(`${booking.date}T${booking.start_time}`);
      const minutesUntil = differenceInMinutes(jobDateTime, now);

      // 30 minutes before (window: 28-32 minutes)
      if (minutesUntil >= 28 && minutesUntil <= 32) {
        notifications.thirtyMinBefore.push(booking);
      }
      // At start time (window: -2 to +2 minutes)
      else if (minutesUntil >= -2 && minutesUntil <= 2) {
        notifications.atStartTime.push(booking);
      }
      // 15 minutes after (window: 13-17 minutes after)
      else if (minutesUntil >= -17 && minutesUntil <= -13) {
        notifications.fifteenMinAfter.push(booking);
      }
    }

    // Send 30-minute warnings
    for (const booking of notifications.thirtyMinBefore) {
      const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });
      if (cleanerUsers.length > 0 && cleanerUsers[0].sms_consent) {
        await base44.integrations.Core.SendEmail({
          to: booking.cleaner_email,
          subject: '⏰ Job Starting in 30 Minutes',
          body: `Hi! Your cleaning job starts in 30 minutes.

📍 Address: ${booking.address}
⏰ Time: ${booking.start_time}
⏱️ Duration: ${booking.hours} hours

Please check in via GPS when you arrive at the location.

Good luck!`
        });
      }
    }

    // Send start-time reminders
    for (const booking of notifications.atStartTime) {
      const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });
      if (cleanerUsers.length > 0 && cleanerUsers[0].sms_consent) {
        await base44.integrations.Core.SendEmail({
          to: booking.cleaner_email,
          subject: '🔔 Your Job Has Started - Check In Required',
          body: `Your cleaning job has started!

📍 Address: ${booking.address}
⏰ Started: ${booking.start_time}

Please check in via GPS now to confirm your arrival.`
        });
      }
    }

    // Send urgent late reminders
    for (const booking of notifications.fifteenMinAfter) {
      const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });
      if (cleanerUsers.length > 0 && cleanerUsers[0].sms_consent) {
        await base44.integrations.Core.SendEmail({
          to: booking.cleaner_email,
          subject: '🚨 URGENT: GPS Check-In Required',
          body: `⚠️ URGENT: Your job started 15 minutes ago and you haven't checked in yet.

📍 Address: ${booking.address}
⏰ Started: ${booking.start_time}

Please check in immediately or contact the client if there's an issue.
Failure to check in may affect your reliability score.`
        });
      }
    }

    return {
      success: true,
      sent: {
        thirtyMin: notifications.thirtyMinBefore.length,
        startTime: notifications.atStartTime.length,
        fifteenAfter: notifications.fifteenMinAfter.length
      }
    };
  } catch (error) {
    console.error('Error sending job start reminders:', error);
    return {
      success: false,
      error: error.message
    };
  }
}