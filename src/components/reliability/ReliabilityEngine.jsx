/**
 * MODULE 6 - Reliability & Tier Engine
 * Calculates cleaner performance metrics, reliability score, tier assignment
 */

import { base44 } from '@/api/base44Client';

// Configuration
const ROLLING_WINDOW_DAYS = 90;
const PENALTY_FACTOR = 2; // For cancellation, no-show, dispute rates

// Tier thresholds
const TIER_REQUIREMENTS = {
  'Elite': {
    total_jobs: 100,
    reliability_score: 90,
    no_show_rate_max: 1,
    cancellation_rate_max: 3,
    average_rating_min: 4.8
  },
  'Pro': {
    total_jobs: 50,
    reliability_score: 80,
    no_show_rate_max: 2,
    cancellation_rate_max: 5
  },
  'Semi Pro': {
    total_jobs: 10,
    reliability_score: 70
  },
  'Developing': {
    total_jobs: 0,
    reliability_score: 0
  }
};

// Reliability score weights
const WEIGHTS = {
  attendance: 0.20,
  punctuality: 0.15,
  cancellation: 0.10,
  no_show: 0.20,
  dispute: 0.10,
  photo_proof: 0.10,
  communication: 0.10,
  rating: 0.05
};

/**
 * Full reliability calculation for a cleaner
 */
export async function calculateCleanerReliability(cleanerEmail) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ROLLING_WINDOW_DAYS);
  const cutoffISO = cutoffDate.toISOString();

  // Fetch all relevant data
  const [bookings, reviews, disputes] = await Promise.all([
    base44.entities.Booking.filter({ 
      cleaner_email: cleanerEmail,
      created_date: { $gte: cutoffISO }
    }),
    base44.entities.Review.filter({ 
      cleaner_email: cleanerEmail,
      created_date: { $gte: cutoffISO }
    }),
    base44.entities.Dispute.filter({ 
      booking_id: { $in: bookings.map(b => b.id) }
    })
  ]);

  // Calculate metrics
  const metrics = calculateMetrics(bookings, reviews, disputes);
  
  // Calculate reliability score
  const reliabilityScore = calculateReliabilityScore(metrics);
  
  // Determine tier
  const tier = determineTier(metrics, reliabilityScore);
  
  // Calculate tier progress
  const tierProgress = calculateTierProgress(metrics, reliabilityScore, tier);
  
  // Calculate streaks
  const streaks = calculateStreaks(bookings);

  return {
    ...metrics,
    reliability_score: reliabilityScore,
    tier,
    tier_progress: tierProgress,
    current_streak_days: streaks.current,
    best_streak_days: streaks.best,
    last_score_update: new Date().toISOString()
  };
}

/**
 * Calculate all component metrics
 */
