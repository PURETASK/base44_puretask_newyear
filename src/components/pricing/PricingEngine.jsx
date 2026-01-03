/**
 * MODULE 4 - Pricing Engine
 * Calculates job pricing with all discounts and multipliers
 */

import { base44 } from '@/api/base44Client';

// Policy configuration
export const CREDITS_PER_USD = 10;

// Tier multipliers
const TIER_MULTIPLIERS = {
  'Developing': 0.90,
  'Semi Pro': 1.00,
  'Pro': 1.10,
  'Elite': 1.20
};

// Recurring discount percentages
const RECURRING_DISCOUNTS = {
  'weekly': 15,
  'biweekly': 10,
  'monthly': 5
};

/**
 * Main pricing pipeline - Steps 1-9 from Module 4 spec
 */
export async function calculateBookingPrice(bookingData) {
  const {
    client_email,
    cleaner_email,
    cleaning_type = 'basic',
    estimated_hours,
    hours,
    additional_services = {},
    date,
    start_time,
    recurring_booking_id,
    recurrence_frequency = 'none',
    latitude,
    longitude
  } = bookingData;

  // STEP 1: Load context
  const cleanerProfile = await base44.entities.CleanerProfile.filter({
    user_email: cleaner_email
  });

  if (cleanerProfile.length === 0) {
    throw new Error('Cleaner profile not found');
  }

  const cleaner = cleanerProfile[0];

  const clientProfile = await base44.entities.ClientProfile.filter({
    user_email: client_email
  });

  const client = clientProfile.length > 0 ? clientProfile[0] : null;

  const clientMembership = await base44.entities.ClientMembership.filter({
    client_email: client_email,
    status: 'active'
  });

  const membership = clientMembership.length > 0 ? clientMembership[0] : null;

  const jobHours = estimated_hours || hours;

  // STEP 2: Base hourly rate per cleaning type
  const baseRate = cleaner.base_rate_credits_per_hour || 300;
  const deepAddon = cleaner.deep_addon_credits_per_hour || 50;
  const moveoutAddon = cleaner.moveout_addon_credits_per_hour || 50;

  let coreRateCPH = baseRate;
  let selectedAddon = 0;

  if (cleaning_type === 'deep') {
    coreRateCPH = baseRate + deepAddon;
    selectedAddon = deepAddon;
  } else if (cleaning_type === 'moveout') {
    coreRateCPH = baseRate + moveoutAddon;
    selectedAddon = moveoutAddon;
  }

  const baseHoursCredits = coreRateCPH * jobHours;

  // STEP 3: Additional services pricing
  const additionalServicePricing = cleaner.additional_service_pricing || {};
  let totalExtrasCredits = 0;

  const services = ['windows', 'blinds', 'oven', 'refrigerator', 'light_fixtures', 'inside_cabinets', 'baseboards', 'laundry'];
  
  services.forEach(service => {
    const count = additional_services[service] || 0;
    const price = additionalServicePricing[service] || 0;
    totalExtrasCredits += count * price;
  });

  const basePriceCredits = baseHoursCredits + totalExtrasCredits;

  // STEP 4: Tier multiplier
  const tierMultiplier = TIER_MULTIPLIERS[cleaner.tier] || 1.0;
  const priceAfterTier = basePriceCredits * tierMultiplier;

  // STEP 5: Dynamic PricingRules
  const { dynamicMultiplier, appliedRuleLabels } = await evaluatePricingRules(
    bookingData,
    client,
    cleaner
  );

  const priceAfterPRRules = priceAfterTier * dynamicMultiplier;

  // STEP 6: Membership discount
  let membershipDiscountPct = 0;
  let membershipDiscountCredits = 0;
  let priceAfterMembership = priceAfterPRRules;

  if (membership && membership.benefits?.discount_percentage) {
    membershipDiscountPct = membership.benefits.discount_percentage;
    membershipDiscountCredits = priceAfterPRRules * (membershipDiscountPct / 100);
    priceAfterMembership = priceAfterPRRules - membershipDiscountCredits;

    appliedRuleLabels.push(`${membership.tier} Member - ${membershipDiscountPct}% Off`);
  }

  // STEP 7: Recurring booking discount
  let recurrenceDiscountPct = 0;
  let recurrenceDiscountCredits = 0;
  let priceAfterRecurrence = priceAfterMembership;

  if (recurrence_frequency !== 'none' && RECURRING_DISCOUNTS[recurrence_frequency]) {
    recurrenceDiscountPct = RECURRING_DISCOUNTS[recurrence_frequency];
    recurrenceDiscountCredits = priceAfterMembership * (recurrenceDiscountPct / 100);
    priceAfterRecurrence = priceAfterMembership - recurrenceDiscountCredits;

    appliedRuleLabels.push(`${recurrence_frequency} Service - ${recurrenceDiscountPct}% Off`);
  }

  // STEP 8: BundleOffers
  const { bundleDiscountCredits, bundleLabels } = await evaluateBundleOffers(
    bookingData,
    priceAfterRecurrence,
    totalExtrasCredits
  );

  appliedRuleLabels.push(...bundleLabels);

  const priceAfterBundles = Math.max(0, priceAfterRecurrence - bundleDiscountCredits);

  // STEP 9: Final price & snapshots
  const finalEstimatedCredits = Math.round(priceAfterBundles);
  const finalEstimatedUSD = finalEstimatedCredits / CREDITS_PER_USD;

  const pricingBreakdown = {
    base_hours_credits: Math.round(baseHoursCredits),
    extras_credits: Math.round(totalExtrasCredits),
    tier_multiplier: tierMultiplier,
    dynamic_multiplier: dynamicMultiplier,
    membership_discount_credits: Math.round(membershipDiscountCredits),
    recurrence_discount_credits: Math.round(recurrenceDiscountCredits),
    bundle_discount_credits: Math.round(bundleDiscountCredits),
    final_estimated_credits: finalEstimatedCredits
  };

  return {
    estimated_price_credits: finalEstimatedCredits,
    estimated_price_usd: finalEstimatedUSD,
    applied_pricing_labels: appliedRuleLabels,
    pricing_breakdown: pricingBreakdown,
    
    // Snapshot fields
    snapshot_base_rate_cph: baseRate,
    snapshot_deep_addon_cph: deepAddon,
    snapshot_moveout_addon_cph: moveoutAddon,
    snapshot_selected_addon_cph: selectedAddon,
    snapshot_total_rate_cph: coreRateCPH,
    snapshot_additional_service_prices: additionalServicePricing,
    snapshot_membership_discount_pct: membershipDiscountPct,
    snapshot_dynamic_pricing_multiplier: dynamicMultiplier,
    snapshot_tier_multiplier: tierMultiplier,
    
    additional_services_cost_credits: totalExtrasCredits,
    payout_percentage_at_accept: cleaner.payout_percentage || 0.8
  };
}

