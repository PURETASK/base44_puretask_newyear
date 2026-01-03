import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Shield } from 'lucide-react';

export default function ReliabilityMeter({ score, size = 'large' }) {
  const getColor = (score) => {
    if (score >= 85) return { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-600', ring: 'ring-emerald-100' };
    if (score >= 70) return { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', ring: 'ring-blue-100' };
    return { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', ring: 'ring-amber-100' };
  };

  const getTier = (score) => {
    if (score >= 85) return { name: 'Elite', icon: Award };
    if (score >= 70) return { name: 'Pro', icon: TrendingUp };
    return { name: 'Basic', icon: Shield };
  };

  const colors = getColor(score);
  const tier = getTier(score);
  const TierIcon = tier.icon;

  const dimensions = size === 'large' ? 'w-32 h-32' : 'w-20 h-20';
  const textSize = size === 'large' ? 'text-3xl' : 'text-xl';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${dimensions}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
            strokeDashoffset={2 * Math.PI * 45 * (1 - score / 100)}
            className={`bg-gradient-to-r ${colors.bg}`}
            stroke="url(#gradient)"
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={score >= 85 ? "#10b981" : score >= 70 ? "#3b82f6" : "#f59e0b"} />
              <stop offset="100%" stopColor={score >= 85 ? "#059669" : score >= 70 ? "#2563eb" : "#d97706"} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className={`${textSize} font-bold ${colors.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>

      {size === 'large' && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${colors.ring} ring-2 bg-white`}>
          <TierIcon className={`w-4 h-4 ${colors.text}`} />
          <span className={`font-semibold text-sm ${colors.text}`}>{tier.name} Tier</span>
        </div>
      )}
    </div>
  );
}