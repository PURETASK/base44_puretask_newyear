import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { convertTo12Hour } from '../utils/timeUtils';

export async function sendCleanerOpenedRequestNotification(booking, clientUser, cleanerUser) {
  if (!clientUser.sms_consent && !clientUser.email) return;
  
  try {
    await base44.integrations.Core.SendEmail({
      to: clientUser.email,
      subject: `🎉 ${cleanerUser.full_name} is reviewing your request!`,
      body: `Great news, ${clientUser.full_name}!

${cleanerUser.full_name} just opened your cleaning request and is reviewing the details.

Most cleaners respond within 30 minutes. We'll notify you as soon as they accept!

📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
⏰ Time: ${convertTo12Hour(booking.start_time)}
📍 Address: ${booking.address}

In the meantime, you can message them directly if you have any questions or special requests.

View booking status: ${window.location.origin}${createPageUrl('ClientDashboard')}

Best regards,
The PureTask Team`
    });

    console.log('Sent cleaner opened notification');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function sendTimeReminderNotification(booking, clientUser, cleanerUser, hoursRemaining) {
  if (!clientUser.sms_consent && !clientUser.email) return;
  
  try {
    const backupsText = booking.fallback_cleaners && booking.fallback_cleaners.length > 0
      ? booking.fallback_cleaners.map(email => `• ${email}`).join('\n')
      : '• No backup cleaners selected';

    await base44.integrations.Core.SendEmail({
      to: clientUser.email,
      subject: `⏰ ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} left for ${cleanerUser.full_name} to respond`,
      body: `Hi ${clientUser.full_name},

Just a friendly update: ${cleanerUser.full_name} has ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} remaining to accept your cleaning request.

Don't worry if they can't make it! If ${cleanerUser.full_name} doesn't respond in time, we'll automatically send your request to your backup cleaners:

${backupsText}

Your booking is protected - you'll get confirmation one way or another!

📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
⏰ Time: ${convertTo12Hour(booking.start_time)}

View status: ${window.location.origin}${createPageUrl('ClientDashboard')}

Best regards,
The PureTask Team`
    });

    console.log(`Sent ${hoursRemaining}-hour reminder notification`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function sendFallbackActivatedNotification(booking, clientUser, fallbackCleanerUser) {
  if (!clientUser.sms_consent && !clientUser.email) return;
  
  try {
    await base44.integrations.Core.SendEmail({
      to: clientUser.email,
      subject: `🔄 Your booking was sent to ${fallbackCleanerUser.full_name}`,
      body: `Hi ${clientUser.full_name},

Your original cleaner wasn't able to accept your request, but no worries - we've got you covered!

We've automatically sent your request to your backup cleaner:

👤 ${fallbackCleanerUser.full_name}
⭐ ${fallbackCleanerUser.average_rating.toFixed(1)} stars (${fallbackCleanerUser.total_reviews} reviews)
🏆 ${fallbackCleanerUser.tier} Tier
💰 $${fallbackCleanerUser.hourly_rate}/hour
✨ ${fallbackCleanerUser.reliability_score}/100 reliability score

📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
⏰ Time: ${convertTo12Hour(booking.start_time)}
📍 Address: ${booking.address}

${fallbackCleanerUser.full_name} has 4 hours to respond. We'll keep you updated!

View booking status: ${window.location.origin}${createPageUrl('ClientDashboard')}

Best regards,
The PureTask Team`
    });

    console.log('Sent fallback activated notification');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function sendBookingConfirmedNotification(booking, clientUser, cleanerUser) {
  if (!clientUser.sms_consent && !clientUser.email) return;
  
  try {
    await base44.integrations.Core.SendEmail({
      to: clientUser.email,
      subject: `✅ Your cleaning with ${cleanerUser.full_name} is confirmed!`,
      body: `Great news, ${clientUser.full_name}!

${cleanerUser.full_name} has accepted your cleaning request. Your booking is now confirmed!

📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
⏰ Time: ${convertTo12Hour(booking.start_time)}
📍 Address: ${booking.address}
⏱️ Duration: ${booking.hours} hour${booking.hours > 1 ? 's' : ''}
💰 Total: $${booking.total_price.toFixed(2)}

What happens next:
• You'll receive a reminder 24 hours before your cleaning
• ${cleanerUser.full_name} will check in when they arrive using GPS
• They'll take before/after photos for quality assurance
• After completion, you can leave a review

Need to make changes? You can reschedule or cancel anytime from your dashboard.

View full booking details: ${window.location.origin}${createPageUrl('ClientDashboard')}

Have questions? Message ${cleanerUser.full_name} directly through the app!

Best regards,
The PureTask Team`
    });

    console.log('Sent booking confirmed notification');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}