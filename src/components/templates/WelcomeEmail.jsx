/**
 * Welcome Email Template
 * Template Key: email.account_welcome
 * Variables: {first_name, role}
 */

export const getWelcomeEmailTemplate = () => {
  return {
    template_id: 'email.account_welcome',
    category: 'client',
    subject: 'Welcome to PureTask ✨',
    html_body: `
      <div style="font-family: Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F7F9FC;">
        <div style="background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka', sans-serif; color: white; font-size: 36px; margin: 0 0 12px 0;">Welcome to PureTask! ✨</h1>
          <p style="color: white; font-size: 16px; margin: 0;">Cleaning made simple, transparent, and trustworthy</p>
        </div>

        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px;">
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">Hi {{first_name}},</p>
          
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">
            Thanks for joining PureTask! We're excited to help you find trusted, verified cleaners with complete transparency.
          </p>

          <div style="margin-bottom: 24px;">
            <h3 style="font-family: 'Fredoka', sans-serif; font-size: 20px; color: #1D2533; margin-bottom: 12px;">What Makes Us Different?</h3>
            
            <div style="background: #E8FFF7; padding: 12px 16px; border-radius: 12px; margin-bottom: 12px;">
              <p style="font-size: 14px; color: #1D2533; margin: 0;">
                <strong>📍 GPS Check-In/Out:</strong> Real-time arrival verification
              </p>
            </div>

            <div style="background: #F0F8FF; padding: 12px 16px; border-radius: 12px; margin-bottom: 12px;">
              <p style="font-size: 14px; color: #1D2533; margin: 0;">
                <strong>📸 Before/After Photos:</strong> Visual proof of every cleaning
              </p>
            </div>

            <div style="background: #FFF8E6; padding: 12px 16px; border-radius: 12px; margin-bottom: 12px;">
              <p style="font-size: 14px; color: #1D2533; margin: 0;">
                <strong>✅ Approve Before Payment:</strong> You review photos first
              </p>
            </div>

            <div style="background: #F3E8FF; padding: 12px 16px; border-radius: 12px;">
              <p style="font-size: 14px; color: #1D2533; margin: 0;">
                <strong>⭐ Reliability Scores:</strong> Book proven professionals
              </p>
            </div>
          </div>

          <div style="background: #F7F9FC; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
            <h3 style="font-family: 'Fredoka', sans-serif; font-size: 18px; color: #1D2533; margin-bottom: 12px;">Ready to Get Started?</h3>
            <ol style="font-size: 14px; color: #666; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Browse verified cleaners in your area</li>
              <li>Check Reliability Scores and reviews</li>
              <li>Book your preferred date and time</li>
              <li>Track GPS check-in and view photos</li>
              <li>Approve work before payment releases</li>
            </ol>
          </div>

          <div style="text-align: center;">
            <a href="https://app.puretask.com/browse" style="display: inline-block; background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 16px;">
              Browse Cleaners Now
            </a>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 16px; text-align: center;">
          <p style="font-size: 14px; color: #666; margin: 0;">
            Questions? We're here to help!<br/>
            <a href="mailto:support@puretask.com" style="color: #0078FF; text-decoration: none;">support@puretask.com</a>
          </p>
        </div>
      </div>
    `,
    sms_body: null, // Welcome emails are email-only
    push_title: 'Welcome to PureTask! ✨',
    push_body: 'Start booking trusted cleaners today',
    deep_link: 'app://browse',
    variables: ['first_name', 'role'],
    is_active: true,
    send_email: true,
    send_sms: false,
    send_push: true
  };
};

export default getWelcomeEmailTemplate;