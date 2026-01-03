/**
 * Credit System Configuration
 * Central configuration for all credit-related settings
 */

export const CREDIT_CONFIG = {
  // Core conversion rate
  CREDITS_PER_USD: 1, // 1 credit = $1 USD
  
  // Payout rates
  PAYOUT_RATE_STANDARD: 0.80, // Bronze, Silver, Gold (20% platform fee)
  PAYOUT_RATE_PLATINUM: 0.85, // Platinum/Elite (15% platform fee)
  
  // Time granularity
  TIME_GRANULARITY: 0.25, // Round to 15-minute increments
  
  // Auto-approval window
  AUTO_APPROVE_HOURS: 24, // Auto-approve after 24 hours
  
  // Escrow buffer
  ESCROW_BUFFER_PERCENTAGE: 0.25, // Hold 25% extra for time overruns
  
  // Credit packages (with bonuses)
  PACKAGES: [
    { usd: 50, credits: 50, bonus: 0, popular: false },
    { usd: 100, credits: 100, bonus: 5, popular: true, label: 'Most Popular' },
    { usd: 200, credits: 200, bonus: 15, popular: false },
    { usd: 500, credits: 500, bonus: 50, popular: false, label: 'Best Value' }
  ],
  
  // Tier mappings
  TIER_MAP: {
    'Developing': 'bronze',
    'Semi Pro': 'silver',
    'Pro': 'gold',
    'Elite': 'platinum'
  },
  
  // Base rate ranges (credits per hour)
  TIER_BASE_RANGES: {
    'bronze': { min: 150, max: 220 },
    'silver': { min: 220, max: 300 },
    'gold': { min: 300, max: 380 },
    'platinum': { min: 380, max: 450 }
  },
  
  // Add-on ranges (credits per hour)
  ADDON_RANGES: {
    'bronze': { min: 20, max: 50 },
    'silver': { min: 20, max: 50 },
    'gold': { min: 30, max: 50 },
    'platinum': { min: 30, max: 50 }
  },
  
  // Cancellation policy
  CANCELLATION_POLICY: {
    HOURS_BEFORE_CUTOFF: 24,
    FEE_CREDITS: (estimatedHours, ratePerHour) => Math.round(1 * ratePerHour), // 1 hour charge
    GRACE_CANCELLATIONS: 2 // First 2 cancellations are free
  },
  
  // Credit display
  DISPLAY: {
    ROUND_TO_NEAREST: 10, // Round displayed credits to nearest 10
    SHOW_USD_EQUIVALENT: true,
    CREDIT_LABEL: 'credits',
    CREDIT_SYMBOL: '⭐' // Optional icon
  }
};

export default CREDIT_CONFIG;