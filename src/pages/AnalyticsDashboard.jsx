import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, AlertCircle, ArrowRight, Loader2, Activity, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const [systemAlerts, dailyData] = await Promise.all([
        base44.entities.SystemAlert.filter({ is_resolved: false }),
        base44.entities.PlatformAnalyticsDaily.list('-created_date', 1)
      ]);
      
      setAlerts(systemAlerts);
      setLatestData(dailyData[0] || null);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading analytics overview:', showToast: false });
      setLoading(false);
    }
  };

  const dashboards = [
    {
      id: 'ceo',
      title: 'CEO Dashboard',
      description: 'High-level platform health, GMV, revenue trends',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      url: createPageUrl('CEODashboard')
    },
    {
      id: 'ops',
      title: 'Operations Dashboard',
      description: 'Bookings, cancellations, disputes, cleaner performance',
      icon: Activity,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      url: createPageUrl('OpsDashboard')
    },
    {
      id: 'finance',
      title: 'Finance Dashboard',
      description: 'Revenue, costs, margins, payouts, refunds',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      url: createPageUrl('FinanceDashboard')
    },
    {
      id: 'growth',
      title: 'Growth Dashboard',
      description: 'User acquisition, subscriptions, retention metrics',
      icon: Users,
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      url: createPageUrl('GrowthDashboard')
    }
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Analytics Hub</h1>
            <p className="text-gray-600 font-verdana mt-2">
              Data-driven insights for PureTask marketplace
            </p>
          </div>
          <Link to={createPageUrl('SystemAlerts')}>
            <Button className="brand-gradient font-fredoka">
              <AlertCircle className="w-4 h-4 mr-2" />
              View Alerts {alerts.length > 0 && `(${alerts.length})`}
            </Button>
          </Link>
        </div>

        {/* Active Alerts Banner */}
        {alerts.length > 0 && (
          <Card className="border-2 border-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <p className="font-fredoka font-bold text-red-900">
                    {alerts.length} Active System Alert{alerts.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-700 font-verdana">
                    {alerts[0]?.message}
                  </p>
                </div>
                <Link to={createPageUrl('SystemAlerts')}>
                  <Button variant="outline" className="border-red-600 text-red-600 font-fredoka">
                    View All
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {latestData && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-verdana text-gray-600">Today's Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {latestData.total_bookings || 0}
                </p>
                <p className="text-xs text-gray-500 font-verdana mt-1">
                  {latestData.completed_bookings || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-verdana text-gray-600">GMV (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  ${(latestData.gmv_usd || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 font-verdana mt-1">
                  ${(latestData.platform_revenue_usd || 0).toFixed(0)} revenue
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-verdana text-gray-600">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {(latestData.active_clients || 0) + (latestData.active_cleaners || 0)}
                </p>
                <p className="text-xs text-gray-500 font-verdana mt-1">
                  {latestData.active_clients || 0} clients, {latestData.active_cleaners || 0} cleaners
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-verdana text-gray-600">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-fredoka font-bold text-graphite">
                  {latestData.avg_rating?.toFixed(1) || '5.0'}⭐
                </p>
                <p className="text-xs text-gray-500 font-verdana mt-1">
                  {latestData.cancel_rate?.toFixed(1) || 0}% cancel rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {dashboards.map((dashboard, idx) => (
            <motion.div
              key={dashboard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={dashboard.url}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-puretask-blue overflow-hidden group">
                  <div className={`h-2 ${dashboard.color}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${dashboard.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <dashboard.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2 group-hover:text-puretask-blue transition-colors">
                          {dashboard.title}
                        </h3>
                        <p className="text-gray-600 font-verdana mb-4">
                          {dashboard.description}
                        </p>
                        <div className="flex items-center text-puretask-blue font-fredoka font-semibold group-hover:gap-3 gap-2 transition-all">
                          View Dashboard
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* System Info */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="font-fredoka text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-puretask-blue" />
              Analytics Engine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-verdana text-gray-600 mb-1">Real-time Updates</p>
                <p className="text-xl font-fredoka font-bold text-green-700">Active ✓</p>
                <p className="text-xs text-gray-500 font-verdana mt-1">Event-driven analytics</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-verdana text-gray-600 mb-1">Nightly Aggregation</p>
                <p className="text-xl font-fredoka font-bold text-blue-700">Scheduled ✓</p>
                <p className="text-xs text-gray-500 font-verdana mt-1">Runs at 3:00 AM daily</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-verdana text-gray-600 mb-1">Alert Detection</p>
                <p className="text-xl font-fredoka font-bold text-purple-700">Monitoring ✓</p>
                <p className="text-xs text-gray-500 font-verdana mt-1">Anomaly detection active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}