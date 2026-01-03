/**
 * Cancellation Policy Enforcement
 * Calculates fees based on cancellation timing and grace periods
 */

import { base44 } from '@/api/base44Client';

// Cancellation policy rules
const POLICY = {
  GRACE_CANCELLATIONS_DEFAULT: 2,
  FREE_WINDOW_HOURS: 48, // Free cancellation if >48h before job
  PARTIAL_FEE_WINDOW_HOURS: 24, // 50% fee if 24-48h before job
  FULL_FEE_WINDOW_HOURS: 0, // 100% fee if <24h before job
  PARTIAL_FEE_PERCENTAGE: 0.5,
  FULL_FEE_PERCENTAGE: 1.0
};

/**
 * Calculate cancellation fee for a booking
 * @param {Object} booking - The booking being cancelled
 * @param {Object} clientProfile - Client's profile (for grace cancellations)
 * @param {string} cancelledBy - 'client' or 'cleaner'
 * @returns {Object} { fee, reason, canUseGrace, gracesRemaining }
 */
export function calculateCancellationFee(booking, clientProfile, cancelledBy = 'client') {
  if (!booking) {
    return { fee: 0, reason: 'Invalid booking', canUseGrace: false, gracesRemaining: 0 };
  }

  // Cleaners cancelling always incur no fee to client (handled separately)
  if (cancelledBy === 'cleaner') {
    return {
      fee: 0,
      reason: 'Cleaner cancellation - no charge to client',
      canUseGrace: false,
      gracesRemaining: 0
    };
  }

  // Calculate hours until booking
  const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
  const now = new Date();
  const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60);

  // Check if client has grace cancellations left
  const graceCancellationsLeft = clientProfile?.grace_cancellations_left ?? POLICY.GRACE_CANCELLATIONS_DEFAULT;
  const canUseGrace = graceCancellationsLeft > 0;

  // Determine fee based on timing
  let feePercentage = 0;
  let reason = '';

  if (hoursUntil >= POLICY.FREE_WINDOW_HOURS) {
    // Free cancellation window (>48h)
    feePercentage = 0;
    reason = `Free cancellation (${Math.round(hoursUntil)}h notice)`;
  } else if (hoursUntil >= POLICY.PARTIAL_FEE_WINDOW_HOURS) {
    // Partial fee window (24-48h)
    if (canUseGrace) {
      feePercentage = 0;
      reason = `Grace cancellation used (${graceCancellationsLeft} remaining)`;
    } else {
      feePercentage = POLICY.PARTIAL_FEE_PERCENTAGE;
      reason = `50% cancellation fee (${Math.round(hoursUntil)}h notice)`;
    }
  } else {
    // Full fee window (<24h)
    if (canUseGrace) {
      feePercentage = 0;
      reason = `Grace cancellation used (${graceCancellationsLeft} remaining)`;
    } else {
      feePercentage = POLICY.FULL_FEE_PERCENTAGE;
      reason = `100% cancellation fee (<24h notice)`;
    }
  }

  const fee = (booking.total_price || 0) * feePercentage;

  return {
    fee,
    feePercentage,
    reason,
    canUseGrace: canUseGrace && feePercentage > 0,
    gracesRemaining: graceCancellationsLeft,
    hoursUntil,
    bookingDateTime: bookingDateTime.toISOString()
  };
}

/**
 * Process booking cancellation with fee enforcement
 * @param {string} bookingId - Booking to cancel
 * @param {string} cancelledBy - 'client' or 'cleaner'
 * @param {string} reason - Cancellation reason
 * @param {boolean} useGraceCancellation - Whether to use grace cancellation
 * @returns {Promise<Object>} Cancellation result
 */
