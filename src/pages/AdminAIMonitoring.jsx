import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot, TrendingUp, MessageSquare, CheckCircle2, Users, Calendar, Loader2, RefreshCw, Mail, Smartphone, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import ReengagementAnalytics from '../components/campaigns/ReengagementAnalytics';
import AutomationPerformance from '../components/campaigns/AutomationPerformance';

export default function AdminAIMonitoring() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalAISuggestions: 0,
    acceptedSlots: 0,
    declinedSlots: 0,
    conversionRate: 0,
    averageSlotsPerSuggestion: 0
  });
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [aiEnabledCleaners, setAiEnabledCleaners] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get all AI-enabled cleaners
      const allCleaners = await base44.asServiceRole.entities.CleanerProfile.list();
      const aiEnabled = allCleaners.filter(c => 
        c.communication_settings?.ai_scheduling_enabled === true
      );
      setAiEnabledCleaners(aiEnabled);

      // Get message delivery logs
      const logs = await base44.asServiceRole.entities.MessageDeliveryLog.list('-sent_at', 50);
      setDeliveryLogs(logs);

      // Get recent bookings created via AI
      const bookings = await base44.asServiceRole.entities.Booking.filter({
        matched_via_smart_algorithm: true
      });
      setRecentBookings(bookings.slice(0, 20));

      // Calculate metrics
      const accepted = bookings.filter(b => b.status === 'scheduled' || b.status === 'accepted').length;
      const declined = bookings.filter(b => b.status === 'cleaner_declined' || b.status === 'cancelled').length;
      const total = bookings.length;

      setMetrics({
        totalAISuggestions: total,
        acceptedSlots: accepted,
        declinedSlots: declined,
        conversionRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : 0,
        averageSlotsPerSuggestion: 3.2 // This would come from actual tracking
      });

    } catch (error) {
      handleError(error, { userMessage: 'Error loading dashboard:', showToast: false });
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-fredoka font-bold text-graphite">AI Monitoring Dashboard</h1>
              <p className="text-gray-600 font-verdana">Track AI-driven bookings and automated communications</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-blue-500" />
                <Badge className="bg-blue-100 text-blue-800">Total</Badge>
              </div>
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {metrics.totalAISuggestions}
              </p>
              <p className="text-sm text-gray-600 font-verdana">AI Suggestions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <Badge className="bg-green-100 text-green-800">Accepted</Badge>
              </div>
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {metrics.acceptedSlots}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Bookings Created</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <Badge className="bg-purple-100 text-purple-800">Rate</Badge>
              </div>
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {metrics.conversionRate}%
              </p>
              <p className="text-sm text-gray-600 font-verdana">Conversion Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-indigo-500" />
                <Badge className="bg-indigo-100 text-indigo-800">Active</Badge>
              </div>
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {aiEnabledCleaners.length}
              </p>
              <p className="text-sm text-gray-600 font-verdana">AI-Enabled Cleaners</p>
            </CardContent>
          </Card>
        </div>

        {/* Automation Performance */}
        <AutomationPerformance />

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">AI Bookings</TabsTrigger>
            <TabsTrigger value="messages">Message Delivery</TabsTrigger>
            <TabsTrigger value="cleaners">AI-Enabled Cleaners</TabsTrigger>
            <TabsTrigger value="campaigns">Re-engagement</TabsTrigger>
          </TabsList>

          {/* AI Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Recent AI-Driven Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-verdana">No AI-driven bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {booking.client_email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-fredoka font-bold">{booking.client_email}</p>
                              <p className="text-sm text-gray-600 font-verdana">
                                {new Date(booking.date).toLocaleDateString()} at {booking.start_time}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            booking.status === 'scheduled' || booking.status === 'accepted' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cleaner_declined' || booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Cleaner: {booking.cleaner_email}</span>
                          <span>•</span>
                          <span>${booking.total_price?.toFixed(2)}</span>
                          <span>•</span>
                          <span>{booking.hours}h {booking.cleaning_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message Delivery Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Message Delivery Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveryLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-verdana">No message logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deliveryLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-fredoka font-bold text-lg capitalize">
                              {log.message_type?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-600 font-verdana">
                              {log.cleaner_email} → {log.client_email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(log.sent_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {log.channels?.map((channel, idx) => {
                            const result = log.delivery_results?.[idx];
                            const icon = channel === 'sms' ? Smartphone : channel === 'email' ? Mail : Bell;
                            const Icon = icon;
                            
                            return (
                              <Badge 
                                key={idx}
                                className={
                                  result?.success 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {channel}
                                {result?.success ? ' ✓' : ' ✗'}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Re-engagement Campaign Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-6">
              <ReengagementAnalytics />
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka">How Re-engagement Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="font-fredoka font-bold text-blue-900 mb-2">Automated Client Outreach</p>
                    <p className="text-sm text-blue-800 font-verdana">
                      The system automatically identifies clients who haven't booked in a while and sends personalized re-engagement messages based on each cleaner's settings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="font-fredoka font-bold mb-2">📧 Multi-Channel Delivery</p>
                      <p className="text-sm text-gray-600">Campaigns are sent via email, SMS, and in-app notifications based on cleaner preferences.</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <p className="font-fredoka font-bold mb-2">💰 Optional Discounts</p>
                      <p className="text-sm text-gray-600">Cleaners can offer special discounts to win back inactive clients.</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <p className="font-fredoka font-bold mb-2">⏰ Smart Timing</p>
                      <p className="text-sm text-gray-600">Messages are sent at optimal times and never spam clients (max once per month).</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <p className="font-fredoka font-bold mb-2">📊 Performance Tracking</p>
                      <p className="text-sm text-gray-600">Track which campaigns lead to actual bookings and measure ROI.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI-Enabled Cleaners Tab */}
          <TabsContent value="cleaners">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Cleaners Using AI Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                {aiEnabledCleaners.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-verdana">No cleaners have enabled AI scheduling yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiEnabledCleaners.map((cleaner) => (
                      <div key={cleaner.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-fredoka font-bold text-lg">
                            {cleaner.full_name?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="font-fredoka font-bold">{cleaner.full_name}</p>
                            <p className="text-sm text-gray-600 font-verdana">{cleaner.user_email}</p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Gap Filling Priority:</span>
                            <Badge variant="outline">
                              {cleaner.communication_settings?.prioritize_gap_filling ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Suggest Days Ahead:</span>
                            <Badge variant="outline">
                              {cleaner.communication_settings?.suggest_days_in_advance || 14} days
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}