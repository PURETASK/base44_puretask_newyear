import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Briefcase, RefreshCw, Calendar, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAnalytics() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [funnelData, setFunnelData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [bookingFunnel, setBookingFunnel] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [allEvents, allBookings] = await Promise.all([
        base44.entities.AnalyticsEvent.list('-timestamp', 5000),
        base44.entities.Booking.list('-created_date', 1000)
      ]);

      // Filter by time range
      const now = new Date();
      const daysAgo = parseInt(timeRange.replace('d', ''));
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const filteredEvents = allEvents.filter(e => 
        new Date(e.timestamp) >= cutoffDate
      );

      setEvents(filteredEvents);
      setBookings(allBookings);

      // Calculate funnel data
      calculateFunnelData(filteredEvents);
      calculateUserGrowth(filteredEvents);
      calculateBookingFunnel(filteredEvents, allBookings);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading analytics:', showToast: false });
    }
    setLoading(false);
  };

  const calculateFunnelData = (events) => {
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const bookingStarted = events.filter(e => e.event_type === 'booking_started').length;
    const bookingSubmitted = events.filter(e => e.event_type === 'booking_submitted').length;
    
    setFunnelData([
      { name: 'Page Views', value: pageViews, percentage: 100 },
      { name: 'Booking Started', value: bookingStarted, percentage: ((bookingStarted / pageViews) * 100).toFixed(1) },
      { name: 'Booking Submitted', value: bookingSubmitted, percentage: ((bookingSubmitted / pageViews) * 100).toFixed(1) }
    ]);
  };

  const calculateUserGrowth = (events) => {
    const signupEvents = events.filter(e => 
      e.event_type === 'client_signup_success' || e.event_type === 'cleaner_signup_success'
    );

    const dailyData = {};
    signupEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { date, clients: 0, cleaners: 0 };
      }
      if (event.user_type === 'client') {
        dailyData[date].clients++;
      } else if (event.user_type === 'cleaner') {
        dailyData[date].cleaners++;
      }
    });

    setUserGrowth(Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const calculateBookingFunnel = (events, bookings) => {
    const step1 = events.filter(e => e.event_type === 'booking_step_completed' && e.metadata?.step === 1).length;
    const step2 = events.filter(e => e.event_type === 'booking_step_completed' && e.metadata?.step === 2).length;
    const step3 = events.filter(e => e.event_type === 'booking_step_completed' && e.metadata?.step === 3).length;
    const submitted = events.filter(e => e.event_type === 'booking_submitted').length;
    const paid = bookings.filter(b => b.payment_captured).length;

    const total = step1 || 1;
    
    setBookingFunnel([
      { step: 'Step 1: Date/Time', count: step1, dropoff: 0 },
      { step: 'Step 2: Details', count: step2, dropoff: step1 - step2 },
      { step: 'Step 3: Summary', count: step3, dropoff: step2 - step3 },
      { step: 'Submitted', count: submitted, dropoff: step3 - submitted },
      { step: 'Paid', count: paid, dropoff: submitted - paid }
    ]);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString()}.json`;
    link.click();
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
            <p className="text-lg text-slate-600">Platform performance and user behavior insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Total Events</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{events.length}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Unique Sessions</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {new Set(events.map(e => e.session_id)).size}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Bookings Started</span>
                  <Briefcase className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {events.filter(e => e.event_type === 'booking_started').length}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Conversion Rate</span>
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {events.filter(e => e.event_type === 'booking_started').length > 0
                    ? ((events.filter(e => e.event_type === 'booking_submitted').length / 
                        events.filter(e => e.event_type === 'booking_started').length) * 100).toFixed(1)
                    : 0}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList>
            <TabsTrigger value="funnel">Booking Funnel</TabsTrigger>
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="events">Event Distribution</TabsTrigger>
            <TabsTrigger value="dropoff">Drop-off Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Booking Funnel - Step by Step</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={bookingFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="Users" />
                    <Bar dataKey="dropoff" fill="#ef4444" name="Drop-off" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>User Sign-ups Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clients" stroke="#3b82f6" name="Clients" strokeWidth={2} />
                    <Line type="monotone" dataKey="cleaners" stroke="#10b981" name="Cleaners" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Event Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        events.reduce((acc, e) => {
                          acc[e.event_type] = (acc[e.event_type] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(events.reduce((acc, e) => {
                        acc[e.event_type] = true;
                        return acc;
                      }, {})).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dropoff">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Conversion Funnel with Percentages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{step.name}</span>
                        <span className="text-slate-600">{step.value} users ({step.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${step.percentage}%` }}
                        >
                          {step.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Events Table */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Timestamp</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Event Type</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">User</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">User Type</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Page</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 50).map((event, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-sm text-slate-700">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-slate-700">{event.event_type}</td>
                      <td className="p-3 text-sm text-slate-700">{event.user_email || 'Guest'}</td>
                      <td className="p-3 text-sm text-slate-700">{event.user_type}</td>
                      <td className="p-3 text-sm text-slate-700 truncate max-w-xs">
                        {event.page_url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}