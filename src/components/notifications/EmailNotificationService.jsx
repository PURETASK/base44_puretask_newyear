import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

// Email & SMS Template System for PureTask
// Based on comprehensive messaging document

const TEMPLATES = {
  // CLIENT EMAILS
  'email.client.welcome': {
    subject: 'Welcome to PureTask — Your clean home starts here ✨',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>Thanks for joining <strong>PureTask</strong> — the easiest way to book verified cleaners on your schedule.</p>
        
        <p>With PureTask, you get:</p>
        <ul>
          <li>✅ GPS check-in / check-out</li>
          <li>✅ Before & after photos</li>
          <li>✅ Reliability Score for every cleaner</li>
        </ul>
        
        <p>👉 Book your first cleaning anytime:<br/>
        <a href="${vars.booking_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Book Now</a></p>
        
        <p>Have questions? Just reply — a real human will answer.</p>
        <p>— The PureTask Team</p>
      </div>
    `,
    sms: null
  },

  'email.client.booking_confirmation': {
    subject: (vars) => `✅ Your cleaning is booked! ${vars.date} at ${vars.time}`,
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>You're all set. Here are the details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cleaner:</strong> ${vars.cleaner_name}</p>
          <p><strong>Arrival Window:</strong> ${vars.date} — ${vars.time}</p>
          <p><strong>Service Address:</strong> ${vars.address}</p>
          <p><strong>Total Estimate:</strong> ${vars.price}</p>
        </div>
        
        <p>Your cleaner will:</p>
        <ul>
          <li>GPS check-in upon arrival</li>
          <li>Upload before & after photos</li>
          <li>Check-out only after service is completed</li>
        </ul>
        
        <p>Need to update or reschedule?<br/>
        👉 <a href="${vars.manage_booking_link}" style="color: #10b981;">Manage Booking</a></p>
        
        <p>We appreciate you choosing PureTask.</p>
      </div>
    `,
    sms: (vars) => `✅ Your cleaning is booked for ${vars.date} at ${vars.time}. Cleaner: ${vars.cleaner_name}. Manage: ${vars.manage_booking_link}`
  },

  'email.client.cleaner_on_way': {
    subject: 'Your cleaner is on the way! 🚗✨',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>${vars.cleaner_name} just checked in and is heading to your location.</p>
        <p>You'll receive another update when they arrive.</p>
        <p>— PureTask Team</p>
      </div>
    `,
    sms: (vars) => `🚗 Your cleaner ${vars.cleaner_name} is on the way to your address.`
  },

  'email.client.cleaning_completed': {
    subject: '✅ Cleaning completed — how did we do?',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>Your cleaning is now finished. Payment is processing.</p>
        
        <p>✔ Before & after photos uploaded<br/>
        ✔ GPS check-out completed</p>
        
        <p>Rate your cleaner (optional but appreciated):<br/>
        <a href="${vars.rate_cleaner_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Rate Cleaner</a></p>
        
        <p>Thank you for using PureTask!</p>
      </div>
    `,
    sms: (vars) => `✨ Cleaning complete! Rate your cleaner: ${vars.rate_cleaner_link}`
  },

  'email.client.review_request': {
    subject: 'Quick rating? It helps small cleaners grow 💛',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>Your feedback helps great cleaners earn more and get priority bookings.</p>
        
        <p>Rate your cleaner here:<br/>
        👉 <a href="${vars.rate_cleaner_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Leave Review</a></p>
        
        <p>Thanks for supporting independent cleaners 🙌</p>
      </div>
    `,
    sms: (vars) => `How did we do? Leave a quick rating (10 seconds): ${vars.rate_cleaner_link}`
  },

  // CLEANER EMAILS
  'email.cleaner.welcome': {
    subject: 'Welcome to PureTask — earn more by doing great work ✅',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.cleaner_name},</h2>
        <p>Welcome aboard! You now have access to clients in your area.</p>
        
        <p>Your earnings increase based on your <strong>Reliability Score</strong>.</p>
        
        <p>Reliability Score = Show up + great service + happy customers<br/>
        Higher score = higher pay + priority placement + instant booking access.</p>
        
        <p>Start accepting bookings:<br/>
        👉 <a href="${vars.cleaner_dashboard_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Open Dashboard</a></p>
        
        <p>Let's build your business.</p>
      </div>
    `,
    sms: null
  },

  'email.cleaner.job_invited': {
    subject: (vars) => `🚨 New Job Available — ${vars.date} @ ${vars.time}`,
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${vars.cleaner_name},</h2>
        <p>A customer selected you for a cleaning job.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${vars.job_type}</p>
          <p><strong>Date:</strong> ${vars.date}</p>
          <p><strong>Pay:</strong> $${vars.pay}</p>
        </div>
        
        <p>👉 <a href="${vars.job_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Accept or Decline</a></p>
      </div>
    `,
    sms: (vars) => `🚨 New Job Available! ${vars.date} @ ${vars.time} — Pay $${vars.pay}. Accept here: ${vars.job_link}`
  },

  'email.cleaner.job_confirmed': {
    subject: (vars) => `You're booked! ${vars.date} @ ${vars.time}`,
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're confirmed for the job below:</h2>
        
        <p><strong>Customer:</strong> ${vars.customer_name}<br/>
        <strong>Check-in:</strong> Must GPS check-in when arriving<br/>
        <strong>Photos:</strong> Upload before & after</p>
        
        <p style="background: #fef3c7; padding: 15px; border-radius: 8px;">
          ⚠️ Your Reliability Score depends on completing these steps.
        </p>
      </div>
    `,
    sms: (vars) => `✅ You're booked for ${vars.date} @ ${vars.time}. Remember: GPS check-in + photos required.`
  },

  'email.cleaner.reliability_changed': {
    subject: (vars) => `Update: Your Reliability Score changed 📈`,
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${vars.cleaner_name},</h2>
        <p>Your Reliability Score is now <strong>${vars.score}</strong>.</p>
        
        <p>Keep doing great work and you unlock:</p>
        <ul>
          <li>Higher pay</li>
          <li>Priority placement</li>
          <li>Instant Booking</li>
        </ul>
        
        <p><a href="${vars.score_dashboard_link}" style="color: #10b981;">View score breakdown</a></p>
      </div>
    `,
    sms: (vars) => `📊 Update: Your Reliability Score is now ${vars.score}. Better score = higher pay + priority placement.`
  },

  // MARKETING EMAILS
  'email.marketing.first_cleaning': {
    subject: 'Get $25 off your first cleaning ✨',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>Try PureTask and get:</p>
        <ul>
          <li>✨ Verified cleaners</li>
          <li>✨ Before & after photos</li>
          <li>✨ Reliability Score (no guesswork)</li>
        </ul>
        
        <p>Use code: <strong>CLEAN25</strong></p>
        <p><a href="${vars.booking_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Book Now</a></p>
      </div>
    `,
    sms: (vars) => `✨ Get $25 off your first PureTask cleaning. Use code: CLEAN25. Book now: ${vars.booking_link}`
  },

  'email.marketing.winback': {
    subject: (vars) => `We miss you — here's $${vars.credit} off`,
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>Haven't seen you in a while — here's a $${vars.credit} credit on your account.</p>
        
        <p>No code needed.<br/>
        Just book: <a href="${vars.booking_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Book Cleaning</a></p>
      </div>
    `,
    sms: (vars) => `We miss you 🧽 Come back and get $${vars.credit} off your next cleaning. Book here: ${vars.booking_link}`
  },

  'email.marketing.referral': {
    subject: 'Give $20, Get $20 🤝',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>When you share your link:</h2>
        <p>Your friend gets <strong>$20 off</strong>,<br/>
        You get <strong>$20 PureTask credit</strong> after their first cleaning.</p>
        
        <p>Referral link:<br/>
        <a href="${vars.referral_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Share PureTask</a></p>
      </div>
    `,
    sms: (vars) => `Give $20, Get $20 🤝 Share this link: ${vars.referral_link}`
  },

  // SYSTEM EMAILS
  'email.system.payment_failed': {
    subject: 'Payment issue — action required',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Issue</h2>
        <p>We couldn't process your payment for your recent cleaning.</p>
        
        <p><strong>Reason:</strong> ${vars.reason || 'Card declined'}</p>
        
        <p><a href="${vars.payment_link}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Update Payment Info</a></p>
      </div>
    `,
    sms: (vars) => `⚠️ Payment failed. Update payment to avoid account lock: ${vars.payment_link}`
  },

  'email.system.payment_receipt': {
    subject: 'Invoice for your recent cleaning 🧾',
    html: (vars) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${vars.first_name},</h2>
        <p>Here's your receipt for the cleaning completed on ${vars.date}.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount Charged:</strong> ${vars.price}</p>
          <p><strong>Cleaner:</strong> ${vars.cleaner_name}</p>
        </div>
        
        <p>Thanks again for choosing PureTask!</p>
      </div>
    `,
    sms: (vars) => `🧾 Payment processed: ${vars.price}. Receipt sent to your email.`
  }
};

