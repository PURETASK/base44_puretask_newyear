import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Pause, PlayCircle, XCircle, Loader2, TrendingUp, DollarSign, Clock, MapPin } from 'lucide-react';

export default function ManageSubscription() {
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('id');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pauseDate, setPauseDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (subscriptionId) {
      loadSubscription();
    }
  }, [subscriptionId]);

  const loadSubscription = async () => {
    try {
      const sub = await base44.entities.CleaningSubscription.get(subscriptionId);
      setSubscription(sub);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading subscription:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to load subscription' });
    }
    setLoading(false);
  };

  const handlePause = async () => {
    if (!pauseDate) {
      setMessage({ type: 'error', text: 'Please select a resume date' });
      return;
    }
    
    try {
      await base44.entities.CleaningSubscription.update(subscriptionId, {
        status: 'paused',
        paused_until: pauseDate
      });
      
      setMessage({ type: 'success', text: 'Subscription paused successfully' });
      loadSubscription();
    } catch (error) {
      handleError(error, { userMessage: 'Error pausing subscription:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to pause subscription' });
    }
  };

  const handleResume = async () => {
    try {
      await base44.entities.CleaningSubscription.update(subscriptionId, {
        status: 'active',
        paused_until: null
      });
      
      setMessage({ type: 'success', text: 'Subscription resumed successfully' });
      loadSubscription();
    } catch (error) {
      handleError(error, { userMessage: 'Error resuming subscription:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to resume subscription' });
    }
  };

  const handleCancel = async () => {
    try {
      // Check if this is a membership subscription (CleaningSubscription or ClientMembership)
      const user = await base44.auth.me();
      const memberships = await base44.entities.ClientMembership.filter({ 
        client_email: user.email,
        status: 'active'
      });
      
      let cancellationFee = 0;
      let warningMessage = 'Are you sure you want to cancel your subscription? You will lose your 20% discount.';
      
      if (memberships.length > 0) {
        const membership = memberships[0];
        const startDate = new Date(membership.started_date);
        const contractEndDate = new Date(membership.contract_end_date);
        const now = new Date();
        
        // Check if within minimum commitment period
        if (now < contractEndDate) {
          const monthsRemaining = Math.ceil((contractEndDate - now) / (1000 * 60 * 60 * 24 * 30));
          cancellationFee = monthsRemaining * membership.monthly_fee;
          
          warningMessage = `⚠️ EARLY CANCELLATION FEE
          
You are cancelling within your 3-month minimum commitment period.

Remaining months: ${monthsRemaining}
Early cancellation fee: $${cancellationFee.toFixed(2)}

This fee will be charged immediately to your payment method.

Are you sure you want to proceed?`;
        }
      }
      
      const confirmed = window.confirm(warningMessage);
      if (!confirmed) return;
      
      const reason = prompt('Why are you cancelling? (Optional)');
      
      // Process cancellation
      await base44.entities.CleaningSubscription.update(subscriptionId, {
        status: 'cancelled',
        cancelled_date: new Date().toISOString(),
        cancellation_reason: reason || 'No reason provided'
      });
      
      // Update membership status and charge early cancellation fee if applicable
      if (memberships.length > 0 && cancellationFee > 0) {
        await base44.entities.ClientMembership.update(memberships[0].id, {
          status: 'cancelled',
          cancelled_date: new Date().toISOString(),
          cancellation_reason: reason || 'No reason provided',
          early_cancellation_fee: cancellationFee
        });
        
        // Create credit transaction for the cancellation fee
        await base44.entities.CreditTransaction.create({
          user_email: user.email,
          amount_credits: -cancellationFee * 10, // Convert to credits (assuming 1 credit = $0.10)
          transaction_type: 'early_cancellation_fee',
          description: `Early cancellation fee for membership (${Math.ceil((new Date(memberships[0].contract_end_date) - new Date()) / (1000 * 60 * 60 * 24 * 30))} months remaining)`,
          status: 'completed'
        });
        
        setMessage({ 
          type: 'success', 
          text: `Subscription cancelled. Early cancellation fee of $${cancellationFee.toFixed(2)} has been charged.` 
        });
      } else {
        if (memberships.length > 0) {
          await base44.entities.ClientMembership.update(memberships[0].id, {
            status: 'cancelled',
            cancelled_date: new Date().toISOString(),
            cancellation_reason: reason || 'No reason provided'
          });
        }
        setMessage({ type: 'success', text: 'Subscription cancelled' });
      }
      
      setTimeout(() => {
        navigate(createPageUrl('ClientDashboard'));
      }, 2000);
    } catch (error) {
      handleError(error, { userMessage: 'Error cancelling subscription:', showToast: false });
      setMessage({ type: 'error', text: 'Failed to cancel subscription' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-lg text-slate-600 mb-4">Subscription not found</p>
            <Button onClick={() => navigate(createPageUrl('ClientDashboard'))}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    cancelled: 'bg-slate-500'
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(createPageUrl('ClientDashboard'))} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Manage Your Subscription</h1>
          <p className="text-lg text-slate-600">Control your recurring cleaning schedule</p>
        </div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-900' : 'text-emerald-900'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Subscription Details */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center justify-between">
                <span>Subscription Details</span>
                <Badge className={statusColors[subscription.status]}>
                  {subscription.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Frequency:</span>
                <span className="capitalize">{subscription.frequency}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Day:</span>
                <span>{subscription.day_of_week}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Time:</span>
                <span>{subscription.preferred_time}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Location:</span>
                <span className="text-sm">{subscription.address}</span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Monthly Price:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${subscription.monthly_price}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Includes 20% discount vs pay-per-booking
                </p>
              </div>

              {subscription.next_booking_date && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Next Cleaning:</p>
                  <p className="text-sm text-blue-700">
                    {new Date(subscription.next_booking_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600">
                  <strong>Total Cleanings:</strong> {subscription.total_cleanings_completed || 0}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Started:</strong> {subscription.started_date ? new Date(subscription.started_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle>Manage Subscription</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {subscription.status === 'active' && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Pause className="w-4 h-4" />
                      Pause Subscription
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Temporarily pause your subscription. You can resume anytime.
                    </p>
                    <Label htmlFor="pauseDate">Resume Date</Label>
                    <Input
                      id="pauseDate"
                      type="date"
                      value={pauseDate}
                      onChange={(e) => setPauseDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mb-2"
                    />
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Subscription
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      Cancel Subscription
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Cancel your subscription. This cannot be undone and you'll lose your discount.
                    </p>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </div>
                </>
              )}

              {subscription.status === 'paused' && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Resume Subscription
                  </h3>
                  {subscription.paused_until && (
                    <p className="text-sm text-slate-600 mb-3">
                      Scheduled to resume on {new Date(subscription.paused_until).toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    onClick={handleResume}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Resume Now
                  </Button>
                </div>
              )}

              {subscription.status === 'cancelled' && (
                <Alert className="border-slate-200 bg-slate-50">
                  <AlertDescription className="text-slate-700">
                    This subscription has been cancelled. To start a new subscription, book a cleaner and select the subscription option.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Have questions about your subscription?
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Support'))}
                  variant="outline"
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}