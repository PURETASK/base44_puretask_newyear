import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, TrendingUp, Users, Repeat, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function GrowthDashboard() {
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [daily, analytics, subAnalytics, memAnalytics] = await Promise.all([
        base44.entities.PlatformAnalyticsDaily.list('-created_date', 30),
        base44.entities.AnalyticsEvent.list('-created_date', 100),
        base44.entities.SubscriptionAnalytics.filter({ id: 'global_subscription_stats' }),
        base44.entities.MembershipAnalytics.filter({ id: 'global_membership_stats' })
      ]);
      
      setDailyData(daily.reverse());
      setSubscriptionData(subAnalytics[0] || null);
      setMembershipData(memAnalytics[0] || null);
      
      // Build funnel
      const signups = analytics.filter(e => e.event_type === 'client_signup_success').length;
      const firstBookings = analytics.filter(e => e.event_type === 'first_booking_completed').length;
      const repeatBookings = analytics.filter(e => e.event_type === 'repeat_booking').length;
      const subscriptions = analytics.filter(e => e.event_type === 'subscription_started').length;
      
      setFunnelData([
        { stage: 'Signups', count: signups },
        { stage: 'First Booking', count: firstBookings },
        { stage: 'Repeat Booking', count: repeatBookings },
        { stage: 'Subscriptions', count: subscriptions }
      ]);
      
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading growth dashboard:', showToast: false });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const totalNewClients = dailyData.reduce((sum, d) => sum + (d.new_clients || 0), 0);
  const totalNewCleaners = dailyData.reduce((sum, d) => sum + (d.new_cleaners || 0), 0);

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Growth Dashboard</h1>
          <p className="text-gray-600 font-verdana mt-2">User acquisition & engagement metrics</p>
        </div>

        {/* Growth KPIs */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">New Clients (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserPlus className="w-8 h-8 text-puretask-blue" />
                <p className="text-3xl font-fredoka font-bold text-graphite">{totalNewClients}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">New Cleaners (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-fresh-mint" />
                <p className="text-3xl font-fredoka font-bold text-graphite">{totalNewCleaners}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Repeat className="w-8 h-8 text-purple-600" />
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {subscriptionData?.active_subscriptions || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-2">
                ${subscriptionData?.subscription_mrr_usd?.toLocaleString() || 0} MRR
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Active Memberships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-amber-600" />
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {membershipData?.active_memberships || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-2">
                ${membershipData?.membership_mrr_usd?.toLocaleString() || 0} MRR
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">User Growth (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="new_clients" stroke="#66B3FF" name="New Clients" strokeWidth={2} />
                <Line type="monotone" dataKey="new_cleaners" stroke="#28C76F" name="New Cleaners" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#66B3FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription & Membership Growth */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl">Subscription Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">Active Subscriptions</span>
                <span className="font-fredoka font-bold text-lg text-puretask-blue">
                  {subscriptionData?.active_subscriptions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">New (7d)</span>
                <span className="font-fredoka font-bold text-lg text-fresh-mint">
                  +{subscriptionData?.new_subscriptions_7d || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">Cancelled (7d)</span>
                <span className="font-fredoka font-bold text-lg text-red-600">
                  -{subscriptionData?.cancelled_subscriptions_7d || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">Monthly Recurring Revenue</span>
                <span className="font-fredoka font-bold text-lg text-purple-600">
                  ${subscriptionData?.subscription_mrr_usd?.toLocaleString() || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl">Membership Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">Active Memberships</span>
                <span className="font-fredoka font-bold text-lg text-puretask-blue">
                  {membershipData?.active_memberships || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">New (7d)</span>
                <span className="font-fredoka font-bold text-lg text-fresh-mint">
                  +{membershipData?.new_memberships_7d || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">Cancelled (7d)</span>
                <span className="font-fredoka font-bold text-lg text-red-600">
                  -{membershipData?.cancelled_memberships_7d || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-verdana text-sm text-gray-700">Monthly Recurring Revenue</span>
                <span className="font-fredoka font-bold text-lg text-purple-600">
                  ${membershipData?.membership_mrr_usd?.toLocaleString() || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}