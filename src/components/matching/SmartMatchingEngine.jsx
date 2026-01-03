/**
 * MODULE 5 - Smart Match Engine
 * Filters, scores, and ranks cleaners for optimal matching
 */

import { base44 } from '@/api/base44Client';

// Scoring weights
const WEIGHTS = {
  distance: 0.15,
  reliability: 0.20,
  rating: 0.10,
  tier: 0.10,
  specialty: 0.10,
  product: 0.05,
  loyalty: 0.20,
  acceptance: 0.05,
  budget: 0.05
};

// Tier scoring map
const TIER_SCORES = {
  'Developing': 0.3,
  'Semi Pro': 0.6,
  'Pro': 0.85,
  'Elite': 1.0
};

/**
 * Main SmartMatch Pipeline
 */
export async function findBestCleaners(bookingData, topN = 5) {
  const {
    client_email,
    date,
    start_time,
    estimated_hours,
    hours,
    cleaning_type,
    address,
    latitude,
    longitude,
    recurring_booking_id
  } = bookingData;

  // STEP 1: Load context
  const [allCleaners, clientProfile, matchPrefs, favorites, blocks, blockedUsers] = await Promise.all([
    base44.entities.CleanerProfile.filter({ is_active: true }),
    base44.entities.ClientProfile.filter({ user_email: client_email }).then(r => r[0] || null),
    base44.entities.SmartMatchPreference.filter({ client_email }).then(r => r[0] || null),
    base44.entities.FavoriteCleaner.filter({ client_email }),
    base44.entities.BlockedCleaner.filter({ client_email }),
    base44.entities.BlockedUser.filter({ blocker_email: client_email })
  ]);

  // Get recurring cleaner if applicable
  let recurringCleaner = null;
  if (recurring_booking_id) {
    const recurrings = await base44.entities.RecurringBooking.filter({ id: recurring_booking_id });
    if (recurrings.length > 0) {
      recurringCleaner = recurrings[0].cleaner_email;
    }
  }

  const blockedEmails = new Set([
    ...blocks.map(b => b.cleaner_email),
    ...blockedUsers.map(b => b.blocked_email)
  ]);

  // STEP 2: Apply hard filters
  const candidates = allCleaners.filter(cleaner => 
    passesHardFilters(cleaner, bookingData, blockedEmails)
  );

  if (candidates.length === 0) {
    return { primary: null, fallbacks: [], scores: [] };
  }

  // STEP 3: Compute SmartMatchScore for each
  const scoredCandidates = await Promise.all(
    candidates.map(async cleaner => {
      const score = await calculateSmartMatchScore(
        cleaner,
        bookingData,
        clientProfile,
        matchPrefs,
        favorites,
        recurringCleaner
      );
      return { cleaner, score };
    })
  );

  // STEP 4: Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // STEP 5: Select primary + fallbacks
  const topCandidates = scoredCandidates.slice(0, topN);
  const primary = topCandidates[0]?.cleaner.user_email || null;
  const fallbacks = topCandidates.slice(1).map(c => c.cleaner.user_email);

  return {
    primary,
    fallbacks,
    scores: topCandidates.map(c => ({
      email: c.cleaner.user_email,
      score: c.score,
      name: c.cleaner.full_name
    }))
  };
}

/**
 * SECTION 3: Hard Filters (all must pass)
 */
function passesHardFilters(cleaner, bookingData, blockedEmails) {
  // Filter 1: Active
  if (!cleaner.is_active) return false;

  // Filter 2: Not blocked
  if (blockedEmails.has(cleaner.user_email)) return false;

  // Filter 3: Within service area
  // TODO: Implement precise lat/lng distance check when available
  // For now: accept all (or check service_locations if we have city/zip)

  // Filter 4: Available for time window
  if (!isAvailableForBooking(cleaner, bookingData)) return false;

  // Filter 5: Offers required service
  // Basic/deep/moveout always OK for standard cleaners

  return true;
}

/**
 * Check cleaner availability
 */
function isAvailableForBooking(cleaner, bookingData) {
  if (!cleaner.availability || cleaner.availability.length === 0) {
    return true; // No availability set = assume available
  }

  const bookingDate = new Date(bookingData.date);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bookingDay = dayNames[bookingDate.getDay()];

  const dayAvailability = cleaner.availability.find(a => a.day === bookingDay);
  if (!dayAvailability || !dayAvailability.available) {
    return false;
  }

  // Check time window
  const startHour = parseInt(bookingData.start_time?.split(':')[0] || '9');
  const endHour = startHour + (bookingData.estimated_hours || bookingData.hours || 2);

  const availStart = parseInt(dayAvailability.start_time?.split(':')[0] || '0');
  const availEnd = parseInt(dayAvailability.end_time?.split(':')[0] || '23');

  return startHour >= availStart && endHour <= availEnd;
}

/**
 * SECTION 4: SmartMatch Score Calculation
 */
