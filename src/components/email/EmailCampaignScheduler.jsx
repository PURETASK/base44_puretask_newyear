import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * Process and send scheduled email campaigns
 * Run this via cron every day
 */
export async function processEmailCampaigns() {
  console.log('📧 Starting email campaign processing...');
  
  try {
    const campaigns = await base44.entities.EmailCampaign.filter({ is_active: true });
    
    let emailsSent = 0;
    let errors = 0;
    
    for (const campaign of campaigns) {
      try {
        const result = await processCampaign(campaign);
        emailsSent += result.sent;
        errors += result.errors;
      } catch (error) {
        console.error(`Error processing campaign ${campaign.campaign_name}:`, error);
        errors++;
      }
    }
    
    console.log(`✅ Email campaign processing complete: ${emailsSent} sent, ${errors} errors`);
    
    return {
      success: true,
      emailsSent,
      errors
    };
  } catch (error) {
    console.error('❌ Critical error in email campaign processing:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processCampaign(campaign) {
  let sent = 0;
  let errors = 0;
  const now = new Date();
  
  // Find users who should receive this campaign
  let eligibleUsers = [];
  
  switch (campaign.trigger_event) {
    case 'booking_completed':
      eligibleUsers = await findUsersWithCompletedBookings();
      break;
    case 'signup_no_booking':
      eligibleUsers = await findUsersWithNoBookings();
      break;
    case 'second_booking_completed':
      eligibleUsers = await findUsersWithTwoBookings();
      break;
    case 'referred_friend':
      eligibleUsers = await findUsersWhoReferred();
      break;
  }
  
  for (const user of eligibleUsers) {
    try {
      // Check if user already received emails from this campaign
      const sentEmails = await base44.entities.EmailCampaignSent.filter({
        user_email: user.email,
        campaign_name: campaign.campaign_name
      });
      
      // Find next email to send
      const nextEmailIndex = sentEmails.length;
      
      if (nextEmailIndex >= campaign.emails.length) {
        continue; // All emails sent
      }
      
      const nextEmail = campaign.emails[nextEmailIndex];
      
      // Check if it's time to send (delay_days after trigger)
      const shouldSend = await checkIfShouldSend(user, campaign, nextEmail, sentEmails);
      
      if (shouldSend) {
        await sendCampaignEmail(user, campaign, nextEmail, nextEmailIndex);
        sent++;
      }
    } catch (error) {
      console.error(`Error sending to ${user.email}:`, error);
      errors++;
    }
  }
  
  return { sent, errors };
}

async function findUsersWithCompletedBookings() {
  const completedBookings = await base44.entities.Booking.filter({ 
    status: 'completed',
    review_submitted: false
  });
  
  const uniqueUsers = new Set();
  const users = [];
  
  for (const booking of completedBookings) {
    if (!uniqueUsers.has(booking.client_email)) {
      uniqueUsers.add(booking.client_email);
      const [userObj] = await base44.entities.User.filter({ email: booking.client_email });
      if (userObj) {
        users.push({ 
          email: booking.client_email, 
          triggerDate: booking.updated_date,
          bookingId: booking.id
        });
      }
    }
  }
  
  return users;
}

async function findUsersWithNoBookings() {
  const allUsers = await base44.entities.User.filter({ user_type: 'client' });
  const users = [];
  
  for (const user of allUsers) {
    const bookings = await base44.entities.Booking.filter({ client_email: user.email });
    
    if (bookings.length === 0) {
      const signupDate = new Date(user.created_date);
      const daysSinceSignup = (Date.now() - signupDate) / (1000 * 60 * 60 * 24);
      
      // Only target users who signed up 3+ days ago
      if (daysSinceSignup >= 3) {
        users.push({ 
          email: user.email, 
          triggerDate: user.created_date 
        });
      }
    }
  }
  
  return users;
}

async function findUsersWithTwoBookings() {
  const allBookings = await base44.entities.Booking.filter({ status: 'completed' });
  const userBookingCounts = {};
  
  for (const booking of allBookings) {
    if (!userBookingCounts[booking.client_email]) {
      userBookingCounts[booking.client_email] = [];
    }
    userBookingCounts[booking.client_email].push(booking);
  }
  
  const users = [];
  for (const [email, bookings] of Object.entries(userBookingCounts)) {
    if (bookings.length === 2) {
      users.push({ 
        email, 
        triggerDate: bookings[1].updated_date 
      });
    }
  }
  
  return users;
}

async function findUsersWhoReferred() {
  const referrals = await base44.entities.Referral.filter({ 
    status: 'completed',
    referrer_reward_issued: true
  });
  
  const users = [];
  for (const referral of referrals) {
    users.push({ 
      email: referral.referrer_email, 
      triggerDate: referral.updated_date 
    });
  }
  
  return users;
}

async function checkIfShouldSend(user, campaign, email, sentEmails) {
  const now = new Date();
  const triggerDate = new Date(user.triggerDate);
  const daysSinceTrigger = (now - triggerDate) / (1000 * 60 * 60 * 24);
  
  // Check if enough days have passed since trigger
  if (daysSinceTrigger < email.delay_days) {
    return false;
  }
  
  // Check if we already sent this specific email
  const alreadySent = sentEmails.some(s => s.email_index === sentEmails.length);
  if (alreadySent) {
    return false;
  }
  
  return true;
}

async function sendCampaignEmail(user, campaign, email, emailIndex) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://puretask.com';
  
  // Replace placeholders in email
  const personalizedBody = email.body
    .replace('{{user_email}}', user.email)
    .replace('{{cta_url}}', `${baseUrl}${email.cta_url || createPageUrl('BrowseCleaners')}`);
  
  await base44.integrations.Core.SendEmail({
    to: user.email,
    subject: email.subject,
    body: personalizedBody
  });
  
  // Record that we sent this email
  await base44.entities.EmailCampaignSent.create({
    user_email: user.email,
    campaign_name: campaign.campaign_name,
    email_index: emailIndex,
    sent_at: new Date().toISOString()
  });
  
  console.log(`✉️  Sent "${email.subject}" to ${user.email}`);
}

/**
 * Initialize default email campaigns
 * Run this once to seed the database
 */
export async function initializeDefaultCampaigns() {
  const campaigns = [
    {
      campaign_name: 'Post-Booking Follow-up',
      trigger_event: 'booking_completed',
      is_active: true,
      emails: [
        {
          delay_days: 1,
          subject: '❤️ How was your cleaning?',
          body: `Hi there!

We hope you loved your cleaning yesterday! 

Would you mind leaving a quick review for your cleaner? It helps them grow their business and helps other clients find great cleaners.

{{cta_url}}

Thank you!
The PureTask Team`,
          cta_text: 'Leave a Review',
          cta_url: '/BookingHistory'
        },
        {
          delay_days: 7,
          subject: '🧹 Ready for another cleaning?',
          body: `Hi again!

It's been a week since your last cleaning. Ready to book again?

Book the same cleaner you loved, or try someone new!

{{cta_url}}

Best,
The PureTask Team`,
          cta_text: 'Book Again',
          cta_url: '/BrowseCleaners'
        }
      ]
    },
    {
      campaign_name: 'Signup Nurture',
      trigger_event: 'signup_no_booking',
      is_active: true,
      emails: [
        {
          delay_days: 3,
          subject: '👋 Ready to book your first cleaning?',
          body: `Hi!

We noticed you signed up but haven't booked yet. 

Here's what makes PureTask different:
✅ GPS-verified check-ins
✅ Before/after photo proof
✅ Vetted, rated cleaners
✅ Flexible scheduling

Ready to get started?

{{cta_url}}

Questions? Just reply to this email!

The PureTask Team`,
          cta_text: 'Browse Cleaners',
          cta_url: '/BrowseCleaners'
        },
        {
          delay_days: 7,
          subject: '💚 Get 10% off your first booking',
          body: `Still thinking about it?

We'd love to help you experience PureTask. Here's 10% off your first cleaning!

Use code: WELCOME10

{{cta_url}}

This offer expires in 48 hours!

The PureTask Team`,
          cta_text: 'Book Now',
          cta_url: '/BrowseCleaners'
        }
      ]
    },
    {
      campaign_name: 'Subscription Upsell',
      trigger_event: 'second_booking_completed',
      is_active: true,
      emails: [
        {
          delay_days: 3,
          subject: '💰 Save 20% with a subscription',
          body: `Congratulations on your second cleaning!

Since you're a repeat customer, you might love our subscription plans:

✅ Save 20% on every cleaning
✅ Same cleaner every time
✅ Never worry about booking
✅ Pause anytime

{{cta_url}}

Worth checking out!

The PureTask Team`,
          cta_text: 'View Plans',
          cta_url: '/BrowseCleaners'
        }
      ]
    },
    {
      campaign_name: 'Referral Reminder',
      trigger_event: 'referred_friend',
      is_active: true,
      emails: [
        {
          delay_days: 14,
          subject: '🎁 You earned $20! Share again?',
          body: `Great news! Your referral just completed their first booking.

You earned $20 in credits!

Want to earn more? Share your referral link again:

{{cta_url}}

You get $20, they get $20. Win-win!

The PureTask Team`,
          cta_text: 'Get Referral Link',
          cta_url: '/Profile'
        }
      ]
    }
  ];
  
  for (const campaign of campaigns) {
    const existing = await base44.entities.EmailCampaign.filter({ 
      campaign_name: campaign.campaign_name 
    });
    
    if (existing.length === 0) {
      await base44.entities.EmailCampaign.create(campaign);
      console.log(`✅ Created campaign: ${campaign.campaign_name}`);
    }
  }
  
  console.log('✨ Email campaigns initialized');
}