// Main notification service
export async function sendNotification(templateId, recipientEmail, variables, options = {}) {
  try {
    const template = TEMPLATES[templateId];
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return { success: false, error: 'Template not found' };
    }

    const results = {};

    // Build base URL for app links
    const baseUrl = window.location.origin;
    const enrichedVars = {
      ...variables,
      booking_link: variables.booking_link || `${baseUrl}${createPageUrl('BrowseCleaners')}`,
      manage_booking_link: variables.manage_booking_link || (variables.booking_id ? `${baseUrl}${createPageUrl('BookingHistory')}` : ''),
      cleaner_dashboard_link: variables.cleaner_dashboard_link || `${baseUrl}${createPageUrl('CleanerDashboard')}`,
      rate_cleaner_link: variables.rate_cleaner_link || (variables.booking_id ? `${baseUrl}${createPageUrl('BookingHistory')}` : ''),
      score_dashboard_link: variables.score_dashboard_link || `${baseUrl}${createPageUrl('CleanerInsights')}`,
      job_link: variables.job_link || `${baseUrl}${createPageUrl('CleanerJobs')}`,
      payment_link: variables.payment_link || `${baseUrl}${createPageUrl('Profile')}`,
      referral_link: variables.referral_link || `${baseUrl}${createPageUrl('Home')}`
    };

    // Send Email (default behavior unless disabled)
    if (options.sendEmail !== false && template.html) {
      try {
        const subject = typeof template.subject === 'function' 
          ? template.subject(enrichedVars) 
          : template.subject;
        
        const body = typeof template.html === 'function'
          ? template.html(enrichedVars)
          : template.html;

        await base44.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: subject,
          body: body
        });

        // Log delivery
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: templateId.replace('email.', '').replace('.', '_'),
          channel: 'email',
          status: 'sent',
          template_id: templateId,
          recipient_email: recipientEmail,
          subject: subject,
          body: body,
          metadata: variables,
          sent_at: new Date().toISOString(),
          can_retry: true
        });

        results.email = 'sent';
      } catch (emailError) {
        console.error('Email send error:', emailError);
        results.email = 'failed';
        
        // Log failure
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: templateId.replace('email.', '').replace('.', '_'),
          channel: 'email',
          status: 'failed',
          template_id: templateId,
          recipient_email: recipientEmail,
          error_message: emailError.message,
          metadata: variables,
          can_retry: true
        });
      }
    }

    // Send SMS (if template has SMS version and enabled)
    if (options.sendSMS && template.sms && variables.phone) {
      try {
        const smsBody = typeof template.sms === 'function'
          ? template.sms(enrichedVars)
          : template.sms;

        // Note: SMS sending would require Twilio integration
        // For now, we'll log it to MessageDeliveryLog
        await base44.entities.MessageDeliveryLog.create({
          delivery_id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_name: templateId.replace('email.', 'sms.').replace('.', '_'),
          channel: 'sms',
          status: 'pending',
          template_id: templateId.replace('email.', 'sms.'),
          recipient_phone: variables.phone,
          body: smsBody,
          metadata: variables,
          can_retry: true
        });

        results.sms = 'logged';
      } catch (smsError) {
        console.error('SMS log error:', smsError);
        results.sms = 'failed';
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Notification service error:', error);
    return { success: false, error: error.message };
  }
}

