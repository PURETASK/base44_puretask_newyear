import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInHours, differenceInMinutes, addHours, format } from 'date-fns';
import { toast } from 'sonner';

export default function EscrowReleaseTimer({ booking, onUpdate }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (booking.status === 'completed' && !booking.payment_captured) {
      calculateTimeRemaining();
      const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [booking]);

  const calculateTimeRemaining = () => {
    if (!booking.check_out_time) return;

    const checkoutTime = new Date(booking.check_out_time);
    const releaseTime = addHours(checkoutTime, 48);
    const now = new Date();

    const hoursLeft = differenceInHours(releaseTime, now);
    const minutesLeft = differenceInMinutes(releaseTime, now) % 60;

    setTimeRemaining({
      hours: Math.max(0, hoursLeft),
      minutes: Math.max(0, minutesLeft),
      releaseTime,
      isPastDeadline: now > releaseTime
    });
  };

  const handleAutoRelease = async () => {
    setReleasing(true);
    try {
      // Auto-approve the booking
      await base44.entities.Booking.update(booking.id, {
        status: 'approved',
        payment_captured: true
      });

      // Record final charge
      const actualHours = booking.actual_hours || booking.hours;
      const totalRateCPH = booking.snapshot_total_rate_cph || 300;
      const additionalServicesCredits = booking.additional_services_cost_credits || 0;
      const finalCharge = (actualHours * totalRateCPH) + additionalServicesCredits;

      await base44.entities.Booking.update(booking.id, {
        final_charge_credits: finalCharge
      });

      toast.success('Payment automatically released to cleaner');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error auto-releasing payment:', error);
      toast.error('Failed to release payment');
    }
    setReleasing(false);
  };

  useEffect(() => {
    // Auto-release if past deadline
    if (timeRemaining?.isPastDeadline && !booking.payment_captured && !releasing) {
      handleAutoRelease();
    }
  }, [timeRemaining?.isPastDeadline]);

  if (!timeRemaining || booking.payment_captured) {
    return null;
  }

  const percentage = ((48 - timeRemaining.hours) / 48) * 100;
  const isUrgent = timeRemaining.hours < 6;

  return (
    <Card className={`border-2 shadow-lg rounded-2xl ${
      isUrgent ? 'border-amber-400 bg-amber-50' : 'border-blue-300 bg-blue-50'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className={`w-6 h-6 ${isUrgent ? 'text-amber-600' : 'text-puretask-blue'}`} />
            <div>
              <p className="font-fredoka font-bold text-graphite">
                {timeRemaining.isPastDeadline ? 'Auto-Approval Processing' : 'Auto-Approval Timer'}
              </p>
              <p className="text-sm text-gray-600 font-verdana">
                Payment will be automatically released to cleaner
              </p>
            </div>
          </div>
          <Badge className={`${
            isUrgent ? 'bg-amber-500' : 'bg-puretask-blue'
          } text-white rounded-full font-fredoka`}>
            {timeRemaining.isPastDeadline ? 'Processing' : 'Pending'}
          </Badge>
        </div>

        {!timeRemaining.isPastDeadline ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-verdana text-gray-600">Time Remaining</span>
                <span className={`font-fredoka font-bold ${
                  isUrgent ? 'text-amber-700' : 'text-puretask-blue'
                }`}>
                  {timeRemaining.hours}h {timeRemaining.minutes}m
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-3 ${isUrgent ? 'bg-amber-500' : 'bg-puretask-blue'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <Alert className={`${
              isUrgent ? 'border-amber-300 bg-amber-100' : 'border-blue-200 bg-blue-100'
            } rounded-2xl`}>
              <AlertDescription className="text-sm font-verdana">
                {isUrgent ? (
                  <>
                    <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-700" />
                    <strong>Action needed soon!</strong> Payment will auto-release at{' '}
                    {format(timeRemaining.releaseTime, 'MMM d, h:mm a')}
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 inline mr-2 text-blue-700" />
                    Payment will automatically release at{' '}
                    {format(timeRemaining.releaseTime, 'MMM d, h:mm a')} if no action is taken
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200">
              <p className="text-sm font-fredoka font-semibold text-graphite mb-2">
                What happens at auto-release?
              </p>
              <ul className="space-y-1 text-sm font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5" />
                  <span>Payment is released to the cleaner</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5" />
                  <span>Booking is marked as approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5" />
                  <span>You can still submit a review</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-puretask-blue mr-3" />
            <p className="font-fredoka font-semibold text-graphite">
              Releasing payment to cleaner...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}