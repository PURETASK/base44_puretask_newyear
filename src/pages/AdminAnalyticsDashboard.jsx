import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Activity, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [latestDaily, setLatestDaily] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [subData, setSubData] = useState(null);
  const [memData, setMemData] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const [daily, activeAlerts, subs, mems] = await Promise.all([
        base44.entities.PlatformAnalyticsDaily.list('-created_date', 1),
        base44.entities.SystemAlert.filter({ is_resolved: false }),
        base44.entities.SubscriptionAnalytics.filter({ id: 'global_subscription_stats' }),
        base44.entities.MembershipAnalytics.filter({ id: 'global_membership_stats' })
      ]);
      
      setLatestDaily(daily[0] || {});
      setAlerts(activeAlerts);
      setSubData(subs[0] || {});
      setMemData(mems[0] || {});
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading analytics overview:', showToast: false });
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

  const dashboards = [
    {
      title: 'CEO Dashboard',
      description: 'High-level business metrics, GMV, revenue, and growth trends',
      icon: TrendingUp,
      color: '#66B3FF',
      path: 'CEODashboard',
      stats: [
        { label: 'GMV (30d)', value: `$${(latestDaily?.gmv_usd || 0).toLocaleString()}` },
        { label: 'Revenue', value: `$${(latestDaily?.platform_revenue_usd || 0).toLocaleString()}` }
      ]
    },
    {
      title: 'Operations Dashboard',
      description: 'Booking status, cancellations, disputes, and cleaner performance',
      icon: Activity,
      color: '#28C76F',
      path: 'OpsDashboard',
      stats: [
        { label: 'Total Bookings', value: latestDaily?.total_bookings || 0 },
        { label: 'Cancel Rate', value: `${latestDaily?.cancel_rate?.toFixed(1) || 0}%` }
      ]
    },
    {
      title: 'Finance Dashboard',
      description: 'Detailed financial breakdown, payouts, refunds, and margins',
      icon: DollarSign,
      color: '#9C27B0',
      path: 'FinanceDashboard',
      stats: [
        { label: 'Platform Revenue', value: `$${(latestDaily?.platform_revenue_usd || 0).toLocaleString()}` },
        { label: 'Refunds', value: `$${(latestDaily?.refunds_usd || 0).toLocaleString()}` }
      ]
    },
    {
      title: 'Growth Dashboard',
      description: 'User acquisition, funnel metrics, subscription & membership growth',
      icon: Users,
      color: '#FF9F43',
      path: 'GrowthDashboard',
      stats: [
        { label: 'New Clients', value: latestDaily?.new_clients || 0 },
        { label: 'Subscriptions', value: subData?.active_subscriptions || 0 }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Analytics Hub</h1>
          <p className="text-gray-600 font-verdana mt-2">Choose a dashboard to view detailed metrics</p>
        </div>

        {/* Active Alerts Summary */}
        {alerts.length > 0 && (
          <Card className="border-2 border-red-500 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-fredoka font-bold text-lg text-graphite">
                      {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600 font-verdana">
                      {alerts.filter(a => a.severity === 'critical').length} critical, 
                      {' '}{alerts.filter(a => a.severity === 'high').length} high priority
                    </p>
                  </div>
                </div>
                <Link to={createPageUrl('SystemAlerts')}>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-fredoka">
                    View Alerts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {dashboards.map((dashboard, idx) => (
            <motion.div
              key={dashboard.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl(dashboard.path)}>
                <Card className="border-2 hover:shadow-xl transition-all cursor-pointer h-full" style={{ borderColor: dashboard.color }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: dashboard.color }}>
                        <dashboard.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="font-fredoka text-xl text-graphite">{dashboard.title}</CardTitle>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-verdana">{dashboard.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {dashboard.stats.map((stat, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 font-verdana mb-1">{stat.label}</p>
                          <p className="text-lg font-fredoka font-bold text-graphite">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full font-fredoka" style={{ backgroundColor: dashboard.color }}>
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">Platform Health Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-3xl font-fredoka font-bold text-puretask-blue">
                  {latestDaily?.total_bookings || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Today's Bookings</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-fredoka font-bold text-fresh-mint">
                  {latestDaily?.avg_rating?.toFixed(1) || '5.0'}⭐
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Average Rating</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-3xl font-fredoka font-bold text-purple-600">
                  {latestDaily?.active_cleaners || 0}
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Active Cleaners</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-3xl font-fredoka font-bold text-amber-600">
                  ${((subData?.subscription_mrr_usd || 0) + (memData?.membership_mrr_usd || 0)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-verdana mt-1">Total MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}