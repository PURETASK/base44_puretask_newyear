/**
 * Dynamic pricing calculator
 */

export function calculateDynamicPrice(basePrice, options = {}) {
  let finalPrice = basePrice;
  const multipliers = [];
  
  // Distance multiplier (if cleaner is far away)
  if (options.distance) {
    if (options.distance > 20) {
      finalPrice *= 1.2; // 20% increase for 20+ miles
      multipliers.push({ reason: 'Distance (20+ miles)', multiplier: 1.2 });
    } else if (options.distance > 10) {
      finalPrice *= 1.1; // 10% increase for 10-20 miles
      multipliers.push({ reason: 'Distance (10-20 miles)', multiplier: 1.1 });
    }
  }
  
  // Time of day multiplier
  if (options.startTime) {
    const hour = parseInt(options.startTime.split(':')[0]);
    if (hour >= 18 || hour <= 7) {
      finalPrice *= 1.15; // 15% premium for evening/early morning
      multipliers.push({ reason: 'Evening/Early morning', multiplier: 1.15 });
    }
  }
  
  // Weekend multiplier
  if (options.isWeekend) {
    finalPrice *= 1.1; // 10% premium for weekends
    multipliers.push({ reason: 'Weekend booking', multiplier: 1.1 });
  }
  
  // Tier multiplier
  if (options.cleanerTier) {
    if (options.cleanerTier === 'Elite') {
      finalPrice *= 1.2; // Elite cleaners charge 20% more
      multipliers.push({ reason: 'Elite cleaner', multiplier: 1.2 });
    } else if (options.cleanerTier === 'Pro') {
      finalPrice *= 1.1; // Pro cleaners charge 10% more
      multipliers.push({ reason: 'Pro cleaner', multiplier: 1.1 });
    }
  }
  
  // Holiday surge pricing
  if (options.isHoliday) {
    finalPrice *= 1.3; // 30% surge on holidays
    multipliers.push({ reason: 'Holiday surge', multiplier: 1.3 });
  }
  
  // Same-day booking (emergency)
  if (options.isSameDay) {
    finalPrice *= 1.5; // 50% premium for same-day
    multipliers.push({ reason: 'Same-day booking', multiplier: 1.5 });
  }
  
  return {
    originalPrice: basePrice,
    finalPrice: Math.round(finalPrice * 100) / 100,
    multipliers
  };
}

export function calculatePlatformFee(totalPrice, cleanerTier = 'Basic') {
  // Premium cleaners pay lower fees
  const feeRate = {
    'Elite': 0.10,  // 10% for Elite
    'Pro': 0.12,    // 12% for Pro  
    'Basic': 0.15   // 15% for Basic
  }[cleanerTier] || 0.15;
  
  return {
    fee: totalPrice * feeRate,
    cleanerPayout: totalPrice * (1 - feeRate),
    feeRate: feeRate * 100
  };
}