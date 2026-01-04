// EarningsOptimizationPanel - AI-powered earnings tips
// Personalized recommendations to increase cleaner earnings

import React, { useState, useEffect } from 'react';
import { aiCleanerChatService, CleanerContext } from '@/services/aiCleanerChatService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, DollarSign, Target, Clock, Star, Award,
  Zap, Calendar, MapPin, Loader2, Lightbulb, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EarningsOptimizationPanelProps {
  cleanerId: string;
  cleanerEmail: string;
  stats: {
    totalJobs: number;
    reliabilityScore: number;
    avgRating: number;
    totalEarnings: number;
  };
}

export default function EarningsOptimizationPanel({
  cleanerId,
  cleanerEmail,
  stats
}: EarningsOptimizationPanelProps) {
  const [tips, setTips] = useState<string>('');
  const [scheduleTips, setScheduleTips] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earnings' | 'schedule'>('earnings');

  useEffect(() => {
    loadOptimizations();
  }, []);

  const loadOptimizations = async () => {
    try {
      setLoading(true);
      const context: CleanerContext = {
        cleanerId,
        cleanerEmail,
        stats
      };

      const [earningsTips, scheduleRecommendations] = await Promise.all([
        aiCleanerChatService.getEarningsOptimization(context),
        aiCleanerChatService.getScheduleRecommendations(context)
      ]);

      setTips(earningsTips);
      setScheduleTips(scheduleRecommendations);
    } catch (error) {
      console.error('Failed to load optimization tips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate potential earnings increase
  const getPotentialIncrease = () => {
    const avgPerJob = stats.totalJobs > 0 ? stats.totalEarnings / stats.totalJobs : 40;
    const reliabilityBonus = stats.reliabilityScore >= 90 ? 1.15 : 1.0;
    const moreJobsPerWeek = 2; // Assume 2 more jobs per week
    const potentialWeekly = avgPerJob * moreJobsPerWeek * reliabilityBonus;
    const potentialMonthly = potentialWeekly * 4;
    
    return {
      weekly: potentialWeekly,
      monthly: potentialMonthly,
      yearly: potentialMonthly * 12
    };
  };

  const potential = getPotentialIncrease();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-info mx-auto mb-4" />
          <p className="font-body text-gray-600">AI is analyzing your earnings potential...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-success-border">
      <CardHeader className="bg-gradient-to-r from-success-soft to-white">
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-success" />
          Earnings Optimization
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-success-soft border-success-border">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-heading font-bold text-success">
                ${stats.totalEarnings.toFixed(0)}
              </p>
              <p className="text-xs font-body text-gray-600">Total Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-system-soft border-system-border">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-system mx-auto mb-2" />
              <p className="text-2xl font-heading font-bold text-system">
                {stats.reliabilityScore}%
              </p>
              <p className="text-xs font-body text-gray-600">Reliability</p>
            </CardContent>
          </Card>

          <Card className="bg-warning-soft border-warning-border">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-heading font-bold text-warning">
                {stats.avgRating.toFixed(1)}
              </p>
              <p className="text-xs font-body text-gray-600">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Potential Earnings Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-success to-success/80 rounded-lg p-6 text-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6" />
            <h3 className="font-heading font-bold text-lg">Earnings Potential</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-heading font-bold">
                +${potential.weekly.toFixed(0)}
              </p>
              <p className="text-sm font-body opacity-90">per week</p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold">
                +${potential.monthly.toFixed(0)}
              </p>
              <p className="text-sm font-body opacity-90">per month</p>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold">
                +${(potential.yearly / 1000).toFixed(1)}k
              </p>
              <p className="text-sm font-body opacity-90">per year</p>
            </div>
          </div>
          <p className="text-sm font-body mt-4 opacity-90">
            <Lightbulb className="w-4 h-4 inline mr-1" />
            By optimizing your schedule and accepting strategic jobs, you could earn this much more!
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-3 px-4 font-heading font-semibold transition-colors ${
              activeTab === 'earnings'
                ? 'text-success border-b-2 border-success'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Earnings Tips
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-4 font-heading font-semibold transition-colors ${
              activeTab === 'schedule'
                ? 'text-success border-b-2 border-success'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedule Tips
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-success-soft rounded-lg">
                <Zap className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-heading font-semibold text-gray-800 mb-2">
                    AI-Powered Recommendations
                  </h4>
                  <div className="font-body text-gray-700 whitespace-pre-wrap">
                    {tips}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start font-body"
                  size="sm"
                >
                  <Star className="w-4 h-4 mr-2 text-warning" />
                  Improve Rating
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-body"
                  size="sm"
                >
                  <Award className="w-4 h-4 mr-2 text-system" />
                  Boost Reliability
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-body"
                  size="sm"
                >
                  <Clock className="w-4 h-4 mr-2 text-info" />
                  Work Peak Hours
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-body"
                  size="sm"
                >
                  <MapPin className="w-4 h-4 mr-2 text-success" />
                  Optimize Routes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-system-soft rounded-lg">
                <Calendar className="w-5 h-5 text-system mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-heading font-semibold text-gray-800 mb-2">
                    Schedule Optimization
                  </h4>
                  <div className="font-body text-gray-700 whitespace-pre-wrap">
                    {scheduleTips}
                  </div>
                </div>
              </div>

              {/* Best Times */}
              <Card className="bg-gradient-to-r from-info-soft to-white">
                <CardContent className="p-4">
                  <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-info" />
                    Peak Earning Times
                  </h4>
                  <ul className="space-y-2 font-body text-sm">
                    <li className="flex items-center justify-between">
                      <span>Friday - Sunday mornings</span>
                      <Badge variant="success">High Demand</Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Move-out cleanings (end of month)</span>
                      <Badge variant="success">High Pay</Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Weekday afternoons</span>
                      <Badge variant="system">Moderate</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Refresh Button */}
        <Button
          onClick={loadOptimizations}
          variant="outline"
          className="w-full font-heading"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Refresh Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}

