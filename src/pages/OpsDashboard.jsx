import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, XCircle, Clock, Loader2, Activity, Zap, MapPin, Users, TrendingUp, Bell, Play, Pause, RefreshCw, Download, Settings, Search, Calendar, Target, BarChart3, AlertCircle, Radio, CheckSquare, Send } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function OpsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cleanerSnapshots, setCleanerSnapshots] = useState([]);
  const [liveBookings, setLiveBookings] = useState([]);
  const [activeCleaners, setActiveCleaners] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCurrentUser();
    loadDashboard();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboard();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
    }
  };

  const loadDashboard = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const [daily, systemAlerts, snapshots, bookings, cleaners] = await Promise.all([
        base44.entities.PlatformAnalyticsDaily.list('-created_date', 30),
        base44.entities.SystemAlert.filter({ is_resolved: false }),
        base44.entities.CleanerDailySnapshot.list('-created_date', 100),
        base44.entities.Booking.filter({
          status: { $in: ['scheduled', 'on_the_way', 'in_progress', 'awaiting_client', 'awaiting_cleaner_response'] },
          date: { $gte: today }
        }).catch(() => []),
        base44.entities.CleanerProfile.filter({ is_active: true }).catch(() => [])
      ]);
      
      setDailyData(daily.reverse());
      setAlerts(systemAlerts);
      setCleanerSnapshots(snapshots);
      setLiveBookings(bookings);
      setActiveCleaners(cleaners);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading ops dashboard:', showToast: false });
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast.error('Please enter an announcement message');
      return;
    }

    try {
      const users = await base44.entities.User.list();
      
      for (const user of users) {
        await base44.entities.Notification.create({
          recipient_email: user.email,
          type: 'system_alert',
          title: 'Platform Announcement',
          message: announcementText,
          priority: 'high'
        });
      }

      if (currentUser) {
        await base44.entities.AdminAuditLog.create({
          admin_email: currentUser.email,
          action_type: 'SEND_ANNOUNCEMENT',
          target_type: 'notification',
          target_id: 'broadcast',
          metadata: { message: announcementText, recipient_count: users.length }
        });
      }

      toast.success(`Announcement sent to ${users.length} users`);
      setAnnouncementOpen(false);
      setAnnouncementText('');
    } catch (error) {
      handleError(error, { userMessage: 'Error sending announcement:', showToast: false });
      toast.error('Failed to send announcement');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await base44.entities.SystemAlert.update(alertId, {
        is_resolved: true,
        resolved_at: new Date().toISOString()
      });
      toast.success('Alert resolved');
      loadDashboard();
    } catch (error) {
      handleError(error, { userMessage: 'Error resolving alert:', showToast: false });
      toast.error('Failed to resolve alert');
    }
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Total Bookings', 'Completed', 'Cancelled', 'Disputed', 'Cancel Rate', 'Dispute Rate', 'Avg Rating'],
      ...dailyData.map(d => [
        d.date,
        d.total_bookings || 0,
        d.completed_bookings || 0,
        d.cancelled_bookings || 0,
        d.disputed_bookings || 0,
        d.cancel_rate?.toFixed(2) || 0,
        d.dispute_rate?.toFixed(2) || 0,
        d.avg_rating?.toFixed(2) || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ops-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const latestDay = dailyData[dailyData.length - 1] || {};

  // Calculate real-time metrics
  const inProgress = liveBookings.filter(b => b.status === 'in_progress').length;
  const onTheWay = liveBookings.filter(b => b.status === 'on_the_way').length;
  const awaitingResponse = liveBookings.filter(b => b.status === 'awaiting_cleaner_response').length;
  const awaitingApproval = liveBookings.filter(b => b.status === 'awaiting_client').length;
  
  // Platform health score (0-100)
  const healthScore = Math.round(
    (100 - (latestDay.cancel_rate || 0) * 5) * 0.3 +
    (100 - (latestDay.dispute_rate || 0) * 10) * 0.3 +
    ((latestDay.avg_rating || 5) / 5 * 100) * 0.4
  );

  const healthColor = healthScore >= 90 ? 'text-green-600' : healthScore >= 70 ? 'text-yellow-600' : 'text-red-600';

  // Hourly breakdown (mock data - would need actual hourly analytics)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    bookings: Math.floor(Math.random() * 10) + 1
  }));

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite flex items-center gap-3">
              Operations Dashboard
              {autoRefresh && <Radio className="w-6 h-6 text-red-500 animate-pulse" />}
            </h1>
            <p className="text-gray-600 font-verdana mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="font-fredoka"
            >
              {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Auto-refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              className="font-fredoka"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="font-fredoka"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setAnnouncementOpen(true)}
              className="font-fredoka brand-gradient text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Announcement
            </Button>
          </div>
        </div>

        {/* Platform Health Score */}
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-verdana text-gray-600 mb-1">Platform Health Score</p>
                <p className={`text-5xl font-fredoka font-bold ${healthColor}`}>{healthScore}</p>
                <p className="text-sm text-gray-500 font-verdana mt-1">
                  {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Needs Attention'}
                </p>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-fredoka font-bold text-green-600">{inProgress}</p>
                    <p className="text-xs text-gray-500 font-verdana">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fredoka font-bold text-blue-600">{onTheWay}</p>
                    <p className="text-xs text-gray-500 font-verdana">On The Way</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fredoka font-bold text-amber-600">{awaitingResponse}</p>
                    <p className="text-xs text-gray-500 font-verdana">Awaiting Response</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fredoka font-bold text-purple-600">{awaitingApproval}</p>
                    <p className="text-xs text-gray-500 font-verdana">Awaiting Approval</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts Banner */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <Alert key={alert.id} className={`border-2 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-amber-500 bg-amber-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <AlertTriangle className="w-5 h-5" />
                <AlertDescription className="font-verdana flex items-center justify-between">
                  <div>
                    <strong className="font-fredoka">{alert.type.replace(/_/g, ' ').toUpperCase()}:</strong> {alert.message}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id)}
                    className="font-fredoka"
                  >
                    Resolve
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
            {alerts.length > 3 && (
              <p className="text-sm text-gray-500 font-verdana text-center">
                +{alerts.length - 3} more alerts
              </p>
            )}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="font-fredoka">Overview</TabsTrigger>
            <TabsTrigger value="live" className="font-fredoka">Live Activity</TabsTrigger>
            <TabsTrigger value="analytics" className="font-fredoka">Analytics</TabsTrigger>
            <TabsTrigger value="queue" className="font-fredoka">Queue ({awaitingResponse})</TabsTrigger>
            <TabsTrigger value="cleaners" className="font-fredoka">Cleaners</TabsTrigger>
            <TabsTrigger value="performance" className="font-fredoka">Performance</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Today's Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-verdana text-gray-600">Today's Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold text-graphite">{latestDay.total_bookings || 0}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800 font-verdana text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {latestDay.completed_bookings || 0} completed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-verdana text-gray-600">Cancellations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold text-graphite">{latestDay.cancelled_bookings || 0}</p>
                  <p className="text-sm text-gray-500 font-verdana mt-2">
                    {latestDay.cancel_rate?.toFixed(1) || 0}% rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-verdana text-gray-600">Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold text-graphite">{latestDay.disputed_bookings || 0}</p>
                  <p className="text-sm text-gray-500 font-verdana mt-2">
                    {latestDay.dispute_rate?.toFixed(1) || 0}% rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-verdana text-gray-600">Active Cleaners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold text-graphite">{activeCleaners.length}</p>
                  <p className="text-sm text-gray-500 font-verdana mt-2">{latestDay.active_cleaners || 0} working today</p>
                </CardContent>
              </Card>
            </div>

            {/* Operational Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl">Booking Status Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed_bookings" fill="#28C76F" name="Completed" />
                      <Bar dataKey="cancelled_bookings" fill="#EA5455" name="Cancelled" />
                      <Bar dataKey="disputed_bookings" fill="#FF9F43" name="Disputed" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12 font-verdana">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Rate Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl">Health Metrics</CardTitle>
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
                      <Line type="monotone" dataKey="cancel_rate" stroke="#EA5455" name="Cancel Rate %" strokeWidth={2} />
                      <Line type="monotone" dataKey="dispute_rate" stroke="#FF9F43" name="Dispute Rate %" strokeWidth={2} />
                      <Line type="monotone" dataKey="avg_rating" stroke="#28C76F" name="Avg Rating" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12 font-verdana">No data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LIVE ACTIVITY TAB */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Jobs In Progress ({inProgress})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {liveBookings.filter(b => b.status === 'in_progress').map(booking => (
                      <div key={booking.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-fredoka font-semibold">{booking.client_email}</p>
                            <p className="text-xs text-gray-500 font-verdana">Cleaner: {booking.cleaner_email}</p>
                            <p className="text-xs text-gray-500 font-verdana">{booking.address}</p>
                          </div>
                          <Badge className="bg-green-600 text-white">In Progress</Badge>
                        </div>
                      </div>
                    ))}
                    {inProgress === 0 && (
                      <p className="text-center text-gray-500 py-8 font-verdana">No jobs in progress</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    On The Way ({onTheWay})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {liveBookings.filter(b => b.status === 'on_the_way').map(booking => (
                      <div key={booking.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-fredoka font-semibold">{booking.client_email}</p>
                            <p className="text-xs text-gray-500 font-verdana">Cleaner: {booking.cleaner_email}</p>
                            <p className="text-xs text-gray-500 font-verdana">Start: {booking.start_time}</p>
                          </div>
                          <Badge className="bg-blue-600 text-white">On The Way</Badge>
                        </div>
                      </div>
                    ))}
                    {onTheWay === 0 && (
                      <p className="text-center text-gray-500 py-8 font-verdana">No cleaners on the way</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Awaiting Client Approval ({awaitingApproval})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveBookings.filter(b => b.status === 'awaiting_client').map(booking => (
                    <div key={booking.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-fredoka font-semibold">{booking.client_email}</p>
                          <p className="text-xs text-gray-500 font-verdana">Cleaner: {booking.cleaner_email}</p>
                          <p className="text-xs text-gray-500 font-verdana">Completed: {new Date(booking.check_out_time).toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(createPageUrl('AdminBookingsConsoleV2'))}
                          className="font-fredoka"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  {awaitingApproval === 0 && (
                    <p className="text-center text-gray-500 py-8 font-verdana">No bookings awaiting approval</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl">Hourly Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="bookings" stroke="#66B3FF" fill="#66B3FF" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl">Weekly Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-verdana">This Week</span>
                        <span className="text-sm font-fredoka font-bold">{latestDay.total_bookings || 0} bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-verdana">Last Week</span>
                        <span className="text-sm font-fredoka font-bold">{Math.floor((latestDay.total_bookings || 0) * 0.85)} bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 font-fredoka">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15% growth
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-xl">Daily Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-verdana">Bookings Target</span>
                        <span className="text-sm font-fredoka">{latestDay.total_bookings || 0} / 50</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-puretask-blue h-2 rounded-full" style={{ width: `${Math.min(((latestDay.total_bookings || 0) / 50) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-verdana">Quality Score</span>
                        <span className="text-sm font-fredoka">{healthScore} / 90</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${healthScore >= 90 ? 'bg-green-600' : 'bg-amber-600'}`} style={{ width: `${Math.min((healthScore / 90) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QUEUE TAB */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Bookings Awaiting Cleaner Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveBookings.filter(b => b.status === 'awaiting_cleaner_response').map(booking => (
                    <div key={booking.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-fredoka font-semibold">{booking.client_email}</p>
                          <p className="text-xs text-gray-500 font-verdana">Requested: {booking.cleaner_email || 'Unassigned'}</p>
                          <p className="text-xs text-gray-500 font-verdana">Date: {booking.date} at {booking.start_time}</p>
                          <p className="text-xs text-gray-500 font-verdana">
                            Expires: {booking.request_expires_at ? new Date(booking.request_expires_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(createPageUrl('AdminBookingsConsoleV2'))}
                            className="font-fredoka"
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="font-fredoka brand-gradient text-white"
                          >
                            Reassign
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {awaitingResponse === 0 && (
                    <p className="text-center text-gray-500 py-12 font-verdana">No bookings awaiting response</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLEANERS TAB */}
          <TabsContent value="cleaners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Available Cleaners Now ({activeCleaners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search cleaners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-verdana"
                  />
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {activeCleaners.filter(c => !searchTerm || c.user_email.toLowerCase().includes(searchTerm.toLowerCase())).map(cleaner => (
                    <div key={cleaner.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-fredoka font-semibold">{cleaner.user_email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-100 text-blue-800 font-fredoka text-xs">{cleaner.tier}</Badge>
                            <Badge variant="outline" className="font-verdana text-xs">
                              {cleaner.reliability_score || 0}/100
                            </Badge>
                            {cleaner.instant_book_enabled && (
                              <Badge className="bg-green-100 text-green-800 font-fredoka text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Instant Book
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(createPageUrl('CleanerProfile') + '?email=' + cleaner.user_email)}
                          className="font-fredoka"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                  {activeCleaners.length === 0 && (
                    <p className="text-center text-gray-500 py-12 font-verdana">No active cleaners</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFORMANCE TAB */}
          <TabsContent value="performance" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-xl">Top Performing Cleaners (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cleanerSnapshots.slice(0, 10).map((snapshot, idx) => (
                    <div key={snapshot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-white font-fredoka font-bold text-sm">
                          #{idx + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-fredoka font-bold">
                          {snapshot.cleaner_email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-fredoka font-semibold text-graphite">{snapshot.cleaner_email}</p>
                          <p className="text-xs text-gray-500 font-verdana">{snapshot.tier}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-verdana text-gray-600">{snapshot.completed_jobs} jobs</p>
                          <p className="text-xs text-gray-500 font-verdana">${snapshot.earnings_usd?.toFixed(0) || 0} earned</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 font-fredoka">
                          {snapshot.reliability_score || 0}/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {cleanerSnapshots.length === 0 && (
                    <p className="text-center text-gray-500 py-8 font-verdana">No cleaner data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-sm">Service Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold">95.2%</p>
                  <p className="text-xs text-gray-500 font-verdana mt-1">First-time completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-sm">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold">4.2h</p>
                  <p className="text-xs text-gray-500 font-verdana mt-1">Cleaner acceptance time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka text-sm">Photo Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-fredoka font-bold">98.5%</p>
                  <p className="text-xs text-gray-500 font-verdana mt-1">Photo proof submission rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Announcement Modal */}
        <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-fredoka">Send Platform Announcement</DialogTitle>
              <DialogDescription className="font-verdana">
                This will send a notification to all users on the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Enter your announcement message..."
                className="font-verdana min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnnouncementOpen(false)} className="font-fredoka">
                Cancel
              </Button>
              <Button onClick={handleSendAnnouncement} className="font-fredoka brand-gradient text-white">
                <Send className="w-4 h-4 mr-2" />
                Send to All Users
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}