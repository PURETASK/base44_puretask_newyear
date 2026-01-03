import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * Generate a unique referral code for a user
 */
export async function generateReferralCode(userEmail) {
  // Create short, memorable code from user email + random chars
  const emailPart = userEmail.split('@')[0].toUpperCase().substring(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${emailPart}${randomPart}`;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry
  
  await base44.entities.Referral.create({
    referrer_email: userEmail,
    referral_code: code,
    status: 'pending',
    expires_at: expiresAt.toISOString()
  });
  
  return code;
}

/**
 * Apply a referral code to a new user signup
 */
export async function applyReferralCode(code, newUserEmail) {
  const referrals = await base44.entities.Referral.filter({
    referral_code: code,
    status: 'pending'
  });
  
  if (referrals.length === 0) {
    throw new Error('Invalid or expired referral code');
  }
  
  const referral = referrals[0];
  
  // Check if expired
  if (new Date(referral.expires_at) < new Date()) {
    await base44.entities.Referral.update(referral.id, { status: 'expired' });
    throw new Error('Referral code has expired');
  }
  
  // Can't refer yourself
  if (referral.referrer_email === newUserEmail) {
    throw new Error('You cannot use your own referral code');
  }
  
  // Update referral with referee info
  await base44.entities.Referral.update(referral.id, {
    referee_email: newUserEmail
  });
  
  return referral;
}

/**
 * Issue rewards to both referrer and referee after first booking
 */
export async function issueReferralRewards(referralId, bookingId) {
  try {
    const referral = await base44.entities.Referral.get(referralId);
    
    // Issue credit to referee (person who signed up)
    await base44.entities.Credit.create({
      client_email: referral.referee_email,
      amount: referral.referee_reward_amount,
      reason: 'promotion',
      booking_id: bookingId,
      used: false
    });
    
    // Update their profile balance
    const [refereeProfile] = await base44.entities.ClientProfile.filter({
      user_email: referral.referee_email
    });
    if (refereeProfile) {
      await base44.entities.ClientProfile.update(refereeProfile.id, {
        credits_balance: (refereeProfile.credits_balance || 0) + referral.referee_reward_amount
      });
    }
    
    // Issue credit to referrer (person who referred)
    await base44.entities.Credit.create({
      client_email: referral.referrer_email,
      amount: referral.referrer_reward_amount,
      reason: 'promotion',
      booking_id: bookingId,
      used: false
    });
    
    const [referrerProfile] = await base44.entities.ClientProfile.filter({
      user_email: referral.referrer_email
    });
    if (referrerProfile) {
      await base44.entities.ClientProfile.update(referrerProfile.id, {
        credits_balance: (referrerProfile.credits_balance || 0) + referral.referrer_reward_amount
      });
    }
    
    // Mark rewards as issued
    await base44.entities.Referral.update(referralId, {
      status: 'completed',
      referrer_reward_issued: true,
      referee_reward_issued: true,
      referee_first_booking_id: bookingId
    });
    
    // Send notification emails
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: referral.referrer_email,
      subject: '🎉 You earned $20 credit!',
      body: `Great news! Your friend just completed their first booking with PureTask.

You've earned $20 in credits that you can use on your next cleaning!

Keep sharing your referral code to earn more. For every friend who books, you both get $20.

View your credits: ${baseUrl}${createPageUrl('Profile')}

Happy cleaning!
The PureTask Team`
    });
    
    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: referral.referee_email,
      subject: '🎉 Welcome to PureTask! Here\'s your $20 credit',
      body: `Thanks for booking your first cleaning with PureTask!

Your $20 referral credit has been added to your account and will be automatically applied to your next booking.

Want to earn more? Refer your friends and you'll both get $20!

View your credits: ${baseUrl}${createPageUrl('Profile')}

Happy cleaning!
The PureTask Team`
    });
    
    console.log(`✅ Issued referral rewards for ${referral.referee_email}`);
    return { success: true };
  } catch (error) {
    console.error('Error issuing referral rewards:', error);
    return { success: false, error: error.message };
  }
}