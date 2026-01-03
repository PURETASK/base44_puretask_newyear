import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { renderEmailTemplate, renderSMSTemplate, renderPushTemplate, validateVariables } from './TemplateRenderer';

/**
 * Notification Dispatcher - Sends multi-channel notifications using templates
 * Handles Email, SMS, and Push notifications with logging
 */

// Helper to build full URLs for email links
function buildFullUrl(pageName, params = '') {
  const baseUrl = window.location.origin;
  const path = createPageUrl(pageName);
  return `${baseUrl}${path}${params}`;
}

export async function sendNotificationFromTemplate(templateId, recipientEmail, variables, options = {}) {
  try {
    // Load template
    const templates = await base44.entities.EmailTemplate.filter({ 
      template_id: templateId, 
      is_active: true 
    });
    
    if (templates.length === 0) {
      console.error(`Template ${templateId} not found or inactive`);
      return { success: false, error: 'Template not found' };
    }
    
    const template = templates[0];
    
    // Validate variables
    const validation = validateVariables(template, variables);
    if (!validation.valid) {
      console.warn(`Missing variables for ${templateId}:`, validation.missing);
    }
    
    const results = {};
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const eventName = templateId.replace('email.', '').replace(/\./g, '_');
    
    // Send Email
    if (template.send_email && template.html_body) {
      try {
        const rendered = renderEmailTemplate(template, variables);
        
        await base44.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: rendered.subject,
          body: rendered.html
        });
        
        // Log delivery
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: eventName,
          channel: 'email',
          status: 'sent',
          template_id: templateId,
          recipient_email: recipientEmail,
          subject: rendered.subject,
          body: rendered.html,
          metadata: { variables, event_id: eventId },
          sent_at: new Date().toISOString(),
          provider: 'internal',
          can_retry: true
        });
        
        results.email = 'sent';
      } catch (emailError) {
        console.error('Email send error:', emailError);
        
        // Log failure
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: eventName,
          channel: 'email',
          status: 'failed',
          template_id: templateId,
          recipient_email: recipientEmail,
          error_message: emailError.message,
          metadata: { variables, event_id: eventId },
          provider: 'internal',
          can_retry: true
        });
        
        results.email = 'failed';
      }
    }
    
    // Send SMS (if enabled and phone provided)
    if (template.send_sms && template.sms_body && variables.phone) {
      try {
        const smsBody = renderSMSTemplate(template, variables);
        
        // Log SMS (actual sending would require Twilio integration)
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: eventName,
          channel: 'sms',
          status: 'pending',
          template_id: templateId.replace('email.', 'sms.'),
          recipient_phone: variables.phone,
          body: smsBody,
          metadata: { variables, event_id: eventId },
          provider: 'internal',
          can_retry: true
        });
        
        results.sms = 'logged';
      } catch (smsError) {
        console.error('SMS log error:', smsError);
        results.sms = 'failed';
      }
    }
    
    // Send Push (if enabled)
    if (template.send_push && template.push_title && variables.user_id) {
      try {
        const push = renderPushTemplate(template, variables);
        
        // Log push (actual sending would require OneSignal/FCM integration)
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: eventName,
          channel: 'push',
          status: 'pending',
          template_id: templateId.replace('email.', 'push.'),
          recipient_email: recipientEmail,
          subject: push.title,
          body: push.body,
          metadata: { 
            variables, 
            event_id: eventId,
            deep_link: push.deepLink 
          },
          provider: 'internal',
          can_retry: true
        });
        
        results.push = 'logged';
      } catch (pushError) {
        console.error('Push log error:', pushError);
        results.push = 'failed';
      }
    }
    
    return { success: true, results, event_id: eventId };
  } catch (error) {
    console.error('Notification dispatcher error:', error);
    return { success: false, error: error.message };
  }
}

// Convenience wrapper functions for common scenarios
export async function sendBookingConfirmation(booking, client, cleaner) {
  const variables = {
    first_name: client.full_name?.split(' ')[0] || 'there',
    cleaner_name: cleaner.full_name,
    date: new Date(booking.date).toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric' 
    }),
    time: booking.start_time,
    address: booking.address,
    price: `$${booking.total_price}`,
    booking_id: booking.id,
    manage_booking_link: buildFullUrl('BookingHistory'),
    link: buildFullUrl('BookingHistory'),
    phone: client.phone,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.client.booking_confirmation',
    booking.client_email,
    variables
  );
}

export async function sendCleanerOnWay(booking, client, cleaner) {
  const variables = {
    first_name: client.full_name?.split(' ')[0] || 'there',
    cleaner_name: cleaner.full_name,
    booking_id: booking.id,
    link: buildFullUrl('BookingHistory'),
    phone: client.phone,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.client.cleaner_on_way',
    booking.client_email,
    variables
  );
}

