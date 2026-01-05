/**
 * Event Bus - Section 2 Item 2 & Section 3.1
 * Central event dispatcher for domain events
 * Fans out to notification handlers, reliability updates, and automations
 */

import NotificationService from '../notifications/NotificationService';

/**
 * Event Registry - Maps events to handlers
 */
const EVENT_HANDLERS = {
  // Booking lifecycle events
  booking_created: [handleBookingCreated],
  job_invited: [handleJobInvited],
  job_accepted: [handleJobAccepted],
  job_checked_in: [handleJobCheckedIn],
  job_checked_out: [handleJobCheckedOut],
  job_approved: [handleJobApproved],
  
  // Credit events
  credits_purchased: [handleCreditsPurchased],
  subscription_renewed: [handleSubscriptionRenewed],
  subscription_dunning: [handleSubscriptionDunning],
  
  // Dispute events
  dispute_opened: [handleDisputeOpened],
  dispute_resolved: [handleDisputeResolved],
  
  // Payout events
  payout_sent: [handlePayoutSent],
  payout_failed: [handlePayoutFailed],
  
  // Reliability events
  reliability_changed: [handleReliabilityChanged]
};

/**
 * Emit an event and fan out to all handlers
 */
export const emit = async (eventName, payload) => {
  console.log(`[EventBus] Emitting: ${eventName}`, payload);

  const handlers = EVENT_HANDLERS[eventName] || [];
  
  const results = await Promise.allSettled(
    handlers.map(handler => handler(payload))
  );

  const errors = results.filter(r => r.status === 'rejected');
  if (errors.length > 0) {
    console.error(`[EventBus] Errors in ${eventName}:`, errors);
  }

  return { success: errors.length === 0, errors };
};

/**
 * Handler: booking_created (Section 3 - Flow A)
 */
async function handleBookingCreated(payload) {
  const { job_id, client_email, cleaner_email, start_at, address, client_name, cleaner_name } = payload;

  // Send confirmation to client
  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.booking_confirmed',
    channel: 'email',
    payload: {
      first_name: client_name?.split(' ')[0] || 'there',
      start_at,
      address,
      cleaner_name,
      link: `https://app.puretask.com/booking/${job_id}`
    }
  });

  // Send SMS confirmation
  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'sms.booking_confirmed',
    channel: 'sms',
    payload: { start_at, address, link: `https://app.puretask.com/booking/${job_id}` }
  });
}

/**
 * Handler: job_invited (Section 3 - Flow I)
 */
async function handleJobInvited(payload) {
  const { job_id, cleaner_email } = payload;

  await NotificationService.sendNotification({
    user_email: cleaner_email,
    job_id,
    template_key: 'sms.new_job_available',
    channel: 'sms',
    payload: { link: `https://app.puretask.com/jobs/${job_id}` }
  });
}

/**
 * Handler: job_accepted
 */
async function handleJobAccepted(payload) {
  const { job_id, client_email, cleaner_name } = payload;

  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.job_accepted',
    channel: 'email',
    payload: { 
      first_name: payload.client_name?.split(' ')[0] || 'there',
      cleaner_name,
      start_at: payload.start_at
    }
  });
}

/**
 * Handler: job_checked_in (Section 3 - Flow D)
 */
async function handleJobCheckedIn(payload) {
  const { job_id, client_email, cleaner_name, eta } = payload;

  // Send "on the way" notification
  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.cleaner_on_the_way',
    channel: 'email',
    payload: {
      first_name: payload.client_name?.split(' ')[0] || 'there',
      cleaner_name,
      eta: eta || 'Soon'
    },
    respect_quiet_hours: false // GPS arrival is exempt
  });

  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'sms.on_the_way',
    channel: 'sms',
    payload: { cleaner_name, eta: eta || 'Soon' },
    respect_quiet_hours: false // GPS arrival is exempt
  });
}

/**
 * Handler: job_checked_out (Section 3 - Flow E)
 */
async function handleJobCheckedOut(payload) {
  const { job_id, client_email, cleaner_name } = payload;

  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.cleaning_completed',
    channel: 'email',
    payload: {
      first_name: payload.client_name?.split(' ')[0] || 'there',
      cleaner_name,
      review_link: `https://app.puretask.com/booking/${job_id}/review`,
      link: `https://app.puretask.com/booking/${job_id}/approve`
    }
  });

  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'sms.finished',
    channel: 'sms',
    payload: { link: `https://app.puretask.com/booking/${job_id}/approve` }
  });
}

/**
 * Handler: job_approved (Section 3 - Flow F)
 */
