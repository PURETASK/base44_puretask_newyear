import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import GPSCheckIn from './GPSCheckIn';

/**
 * Modal prompt for GPS check-in/check-out with location validation
 */
export default function CheckInPromptModal({ 
  booking, 
  open, 
  onClose, 
  onCheckInComplete,
  onCheckOutComplete 
}) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!booking) {
      setShouldShow(false);
      return;
    }

    // Always show if explicitly opened (manual check-in/out)
    if (open) {
      setShouldShow(true);
      return;
    }

    // Auto-show logic for check-in reminder
    if (!booking.check_in_time) {
      const now = new Date();
      const jobDateTime = new Date(`${booking.date}T${booking.start_time}`);
      const timeDiff = (jobDateTime - now) / (1000 * 60); // minutes

      if (timeDiff <= 15 && timeDiff >= -30) {
        setShouldShow(true);
      }
    }
  }, [booking, open]);

  const handleCheckInComplete = (checkInData) => {
    if (onCheckInComplete) onCheckInComplete(checkInData);
    onClose();
  };

  const handleCheckOutComplete = (checkOutData) => {
    if (onCheckOutComplete) onCheckOutComplete(checkOutData);
    onClose();
  };

  const isCheckingOut = booking?.check_in_time && booking?.status !== 'completed';

  return (
    <Dialog open={open && shouldShow} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-emerald-600" />
            {isCheckingOut ? 'Check Out & Complete Job' : 'Check In to Start Job'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className={`${isCheckingOut ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <Clock className={`w-4 h-4 ${isCheckingOut ? 'text-blue-600' : 'text-emerald-600'}`} />
            <AlertDescription className={isCheckingOut ? 'text-blue-900' : 'text-emerald-900'}>
              {isCheckingOut 
                ? 'Please check out to record your completion time and finalize the job.'
                : 'Please check in to confirm you have arrived at the location.'}
            </AlertDescription>
          </Alert>

          {booking && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600">Address</p>
                <p className="font-semibold text-slate-900 text-sm">{booking.address}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Scheduled Time</p>
                <p className="font-semibold text-slate-900">{booking.start_time}</p>
              </div>
              {booking.check_in_time && (
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Checked In At</p>
                  <p className="font-semibold text-emerald-700">
                    {new Date(booking.check_in_time).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <GPSCheckIn
            booking={booking}
            onCheckInComplete={handleCheckInComplete}
            onCheckOutComplete={handleCheckOutComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}