// Convenience functions for specific scenarios
export async function sendBookingConfirmation(booking, clientName, cleanerName) {
  return sendNotification('email.client.booking_confirmation', booking.client_email, {
    first_name: clientName.split(' ')[0],
    cleaner_name: cleanerName,
    date: new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    time: booking.start_time,
    address: booking.address,
    price: `$${booking.total_price}`,
    booking_id: booking.id,
    manage_booking_link: `${window.location.origin}${createPageUrl('BookingHistory')}`
  });
}

export async function sendCleanerOnWay(booking, clientName, cleanerName) {
  return sendNotification('email.client.cleaner_on_way', booking.client_email, {
    first_name: clientName.split(' ')[0],
    cleaner_name: cleanerName,
    booking_id: booking.id
  }, { sendSMS: true, phone: booking.client_phone });
}

export async function sendCleaningCompleted(booking, clientName) {
  return sendNotification('email.client.cleaning_completed', booking.client_email, {
    first_name: clientName.split(' ')[0],
    booking_id: booking.id,
    rate_cleaner_link: `${window.location.origin}${createPageUrl('BookingHistory')}`
  }, { sendSMS: true, phone: booking.client_phone });
}

export async function sendWelcomeEmail(userEmail, userName, userType) {
  const templateId = userType === 'client' ? 'email.client.welcome' : 'email.cleaner.welcome';
  const firstName = userName.split(' ')[0];
  
  return sendNotification(templateId, userEmail, {
    first_name: firstName,
    cleaner_name: userName,
    booking_link: `${window.location.origin}${createPageUrl('BrowseCleaners')}`,
    cleaner_dashboard_link: `${window.location.origin}${createPageUrl('CleanerDashboard')}`
  });
}