export async function processCancellation(
  bookingId,
  cancelledBy,
  reason,
  useGraceCancellation = false
) {
  try {
    // Get booking
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (bookings.length === 0) {
      throw new Error('Booking not found');
    }
    const booking = bookings[0];

    // Get client profile
    const clientProfiles = await base44.entities.ClientProfile.filter({
      user_email: booking.client_email
    });
    const clientProfile = clientProfiles.length > 0 ? clientProfiles[0] : null;

    // Calculate fee
    const feeData = calculateCancellationFee(booking, clientProfile, cancelledBy);

    // Determine final fee
    let finalFee = feeData.fee;
    let usedGrace = false;

    if (useGraceCancellation && feeData.canUseGrace) {
      finalFee = 0;
      usedGrace = true;
    }

    // Update booking status
    await base44.entities.Booking.update(bookingId, {
      status: 'cancelled',
      cancelled_by: cancelledBy,
      cancellation_reason: reason,
      cancellation_fee: finalFee,
      cancellation_timestamp: new Date().toISOString()
    });

    // Update client's grace cancellations if used
    if (usedGrace && clientProfile) {
      await base44.entities.ClientProfile.update(clientProfile.id, {
        grace_cancellations_left: Math.max(0, clientProfile.grace_cancellations_left - 1)
      });
    }

    // Create event
    await base44.entities.Event.create({
      booking_id: bookingId,
      event_type: 'cancelled',
      user_email: cancelledBy === 'client' ? booking.client_email : booking.cleaner_email,
      details: `Cancelled by ${cancelledBy}: ${reason}. Fee: $${finalFee.toFixed(2)}${usedGrace ? ' (grace used)' : ''}`,
      timestamp: new Date().toISOString()
    });

    // If there's a fee, create a credit transaction (negative)
    if (finalFee > 0 && clientProfile) {
      const newBalance = (clientProfile.credits_balance || 0) - (finalFee * 10); // Convert to credits

      await base44.entities.CreditTransaction.create({
        client_email: booking.client_email,
        transaction_type: 'charge',
        amount_credits: -(finalFee * 10),
        booking_id: bookingId,
        note: `Cancellation fee: ${feeData.reason}`,
        balance_after: newBalance
      });

      // Update client balance
      await base44.entities.ClientProfile.update(clientProfile.id, {
        credits_balance: newBalance
      });
    }

    return {
      success: true,
      fee: finalFee,
      feeData,
      usedGrace,
      gracesRemaining: usedGrace 
        ? (clientProfile?.grace_cancellations_left || 0) - 1 
        : (clientProfile?.grace_cancellations_left || 0)
    };

  } catch (error) {
    console.error('Error processing cancellation:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get cancellation policy info for display
 * @param {Object} booking - The booking
 * @param {Object} clientProfile - Client's profile
 * @returns {Object} Policy information formatted for UI
 */
export function getCancellationPolicyInfo(booking, clientProfile) {
  if (!booking) {
    return null;
  }

  const feeData = calculateCancellationFee(booking, clientProfile, 'client');
  
  return {
    freeWindowHours: POLICY.FREE_WINDOW_HOURS,
    partialFeeWindowHours: POLICY.PARTIAL_FEE_WINDOW_HOURS,
    partialFeePercentage: POLICY.PARTIAL_FEE_PERCENTAGE * 100,
    currentFee: feeData.fee,
    currentFeePercentage: feeData.feePercentage * 100,
    reason: feeData.reason,
    canUseGrace: feeData.canUseGrace,
    gracesRemaining: feeData.gracesRemaining,
    hoursUntil: feeData.hoursUntil,
    bookingDateTime: feeData.bookingDateTime,
    breakdown: [
      {
        label: 'Free Cancellation',
        condition: `More than ${POLICY.FREE_WINDOW_HOURS}h before job`,
        fee: '0%'
      },
      {
        label: 'Partial Fee',
        condition: `${POLICY.PARTIAL_FEE_WINDOW_HOURS}-${POLICY.FREE_WINDOW_HOURS}h before job`,
        fee: `${POLICY.PARTIAL_FEE_PERCENTAGE * 100}%`
      },
      {
        label: 'Full Fee',
        condition: `Less than ${POLICY.PARTIAL_FEE_WINDOW_HOURS}h before job`,
        fee: `${POLICY.FULL_FEE_PERCENTAGE * 100}%`
      },
      {
        label: 'Grace Cancellations',
        condition: `${clientProfile?.grace_cancellations_left ?? POLICY.GRACE_CANCELLATIONS_DEFAULT} remaining`,
        fee: 'Free (waives fee)'
      }
    ]
  };
}

export default {
  calculateCancellationFee,
  processCancellation,
  getCancellationPolicyInfo,
  POLICY
};