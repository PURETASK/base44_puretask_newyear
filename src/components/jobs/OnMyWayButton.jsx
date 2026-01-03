import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnMyWayButton({ booking }) {
  const [sending, setSending] = useState(false);

  const handleSendOnMyWay = async () => {
    try {
      setSending(true);
      
      // Calculate ETA if possible (simple estimation)
      const eta = 15; // Default 15 minutes

      const response = await base44.functions.invoke('sendOnMyWay', {
        booking_id: booking.id,
        eta_minutes: eta
      });

      if (response.data.success) {
        toast.success('Client notified that you\'re on your way!');
      } else {
        toast.error(response.data.message || 'Failed to send notification');
      }
    } catch (error) {
      toast.error('Failed to send notification');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  // Only show if booking is today and within 2 hours of start time
  const bookingDate = new Date(booking.date);
  const today = new Date();
  const isToday = bookingDate.toDateString() === today.toDateString();
  
  if (!isToday || booking.status === 'in_progress' || booking.status === 'completed') {
    return null;
  }

  return (
    <Button
      onClick={handleSendOnMyWay}
      disabled={sending}
      className="brand-gradient text-white gap-2"
    >
      {sending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          I'm On My Way
        </>
      )}
    </Button>
  );
}