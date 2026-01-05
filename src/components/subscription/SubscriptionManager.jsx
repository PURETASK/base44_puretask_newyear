import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Pause, Play, X, DollarSign, Clock, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';


export default function SubscriptionManager({ clientEmail }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, [clientEmail]);

  const loadSubscriptions = async () => {
    try {
      const subs = await base44.entities.CleaningSubscription.filter({ client_email: clientEmail });
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      console.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const pauseSubscription = async (subId) => {
    try {
      const pauseDate = new Date();
      pauseDate.setDate(pauseDate.getDate() + 30);
      
      await base44.entities.CleaningSubscription.update(subId, {
        status: 'paused',
        paused_until: pauseDate.toISOString().split('T')[0]
      });
      
      alert('Subscription paused for 30 days');
      loadSubscriptions();
    } catch (error) {
      alert('Failed to pause subscription');
    }
  };

  const resumeSubscription = async (subId) => {
    try {
      await base44.entities.CleaningSubscription.update(subId, {
        status: 'active',
        paused_until: null
      });
      
      alert('Subscription resumed');
      loadSubscriptions();
    } catch (error) {
      alert('Failed to resume subscription');
    }
  };

  const cancelSubscription = async (subId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      await base44.entities.CleaningSubscription.update(subId, {
        status: 'cancelled'
      });
      
      alert('Subscription cancelled');
      loadSubscriptions();
    } catch (error) {
      alert('Failed to cancel subscription');
    }
  };

  const frequencyLabels = {
    weekly: 'Weekly',
    biweekly: 'Every 2 Weeks',
    monthly: 'Monthly'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-600',
    past_due: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return <div className="text-center py-8">Loading subscriptions...</div>;
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-verdana">No active subscriptions</p>
          <p className="text-sm text-gray-500 mt-2">Create a subscription to get regular cleanings with discounts!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-puretask-blue" />
                    {frequencyLabels[sub.frequency]} Cleaning
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Every {sub.day_of_week} at {sub.preferred_time}
                  </CardDescription>
                </div>
                <Badge className={statusColors[sub.status]}>
                  {sub.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{sub.cleaner_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{sub.hours} hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 truncate">{sub.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">${(sub.monthly_price / 10).toFixed(2)}/month</span>
                </div>
              </div>

              {sub.discount_percentage > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-fredoka font-semibold">
                    💰 Saving {sub.discount_percentage}% with subscription
                  </p>
                </div>
              )}

              {sub.next_booking_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-verdana">
                    <strong>Next cleaning:</strong> {new Date(sub.next_booking_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {sub.paused_until && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-verdana">
                    <strong>Paused until:</strong> {new Date(sub.paused_until).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {sub.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pauseSubscription(sub.id)}
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}
                
                {sub.status === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resumeSubscription(sub.id)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                )}

                {(sub.status === 'active' || sub.status === 'paused') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelSubscription(sub.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>Started: {new Date(sub.started_date).toLocaleDateString()}</p>
                <p>Total cleanings completed: {sub.total_cleanings_completed}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}