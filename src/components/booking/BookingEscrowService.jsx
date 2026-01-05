/**
 * Booking Escrow Service
 * Handles credit escrow, holds, releases, and charges for bookings
 */

import { base44 } from '@/api/base44Client';
import {
  getSelectedAddon,
  calculateTotalRate,
  calculateEscrow,
  calculateActualHours,
  calculateFinalChargeAndRefund,
  getPayoutPercentage,
  CREDITS_PER_USD
} from '../credits/CreditCalculator';

/**
 * Create booking with escrow hold
 */
export async function createBookingWithEscrow(bookingData, cleanerProfile, currentUser) {
  try {
    // 1. Calculate rates and escrow
    const selectedAddon = getSelectedAddon(
      bookingData.cleaning_type || 'basic',
      cleanerProfile.deep_addon_credits_per_hour,
      cleanerProfile.moveout_addon_credits_per_hour
    );
    
    const totalRate = calculateTotalRate(
      cleanerProfile.base_rate_credits_per_hour,
      selectedAddon
    );
    
    const escrow = calculateEscrow(bookingData.estimated_hours || bookingData.hours, totalRate);
    
    // 2. Check balance
    const userBalance = currentUser.wallet_credits_balance || 0;
    if (userBalance < escrow) {
      return {
        success: false,
        error: 'insufficient_credits',
        required: escrow,
        available: userBalance,
        shortfall: escrow - userBalance
      };
    }
    
    // 3. Create booking with frozen snapshots
    const booking = await base44.entities.Booking.create({
      ...bookingData,
      cleaner_email: cleanerProfile.user_email,
      estimated_hours: bookingData.estimated_hours || bookingData.hours,
      snapshot_base_rate_cph: cleanerProfile.base_rate_credits_per_hour,
      snapshot_deep_addon_cph: cleanerProfile.deep_addon_credits_per_hour,
      snapshot_moveout_addon_cph: cleanerProfile.moveout_addon_credits_per_hour,
      snapshot_selected_addon_cph: selectedAddon,
      snapshot_total_rate_cph: totalRate,
      payout_percentage_at_accept: cleanerProfile.payout_percentage || getPayoutPercentage(cleanerProfile.tier),
      escrow_credits_reserved: escrow,
      status: 'created',
      payment_held: true
    });
    
    // 4. Create hold transaction
    const newBalance = userBalance - escrow;
    await base44.entities.CreditTransaction.create({
      client_email: currentUser.email,
      transaction_type: 'hold',
      amount_credits: -escrow,
      booking_id: booking.id,
      note: `Escrow hold for booking on ${bookingData.date}`,
      balance_after: newBalance
    });
    
    // 5. Update user balance
    await base44.auth.updateMe({
      wallet_credits_balance: newBalance
    });
    
    return {
      success: true,
      booking: booking,
      escrow_held: escrow,
      new_balance: newBalance
    };
    
  } catch (error) {
    console.error('Escrow creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Process check-out and calculate final charge
 */
export async function processCheckOut(booking, checkOutTime, checkOutGPS) {
  try {
    if (!booking.check_in_time) {
      throw new Error('Cannot check out without check-in');
    }
    
    // 1. Calculate actual hours and charges
    const actualHours = calculateActualHours(booking.check_in_time, checkOutTime);
    const { finalCharge, refund } = calculateFinalChargeAndRefund(
      actualHours,
      booking.snapshot_total_rate_cph,
      booking.escrow_credits_reserved
    );
    
    // 2. Get current client
    const client = await base44.entities.User.list();
    const currentClient = client.find(u => u.email === booking.client_email);
    const currentBalance = currentClient?.wallet_credits_balance || 0;
    
    // 3. Release refund if any
    let balanceAfterRefund = currentBalance;
    if (refund > 0) {
      balanceAfterRefund = currentBalance + refund;
      await base44.entities.CreditTransaction.create({
        client_email: booking.client_email,
        transaction_type: 'release',
        amount_credits: refund,
        booking_id: booking.id,
        note: `Refund: worked ${actualHours}h vs ${booking.estimated_hours}h estimated`,
        balance_after: balanceAfterRefund
      });
      
      // Update client balance
      await base44.auth.updateMe({
        wallet_credits_balance: balanceAfterRefund
      });
    }
    
    // 4. Charge final amount
    const balanceAfterCharge = balanceAfterRefund - finalCharge;
    await base44.entities.CreditTransaction.create({
      client_email: booking.client_email,
      transaction_type: 'charge',
      amount_credits: -finalCharge,
      booking_id: booking.id,
      note: `Final charge: ${actualHours}h at ${booking.snapshot_total_rate_cph} credits/h`,
      balance_after: balanceAfterCharge
    });
    
    // 5. Update booking
    await base44.entities.Booking.update(booking.id, {
      check_out_time: checkOutTime,
      check_out_location: checkOutGPS,
      actual_hours: actualHours,
      final_charge_credits: finalCharge,
      refund_credits: refund,
      status: 'awaiting_client',
      payment_captured: true
    });
    
    return {
      success: true,
      actual_hours: actualHours,
      final_charge: finalCharge,
      refund: refund,
      new_balance: balanceAfterCharge
    };
    
  } catch (error) {
    console.error('Check-out processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Approve booking and create cleaner earnings
 */
export async function approveBooking(booking) {
  try {
    if (booking.status !== 'awaiting_client' && booking.status !== 'completed') {
      throw new Error('Booking not ready for approval');
    }
    
    if (!booking.final_charge_credits) {
      throw new Error('Final charge not calculated');
    }
    
    // 1. Create cleaner earnings record
    const payoutRate = booking.payout_percentage_at_accept;
    const usdDue = (booking.final_charge_credits / CREDITS_PER_USD) * payoutRate;
    
    await base44.entities.CleanerEarning.create({
      cleaner_email: booking.cleaner_email,
      booking_id: booking.id,
      credits_earned: booking.final_charge_credits,
      payout_percentage: payoutRate,
      usd_due: usdDue,
      status: 'pending'
    });
    
    // 2. Update booking status
    await base44.entities.Booking.update(booking.id, {
      status: 'approved'
    });
    
    // 3. Update cleaner's job count
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({
      user_email: booking.cleaner_email
    });
    
    if (cleanerProfiles.length > 0) {
      const profile = cleanerProfiles[0];
      await base44.entities.CleanerProfile.update(profile.id, {
        total_jobs: (profile.total_jobs || 0) + 1
      });
    }
    
    return {
      success: true,
      earnings_created: true,
      usd_due: usdDue
    };
    
  } catch (error) {
    console.error('Approval error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle dispute resolution
 */
export async function resolveDispute(booking, resolution, partialRefundCredits = 0) {
  try {
    const client = await base44.entities.User.list();
    const currentClient = client.find(u => u.email === booking.client_email);
    const currentBalance = currentClient?.wallet_credits_balance || 0;
    
    if (resolution === 'client_favor') {
      // Full refund to client
      const refundAmount = booking.final_charge_credits;
      const newBalance = currentBalance + refundAmount;
      
      await base44.entities.CreditTransaction.create({
        client_email: booking.client_email,
        transaction_type: 'refund',
        amount_credits: refundAmount,
        booking_id: booking.id,
        note: 'Dispute resolved in client favor - full refund',
        balance_after: newBalance
      });
      
      await base44.auth.updateMe({
        wallet_credits_balance: newBalance
      });
      
      await base44.entities.Booking.update(booking.id, {
        dispute_status: 'client_favor',
        status: 'disputed'
      });
      
    } else if (resolution === 'cleaner_favor') {
      // Create full cleaner earnings
      await approveBooking(booking);
      
      await base44.entities.Booking.update(booking.id, {
        dispute_status: 'cleaner_favor',
        status: 'approved'
      });
      
    } else if (resolution === 'partial') {
      // Partial refund to client
      if (partialRefundCredits > 0) {
        const newBalance = currentBalance + partialRefundCredits;
        
        await base44.entities.CreditTransaction.create({
          client_email: booking.client_email,
          transaction_type: 'refund',
          amount_credits: partialRefundCredits,
          booking_id: booking.id,
          note: 'Partial refund from dispute resolution',
          balance_after: newBalance
        });
        
        await base44.auth.updateMe({
          wallet_credits_balance: newBalance
        });
      }
      
      // Partial cleaner earnings
      const remainingCredits = booking.final_charge_credits - partialRefundCredits;
      const payoutRate = booking.payout_percentage_at_accept;
      const usdDue = (remainingCredits / CREDITS_PER_USD) * payoutRate;
      
      await base44.entities.CleanerEarning.create({
        cleaner_email: booking.cleaner_email,
        booking_id: booking.id,
        credits_earned: remainingCredits,
        payout_percentage: payoutRate,
        usd_due: usdDue,
        status: 'pending'
      });
      
      await base44.entities.Booking.update(booking.id, {
        dispute_status: 'partial',
        status: 'approved'
      });
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Dispute resolution error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  createBookingWithEscrow,
  processCheckOut,
  approveBooking,
  resolveDispute
};