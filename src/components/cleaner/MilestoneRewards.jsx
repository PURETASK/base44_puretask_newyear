import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, TrendingUp, Star, Zap, Trophy, Gift, Check, Briefcase, DollarSign, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MILESTONE_DEFINITIONS = [
  {
    type: 'first_10_jobs',
    title: '10 Jobs Completed',
    description: 'Complete your first 10 jobs',
    icon: Briefcase,
    target: 10,
    reward: 'Free instant payout (no 5% fee)',
    rewardType: 'free_instant_payout',
    rewardValue: 1
  },
  {
    type: 'first_50_jobs',
    title: '50 Jobs Milestone',
    description: 'Complete 50 jobs',
    icon: Trophy,
    target: 50,
    reward: '+2% bonus payout for 1 week',
    rewardType: 'bonus_percentage',
    rewardValue: 2
  },
  {
    type: 'first_100_jobs',
    title: '100 Jobs Milestone',
    description: 'Complete 100 jobs',
    icon: Award,
    target: 100,
    reward: '+3% bonus payout for 2 weeks',
    rewardType: 'bonus_percentage',
    rewardValue: 3
  },
  {
    type: 'perfect_month',
    title: 'Perfect Month',
    description: 'Complete a month with 100% attendance and 5-star reviews',
    icon: Star,
    target: 1,
    reward: 'Free instant payout + Featured profile for 1 week',
    rewardType: 'free_instant_payout',
    rewardValue: 1
  },
  {
    type: 'earnings_1000',
    title: '$1,000 Earned',
    description: 'Earn your first $1,000',
    icon: DollarSign,
    target: 1000,
    reward: 'Free instant payout',
    rewardType: 'free_instant_payout',
    rewardValue: 1
  },
  {
    type: 'earnings_5000',
    title: '$5,000 Earned',
    description: 'Earn $5,000 total',
    icon: TrendingUp,
    target: 5000,
    reward: '+2% bonus for 2 weeks',
    rewardType: 'bonus_percentage',
    rewardValue: 2
  },
  {
    type: 'zero_cancellations_3months',
    title: 'Reliability Champion',
    description: 'Zero cancellations for 3 months',
    icon: Shield,
    target: 90,
    reward: 'Priority listing + Free instant payout',
    rewardType: 'priority_listing',
    rewardValue: 14
  },
  {
    type: 'reliability_elite',
    title: 'Elite Status Achieved',
    description: 'Reach Elite tier (90+ reliability score)',
    icon: Sparkles,
    target: 90,
    reward: 'Permanent 85% payout rate',
    rewardType: 'bonus_percentage',
    rewardValue: 5
  }
];

