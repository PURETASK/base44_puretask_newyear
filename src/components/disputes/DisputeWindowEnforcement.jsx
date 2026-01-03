import React, { useState, useEffect } from 'react';
import { differenceInHours, parseISO } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Dispute Window Enforcement Component
 * Enforces 48-hour window for dispute submission after job completion
 */
export default function DisputeWindowEnforcement({ booking, children }) {
  const [windowStatus, setWindowStatus] = useState({
    canDispute: false,
    hoursRemaining: 0,
    expired: false
  });

  useEffect(() => {
    if (!booking) return;

    calculateDisputeWindow();
    
    // Update every minute
    const interval = setInterval(calculateDisputeWindow, 60000);
    return () => clearInterval(interval);
  }, [booking]);

  const calculateDisputeWindow = () => {
    // Dispute window opens when job is completed
    if (booking.status !== 'completed' && booking.status !== 'approved') {
      setWindowStatus({
        canDispute: false,
        hoursRemaining: 0,
        expired: false,
        notYetCompleted: true
      });
      return;
    }

    // Use check_out_time as completion time
    const completionTime = booking.check_out_time 
      ? parseISO(booking.check_out_time)
      : new Date(booking.updated_date); // Fallback to updated_date

    const now = new Date();
    const hoursSinceCompletion = differenceInHours(now, completionTime);
    const hoursRemaining = 48 - hoursSinceCompletion;

    setWindowStatus({
      canDispute: hoursSinceCompletion >= 0 && hoursSinceCompletion < 48,
      hoursRemaining: Math.max(0, hoursRemaining),
      expired: hoursSinceCompletion >= 48,
      completionTime
    });
  };

  // Check if booking already has a dispute
  const hasExistingDispute = booking?.dispute_reason || booking?.status === 'disputed';

  if (!booking) return null;

  return (
    <div className="space-y-4">
      {/* Status Alert */}
      {windowStatus.notYetCompleted && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Dispute window not yet open.</strong> You can file a dispute within 48 hours after the job is completed.
          </AlertDescription>
        </Alert>
      )}

      {windowStatus.canDispute && !hasExistingDispute && (
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-900 space-y-2">
            <div className="flex items-center justify-between">
              <strong>Dispute window is open</strong>
              <Badge className="bg-amber-600 text-white">
                {windowStatus.hoursRemaining}h remaining
              </Badge>
            </div>
            <p className="text-sm">
              You have until {windowStatus.completionTime && 
                new Date(windowStatus.completionTime.getTime() + 48 * 60 * 60 * 1000).toLocaleString()
              } to file a dispute.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {windowStatus.expired && !hasExistingDispute && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>Dispute window has closed.</strong> The 48-hour window to file a dispute has expired. 
            For exceptional circumstances, please contact support.
          </AlertDescription>
        </Alert>
      )}

      {hasExistingDispute && (
        <Alert className="border-purple-200 bg-purple-50">
          <CheckCircle className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            <strong>Dispute already filed.</strong> Your dispute is currently {booking.dispute_status || 'under review'}.
          </AlertDescription>
        </Alert>
      )}

      {/* Render children with window status */}
      {typeof children === 'function' 
        ? children(windowStatus, hasExistingDispute)
        : children}
    </div>
  );
}

/**
 * Hook version for use in other components
 */
export const useDisputeWindow = (booking) => {
  const [windowStatus, setWindowStatus] = useState({
    canDispute: false,
    hoursRemaining: 0,
    expired: false
  });

  useEffect(() => {
    if (!booking) return;

    const calculate = () => {
      if (booking.status !== 'completed' && booking.status !== 'approved') {
        setWindowStatus({
          canDispute: false,
          hoursRemaining: 0,
          expired: false,
          notYetCompleted: true
        });
        return;
      }

      const completionTime = booking.check_out_time 
        ? parseISO(booking.check_out_time)
        : new Date(booking.updated_date);

      const now = new Date();
      const hoursSinceCompletion = differenceInHours(now, completionTime);
      const hoursRemaining = 48 - hoursSinceCompletion;

      setWindowStatus({
        canDispute: hoursSinceCompletion >= 0 && hoursSinceCompletion < 48,
        hoursRemaining: Math.max(0, hoursRemaining),
        expired: hoursSinceCompletion >= 48,
        completionTime
      });
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [booking]);

  const hasExistingDispute = booking?.dispute_reason || booking?.status === 'disputed';

  return {
    ...windowStatus,
    hasExistingDispute,
    canFileDispute: windowStatus.canDispute && !hasExistingDispute
  };
};