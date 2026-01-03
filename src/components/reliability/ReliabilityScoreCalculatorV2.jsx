/**
 * Reliability Score Calculator V2 - Section 4.1
 * 
 * SCORING FORMULA (0-100 scale):
 * =====================================
 * 1. Attendance Rate (25 points)
 * 2. Punctuality Rate (20 points)
 * 3. Photo Proof Compliance (15 points)
 * 4. Communication Rate (10 points)
 * 5. Completion Confirmation (10 points)
 * 6. Average Rating (10 points)
 * 7. Cancellation Rate (penalty -20 points)
 * 8. Dispute Rate (penalty -10 points)
 * 9. No-Show Rate (penalty -15 points)
 * 
 * TIER SYSTEM:
 * - Developing: 0-59 (150-350 credits/hr base rate) - NEW CLEANERS START HERE
 * - Semi Pro: 60-74 (350-450 credits/hr base rate)
 * - Pro: 75-89 (450-600 credits/hr base rate)
 * - Elite: 90-100 (600-850 credits/hr base rate)
 */

import { base44 } from '@/api/base44Client';

// Scoring weights (must sum to 100)
const WEIGHTS = {
  attendance: 25,
  punctuality: 20,
  photo_proof: 15,
  communication: 10,
  completion_confirmation: 10,
  average_rating: 10,
  cancellation_penalty: -20,
  dispute_penalty: -10,
  no_show_penalty: -15
};

// Tier thresholds
const TIERS = {
  'Developing': { min: 0, max: 59, base_rate_min: 150, base_rate_max: 350 },
  'Semi Pro': { min: 60, max: 74, base_rate_min: 350, base_rate_max: 450 },
  'Pro': { min: 75, max: 89, base_rate_min: 450, base_rate_max: 600 },
  'Elite': { min: 90, max: 100, base_rate_min: 600, base_rate_max: 850 }
};

/**
 * Calculate reliability score for a cleaner
 */
export const calculateReliabilityScore = async (cleanerEmail) => {
  try {
    // Get cleaner profile
    const profiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
    if (profiles.length === 0) {
      throw new Error('Cleaner profile not found');
    }
    const profile = profiles[0];

    // Get all completed bookings for this cleaner
    const completedBookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail,
      status: { $in: ['completed', 'approved'] }
    });

    // Get all bookings (including cancelled) for rates
    const allBookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail
    });

    // NEW CLEANERS START AT BOTTOM TIER (0-5 jobs)
    if (allBookings.length === 0 || allBookings.length < 5) {
      return {
        total_score: 30, // Start at bottom of Developing tier
        tier: 'Developing',
        components: getNewCleanerComponents(),
        total_jobs: allBookings.length,
        message: 'New cleaner - starting at Developing tier'
      };
    }

    // Calculate each component
    const components = {
      attendance: calculateAttendanceScore(allBookings),
      punctuality: calculatePunctualityScore(completedBookings),
      photo_proof: calculatePhotoProofScore(completedBookings),
      communication: calculateCommunicationScore(profile),
      completion_confirmation: calculateCompletionConfirmationScore(completedBookings),
      average_rating: calculateAverageRatingScore(profile),
      cancellation_penalty: calculateCancellationPenalty(allBookings),
      dispute_penalty: calculateDisputePenalty(completedBookings),
      no_show_penalty: calculateNoShowPenalty(allBookings)
    };

    // Calculate total score
    const totalScore = Math.max(0, Math.min(100,
      (components.attendance * WEIGHTS.attendance / 100) +
      (components.punctuality * WEIGHTS.punctuality / 100) +
      (components.photo_proof * WEIGHTS.photo_proof / 100) +
      (components.communication * WEIGHTS.communication / 100) +
      (components.completion_confirmation * WEIGHTS.completion_confirmation / 100) +
      (components.average_rating * WEIGHTS.average_rating / 100) +
      components.cancellation_penalty +
      components.dispute_penalty +
      components.no_show_penalty
    ));

    // Determine tier
    const tier = getTierFromScore(totalScore);

    return {
      total_score: Math.round(totalScore),
      tier,
      components,
      total_jobs: completedBookings.length,
      raw_calculation: components
    };
  } catch (error) {
    console.error('Error calculating reliability score:', error);
    throw error;
  }
};

