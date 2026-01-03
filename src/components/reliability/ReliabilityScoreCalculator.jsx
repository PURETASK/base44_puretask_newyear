
import { Booking } from '@/api/entities';
import { Review } from '@/api/entities';
import { PhotoPair } from '@/api/entities';
import { SupportTicket } from '@/api/entities';
import { CleanerProfile } from '@/api/entities';

/**
 * Reliability Score Calculation Algorithm
 * 
 * Formula:
 * score = 50 
 *       + (On-Time Rate × 25)
 *       + (Average Rating ÷ 5 × 15)
 *       + (Photo Compliance Rate × 5)
 *       + (Support SLA Rate × 5)
 *       − (Dispute Rate × 10)
 *       − (No-Show Rate × 25)
 * 
 * Score ranges from 0-100
 * 
 * On-Time Grace Period: 30 minutes
 * Cleaners have up to 15 minutes after scheduled start time to check in without penalty
 */

export async function calculateReliabilityScore(cleanerEmail) {
  try {
    // Get all bookings for this cleaner
    const bookings = await Booking.filter({ cleaner_email: cleanerEmail });
    const completedBookings = bookings.filter(b => b.status === 'completed');
    
    if (completedBookings.length === 0) {
      return 75; // Default score for new cleaners
    }

    // 1. Calculate On-Time Rate (within 15 minutes of scheduled time - GRACE PERIOD)
    let onTimeCount = 0;
    completedBookings.forEach(booking => {
      if (booking.check_in_time) {
        const scheduledTime = new Date(`${booking.date}T${booking.start_time}`);
        const actualTime = new Date(booking.check_in_time);
        const diffMinutes = (actualTime - scheduledTime) / (1000 * 60);
        
        // 15-minute grace period: arrival between -15min early and +15min late counts as on-time
        if (Math.abs(diffMinutes) <= 15) {
          onTimeCount++;
        }
      }
    });
    const onTimeRate = completedBookings.length > 0 ? onTimeCount / completedBookings.length : 1;

    // 2. Calculate Average Rating
    const reviews = await Review.filter({ cleaner_email: cleanerEmail });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5;

    // 3. Calculate Photo Compliance Rate
    const photoPairs = await PhotoPair.filter({ cleaner_email: cleanerEmail });
    const photoComplianceRate = completedBookings.length > 0
      ? Math.min(photoPairs.length / completedBookings.length, 1)
      : 1;

    // 4. Calculate Support SLA Rate (tickets resolved within 24 hours)
    const tickets = await SupportTicket.filter({ user_email: cleanerEmail });
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    let slaMetCount = 0;
    resolvedTickets.forEach(ticket => {
      const created = new Date(ticket.created_date);
      const updated = new Date(ticket.updated_date);
      const hoursDiff = (updated - created) / (1000 * 60 * 60);
      if (hoursDiff <= 24) {
        slaMetCount++;
      }
    });
    const supportSLARate = resolvedTickets.length > 0 ? slaMetCount / resolvedTickets.length : 1;

    // 5. Calculate Dispute Rate
    const disputedBookings = bookings.filter(b => b.status === 'disputed').length;
    const disputeRate = bookings.length > 0 ? disputedBookings / bookings.length : 0;

    // 6. Calculate No-Show Rate
    const noShowBookings = bookings.filter(b => 
      b.status === 'cancelled' && !b.check_in_time && new Date(b.date) < new Date()
    ).length;
    const noShowRate = bookings.length > 0 ? noShowBookings / bookings.length : 0;

    // Calculate final score
    const score = Math.round(
      50 +
      (onTimeRate * 25) +
      ((avgRating / 5) * 15) +
      (photoComplianceRate * 5) +
      (supportSLARate * 5) -
      (disputeRate * 10) -
      (noShowRate * 25)
    );

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error calculating reliability score:', error);
    return 75; // Default on error
  }
}

export async function updateAllReliabilityScores() {
  try {
    const allCleaners = await CleanerProfile.list();
    const results = [];
    
    for (const cleaner of allCleaners) {
      const score = await calculateReliabilityScore(cleaner.user_email);
      
      // Determine tier based on score
      let tier = 'Basic';
      if (score >= 85) tier = 'Elite';
      else if (score >= 70) tier = 'Pro';
      
      // Update profile with new score and tier
      await CleanerProfile.update(cleaner.id, {
        reliability_score: score,
        tier: tier
      });

      results.push({
        cleaner_email: cleaner.user_email,
        old_score: cleaner.reliability_score,
        new_score: score,
        old_tier: cleaner.tier,
        new_tier: tier
      });
    }
    
    return {
      success: true,
      updated: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error updating reliability scores:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function getReliabilityMetrics(onTimeRate, avgRating, photoComplianceRate, supportSLARate, disputeRate, noShowRate) {
  return {
    onTimeRate: (onTimeRate * 100).toFixed(1) + '%',
    avgRating: avgRating.toFixed(1),
    photoComplianceRate: (photoComplianceRate * 100).toFixed(1) + '%',
    supportSLARate: (supportSLARate * 100).toFixed(1) + '%',
    disputeRate: (disputeRate * 100).toFixed(1) + '%',
    noShowRate: (noShowRate * 100).toFixed(1) + '%'
  };
}