export async function sendCleaningCompleted(booking, client) {
  const variables = {
    first_name: client.full_name?.split(' ')[0] || 'there',
    booking_id: booking.id,
    rate_cleaner_link: buildFullUrl('BookingHistory'),
    link: buildFullUrl('BookingHistory'),
    phone: client.phone,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.client.cleaning_completed',
    booking.client_email,
    variables
  );
}

export async function sendWelcomeClient(clientEmail, clientName) {
  const variables = {
    first_name: clientName.split(' ')[0],
    booking_link: buildFullUrl('BrowseCleaners'),
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.client.welcome',
    clientEmail,
    variables
  );
}

export async function sendWelcomeCleaner(cleanerEmail, cleanerName) {
  const variables = {
    cleaner_name: cleanerName,
    cleaner_dashboard_link: buildFullUrl('CleanerDashboard'),
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.cleaner.welcome',
    cleanerEmail,
    variables
  );
}

export async function sendJobInvite(booking, cleanerEmail, cleanerName) {
  const variables = {
    cleaner_name: cleanerName,
    job_type: booking.tasks?.join(', ') || 'Standard Clean',
    date: new Date(booking.date).toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric' 
    }),
    time: booking.start_time,
    pay: (booking.total_price * 0.85).toFixed(2),
    job_link: buildFullUrl('BrowseJobs'),
    link: buildFullUrl('BrowseJobs'),
    job_id: booking.id,
    accept_url: buildFullUrl('BrowseJobs'),
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.cleaner.job_invited',
    cleanerEmail,
    variables
  );
}

export async function sendReliabilityScoreUpdate(cleanerEmail, cleanerName, newScore, oldScore) {
  const variables = {
    cleaner_name: cleanerName,
    score: newScore,
    old_score: oldScore,
    score_dashboard_link: buildFullUrl('CleanerAnalytics'),
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.cleaner.reliability_changed',
    cleanerEmail,
    variables
  );
}

export async function sendReviewRequest(booking, clientEmail, clientName) {
  const variables = {
    first_name: clientName.split(' ')[0],
    booking_id: booking.id,
    rate_cleaner_link: buildFullUrl('BookingHistory'),
    link: buildFullUrl('BookingHistory'),
    phone: booking.client_phone,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.client.review_request',
    clientEmail,
    variables
  );
}

export async function sendPaymentReceipt(booking, clientEmail, clientName, cleanerName) {
  const variables = {
    first_name: clientName.split(' ')[0],
    date: new Date(booking.date).toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    }),
    price: `$${booking.total_price}`,
    cleaner_name: cleanerName,
    amount: booking.total_price,
    booking_id: booking.id,
    phone: booking.client_phone,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.client.receipt',
    clientEmail,
    variables
  );
}

export async function sendPaymentFailed(booking, clientEmail, clientName, reason) {
  const variables = {
    first_name: clientName.split(' ')[0],
    booking_id: booking.id,
    reason: reason || 'Card declined',
    payment_link: buildFullUrl('Profile'),
    link: buildFullUrl('Profile'),
    phone: booking.client_phone,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.system.payment_failed',
    clientEmail,
    variables
  );
}

export async function sendWinbackEmail(clientEmail, clientName, creditAmount = 20) {
  const variables = {
    first_name: clientName.split(' ')[0],
    credit: creditAmount,
    booking_link: buildFullUrl('BrowseCleaners'),
    link: buildFullUrl('BrowseCleaners'),
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.marketing.winback',
    clientEmail,
    variables
  );
}

export async function sendReferralEmail(referrerEmail, referrerName, referralLink) {
  const variables = {
    first_name: referrerName.split(' ')[0],
    referral_link: referralLink,
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.marketing.referral',
    referrerEmail,
    variables
  );
}

export async function sendFirstCleaningPromo(clientEmail, clientName) {
  const variables = {
    first_name: clientName.split(' ')[0],
    booking_link: buildFullUrl('BrowseCleaners'),
    link: buildFullUrl('BrowseCleaners'),
    year: new Date().getFullYear()
  };
  
  return sendNotificationFromTemplate(
    'email.marketing.first_cleaning',
    clientEmail,
    variables
  );
}

export default {
  sendNotificationFromTemplate,
  sendBookingConfirmation,
  sendCleanerOnWay,
  sendCleaningCompleted,
  sendWelcomeClient,
  sendWelcomeCleaner,
  sendJobInvite,
  sendReliabilityScoreUpdate,
  sendReviewRequest,
  sendPaymentReceipt,
  sendPaymentFailed,
  sendWinbackEmail,
  sendReferralEmail,
  sendFirstCleaningPromo
};