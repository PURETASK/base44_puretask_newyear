export interface CreateNotificationParams {
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  payload?: any;
  link?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotifyNewBookingParams {
  cleanerEmail: string;
  bookingId: string;
  clientName: string;
  date: string;
  time: string;
}

export interface NotifyBookingAcceptedParams {
  clientEmail: string;
  bookingId: string;
  cleanerName: string;
  date: string;
  time: string;
}

export const NotificationService: {
  create(params: CreateNotificationParams): Promise<{ success: boolean; notification?: any; error?: string }>;
  notifyNewBooking(params: NotifyNewBookingParams): Promise<{ success: boolean; notification?: any; error?: string }>;
  notifyBookingAccepted(params: NotifyBookingAcceptedParams): Promise<{ success: boolean; notification?: any; error?: string }>;
  // Add more methods as needed
};

