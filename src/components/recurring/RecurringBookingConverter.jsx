import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Sparkles, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { addWeeks, addMonths } from 'date-fns';
import { toast } from 'sonner';

export default function RecurringBookingConverter({ booking, onConvert }) {
  const [showDialog, setShowDialog] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [converting, setConverting] = useState(false);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleConvert = async () => {
    if (!dayOfWeek) {
      toast.error('Please select a day of the week');
      return;
    }

    setConverting(true);
    try {
      // Calculate next booking date based on frequency
      let nextDate = new Date();
      if (frequency === 'weekly') {
        nextDate = addWeeks(nextDate, 1);
      } else if (frequency === 'biweekly') {
        nextDate = addWeeks(nextDate, 2);
      } else if (frequency === 'monthly') {
        nextDate = addMonths(nextDate, 1);
      }

      const recurringBooking = await base44.entities.RecurringBooking.create({
        client_email: booking.client_email,
        cleaner_email: booking.cleaner_email,
        frequency,
        day_of_week: dayOfWeek,
        start_time: booking.start_time,
        hours: booking.hours,
        tasks: booking.tasks || [],
        task_quantities: booking.task_quantities || {},
        address: booking.address,
        latitude: booking.latitude,
        longitude: booking.longitude,
        total_price: booking.total_price,
        is_active: true,
        next_booking_date: nextDate.toISOString().split('T')[0]
      });

      toast.success('Converted to recurring booking!');
      setShowDialog(false);
      if (onConvert) onConvert(recurringBooking);
    } catch (error) {
      console.error('Error converting to recurring:', error);
      toast.error('Failed to create recurring booking');
    }
    setConverting(false);
  };

  // Calculate savings
  const monthlySavings = frequency === 'weekly' ? booking.total_price * 4 * 0.1 : 
                        frequency === 'biweekly' ? booking.total_price * 2 * 0.1 : 
                        booking.total_price * 0.1;

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="rounded-full font-fredoka border-2 border-purple-500 text-purple-700 hover:bg-purple-50"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Convert to Recurring
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-graphite flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Convert to Recurring Booking
            </DialogTitle>
            <DialogDescription className="font-verdana">
              Set up automatic cleanings and save 10% on every visit!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Booking Summary */}
            <Card className="border-2 border-blue-200 bg-blue-50 rounded-2xl">
              <CardContent className="p-4">
                <p className="text-sm font-fredoka font-semibold text-graphite mb-3">Your Current Booking:</p>
                <div className="grid grid-cols-2 gap-3 text-sm font-verdana">
                  <div>
                    <span className="text-gray-600">Cleaner:</span>
                    <p className="font-semibold text-graphite">{booking.cleaner_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-semibold text-graphite">{booking.start_time}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-semibold text-graphite">{booking.hours} hours</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <p className="font-semibold text-graphite">{Math.round(booking.total_price * 10)} credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequency Selection */}
            <div>
              <label className="text-sm font-fredoka font-medium mb-2 block text-graphite">
                Cleaning Frequency *
              </label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="rounded-full font-verdana">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly (Every week)</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly (Every 2 weeks)</SelectItem>
                  <SelectItem value="monthly">Monthly (Once a month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day Selection */}
            <div>
              <label className="text-sm font-fredoka font-medium mb-2 block text-graphite">
                Preferred Day of Week *
              </label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="rounded-full font-verdana">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Savings Calculator */}
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-fredoka font-bold text-graphite text-lg mb-1">Your Savings</p>
                    <p className="text-sm text-gray-600 font-verdana">10% off every visit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-fredoka font-bold text-fresh-mint">
                      {Math.round(monthlySavings * 10)}
                    </p>
                    <p className="text-sm text-gray-600 font-verdana">credits/month saved</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm font-verdana">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular price per visit:</span>
                    <span className="font-semibold text-graphite">{Math.round(booking.total_price * 10)} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recurring price per visit:</span>
                    <span className="font-semibold text-fresh-mint">{Math.round(booking.total_price * 10 * 0.9)} credits</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="font-fredoka font-bold text-graphite">Monthly savings:</span>
                    <span className="font-fredoka font-bold text-fresh-mint">
                      {Math.round(monthlySavings * 10)} credits
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
              <AlertDescription className="text-sm text-blue-900 font-verdana">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-puretask-blue" />
                    Your cleaner will be automatically scheduled
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-puretask-blue" />
                    You can pause or cancel anytime
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-puretask-blue" />
                    Credits will be charged 24 hours before each visit
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleConvert}
                disabled={converting || !dayOfWeek}
                className="flex-1 brand-gradient text-white rounded-full font-fredoka font-semibold"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Recurring Booking
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                disabled={converting}
                className="rounded-full font-fredoka"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}