/**
 * MODULE 3 - Payout Service
 * Helper functions for payout operations
 */

import { base44 } from '@/api/base44Client';

// Policy configuration
export const CREDITS_PER_USD = 10;
export const MIN_WEEKLY_PAYOUT_USD = 20;
export const MIN_INSTANT_PAYOUT_USD = 10;
export const INSTANT_PAYOUT_FEE_PCT = 0.05; // 5%

/**
 * Get pending earnings for a cleaner
 */
export async function getPendingEarnings(cleanerEmail) {
  return await base44.entities.CleanerEarning.filter({
    cleaner_email: cleanerEmail,
    status: 'pending'
  });
}

/**
 * Calculate total pending USD for a cleaner
 */
export async function calculatePendingUSD(cleanerEmail) {
  const earnings = await getPendingEarnings(cleanerEmail);
  return earnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
}

/**
 * Get payout history for a cleaner
 */
export async function getPayoutHistory(cleanerEmail, limit = 20) {
  return await base44.entities.Payout.filter(
    { cleaner_email: cleanerEmail },
    '-created_date',
    limit
  );
}

/**
 * Request instant payout (Automation 3.3)
 */
export async function requestInstantPayout(cleanerEmail) {
  // Get pending earnings
  const earnings = await getPendingEarnings(cleanerEmail);
  
  if (earnings.length === 0) {
    throw new Error('No pending earnings');
  }

  // Calculate gross amount
  const grossUSD = earnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);

  // Check minimum
  if (grossUSD < MIN_INSTANT_PAYOUT_USD) {
    throw new Error(`Minimum instant payout is $${MIN_INSTANT_PAYOUT_USD}. You have $${grossUSD.toFixed(2)}`);
  }

  // Calculate fee and net
  const feeUSD = grossUSD * INSTANT_PAYOUT_FEE_PCT;
  const netUSD = grossUSD - feeUSD;

  // Get date range
  const createdDates = earnings.map(e => new Date(e.created_date));
  const batchStart = new Date(Math.min(...createdDates)).toISOString();
  const batchEnd = new Date(Math.max(...createdDates)).toISOString();

  // Create Payout
  const payout = await base44.entities.Payout.create({
    cleaner_email: cleanerEmail,
    booking_ids: earnings.map(e => e.booking_id),
    amount: netUSD,
    fee: feeUSD,
    payout_type: 'instant',
    status: 'pending',
    batch_start_date: batchStart,
    batch_end_date: batchEnd
  });

  // Mark earnings as batched
  for (const earning of earnings) {
    await base44.entities.CleanerEarning.update(earning.id, {
      status: 'batched',
      payout_id: payout.id
    });
  }

  console.log(`[3.3] Created instant payout ${payout.id}: Gross $${grossUSD.toFixed(2)}, Fee $${feeUSD.toFixed(2)}, Net $${netUSD.toFixed(2)}`);

  return payout;
}

/**
 * Get payout status display info
 */
export function getPayoutStatusInfo(status) {
  const statusMap = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

/**
 * Get earning status display info
 */
export function getEarningStatusInfo(status) {
  const statusMap = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    batched: { label: 'Batched', color: 'bg-blue-100 text-blue-800' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
    reversed: { label: 'Reversed', color: 'bg-red-100 text-red-800' }
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}