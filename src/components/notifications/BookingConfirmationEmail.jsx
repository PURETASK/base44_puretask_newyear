import { base44 } from '@/api/base44Client';

/**
 * Send booking confirmation email to client with full details
 */
export async function sendBookingConfirmationEmail(booking, cleaner, client) {
  try {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const startTime = convertTo12Hour(booking.start_time);
    
    // Format tasks list
    const tasksList = booking.tasks
      .map(task => `• ${task.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`)
      .join('\n');

    // Get base URL for dashboard link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Email body
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .section h3 { margin-top: 0; color: #059669; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .detail-value { color: #111827; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .timeline { margin: 20px 0; }
    .timeline-item { display: flex; align-items: start; margin: 15px 0; }
    .timeline-icon { width: 30px; height: 30px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Booking Confirmed!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your cleaning is scheduled</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h3>📅 Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${bookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${startTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${booking.hours} hours</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span class="detail-value">${booking.address}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Price:</span>
          <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #10b981;">$${booking.total_price.toFixed(2)}</span>
        </div>
      </div>

      <div class="section">
        <h3>👤 Your Cleaner</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${cleaner.full_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Rating:</span>
          <span class="detail-value">⭐ ${cleaner.average_rating.toFixed(1)} (${cleaner.total_reviews} reviews)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tier:</span>
          <span class="detail-value">${cleaner.tier}</span>
        </div>
      </div>

      <div class="section">
        <h3>🧹 Services Included</h3>
        <pre style="font-family: Arial, sans-serif; margin: 10px 0; white-space: pre-wrap;">${tasksList}</pre>
      </div>

      <div class="section">
        <h3>📋 What Happens Next</h3>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-icon">1</div>
            <div>
              <strong>Cleaner Confirmation</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Your cleaner will confirm within 4 hours</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon">2</div>
            <div>
              <strong>Reminder Notifications</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">We'll send reminders before your cleaning</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon">3</div>
            <div>
              <strong>Cleaning Day</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Your cleaner arrives and completes the service</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon">4</div>
            <div>
              <strong>Review & Approve</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Review before/after photos and approve the work</p>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/ClientDashboard" class="cta-button">
          View Booking in Dashboard
        </a>
      </div>

      <div class="section" style="background: #fef3c7; border-left-color: #f59e0b;">
        <h3 style="color: #d97706;">💳 Payment Information</h3>
        <p style="margin: 0;">Your card has been authorized but <strong>not charged yet</strong>. Payment will only be captured after you approve the completed work.</p>
      </div>
    </div>

    <div class="footer">
      <p>Questions? Reply to this email or visit our support center.</p>
      <p style="margin: 10px 0;">© 2024 PureTask. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Core.SendEmail integration
    await base44.integrations.Core.SendEmail({
      from_name: 'PureTask',
      to: client.email,
      subject: `✅ Booking Confirmed - ${bookingDate} at ${startTime}`,
      body: emailBody
    });

    console.log(`✅ Booking confirmation email sent to ${client.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
}

// Helper function
function convertTo12Hour(time24) {
  if (!time24) return '12:00 PM';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes || '00';
  
  if (hour === 0) return `12:${min} AM`;
  if (hour < 12) return `${hour}:${min} AM`;
  if (hour === 12) return `12:${min} PM`;
  return `${hour - 12}:${min} PM`;
}