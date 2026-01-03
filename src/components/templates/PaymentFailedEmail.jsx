/**
 * Payment Failed Email Template
 * Template Key: email.payment_failed
 * Variables: {first_name, manage_link}
 * Note: Exempt from quiet hours (urgent)
 */

export const getPaymentFailedEmailTemplate = () => {
  return {
    template_id: 'email.payment_failed',
    category: 'client',
    subject: '⚠️ Payment Issue - Action Required',
    html_body: `
      <div style="font-family: Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F7F9FC;">
        <div style="background: linear-gradient(135deg, #FF5757 0%, #FF3838 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka', sans-serif; color: white; font-size: 28px; margin: 0;">⚠️ Payment Could Not Be Processed</h1>
        </div>

        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px;">
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 16px;">Hi {{first_name}},</p>
          
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">
            We couldn't process your payment. This may affect your ability to book new cleanings.
          </p>

          <div style="background: #FFF0F0; border-left: 4px solid #FF5757; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1D2533; margin: 0;">
              <strong>Common reasons:</strong><br/>
              • Expired credit card<br/>
              • Insufficient funds<br/>
              • Card declined by bank
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="{{manage_link}}" style="display: inline-block; background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 16px;">
              Update Payment Method
            </a>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center;">
            We'll retry your payment automatically. Update your card to continue using PureTask.
          </p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
          Questions? Contact <a href="mailto:support@puretask.com" style="color: #0078FF;">support@puretask.com</a>
        </p>
      </div>
    `,
    sms_body: '⚠️ Payment issue detected. Update your card: {{manage_link}}',
    push_title: 'Payment Failed',
    push_body: 'Please update your payment method',
    deep_link: 'app://wallet/payment-methods',
    variables: ['first_name', 'manage_link'],
    is_active: true,
    send_email: true,
    send_sms: true,
    send_push: false
  };
};

export default getPaymentFailedEmailTemplate;