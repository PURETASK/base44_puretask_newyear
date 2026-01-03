import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Gift, Zap, Trophy, CheckCircle, Camera } from 'lucide-react';

export default function MilestoneTracker({ cleanerEmail }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [cleanerEmail]);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const results = await base44.entities.CleanerMilestone.filter({
        cleaner_email: cleanerEmail
      }, '-earned_date', 20);
      setMilestones(results);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
    setLoading(false);
  };

  const milestoneInfo = {
    'first_10_jobs': { icon: Award, label: 'First 10 Jobs', color: 'bg-blue-100 text-blue-800' },
    'first_50_jobs': { icon: Trophy, label: 'First 50 Jobs', color: 'bg-purple-100 text-purple-800' },
    'first_100_jobs': { icon: Trophy, label: '100 Jobs Milestone', color: 'bg-yellow-100 text-yellow-800' },
    'perfect_month': { icon: Zap, label: 'Perfect Month', color: 'bg-orange-100 text-orange-800' },
    'reliability_elite': { icon: Award, label: 'Reliability Elite', color: 'bg-green-100 text-green-800' },
    'zero_dispute_month': { icon: CheckCircle, label: 'Zero Disputes', color: 'bg-teal-100 text-teal-800' },
    'photo_compliance_perfect': { icon: Camera, label: '100% Photo Compliance', color: 'bg-pink-100 text-pink-800' }
  };

  if (milestones.length === 0) {
    return (
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="font-fredoka text-xl flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-verdana">
              Complete jobs to unlock achievements!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-fredoka text-xl flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Achievements Unlocked
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map((milestone) => {
          const info = milestoneInfo[milestone.milestone_type] || {
            icon: Award,
            label: milestone.milestone_type,
            color: 'bg-gray-100 text-gray-800'
          };
          const Icon = info.icon;

          return (
            <div
              key={milestone.id}
              className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${info.color.replace('text-', 'bg-').replace('800', '200')}`}>
                  <Icon className={`w-5 h-5 ${info.color}`} />
                </div>
                <div>
                  <div className="font-fredoka font-semibold text-graphite">
                    {info.label}
                  </div>
                  <div className="text-xs text-gray-500 font-verdana">
                    Earned {new Date(milestone.earned_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Badge className={info.color}>
                {milestone.reward_type === 'bonus_payout' && `+${milestone.reward_value}%`}
                {milestone.reward_type === 'profile_boost' && `+${milestone.reward_value} visibility`}
                {milestone.reward_type === 'instant_book_enabled' && 'Instant Book ⚡'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}