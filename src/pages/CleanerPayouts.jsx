import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, Clock, CheckCircle, Zap, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import InstantPayoutButton from '../components/payouts/InstantPayoutButton';
import PayoutHistoryTable from '../components/payouts/PayoutHistoryTable';
import EarningsBreakdown from '../components/payouts/EarningsBreakdown';
import PayoutExplainer from '../components/payouts/PayoutExplainer';

export default function CleanerPayouts() {
  const [user, setUser] = useState(null);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load cleaner profile
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setCleanerProfile(profiles[0]);
      }

      // Load earnings from CleanerEarning entity
      const allEarnings = await base44.entities.CleanerEarning.filter(
        { cleaner_email: currentUser.email },
        '-created_date'
      );
      setEarnings(allEarnings);

      // Load payouts
      const allPayouts = await base44.entities.Payout.filter(
        { cleaner_email: currentUser.email },
        '-created_date'
      );
      setPayouts(allPayouts);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading payout data:', showToast: false });
    }
    setLoading(false);
  };

  const calculateEarnings = () => {
    const pendingEarnings = earnings.filter(e => e.status === 'pending');
    const paidEarnings = earnings.filter(e => e.status === 'paid');
    
    const pending = pendingEarnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
    const paidOut = paidEarnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
    const totalEarned = pending + paidOut;
    const available = pending;

    return { totalEarned, paidOut, pending, available };
  };

  const requestInstantPayout = async () => {
    setRequesting(true);
    setMessage('');

    try {
      const { available } = calculateEarnings();
      
      if (available < 50) {
        setMessage('Minimum instant payout amount is $50');
        setRequesting(false);
        return;
      }

      const fee = available * 0.07; // 7% fee for instant payouts
      const amount = available - fee;

      await base44.entities.Payout.create({
        cleaner_email: user.email,
        amount,
        payout_type: 'instant',
        fee,
        status: 'pending'
      });

      setMessage('Instant payout requested successfully! Funds will be transferred within minutes.');
      loadData();
    } catch (error) {
      setMessage('Failed to request payout. Please try again.');
    }
    setRequesting(false);
  };

  const { totalEarned, paidOut, pending, available } = calculateEarnings();

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Earnings & Payouts</h1>
          <p className="text-lg text-slate-600">Track your income and request payouts</p>
        </div>

        {/* Payout System Explainer */}
        <div className="mb-6">
          <PayoutExplainer />
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-slate-900">${totalEarned.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-slate-900">${available.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-slate-900">${pending.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Paid Out</p>
              <p className="text-3xl font-bold text-slate-900">${paidOut.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Information Card */}
        <Card className="mb-8 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-8">
            <h2 className="font-fredoka font-bold text-2xl text-slate-900 mb-4">Payment Schedule</h2>
            <div className="bg-white p-6 rounded-2xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-2xl flex-shrink-0">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-fredoka font-bold text-lg text-slate-900 mb-2">Weekly Payouts (Free)</h3>
                  <p className="text-slate-700 font-verdana mb-2">
                    We automatically process payouts every <strong>Friday</strong> for all earnings that have been approved. 
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-green-100 text-green-800 border-0">✓ No Fees</Badge>
                    <Badge className="bg-green-100 text-green-800 border-0">✓ Automatic</Badge>
                    <Badge className="bg-green-100 text-green-800 border-0">✓ $50 Minimum</Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-2xl flex-shrink-0">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-fredoka font-bold text-lg text-slate-900 mb-2">Instant Payouts (7% Fee)</h3>
                  <p className="text-slate-700 font-verdana mb-2">
                    Need your money faster? Request an instant payout and receive funds within minutes. A 7% processing fee applies.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-purple-100 text-purple-800 border-0">⚡ Instant Transfer</Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-0">7% Fee</Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-0">$50 Minimum</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Instant Payout Card */}
          <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-fredoka font-bold text-xl text-graphite">Instant Payout</h3>
                  <p className="text-sm text-gray-600 font-verdana">7% Fee • Instant Transfer</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl mb-4">
                <p className="text-sm text-gray-600 font-verdana mb-2">Available for instant payout:</p>
                <p className="text-3xl font-fredoka font-bold text-purple-600">
                  ${available.toFixed(2)}
                </p>
                {available >= 50 && (
                  <p className="text-xs text-gray-500 font-verdana mt-2">
                    After 7% fee: ${(available * 0.93).toFixed(2)}
                  </p>
                )}
              </div>

              <Button 
                onClick={requestInstantPayout} 
                disabled={requesting || available < 50}
                className="w-full brand-gradient text-white font-fredoka font-bold rounded-full py-6 text-lg"
              >
                {requesting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Request Instant Payout
                  </>
                )}
              </Button>

              {available < 50 && (
                <p className="text-xs text-center text-gray-500 font-verdana mt-3">
                  Minimum $50 required for instant payout
                </p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Payout Card */}
          <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-2xl">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-fredoka font-bold text-xl text-graphite">Weekly Payout</h3>
                  <p className="text-sm text-gray-600 font-verdana">Free • Every Friday</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl mb-4">
                <p className="text-sm text-gray-600 font-verdana mb-2">Next automatic payout:</p>
                <p className="text-3xl font-fredoka font-bold text-green-600">
                  ${pending.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 font-verdana mt-2">
                  {pending >= 50 ? 'Will be paid this Friday' : 'Needs $50 minimum to process'}
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-xl">
                <p className="text-sm text-green-800 font-verdana font-semibold mb-2">
                  ✓ No Fees • ✓ Automatic • ✓ Every Friday
                </p>
                <p className="text-xs text-green-700 font-verdana">
                  Your earnings are automatically paid every Friday if you have at least $50 in approved earnings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs with Module 3 Components */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-md rounded-full">
            <TabsTrigger value="earnings" className="rounded-full font-fredoka">Earnings</TabsTrigger>
            <TabsTrigger value="payouts" className="rounded-full font-fredoka">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <EarningsBreakdown cleanerEmail={user?.email} statusFilter="all" />
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutHistoryTable cleanerEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}