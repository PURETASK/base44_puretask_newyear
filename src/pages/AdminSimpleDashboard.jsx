import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar, XCircle, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';

export default function AdminSimpleDashboard() {
  const [stats, setStats] = useState({
    today: {},
    last7Days: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get all bookings for last 7 days
      const allBookings = await base44.entities.Booking.list('-created_date', 500);
      const todayBookings = allBookings.filter(b => b.created_date?.startsWith(today));
      const last7DaysBookings = allBookings.filter(b => 
        b.created_date >= sevenDaysAgo
      );

      // Get disputes
      const allDisputes = await base44.entities.Dispute.list('-created_date', 100);
      const todayDisputes = allDisputes.filter(d => d.created_date?.startsWith(today));
      const last7DaysDisputes = allDisputes.filter(d => 
        d.created_date >= sevenDaysAgo
      );

      // Calculate stats
      const todayStats = {
        created: todayBookings.length,
        completed: todayBookings.filter(b => b.status === 'completed').length,
        cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
        disputes: todayDisputes.filter(d => d.status === 'open').length,
        gmv: todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
      };

      const last7Stats = {
        created: last7DaysBookings.length,
        completed: last7DaysBookings.filter(b => b.status === 'completed').length,
        cancelled: last7DaysBookings.filter(b => b.status === 'cancelled').length,
        disputes: last7DaysDisputes.filter(d => d.status === 'open').length,
        gmv: last7DaysBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
      };

      // Calculate percentages
      todayStats.completionRate = todayStats.created > 0 
        ? ((todayStats.completed / todayStats.created) * 100).toFixed(1)
        : 0;
      todayStats.cancellationRate = todayStats.created > 0
        ? ((todayStats.cancelled / todayStats.created) * 100).toFixed(1)
        : 0;

      last7Stats.completionRate = last7Stats.created > 0
        ? ((last7Stats.completed / last7Stats.created) * 100).toFixed(1)
        : 0;
      last7Stats.cancellationRate = last7Stats.created > 0
        ? ((last7Stats.cancelled / last7Stats.created) * 100).toFixed(1)
        : 0;

      setStats({
        today: todayStats,
        last7Days: last7Stats
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading stats:', showToast: false });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-puretask-blue mx-auto mb-4"></div>
          <p className="text-gray-600 font-verdana">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'text-puretask-blue' }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 font-verdana mb-1">{title}</p>
            <p className="text-3xl font-fredoka font-bold text-graphite">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 font-verdana mt-1">{subtitle}</p>}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 font-verdana">Platform KPIs at a glance</p>
        </div>

        {/* Today's Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-fredoka font-bold text-graphite mb-4">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Bookings Created"
              value={stats.today.created}
              icon={Calendar}
              color="text-blue-600"
            />
            <StatCard
              title="Completed"
              value={stats.today.completed}
              subtitle={`${stats.today.completionRate}% completion rate`}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatCard
              title="Cancelled"
              value={stats.today.cancelled}
              subtitle={`${stats.today.cancellationRate}% cancellation rate`}
              icon={XCircle}
              color="text-red-600"
            />
            <StatCard
              title="Open Disputes"
              value={stats.today.disputes}
              icon={AlertTriangle}
              color="text-orange-600"
            />
          </div>
          <div className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">Today's GMV</p>
                    <p className="text-3xl font-fredoka font-bold text-graphite">
                      {Math.round(stats.today.gmv).toLocaleString()} credits
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Last 7 Days Stats */}
        <div>
          <h2 className="text-xl font-fredoka font-bold text-graphite mb-4">Last 7 Days</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Bookings Created"
              value={stats.last7Days.created}
              icon={Calendar}
              color="text-blue-600"
            />
            <StatCard
              title="Completed"
              value={stats.last7Days.completed}
              subtitle={`${stats.last7Days.completionRate}% completion rate`}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatCard
              title="Cancelled"
              value={stats.last7Days.cancelled}
              subtitle={`${stats.last7Days.cancellationRate}% cancellation rate`}
              icon={XCircle}
              color="text-red-600"
            />
            <StatCard
              title="Open Disputes"
              value={stats.last7Days.disputes}
              icon={AlertTriangle}
              color="text-orange-600"
            />
          </div>
          <div className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">7-Day GMV</p>
                    <p className="text-3xl font-fredoka font-bold text-graphite">
                      {Math.round(stats.last7Days.gmv).toLocaleString()} credits
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-puretask-blue" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}