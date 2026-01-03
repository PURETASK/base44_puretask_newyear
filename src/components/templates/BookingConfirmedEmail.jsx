/**
 * Booking Confirmed Email Template
 * Template Key: email.booking_confirmed
 * Variables: {first_name, start_at, address, cleaner_name, link}
 */

export const getBookingConfirmedEmailTemplate = () => {
  return {
    template_id: 'email.booking_confirmed',
    category: 'client',
    subject: 'Your cleaning is booked for {{start_at}} ✨',
    html_body: `
      <div style="font-family: Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F7F9FC;">
        <div style="background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka', sans-serif; color: white; font-size: 32px; margin: 0;">🎉 Booking Confirmed!</h1>
        </div>

        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px;">
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 16px;">Hi {{first_name}},</p>
          
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">
            Great news! Your cleaning is confirmed for <strong>{{start_at}}</strong> at <strong>{{address}}</strong>.
          </p>

          <div style="background: #F7F9FC; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1D2533; margin-bottom: 8px;"><strong>Your Cleaner:</strong></p>
            <p style="font-size: 16px; color: #0078FF; font-weight: bold; margin: 0;">{{cleaner_name}}</p>
          </div>

          <div style="background: #E8FFF7; border-left: 4px solid #28C76F; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1D2533; margin: 0;">
              ✓ <strong>GPS check-in/out</strong> - Real-time tracking<br/>
              ✓ <strong>Before/after photos</strong> - Visual proof<br/>
              ✓ <strong>Pay only after approval</strong> - You're protected
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
            Credits have been held in escrow. Unused credits will be refunded automatically after the cleaning.
          </p>

          <div style="text-align: center;">
            <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 16px;">
              View Booking Details
            </a>
          </div>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
          Questions? Reply to this email or visit our <a href="https://puretask.com/support" style="color: #0078FF;">Help Center</a>
        </p>
      </div>
    `,
    sms_body: 'Booked for {{start_at}} at {{address}}. View details: {{link}}',
    push_title: 'Booking Confirmed ✨',
    push_body: 'Your cleaning is scheduled for {{start_at}}',
    deep_link: 'app://booking/{{job_id}}',
    variables: ['first_name', 'start_at', 'address', 'cleaner_name', 'link', 'job_id'],
    is_active: true,
    send_email: true,
    send_sms: true,
    send_push: true
  };
};

export default getBookingConfirmedEmailTemplate;