export async function sendJobInvite(booking, cleanerEmail, cleanerName) {
  return sendNotification('email.cleaner.job_invited', cleanerEmail, {
    cleaner_name: cleanerName,
    job_type: booking.tasks?.join(', ') || 'Standard Clean',
    date: new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    time: booking.start_time,
    pay: booking.total_price * 0.85, // 85% goes to cleaner
    job_link: `${window.location.origin}${createPageUrl('CleanerJobs')}`
  }, { sendSMS: true, phone: booking.cleaner_phone });
}

export async function sendReliabilityScoreUpdate(cleanerEmail, cleanerName, newScore, oldScore) {
  const changes = [];
  if (newScore > oldScore) changes.push(`✅ Score increased [+${newScore - oldScore}]`);
  if (newScore < oldScore) changes.push(`⚠ Score decreased [-${oldScore - newScore}]`);
  
  return sendNotification('email.cleaner.reliability_changed', cleanerEmail, {
    cleaner_name: cleanerName,
    score: newScore,
    changes: changes.join(', '),
    score_dashboard_link: `${window.location.origin}${createPageUrl('CleanerInsights')}`
  }, { sendSMS: true });
}

export async function sendPaymentReceipt(booking, clientEmail, clientName, cleanerName) {
  return sendNotification('email.system.payment_receipt', clientEmail, {
    first_name: clientName.split(' ')[0],
    date: new Date(booking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    price: `$${booking.total_price}`,
    cleaner_name: cleanerName,
    booking_id: booking.id
  }, { sendSMS: true, phone: booking.client_phone });
}

export async function sendPaymentFailed(booking, clientEmail, clientName, reason) {
  return sendNotification('email.system.payment_failed', clientEmail, {
    first_name: clientName.split(' ')[0],
    booking_id: booking.id,
    reason: reason,
    payment_link: `${window.location.origin}${createPageUrl('Profile')}`
  }, { sendSMS: true, phone: booking.client_phone });
}

export async function sendReviewRequest(booking, clientEmail, clientName) {
  return sendNotification('email.client.review_request', clientEmail, {
    first_name: clientName.split(' ')[0],
    booking_id: booking.id,
    rate_cleaner_link: `${window.location.origin}${createPageUrl('BookingHistory')}`
  }, { sendSMS: true, phone: booking.client_phone });
}

export async function sendWinbackEmail(clientEmail, clientName, creditAmount = 20) {
  return sendNotification('email.marketing.winback', clientEmail, {
    first_name: clientName.split(' ')[0],
    credit: creditAmount,
    booking_link: `${window.location.origin}${createPageUrl('BrowseCleaners')}`
  }, { sendSMS: true });
}

export async function sendReferralInvite(referrerEmail, referrerName, referralLink) {
  return sendNotification('email.marketing.referral', referrerEmail, {
    first_name: referrerName.split(' ')[0],
    referral_link: referralLink
  }, { sendSMS: true });
}

export default {
  sendNotification,
  sendBookingConfirmation,
  sendCleanerOnWay,
  sendCleaningCompleted,
  sendWelcomeEmail,
  sendJobInvite,
  sendReliabilityScoreUpdate,
  sendPaymentReceipt,
  sendPaymentFailed,
  sendReviewRequest,
  sendWinbackEmail,
  sendReferralInvite,
  TEMPLATES
};