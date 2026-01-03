/**
 * Credit Calculator - Section 5
 * All credit-related calculations and conversions for the platform
 * 
 * CORE PRINCIPLE: 1 credit = $1 USD
 * This maintains consistency across the entire payment system
 * 
 * TIER SYSTEM & PRICING:
 * - Developing: 0-59 score | 15-25 credits/hr ($15-25/hr)
 * - Semi Pro: 60-74 score | 25-35 credits/hr ($25-35/hr)
 * - Pro: 75-89 score | 35-45 credits/hr ($35-45/hr)
 * - Elite: 90-100 score | 45-65 credits/hr ($45-65/hr)
 * 
 * CONFIRMED: 1 credit = $1 USD across all platform operations
 */

export const CREDITS_PER_USD = 1;

/**
 * Tier-based rate ranges (in credits per hour)
 * THESE RANGES ARE ENFORCED BY RELIABILITY SCORE
 */
export const TIER_BASE_RANGES = {
  'Developing': { min: 15, max: 25, score_min: 0, score_max: 59 },
  'Semi Pro': { min: 25, max: 35, score_min: 60, score_max: 74 },
  'Pro': { min: 35, max: 45, score_min: 75, score_max: 89 },
  'Elite': { min: 45, max: 65, score_min: 90, score_max: 100 }
};

/**
 * UPDATED: Add-on rate ranges (in credits per hour) - TIER BASED
 * Deep clean: +1-5 depending on tier
 * Move-out: +4-8 depending on tier (deep + 3)
 */
export const ADDON_RANGES = {
  deep: {
    'Developing': { min: 1, max: 2 },
    'Semi Pro': { min: 1, max: 3 },
    'Pro': { min: 1, max: 4 },
    'Elite': { min: 1, max: 5 }
  },
  moveout: {
    'Developing': { min: 4, max: 5 },
    'Semi Pro': { min: 4, max: 6 },
    'Pro': { min: 4, max: 7 },
    'Elite': { min: 4, max: 8 }
  }
};

/**
 * Get tier key from tier name (handles legacy mappings)
 */
export const getTierKey = (tier) => {
  const mapping = {
    'Developing': 'Developing',
    'Semi Pro': 'Semi Pro',
    'Pro': 'Pro',
    'Elite': 'Elite',
    // Legacy mappings
    'Bronze': 'Developing',
    'Silver': 'Semi Pro',
    'Gold': 'Pro',
    'Platinum': 'Elite'
  };
  return mapping[tier] || 'Semi Pro';
};

/**
 * Get tier from reliability score
 */
export const getTierFromScore = (score) => {
  if (score >= 90) return 'Elite';
  if (score >= 75) return 'Pro';
  if (score >= 60) return 'Semi Pro';
  return 'Developing';
};

/**
 * Validate base rate for tier
 */
export const validateBaseRate = (rate, tier) => {
  const tierKey = getTierKey(tier);
  const range = TIER_BASE_RANGES[tierKey];
  if (!range) return { valid: false, error: 'Invalid tier' };
  
  if (rate < range.min || rate > range.max) {
    return {
      valid: false,
      error: `Rate must be between ${range.min}-${range.max} credits/hr for ${tierKey} tier`
    };
  }
  
  return { valid: true };
};

/**
 * Validate add-on rate (tier-based)
 */
export const validateAddonRate = (rate, addonType, tier) => {
  const tierKey = getTierKey(tier);
  const range = ADDON_RANGES[addonType]?.[tierKey];
  if (!range) return { valid: false, error: 'Invalid add-on type or tier' };
  
  if (rate < range.min || rate > range.max) {
    return {
      valid: false,
      error: `Add-on for ${tierKey} tier must be between ${range.min}-${range.max} credits/hour`
    };
  }
  
  return { valid: true };
};

/**
 * Convert USD to credits
 */
export const usdToCredits = (usd) => {
  return Math.round(usd * CREDITS_PER_USD);
};

/**
 * Convert credits to USD
 */
export const creditsToUSD = (credits) => {
  return credits / CREDITS_PER_USD;
};

/**
 * Get selected add-on rate based on cleaning type
 */
export const getSelectedAddon = (cleaningType, deepRate, moveoutRate) => {
  if (cleaningType === 'deep') return deepRate;
  if (cleaningType === 'moveout') return moveoutRate;
  return 0; // basic
};

/**
 * Calculate total hourly rate (base + add-on)
 */
export const calculateTotalRate = (baseRate, addonRate) => {
  return baseRate + addonRate;
};

/**
 * Calculate escrow amount (estimated hours × total rate)
 */
export const calculateEscrow = (estimatedHours, totalRateCPH) => {
  return Math.round(estimatedHours * totalRateCPH);
};

/**
 * Calculate actual hours worked (rounded to 0.25h increments)
 */
export const calculateActualHours = (checkInTime, checkOutTime) => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const diffHours = (checkOut - checkIn) / (1000 * 60 * 60);
  
  // Round to nearest 0.25 (15 minutes)
  return Math.ceil(diffHours * 4) / 4;
};

/**
 * Calculate final charge and refund
 */
