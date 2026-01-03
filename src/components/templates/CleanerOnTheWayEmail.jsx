/**
 * Cleaner On The Way Email Template
 * Template Key: email.cleaner_on_the_way
 * Variables: {first_name, cleaner_name, eta}
 * Note: Exempt from quiet hours
 */

export const getCleanerOnTheWayEmailTemplate = () => {
  return {
    template_id: 'email.cleaner_on_the_way',
    category: 'client',
    subject: '🚗 {{cleaner_name}} is on the way!',
    html_body: `
      <div style="font-family: Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F7F9FC;">
        <div style="background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka', sans-serif; color: white; font-size: 32px; margin: 0;">🚗 Your Cleaner is On The Way!</h1>
        </div>

        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px;">
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 16px;">Hi {{first_name}},</p>
          
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">
            {{cleaner_name}} has checked in and is heading to your location now.
          </p>

          <div style="background: #E8FFF7; border-left: 4px solid #28C76F; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1D2533; margin: 0;">
              ✓ <strong>GPS Verified:</strong> Check-in confirmed<br/>
              ⏱️ <strong>ETA:</strong> {{eta}}<br/>
              📸 <strong>Next:</strong> Before/after photos will be uploaded
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
            Make sure someone is available to let the cleaner in, or ensure entry instructions are accessible.
          </p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
          Need to contact your cleaner? Use the in-app messaging feature.
        </p>
      </div>
    `,
    sms_body: '🚗 {{cleaner_name}} checked in (GPS verified) and is on the way! ETA: {{eta}}',
    push_title: 'Your Cleaner is On The Way! 🚗',
    push_body: '{{cleaner_name}} is heading to your location (GPS verified)',
    deep_link: 'app://booking/{{job_id}}/tracking',
    variables: ['first_name', 'cleaner_name', 'eta', 'job_id'],
    is_active: true,
    send_email: true,
    send_sms: true,
    send_push: true
  };
};

export default getCleanerOnTheWayEmailTemplate;