async function calculateSmartMatchScore(cleaner, bookingData, clientProfile, matchPrefs, favorites, recurringCleaner) {
  const scores = {
    distance: calculateDistanceScore(cleaner, bookingData, matchPrefs),
    reliability: (cleaner.reliability_score || 75) / 100,
    rating: calculateRatingScore(cleaner),
    tier: calculateTierScore(cleaner, matchPrefs),
    specialty: calculateSpecialtyScore(cleaner, clientProfile, matchPrefs),
    product: calculateProductScore(cleaner, matchPrefs),
    loyalty: calculateLoyaltyScore(cleaner, bookingData, clientProfile, favorites, recurringCleaner),
    acceptance: calculateAcceptanceScore(cleaner, bookingData),
    budget: 0.5 // Placeholder - would normalize rates within candidate set
  };

  const finalScore = 
    WEIGHTS.distance * scores.distance +
    WEIGHTS.reliability * scores.reliability +
    WEIGHTS.rating * scores.rating +
    WEIGHTS.tier * scores.tier +
    WEIGHTS.specialty * scores.specialty +
    WEIGHTS.product * scores.product +
    WEIGHTS.loyalty * scores.loyalty +
    WEIGHTS.acceptance * scores.acceptance +
    WEIGHTS.budget * scores.budget;

  return finalScore;
}

// Distance Score (0-1)
function calculateDistanceScore(cleaner, bookingData, matchPrefs) {
  // TODO: Use lat/lng when available
  // For now: zone-based approximation
  const maxDistance = matchPrefs?.max_distance_miles || 15;
  
  // Check if booking location is in cleaner's service areas
  if (cleaner.service_locations && cleaner.service_locations.length > 0) {
    // Simple match for now
    return 1.0; // Same city/zip
  }
  
  return 0.7; // Nearby region
}

// Rating Score (0-1)
function calculateRatingScore(cleaner) {
  const rating = cleaner.average_rating || 4.5;
  return Math.max(0, Math.min(1, (rating - 3) / 2));
}

// Tier Score (0-1)
function calculateTierScore(cleaner, matchPrefs) {
  let score = TIER_SCORES[cleaner.tier] || 0.6;
  
  // Bonus if preferred tier matches
  if (matchPrefs?.preferred_tier === 'Pro' && ['Pro', 'Elite'].includes(cleaner.tier)) {
    score = Math.min(1.0, score + 0.05);
  } else if (matchPrefs?.preferred_tier === 'Elite' && cleaner.tier === 'Elite') {
    score = Math.min(1.0, score + 0.1);
  }
  
  return score;
}

// Specialty Match Score (0-1)
function calculateSpecialtyScore(cleaner, clientProfile, matchPrefs) {
  const preferredSpecialties = 
    matchPrefs?.preferred_specialty_tags || 
    clientProfile?.preferred_specialty_tags || 
    [];
  
  if (preferredSpecialties.length === 0) {
    return 0.5; // No preference
  }
  
  const cleanerTags = cleaner.specialty_tags || [];
  const overlap = preferredSpecialties.filter(tag => cleanerTags.includes(tag)).length;
  
  return overlap / preferredSpecialties.length;
}

// Product Preference Score (0-1)
function calculateProductScore(cleaner, matchPrefs) {
  const preferredProduct = matchPrefs?.preferred_product_type;
  const cleanerProduct = cleaner.product_preference;
  
  if (!preferredProduct || preferredProduct === 'any') {
    return 0.7;
  }
  
  if (preferredProduct === cleanerProduct) {
    return 1.0;
  }
  
  return 0.2; // Mismatch
}

// Loyalty Score (0-1)
function calculateLoyaltyScore(cleaner, bookingData, clientProfile, favorites, recurringCleaner) {
  // Recurring booking with this cleaner
  if (recurringCleaner === cleaner.user_email) {
    return 1.0;
  }
  
  // Favorite cleaner
  if (favorites.some(f => f.cleaner_email === cleaner.user_email)) {
    return 0.9;
  }
  
  // Same cleaner preference + was last cleaner
  if (clientProfile?.last_booked_cleaner === cleaner.user_email) {
    return 0.8;
  }
  
  return 0.3; // Default
}

// Acceptance Likelihood Score (0-1)
function calculateAcceptanceScore(cleaner, bookingData) {
  if (!cleaner.typical_acceptance_rate_by_time) {
    return 0.5; // No data
  }
  
  // Build time slot key (e.g., "Mon_09-12")
  const bookingDate = new Date(bookingData.date);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = dayNames[bookingDate.getDay()];
  const hour = parseInt(bookingData.start_time?.split(':')[0] || '9');
  const timeSlot = `${Math.floor(hour / 3) * 3}-${Math.floor(hour / 3) * 3 + 3}`; // 3-hour buckets
  
  const key = `${day}_${timeSlot}`;
  const rate = cleaner.typical_acceptance_rate_by_time[key];
  
  return rate ? rate / 100 : 0.5;
}

/**
 * Check if cleaner qualifies for instant book
 */
export function isInstantBookEligible(cleaner, bookingData) {
  if (!cleaner.instant_book_enabled) return false;
  
  // Check if booking is far enough in future
  const bookingDateTime = new Date(`${bookingData.date}T${bookingData.start_time}`);
  const hoursUntilStart = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  const requiredHours = cleaner.instant_book_hours || 48;
  
  if (hoursUntilStart < requiredHours) return false;
  
  // Check reliability threshold
  const reliabilityScore = (cleaner.reliability_score || 75) / 100;
  if (reliabilityScore < 0.8) return false;
  
  return true;
}