function calculateMetrics(bookings, reviews, disputes) {
  const COMPLETED_STATUSES = ['completed', 'awaiting_client', 'approved'];
  const SCHEDULED_STATUSES = ['scheduled', 'on_the_way', 'in_progress', 'completed', 'awaiting_client', 'approved'];

  // Filter booking sets
  const completed = bookings.filter(b => COMPLETED_STATUSES.includes(b.status));
  const scheduled = bookings.filter(b => 
    SCHEDULED_STATUSES.includes(b.status) || 
    (b.status === 'cancelled' && b.cancelled_by !== 'cleaner')
  );

  // 2.1 Attendance Rate
  const attendance_rate = scheduled.length > 0 
    ? (completed.length / scheduled.length) * 100 
    : 100;

  // 2.2 Punctuality Rate
  const completedWithCheckIn = completed.filter(b => b.check_in_time);
  const onTimeJobs = completedWithCheckIn.filter(b => {
    if (!b.check_in_time || !b.start_time) return false;
    
    const checkInTime = new Date(b.check_in_time);
    const [hours, minutes] = b.start_time.split(':');
    const scheduledStart = new Date(b.date);
    scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const lateMinutes = (checkInTime - scheduledStart) / (1000 * 60);
    return lateMinutes <= 10;
  });

  const punctuality_rate = completedWithCheckIn.length > 0
    ? (onTimeJobs.length / completedWithCheckIn.length) * 100
    : 100;

  // 2.3 Cancellation Rate
  const cleanerCancelled = bookings.filter(b => 
    b.status === 'cancelled' && b.cancelled_by === 'cleaner'
  );
  
  const cancellation_rate = scheduled.length > 0
    ? (cleanerCancelled.length / scheduled.length) * 100
    : 0;

  // 2.4 Completion Confirmation Rate
  const confirmedJobs = completed.filter(b => b.check_in_time && b.check_out_time);
  const completion_confirmation_rate = completed.length > 0
    ? (confirmedJobs.length / completed.length) * 100
    : 100;

  // 2.5 Photo Proof Rate
  const MIN_PHOTOS = 2;
  const photoCompliant = completed.filter(b => 
    b.photo_proof_submitted === true && (b.photo_count || 0) >= MIN_PHOTOS
  );
  
  const photo_proof_rate = completed.length > 0
    ? (photoCompliant.length / completed.length) * 100
    : 100;

  // 2.6 Communication Rate (simplified - would need message analysis)
  const communication_rate = 85; // Placeholder - would analyze response times

  // 2.7 Average Rating & Total Reviews
  const average_rating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 5.0;
  
  const total_reviews = reviews.length;

  // 2.8 No-Show Rate
  const noShowDisputes = disputes.filter(d => d.category === 'no_show' && d.filed_by === 'client');
  const no_show_rate = scheduled.length > 0
    ? (noShowDisputes.length / scheduled.length) * 100
    : 0;

  // 2.9 Dispute Rate
  const disputedJobs = disputes.filter(d => d.category !== 'payment_issue');
  const dispute_rate = completed.length > 0
    ? (disputedJobs.length / completed.length) * 100
    : 0;

  // 2.11 Total Jobs
  const total_jobs = completed.length;

  return {
    attendance_rate: Math.round(attendance_rate * 10) / 10,
    punctuality_rate: Math.round(punctuality_rate * 10) / 10,
    cancellation_rate: Math.round(cancellation_rate * 10) / 10,
    completion_confirmation_rate: Math.round(completion_confirmation_rate * 10) / 10,
    photo_proof_rate: Math.round(photo_proof_rate * 10) / 10,
    communication_rate: Math.round(communication_rate * 10) / 10,
    average_rating: Math.round(average_rating * 10) / 10,
    total_reviews,
    no_show_rate: Math.round(no_show_rate * 10) / 10,
    dispute_rate: Math.round(dispute_rate * 10) / 10,
    total_jobs,
    on_time_rate: Math.round(punctuality_rate * 10) / 10,
    photo_compliance_rate: Math.round(photo_proof_rate * 10) / 10
  };
}

/**
 * Calculate composite reliability score (0-100)
 */
function calculateReliabilityScore(metrics) {
  const attend_score = metrics.attendance_rate;
  const punctuality_score = metrics.punctuality_rate;
  const cancel_score = Math.max(0, 100 - (metrics.cancellation_rate * PENALTY_FACTOR));
  const no_show_score = Math.max(0, 100 - (metrics.no_show_rate * PENALTY_FACTOR));
  const dispute_score = Math.max(0, 100 - (metrics.dispute_rate * PENALTY_FACTOR));
  const photo_score = metrics.photo_proof_rate;
  const comm_score = metrics.communication_rate;
  const rating_score = (metrics.average_rating / 5) * 100;

  const reliability = 
    WEIGHTS.attendance * attend_score +
    WEIGHTS.punctuality * punctuality_score +
    WEIGHTS.cancellation * cancel_score +
    WEIGHTS.no_show * no_show_score +
    WEIGHTS.dispute * dispute_score +
    WEIGHTS.photo_proof * photo_score +
    WEIGHTS.communication * comm_score +
    WEIGHTS.rating * rating_score;

  return Math.max(0, Math.min(100, Math.round(reliability * 10) / 10));
}

/**
 * Determine tier based on requirements
 */
function determineTier(metrics, reliabilityScore) {
  const { total_jobs, no_show_rate, cancellation_rate, average_rating } = metrics;

  // Check Elite
  if (total_jobs >= 100 && 
      reliabilityScore >= 90 && 
      no_show_rate < 1 && 
      cancellation_rate < 3 && 
      average_rating >= 4.8) {
    return 'Elite';
  }

  // Check Pro
  if (total_jobs >= 50 && 
      reliabilityScore >= 80 && 
      no_show_rate < 2 && 
      cancellation_rate < 5) {
    return 'Pro';
  }

  // Check Semi Pro
  if (total_jobs >= 10 && reliabilityScore >= 70) {
    return 'Semi Pro';
  }

  // Default: Developing
  return 'Developing';
}

/**
 * Calculate progress to next tier
 */
function calculateTierProgress(metrics, reliabilityScore, currentTier) {
  const tierOrder = ['Developing', 'Semi Pro', 'Pro', 'Elite'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === tierOrder.length - 1) {
    // Already at Elite
    return {
      current_jobs: metrics.total_jobs,
      current_score: reliabilityScore,
      jobs_to_next_tier: 0,
      score_to_next_tier: 0
    };
  }

  const nextTier = tierOrder[currentIndex + 1];
  const requirements = TIER_REQUIREMENTS[nextTier];

  return {
    current_jobs: metrics.total_jobs,
    current_score: reliabilityScore,
    jobs_to_next_tier: Math.max(0, requirements.total_jobs - metrics.total_jobs),
    score_to_next_tier: Math.max(0, requirements.reliability_score - reliabilityScore)
  };
}

