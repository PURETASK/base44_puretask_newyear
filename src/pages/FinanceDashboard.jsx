import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const daily = await base44.entities.PlatformAnalyticsDaily.list('-created_date', 30);
      setDailyData(daily.reverse());
      
      // Calculate totals
      const totalGmv = daily.reduce((sum, d) => sum + (d.gmv_usd || 0), 0);
      const totalRevenue = daily.reduce((sum, d) => sum + (d.platform_revenue_usd || 0), 0);
      const totalRefunds = daily.reduce((sum, d) => sum + (d.refunds_usd || 0), 0);
      const totalPayouts = daily.reduce((sum, d) => sum + (d.payouts_usd || 0), 0);
      
      setTotals({ totalGmv, totalRevenue, totalRefunds, totalPayouts });
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading finance dashboard:', showToast: false });
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

  const revenueBreakdown = [
    { name: 'Platform Revenue', value: totals.totalRevenue || 0, color: '#66B3FF' },
    { name: 'Cleaner Payouts', value: totals.totalPayouts || 0, color: '#28C76F' },
    { name: 'Refunds', value: totals.totalRefunds || 0, color: '#EA5455' }
  ];

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Finance Dashboard</h1>
          <p className="text-gray-600 font-verdana mt-2">Revenue, costs, and financial health</p>
        </div>

        {/* Financial KPIs */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">GMV (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-fresh-mint" />
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${totals.totalGmv?.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-2">Gross Merchandise Value</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Platform Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-puretask-blue" />
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${totals.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-2">15% Platform Fee</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Cleaner Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="w-8 h-8 text-purple-600" />
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${totals.totalPayouts?.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-2">80-85% to Cleaners</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Refunds Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="w-8 h-8 text-red-500" />
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${totals.totalRefunds?.toLocaleString() || 0}
                </p>
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-2">From disputes</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-12 font-verdana">No data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl">Net Margin Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="platform_revenue_usd" stroke="#66B3FF" name="Revenue ($)" strokeWidth={2} />
                  <Line type="monotone" dataKey="refunds_usd" stroke="#EA5455" name="Refunds ($)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Daily GMV Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">Daily GMV & Revenue (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="gmv_usd" fill="#66B3FF" name="GMV ($)" />
                <Bar dataKey="platform_revenue_usd" fill="#28C76F" name="Platform Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}