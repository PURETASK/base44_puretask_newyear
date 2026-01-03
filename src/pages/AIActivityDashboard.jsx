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
  Sparkles, Calendar, MessageSquare, TrendingUp, Settings,
  Loader2, Bell, CheckCircle, Clock, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import AISchedulingSuggestions from '../components/ai/AISchedulingSuggestions';

export default function AIActivityDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiStats, setAiStats] = useState({
    suggestionsGenerated: 0,
    responsesGenerated: 0,
    remindersSent: 0,
    timeSaved: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'cleaner') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      const profiles = await base44.entities.CleanerProfile.filter({
        user_email: currentUser.email
      });

      if (profiles.length === 0) {
        navigate(createPageUrl('CleanerOnboarding'));
        return;
      }

      setCleanerProfile(profiles[0]);

      // Load AI activity stats from notifications
      const last30Days = subDays(new Date(), 30);
      const notifications = await base44.entities.Notification.filter({
        recipient_email: currentUser.email,
        created_date: { $gte: last30Days.toISOString() }
      });

      const aiNotifications = notifications.filter(n => n.metadata?.ai_generated);
      
      setAiStats({
        suggestionsGenerated: aiNotifications.filter(n => n.type === 'ai_suggestion').length,
        responsesGenerated: aiNotifications.filter(n => n.type === 'ai_response').length,
        remindersSent: aiNotifications.filter(n => n.type === 'job_reminder').length,
        timeSaved: aiNotifications.length * 5 // Estimate 5 minutes saved per AI action
      });

      // Build recent activity log
      const activity = aiNotifications.slice(0, 10).map(n => ({
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.created_date,
        read: n.is_read
      }));

      setRecentActivity(activity);

    } catch (error) {
      handleError(error, { userMessage: 'Error loading dashboard:', showToast: false });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const aiEnabled = cleanerProfile?.communication_settings?.ai_scheduling_enabled ||
                    cleanerProfile?.communication_settings?.pre_cleaning_reminder?.enabled;

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-fredoka font-bold text-graphite">AI Assistant</h1>
                <p className="text-gray-600 font-verdana">Automated communication & scheduling</p>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('AICommunicationSettings'))}
              variant="outline"
              className="font-fredoka"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {!aiEnabled && (
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-fredoka font-semibold text-graphite mb-1">
                      AI Assistant Not Active
                    </p>
                    <p className="text-sm text-gray-600 font-verdana mb-2">
                      Enable AI features in settings to automate your communication and get smart scheduling suggestions.
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl('AICommunicationSettings'))}
                      size="sm"
                      className="brand-gradient text-white font-fredoka"
                    >
                      Enable AI Features
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-puretask-blue mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {aiStats.suggestionsGenerated}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Scheduling Suggestions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {aiStats.responsesGenerated}
              </p>
              <p className="text-sm text-gray-600 font-verdana">AI Responses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <Bell className="w-8 h-8 text-amber-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {aiStats.remindersSent}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Auto Reminders</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-fresh-mint mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {aiStats.timeSaved}m
              </p>
              <p className="text-sm text-gray-600 font-verdana">Time Saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions" className="font-fredoka">
              <Calendar className="w-4 h-4 mr-2" />
              Smart Scheduling
            </TabsTrigger>
            <TabsTrigger value="activity" className="font-fredoka">
              <Sparkles className="w-4 h-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-puretask-blue" />
                  AI-Powered Scheduling Suggestions
                </CardTitle>
                <p className="text-sm text-gray-600 font-verdana">
                  Based on your availability, client preferences, and optimal routing
                </p>
              </CardHeader>
              <CardContent>
                <AISchedulingSuggestions cleanerEmail={user?.email} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Recent AI Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-verdana">No AI activity yet</p>
                    <p className="text-sm text-gray-500 font-verdana mt-2">
                      Enable AI features to start automating your communication
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-puretask-blue mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-fredoka font-semibold text-graphite">
                                {activity.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 font-verdana">
                              {activity.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How It Works */}
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="font-fredoka text-2xl">How AI Assists You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="w-8 h-8 text-puretask-blue" />
                </div>
                <h3 className="font-fredoka font-bold text-graphite mb-2">Smart Scheduling</h3>
                <p className="text-sm text-gray-600 font-verdana">
                  AI analyzes your calendar, client preferences, and location to suggest optimal booking times
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bell className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-fredoka font-bold text-graphite mb-2">Auto Reminders</h3>
                <p className="text-sm text-gray-600 font-verdana">
                  Receive personalized reminders with client-specific notes before each job
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-fredoka font-bold text-graphite mb-2">Quick Responses</h3>
                <p className="text-sm text-gray-600 font-verdana">
                  Generate professional responses to common client questions in seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}