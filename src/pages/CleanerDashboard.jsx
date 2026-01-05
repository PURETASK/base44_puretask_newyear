import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import AIInsightsWidget from '../components/ai/AIInsightsWidget';
import AITodoList from '../components/ai/AITodoList';
import AIAssistantOnboardingWizard from '../components/ai/AIAssistantOnboardingWizard';
import AIAssistantGuide from '../components/ai/AIAssistantGuide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, Briefcase, DollarSign, Calendar, Search, GraduationCap,
  Settings, MessageSquare, Star, Award, BarChart3, ChevronRight,
  Loader2, CheckCircle, Clock, Video, Package, Target, Lightbulb, ArrowUp, Camera, MapPin, Bot
} from 'lucide-react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek } from 'date-fns';
import { getTierBadgeColor } from '../components/utils/tierColors';
import SmartSchedulingWidget from '../components/dashboard/SmartSchedulingWidget';
import UpcomingJobReminders from '../components/dashboard/UpcomingJobReminders';
import CleanerAssistantWidget from '../components/ai/CleanerAssistantWidget';
import FAQChatbot from '../components/chat/FAQChatbot';

export default function CleanerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({
    jobsThisWeek: 0,
    hoursThisWeek: 0,
    earningsThisWeek: 0,
    pendingJobs: 0
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [tierProgress, setTierProgress] = useState(null);
  const [insights, setInsights] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAIGuide, setShowAIGuide] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'cleaner') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Load cleaner profile
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
      if (profiles.length === 0) {
        navigate(createPageUrl('CleanerOnboarding'));
        return;
      }
      
      const profile = profiles[0];
      setCleanerProfile(profile);

      // Check if AI guide should be shown (first time seeing dashboard)
      const hasSeenGuide = localStorage.getItem(`ai_guide_seen_${currentUser.email}`);
      if (!hasSeenGuide && !profile.communication_settings?.booking_confirmation?.enabled) {
        setShowAIGuide(true);
      }

      // Load this week's bookings
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      
      const allBookings = await base44.entities.Booking.filter({
        cleaner_email: currentUser.email
      });

      const thisWeekBookings = allBookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= weekStart && bookingDate <= weekEnd;
      });

      const pendingJobs = allBookings.filter(b => 
        ['awaiting_cleaner_response', 'scheduled', 'accepted'].includes(b.status)
      );

      const weeklyHours = thisWeekBookings.reduce((sum, b) => sum + (b.hours || 0), 0);
      const weeklyEarnings = thisWeekBookings
        .filter(b => b.status === 'completed' || b.status === 'approved')
        .reduce((sum, b) => sum + (b.total_price * (profile.payout_percentage || 0.8)), 0);

      setWeeklyStats({
        jobsThisWeek: thisWeekBookings.length,
        hoursThisWeek: weeklyHours,
        earningsThisWeek: weeklyEarnings,
        pendingJobs: pendingJobs.length
      });

      // Load total earnings
      const earnings = await base44.entities.CleanerEarning.filter({
        cleaner_email: currentUser.email,
        status: { $in: ['pending', 'batched', 'paid'] }
      });
      const total = earnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
      setTotalEarnings(total);

      // Load unread messages
      const threads = await base44.entities.ConversationThread.filter({
        participants: { $in: [currentUser.email] }
      });
      const unread = threads.reduce((sum, t) => sum + (t.unread_count_cleaner || 0), 0);
      setUnreadMessages(unread);

      // Calculate performance metrics
      const completedBookings = allBookings.filter(b => b.status === 'approved' || b.status === 'completed');
      const metrics = {
        totalJobs: profile.total_jobs || 0,
        completionRate: profile.completion_confirmation_rate || 100,
        averageRating: profile.average_rating || 5.0,
        totalReviews: profile.total_reviews || 0,
        onTimeRate: profile.on_time_rate || 100,
        photoComplianceRate: profile.photo_compliance_rate || 100,
        communicationRate: profile.communication_rate || 100,
        attendanceRate: profile.attendance_rate || 100,
        reliabilityScore: profile.reliability_score || 75
      };
      setPerformanceMetrics(metrics);

      // Calculate tier progress
      const tierThresholds = {
        'Developing': { min: 0, max: 59, next: 'Semi Pro' },
        'Semi Pro': { min: 60, max: 74, next: 'Pro' },
        'Pro': { min: 75, max: 89, next: 'Elite' },
        'Elite': { min: 90, max: 100, next: null }
      };

      const currentTierInfo = tierThresholds[profile.tier] || tierThresholds['Semi Pro'];
      const progress = {
        currentTier: profile.tier,
        nextTier: currentTierInfo.next,
        currentScore: metrics.reliabilityScore,
        scoreNeeded: currentTierInfo.max + 1,
        pointsToGo: Math.max(0, (currentTierInfo.max + 1) - metrics.reliabilityScore),
        progressPercentage: ((metrics.reliabilityScore - currentTierInfo.min) / (currentTierInfo.max - currentTierInfo.min + 1)) * 100
      };
      setTierProgress(progress);

      // Generate actionable insights
      const generatedInsights = [];

      if (metrics.onTimeRate < 95) {
        generatedInsights.push({
          type: 'warning',
          icon: Clock,
          title: 'Improve Punctuality',
          message: `Your on-time rate is ${metrics.onTimeRate}%. Arriving late affects your score.`,
          action: 'Set calendar reminders 30 mins before each job'
        });
      }

      if (metrics.photoComplianceRate < 100) {
        generatedInsights.push({
          type: 'warning',
          icon: Camera,
          title: 'Upload More Photos',
          message: `Photo compliance at ${metrics.photoComplianceRate}%. Photos build client trust.`,
          action: 'Take 3+ before/after pairs for every job'
        });
      }

      if (metrics.communicationRate < 90) {
        generatedInsights.push({
          type: 'warning',
          icon: MessageSquare,
          title: 'Respond Faster',
          message: 'Quick responses lead to more bookings and better ratings.',
          action: 'Enable push notifications for messages'
        });
      }

      if (!profile.video_intro_url) {
        generatedInsights.push({
          type: 'tip',
          icon: Video,
          title: 'Add Video Introduction',
          message: 'Cleaners with videos get 200% more bookings.',
          action: 'Record a 30-second intro about yourself'
        });
      }

      if (metrics.totalReviews < 5) {
        generatedInsights.push({
          type: 'tip',
          icon: Star,
          title: 'Build Your Reputation',
          message: 'More reviews = higher trust. Ask satisfied clients to leave reviews.',
          action: 'Complete more jobs to collect reviews'
        });
      }

      if (progress.nextTier && progress.pointsToGo < 10) {
        generatedInsights.push({
          type: 'success',
          icon: Target,
          title: `Almost ${progress.nextTier}!`,
          message: `You're ${progress.pointsToGo.toFixed(1)} points away from the next tier.`,
          action: 'Focus on punctuality and photo quality'
        });
      }

      if ((profile.service_locations?.length || 0) < 3) {
        generatedInsights.push({
          type: 'tip',
          icon: MapPin,
          title: 'Expand Service Areas',
          message: 'Serving more areas increases booking opportunities.',
          action: 'Add nearby neighborhoods to your profile'
        });
      }

      setInsights(generatedInsights);

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

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      {showAIGuide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <AIAssistantGuide
              onStartSetup={() => {
                localStorage.setItem(`ai_guide_seen_${user.email}`, 'true');
                setShowAIGuide(false);
                setShowOnboarding(true);
              }}
            />
          </div>
        </div>
      )}

      {showOnboarding && cleanerProfile && (
        <AIAssistantOnboardingWizard
          cleanerProfile={cleanerProfile}
          onComplete={() => {
            setShowOnboarding(false);
            loadDashboardData();
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-lg text-gray-600 font-verdana">
                Here's your cleaning business overview
              </p>
            </div>
            
            {cleanerProfile?.tier && (
              <Badge className={`text-lg px-6 py-2 rounded-full font-fredoka border ${getTierBadgeColor(cleanerProfile.tier)}`}>
                <Award className="w-5 h-5 mr-2" />
                {cleanerProfile.tier}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* This Week Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <CardContent className="p-6">
              <Briefcase className="w-8 h-8 text-puretask-blue mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{weeklyStats.jobsThisWeek}</p>
              <p className="text-sm text-gray-600 font-verdana">Jobs This Week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-purple-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{weeklyStats.hoursThisWeek}</p>
              <p className="text-sm text-gray-600 font-verdana">Hours This Week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-fresh-mint mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">${weeklyStats.earningsThisWeek.toFixed(0)}</p>
              <p className="text-sm text-gray-600 font-verdana">Earned This Week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl cursor-pointer hover:shadow-xl transition-all"
            onClick={() => navigate(createPageUrl('Inbox'))}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-8 h-8 text-amber-600" />
                {unreadMessages > 0 && (
                  <Badge className="bg-red-500 text-white rounded-full font-fredoka">
                    {unreadMessages}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{unreadMessages}</p>
              <p className="text-sm text-gray-600 font-verdana">Unread Messages</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Widget - Top Priority */}
        {cleanerProfile && (
          <div className="mb-6">
            <AIInsightsWidget cleanerProfile={cleanerProfile} />
          </div>
        )}

        {/* AI Personal Assistant - Priority Widget */}
        <div className="mb-8">
          <CleanerAssistantWidget cleanerEmail={user?.email} />
        </div>

        {/* AI Widgets */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {cleanerProfile && (
            <div>
              <AITodoList cleanerEmail={cleanerProfile.user_email} />
            </div>
          )}
          <SmartSchedulingWidget cleanerEmail={user?.email} onUpdate={loadDashboardData} />
          <UpcomingJobReminders cleanerEmail={user?.email} />
        </div>

        {/* Performance Overview */}
        {cleanerProfile && performanceMetrics && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Reliability Score Card */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Reliability Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-6xl font-fredoka font-bold text-puretask-blue mb-2">
                      {performanceMetrics.reliabilityScore}
                    </p>
                    <p className="text-lg text-gray-600 font-verdana">
                      {performanceMetrics.reliabilityScore >= 90 ? 'Outstanding' : 
                       performanceMetrics.reliabilityScore >= 75 ? 'Excellent' : 
                       performanceMetrics.reliabilityScore >= 60 ? 'Good' : 'Developing'}
                    </p>
                  </div>
                  <div className="w-32 h-32">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="10"
                        strokeDasharray={`${(performanceMetrics.reliabilityScore / 100) * 283} 283`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#66B3FF" />
                          <stop offset="100%" stopColor="#00D4FF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-fredoka font-bold text-green-600">{performanceMetrics.attendanceRate}%</p>
                    <p className="text-xs text-gray-600 font-verdana">Attendance</p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl font-fredoka font-bold text-blue-600">{performanceMetrics.onTimeRate}%</p>
                    <p className="text-xs text-gray-600 font-verdana">On-Time</p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 text-center">
                    <Camera className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xl font-fredoka font-bold text-purple-600">{performanceMetrics.photoComplianceRate}%</p>
                    <p className="text-xs text-gray-600 font-verdana">Photo Quality</p>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center">
                    <MessageSquare className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-xl font-fredoka font-bold text-amber-600">{performanceMetrics.communicationRate}%</p>
                    <p className="text-xs text-gray-600 font-verdana">Communication</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Stats */}
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Career Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-puretask-blue" />
                    <span className="text-sm text-gray-600 font-verdana">Total Jobs</span>
                  </div>
                  <span className="text-2xl font-fredoka font-bold text-graphite">{performanceMetrics.totalJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-gray-600 font-verdana">Avg Rating</span>
                  </div>
                  <span className="text-2xl font-fredoka font-bold text-graphite">{performanceMetrics.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-fresh-mint" />
                    <span className="text-sm text-gray-600 font-verdana">Total Earned</span>
                  </div>
                  <span className="text-2xl font-fredoka font-bold text-graphite">${totalEarnings.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600 font-verdana">Reviews</span>
                  </div>
                  <span className="text-2xl font-fredoka font-bold text-graphite">{performanceMetrics.totalReviews}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tier Progress */}
        {tierProgress && tierProgress.nextTier && (
          <Card className="mb-8 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Target className="w-6 h-6" />
                Tier Progress: {tierProgress.currentTier} → {tierProgress.nextTier}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-verdana text-gray-600">
                    Current Score: {tierProgress.currentScore}
                  </span>
                  <span className="text-sm font-verdana text-gray-600">
                    Target: {tierProgress.scoreNeeded}
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, tierProgress.progressPercentage)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ArrowUp className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-fredoka font-bold text-graphite mb-1">
                      {tierProgress.pointsToGo.toFixed(1)} points to {tierProgress.nextTier}
                    </p>
                    <p className="text-sm text-gray-600 font-verdana">
                      {tierProgress.nextTier === 'Elite' 
                        ? 'Unlock maximum earnings (85% payout) and premium client access' 
                        : `Increase your visibility and unlock higher rates`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights & Tips */}
        {insights.length > 0 && (
          <Card className="mb-8 border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {insights.map((insight, idx) => {
                  const Icon = insight.icon;
                  const colorMap = {
                    warning: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
                    tip: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
                    success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' }
                  };
                  const colors = colorMap[insight.type] || colorMap.tip;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 ${colors.icon} flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                          <h3 className="font-fredoka font-bold text-graphite mb-1">{insight.title}</h3>
                          <p className="text-sm text-gray-700 font-verdana mb-2">{insight.message}</p>
                          <p className="text-xs text-gray-600 font-verdana italic">
                            💡 {insight.action}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-fredoka font-bold text-graphite mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate(createPageUrl('BrowseJobs'))}
              className="h-auto py-6 brand-gradient text-white rounded-2xl font-fredoka font-semibold shadow-lg hover:shadow-xl flex flex-col items-center gap-2"
            >
              <Search className="w-8 h-8" />
              <span>Find Jobs</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('CleanerSchedule'))}
              variant="outline"
              className="h-auto py-6 rounded-2xl font-fredoka font-semibold border-2 flex flex-col items-center gap-2"
            >
              <Briefcase className="w-8 h-8" />
              <span>My Active Jobs</span>
              {weeklyStats.pendingJobs > 0 && (
                <Badge className="bg-puretask-blue text-white font-fredoka mt-1">
                  {weeklyStats.pendingJobs}
                </Badge>
              )}
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('CleanerCalendar'))}
              variant="outline"
              className="h-auto py-6 rounded-2xl font-fredoka font-semibold border-2 flex flex-col items-center gap-2"
            >
              <Calendar className="w-8 h-8" />
              <span>Job Calendar</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('CleanerPayouts'))}
              variant="outline"
              className="h-auto py-6 rounded-2xl font-fredoka font-semibold border-2 flex flex-col items-center gap-2"
            >
              <DollarSign className="w-8 h-8" />
              <span>Earnings</span>
            </Button>
          </div>
        </div>

        {/* All Cleaner Pages Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-fredoka font-bold text-graphite mb-6">All Cleaner Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Job Marketplace', 
                icon: Search, 
                description: 'Find new cleaning opportunities',
                path: 'BrowseJobs',
                color: 'from-blue-50 to-cyan-50',
                iconColor: 'text-puretask-blue'
              },
              { 
                title: 'My Active Jobs', 
                icon: Briefcase, 
                description: 'Manage accepted bookings',
                path: 'CleanerSchedule',
                color: 'from-purple-50 to-indigo-50',
                iconColor: 'text-purple-600',
                badge: weeklyStats.pendingJobs > 0 ? weeklyStats.pendingJobs : null
              },
              { 
                title: 'Job Calendar', 
                icon: Calendar, 
                description: 'View all jobs on a calendar',
                path: 'CleanerCalendar',
                color: 'from-indigo-50 to-blue-50',
                iconColor: 'text-indigo-600'
              },
              { 
                title: 'Earnings & Payouts', 
                icon: DollarSign, 
                description: 'Track income and request payouts',
                path: 'CleanerPayouts',
                color: 'from-green-50 to-emerald-50',
                iconColor: 'text-fresh-mint'
              },
              { 
                title: 'Analytics', 
                icon: BarChart3, 
                description: 'Performance metrics and insights',
                path: 'CleanerAnalytics',
                color: 'from-amber-50 to-orange-50',
                iconColor: 'text-amber-600'
              },
              { 
                title: 'Resources & Education', 
                icon: GraduationCap, 
                description: 'Tips, discounts, and training',
                path: 'CleanerResources',
                color: 'from-pink-50 to-rose-50',
                iconColor: 'text-pink-600'
              },
              { 
                title: 'Messages', 
                icon: MessageSquare, 
                description: 'Chat with clients',
                path: 'Inbox',
                color: 'from-blue-50 to-purple-50',
                iconColor: 'text-puretask-blue',
                badge: unreadMessages > 0 ? unreadMessages : null
              },
              { 
                title: 'Profile Settings', 
                icon: Settings, 
                description: 'Update rates, availability, services',
                path: 'Profile',
                color: 'from-gray-50 to-slate-50',
                iconColor: 'text-gray-600'
              },
              { 
                title: 'AI Assistant Settings', 
                icon: Bot, 
                description: 'Configure AI communication & scheduling',
                path: 'AIAssistantSettings',
                color: 'from-blue-50 to-indigo-50',
                iconColor: 'text-puretask-blue'
              },
              { 
                title: 'Reliability Score', 
                icon: TrendingUp, 
                description: 'Learn how your score is calculated',
                path: 'ReliabilityScoreExplained',
                color: 'from-cyan-50 to-teal-50',
                iconColor: 'text-cyan-600'
              },
              { 
                title: 'Materials List', 
                icon: Package, 
                description: 'Recommended cleaning supplies',
                path: 'MaterialsList',
                color: 'from-indigo-50 to-violet-50',
                iconColor: 'text-indigo-600'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl cursor-pointer bg-gradient-to-br ${item.color}`}
                  onClick={() => navigate(createPageUrl(item.path))}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                      {item.badge && (
                        <Badge className="bg-puretask-blue text-white rounded-full font-fredoka">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-fredoka font-bold text-graphite text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 font-verdana mb-4">{item.description}</p>
                    <div className="flex items-center text-puretask-blue font-fredoka font-medium text-sm">
                      Open <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile Completion Checklist */}
        {cleanerProfile && (
          <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-purple-600" />
                Profile Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { 
                    label: 'Video Introduction', 
                    completed: !!cleanerProfile.video_intro_url,
                    impact: '+200% bookings',
                    action: () => navigate(createPageUrl('Profile'))
                  },
                  { 
                    label: 'Product Photos', 
                    completed: cleanerProfile.product_photos_verified,
                    impact: '+34% bookings',
                    action: () => navigate(createPageUrl('Profile'))
                  },
                  { 
                    label: 'Instant Book Enabled', 
                    completed: cleanerProfile.instant_book_enabled,
                    impact: '+30% bookings',
                    action: () => navigate(createPageUrl('Profile'))
                  },
                  { 
                    label: 'Bio & Specialties', 
                    completed: !!cleanerProfile.bio && (cleanerProfile.specialty_tags?.length > 0),
                    impact: 'Better matches',
                    action: () => navigate(createPageUrl('Profile'))
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border-2 cursor-pointer hover:shadow-md transition-all ${
                      item.completed
                        ? 'bg-green-100 border-fresh-mint'
                        : 'bg-white border-gray-200'
                    }`}
                    onClick={item.action}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-fredoka font-semibold text-graphite">{item.label}</span>
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-verdana">{item.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* FAQ Chatbot */}
      {user && <FAQChatbot agentName="cleanerFAQChatbot" title="Cleaner Assistant" userType="cleaner" />}
    </div>
  );
}