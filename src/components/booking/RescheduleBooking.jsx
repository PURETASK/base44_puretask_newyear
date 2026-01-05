import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CalendarBooking from './CalendarBooking';
import { differenceInHours } from 'date-fns';

export default function RescheduleBooking({ booking, cleanerAvailability, open, onClose, onRescheduled }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectSlot = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setError('');
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a new date and time');
      return;
    }

    const bookingDate = new Date(booking.date + 'T' + booking.start_time);
    const now = new Date();
    const hoursUntilBooking = differenceInHours(bookingDate, now);

    // Check if rescheduling is within policy (24 hours before)
    if (hoursUntilBooking < 24 && booking.reschedule_count >= 1) {
      setError("Free rescheduling is only available more than 24 hours before your booking. You have already used your free reschedule.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const oldDate = booking.date;
      const oldTime = booking.start_time;

      // Update the booking
      await base44.entities.Booking.update(booking.id, {
        date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime,
        rescheduled_from: `${oldDate} ${oldTime}`,
        reschedule_count: (booking.reschedule_count || 0) + 1
      });

      // Log event
      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'booking_rescheduled',
        user_email: booking.client_email,
        details: `Rescheduled from ${oldDate} ${oldTime} to ${selectedDate.toISOString().split('T')[0]} ${selectedTime}`,
        timestamp: new Date().toISOString()
      });

      // Send notification to cleaner
      try {
        const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });
        if (cleanerUsers.length > 0 && cleanerUsers[0].sms_consent) {
          await base44.integrations.Core.SendEmail({
            to: booking.cleaner_email,
            subject: '📅 Booking Rescheduled',
            body: `A booking has been rescheduled:

Old Date: ${oldDate} at ${oldTime}
New Date: ${selectedDate.toISOString().split('T')[0]} at ${selectedTime}

Address: ${booking.address}

Please check your calendar for the updated time.`
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify cleaner:', notifErr);
      }

      if (onRescheduled) onRescheduled();
      onClose();
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      setError('Failed to reschedule booking. Please try again.');
    }
    setLoading(false);
  };

  const bookingDate = new Date(booking.date + 'T' + booking.start_time);
  const now = new Date();
  const hoursUntilBooking = differenceInHours(bookingDate, now);
  const isFreeReschedule = hoursUntilBooking >= 24 && (booking.reschedule_count || 0) === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Select a new date and time for your cleaning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Current Booking</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{booking.start_time}</span>
              </div>
            </div>
          </div>

          {isFreeReschedule ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-900">
                ✓ Free reschedule available (more than 24 hours in advance)
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-900">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {booking.reschedule_count >= 1 ? 
                  "You have used your free reschedule. Additional changes may incur a fee." : 
                  "Rescheduling less than 24 hours before may incur a fee."}
              </AlertDescription>
            </Alert>
          )}

          <CalendarBooking
            availability={cleanerAvailability}
            onSelectSlot={handleSelectSlot}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedDate || !selectedTime || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Confirm Reschedule
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}