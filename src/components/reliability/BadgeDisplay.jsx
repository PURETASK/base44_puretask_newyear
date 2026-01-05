import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Camera, Star, Heart, 
  Zap, CheckCircle, TrendingUp, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Badge Display - Section 4.5
 * Shows earned reliability badges and achievements
 */

// Badge definitions
const BADGE_TYPES = {
  always_on_time: {
    name: 'Always On Time',
    icon: Clock,
    description: '100% punctuality for 30+ days',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    requirement: 'GPS check-in within 15 mins for 30 consecutive days'
  },
  documented_pro: {
    name: 'Documented Pro',
    icon: Camera,
    description: 'Photo proof on every job',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    requirement: '3+ photos uploaded for last 50 jobs'
  },
  '30_day_streak': {
    name: '30-Day Streak',
    icon: Zap,
    description: 'Perfect attendance for a month',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    requirement: 'No cancellations or no-shows for 30 days'
  },
  great_communicator: {
    name: 'Great Communicator',
    icon: Star,
    description: 'Fast response time',
    color: 'bg-green-100 text-green-700 border-green-300',
    requirement: 'Average response time < 2 hours'
  },
  trusted_professional: {
    name: 'Trusted Professional',
    icon: Shield,
    description: 'Elite tier performance',
    color: 'bg-red-100 text-red-700 border-red-300',
    requirement: 'Maintain Elite tier (90+ score) for 60 days'
  },
  client_favorite: {
    name: 'Client Favorite',
    icon: Heart,
    description: 'High rebooking rate',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    requirement: '75%+ client rebooking rate'
  },
  rising_star: {
    name: 'Rising Star',
    icon: TrendingUp,
    description: 'Rapid improvement',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    requirement: '+20 point score increase in 30 days'
  },
  elite_performer: {
    name: 'Elite Performer',
    icon: Crown,
    description: 'Top 5% of all cleaners',
    color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-amber-400',
    requirement: '95+ reliability score'
  }
};

export default function BadgeDisplay({ badges = [], size = 'default', showTooltip = true }) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const badgeSize = size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badgeKey, index) => {
        const badge = BADGE_TYPES[badgeKey];
        if (!badge) return null;

        const Icon = badge.icon;

        return (
          <motion.div
            key={badgeKey}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
          >
            <Badge
              className={`${badge.color} border rounded-full font-fredoka font-semibold px-3 py-1 cursor-help`}
              title={showTooltip ? `${badge.name}: ${badge.description}` : undefined}
            >
              <Icon className={`${badgeSize} mr-1`} />
              {size !== 'small' && badge.name}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Badge Card - Detailed view of a single badge
 */
export function BadgeCard({ badgeKey, earned = false }) {
  const badge = BADGE_TYPES[badgeKey];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border-2 ${
        earned 
          ? `${badge.color} shadow-lg` 
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl ${earned ? 'bg-white/30' : 'bg-gray-200'}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-fredoka font-bold text-graphite">{badge.name}</h3>
            {earned && (
              <CheckCircle className="w-5 h-5 text-fresh-mint" />
            )}
          </div>
          <p className="text-sm text-gray-600 font-verdana mb-2">{badge.description}</p>
          <p className="text-xs text-gray-500 font-verdana italic">
            {badge.requirement}
          </p>
          {!earned && (
            <p className="text-xs text-gray-400 font-verdana mt-2">
              🔒 Keep up the great work to unlock!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Badge Gallery - Shows all available badges
 */
export function BadgeGallery({ earnedBadges = [] }) {
  const allBadges = Object.keys(BADGE_TYPES);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {allBadges.map(badgeKey => (
        <BadgeCard 
          key={badgeKey}
          badgeKey={badgeKey}
          earned={earnedBadges.includes(badgeKey)}
        />
      ))}
    </div>
  );
}

export { BADGE_TYPES };