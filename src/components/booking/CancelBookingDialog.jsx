import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import CancellationFeePreview from './CancellationFeePreview';

export default function CancelBookingDialog({ open, onOpenChange, booking, onSuccess }) {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await base44.functions.invoke('bookingAutomations', {
        action: 'cancel_booking',
        booking_id: booking.id,
        cancelled_by: 'client',
        cancellation_reason: reason || 'Client cancelled'
      });

      toast.success('Booking cancelled successfully');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <CancellationFeePreview
      booking={booking}
      open={open}
      onConfirm={handleConfirmCancel}
      onCancel={() => onOpenChange(false)}
    />
  );
}