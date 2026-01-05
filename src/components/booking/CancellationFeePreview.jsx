import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export default function CancellationFeePreview({ booking, onConfirm, onCancel, open }) {
  const [feeInfo, setFeeInfo] = useState(null);

  useEffect(() => {
    if (!booking) return;

    const now = new Date();
    const bookingDate = new Date(booking.date);
    const hoursUntil = (bookingDate - now) / (1000 * 60 * 60);

    const escrow = booking.escrow_credits_reserved || 0;
    let feePercent = 0;
    let feeAmount = 0;
    let refundAmount = escrow;
    let reason = '';
    let reasonColor = 'green';

    if (hoursUntil > 24) {
      // Free cancellation
      feePercent = 0;
      feeAmount = 0;
      refundAmount = escrow;
      reason = 'Free cancellation (more than 24 hours)';
      reasonColor = 'green';
    } else if (hoursUntil > 0) {
      // Late cancellation fee
      feePercent = 30;
      feeAmount = Math.round(escrow * 0.30);
      refundAmount = escrow - feeAmount;
      reason = 'Late cancellation fee (less than 24 hours)';
      reasonColor = 'yellow';
    } else {
      // No-show or very late
      feePercent = 80;
      feeAmount = Math.round(escrow * 0.80);
      refundAmount = escrow - feeAmount;
      reason = 'No-show fee (booking time passed)';
      reasonColor = 'red';
    }

    setFeeInfo({
      feePercent,
      feeAmount,
      refundAmount,
      escrow,
      reason,
      reasonColor,
      hoursUntil: Math.max(0, hoursUntil)
    });
  }, [booking]);

  if (!feeInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fredoka text-xl">
            <AlertTriangle className={`w-6 h-6 ${
              feeInfo.reasonColor === 'red' ? 'text-red-600' :
              feeInfo.reasonColor === 'yellow' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            Cancel This Booking?
          </DialogTitle>
          <DialogDescription>
            Here's what happens when you cancel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Timeline Info */}
          <div className={`p-4 rounded-lg border-2 ${
            feeInfo.reasonColor === 'red' ? 'bg-red-50 border-red-300' :
            feeInfo.reasonColor === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
            'bg-green-50 border-green-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-fredoka font-semibold">
                {feeInfo.hoursUntil > 0 
                  ? `${Math.floor(feeInfo.hoursUntil)} hours until booking`
                  : 'Booking time has passed'}
              </span>
            </div>
            <p className="text-sm font-verdana">{feeInfo.reason}</p>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-verdana">Original Hold:</span>
              <span className="font-fredoka font-semibold">{feeInfo.escrow} credits</span>
            </div>

            {feeInfo.feeAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center text-red-600"
              >
                <span className="font-verdana flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Cancellation Fee ({feeInfo.feePercent}%):
                </span>
                <span className="font-fredoka font-bold">-{feeInfo.feeAmount} credits</span>
              </motion.div>
            )}

            <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
              <span className="text-gray-900 font-fredoka font-semibold">You Get Back:</span>
              <span className="text-2xl font-fredoka font-bold text-green-600">
                {feeInfo.refundAmount} credits
              </span>
            </div>
          </div>

          {/* Warning Message */}
          {feeInfo.feeAmount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm"
            >
              <p className="font-verdana text-yellow-800">
                <strong>Note:</strong> To avoid fees, cancel at least 24 hours before your scheduled time.
              </p>
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="font-fredoka">
            Keep Booking
          </Button>
          <Button
            onClick={onConfirm}
            className={`font-fredoka ${
              feeInfo.feeAmount > 0 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}