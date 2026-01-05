import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function SubscriptionOfferCard({ booking, cleaner, onSubscribe }) {
  const [showDialog, setShowDialog] = useState(false);
  const [frequency, setFrequency] = useState('biweekly');
  const [loading, setLoading] = useState(false);

  const calculateSavings = (freq) => {
    const singleBookingPrice = booking.total_price;
    let bookingsPerMonth = 0;
    
    switch(freq) {
      case 'weekly': bookingsPerMonth = 4.33; break;
      case 'biweekly': bookingsPerMonth = 2.17; break;
      case 'monthly': bookingsPerMonth = 1; break;
    }
    
    const regularCost = singleBookingPrice * bookingsPerMonth;
    const subscriptionCost = regularCost * 0.8; // 20% discount
    const savings = regularCost - subscriptionCost;
    
    return {
      regularCost: regularCost.toFixed(2),
      subscriptionCost: subscriptionCost.toFixed(2),
      savings: savings.toFixed(2),
      savingsPercent: 20
    };
  };

  const handleCreateSubscription = async () => {
    setLoading(true);
    try {
      const pricing = calculateSavings(frequency);
      
      await base44.entities.CleaningSubscription.create({
        client_email: booking.client_email,
        cleaner_email: booking.cleaner_email,
        frequency,
        day_of_week: new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' }),
        preferred_time: booking.start_time,
        hours: booking.hours,
        tasks: booking.tasks,
        task_quantities: booking.task_quantities,
        address: booking.address,
        latitude: booking.latitude,
        longitude: booking.longitude,
        monthly_price: parseFloat(pricing.subscriptionCost),
        discount_percentage: 20,
        status: 'active',
        next_booking_date: calculateNextDate(frequency, booking.date)
      });

      if (onSubscribe) {
        onSubscribe();
      }
      
      setShowDialog(false);
      alert('Subscription created! Your first scheduled cleaning will be auto-booked.');
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription. Please try again.');
    }
    setLoading(false);
  };

  const calculateNextDate = (freq, startDate) => {
    const date = new Date(startDate);
    switch(freq) {
      case 'weekly': date.setDate(date.getDate() + 7); break;
      case 'biweekly': date.setDate(date.getDate() + 14); break;
      case 'monthly': date.setMonth(date.getMonth() + 1); break;
    }
    return date.toISOString().split('T')[0];
  };

  const pricing = calculateSavings(frequency);

  return (
    <>
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Love {cleaner.full_name}'s Work?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Subscribe & Save 20%</p>
              <p className="text-sm text-slate-600">Lock in your schedule and save on every cleaning</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Regular price:</span>
              <span className="line-through text-slate-400">${booking.total_price}/cleaning</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900">Subscription price:</span>
              <span className="text-2xl font-bold text-purple-600">${(booking.total_price * 0.8).toFixed(2)}/cleaning</span>
            </div>
          </div>

          <Button
            onClick={() => setShowDialog(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            Set Up Subscription
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Cleaning Subscription</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">How often?</label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-3">Your Subscription:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Frequency:</span>
                  <span className="font-medium">{frequency === 'biweekly' ? 'Every 2 weeks' : frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Per cleaning:</span>
                  <span className="font-medium">${(booking.total_price * 0.8).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-purple-200 pt-2">
                  <span className="text-slate-900 font-semibold">Monthly cost:</span>
                  <span className="font-bold text-purple-600">${pricing.subscriptionCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-600 font-medium">Monthly savings:</span>
                  <span className="font-bold text-emerald-600">${pricing.savings}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Same cleaner every time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Priority scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Pause or cancel anytime</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
                disabled={loading}
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleCreateSubscription}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {loading ? 'Creating...' : 'Subscribe Now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}