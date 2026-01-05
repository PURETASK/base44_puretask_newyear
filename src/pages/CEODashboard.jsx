import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Calendar, Target, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CEODashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load from cache first
      const cacheRecords = await base44.entities.DashboardCache.filter({ id: 'ceo_dashboard' });
      
      if (cacheRecords.length > 0) {
        setDashboardData(cacheRecords[0].payload);
      }
      
      // Also load raw daily data for charts
      const dailyAnalytics = await base44.entities.PlatformAnalyticsDaily.list('-created_date', 30);
      setDailyData(dailyAnalytics.reverse());
      
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading CEO dashboard:', showToast: false });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-gray-600 font-verdana">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">CEO Dashboard</h1>
            <p className="text-gray-600 font-verdana mt-2">Platform health & growth metrics</p>
          </div>
          <Badge className="bg-green-100 text-green-800 font-fredoka text-sm px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Total GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-puretask-blue" />
                <div>
                  <p className="text-3xl font-fredoka font-bold text-graphite">
                    ${(summary.total_gmv_30d || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 font-verdana">Gross Merchandise Value</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Platform Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-fresh-mint" />
                <div>
                  <p className="text-3xl font-fredoka font-bold text-graphite">
                    ${(summary.total_revenue_30d || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 font-verdana">15% Platform Fee</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Monthly Recurring Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-3xl font-fredoka font-bold text-graphite">
                    ${(summary.total_mrr || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 font-verdana">Subscriptions + Memberships</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-3xl font-fredoka font-bold text-graphite">
                    {(summary.active_subscriptions || 0) + (summary.active_memberships || 0)}
                  </p>
                  <p className="text-xs text-gray-500 font-verdana">Paying Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">Revenue Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gmv_usd" stroke="#66B3FF" name="GMV ($)" strokeWidth={2} />
                  <Line type="monotone" dataKey="platform_revenue_usd" stroke="#28C76F" name="Revenue ($)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12 font-verdana">No data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">Booking Volume (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_bookings" fill="#66B3FF" name="Total Bookings" />
                  <Bar dataKey="completed_bookings" fill="#28C76F" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12 font-verdana">No data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-lg">Cancellation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-fredoka font-bold text-graphite">
                {dailyData.length > 0 ? 
                  (dailyData.reduce((sum, d) => sum + (d.cancel_rate || 0), 0) / dailyData.length).toFixed(1) 
                  : '0.0'}%
              </p>
              <p className="text-sm text-gray-500 font-verdana mt-2">30-day average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-lg">Dispute Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-fredoka font-bold text-graphite">
                {dailyData.length > 0 ? 
                  (dailyData.reduce((sum, d) => sum + (d.dispute_rate || 0), 0) / dailyData.length).toFixed(1) 
                  : '0.0'}%
              </p>
              <p className="text-sm text-gray-500 font-verdana mt-2">30-day average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-lg">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-fredoka font-bold text-graphite">
                {dailyData.length > 0 ? 
                  (dailyData.reduce((sum, d) => sum + (d.avg_rating || 0), 0) / dailyData.length).toFixed(1) 
                  : '5.0'}⭐
              </p>
              <p className="text-sm text-gray-500 font-verdana mt-2">30-day average</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}