/**
 * 1. Attendance Rate (25 points)
 * Shows up for accepted jobs vs. no-shows
 */
const calculateAttendanceScore = (allBookings) => {
  const acceptedJobs = allBookings.filter(b => 
    ['scheduled', 'completed', 'approved', 'in_progress'].includes(b.status)
  );
  
  if (acceptedJobs.length === 0) return 100;

  const noShows = allBookings.filter(b => 
    b.status === 'cancelled' && b.cancelled_by === 'system' && !b.check_in_time
  ).length;

  const attendanceRate = ((acceptedJobs.length - noShows) / acceptedJobs.length) * 100;
  return Math.round(attendanceRate);
};

/**
 * 2. Punctuality Rate (20 points)
 * GPS check-in within 15 minutes of scheduled start
 */
const calculatePunctualityScore = (completedBookings) => {
  if (completedBookings.length === 0) return 100;

  let onTimeCount = 0;
  completedBookings.forEach(booking => {
    if (!booking.check_in_time) return;

    const scheduledTime = new Date(`${booking.date}T${booking.start_time}`);
    const checkInTime = new Date(booking.check_in_time);
    const minutesLate = (checkInTime - scheduledTime) / (1000 * 60);

    if (minutesLate <= 15) {
      onTimeCount++;
    }
  });

  const punctualityRate = (onTimeCount / completedBookings.length) * 100;
  return Math.round(punctualityRate);
};

/**
 * 3. Photo Proof Compliance (15 points)
 * Uploads minimum 3 photos (before + after combined)
 */
const calculatePhotoProofScore = (completedBookings) => {
  if (completedBookings.length === 0) return 100;

  let compliantCount = 0;
  completedBookings.forEach(booking => {
    const beforePhotos = booking.before_photos?.length || 0;
    const afterPhotos = booking.after_photos?.length || 0;
    const totalPhotos = beforePhotos + afterPhotos;

    if (totalPhotos >= 3) {
      compliantCount++;
    }
  });

  const complianceRate = (compliantCount / completedBookings.length) * 100;
  return Math.round(complianceRate);
};

/**
 * 4. Communication Rate (10 points)
 * Based on response time and messaging activity
 */
const calculateCommunicationScore = (profile) => {
  // Use stored communication_rate or default to 100
  return profile.communication_rate || 100;
};

/**
 * 5. Completion Confirmation (10 points)
 * Checks out via GPS + uploads photos
 */
const calculateCompletionConfirmationScore = (completedBookings) => {
  if (completedBookings.length === 0) return 100;

  let confirmedCount = 0;
  completedBookings.forEach(booking => {
    const hasCheckOut = !!booking.check_out_time;
    const hasPhotos = (booking.before_photos?.length || 0) + (booking.after_photos?.length || 0) >= 3;

    if (hasCheckOut && hasPhotos) {
      confirmedCount++;
    }
  });

  const confirmationRate = (confirmedCount / completedBookings.length) * 100;
  return Math.round(confirmationRate);
};

/**
 * 6. Average Rating (10 points)
 * Client star ratings (1-5 stars, normalized to 0-100)
 */
const calculateAverageRatingScore = (profile) => {
  const avgRating = profile.average_rating || 5.0;
  // Convert 1-5 scale to 0-100 scale
  return Math.round(((avgRating - 1) / 4) * 100);
};

/**
 * 7. Cancellation Penalty (-20 points max)
 * Cleaner-initiated cancellations within 24h of job
 */
const calculateCancellationPenalty = (allBookings) => {
  const cancelledByCleanerLate = allBookings.filter(b => {
    if (b.status !== 'cancelled' || b.cancelled_by !== b.cleaner_email) return false;

    const jobTime = new Date(`${b.date}T${b.start_time}`);
    const cancelTime = new Date(b.cancellation_timestamp);
    const hoursUntilJob = (jobTime - cancelTime) / (1000 * 60 * 60);

    return hoursUntilJob < 24;
  }).length;

  if (allBookings.length === 0) return 0;

  const cancellationRate = (cancelledByCleanerLate / allBookings.length) * 100;
  const penalty = Math.min(20, (cancellationRate / 10) * 20); // Max -20 points

  return -Math.round(penalty);
};

/**
 * 8. Dispute Penalty (-10 points max)
 * Disputes where cleaner was at fault
 */
