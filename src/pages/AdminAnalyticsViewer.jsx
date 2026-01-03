import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3, TrendingUp, Users, Calendar, Loader2, Download, Filter,
  Eye, MousePointer, UserPlus, ShoppingCart, Star, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function AdminAnalyticsViewer() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Calculate date range
      const days = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), days));

      // Load events
      const analyticsEvents = await base44.entities.AnalyticsEvent.filter({
        timestamp: { $gte: startDate.toISOString() }
      }, '-timestamp', 1000);

      setEvents(analyticsEvents);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading analytics:', showToast: false });
    }
    setLoading(false);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const filteredEvents = events.filter(event => {
      const typeMatch = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
      const userMatch = userTypeFilter === 'all' || event.user_type === userTypeFilter;
      const searchMatch = !searchQuery || 
        event.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && userMatch && searchMatch;
    });

    const pageViews = filteredEvents.filter(e => e.event_type === 'page_view').length;
    const bookingStarted = filteredEvents.filter(e => e.event_type === 'booking_started').length;
    const bookingSubmitted = filteredEvents.filter(e => e.event_type === 'booking_submitted').length;
    const conversionRate = bookingStarted > 0 ? ((bookingSubmitted / bookingStarted) * 100).toFixed(1) : 0;
    
    const uniqueUsers = new Set(filteredEvents.map(e => e.user_email).filter(Boolean)).size;

    const eventsByType = {};
    filteredEvents.forEach(event => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    });

    const eventsByUserType = {};
    filteredEvents.forEach(event => {
      eventsByUserType[event.user_type] = (eventsByUserType[event.user_type] || 0) + 1;
    });

    return {
      total: filteredEvents.length,
      pageViews,
      bookingStarted,
      bookingSubmitted,
      conversionRate,
      uniqueUsers,
      eventsByType,
      eventsByUserType,
      recentEvents: filteredEvents.slice(0, 50)
    };
  };

  const metrics = calculateMetrics();

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Event Type', 'User Email', 'User Type', 'Page URL', 'Session ID'],
      ...metrics.recentEvents.map(e => [
        e.timestamp,
        e.event_type,
        e.user_email || 'guest',
        e.user_type || 'guest',
        e.page_url || '',
        e.session_id || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getEventIcon = (eventType) => {
    const icons = {
      page_view: Eye,
      booking_started: ShoppingCart,
      booking_submitted: Star,
      client_signup_success: UserPlus,
      cleaner_signup_success: UserPlus,
      booking_abandoned: XCircle
    };
    return icons[eventType] || MousePointer;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-puretask-blue" />
            Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-verdana">
            Platform usage and user behavior insights
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-fredoka font-medium text-graphite mb-2 block">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="rounded-full font-verdana">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-fredoka font-medium text-graphite mb-2 block">
                  Event Type
                </label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="rounded-full font-verdana">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="page_view">Page Views</SelectItem>
                    <SelectItem value="booking_started">Booking Started</SelectItem>
                    <SelectItem value="booking_submitted">Booking Submitted</SelectItem>
                    <SelectItem value="booking_abandoned">Booking Abandoned</SelectItem>
                    <SelectItem value="client_signup_success">Client Signup</SelectItem>
                    <SelectItem value="cleaner_signup_success">Cleaner Signup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-fredoka font-medium text-graphite mb-2 block">
                  User Type
                </label>
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="rounded-full font-verdana">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                    <SelectItem value="cleaner">Cleaners</SelectItem>
                    <SelectItem value="guest">Guests</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-fredoka font-medium text-graphite mb-2 block">
                  Search
                </label>
                <Input
                  placeholder="User email or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-verdana"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={exportData}
                variant="outline"
                className="rounded-full font-fredoka"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Eye className="w-10 h-10 text-puretask-blue mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{metrics.pageViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600 font-verdana">Page Views</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{metrics.uniqueUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-600 font-verdana">Unique Users</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{metrics.bookingSubmitted.toLocaleString()}</p>
              <p className="text-sm text-gray-600 font-verdana">Bookings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-fresh-mint mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{metrics.conversionRate}%</p>
              <p className="text-sm text-gray-600 font-verdana">Conversion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
              <CardTitle className="font-fredoka text-graphite">Events by Type</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Object.entries(metrics.eventsByType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([type, count]) => {
                    const Icon = getEventIcon(type);
                    const percentage = ((count / metrics.total) * 100).toFixed(1);
                    
                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-soft-cloud rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-puretask-blue" />
                          <span className="font-verdana text-sm text-graphite capitalize">
                            {type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-puretask-blue h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="font-fredoka font-bold text-graphite text-base min-w-[40px] text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <CardTitle className="font-fredoka text-graphite">Users by Type</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Object.entries(metrics.eventsByUserType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const percentage = ((count / metrics.total) * 100).toFixed(1);
                    
                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-soft-cloud rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="font-verdana text-sm text-graphite capitalize">
                            {type || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="font-fredoka font-bold text-graphite text-base min-w-[40px] text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
            <CardTitle className="font-fredoka text-graphite">Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics.recentEvents.map((event, idx) => {
                const Icon = getEventIcon(event.event_type);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center justify-between p-3 bg-soft-cloud rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="w-5 h-5 text-puretask-blue" />
                      <div className="flex-1">
                        <p className="font-fredoka font-semibold text-graphite text-sm">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-600 font-verdana">
                          {event.user_email || 'Guest'} • {event.user_type || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-verdana">
                        {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}