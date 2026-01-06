export interface SendNotificationOptions {
  sendSMS?: boolean;
  phone?: string;
}

export interface SendNotificationResult {
  success: boolean;
  error?: string;
}

export function sendNotification(
  templateId: string,
  recipientEmailOrVariables: string | Record<string, any>,
  variables?: Record<string, any>,
  options?: SendNotificationOptions
): Promise<SendNotificationResult>;

export function sendBookingConfirmation(
  booking: any,
  clientName: string,
  cleanerName: string
): Promise<SendNotificationResult>;

export function sendCleanerOnWay(
  booking: any,
  clientName: string,
  cleanerName: string
): Promise<SendNotificationResult>;

export function sendCleaningCompleted(
  booking: any,
  clientName: string
): Promise<SendNotificationResult>;

export function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  userType: 'client' | 'cleaner'
): Promise<SendNotificationResult>;

export function sendJobInvite(
  booking: any,
  cleanerEmail: string,
  cleanerName: string
): Promise<SendNotificationResult>;

export function sendReliabilityScoreUpdate(
  cleanerEmail: string,
  cleanerName: string,
  newScore: number,
  oldScore: number
): Promise<SendNotificationResult>;

export function sendPaymentReceipt(
  booking: any,
  clientEmail: string,
  clientName: string,
  cleanerName: string
): Promise<SendNotificationResult>;

export function sendPaymentFailed(
  booking: any,
  clientEmail: string,
  clientName: string,
  reason: string
): Promise<SendNotificationResult>;

export function sendReviewRequest(
  booking: any,
  clientEmail: string,
  clientName: string
): Promise<SendNotificationResult>;

export function sendWinbackEmail(
  clientEmail: string,
  clientName: string,
  creditAmount?: number
): Promise<SendNotificationResult>;

export function sendReferralInvite(
  referrerEmail: string,
  referrerName: string,
  referralLink: string
): Promise<SendNotificationResult>;

declare const EmailService: {
  sendNotification(
    templateId: string,
    recipientEmailOrVariables: string | Record<string, any>,
    variables?: Record<string, any>,
    options?: SendNotificationOptions
  ): Promise<SendNotificationResult>;
  sendBookingConfirmation: typeof sendBookingConfirmation;
  sendCleanerOnWay: typeof sendCleanerOnWay;
  sendCleaningCompleted: typeof sendCleaningCompleted;
  sendWelcomeEmail: typeof sendWelcomeEmail;
  sendJobInvite: typeof sendJobInvite;
  sendReliabilityScoreUpdate: typeof sendReliabilityScoreUpdate;
  sendPaymentReceipt: typeof sendPaymentReceipt;
  sendPaymentFailed: typeof sendPaymentFailed;
  sendReviewRequest: typeof sendReviewRequest;
  sendWinbackEmail: typeof sendWinbackEmail;
  sendReferralInvite: typeof sendReferralInvite;
};

export default EmailService;