/**
 * Calculate success streaks
 */
function calculateStreaks(bookings) {
  const COMPLETED_STATUSES = ['completed', 'awaiting_client', 'approved'];
  
  // Get completed bookings sorted by date
  const completedBookings = bookings
    .filter(b => COMPLETED_STATUSES.includes(b.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // A successful day = at least one completed job with:
  // - No no-show, no cleaner cancellation, no dispute, on-time arrival
  
  const successfulDays = new Set();
  
  completedBookings.forEach(b => {
    const isSuccessful = 
      b.status !== 'disputed' &&
      b.cancelled_by !== 'cleaner' &&
      b.check_in_time; // Has check-in (implies attendance)
    
    if (isSuccessful) {
      successfulDays.add(b.date);
    }
  });

  // Calculate current streak (from today backwards)
  const sortedDays = Array.from(successfulDays).sort().reverse();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current streak from today
  for (let i = 0; i < sortedDays.length; i++) {
    const dayDate = new Date(sortedDays[i]);
    const daysDiff = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Best streak (all time)
  const allSortedDays = Array.from(successfulDays).sort();
  for (let i = 0; i < allSortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allSortedDays[i - 1]);
      const currDate = new Date(allSortedDays[i]);
      const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  return {
    current: currentStreak,
    best: bestStreak
  };
}

/**
 * Check and create milestones
 */
export async function checkMilestones(cleanerEmail, metrics, reliabilityScore) {
  const { total_jobs, photo_proof_rate, dispute_rate, current_streak_days } = metrics;

  // Fetch existing milestones
  const existingMilestones = await base44.entities.CleanerMilestone.filter({
    cleaner_email: cleanerEmail
  });

  const existingTypes = new Set(existingMilestones.map(m => m.milestone_type));

  const newMilestones = [];

  // First 10 jobs
  if (total_jobs >= 10 && !existingTypes.has('first_10_jobs')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'first_10_jobs',
      reward_type: 'profile_boost',
      reward_value: '10',
      earned_date: new Date().toISOString()
    });
  }

  // First 50 jobs
  if (total_jobs >= 50 && !existingTypes.has('first_50_jobs')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'first_50_jobs',
      reward_type: 'bonus_payout',
      reward_value: '2',
      earned_date: new Date().toISOString()
    });
  }

  // First 100 jobs
  if (total_jobs >= 100 && !existingTypes.has('first_100_jobs')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'first_100_jobs',
      reward_type: 'bonus_payout',
      reward_value: '5',
      earned_date: new Date().toISOString()
    });
  }

  // Perfect month (30-day streak)
  if (current_streak_days >= 30 && !existingTypes.has('perfect_month')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'perfect_month',
      reward_type: 'instant_book_enabled',
      reward_value: 'true',
      earned_date: new Date().toISOString()
    });
  }

  // Reliability Elite (≥ 90 for 30 days)
  if (reliabilityScore >= 90 && !existingTypes.has('reliability_elite')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'reliability_elite',
      reward_type: 'profile_boost',
      reward_value: '50',
      earned_date: new Date().toISOString()
    });
  }

  // Zero-dispute month
  if (dispute_rate === 0 && total_jobs >= 5 && !existingTypes.has('zero_dispute_month')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'zero_dispute_month',
      reward_type: 'bonus_payout',
      reward_value: '1',
      earned_date: new Date().toISOString()
    });
  }

  // 100% photo compliance month
  if (photo_proof_rate === 100 && total_jobs >= 5 && !existingTypes.has('photo_compliance_perfect')) {
    newMilestones.push({
      cleaner_email: cleanerEmail,
      milestone_type: 'photo_compliance_perfect',
      reward_type: 'profile_boost',
      reward_value: '20',
      earned_date: new Date().toISOString()
    });
  }

  return newMilestones;
}

/**
 * Format reliability display
 */
export function getReliabilityDisplay(reliabilityScore) {
  if (reliabilityScore >= 90) {
    return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  } else if (reliabilityScore >= 80) {
    return { label: 'Great', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  } else if (reliabilityScore >= 70) {
    return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  } else {
    return { label: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  }
}

/**
 * Get tier display info
 */
export function getTierDisplay(tier) {
  const displays = {
    'Elite': { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '👑' },
    'Pro': { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '⭐' },
    'Semi Pro': { color: 'text-green-600', bgColor: 'bg-green-100', icon: '✓' },
    'Developing': { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🌱' }
  };
  
  return displays[tier] || displays['Developing'];
}