/**
 * Invoice Receipt Email Template
 * Template Key: email.invoice_receipt
 * Variables: {first_name, amount, job_id, date, cleaner_name, hours, link}
 */

export const getInvoiceReceiptEmailTemplate = () => {
  return {
    template_id: 'email.invoice_receipt',
    category: 'client',
    subject: 'Receipt for your cleaning - {{amount}} credits',
    html_body: `
      <div style="font-family: Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F7F9FC;">
        <div style="background: linear-gradient(135deg, #28C76F 0%, #20B864 100%); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka', sans-serif; color: white; font-size: 32px; margin: 0;">💳 Payment Receipt</h1>
        </div>

        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px;">
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 16px;">Hi {{first_name}},</p>
          
          <p style="font-size: 16px; color: #1D2533; margin-bottom: 24px;">
            Thank you for using PureTask! Your payment has been processed.
          </p>

          <div style="background: #F7F9FC; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Booking ID:</td>
                <td style="padding: 8px 0; color: #1D2533; font-size: 14px; text-align: right; font-weight: 600;">{{job_id}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Date:</td>
                <td style="padding: 8px 0; color: #1D2533; font-size: 14px; text-align: right;">{{date}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Cleaner:</td>
                <td style="padding: 8px 0; color: #1D2533; font-size: 14px; text-align: right;">{{cleaner_name}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Hours:</td>
                <td style="padding: 8px 0; color: #1D2533; font-size: 14px; text-align: right;">{{hours}}</td>
              </tr>
              <tr style="border-top: 2px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #1D2533; font-size: 18px; font-weight: bold;">Total:</td>
                <td style="padding: 12px 0; color: #28C76F; font-size: 24px; text-align: right; font-family: 'Fredoka', sans-serif; font-weight: bold;">{{amount}} credits</td>
              </tr>
            </table>
          </div>

          <div style="background: #E8FFF7; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #1D2533; margin: 0;">
              ✓ Payment processed securely<br/>
              ✓ Before/after photos included<br/>
              ✓ GPS check-in/out verified
            </p>
          </div>

          <div style="text-align: center;">
            <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #0078FF 0%, #00D4FF 100%); color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 16px;">
              View Full Receipt
            </a>
          </div>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
          This receipt serves as proof of payment. Keep for your records.
        </p>
      </div>
    `,
    sms_body: 'Payment processed: {{amount}} credits. Receipt: {{link}}',
    push_title: 'Payment Receipt',
    push_body: '{{amount}} credits processed successfully',
    deep_link: 'app://booking/{{job_id}}/receipt',
    variables: ['first_name', 'amount', 'job_id', 'date', 'cleaner_name', 'hours', 'link'],
    is_active: true,
    send_email: true,
    send_sms: true,
    send_push: false
  };
};

export default getInvoiceReceiptEmailTemplate;