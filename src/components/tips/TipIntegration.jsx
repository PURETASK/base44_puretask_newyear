import React from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Process a tip after review submission
 */
export async function processTipAfterReview(bookingId, tipData) {
  try {
    const booking = await base44.entities.Booking.get(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Create tip record
    const tip = await base44.entities.Tip.create({
      booking_id: bookingId,
      client_email: booking.client_email,
      cleaner_email: booking.cleaner_email,
      amount: tipData.amount,
      percentage: tipData.percentage || null,
      status: 'pending'
    });

    // TODO: Process payment for tip via Stripe
    // For now, mark as paid immediately
    await base44.entities.Tip.update(tip.id, {
      status: 'paid'
    });

    // Send notification to cleaner
    await base44.integrations.Core.SendEmail({
      to: booking.cleaner_email,
      subject: '🎉 You received a tip!',
      body: `Great news! Your client tipped you $${tipData.amount} for the cleaning at ${booking.address}.

This will be included in your next payout.

Keep up the excellent work!

- The PureTask Team`
    });

    return tip;
  } catch (error) {
    console.error('Error processing tip:', error);
    throw error;
  }
}

/**
 * Calculate total tips for a cleaner
 */
export async function calculateCleanerTips(cleanerEmail, startDate, endDate) {
  const tips = await base44.entities.Tip.filter({
    cleaner_email: cleanerEmail,
    status: 'paid'
  });

  let total = 0;
  let count = 0;

  for (const tip of tips) {
    const tipDate = new Date(tip.created_date);
    if (tipDate >= new Date(startDate) && tipDate <= new Date(endDate)) {
      total += tip.amount;
      count++;
    }
  }

  return {
    total,
    count,
    average: count > 0 ? total / count : 0
  };
}

/**
 * Get tip statistics for display on cleaner dashboard
 */
export async function getCleanerTipStats(cleanerEmail) {
  const tips = await base44.entities.Tip.filter({
    cleaner_email: cleanerEmail,
    status: 'paid'
  });

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let thisMonthTotal = 0;
  let lastMonthTotal = 0;
  let allTimeTotal = 0;

  for (const tip of tips) {
    const tipDate = new Date(tip.created_date);
    allTimeTotal += tip.amount;

    if (tipDate >= thisMonth) {
      thisMonthTotal += tip.amount;
    } else if (tipDate >= lastMonth && tipDate < thisMonth) {
      lastMonthTotal += tip.amount;
    }
  }

  return {
    thisMonth: thisMonthTotal,
    lastMonth: lastMonthTotal,
    allTime: allTimeTotal,
    totalTips: tips.length,
    averageTip: tips.length > 0 ? allTimeTotal / tips.length : 0
  };
}