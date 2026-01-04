// ReliabilityScoreBreakdown - Detailed reliability analysis
// Shows exactly how the score is calculated and how to improve

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award, CheckCircle, Clock, Star, TrendingUp, AlertTriangle,
  Target, Zap, Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReliabilityBreakdownProps {
  score: number;
  breakdown: {
    acceptanceRate: { score: number; weight: 20; actual: number };
    onTimeRate: { score: number; weight: 30; actual: number };
    completionRate: { score: number; weight: 30; actual: number };
    clientRatings: { score: number; weight: 20; actual: number };
  };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  jobsCompleted: number;
}

export default function ReliabilityScoreBreakdown({
  score,
  breakdown,
  tier,
  jobsCompleted
}: ReliabilityBreakdownProps) {
  
  const getTierInfo = () => {
    const tiers = {
      bronze: {
        name: 'Bronze',
        min: 0,
        max: 69,
        color: '#CD7F32',
        icon: Award,
        benefits: ['Basic job access', 'Standard payout: 80%']
      },
      silver: {
        name: 'Silver',
        min: 70,
        max: 84,
        color: '#C0C0C0',
        icon: Award,
        benefits: ['Priority job offers', 'Standard payout: 80%', '+5% bonus on weekends']
      },
      gold: {
        name: 'Gold',
        min: 85,
        max: 94,
        color: '#FFD700',
        icon: Trophy,
        benefits: ['First access to high-paying jobs', 'Enhanced payout: 82%', '+10% bonus on weekends', 'Featured cleaner badge']
      },
      platinum: {
        name: 'Platinum',
        min: 95,
        max: 100,
        color: '#E5E4E2',
        icon: Trophy,
        benefits: ['Exclusive VIP job access', 'Premium payout: 85%', '+15% bonus weekends', 'Priority support', 'Custom scheduling']
      }
    };
    
    return tiers[tier];
  };
  
  const tierInfo = getTierInfo();
  const Icon = tierInfo.icon;
  
  const nextTier = tier === 'bronze' ? 'silver' : tier === 'silver' ? 'gold' : tier === 'gold' ? 'platinum' : null;
  const pointsToNextTier = nextTier ? getTierInfo()[nextTier].min - score : 0;
  
  const factors = [
    {
      name: 'Job Acceptance',
      icon: CheckCircle,
      weight: breakdown.acceptanceRate.weight,
      score: breakdown.acceptanceRate.score,
      actual: breakdown.acceptanceRate.actual,
      color: '#22C55E',
      description: 'Accept jobs you can complete',
      tips: [
        'Accept 90%+ of job offers',
        'Only decline if truly necessary',
        'Fast responses improve score'
      ]
    },
    {
      name: 'On-Time Arrival',
      icon: Clock,
      weight: breakdown.onTimeRate.weight,
      score: breakdown.onTimeRate.score,
      actual: breakdown.onTimeRate.actual,
      color: '#06B6D4',
      description: 'Arrive on time or early',
      tips: [
        'Plan for traffic delays',
        'Leave 10 minutes early',
        'Update client if running late'
      ]
    },
    {
      name: 'Job Completion',
      icon: Target,
      weight: breakdown.completionRate.weight,
      score: breakdown.completionRate.score,
      actual: breakdown.completionRate.actual,
      color: '#06B6D4',
      description: 'Complete accepted jobs',
      tips: [
        'Avoid last-minute cancellations',
        'Complete 95%+ of jobs',
        'Request extra time if needed'
      ]
    },
    {
      name: 'Client Ratings',
      icon: Star,
      weight: breakdown.clientRatings.weight,
      score: breakdown.clientRatings.score,
      actual: breakdown.clientRatings.actual,
      color: '#F59E0B',
      description: 'Maintain high client satisfaction',
      tips: [
        'Take quality before/after photos',
        'Communicate with clients',
        'Go above and beyond'
      ]
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2" style={{ borderColor: tierInfo.color }}>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tierInfo.color}20` }}>
                <Icon className="w-8 h-8" style={{ color: tierInfo.color }} />
              </div>
              <div>
                <CardTitle className="font-heading text-2xl flex items-center gap-2">
                  {tierInfo.name} Tier
                  <Badge variant="system" className="font-heading">{score}%</Badge>
                </CardTitle>
                <p className="text-sm font-body text-gray-600 mt-1">
                  Based on {jobsCompleted} completed jobs
                </p>
              </div>
            </div>
            
            {nextTier && (
              <div className="text-right">
                <p className="text-sm font-body text-gray-600">Next Tier</p>
                <p className="text-2xl font-heading font-bold" style={{ color: tierInfo.color }}>
                  {pointsToNextTier}pts
                </p>
                <p className="text-xs font-body text-gray-500">to {nextTier}</p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-semibold">Current Benefits:</span>
              </div>
              <ul className="space-y-2">
                {tierInfo.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 font-body text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            {nextTier && (
              <div className="pt-4 border-t">
                <p className="font-heading font-semibold mb-2">Unlock at {getTierInfo()[nextTier].min}%:</p>
                <ul className="space-y-2">
                  {getTierInfo()[nextTier].benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 font-body text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-warning" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-info" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {factors.map((factor, index) => {
            const FIcon = factor.icon;
            const percentage = (factor.score / 100) * factor.weight;
            const maxPossible = factor.weight;
            
            return (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${factor.color}20` }}>
                      <FIcon className="w-5 h-5" style={{ color: factor.color }} />
                    </div>
                    <div>
                      <p className="font-heading font-semibold">{factor.name}</p>
                      <p className="text-xs font-body text-gray-600">{factor.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-heading font-bold" style={{ color: factor.color }}>
                      {percentage.toFixed(1)}
                    </p>
                    <p className="text-xs font-body text-gray-500">of {maxPossible} pts</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-body text-gray-600">
                    <span>Performance: {factor.actual}%</span>
                    <span>Weight: {factor.weight}%</span>
                  </div>
                  <Progress value={(percentage / maxPossible) * 100} className="h-2" />
                </div>
                
                {/* Tips */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-body text-info hover:text-info/80 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    How to improve
                  </summary>
                  <ul className="mt-2 ml-5 space-y-1">
                    {factor.tips.map((tip, i) => (
                      <li key={i} className="text-xs font-body text-gray-600">• {tip}</li>
                    ))}
                  </ul>
                </details>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Quick Improvement Actions */}
      <Card className="border-success-border">
        <CardHeader className="bg-gradient-to-r from-success-soft to-white">
          <CardTitle className="font-heading flex items-center gap-2">
            <Target className="w-5 h-5 text-success" />
            Quick Wins to Boost Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { action: 'Accept next 5 jobs', impact: '+2-3 pts', icon: CheckCircle },
              { action: 'Arrive early this week', impact: '+3-4 pts', icon: Clock },
              { action: 'Get 3 five-star ratings', impact: '+1-2 pts', icon: Star },
              { action: 'Complete 10 jobs in a row', impact: '+4-5 pts', icon: Trophy }
            ].map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border-2 border-success-border rounded-lg bg-success-soft hover:shadow-md transition-shadow cursor-pointer"
                >
                  <ItemIcon className="w-6 h-6 text-success mb-2" />
                  <p className="font-heading font-semibold text-sm mb-1">{item.action}</p>
                  <p className="text-xs font-body text-success">{item.impact}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

