import { Credit } from '@/api/entities';
import { Booking } from '@/api/entities';
import { ClientProfile } from '@/api/entities';

/**
 * Automatic Make-it-Right Credits System
 * 
 * Rule:
 * - No-show: 100% refund + $10 inconvenience credit
 */

export async function issueNoShowCredit(bookingId, booking) {
  try {
    // Issue 100% refund
    await Credit.create({
      client_email: booking.client_email,
      amount: booking.total_price,
      reason: 'no_show',
      booking_id: bookingId,
      used: false
    });

    // Issue $10 inconvenience credit
    await Credit.create({
      client_email: booking.client_email,
      amount: 10,
      reason: 'no_show',
      booking_id: bookingId,
      used: false
    });

    // Update client's credit balance
    const clientProfiles = await ClientProfile.filter({ user_email: booking.client_email });
    if (clientProfiles.length > 0) {
      const profile = clientProfiles[0];
      await ClientProfile.update(profile.id, {
        credits_balance: (profile.credits_balance || 0) + booking.total_price + 10
      });
    }

    return { success: true, amount: booking.total_price + 10 };
  } catch (error) {
    console.error('Error issuing no-show credit:', error);
    return { success: false, error: error.message };
  }
}

export async function checkAndIssueAutoCredits(bookingId) {
  try {
    const bookings = await Booking.filter({ id: bookingId });
    if (bookings.length === 0) return { success: false, message: 'Booking not found' };
    
    const booking = bookings[0];
    const results = [];

    // Check for no-show only
    if (booking.status === 'cancelled' && !booking.check_in_time) {
      const bookingDate = new Date(booking.date);
      if (bookingDate < new Date()) {
        const result = await issueNoShowCredit(bookingId, booking);
        results.push({ type: 'no_show', ...result });
      }
    }

    return { success: true, credits_issued: results };
  } catch (error) {
    console.error('Error in auto credit check:', error);
    return { success: false, error: error.message };
  }
}