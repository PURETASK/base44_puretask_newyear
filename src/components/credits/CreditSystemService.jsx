/**
 * MODULE 2 - Credit System Service
 * Central service for all credit operations following Module 2 principles
 */

import { base44 } from '@/api/base44Client';

/**
 * Get current wallet balance for a client
 */
export async function getWalletBalance(clientEmail) {
  const profile = await base44.entities.ClientProfile.filter({ user_email: clientEmail });
  if (profile.length === 0) return 0;
  return profile[0].credits_balance || 0;
}

/**
 * Get transaction history for a client
 */
export async function getTransactionHistory(clientEmail, limit = 50) {
  return await base44.entities.CreditTransaction.filter(
    { client_email: clientEmail },
    '-created_date',
    limit
  );
}

/**
 * Calculate estimated escrow for a booking
 */
export function calculateEstimatedEscrow(bookingData) {
  const baseRate = bookingData.snapshot_total_rate_cph || 300;
  const estimatedHours = bookingData.estimated_hours || bookingData.hours || 2;
  const additionalServices = bookingData.additional_services_cost_credits || 0;
  
  return (estimatedHours * baseRate) + additionalServices;
}

/**
 * Calculate final charge after job completion
 */
export function calculateFinalCharge(bookingData) {
  const baseRate = bookingData.snapshot_total_rate_cph || 300;
  const actualHours = bookingData.actual_hours || bookingData.hours || 2;
  const additionalServices = bookingData.additional_services_cost_credits || 0;
  
  return (actualHours * baseRate) + additionalServices;
}

/**
 * Format credits to USD
 */
export function creditsToUSD(credits) {
  return credits / 1;
}

/**
 * Format USD to credits
 */
export function usdToCredits(usd) {
  return usd * 1;
}

/**
 * Get transaction type display name
 */
export function getTransactionTypeLabel(type) {
  const labels = {
    purchase: 'Wallet Top-Up',
    refund: 'Refund',
    promo: 'Promotional Credit',
    adjustment: 'Balance Adjustment',
    late_cancel_charge: 'Late Cancellation Fee',
    no_show_compensation: 'No-Show Compensation',
    charge: 'Charge',
    reversal: 'Reversal'
  };
  return labels[type] || type;
}

/**
 * Get transaction color class for UI
 */
export function getTransactionColor(type) {
  const positiveTypes = ['purchase', 'refund', 'promo', 'no_show_compensation'];
  const negativeTypes = ['charge', 'late_cancel_charge', 'reversal'];
  
  if (positiveTypes.includes(type)) return 'text-green-600';
  if (negativeTypes.includes(type)) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Format transaction amount with sign
 */
export function formatTransactionAmount(amount) {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${amount.toLocaleString()}`;
}