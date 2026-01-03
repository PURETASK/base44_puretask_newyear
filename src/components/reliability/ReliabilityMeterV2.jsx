import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Award, Star, CheckCircle, Clock, Camera, 
  MessageSquare, AlertTriangle, XCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Reliability Meter V2 - Section 4.3
 * Displays reliability score with tier badge and component breakdown
 */
export default function ReliabilityMeterV2({ 
  score, 
  tier, 
  components, 
  showDetails = false,
  compact = false 
}) {
  // Tier colors
  const tierColors = {
    'Developing': { bg: 'bg-gray-100', text: 'text-gray-700', gradient: 'from-gray-400 to-gray-500' },
    'Semi Pro': { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-cyan-500' },
    'Pro': { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-pink-500' },
    'Elite': { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-500' }
  };

  const tierColor = tierColors[tier] || tierColors['Developing'];

  // Score color based on value
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-amber-600';
    if (score >= 75) return 'text-purple-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-gray-600';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${getScoreColor(score)}`} />
          <span className={`text-2xl font-fredoka font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
        <Badge className={`${tierColor.bg} ${tierColor.text} rounded-full font-fredoka font-semibold`}>
          {tier}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${tierColor.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            <span className="font-fredoka font-bold text-lg">Reliability Score</span>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 rounded-full font-fredoka">
            {tier}
          </Badge>
        </div>

        <div className="flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative"
          >
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 351.86" }}
                animate={{ strokeDasharray: `${(score / 100) * 351.86} 351.86` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-fredoka font-bold">{score}</span>
            </div>
          </motion.div>

          <div className="flex-1">
            <p className="text-white/90 font-verdana mb-2">
              {score >= 90 ? '🏆 Elite Performance!' :
               score >= 75 ? '⭐ Professional Standard' :
               score >= 60 ? '📈 Building Reputation' :
               '💪 Growing & Learning'}
            </p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {showDetails && components && (
        <CardContent className="p-6">
          <div className="space-y-3">
            <ComponentBar
              label="Attendance"
              value={components.attendance}
              icon={CheckCircle}
              maxPoints={25}
            />
            <ComponentBar
              label="Punctuality"
              value={components.punctuality}
              icon={Clock}
              maxPoints={20}
            />
            <ComponentBar
              label="Photo Proof"
              value={components.photo_proof}
              icon={Camera}
              maxPoints={15}
            />
            <ComponentBar
              label="Communication"
              value={components.communication}
              icon={MessageSquare}
              maxPoints={10}
            />
            <ComponentBar
              label="Completion"
              value={components.completion_confirmation}
              icon={CheckCircle}
              maxPoints={10}
            />
            <ComponentBar
              label="Avg Rating"
              value={components.average_rating}
              icon={Star}
              maxPoints={10}
            />
            
            {components.cancellation_penalty < 0 && (
              <PenaltyBar
                label="Cancellation Penalty"
                value={components.cancellation_penalty}
                icon={XCircle}
              />
            )}
            {components.no_show_penalty < 0 && (
              <PenaltyBar
                label="No-Show Penalty"
                value={components.no_show_penalty}
                icon={AlertTriangle}
              />
            )}
            {components.dispute_penalty < 0 && (
              <PenaltyBar
                label="Dispute Penalty"
                value={components.dispute_penalty}
                icon={AlertTriangle}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

const ComponentBar = ({ label, value, icon: Icon, maxPoints }) => {
  const percentage = Math.min(100, value);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="font-verdana text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-verdana font-semibold text-graphite">{value}%</span>
          <span className="text-xs text-gray-500 font-verdana">({maxPoints}pts)</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            value >= 90 ? 'bg-fresh-mint' :
            value >= 75 ? 'bg-blue-500' :
            value >= 60 ? 'bg-amber-500' :
            'bg-gray-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const PenaltyBar = ({ label, value, icon: Icon }) => {
  const absValue = Math.abs(value);
  
  return (
    <div className="space-y-1 p-3 bg-red-50 rounded-2xl border border-red-200">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-red-500" />
          <span className="font-verdana text-red-700">{label}</span>
        </div>
        <span className="font-verdana font-semibold text-red-600">-{absValue} pts</span>
      </div>
    </div>
  );
};