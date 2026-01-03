
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { convertTo12Hour } from '../utils/timeUtils';
import {
  sendCleanerOpenedRequestNotification,
  sendTimeReminderNotification,
  sendFallbackActivatedNotification,
  sendBookingConfirmedNotification
} from '../notifications/ProactiveNotifications';

/**
 * Generates and sends detailed booking confirmation to both client and cleaner
 */
export async function sendBookingConfirmation(booking) {
  try {
    // Get user details
    const clientUsers = await base44.entities.User.filter({ email: booking.client_email });
    const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });

    if (clientUsers.length === 0 || cleanerUsers.length === 0) {
      console.error('Could not find client or cleaner user');
      return { success: false };
    }

    const client = clientUsers[0];
    const cleaner = cleanerUsers[0];

    // Get cleaner profile for additional details
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: cleaner.email });
    const cleanerProfile = cleanerProfiles[0];

    // Format booking details
    const formattedDate = format(parseISO(booking.date), 'EEEE, MMMM d, yyyy');
    const formattedTime = convertTo12Hour(booking.start_time);
    const endTimeCalculation = new Date(`2000-01-01T${booking.start_time}`);
    endTimeCalculation.setHours(endTimeCalculation.getHours() + booking.hours);
    const endTime = convertTo12Hour(endTimeCalculation.toTimeString().slice(0, 5));

    // Calculate cleaner payout (85% of total)
    const cleanerPayout = (booking.total_price * 0.85).toFixed(2);
    const platformFee = (booking.total_price * 0.15).toFixed(2);

    // Format tasks list
    const tasksList = booking.tasks.map(task =>
      `  • ${task.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
    ).join('\n');

    // Generate confirmation agreement text
    const agreementText = `
══════════════════════════════════════════════════════════
                 BOOKING CONFIRMATION AGREEMENT
══════════════════════════════════════════════════════════

CONFIRMATION NUMBER: ${booking.id.slice(0, 8).toUpperCase()}
BOOKING DATE: ${formattedDate}
CONFIRMED ON: ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARTIES:

Client:
  Name: ${client.full_name}
  Email: ${client.email}
  Phone: ${client.phone || 'Not provided'}

Cleaner:
  Name: ${cleaner.full_name}
  Email: ${cleaner.email}
  Phone: ${cleaner.phone || 'Not provided'}
  ${cleanerProfile ? `Tier: ${cleanerProfile.tier} | Reliability Score: ${cleanerProfile.reliability_score}/100` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SERVICE DETAILS:

📅 Date: ${formattedDate}
⏰ Time: ${formattedTime} - ${endTime}
⏱️  Duration: ${booking.hours} hour${booking.hours !== 1 ? 's' : ''}

📍 Location:
  ${booking.address}

🧹 Services Requested:
${tasksList}

${booking.task_quantities && Object.keys(booking.task_quantities).length > 0 ? `
📊 Quantities:
${Object.entries(booking.task_quantities).map(([key, val]) => `  • ${key}: ${val}`).join('\n')}
` : ''}

${booking.notes ? `
📝 Special Instructions:
  ${booking.notes}
` : ''}

${booking.parking_instructions ? `
🅿️  Parking Instructions:
  ${booking.parking_instructions}
` : ''}

${booking.entry_instructions ? `
🚪 Entry Instructions:
  ${booking.entry_instructions}
` : ''}

${booking.product_allergies ? `
⚠️  Product Allergies/Sensitivities:
  ${booking.product_allergies}
` : ''}

${booking.product_preferences ? `
✨ Product Preferences:
  ${booking.product_preferences}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT BREAKDOWN:

Total Service Cost: $${booking.total_price.toFixed(2)}
Platform Fee (15%): $${platformFee}
Cleaner Payout (85%): $${cleanerPayout}

Payment Status: SECURED ✓
Payment will be released to cleaner after service completion and photo verification.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TERMS OF AGREEMENT:

Client Responsibilities:
✓ Ensure property access at scheduled time
✓ Provide accurate special instructions
✓ Be available for any questions or concerns
✓ Review and rate service after completion

Cleaner Responsibilities:
✓ Arrive within 15 minutes of scheduled time
✓ GPS check-in upon arrival
✓ Take before and after photos
✓ Complete all agreed-upon tasks
✓ Follow all product preferences and allergies

Cancellation Policy:
• More than 24 hours: Free cancellation or reschedule
• Less than 24 hours: 50% cancellation fee
• No-show: Full charge + $15 inconvenience fee

Quality Guarantee:
Both parties agree to PureTask's quality standards and dispute resolution process.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By accepting this booking, both parties agree to the terms outlined above
and acknowledge their responsibilities for a successful service.

Questions? Contact PureTask Support: support@puretask.com

══════════════════════════════════════════════════════════
          Thank you for using PureTask! ✨
══════════════════════════════════════════════════════════
`;

    // Send to CLIENT
    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: `✅ Booking Confirmed - ${formattedDate} at ${formattedTime}`,
      body: `Hi ${client.full_name},

Great news! Your cleaning service has been confirmed with ${cleaner.full_name}.

${agreementText}

WHAT'S NEXT FOR YOU:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. You'll receive a reminder 24 hours before your appointment
2. Make sure someone is available to provide access if needed
3. Your cleaner will check in via GPS when they arrive
4. You'll see before/after photos when the service is complete
5. Please review your cleaner to help maintain quality standards

Need to make changes? Log in to your dashboard to reschedule or cancel.

Best regards,
The PureTask Team`
    });

    // Send to CLEANER
    await base44.integrations.Core.SendEmail({
      to: cleaner.email,
      subject: `✅ New Job Confirmed - ${formattedDate} at ${formattedTime} ($${cleanerPayout} payout)`,
      body: `Hi ${cleaner.full_name},

Congratulations! You have a new confirmed cleaning job.

${agreementText}

WHAT'S NEXT FOR YOU:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review all special instructions and product requirements
2. Arrive within 15 minutes of scheduled time: ${formattedTime}
3. Check in via GPS when you arrive (mandatory)
4. Take clear before photos of all areas you'll be cleaning
5. Complete all agreed-upon tasks thoroughly
6. Take after photos showing your great work
7. Check out via GPS when complete

IMPORTANT REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ GPS check-in is REQUIRED (affects your reliability score)
✓ Before/after photos are REQUIRED for payment release
✓ Respect all product allergies and preferences listed above
✓ You have a 15-minute grace period for arrival time

Your payout of $${cleanerPayout} will be available in your earnings after service completion and photo verification.

Good luck and great cleaning!
The PureTask Team`
    });

    // Log the confirmation event
    await base44.entities.Event.create({
      booking_id: booking.id,
      event_type: 'confirmed',
      user_email: 'system',
      details: `Confirmation agreement sent to both ${client.email} and ${cleaner.email}`,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if both parties have confirmed and send confirmation if yes
 */
export async function checkAndSendConfirmation(bookingId) {
  try {
    const booking = await base44.entities.Booking.get(bookingId);

    // Only send if both parties have confirmed and status is pending_confirmation
    if (booking.client_confirmed && booking.cleaner_confirmed && booking.status === 'pending_confirmation') {
      // Update status to confirmed
      await base44.entities.Booking.update(bookingId, {
        status: 'confirmed'
      });

      // Send confirmation to both parties
      await sendBookingConfirmation(booking);

      return { success: true, message: 'Booking confirmed and notifications sent' };
    }

    return { success: false, message: 'Waiting for both parties to confirm' };
  } catch (error) {
    console.error('Error checking and sending confirmation:', error);
    return { success: false, error: error.message };
  }
}

export async function processBookingRequest(bookingId) {
  const booking = await base44.entities.Booking.get(bookingId);

  // Set expiration time
  const requestSentAt = new Date();
  const requestExpiresAt = new Date(requestSentAt.getTime() + 4 * 60 * 60 * 1000); // 4 hours

  await base44.entities.Booking.update(bookingId, {
    request_sent_at: requestSentAt.toISOString(),
    request_expires_at: requestExpiresAt.toISOString(),
    status: 'awaiting_cleaner_response'
  });

  // Note: In production, you'd use a proper job queue (AWS SQS, Redis, etc.)
  // For now, we'll track these in a simple way
  console.log(`Booking ${bookingId} request sent, expires at ${requestExpiresAt.toISOString()}`);
}

// This would be called when cleaner views the booking
export async function notifyCleanerViewedBooking(bookingId) {
  try {
    const booking = await base44.entities.Booking.get(bookingId);

    // Update viewed timestamp
    await base44.entities.Booking.update(bookingId, {
      cleaner_viewed_at: new Date().toISOString()
    });

    // Send notification to client
    const [clientUser] = await base44.entities.User.filter({ email: booking.client_email });
    const [cleanerProfile] = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email }); // This variable isn't used, but kept from the outline.
    const [cleanerUser] = await base44.entities.User.filter({ email: booking.cleaner_email });

    await sendCleanerOpenedRequestNotification(booking, clientUser, cleanerUser);
  } catch (error) {
    console.error('Error notifying cleaner viewed booking:', error);
  }
}

// This would be called when cleaner accepts
export async function handleCleanerAcceptance(bookingId) {
  try {
    const booking = await base44.entities.Booking.get(bookingId);

    await base44.entities.Booking.update(bookingId, {
      status: 'scheduled',
      cleaner_confirmed: true
    });

    const [clientUser] = await base44.entities.User.filter({ email: booking.client_email });
    const [cleanerUser] = await base44.entities.User.filter({ email: booking.cleaner_email });

    await sendBookingConfirmedNotification(booking, clientUser, cleanerUser);
  } catch (error) {
    console.error('Error handling cleaner acceptance:', error);
  }
}

/**
 * Complete a booking and handle new cleaner milestone
 */
export async function completeBookingAndCheckMilestone(bookingId) {
  try {
    const booking = await base44.entities.Booking.get(bookingId);

    // Get cleaner profile
    const cleanerProfiles = await base44.entities.CleanerProfile.filter({
      user_email: booking.cleaner_email
    });

    if (cleanerProfiles.length === 0) {
      throw new Error('Cleaner profile not found');
    }

    const cleanerProfile = cleanerProfiles[0];
    const previousJobCount = cleanerProfile.total_jobs || 0;

    // Increment job count
    await base44.entities.CleanerProfile.update(cleanerProfile.id, {
      total_jobs: previousJobCount + 1
    });

    // If this was their 5th job, send congratulations email
    if (previousJobCount === 4) { // Was 4, now will be 5
      const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });
      const cleanerUser = cleanerUsers[0];

      await base44.integrations.Core.SendEmail({
        from_name: 'PureTask',
        to: booking.cleaner_email,
        subject: '🎉 Congratulations! You completed your first 5 jobs!',
        body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
    .milestone-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🎉 Amazing Milestone!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You've completed your first 5 jobs!</p>
    </div>

    <div class="content">
      <h2 style="color: #059669;">Congratulations, ${cleanerUser?.full_name || 'Cleaner'}!</h2>

      <p>This is a huge achievement! You've successfully completed your first 5 jobs on PureTask and are now a verified, experienced cleaner on our platform.</p>

      <div class="milestone-badge">
        <h3 style="margin: 0; font-size: 24px;">✨ New Cleaner Program Complete</h3>
        <p style="margin: 10px 0 0 0;">Your introductory discount has now ended</p>
      </div>

      <h3 style="color: #059669;">What's Changed:</h3>
      <ul>
        <li><strong>Full Rate Earnings:</strong> You now charge your full rate of <strong>$${cleanerProfile.hourly_rate}/hour</strong></li>
        <li><strong>No More Subsidy:</strong> The platform subsidy has ended - you're earning 100% of your posted rate</li>
        <li><strong>Established Profile:</strong> You now have reviews and a track record that attracts clients</li>
        <li><strong>Priority Placement Ended:</strong> Your "New Cleaner" badge has been removed</li>
      </ul>

      <h3 style="color: #059669;">Keep Growing:</h3>
      <ul>
        <li>Maintain your high reliability score to attract premium clients</li>
        <li>Encourage clients to leave reviews after each job</li>
        <li>Complete your profile with before/after photos</li>
        <li>Consider adding specialty services to stand out</li>
      </ul>

      <div style="text-align: center;">
        <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/CleanerDashboard" class="cta-button">
          View Your Dashboard
        </a>
      </div>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        Keep up the excellent work! We're excited to see your continued success on PureTask.
      </p>
    </div>
  </div>
</body>
</html>`
      });

      console.log(`🎉 Sent 5-job milestone email to ${booking.cleaner_email}`);
    }

    return {
      success: true,
      milestone_reached: previousJobCount === 4,
      new_job_count: previousJobCount + 1
    };
  } catch (error) {
    console.error('Error completing booking and checking milestone:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