async function handleJobApproved(payload) {
  const { job_id, client_email, cleaner_email, amount } = payload;

  // Send receipt to client
  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.invoice_receipt',
    channel: 'email',
    payload: {
      first_name: payload.client_name?.split(' ')[0] || 'there',
      amount: Math.round(amount * 10),
      job_id,
      date: payload.date || new Date().toLocaleDateString(),
      cleaner_name: payload.cleaner_name,
      hours: payload.hours || 0,
      link: `https://app.puretask.com/booking/${job_id}/receipt`
    }
  });

  // Notify cleaner of pending payout
  await NotificationService.sendNotification({
    user_email: cleaner_email,
    job_id,
    template_key: 'sms.payment_receipt',
    channel: 'sms',
    payload: { amount: Math.round(amount * 10) }
  });
}

/**
 * Handler: credits_purchased
 */
async function handleCreditsPurchased(payload) {
  const { user_email, credits } = payload;

  await NotificationService.sendNotification({
    user_email,
    template_key: 'email.invoice_receipt',
    channel: 'email',
    payload: {
      first_name: payload.first_name || 'there',
      amount: Math.round(credits * 10)
    }
  });
}

/**
 * Handler: subscription_renewed (Section 3 - Flow 4.3)
 */
async function handleSubscriptionRenewed(payload) {
  const { user_email, plan_name, credits } = payload;

  await NotificationService.sendNotification({
    user_email,
    template_key: 'email.subscription_renewed',
    channel: 'email',
    payload: {
      first_name: payload.first_name || 'there',
      plan_name,
      credits: Math.round(credits * 10)
    }
  });
}

/**
 * Handler: subscription_dunning (Section 3 - Flow G)
 */
async function handleSubscriptionDunning(payload) {
  const { user_email, invoice_id } = payload;

  await NotificationService.sendNotification({
    user_email,
    template_key: 'email.payment_failed',
    channel: 'email',
    payload: {
      first_name: payload.first_name || 'there',
      manage_link: `https://app.puretask.com/wallet/payment-methods`
    },
    respect_quiet_hours: false // Payment failures are urgent
  });

  await NotificationService.sendNotification({
    user_email,
    template_key: 'sms.payment_failed',
    channel: 'sms',
    payload: {
      manage_link: `https://app.puretask.com/wallet/payment-methods`
    },
    respect_quiet_hours: false // Payment failures are urgent
  });
}

/**
 * Handler: dispute_opened
 */
async function handleDisputeOpened(payload) {
  const { job_id, client_email, cleaner_email } = payload;

  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.dispute_opened',
    channel: 'email',
    payload: { job_id }
  });

  await NotificationService.sendNotification({
    user_email: cleaner_email,
    job_id,
    template_key: 'email.dispute_opened',
    channel: 'email',
    payload: { job_id }
  });
}

/**
 * Handler: dispute_resolved
 */
async function handleDisputeResolved(payload) {
  const { job_id, client_email, cleaner_email, resolution_summary } = payload;

  await NotificationService.sendNotification({
    user_email: client_email,
    job_id,
    template_key: 'email.dispute_resolved',
    channel: 'email',
    payload: {
      first_name: payload.client_name?.split(' ')[0] || 'there',
      job_id,
      resolution_summary
    }
  });

  await NotificationService.sendNotification({
    user_email: cleaner_email,
    job_id,
    template_key: 'email.dispute_resolved',
    channel: 'email',
    payload: {
      first_name: payload.cleaner_name?.split(' ')[0] || 'there',
      job_id,
      resolution_summary
    }
  });
}

/**
 * Handler: payout_sent (Section 3 - Payout Flow)
 */
async function handlePayoutSent(payload) {
  const { cleaner_email, amount } = payload;

  await NotificationService.sendNotification({
    user_email: cleaner_email,
    template_key: 'email.payout_sent',
    channel: 'email',
    payload: {
      first_name: payload.cleaner_name?.split(' ')[0] || 'there',
      amount: `$${amount.toFixed(2)}`
    }
  });

  await NotificationService.sendNotification({
    user_email: cleaner_email,
    template_key: 'sms.payout_sent',
    channel: 'sms',
    payload: { amount: `$${amount.toFixed(2)}` }
  });
}

/**
 * Handler: payout_failed
 */
async function handlePayoutFailed(payload) {
  // Admin alert only
  console.error('Payout failed:', payload);
}

/**
 * Handler: reliability_changed (Section 3 - Flow H)
 */
async function handleReliabilityChanged(payload) {
  const { cleaner_email, score, tier } = payload;

  await NotificationService.sendNotification({
    user_email: cleaner_email,
    template_key: 'sms.reliability_changed',
    channel: 'sms',
    payload: { score, tier }
  });
}

export default {
  emit,
  EVENT_HANDLERS
};