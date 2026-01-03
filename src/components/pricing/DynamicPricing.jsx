import { base44 } from '@/api/base44Client';
import { DEFAULT_PRICING_RULES } from './PricingRules';

export async function calculateDynamicPrice(bookingDetails) {
  const {
    cleaner_email,
    client_email,
    date,
    start_time,
    hours,
    distance_miles = 0,
    tasks,
    task_quantities
  } = bookingDetails;

  // Get cleaner's base rate
  const [cleanerProfile] = await base44.entities.CleanerProfile.filter({
    user_email: cleaner_email
  });
  
  if (!cleanerProfile) {
    throw new Error('Cleaner profile not found');
  }
  
  let basePrice = hours * cleanerProfile.hourly_rate;
  
  // Apply new cleaner discount if applicable
  const isNewCleaner = cleanerProfile.total_jobs < 5 && cleanerProfile.is_active;
  if (isNewCleaner) {
    basePrice = basePrice * 0.85;
  }
  
  // Get pricing rules
  let pricingRules = await base44.entities.PricingRule.filter({ is_active: true });
  if (pricingRules.length === 0) {
    pricingRules = DEFAULT_PRICING_RULES.filter(r => r.is_active);
  }
  
  // Sort by priority
  pricingRules.sort((a, b) => b.priority - a.priority);
  
  // Track which multipliers apply
  const appliedMultipliers = [];
  
  // Apply each rule
  for (const rule of pricingRules) {
    const applies = await checkRuleApplies(rule, bookingDetails, client_email);
    
    if (applies) {
      appliedMultipliers.push({
        label: rule.display_label,
        multiplier: rule.multiplier,
        change: ((rule.multiplier - 1) * 100).toFixed(0)
      });
    }
  }
  
  // Calculate final multiplier (multiplicative)
  const finalMultiplier = appliedMultipliers.reduce(
    (total, m) => total * m.multiplier,
    1.0
  );
  
  // Apply extra service fees
  let extraServicesFee = 0;
  if (tasks.includes('oven') || tasks.includes('inside_oven')) {
    extraServicesFee += 30;
  }
  if (tasks.includes('refrigerator') || tasks.includes('inside_fridge')) {
    extraServicesFee += 30;
  }
  if (tasks.includes('windows')) {
    const windowCount = task_quantities?.windows || 1;
    extraServicesFee += windowCount * 6;
  }
  if (tasks.includes('deep_clean')) {
    extraServicesFee += 80;
  }
  if (tasks.includes('laundry')) {
    extraServicesFee += 20;
  }
  if (tasks.includes('interior_walls')) {
    extraServicesFee += 40;
  }
  
  const subtotal = basePrice * finalMultiplier;
  const total = subtotal + extraServicesFee;
  
  return {
    base_price: basePrice,
    final_multiplier: finalMultiplier,
    applied_multipliers: appliedMultipliers,
    extra_services_fee: extraServicesFee,
    subtotal,
    total,
    breakdown: {
      base: basePrice,
      multipliers: appliedMultipliers,
      extras: extraServicesFee,
      final: total
    }
  };
}

async function checkRuleApplies(rule, bookingDetails, clientEmail) {
  const { date, start_time, distance_miles } = bookingDetails;
  
  switch (rule.rule_type) {
    case 'day_of_week': {
      const bookingDate = new Date(date);
      const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
      return rule.conditions.days.includes(dayOfWeek);
    }
    
    case 'time_of_day': {
      const hour = parseInt(start_time.split(':')[0]);
      return hour >= rule.conditions.start_hour && hour < rule.conditions.end_hour;
    }
    
    case 'last_minute': {
      const bookingDate = new Date(date);
      const now = new Date();
      const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
      return hoursUntilBooking < rule.conditions.hours_notice;
    }
    
    case 'distance': {
      return distance_miles >= rule.conditions.min_miles;
    }
    
    case 'holiday': {
      return rule.conditions.holidays.includes(date);
    }
    
    case 'first_booking_discount': {
      const isFirst = await isFirstBooking(clientEmail);
      return isFirst;
    }
    
    default:
      return false;
  }
}

export async function isFirstBooking(clientEmail) {
  try {
    const bookings = await base44.entities.Booking.filter({
      client_email: clientEmail
    });
    return bookings.length === 0;
  } catch (error) {
    return false;
  }
}