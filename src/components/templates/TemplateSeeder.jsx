/**
 * Template Seeder - Section 3.2
 * Seeds all email/SMS/push templates into the EmailTemplate entity
 * Run this from Admin Dashboard to initialize the template registry
 */

import getBookingConfirmedEmailTemplate from './BookingConfirmedEmail';
import getCleaningCompletedEmailTemplate from './CleaningCompletedEmail';
import getPaymentFailedEmailTemplate from './PaymentFailedEmail';
import getCleanerOnTheWayEmailTemplate from './CleanerOnTheWayEmail';
import getWelcomeEmailTemplate from './WelcomeEmail';

export const getAllTemplates = () => {
  return [
    getWelcomeEmailTemplate(),
    getBookingConfirmedEmailTemplate(),
    getCleanerOnTheWayEmailTemplate(),
    getCleaningCompletedEmailTemplate(),
    getPaymentFailedEmailTemplate(),
    
    // Additional templates (simplified versions)
    {
      template_id: 'email.job_accepted',
      category: 'client',
      subject: 'Your cleaner accepted! 🎉',
      html_body: '<p>Hi {{first_name}},</p><p>Great news! {{cleaner_name}} has accepted your booking for {{start_at}}.</p>',
      variables: ['first_name', 'cleaner_name', 'start_at'],
      is_active: true,
      send_email: true,
      send_sms: false
    },
    {
      template_id: 'sms.reminder_24h',
      category: 'client',
      sms_body: 'Reminder: cleaning tomorrow at {{start_at}}. Details: {{link}}',
      variables: ['start_at', 'link'],
      is_active: true,
      send_email: false,
      send_sms: true
    },
    {
      template_id: 'sms.reminder_1h',
      category: 'cleaner',
      sms_body: 'Job starting in 1h. Check-in on arrival. Details: {{link}}',
      variables: ['link'],
      is_active: true,
      send_email: false,
      send_sms: true
    },
    {
      template_id: 'sms.finished',
      category: 'client',
      sms_body: '✨ Complete! Approve/review: {{link}}',
      variables: ['link'],
      is_active: true,
      send_email: false,
      send_sms: true
    },
    {
      template_id: 'email.review_request',
      category: 'client',
      subject: 'How was your cleaning? ⭐',
      html_body: '<p>Hi {{first_name}},</p><p>Please take a moment to rate your experience with {{cleaner_name}}.</p><p><a href="{{review_link}}">Leave a Review</a></p>',
      variables: ['first_name', 'cleaner_name', 'review_link'],
      is_active: true,
      send_email: true,
      send_sms: false
    },
    {
      template_id: 'sms.new_job_available',
      category: 'cleaner',
      sms_body: 'New job available near you! View details: {{link}}',
      variables: ['link'],
      is_active: true,
      send_email: false,
      send_sms: true
    },
    {
      template_id: 'email.subscription_renewed',
      category: 'client',
      subject: 'Your {{plan_name}} plan renewed',
      html_body: '<p>Hi {{first_name}},</p><p>Your subscription has renewed. {{credits}} credits have been added to your wallet.</p>',
      variables: ['first_name', 'plan_name', 'credits'],
      is_active: true,
      send_email: true,
      send_sms: false
    },
    {
      template_id: 'email.payout_sent',
      category: 'cleaner',
      subject: 'Payout sent - {{amount}} on the way! 💰',
      html_body: '<p>Hi {{first_name}},</p><p>Your weekly payout of {{amount}} has been sent to your bank account.</p>',
      variables: ['first_name', 'amount'],
      is_active: true,
      send_email: true,
      send_sms: true
    },
    {
      template_id: 'sms.reliability_changed',
      category: 'cleaner',
      sms_body: '⭐ Your Reliability Score changed to {{score}}. {{tier}} tier unlocked!',
      variables: ['score', 'tier'],
      is_active: true,
      send_email: false,
      send_sms: true
    },
    {
      template_id: 'email.dispute_opened',
      category: 'system',
      subject: 'Dispute opened for booking {{job_id}}',
      html_body: '<p>A dispute has been opened for booking {{job_id}}. Our team will review and reach out within 24-48 hours.</p>',
      variables: ['job_id'],
      is_active: true,
      send_email: true,
      send_sms: false
    },
    {
      template_id: 'email.dispute_resolved',
      category: 'system',
      subject: 'Dispute resolved - {{job_id}}',
      html_body: '<p>Hi {{first_name}},</p><p>The dispute for booking {{job_id}} has been resolved. {{resolution_summary}}</p>',
      variables: ['first_name', 'job_id', 'resolution_summary'],
      is_active: true,
      send_email: true,
      send_sms: false
    },
    {
      template_id: 'email.password_reset',
      category: 'system',
      subject: 'Reset your PureTask password',
      html_body: '<p>Click the link to reset your password: {{reset_link}}</p><p>This link expires in 1 hour.</p>',
      sms_body: 'Reset your password: {{reset_link}}',
      variables: ['reset_link'],
      is_active: true,
      send_email: true,
      send_sms: true
    }
  ];
};

/**
 * Seed all templates into the database
 */
export const seedTemplates = async () => {
  const templates = getAllTemplates();
  const results = { created: 0, updated: 0, errors: [] };

  for (const template of templates) {
    try {
      // Check if template exists
      const existing = await base44.entities.EmailTemplate.filter({ 
        template_id: template.template_id 
      });

      if (existing.length > 0) {
        // Update existing
        await base44.entities.EmailTemplate.update(existing[0].id, template);
        results.updated++;
      } else {
        // Create new
        await base44.entities.EmailTemplate.create(template);
        results.created++;
      }
    } catch (error) {
      results.errors.push({ template: template.template_id, error: error.message });
    }
  }

  return results;
};

export default {
  getAllTemplates,
  seedTemplates
};