export default function MilestoneRewards({ cleanerEmail, profile }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    loadMilestones();
  }, [cleanerEmail]);

  const loadMilestones = async () => {
    try {
      const achieved = await base44.entities.CleanerMilestone.filter({ cleaner_email: cleanerEmail });
      setMilestones(achieved);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
    setLoading(false);
  };

  const checkAndAwardMilestones = async () => {
    try {
      const totalJobs = profile.total_jobs || 0;
      const reliabilityScore = profile.reliability_score || 0;
      
      // Calculate total earnings
      const earnings = await base44.entities.CleanerEarning.filter({ cleaner_email: cleanerEmail });
      const totalEarned = earnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);

      // Check each milestone
      for (const milestone of MILESTONE_DEFINITIONS) {
        const alreadyAchieved = milestones.some(m => m.milestone_type === milestone.type);
        if (alreadyAchieved) continue;

        let achieved = false;

        // Check job-based milestones
        if (milestone.type.includes('jobs') && totalJobs >= milestone.target) {
          achieved = true;
        }

        // Check earnings milestones
        if (milestone.type.includes('earnings') && totalEarned >= milestone.target) {
          achieved = true;
        }

        // Check reliability milestones
        if (milestone.type === 'reliability_elite' && reliabilityScore >= 90) {
          achieved = true;
        }

        // Check cancellation milestone
        if (milestone.type === 'zero_cancellations_3months') {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          const recentBookings = await base44.entities.Booking.filter({
            cleaner_email: cleanerEmail,
            created_date: { $gte: threeMonthsAgo.toISOString() },
            cancelled_by: cleanerEmail
          });
          
          achieved = recentBookings.length === 0;
        }

        // Check perfect month
        if (milestone.type === 'perfect_month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          const monthBookings = await base44.entities.Booking.filter({
            cleaner_email: cleanerEmail,
            created_date: { $gte: oneMonthAgo.toISOString() },
            status: { $in: ['completed', 'approved'] }
          });

          const monthReviews = await base44.entities.Review.filter({
            cleaner_email: cleanerEmail,
            created_date: { $gte: oneMonthAgo.toISOString() }
          });

          const allFiveStars = monthReviews.every(r => r.rating === 5);
          achieved = monthBookings.length >= 10 && allFiveStars && profile.attendance_rate === 100;
        }

        if (achieved) {
          await awardMilestone(milestone);
        }
      }

      await loadMilestones();
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  };

  const awardMilestone = async (milestone) => {
    try {
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + (milestone.rewardValue || 7));

      await base44.entities.CleanerMilestone.create({
        cleaner_email: cleanerEmail,
        milestone_type: milestone.type,
        reward_type: milestone.rewardType,
        reward_value: milestone.rewardValue,
        reward_description: milestone.reward,
        achieved_date: new Date().toISOString(),
        expires_date: expiresDate.toISOString(),
        is_active: true,
        used: false
      });

      // Send celebration email
      await base44.integrations.Core.SendEmail({
        to: cleanerEmail,
        subject: `🎉 Milestone Achieved: ${milestone.title}!`,
        body: `Congratulations! You have achieved the "${milestone.title}" milestone!\n\nYour reward: ${milestone.reward}\n\nKeep up the great work!`
      });

      toast.success(`🎉 Milestone achieved: ${milestone.title}!`);
    } catch (error) {
      console.error('Error awarding milestone:', error);
    }
  };

  const claimReward = async (milestoneId) => {
    setClaiming(milestoneId);
    try {
      await base44.entities.CleanerMilestone.update(milestoneId, {
        used: true,
        used_date: new Date().toISOString()
      });

      toast.success('Reward claimed successfully!');
      await loadMilestones();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
    setClaiming(null);
  };

  const getMilestoneProgress = (milestone) => {
    const totalJobs = profile.total_jobs || 0;
    const reliabilityScore = profile.reliability_score || 0;

    if (milestone.type.includes('jobs')) {
      return Math.min(100, (totalJobs / milestone.target) * 100);
    }
    if (milestone.type === 'reliability_elite') {
      return Math.min(100, (reliabilityScore / 90) * 100);
    }
    return 0;
  };

  useEffect(() => {
    checkAndAwardMilestones();
  }, [profile]);

  const activeMilestones = milestones.filter(m => m.is_active && !m.used);
  const usedMilestones = milestones.filter(m => m.used);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600" />
            Milestone Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Earn rewards by hitting major milestones! Free payouts, bonus earnings, and more.
          </p>

          {/* Active Rewards */}
          {activeMilestones.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-500" />
                Active Rewards
              </h3>
              <div className="grid gap-3">
                {activeMilestones.map((milestone) => {
                  const definition = MILESTONE_DEFINITIONS.find(d => d.type === milestone.milestone_type);
                  const Icon = definition?.icon || Award;
                  
                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-white rounded-xl border-2 border-amber-300 shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{definition?.title}</p>
                            <p className="text-sm text-slate-600 mb-2">{milestone.reward_description}</p>
                            <Badge className="bg-amber-100 text-amber-800">
                              Expires: {new Date(milestone.expires_date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => claimReward(milestone.id)}
                          disabled={claiming === milestone.id}
                          className="bg-gradient-to-r from-emerald-500 to-green-600"
                        >
                          {claiming === milestone.id ? 'Claiming...' : 'Claim Reward'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Towards Milestones */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Your Progress
            </h3>
            <div className="grid gap-4">
              {MILESTONE_DEFINITIONS.map((milestone) => {
                const achieved = milestones.some(m => m.milestone_type === milestone.type);
                const progress = getMilestoneProgress(milestone);
                const Icon = milestone.icon;

                return (
                  <div
                    key={milestone.type}
                    className={`p-4 rounded-xl border-2 ${
                      achieved
                        ? 'bg-green-50 border-green-300'
                        : progress > 0
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          achieved
                            ? 'bg-green-500'
                            : progress > 0
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}>
                          {achieved ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <Icon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{milestone.title}</p>
                          <p className="text-sm text-slate-600 mb-2">{milestone.description}</p>
                          {!achieved && progress > 0 && (
                            <Progress value={progress} className="h-2" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={achieved ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}>
                          {achieved ? 'Achieved' : `${Math.round(progress)}%`}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">{milestone.reward}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Used Rewards History */}
          {usedMilestones.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Claimed Rewards</h3>
              <div className="space-y-2">
                {usedMilestones.map((milestone) => (
                  <div key={milestone.id} className="p-3 bg-slate-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">{milestone.reward_description}</p>
                      <p className="text-xs text-slate-500">
                        Claimed: {new Date(milestone.used_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}