import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPermissions } from '@/components/admin/AdminPermissions';
import { 
  DollarSign, TrendingUp, Wallet, Loader2, CheckCircle, Clock, XCircle,
  Download, Calendar, ArrowUpRight, CreditCard, Gift, RefreshCw, BarChart3, Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { creditsToUSD } from '../components/credits/CreditCalculator';
import PendingPayoutsDetails from '../components/admin/PendingPayoutsDetails';

export default function AdminFinanceCenter() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState({});
  const [creditMetrics, setCreditMetrics] = useState({});
  const [dateRange, setDateRange] = useState('30');
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [payoutBreakdown, setPayoutBreakdown] = useState([]);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (user) {
      loadFinanceData();
    }
  }, [dateRange]);

  const checkAdminAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      const isAdmin = await AdminPermissions.isAdmin(currentUser);
      
      if (!isAdmin) {
        navigate(createPageUrl('Home'));
        return;
      }
      
      setUser(currentUser);
      await loadFinanceData();
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const daysToFetch = parseInt(dateRange);
      const [allPayouts, dailyAnalytics, payments, creditTxns, bookings, clientProfiles, earnings] = await Promise.all([
        base44.entities.Payout.list('-created_date', 500),
        base44.entities.PlatformAnalyticsDaily.list('-date', daysToFetch),
        base44.entities.Payment.list('-created_date', 500),
        base44.entities.CreditTransaction.list('-created_date', 1000),
        base44.entities.Booking.list('-created_date', 500),
        base44.entities.ClientProfile.list('', 1000),
        base44.entities.CleanerEarning.list('-created_date', 500)
      ]);

      setPayouts(allPayouts);
      setAnalytics(dailyAnalytics);

      // Filter data by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToFetch);

      const recentPayouts = allPayouts.filter(p => new Date(p.created_date) >= cutoffDate);
      const recentTxns = creditTxns.filter(t => new Date(t.created_date) >= cutoffDate);
      const recentBookings = bookings.filter(b => new Date(b.created_date) >= cutoffDate);

      // Calculate summary
      const totalGMV = dailyAnalytics.reduce((sum, d) => sum + (d.gmv_usd || 0), 0);
      const platformRevenue = dailyAnalytics.reduce((sum, d) => sum + (d.platform_revenue_usd || 0), 0);
      const totalPayouts = recentPayouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      const refunds = dailyAnalytics.reduce((sum, d) => sum + (d.refunds_usd || 0), 0);

      // Credit metrics
      const totalCreditsInCirculation = clientProfiles.reduce((sum, c) => sum + (c.credits_balance || 0), 0);
      const creditsPurchased = recentTxns
        .filter(t => t.transaction_type === 'purchase' && t.amount_credits > 0)
        .reduce((sum, t) => sum + t.amount_credits, 0);
      const creditsGranted = recentTxns
        .filter(t => ['promo', 'adjustment'].includes(t.transaction_type) && t.amount_credits > 0)
        .reduce((sum, t) => sum + t.amount_credits, 0);
      const creditsCharged = recentTxns
        .filter(t => t.transaction_type === 'charge')
        .reduce((sum, t) => sum + Math.abs(t.amount_credits), 0);

      setCreditMetrics({
        totalCreditsInCirculation,
        creditsPurchased,
        creditsPurchasedUSD: creditsToUSD(creditsPurchased),
        creditsGranted,
        creditsGrantedUSD: creditsToUSD(creditsGranted),
        creditsCharged,
        creditsChargedUSD: creditsToUSD(creditsCharged)
      });

      // Revenue breakdown
      const serviceFees = recentBookings
        .filter(b => b.status === 'approved' || b.status === 'completed')
        .reduce((sum, b) => {
          const cleanerPayout = (b.payout_percentage_at_accept || 0.8) * (b.final_charge_credits || b.total_price || 0);
          const platformFee = (b.final_charge_credits || b.total_price || 0) - cleanerPayout;
          return sum + creditsToUSD(platformFee);
        }, 0);

      const subscriptionRevenue = 0; // Placeholder

      setRevenueBreakdown([
        { name: 'Service Fees', value: serviceFees, color: '#66B3FF' },
        { name: 'Credit Purchases', value: creditsToUSD(creditsPurchased), color: '#28C76F' },
        { name: 'Subscriptions', value: subscriptionRevenue, color: '#FFA726' }
      ]);

      // Payout breakdown
      const completedPayouts = recentPayouts.filter(p => p.status === 'completed');
      const failedPayouts = recentPayouts.filter(p => p.status === 'failed');
      const pendingPayoutsFiltered = recentPayouts.filter(p => p.status === 'pending');

      setPayoutBreakdown([
        { name: 'Completed', value: completedPayouts.reduce((s, p) => s + p.amount, 0), count: completedPayouts.length, color: '#28C76F' },
        { name: 'Pending', value: pendingPayoutsFiltered.reduce((s, p) => s + p.amount, 0), count: pendingPayoutsFiltered.length, color: '#FFA726' },
        { name: 'Failed', value: failedPayouts.reduce((s, p) => s + p.amount, 0), count: failedPayouts.length, color: '#EA5455' }
      ]);

      setSummary({
        totalGMV,
        platformRevenue,
        totalPayouts,
        refunds,
        pendingPayouts: recentPayouts.filter(p => p.status === 'pending').length,
        completedPayouts: recentPayouts.filter(p => p.status === 'completed').length,
        failedPayouts: recentPayouts.filter(p => p.status === 'failed').length,
        pendingPayoutsAmount: recentPayouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
      });

      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading finance data:', showToast: false });
      setLoading(false);
    }
  };

  const getPayoutStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const exportPayoutsToCSV = () => {
    const headers = ['Date', 'Cleaner Email', 'Amount', 'Status', 'Type', 'Provider'];
    const rows = payouts.map(p => [
      new Date(p.created_date).toISOString(),
      p.cleaner_email,
      p.amount.toFixed(2),
      p.status,
      p.payout_type || '',
      p.provider || 'stripe'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts_${dateRange}days_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const COLORS = ['#66B3FF', '#28C76F', '#FFA726', '#EA5455', '#9C27B0'];

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Finance Center</h1>
            <p className="text-gray-600 font-verdana mt-2">Comprehensive financial oversight and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadFinanceData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards - Row 1: Financial Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 cursor-pointer"
              onClick={() => window.scrollTo({ top: document.getElementById('revenue-section')?.offsetTop - 100, behavior: 'smooth' })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="w-8 h-8 text-puretask-blue" />
                  <ArrowUpRight className="w-5 h-5 text-puretask-blue" />
                </div>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${summary.totalGMV?.toFixed(0) || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana">GMV ({dateRange} days)</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer"
              onClick={() => window.scrollTo({ top: document.getElementById('revenue-section')?.offsetTop - 100, behavior: 'smooth' })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-8 h-8 text-fresh-mint" />
                  <ArrowUpRight className="w-5 h-5 text-fresh-mint" />
                </div>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${summary.platformRevenue?.toFixed(0) || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana">Platform Revenue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 cursor-pointer"
              onClick={() => window.scrollTo({ top: document.getElementById('payouts-section')?.offsetTop - 100, behavior: 'smooth' })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-8 h-8 text-purple-600" />
                  <ArrowUpRight className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${summary.totalPayouts?.toFixed(0) || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana">Total Payouts</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 cursor-pointer"
              onClick={() => window.scrollTo({ top: document.getElementById('pending-section')?.offsetTop - 100, behavior: 'smooth' })}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <ArrowUpRight className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {summary.pendingPayouts || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana">Pending Payouts</p>
                <p className="text-xs text-amber-600 font-verdana mt-1">
                  ${summary.pendingPayoutsAmount?.toFixed(2) || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* KPI Cards - Row 2: Credit Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 cursor-pointer"
              onClick={() => navigate(createPageUrl('AdminCreditManagement'))}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-8 h-8 text-indigo-600" />
                  <ArrowUpRight className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {creditMetrics.totalCreditsInCirculation?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana">Credits in Circulation</p>
                <p className="text-xs text-indigo-600 font-verdana mt-1">
                  ≈ ${creditsToUSD(creditMetrics.totalCreditsInCirculation || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-green-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite">
                {creditMetrics.creditsPurchased?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Credits Purchased</p>
              <p className="text-xs text-green-600 font-verdana mt-1">
                ${creditMetrics.creditsPurchasedUSD?.toFixed(2) || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-6">
              <Gift className="w-8 h-8 text-pink-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite">
                {creditMetrics.creditsGranted?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Credits Granted</p>
              <p className="text-xs text-pink-600 font-verdana mt-1">
                ${creditMetrics.creditsGrantedUSD?.toFixed(2) || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <Activity className="w-8 h-8 text-orange-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite">
                {creditMetrics.creditsCharged?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Credits Charged</p>
              <p className="text-xs text-orange-600 font-verdana mt-1">
                ${creditMetrics.creditsChargedUSD?.toFixed(2) || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-full p-1 shadow-lg">
            <TabsTrigger value="overview" className="rounded-full font-fredoka">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-full font-fredoka">
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="payouts" className="rounded-full font-fredoka">
              <Wallet className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-full font-fredoka">
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Trend Chart */}
            <Card id="revenue-section">
              <CardHeader>
                <CardTitle className="font-fredoka text-xl flex items-center justify-between">
                  <span>Revenue Trends</span>
                  <Badge className="bg-blue-100 text-blue-800 font-fredoka">{dateRange} Days</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gmv_usd" stroke="#66B3FF" name="GMV" strokeWidth={2} />
                    <Line type="monotone" dataKey="platform_revenue_usd" stroke="#28C76F" name="Revenue" strokeWidth={2} />
                    <Line type="monotone" dataKey="refunds_usd" stroke="#EA5455" name="Refunds" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Payouts */}
            <Card id="payouts-section">
              <CardHeader>
                <CardTitle className="font-fredoka text-xl flex items-center justify-between">
                  <span>Recent Payouts</span>
                  <Button onClick={exportPayoutsToCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payouts.slice(0, 10).map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-verdana font-semibold">{payout.cleaner_email}</p>
                        <p className="text-sm text-gray-600 font-verdana">
                          {new Date(payout.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-fredoka font-bold text-lg text-graphite">${payout.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 font-verdana">{payout.payout_type}</p>
                      </div>
                      <Badge className={`font-fredoka ${getPayoutStatusColor(payout.status)}`}>
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue Breakdown Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
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
                  <div className="mt-4 space-y-2">
                    {revenueBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-verdana">{item.name}</span>
                        </div>
                        <span className="text-sm font-fredoka font-bold">${item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Trend Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl">Daily Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="platform_revenue_usd" fill="#28C76F" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Payout Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl">Payout Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={payoutBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) => `${name} (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {payoutBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {payoutBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-verdana">{item.name} ({item.count})</span>
                        </div>
                        <span className="text-sm font-fredoka font-bold">${item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payout Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl">Payout Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700 font-verdana">Completed</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-fredoka font-bold text-green-700">
                      {summary.completedPayouts || 0}
                    </p>
                    <p className="text-xs text-green-600 font-verdana mt-1">
                      ${summary.totalPayouts?.toFixed(2) || 0}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-700 font-verdana">Pending</span>
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-fredoka font-bold text-amber-700">
                      {summary.pendingPayouts || 0}
                    </p>
                    <p className="text-xs text-amber-600 font-verdana mt-1">
                      ${summary.pendingPayoutsAmount?.toFixed(2) || 0}
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-red-700 font-verdana">Failed</span>
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-fredoka font-bold text-red-700">
                      {summary.failedPayouts || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Payouts Tab */}
          <TabsContent value="pending" className="space-y-6" id="pending-section">
            <PendingPayoutsDetails />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}