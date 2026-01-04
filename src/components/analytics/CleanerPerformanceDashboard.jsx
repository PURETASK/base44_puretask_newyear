// CleanerPerformanceDashboard - Advanced Analytics & Insights
// Comprehensive performance tracking and AI-powered recommendations

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, Award, Target, Clock, DollarSign,
  Star, CheckCircle, AlertTriangle, Calendar, MapPin, Zap,
  BarChart3, PieChart, Activity, Trophy, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface PerformanceStats {
  // Overview
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalEarnings: number;
  avgEarningsPerJob: number;
  
  // Quality
  reliabilityScore: number;
  avgRating: number;
  totalReviews: number;
  
  // Time
  avgJobDuration: number;
  totalHoursWorked: number;
  onTimePercentage: number;
  
  // Trends
  weeklyEarnings: number[];
  weeklyJobs: number[];
  ratingTrend: number[];
  
  // Breakdown
  jobsByType: { type: string; count: number; earnings: number }[];
  earningsByDay: { day: string; amount: number }[];
}

export default function CleanerPerformanceDashboard({ cleanerId, cleanerEmail }) {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'earnings' | 'jobs' | 'ratings'>('earnings');

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Load all jobs for this cleaner
      const jobs = await base44.entities.Job.filter({
        assigned_cleaner_email: cleanerEmail
      });

      // Calculate stats
      const completed = jobs.filter(j => j.state === 'COMPLETED_APPROVED');
      const cancelled = jobs.filter(j => j.state === 'CANCELLED');
      
      const totalEarnings = completed.reduce((sum, j) => 
        sum + ((j.final_credits_charged || 0) * 0.8), 0
      );
      
      const totalMinutes = completed.reduce((sum, j) => 
        sum + (j.actual_minutes_worked || 0), 0
      );
      
      // Mock data for demo (TODO: calculate from real data)
      const mockStats: PerformanceStats = {
        totalJobs: jobs.length,
        completedJobs: completed.length,
        cancelledJobs: cancelled.length,
        totalEarnings,
        avgEarningsPerJob: completed.length > 0 ? totalEarnings / completed.length : 0,
        
        reliabilityScore: 92, // TODO: calculate real score
        avgRating: 4.8,
        totalReviews: completed.length,
        
        avgJobDuration: completed.length > 0 ? totalMinutes / completed.length : 0,
        totalHoursWorked: totalMinutes / 60,
        onTimePercentage: 95,
        
        weeklyEarnings: [450, 520, 480, 650],
        weeklyJobs: [5, 6, 5, 7],
        ratingTrend: [4.6, 4.7, 4.8, 4.8],
        
        jobsByType: [
          { type: 'basic', count: 12, earnings: 960 },
          { type: 'deep', count: 5, earnings: 750 },
          { type: 'moveout', count: 3, earnings: 540 }
        ],
        
        earningsByDay: [
          { day: 'Mon', amount: 120 },
          { day: 'Tue', amount: 160 },
          { day: 'Wed', amount: 140 },
          { day: 'Thu', amount: 180 },
          { day: 'Fri', amount: 220 },
          { day: 'Sat', amount: 280 },
          { day: 'Sun', amount: 200 }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-info" />
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = {
    primary: '#06B6D4',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold text-graphite">Performance Dashboard</h2>
          <p className="text-gray-600 font-body mt-1">Track your progress and optimize your earnings</p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(range => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              className="font-heading capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-success-border bg-gradient-to-br from-success-soft to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-success" />
                <Badge variant="success" className="font-heading">
                  +12%
                </Badge>
              </div>
              <p className="text-3xl font-heading font-bold text-success">
                ${stats.totalEarnings.toFixed(0)}
              </p>
              <p className="text-sm font-body text-gray-600 mt-1">Total Earnings</p>
              <p className="text-xs font-body text-gray-500 mt-2">
                ${stats.avgEarningsPerJob.toFixed(2)} avg per job
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-system-border bg-gradient-to-br from-system-soft to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-system" />
                <Badge variant="system" className="font-heading">
                  {stats.completedJobs}
                </Badge>
              </div>
              <p className="text-3xl font-heading font-bold text-system">
                {((stats.completedJobs / stats.totalJobs) * 100).toFixed(0)}%
              </p>
              <p className="text-sm font-body text-gray-600 mt-1">Completion Rate</p>
              <p className="text-xs font-body text-gray-500 mt-2">
                {stats.completedJobs} of {stats.totalJobs} jobs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-warning-border bg-gradient-to-br from-warning-soft to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-warning" />
                <Badge variant="warning" className="font-heading">
                  +0.2
                </Badge>
              </div>
              <p className="text-3xl font-heading font-bold text-warning">
                {stats.avgRating.toFixed(1)}
              </p>
              <p className="text-sm font-body text-gray-600 mt-1">Average Rating</p>
              <p className="text-xs font-body text-gray-500 mt-2">
                {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-info-border bg-gradient-to-br from-info-soft to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-info" />
                <Badge variant="info" className="font-heading">
                  Gold
                </Badge>
              </div>
              <p className="text-3xl font-heading font-bold text-info">
                {stats.reliabilityScore}%
              </p>
              <p className="text-sm font-body text-gray-600 mt-1">Reliability Score</p>
              <p className="text-xs font-body text-gray-500 mt-2">
                Top 15% of cleaners
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Earnings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.weeklyEarnings.map((amount, i) => ({
                week: `Week ${i + 1}`,
                earnings: amount
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" style={{ fontFamily: 'Quicksand' }} />
                <YAxis style={{ fontFamily: 'Quicksand' }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke={COLORS.success} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.success, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Earnings by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-system" />
              Earnings by Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.earningsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" style={{ fontFamily: 'Quicksand' }} />
                <YAxis style={{ fontFamily: 'Quicksand' }} />
                <Tooltip />
                <Bar dataKey="amount" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Breakdown */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Target className="w-5 h-5 text-info" />
              Job Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.jobsByType.map((job, index) => {
                const percentage = (job.count / stats.totalJobs) * 100;
                const avgEarnings = job.earnings / job.count;
                
                return (
                  <div key={job.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold capitalize">{job.type} Cleaning</span>
                      <span className="font-body text-sm text-gray-600">
                        {job.count} jobs · ${avgEarnings.toFixed(0)} avg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-3 rounded-full"
                        style={{ 
                          backgroundColor: index === 0 ? COLORS.success : index === 1 ? COLORS.primary : COLORS.info 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-body text-gray-500">
                      <span>{percentage.toFixed(0)}% of total jobs</span>
                      <span>${job.earnings.toFixed(0)} earned</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-warning" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-system-soft rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-system" />
                <span className="font-body text-sm">Avg Job Duration</span>
              </div>
              <span className="font-heading font-bold text-system">
                {Math.floor(stats.avgJobDuration / 60)}h {stats.avgJobDuration % 60}m
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-success-soft rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-body text-sm">On-Time Rate</span>
              </div>
              <span className="font-heading font-bold text-success">
                {stats.onTimePercentage}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning-soft rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                <span className="font-body text-sm">Total Hours</span>
              </div>
              <span className="font-heading font-bold text-warning">
                {stats.totalHoursWorked.toFixed(1)}h
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-error-soft rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <span className="font-body text-sm">Cancellations</span>
              </div>
              <span className="font-heading font-bold text-error">
                {stats.cancelledJobs}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-2 border-info">
        <CardHeader className="bg-gradient-to-r from-info-soft to-white">
          <CardTitle className="font-heading flex items-center gap-2">
            <Zap className="w-5 h-5 text-info" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-heading font-semibold text-success mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                What's Working Well
              </h4>
              <ul className="space-y-2 font-body text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <span>Your weekend earnings are 35% above average</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <span>On-time arrival rate is excellent (95%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <span>Client ratings improving (+0.2 this month)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-warning mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Growth Opportunities
              </h4>
              <ul className="space-y-2 font-body text-sm">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-warning mt-0.5" />
                  <span>Accept more deep cleaning jobs (+$150/mo potential)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-warning mt-0.5" />
                  <span>Work Tuesday mornings (lowest competition)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-warning mt-0.5" />
                  <span>Reduce avg job time by 10min saves 2hrs/week</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

