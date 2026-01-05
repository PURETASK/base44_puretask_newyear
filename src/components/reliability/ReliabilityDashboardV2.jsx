import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, CheckCircle, Clock, XCircle, 
  Camera, MessageSquare, Star, Target, Zap 
} from 'lucide-react';
import ReliabilityScoreExplainer from './ReliabilityScoreExplainer';
import TierProgressExplainer from '../tier/TierProgressExplainer';

export default function ReliabilityDashboardV2({ cleanerEmail }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [cleanerEmail]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profiles = await base44.entities.CleanerProfile.filter({
        user_email: cleanerEmail
      });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  if (loading || !profile) {
    return <div className="text-center py-8 font-verdana">Loading metrics...</div>;
  }

  const reliabilityDisplay = getReliabilityDisplay(profile.reliability_score || 75);
  const tierDisplay = getTierDisplay(profile.tier || 'Developing');

  const metrics = [
    { label: 'Attendance', value: profile.attendance_rate || 100, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Punctuality', value: profile.punctuality_rate || 100, icon: Clock, color: 'text-blue-600' },
    { label: 'Photo Proof', value: profile.photo_proof_rate || 100, icon: Camera, color: 'text-purple-600' },
    { label: 'Communication', value: profile.communication_rate || 85, icon: MessageSquare, color: 'text-indigo-600' }
  ];

  const negativeMetrics = [
    { label: 'Cancellation Rate', value: profile.cancellation_rate || 0, icon: XCircle },
    { label: 'No-Show Rate', value: profile.no_show_rate || 0, icon: XCircle },
    { label: 'Dispute Rate', value: profile.dispute_rate || 0, icon: XCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Explainers */}
      <ReliabilityScoreExplainer />
      <TierProgressExplainer 
        currentTier={profile.tier || 'Developing'}
        score={profile.reliability_score || 75}
        totalJobs={profile.total_jobs || 0}
      />

      {/* Overall Reliability Score */}
      <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="font-fredoka text-2xl">Reliability Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-5xl font-fredoka font-bold text-puretask-blue">
                {profile.reliability_score || 75}
              </div>
              <Badge className={`${reliabilityDisplay.bgColor} ${reliabilityDisplay.color} mt-2`}>
                {reliabilityDisplay.label}
              </Badge>
            </div>
            <Award className="w-20 h-20 text-puretask-blue opacity-30" />
          </div>
          <Progress value={profile.reliability_score || 75} className="h-3" />
        </CardContent>
      </Card>

      {/* Tier & Progress */}
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="font-fredoka text-xl flex items-center gap-2">
            <Target className="w-5 h-5" />
            Current Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{tierDisplay.icon}</div>
              <div>
                <div className="text-2xl font-fredoka font-bold text-graphite">
                  {profile.tier || 'Developing'}
                </div>
                <div className="text-sm text-gray-600 font-verdana">
                  {profile.total_jobs || 0} jobs completed
                </div>
              </div>
            </div>
          </div>

          {profile.tier_progress && profile.tier !== 'Elite' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm font-verdana text-gray-700 mb-2">
                Progress to next tier:
              </p>
              <div className="space-y-2">
                {profile.tier_progress.jobs_to_next_tier > 0 && (
                  <div className="text-sm font-verdana">
                    <span className="font-semibold">{profile.tier_progress.jobs_to_next_tier}</span> more jobs needed
                  </div>
                )}
                {profile.tier_progress.score_to_next_tier > 0 && (
                  <div className="text-sm font-verdana">
                    <span className="font-semibold">+{profile.tier_progress.score_to_next_tier}</span> reliability points needed
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="font-fredoka text-xl">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <span className="font-verdana text-gray-700">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metric.value} className="w-24 h-2" />
                <span className="font-fredoka font-semibold text-graphite min-w-[50px] text-right">
                  {metric.value.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Negative Metrics (Lower is Better) */}
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="font-fredoka text-xl">Quality Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {negativeMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <metric.icon className="w-5 h-5 text-gray-600" />
                <span className="font-verdana text-gray-700">{metric.label}</span>
              </div>
              <Badge variant={metric.value === 0 ? 'success' : 'secondary'}>
                {metric.value.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Streaks */}
      {(profile.current_streak_days > 0 || profile.best_streak_days > 0) && (
        <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="font-fredoka text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Success Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-verdana text-gray-700">Current Streak</span>
              <span className="text-2xl font-fredoka font-bold text-orange-600">
                {profile.current_streak_days || 0} days 🔥
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-verdana text-gray-700">Best Streak</span>
              <span className="text-xl font-fredoka font-semibold text-gray-700">
                {profile.best_streak_days || 0} days
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ratings */}
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="font-fredoka text-xl flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Client Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-fredoka font-bold text-graphite">
                {profile.average_rating?.toFixed(1) || '5.0'}
              </div>
              <div className="text-sm text-gray-600 font-verdana mt-1">
                {profile.total_reviews || 0} reviews
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= (profile.average_rating || 5) 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getReliabilityDisplay(reliabilityScore) {
  if (reliabilityScore >= 90) {
    return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  } else if (reliabilityScore >= 80) {
    return { label: 'Great', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  } else if (reliabilityScore >= 70) {
    return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  } else {
    return { label: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  }
}

function getTierDisplay(tier) {
  const displays = {
    'Elite': { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '👑' },
    'Pro': { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '⭐' },
    'Semi Pro': { color: 'text-green-600', bgColor: 'bg-green-100', icon: '✓' },
    'Developing': { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🌱' }
  };
  return displays[tier] || displays['Developing'];
}