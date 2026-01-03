import { base44 } from '@/api/base44Client';

// LOYALTY TIER THRESHOLDS
export const LOYALTY_TIERS = {
  Bronze: { min: 0, max: 499, benefits: ['5% discount on 5th booking', 'Birthday reward'] },
  Silver: { min: 500, max: 1499, benefits: ['10% discount on every 5th booking', 'Free add-on service', 'Priority support'] },
  Gold: { min: 1500, max: 2999, benefits: ['15% discount on every 5th booking', '2 free add-ons per month', 'Priority booking', 'Early access to new cleaners'] },
  Platinum: { min: 3000, max: Infinity, benefits: ['20% off all bookings', 'Free add-on every booking', 'VIP priority', 'Dedicated account manager', 'Exclusive perks'] }
};

// REWARDS CATALOG
export const REWARDS_CATALOG = [
  {
    id: 'discount_10',
    name: '10% Off Next Booking',
    description: 'Get 10% off your next cleaning service',
    points_cost: 100,
    discount_percentage: 10,
    expires_days: 30
  },
  {
    id: 'discount_15',
    name: '15% Off Next Booking',
    description: 'Get 15% off your next cleaning service',
    points_cost: 200,
    discount_percentage: 15,
    expires_days: 30
  },
  {
    id: 'discount_20',
    name: '20% Off Next Booking',
    description: 'Get 20% off your next cleaning service',
    points_cost: 350,
    discount_percentage: 20,
    expires_days: 30
  },
  {
    id: 'free_addon',
    name: 'Free Add-On Service',
    description: 'Get a free add-on service (windows, oven, fridge, etc.)',
    points_cost: 150,
    expires_days: 60
  },
  {
    id: 'priority_booking',
    name: 'Priority Booking Pass',
    description: 'Jump to the front of the booking queue for 7 days',
    points_cost: 250,
    expires_days: 7
  },
  {
    id: 'early_access',
    name: 'Early Access to New Cleaners',
    description: 'Book with new Elite cleaners before general availability',
    points_cost: 300,
    expires_days: 14
  }
];

// POINTS EARNING RULES
export const POINTS_RULES = {
  booking_completed: 100, // Per booking
  first_booking_bonus: 50,
  referral_bonus: 200,
  review_submitted: 25,
  birthday_bonus: 100,
  subscription_monthly: 50
};

// Calculate tier based on total points
export const calculateTier = (totalPoints) => {
  if (totalPoints >= LOYALTY_TIERS.Platinum.min) return 'Platinum';
  if (totalPoints >= LOYALTY_TIERS.Gold.min) return 'Gold';
  if (totalPoints >= LOYALTY_TIERS.Silver.min) return 'Silver';
  return 'Bronze';
};

// Get points to next tier
export const getPointsToNextTier = (totalPoints, currentTier) => {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return 0; // Already at max tier
  
  const nextTier = tiers[currentIndex + 1];
  return LOYALTY_TIERS[nextTier].min - totalPoints;
};

// Award points to client
export const awardPoints = async (clientEmail, points, reason) => {
  try {
    const profiles = await base44.entities.ClientProfile.filter({ user_email: clientEmail });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const newTotalPoints = (profile.total_points_earned || 0) + points;
    const newCurrentPoints = (profile.loyalty_points || 0) + points;
    const newTier = calculateTier(newTotalPoints);
    const tierChanged = newTier !== profile.loyalty_tier;
    
    await base44.entities.ClientProfile.update(profile.id, {
      loyalty_points: newCurrentPoints,
      total_points_earned: newTotalPoints,
      loyalty_tier: newTier,
      points_to_next_tier: getPointsToNextTier(newTotalPoints, newTier),
      ...(tierChanged && { loyalty_tier_updated_at: new Date().toISOString() })
    });
    
    // Send notification
    await base44.entities.Notification.create({
      recipient_email: clientEmail,
      type: 'loyalty_points_earned',
      title: `+${points} Loyalty Points!`,
      message: `You earned ${points} points for ${reason}. Total: ${newCurrentPoints} points`,
      link: '/Profile',
      is_read: false
    });
    
    // If tier changed, send special notification
    if (tierChanged) {
      await base44.entities.Notification.create({
        recipient_email: clientEmail,
        type: 'loyalty_tier_upgraded',
        title: `🎉 Upgraded to ${newTier} Tier!`,
        message: `Congratulations! You've reached ${newTier} tier. Enjoy your new benefits!`,
        link: '/LoyaltyDashboard',
        is_read: false,
        priority: 'high'
      });
    }
    
    return { success: true, newPoints: newCurrentPoints, newTier, tierChanged };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, error };
  }
};

// Redeem reward
export const redeemReward = async (clientEmail, rewardId) => {
  try {
    const reward = REWARDS_CATALOG.find(r => r.id === rewardId);
    if (!reward) throw new Error('Reward not found');
    
    const profiles = await base44.entities.ClientProfile.filter({ user_email: clientEmail });
    if (profiles.length === 0) throw new Error('Profile not found');
    
    const profile = profiles[0];
    if ((profile.loyalty_points || 0) < reward.points_cost) {
      throw new Error('Insufficient points');
    }
    
    // Deduct points
    await base44.entities.ClientProfile.update(profile.id, {
      loyalty_points: profile.loyalty_points - reward.points_cost
    });
    
    // Create reward record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.expires_days);
    
    const rewardRecord = await base44.entities.LoyaltyReward.create({
      client_email: clientEmail,
      reward_type: rewardId,
      points_cost: reward.points_cost,
      status: 'available',
      expires_at: expiresAt.toISOString(),
      discount_percentage: reward.discount_percentage,
      reward_name: reward.name,
      reward_description: reward.description
    });
    
    // Send notification
    await base44.entities.Notification.create({
      recipient_email: clientEmail,
      type: 'loyalty_reward_redeemed',
      title: '🎁 Reward Redeemed!',
      message: `${reward.name} - Use within ${reward.expires_days} days`,
      link: '/LoyaltyDashboard',
      is_read: false
    });
    
    return { success: true, reward: rewardRecord };
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return { success: false, error: error.message };
  }
};