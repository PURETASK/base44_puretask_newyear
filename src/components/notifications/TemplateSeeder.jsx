// Module 8 - Notification Template Seeder
// Seeds all required notification templates into the database

export const NOTIFICATION_TEMPLATES = [
  // ============================================================================
  // BOOKING LIFECYCLE
  // ============================================================================
  {
    code: 'booking_created_client',
    channels: ['push', 'email'],
    category: 'booking',
    title_template: 'Booking Received, {{client_name}}!',
    body_template: 'Your cleaning is scheduled for {{booking_date}} at {{booking_time}} at {{address}}. We\'re now matching you with a pro cleaner.',
    variables: ['client_name', 'booking_date', 'booking_time', 'address', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'job_offer_cleaner',
    channels: ['sms', 'push'],
    category: 'booking',
    title_template: 'New Job Offer Available',
    body_template: 'Job on {{booking_date}} at {{booking_time}} in {{address}}. {{hours}} hours. Est. pay: ${{estimated_pay}}. Respond soon!',
    variables: ['cleaner_name', 'booking_date', 'booking_time', 'address', 'hours', 'estimated_pay', 'booking_id'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'booking_accepted_client',
    channels: ['push', 'email'],
    category: 'booking',
    title_template: 'Cleaner Confirmed!',
    body_template: '{{cleaner_name}} has accepted your booking for {{booking_date}} at {{booking_time}}. They\'ll arrive at {{address}}. Check your app for cleaner profile and prep tips.',
    variables: ['client_name', 'cleaner_name', 'booking_date', 'booking_time', 'address', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'booking_accepted_cleaner',
    channels: ['sms', 'push'],
    category: 'booking',
    title_template: 'Job Confirmed',
    body_template: 'You\'re booked for {{booking_date}} at {{booking_time}}. Address: {{address}}. Duration: {{hours}}h. Don\'t forget to check in and upload photos!',
    variables: ['cleaner_name', 'booking_date', 'booking_time', 'address', 'hours', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'booking_still_matching_client',
    channels: ['push', 'email'],
    category: 'booking',
    title_template: 'Finding You Another Cleaner',
    body_template: 'We\'re matching you with another professional cleaner for your {{booking_date}} booking. You\'ll be notified shortly.',
    variables: ['client_name', 'booking_date', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'cleaner_on_the_way_client',
    channels: ['push', 'sms'],
    category: 'booking',
    title_template: 'Your Cleaner is On The Way',
    body_template: '{{cleaner_name}} is on the way and should arrive around {{eta}}.',
    variables: ['client_name', 'cleaner_name', 'eta', 'booking_id'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'job_started_client',
    channels: ['push'],
    category: 'booking',
    title_template: 'Cleaning Started',
    body_template: '{{cleaner_name}} has started working. You can track progress and chat in the app.',
    variables: ['client_name', 'cleaner_name', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'job_completed_client',
    channels: ['push', 'email'],
    category: 'booking',
    title_template: 'Cleaning Completed!',
    body_template: '{{cleaner_name}} has finished your cleaning. Please review the photos and approve the work in the app.',
    variables: ['client_name', 'cleaner_name', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'job_completed_cleaner',
    channels: ['push'],
    category: 'booking',
    title_template: 'Job Submitted',
    body_template: 'Thanks for completing the job! Waiting for client approval. Your earnings will be confirmed soon.',
    variables: ['cleaner_name', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'job_approved_client',
    channels: ['push', 'email'],
    category: 'booking',
    title_template: 'Booking Approved - Receipt',
    body_template: 'Your cleaning is complete! {{credits_spent}} credits spent. Balance: {{credits_balance}} credits. Thanks for using PureTask!',
    variables: ['client_name', 'booking_id', 'credits_spent', 'credits_balance'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'job_approved_cleaner',
    channels: ['push', 'email'],
    category: 'booking',
    title_template: 'Earnings Confirmed!',
    body_template: 'Client approved your work! You earned {{credits_earned}} credits. Great job maintaining quality!',
    variables: ['cleaner_name', 'booking_id', 'credits_earned'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'booking_cancelled_cleaner',
    channels: ['sms', 'push'],
    category: 'booking',
    title_template: 'Booking Cancelled',
    body_template: 'The client cancelled the {{booking_date}} booking. Reason: {{cancellation_reason}}.',
    variables: ['cleaner_name', 'booking_date', 'cancellation_reason', 'booking_id'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'booking_cancelled_client',
    channels: ['email'],
    category: 'booking',
    title_template: 'Cancellation Confirmed',
    body_template: 'Your booking has been cancelled. Refund: {{refund_amount}} credits.',
    variables: ['client_name', 'booking_id', 'refund_amount'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'cleaner_cancelled_client',
    channels: ['push', 'sms', 'email'],
    category: 'booking',
    title_template: 'Cleaner Cancelled - We\'re Finding a Replacement',
    body_template: 'We\'re sorry, but your cleaner had to cancel your {{booking_date}} booking. We\'re finding you another professional cleaner right away.',
    variables: ['client_name', 'booking_date', 'booking_id'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'cleaner_cancelled_confirm',
    channels: ['push'],
    category: 'booking',
    title_template: 'Cancellation Confirmed',
    body_template: 'Your cancellation has been recorded. Note: Last-minute cancellations may affect your reliability score.',
    variables: ['cleaner_name', 'booking_id'],
    is_active: true,
    is_urgent: false
  },

  // ============================================================================
  // PAYMENT & CREDITS
  // ============================================================================
  {
    code: 'credits_purchased_client',
    channels: ['email'],
    category: 'payment',
    title_template: 'Credits Purchased',
    body_template: 'You purchased {{credits_amount}} credits. New balance: {{new_balance}} credits.',
    variables: ['client_name', 'credits_amount', 'new_balance'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'refund_issued_client',
    channels: ['push', 'email'],
    category: 'payment',
    title_template: 'Refund Issued',
    body_template: '{{refund_credits}} credits have been refunded to your wallet. New balance: {{new_balance}} credits. Reason: {{reason}}',
    variables: ['client_name', 'refund_credits', 'new_balance', 'reason'],
    is_active: true,
    is_urgent: false
  },

  // ============================================================================
  // PAYOUTS
  // ============================================================================
  {
    code: 'payout_sent_cleaner',
    channels: ['email', 'push'],
    category: 'payout',
    title_template: 'Payout Sent!',
    body_template: 'Your payout of ${{amount}} has been sent on {{payout_date}}. It should arrive in 1-2 business days.',
    variables: ['cleaner_name', 'amount', 'payout_date'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'payout_failed_cleaner',
    channels: ['email', 'sms'],
    category: 'payout',
    title_template: 'Payout Failed',
    body_template: 'We couldn\'t process your ${{amount}} payout. Error: {{error_message}}. Please update your bank details in settings.',
    variables: ['cleaner_name', 'amount', 'error_message'],
    is_active: true,
    is_urgent: true
  },

  // ============================================================================
  // RELIABILITY & TIER
  // ============================================================================
  {
    code: 'tier_upgrade_cleaner',
    channels: ['email', 'push'],
    category: 'reliability',
    title_template: 'Congratulations! Tier Upgrade',
    body_template: 'You\'re now {{tier}}! Your reliability score of {{reliability_score}} unlocked new benefits. Keep up the great work!',
    variables: ['cleaner_name', 'tier', 'reliability_score'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'tier_warning_cleaner',
    channels: ['email', 'push'],
    category: 'reliability',
    title_template: 'Reliability Alert',
    body_template: 'Your tier changed to {{tier}} due to reliability score {{reliability_score}}. Complete 5 perfect jobs to improve.',
    variables: ['cleaner_name', 'tier', 'reliability_score'],
    is_active: true,
    is_urgent: false
  },

  // ============================================================================
  // DISPUTES
  // ============================================================================
  {
    code: 'dispute_opened_admin',
    channels: ['email'],
    category: 'dispute',
    title_template: 'New Dispute Filed',
    body_template: 'Dispute #{dispute_id} filed by {{filed_by}} for booking {{booking_id}}. Category: {{category}}. Description: {{description}}',
    variables: ['dispute_id', 'booking_id', 'filed_by', 'category', 'description'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'dispute_opened_cleaner',
    channels: ['email', 'push'],
    category: 'dispute',
    title_template: 'Dispute Opened',
    body_template: 'A client has opened a dispute ({{category}}) for your job on booking {{booking_id}}. Please respond within 48 hours.',
    variables: ['cleaner_name', 'category', 'booking_id', 'dispute_id'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'dispute_opened_client',
    channels: ['email', 'push'],
    category: 'dispute',
    title_template: 'Dispute Opened',
    body_template: 'The cleaner has opened a dispute ({{category}}) for booking {{booking_id}}. Our support team is reviewing.',
    variables: ['client_name', 'category', 'booking_id', 'dispute_id'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'dispute_more_info_client',
    channels: ['email', 'push'],
    category: 'dispute',
    title_template: 'More Information Needed',
    body_template: 'We need more information about dispute {{dispute_id}}. Please check your messages.',
    variables: ['client_name', 'dispute_id', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'dispute_more_info_cleaner',
    channels: ['email', 'sms'],
    category: 'dispute',
    title_template: 'More Information Needed',
    body_template: 'We need more information about dispute {{dispute_id}}. Please check your messages.',
    variables: ['cleaner_name', 'dispute_id', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'dispute_resolved_client_favor',
    channels: ['email', 'push'],
    category: 'dispute',
    title_template: 'Dispute Resolved',
    body_template: 'Your dispute has been resolved in your favor. {{refund_credits}} credits refunded to your wallet.',
    variables: ['client_name', 'refund_credits', 'refund_amount', 'dispute_id', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'dispute_resolved_split',
    channels: ['email', 'push'],
    category: 'dispute',
    title_template: 'Dispute Resolved',
    body_template: 'Your dispute has been resolved. Partial refund of {{refund_credits}} credits issued to your wallet.',
    variables: ['client_name', 'refund_credits', 'dispute_id', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'dispute_resolved_cleaner_favor',
    channels: ['email', 'push'],
    category: 'dispute',
    title_template: 'Dispute Resolved',
    body_template: 'After review, we determined the service met our quality standards. No refund issued.',
    variables: ['client_name', 'dispute_id', 'booking_id'],
    is_active: true,
    is_urgent: false
  },
  {
    code: 'dispute_resolved_no_action',
    channels: ['email'],
    category: 'dispute',
    title_template: 'Dispute Closed',
    body_template: 'Your dispute has been reviewed and closed without financial impact.',
    variables: ['client_name', 'dispute_id', 'booking_id'],
    is_active: true,
    is_urgent: false
  },

  // ============================================================================
  // ADMIN ALERTS
  // ============================================================================
  {
    code: 'alert_chargeback_admin',
    channels: ['email'],
    category: 'admin',
    title_template: 'ALERT: Chargeback Received',
    body_template: 'Chargeback received for booking {{booking_id}}. Amount: ${{amount}}. Automated dispute created.',
    variables: ['booking_id', 'amount'],
    is_active: true,
    is_urgent: true
  },
  {
    code: 'alert_high_dispute_rate_cleaner',
    channels: ['email'],
    category: 'admin',
    title_template: 'ALERT: High Dispute Rate',
    body_template: 'Cleaner {{cleaner_email}} has {{dispute_count}} disputes in the last 30 days.',
    variables: ['cleaner_email', 'dispute_count'],
    is_active: true,
    is_urgent: true
  }
];

/**
 * Seed all templates into the database
 */
export async function seedNotificationTemplates(base44) {
  console.log('[TemplateSeeder] Starting seed...');
  
  let created = 0;
  let updated = 0;

  for (const template of NOTIFICATION_TEMPLATES) {
    try {
      const existing = await base44.asServiceRole.entities.NotificationTemplate.filter({
        code: template.code
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.NotificationTemplate.update(existing[0].id, template);
        updated++;
      } else {
        await base44.asServiceRole.entities.NotificationTemplate.create(template);
        created++;
      }
    } catch (error) {
      console.error(`[TemplateSeeder] Error seeding ${template.code}:`, error);
    }
  }

  console.log(`[TemplateSeeder] Complete: ${created} created, ${updated} updated`);
  return { created, updated };
}