
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, XCircle, AlertTriangle, MessageSquare, Receipt, CheckCircle2, X } from 'lucide-react'; // Added CheckCircle2 and X for accept/decline icons
import RescheduleBooking from './RescheduleBooking';
import CancellationPolicy from './CancellationPolicy';
import DisputeForm from '../disputes/DisputeForm';
import ReceiptModal from '../receipts/ReceiptModal';

// Assuming base44 is a custom utility or API client.
// This import path is a common convention; adjust if your project uses a different path.
import * as base44 from '@/lib/base44';

export default function BookingActions({ booking, userEmail, userType, cleanerAvailability, onUpdate }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // New state for handling accept/decline actions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canReschedule = () => {
    return booking.status === 'pending_confirmation' || booking.status === 'confirmed';
  };

  const canCancel = () => {
    return booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'disputed';
  };

  const canDispute = () => {
    return booking.status === 'completed' && userType === 'client';
  };

  const canViewReceipt = () => {
    return booking.status === 'completed';
  };

  // New conditions for cleaner actions
  const canAcceptDecline = () => {
    // Only cleaner can accept/decline if booking is awaiting cleaner confirmation
    return userType === 'cleaner' && booking.cleaner_email === userEmail && booking.status === 'pending_confirmation' && !booking.cleaner_confirmed;
  };

  const handleAccept = async () => {
    if (!booking) return;
    setLoading(true);
    setError('');

    try {
      await base44.entities.Booking.update(booking.id, {
        cleaner_confirmed: true,
        status: booking.client_confirmed ? 'scheduled' : 'awaiting_client_confirmation' // Ensure status logic is correct
      });

      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'cleaner_confirmed',
        user_email: booking.cleaner_email,
        details: 'Cleaner confirmed the booking',
        timestamp: new Date().toISOString()
      });

      // ADDED: Send notification to client
      try {
        const clientUsers = await base44.entities.User.filter({ email: booking.client_email });
        if (clientUsers.length > 0 && clientUsers[0].sms_consent) { // Assuming sms_consent implies email consent or general notification preference
          await base44.integrations.Core.SendEmail({
            to: booking.client_email,
            subject: '✅ Cleaner Confirmed Your Booking!',
            body: `Great news! Your cleaner has accepted your booking:

Date: ${booking.date}
Time: ${booking.start_time}
Address: ${booking.address}

Your booking is now confirmed. You'll receive a reminder 24 hours before.`
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify client:', notifErr);
      }

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error accepting booking:', err);
      setError('Failed to accept booking');
    }
    setLoading(false);
  };

  const handleDecline = async () => {
    if (!booking) return;
    setLoading(true);
    setError('');

    try {
      // Existing booking update logic (implied by "keep existing code until after booking update")
      await base44.entities.Booking.update(booking.id, {
        cleaner_confirmed: false,
        status: 'declined_by_cleaner' // Assuming this is the status for a declined booking
      });

      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'cleaner_declined',
        user_email: booking.cleaner_email,
        details: 'Cleaner declined the booking',
        timestamp: new Date().toISOString()
      });

      // ADDED: Send notification to client
      try {
        const clientUsers = await base44.entities.User.filter({ email: booking.client_email });
        if (clientUsers.length > 0 && clientUsers[0].sms_consent) { // Assuming sms_consent implies email consent or general notification preference
          await base44.integrations.Core.SendEmail({
            to: booking.client_email,
            subject: '❌ Cleaner Declined Your Booking',
            body: `Unfortunately, your cleaner had to decline your booking:

Date: ${booking.date}
Time: ${booking.start_time}

Don't worry! You can:
1. Browse for another cleaner
2. Or we'll help you find a backup cleaner

Your payment has not been charged.`
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify client:', notifErr);
      }

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error declining booking:', err);
      setError('Failed to decline booking');
    }
    setLoading(false);
  };

  const handleConfirmBooking = async () => {
    try {
      const updateField = userType === 'client' ? 'client_confirmed' : 'cleaner_confirmed';
      
      await base44.entities.Booking.update(booking.id, {
        [updateField]: true
      });

      // Check if both parties have confirmed
      const updatedBooking = await base44.entities.Booking.get(booking.id);
      
      if (updatedBooking.client_confirmed && updatedBooking.cleaner_confirmed) {
        // Import the confirmation service dynamically
        const { checkAndSendConfirmation } = await import('./BookingConfirmationService');
        await checkAndSendConfirmation(booking.id);
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canAcceptDecline() && (
        <>
          <Button
            variant="outline"
            onClick={handleAccept}
            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
            disabled={loading}
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Accepting...' : 'Accept Booking'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            disabled={loading}
          >
            <X className="w-4 h-4" />
            {loading ? 'Declining...' : 'Decline Booking'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </>
      )}

      {canReschedule() && (
        <Button
          variant="outline"
          onClick={() => setShowReschedule(true)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Calendar className="w-4 h-4" />
          Reschedule
        </Button>
      )}

      {canCancel() && (
        <Button
          variant="outline"
          onClick={() => setShowCancel(true)}
          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          disabled={loading}
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </Button>
      )}

      {canDispute() && (
        <Button
          variant="outline"
          onClick={() => setShowDispute(true)}
          className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
          disabled={loading}
        >
          <AlertTriangle className="w-4 h-4" />
          File Dispute
        </Button>
      )}

      {canViewReceipt() && (
        <Button
          variant="outline"
          onClick={() => setShowReceipt(true)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Receipt className="w-4 h-4" />
          View Receipt
        </Button>
      )}

      {/* Modals */}
      {showReschedule && (
        <RescheduleBooking
          booking={booking}
          cleanerAvailability={cleanerAvailability}
          open={showReschedule}
          onClose={() => setShowReschedule(false)}
          onRescheduled={() => {
            setShowReschedule(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showCancel && (
        <CancellationPolicy
          booking={booking}
          userEmail={userEmail}
          userType={userType}
          open={showCancel}
          onClose={() => setShowCancel(false)}
          onCancelled={() => {
            setShowCancel(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showDispute && (
        <DisputeForm
          booking={booking}
          userEmail={userEmail}
          filedBy={userType}
          open={showDispute}
          onClose={() => setShowDispute(false)}
          onSubmitted={() => {
            setShowDispute(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showReceipt && (
        <ReceiptModal
          booking={booking}
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