/**
 * Evaluate all active pricing rules and return combined multiplier
 */
async function evaluatePricingRules(bookingData, client, cleaner) {
  const allRules = await base44.entities.PricingRule.filter({
    is_active: true
  });

  const matchedRules = [];

  for (const rule of allRules) {
    if (await evaluateRuleConditions(rule, bookingData, client, cleaner)) {
      matchedRules.push(rule);
    }
  }

  // Group by rule_type and pick highest priority per type
  const rulesByType = {};
  matchedRules.forEach(rule => {
    const type = rule.rule_type;
    if (!rulesByType[type] || rule.priority > rulesByType[type].priority) {
      rulesByType[type] = rule;
    }
  });

  // Apply multipliers
  let dynamicMultiplier = 1.0;
  const appliedLabels = [];

  Object.values(rulesByType).forEach(rule => {
    dynamicMultiplier *= rule.multiplier || 1.0;
    if (rule.display_label) {
      appliedLabels.push(rule.display_label);
    }
  });

  return { dynamicMultiplier, appliedRuleLabels: appliedLabels };
}

/**
 * Evaluate a single rule's conditions
 */
async function evaluateRuleConditions(rule, bookingData, client, cleaner) {
  const conditions = rule.conditions || {};
  const { date, start_time, latitude, longitude } = bookingData;

  // time_of_day
  if (rule.rule_type === 'time_of_day') {
    const bookingHour = parseInt(start_time?.split(':')[0] || '0');
    const startHour = conditions.start_hour || 0;
    const endHour = conditions.end_hour || 23;
    if (bookingHour < startHour || bookingHour > endHour) {
      return false;
    }
  }

  // day_of_week
  if (rule.rule_type === 'day_of_week') {
    const bookingDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bookingDay = dayNames[bookingDate.getDay()];
    if (conditions.days && !conditions.days.includes(bookingDay)) {
      return false;
    }
  }

  // distance
  if (rule.rule_type === 'distance') {
    // Simple distance check (would need actual calculation in production)
    const distance = bookingData.distance_miles || 0;
    if (conditions.min_distance && distance < conditions.min_distance) return false;
    if (conditions.max_distance && distance > conditions.max_distance) return false;
  }

  // last_minute
  if (rule.rule_type === 'last_minute') {
    const bookingDateTime = new Date(`${date}T${start_time}`);
    const hoursUntilStart = (bookingDateTime - new Date()) / (1000 * 60 * 60);
    const maxHours = conditions.max_hours_before_start || 24;
    if (hoursUntilStart > maxHours) {
      return false;
    }
  }

  // holiday
  if (rule.rule_type === 'holiday') {
    const holidayList = conditions.holiday_list || [];
    if (!holidayList.includes(date)) {
      return false;
    }
  }

  // first_booking_discount
  if (rule.rule_type === 'first_booking_discount') {
    if (!client || (client.total_bookings || 0) > 0) {
      return false;
    }
  }

  // surge (would check demand levels in production)
  if (rule.rule_type === 'surge') {
    // Placeholder - in production would check booking density
  }

  return true;
}

