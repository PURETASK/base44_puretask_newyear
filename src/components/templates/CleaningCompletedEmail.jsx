/**
 * Cleaning Completed Email Template
 * Template Key: email.cleaning_completed
 * Variables: {first_name, cleaner_name, review_link, link}
 */

export const getCleaningCompletedEmailTemplate = () => {
  return {
    template_id: 'email.cleaning_completed',
    category: 'client',
    subject: 'Review your cleaning - approval required',
    html_body: `
      <div style="font-family: Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F7F9FC;">
        <div style="background: linear-gradient(135deg, #28C76F 0%, #20B864 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka', sans-serif; color: white; font-size: 32px; margin: 0;">✨ Cleaning Complete!</h1>
        </div>

        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px;">
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 16px;">Hi {{first_name}},</p>
          
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">
            {{cleaner_name}} has finished your cleaning! Review the before/after photos and approve to release payment.
          </p>

          <div style="background: #FFF8E6; border-left: 4px solid #FFB800; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1D2533; margin: 0;">
              ⏰ <strong>Action Required:</strong> Please review within 24 hours. If no action is taken, we'll auto-approve and process payment.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 16px; margin-bottom: 12px;">
              Review & Approve
            </a>
          </div>

          <div style="text-align: center;">
            <a href="{{review_link}}" style="color: #0078FF; text-decoration: none; font-size: 14px;">
              Rate your cleaner →
            </a>
          </div>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
          Need help? Contact <a href="mailto:support@puretask.com" style="color: #0078FF;">support@puretask.com</a>
        </p>
      </div>
    `,
    sms_body: '✨ Cleaning complete! Approve/review: {{link}}',
    push_title: 'Cleaning Complete! ✨',
    push_body: 'Review before/after photos and approve payment',
    deep_link: 'app://booking/{{job_id}}/review',
    variables: ['first_name', 'cleaner_name', 'review_link', 'link', 'job_id'],
    is_active: true,
    send_email: true,
    send_sms: true,
    send_push: true
  };
};

export default getCleaningCompletedEmailTemplate;