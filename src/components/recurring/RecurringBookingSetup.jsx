import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Repeat, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

export default function RecurringBookingSetup({ booking, open, onClose, onCreated }) {
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getNextBookingDate = () => {
    const bookingDate = new Date(booking.date);
    
    switch (frequency) {
      case 'weekly':
        return addWeeks(bookingDate, 1);
      case 'biweekly':
        return addWeeks(bookingDate, 2);
      case 'monthly':
        return addMonths(bookingDate, 1);
      default:
        return addWeeks(bookingDate, 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    try {
      const bookingDate = new Date(booking.date);
      const dayOfWeek = format(bookingDate, 'EEEE');

      // Create the recurring booking record
      const recurringBooking = await base44.entities.RecurringBooking.create({
        client_email: booking.client_email,
        cleaner_email: booking.cleaner_email,
        frequency,
        day_of_week: dayOfWeek,
        start_time: booking.start_time,
        hours: booking.hours,
        tasks: booking.tasks,
        task_quantities: booking.task_quantities || {},
        address: booking.address,
        latitude: booking.latitude,
        longitude: booking.longitude,
        total_price: booking.total_price,
        is_active: true,
        next_booking_date: getNextBookingDate().toISOString().split('T')[0]
      });

      // Update the current booking to link it
      await base44.entities.Booking.update(booking.id, {
        recurring_booking_id: recurringBooking.id
      });

      // Log event
      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'recurring_booking_created',
        user_email: booking.client_email,
        details: `Recurring ${frequency} booking created`,
        timestamp: new Date().toISOString()
      });

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating recurring booking:', err);
      setError('Failed to set up recurring booking. Please try again.');
    }
    setLoading(false);
  };

  const nextDate = getNextBookingDate();
  const estimatedMonthlyCharge = frequency === 'weekly' ? booking.total_price * 4 :
                                 frequency === 'biweekly' ? booking.total_price * 2 :
                                 booking.total_price;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-6 h-6 text-purple-500" />
            Set Up Recurring Booking
          </DialogTitle>
          <DialogDescription>
            Automatically schedule this cleaning on a regular basis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label className="mb-2 block">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Weekly</span>
                  </div>
                </SelectItem>
                <SelectItem value="biweekly">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Every 2 Weeks</span>
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Monthly</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-emerald-900">Recurring Details</h4>
            <div className="space-y-1 text-sm text-emerald-800">
              <p><strong>Day:</strong> {format(new Date(booking.date), 'EEEE')}s</p>
              <p><strong>Time:</strong> {booking.start_time}</p>
              <p><strong>Duration:</strong> {booking.hours} hours</p>
              <p><strong>Next booking:</strong> {format(nextDate, 'MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Estimated Monthly Charge:</span>
              <div className="flex items-center gap-1 text-blue-900">
                <DollarSign className="w-4 h-4" />
                <span className="text-xl font-bold">{estimatedMonthlyCharge.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-blue-800">
              Based on {frequency === 'weekly' ? '4' : frequency === 'biweekly' ? '2' : '1'} cleaning{frequency !== 'monthly' && 's'} per month
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> You can pause or cancel your recurring booking anytime from your dashboard. 
              You will be charged after each cleaning is completed.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting Up...
                </>
              ) : (
                <>
                  <Repeat className="w-4 h-4 mr-2" />
                  Confirm Recurring
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}