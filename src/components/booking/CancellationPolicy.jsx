import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { XCircle, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { differenceInHours, parseISO } from 'date-fns';

export default function CancellationPolicy({ booking, userEmail, userType, open, onClose, onCancelled }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateCancellationFee = () => {
    const bookingDate = parseISO(booking.date);
    const hoursUntil = differenceInHours(bookingDate, new Date());
    
    if (hoursUntil >= 24) {
      // Free cancellation if more than 24 hours
      return { fee: 0, percentage: 0, canCancel: true };
    } else if (hoursUntil >= 12) {
      // 50% fee if 12-24 hours
      return { fee: booking.total_price * 0.5, percentage: 50, canCancel: true };
    } else if (hoursUntil >= 0) {
      // 100% fee if less than 12 hours
      return { fee: booking.total_price, percentage: 100, canCancel: true };
    } else {
      // Cannot cancel if already started
      return { fee: 0, percentage: 0, canCancel: false };
    }
  };

  const cancellationInfo = calculateCancellationFee();

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      // Update booking
      await base44.entities.Booking.update(booking.id, {
        status: 'cancelled',
        cancelled_by: userType,
        cancellation_reason: reason.trim(),
        cancellation_fee: cancellationInfo.fee
      });

      // If there's a cancellation fee, create payment record
      if (cancellationInfo.fee > 0) {
        await base44.entities.Payment.create({
          booking_id: booking.id,
          client_email: booking.client_email,
          cleaner_email: booking.cleaner_email,
          amount: cancellationInfo.fee,
          platform_fee: cancellationInfo.fee * 0.15,
          cleaner_payout: cancellationInfo.fee * 0.85,
          status: 'completed',
          payment_method: 'cancellation_fee'
        });
      } else if (userType === 'cleaner') {
        // If cleaner cancels for free, issue credit to client
        await base44.entities.Credit.create({
          client_email: booking.client_email,
          amount: booking.total_price * 0.1, // 10% credit as apology
          reason: 'cleaner_cancellation',
          booking_id: booking.id,
          used: false
        });
      }

      // Create event log
      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'cancelled',
        user_email: userEmail,
        details: `Cancelled by ${userType}: ${reason}`,
        timestamp: new Date().toISOString()
      });

      if (onCancelled) onCancelled();
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
    setLoading(false);
  };

  if (!cancellationInfo.canCancel) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Cancel</DialogTitle>
          </DialogHeader>
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900">
              This booking has already started or passed. Please contact support for assistance.
            </AlertDescription>
          </Alert>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cancellation Fee Info */}
          <div className={`p-4 rounded-lg border-2 ${
            cancellationInfo.fee === 0 
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <DollarSign className={`w-5 h-5 mt-0.5 ${
                cancellationInfo.fee === 0 ? 'text-green-600' : 'text-amber-600'
              }`} />
              <div>
                <h4 className={`font-semibold mb-1 ${
                  cancellationInfo.fee === 0 ? 'text-green-900' : 'text-amber-900'
                }`}>
                  {cancellationInfo.fee === 0 ? 'Free Cancellation' : 'Cancellation Fee'}
                </h4>
                <p className={`text-sm ${
                  cancellationInfo.fee === 0 ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {cancellationInfo.fee === 0 ? (
                    'You can cancel for free since there are more than 24 hours until the booking.'
                  ) : (
                    <>
                      A {cancellationInfo.percentage}% cancellation fee (${cancellationInfo.fee.toFixed(2)}) 
                      will be charged because there are less than 24 hours until the booking.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-2">Cancellation Policy</h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>More than 24 hours:</strong> Free cancellation</li>
              <li>• <strong>12-24 hours:</strong> 50% cancellation fee</li>
              <li>• <strong>Less than 12 hours:</strong> 100% cancellation fee</li>
            </ul>
          </div>

          {/* Reason */}
          <div>
            <Label>Reason for Cancellation *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading || !reason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirm Cancellation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}