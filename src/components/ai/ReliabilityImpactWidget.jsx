import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, TrendingUp, CheckCircle2 } from 'lucide-react';
import ReliabilityMeterV2 from '../reliability/ReliabilityMeterV2';

export default function ReliabilityImpactWidget({ cleanerProfile }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeAIFeatures = [
    {
      setting: 'Pre-cleaning reminders',
      enabled: cleanerProfile?.communication_settings?.pre_cleaning_reminder?.enabled,
      metric: 'Punctuality Rate',
      impact: '+10%'
    },
    {
      setting: 'Photo proof required',
      enabled: cleanerProfile?.photo_proof_rate > 80,
      metric: 'Photo Compliance',
      impact: '+5 points'
    },
    {
      setting: 'AI Scheduling enabled',
      enabled: cleanerProfile?.communication_settings?.ai_scheduling_enabled,
      metric: 'Gap Optimization',
      impact: 'Active'
    },
    {
      setting: 'Review requests',
      enabled: cleanerProfile?.communication_settings?.review_request?.enabled,
      metric: 'Rating Growth',
      impact: '+15%'
    }
  ];

  const tierProgress = cleanerProfile?.tier_progress || {};
  const progressPercent = tierProgress.jobs_to_next_tier 
    ? ((tierProgress.current_jobs / (tierProgress.current_jobs + tierProgress.jobs_to_next_tier)) * 100)
    : 0;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-puretask-blue" />
            <CardTitle className="font-fredoka text-lg">Performance Impact</CardTitle>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Compact Reliability Display */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
          <div>
            <p className="text-sm text-gray-600 font-verdana">Current Score</p>
            <p className="text-2xl font-fredoka font-bold text-graphite">
              {cleanerProfile?.reliability_score || 75}/100
            </p>
            <Badge className={`mt-1 ${
              cleanerProfile?.tier === 'Elite' ? 'tier-elite-gradient text-white' :
              cleanerProfile?.tier === 'Pro' ? 'tier-pro-gradient text-white' :
              cleanerProfile?.tier === 'Semi Pro' ? 'tier-semipro-gradient text-white' :
              'tier-developing-gradient text-white'
            }`}>
              {cleanerProfile?.tier || 'Semi Pro'}
            </Badge>
          </div>
          <div className="w-20 h-20">
            <ReliabilityMeterV2 cleanerProfile={cleanerProfile} compact />
          </div>
        </div>

        {/* Tier Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-fredoka text-gray-700">Progress to Next Tier</span>
            <span className="font-verdana text-gray-600">
              {tierProgress.jobs_to_next_tier || 0} jobs remaining
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Active AI Features Impact */}
        {isExpanded && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-fredoka font-semibold text-gray-700">AI Features Boosting Your Performance:</p>
            {activeAIFeatures.map((feature, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  feature.enabled ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feature.enabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={`text-sm font-verdana ${feature.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                    {feature.setting}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 font-verdana">{feature.metric}</p>
                  {feature.enabled && (
                    <p className="text-xs font-fredoka font-semibold text-green-700">{feature.impact}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}