/**
 * Evaluate bundle offers
 */
async function evaluateBundleOffers(bookingData, currentPriceCredits, totalExtrasCredits) {
  const allBundles = await base44.entities.BundleOffer.filter({
    is_active: true
  });

  let totalBundleDiscount = 0;
  const bundleLabels = [];

  for (const bundle of allBundles) {
    if (await evaluateBundleConditions(bundle, bookingData)) {
      let thisDiscount = 0;

      if (bundle.discount_percentage) {
        // Determine base to apply percentage on
        const targetBase = bundle.offer_type === 'multi_service' 
          ? totalExtrasCredits 
          : currentPriceCredits;
        thisDiscount = targetBase * (bundle.discount_percentage / 100);
      }

      if (bundle.discount_amount) {
        // Convert USD to credits
        thisDiscount += bundle.discount_amount * CREDITS_PER_USD;
      }

      totalBundleDiscount += thisDiscount;

      if (bundle.display_message) {
        bundleLabels.push(bundle.display_message);
      }
    }
  }

  return {
    bundleDiscountCredits: totalBundleDiscount,
    bundleLabels
  };
}

/**
 * Evaluate bundle conditions
 */
async function evaluateBundleConditions(bundle, bookingData) {
  const conditions = bundle.conditions || {};
  const { additional_services = {}, cleaning_type } = bookingData;

  // multi_service: check if multiple additional services selected
  if (bundle.offer_type === 'multi_service') {
    const selectedServices = Object.values(additional_services).filter(count => count > 0);
    const minServices = conditions.min_services || 2;
    if (selectedServices.length < minServices) {
      return false;
    }
  }

  // upgrade_upsell: check if upgrading to deep or moveout
  if (bundle.offer_type === 'upgrade_upsell') {
    const requiredType = conditions.required_cleaning_type;
    if (requiredType && cleaning_type !== requiredType) {
      return false;
    }
  }

  // multi_booking: would check cart size in production
  if (bundle.offer_type === 'multi_booking') {
    // Placeholder - would need cart context
  }

  return true;
}

/**
 * Format pricing for display
 */
export function formatPricingDisplay(pricingResult) {
  const { pricing_breakdown, applied_pricing_labels } = pricingResult;

  if (!pricing_breakdown) {
    return {
      total: `$${pricingResult.estimated_price_usd?.toFixed(2) || '0.00'}`,
      items: []
    };
  }

  const items = [];

  // Base cleaning
  items.push({
    label: 'Base Cleaning',
    amount: pricing_breakdown.base_hours_credits,
    isPositive: false
  });

  // Additional services
  if (pricing_breakdown.extras_credits > 0) {
    items.push({
      label: 'Additional Services',
      amount: pricing_breakdown.extras_credits,
      isPositive: false
    });
  }

  // Tier adjustment
  if (pricing_breakdown.tier_multiplier !== 1.0) {
    const tierLabel = pricing_breakdown.tier_multiplier > 1.0 ? 'Premium Tier' : 'New Cleaner';
    items.push({
      label: tierLabel,
      amount: (pricing_breakdown.base_hours_credits + pricing_breakdown.extras_credits) * 
             (pricing_breakdown.tier_multiplier - 1.0),
      isPositive: pricing_breakdown.tier_multiplier < 1.0
    });
  }

  // Dynamic pricing
  if (pricing_breakdown.dynamic_multiplier !== 1.0) {
    items.push({
      label: 'Time/Day Adjustment',
      amount: 'varies',
      isPositive: pricing_breakdown.dynamic_multiplier < 1.0
    });
  }

  // Membership discount
  if (pricing_breakdown.membership_discount_credits > 0) {
    items.push({
      label: 'Membership Discount',
      amount: pricing_breakdown.membership_discount_credits,
      isPositive: true
    });
  }

  // Recurring discount
  if (pricing_breakdown.recurrence_discount_credits > 0) {
    items.push({
      label: 'Recurring Service Discount',
      amount: pricing_breakdown.recurrence_discount_credits,
      isPositive: true
    });
  }

  // Bundle discount
  if (pricing_breakdown.bundle_discount_credits > 0) {
    items.push({
      label: 'Bundle Savings',
      amount: pricing_breakdown.bundle_discount_credits,
      isPositive: true
    });
  }

  return {
    total: `$${pricingResult.estimated_price_usd?.toFixed(2) || '0.00'}`,
    totalCredits: pricing_breakdown.final_estimated_credits,
    items,
    labels: applied_pricing_labels || []
  };
}