export const calculateFinalChargeAndRefund = (actualHours, totalRateCPH, escrowAmount) => {
  const finalCharge = Math.round(actualHours * totalRateCPH);
  const refund = Math.max(0, escrowAmount - finalCharge);
  
  return {
    finalCharge,
    refund
  };
};

/**
 * Get payout percentage based on tier
 */
export const getPayoutPercentage = (tier) => {
  const tierKey = getTierKey(tier);
  // Platinum/Elite gets 85%, all others get 80%
  if (tierKey === 'Elite') return 0.85;
  return 0.80;
};

/**
 * Calculate cleaner payout in USD
 */
export const calculateCleanerPayout = (finalChargeCredits, payoutPercentage) => {
  const usdEarned = creditsToUSD(finalChargeCredits);
  return usdEarned * payoutPercentage;
};

/**
 * Calculate platform fee (inverse of payout)
 */
export const calculatePlatformFee = (finalChargeCredits, payoutPercentage) => {
  const usdTotal = creditsToUSD(finalChargeCredits);
  const cleanerPayout = usdTotal * payoutPercentage;
  return usdTotal - cleanerPayout;
};

/**
 * Format credits for display
 */
export const formatCredits = (credits) => {
  return credits.toLocaleString();
};

/**
 * Format USD for display
 */
export const formatUSD = (usd) => {
  return `$${usd.toFixed(2)}`;
};

/**
 * Calculate booking estimate breakdown
 */
export const calculateBookingEstimate = (cleanerProfile, cleaningType, estimatedHours) => {
  const baseRate = cleanerProfile.base_rate_credits_per_hour || 25;
  const deepAddon = cleanerProfile.deep_addon_credits_per_hour || 2;
  const moveoutAddon = cleanerProfile.moveout_addon_credits_per_hour || 5;
  
  const selectedAddon = getSelectedAddon(cleaningType, deepAddon, moveoutAddon);
  const totalRate = calculateTotalRate(baseRate, selectedAddon);
  const escrow = calculateEscrow(estimatedHours, totalRate);
  
  return {
    baseRate,
    addonRate: selectedAddon,
    totalRate,
    estimatedHours,
    escrowCredits: escrow,
    escrowUSD: creditsToUSD(escrow),
    breakdown: {
      base: baseRate * estimatedHours,
      addon: selectedAddon * estimatedHours,
      total: escrow
    }
  };
};

/**
 * Validate credit balance for booking
 */
export const validateCreditBalance = (userBalance, requiredEscrow) => {
  if (userBalance < requiredEscrow) {
    return {
      sufficient: false,
      shortfall: requiredEscrow - userBalance,
      shortfallUSD: creditsToUSD(requiredEscrow - userBalance)
    };
  }
  
  return {
    sufficient: true,
    remaining: userBalance - requiredEscrow
  };
};

/**
 * Calculate recommended credit purchase
 * Suggests the best package to cover the shortfall
 */
export const recommendCreditPackage = (shortfall) => {
  const packages = [
    { credits: 50, usd: 50, bonus: 0 },
    { credits: 100, usd: 100, bonus: 5 },
    { credits: 200, usd: 200, bonus: 15 },
    { credits: 500, usd: 500, bonus: 50 }
  ];
  
  // Find smallest package that covers shortfall
  for (const pkg of packages) {
    const totalCredits = pkg.credits + pkg.bonus;
    if (totalCredits >= shortfall) {
      return pkg;
    }
  }
  
  // If shortfall is huge, recommend largest package
  return packages[packages.length - 1];
};

/**
 * Calculate tier discount (legacy - not used in current credit system)
 */
export const getTierDiscount = (tier) => {
  const discounts = {
    'Developing': 0,
    'Semi Pro': 0,
    'Pro': 0,
    'Elite': 0
  };
  return discounts[tier] || 0;
};

/**
 * Calculate promotional discount
 */
export const applyPromoCode = (baseAmount, promoCode) => {
  // Placeholder for promo code logic
  // In production, fetch from database
  const promoCodes = {
    'FIRST10': { type: 'percentage', value: 10 },
    'WELCOME50': { type: 'fixed', value: 50 },
    'SUMMER15': { type: 'percentage', value: 15 }
  };
  
  const promo = promoCodes[promoCode?.toUpperCase()];
  if (!promo) return { discount: 0, finalAmount: baseAmount };
  
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = Math.round(baseAmount * (promo.value / 100));
  } else if (promo.type === 'fixed') {
    discount = Math.min(promo.value, baseAmount);
  }
  
  return {
    discount,
    finalAmount: baseAmount - discount,
    promoApplied: promoCode
  };
};

export default {
  CREDITS_PER_USD,
  TIER_BASE_RANGES,
  ADDON_RANGES,
  getTierKey,
  getTierFromScore,
  validateBaseRate,
  validateAddonRate,
  usdToCredits,
  creditsToUSD,
  getSelectedAddon,
  calculateTotalRate,
  calculateEscrow,
  calculateActualHours,
  calculateFinalChargeAndRefund,
  getPayoutPercentage,
  calculateCleanerPayout,
  calculatePlatformFee,
  formatCredits,
  formatUSD,
  calculateBookingEstimate,
  validateCreditBalance,
  recommendCreditPackage,
  getTierDiscount,
  applyPromoCode
};