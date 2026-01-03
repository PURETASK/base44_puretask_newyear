// Module 8 - Booking Reminder Cron
// Sends reminders 24h and 2h before scheduled bookings

import { sendNotification } from './NotificationEngineService.js';

/**
 * Check for bookings needing reminders
 * Run this hourly via cron
 */
export async function sendBookingReminders(base44) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  try {
    // Get scheduled bookings
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      status: 'scheduled'
    });

    for (const booking of bookings) {
      const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
      const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60);

      // Check if we should send 24h reminder
      if (hoursUntil <= 24 && hoursUntil > 23) {
        await send24HourReminder(base44, booking);
      }

      // Check if we should send 2h reminder
      if (hoursUntil <= 2 && hoursUntil > 1.5) {
        await send2HourReminder(base44, booking);
      }
    }

    console.log(`[BookingReminderCron] Checked ${bookings.length} bookings`);
  } catch (error) {
    console.error('[BookingReminderCron] Error:', error);
  }
}

async function send24HourReminder(base44, booking) {
  const cleanerName = await getUserName(base44, booking.cleaner_email);
  const clientName = await getUserName(base44, booking.client_email);

  await sendNotification(base44, 'booking_reminder_client', booking.client_email, {
    client_name: clientName,
    cleaner_name: cleanerName,
    booking_date: booking.date,
    booking_time: booking.start_time,
    address: booking.address,
    booking_id: booking.id
  }, { bookingId: booking.id });

  await sendNotification(base44, 'booking_reminder_cleaner', booking.cleaner_email, {
    cleaner_name: cleanerName,
    booking_date: booking.date,
    booking_time: booking.start_time,
    address: booking.address,
    hours: booking.hours,
    booking_id: booking.id
  }, { bookingId: booking.id });
}

async function send2HourReminder(base44, booking) {
  const cleanerName = await getUserName(base44, booking.cleaner_email);

  await sendNotification(base44, 'booking_reminder_cleaner', booking.cleaner_email, {
    cleaner_name: cleanerName,
    booking_date: booking.date,
    booking_time: booking.start_time,
    address: booking.address,
    hours: booking.hours,
    booking_id: booking.id
  }, { bookingId: booking.id });
}

async function getUserName(base44, email) {
  try {
    const users = await base44.asServiceRole.entities.User.filter({ email });
    return users[0]?.full_name || 'User';
  } catch {
    return 'User';
  }
}