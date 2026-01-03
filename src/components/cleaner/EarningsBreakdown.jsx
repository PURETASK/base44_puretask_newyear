/**
 * Earnings Breakdown - Section 5
 * Displays detailed earnings information for cleaners
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Calendar, Award, AlertCircle } from 'lucide-react';
import { creditsToUSD, formatUSD, formatCredits } from '../credits/CreditCalculator';

export default function EarningsBreakdown({ earnings, profile }) {
  // Calculate totals
  const pendingEarnings = earnings.filter(e => e.status === 'pending');
  const paidEarnings = earnings.filter(e => e.status === 'paid');
  
  const pendingCredits = pendingEarnings.reduce((sum, e) => sum + (e.credits_earned || 0), 0);
  const pendingUSD = pendingEarnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
  
  const lifetimeCredits = earnings.reduce((sum, e) => sum + (e.credits_earned || 0), 0);
  const lifetimeUSD = earnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
  
  const paidUSD = paidEarnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
  
  const payoutRate = profile?.payout_percentage || 0.80;
  const tier = profile?.tier || 'Semi Pro';
  
  return (
    <div className="space-y-6">
      {/* Earnings Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white">Pending</Badge>
            </div>
            <p className="text-4xl font-bold mb-1">{formatUSD(pendingUSD)}</p>
            <p className="text-sm opacity-90">Awaiting Payout</p>
            <p className="text-xs opacity-75 mt-2">
              {formatCredits(pendingCredits)} credits • {pendingEarnings.length} jobs
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white">Lifetime</Badge>
            </div>
            <p className="text-4xl font-bold mb-1">{formatUSD(lifetimeUSD)}</p>
            <p className="text-sm opacity-90">Total Earned</p>
            <p className="text-xs opacity-75 mt-2">
              {formatCredits(lifetimeCredits)} credits • {earnings.length} jobs
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white">Paid Out</Badge>
            </div>
            <p className="text-4xl font-bold mb-1">{formatUSD(paidUSD)}</p>
            <p className="text-sm opacity-90">Already Received</p>
            <p className="text-xs opacity-75 mt-2">
              {paidEarnings.length} payout{paidEarnings.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Your Payout Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">Current Tier</span>
                <Badge className="bg-purple-100 text-purple-700 text-lg px-4 py-1">
                  {tier}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">Payout Rate</span>
                <span className="text-3xl font-bold text-purple-600">
                  {(payoutRate * 100).toFixed(0)}%
                </span>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                You earn {(payoutRate * 100).toFixed(0)}% of credits charged. 
                Platform keeps {((1 - payoutRate) * 100).toFixed(0)}% for operations.
              </p>
              
              {payoutRate < 0.85 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Reach Elite tier to earn 85% payouts!
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Example: 300 credits</span>
                  <span className="font-medium">= $30.00</span>
                </div>
                <Progress value={100} className="h-2 bg-slate-200" />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-emerald-600">You: ${(30 * payoutRate).toFixed(2)}</span>
                  <span className="text-slate-500">Platform: ${(30 * (1 - payoutRate)).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Example: 500 credits</span>
                  <span className="font-medium">= $50.00</span>
                </div>
                <Progress value={100} className="h-2 bg-slate-200" />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-emerald-600">You: ${(50 * payoutRate).toFixed(2)}</span>
                  <span className="text-slate-500">Platform: ${(50 * (1 - payoutRate)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Weekly Payouts</p>
                <p className="text-sm text-slate-600">
                  Processed every Monday for jobs completed the previous week
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-slate-400 mt-2"></div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Instant Payout (Coming Soon)</p>
                <p className="text-sm text-slate-600">
                  Get paid instantly for a 5% fee (available to Elite tier)
                </p>
              </div>
            </div>

            {pendingEarnings.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">
                      Next Payout: {formatUSD(pendingUSD)}
                    </p>
                    <p className="text-sm text-amber-800">
                      {pendingEarnings.length} completed job{pendingEarnings.length !== 1 ? 's' : ''} pending payout
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}