const calculateDisputePenalty = (completedBookings) => {
  // This would require checking Dispute entity
  // Simplified: assume low dispute rate for now
  return 0; // TODO: Integrate with Dispute entity
};

/**
 * 9. No-Show Penalty (-15 points max)
 * Failed to check in for accepted jobs
 */
const calculateNoShowPenalty = (allBookings) => {
  const noShows = allBookings.filter(b => 
    ['scheduled', 'in_progress'].includes(b.status) && 
    !b.check_in_time &&
    new Date(`${b.date}T${b.start_time}`) < new Date()
  ).length;

  if (allBookings.length === 0) return 0;

  const noShowRate = (noShows / allBookings.length) * 100;
  const penalty = Math.min(15, (noShowRate / 5) * 15); // Max -15 points

  return -Math.round(penalty);
};

/**
 * Get components for new cleaners (start at bottom tier)
 */
const getNewCleanerComponents = () => ({
  attendance: 50,
  punctuality: 50,
  photo_proof: 50,
  communication: 50,
  completion_confirmation: 50,
  average_rating: 50,
  cancellation_penalty: 0,
  dispute_penalty: 0,
  no_show_penalty: 0
});

/**
 * Determine tier from score
 */
export const getTierFromScore = (score) => {
  if (score >= 90) return 'Elite';
  if (score >= 75) return 'Pro';
  if (score >= 60) return 'Semi Pro';
  return 'Developing';
};

/**
 * Get tier details
 */
export const getTierDetails = (tier) => {
  return TIERS[tier] || TIERS['Developing'];
};

/**
 * Get recommended base rate for tier
 */
export const getRecommendedBaseRate = (tier, currentScore) => {
  const tierDetails = getTierDetails(tier);
  
  // Within tier, scale rate based on position in tier range
  const tierRange = tierDetails.max - tierDetails.min;
  const positionInTier = Math.max(0, currentScore - tierDetails.min);
  const percentile = positionInTier / tierRange;

  const rateRange = tierDetails.base_rate_max - tierDetails.base_rate_min;
  const recommendedRate = tierDetails.base_rate_min + (rateRange * percentile);

  return Math.round(recommendedRate);
};

/**
 * Update cleaner profile with new score
 */
export const updateCleanerScore = async (cleanerEmail) => {
  try {
    const scoreData = await calculateReliabilityScore(cleanerEmail);
    
    const profiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
    if (profiles.length === 0) {
      throw new Error('Cleaner profile not found');
    }

    const profile = profiles[0];
    const oldTier = profile.tier;
    const newTier = scoreData.tier;

    // Update profile
    await base44.entities.CleanerProfile.update(profile.id, {
      reliability_score: scoreData.total_score,
      tier: newTier,
      attendance_rate: scoreData.components.attendance,
      punctuality_rate: scoreData.components.punctuality,
      photo_compliance_rate: scoreData.components.photo_proof,
      communication_rate: scoreData.components.communication,
      completion_confirmation_rate: scoreData.components.completion_confirmation,
      cancellation_rate: Math.abs(scoreData.components.cancellation_penalty),
      no_show_rate: Math.abs(scoreData.components.no_show_penalty),
      dispute_rate: Math.abs(scoreData.components.dispute_penalty),
      last_score_update: new Date().toISOString(),
      total_jobs: scoreData.total_jobs
    });

    // If tier changed, emit event
    if (oldTier !== newTier) {
      // Trigger reliability_changed event (Section 3 integration)
      console.log(`Tier changed for ${cleanerEmail}: ${oldTier} → ${newTier}`);
      
      // TODO: Integrate with EventBus
      // await EventBus.emit('reliability_changed', {
      //   cleaner_email: cleanerEmail,
      //   old_tier: oldTier,
      //   new_tier: newTier,
      //   score: scoreData.total_score
      // });
    }

    return {
      success: true,
      old_score: profile.reliability_score,
      new_score: scoreData.total_score,
      old_tier: oldTier,
      new_tier: newTier,
      tier_changed: oldTier !== newTier
    };
  } catch (error) {
    console.error('Error updating cleaner score:', error);
    throw error;
  }
};

export default {
  calculateReliabilityScore,
  updateCleanerScore,
  getTierFromScore,
  getTierDetails,
  getRecommendedBaseRate,
  WEIGHTS,
  TIERS
};