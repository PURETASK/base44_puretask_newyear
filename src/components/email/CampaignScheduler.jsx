import { base44 } from '@/api/base44Client';
import { EMAIL_CAMPAIGNS } from './CampaignDefinitions';
import { createPageUrl } from '@/utils';

/**
 * Schedule post-booking email campaign for a completed booking
 */
export async function schedulePostBookingCampaign(bookingId) {
  try {
    const booking = await base44.entities.Booking.get(bookingId);
    
    if (booking.status !== 'completed') return;
    
    // Check if this is first booking
    const clientBookings = await base44.entities.Booking.filter({
      client_email: booking.client_email,
      status: 'completed'
    });
    
    if (clientBookings.length !== 1) return; // Only for first booking
    
    const campaign = EMAIL_CAMPAIGNS.post_first_booking;
    
    // Schedule all emails in the campaign
    for (let i = 0; i < campaign.emails.length; i++) {
      const email = campaign.emails[i];
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + email.delay_days);
      
      await base44.entities.EmailCampaignSent.create({
        user_email: booking.client_email,
        campaign_name: campaign.campaign_name,
        email_index: i,
        next_email_scheduled_for: scheduledFor.toISOString()
      });
    }
    
    console.log(`✅ Scheduled post-booking campaign for ${booking.client_email}`);
  } catch (error) {
    console.error('Error scheduling post-booking campaign:', error);
  }
}

/**
 * Schedule signup no-booking campaign for users who haven't booked
 */
export async function scheduleSignupNoBookingCampaign(userEmail) {
  try {
    const campaign = EMAIL_CAMPAIGNS.signup_no_booking;
    
    // Schedule all emails
    for (let i = 0; i < campaign.emails.length; i++) {
      const email = campaign.emails[i];
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + email.delay_days);
      
      await base44.entities.EmailCampaignSent.create({
        user_email: userEmail,
        campaign_name: campaign.campaign_name,
        email_index: i,
        next_email_scheduled_for: scheduledFor.toISOString()
      });
    }
    
    console.log(`✅ Scheduled signup no-booking campaign for ${userEmail}`);
  } catch (error) {
    console.error('Error scheduling signup campaign:', error);
  }
}

/**
 * Send all scheduled emails that are due
 * This should run daily via cron job
 */
export async function sendScheduledEmails() {
  console.log('🔄 Checking for scheduled emails to send...');
  
  try {
    const now = new Date();
    
    // Get all emails scheduled for today or earlier that haven't been sent
    const allScheduled = await base44.entities.EmailCampaignSent.list();
    
    const dueEmails = allScheduled.filter(e => 
      !e.sent_at && new Date(e.next_email_scheduled_for) <= now
    );
    
    console.log(`📧 Found ${dueEmails.length} emails to send`);
    
    let sentCount = 0;
    
    for (const scheduled of dueEmails) {
      try {
        const campaign = Object.values(EMAIL_CAMPAIGNS).find(
          c => c.campaign_name === scheduled.campaign_name
        );
        
        if (!campaign || !campaign.is_active) {
          console.log(`⏭️ Skipping inactive campaign: ${scheduled.campaign_name}`);
          continue;
        }
        
        const email = campaign.emails[scheduled.email_index];
        const [user] = await base44.entities.User.filter({ email: scheduled.user_email });
        
        if (!user) {
          console.log(`⚠️ User not found: ${scheduled.user_email}`);
          continue;
        }
        
        // Personalize email
        let body = email.body;
        let subject = email.subject;
        
        body = body.replace(/{client_name}/g, user.full_name || 'there');
        subject = subject.replace(/{client_name}/g, user.full_name || 'there');
        
        // Replace other placeholders based on campaign context
        if (scheduled.campaign_name === 'Post First Booking') {
          const [lastBooking] = await base44.entities.Booking.filter({
            client_email: scheduled.user_email,
            status: 'completed'
          }, '-created_date', 1);
          
          if (lastBooking) {
            const [cleaner] = await base44.entities.User.filter({ email: lastBooking.cleaner_email });
            body = body.replace(/{cleaner_name}/g, cleaner?.full_name || 'your cleaner');
            body = body.replace(/{booking_id}/g, lastBooking.id);
            body = body.replace(/{cleaner_email}/g, lastBooking.cleaner_email);
          }
        }
        
        // Replace link placeholders
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://puretask.com';
        body = body.replace(/{review_link}/g, `${baseUrl}${createPageUrl('Review')}`);
        body = body.replace(/{book_again_link}/g, `${baseUrl}${createPageUrl('BrowseCleaners')}`);
        body = body.replace(/{browse_cleaners_link}/g, `${baseUrl}${createPageUrl('BrowseCleaners')}`);
        body = body.replace(/{learn_more_link}/g, `${baseUrl}${createPageUrl('BrowseCleaners')}`);
        body = body.replace(/{book_now_link}/g, `${baseUrl}${createPageUrl('BrowseCleaners')}`);
        
        // Send email
        await base44.integrations.Core.SendEmail({
          from_name: 'PureTask',
          to: scheduled.user_email,
          subject: subject,
          body: body
        });
        
        // Mark as sent
        await base44.entities.EmailCampaignSent.update(scheduled.id, {
          sent_at: new Date().toISOString()
        });
        
        sentCount++;
        console.log(`✅ Sent "${email.subject}" to ${scheduled.user_email}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${scheduled.user_email}:`, error);
      }
    }
    
    console.log(`✨ Email campaign complete: ${sentCount} emails sent`);
    return { success: true, sent: sentCount };
  } catch (error) {
    console.error('❌ Critical error in email campaign:', error);
    return { success: false, error: error.message };
  }
}