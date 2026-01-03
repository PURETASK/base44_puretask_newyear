import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Award, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTierBadgeColor, getTierCardClasses, getTierLightColor, getTierSolidColor, getTierTextColor } from '../utils/tierColors';

export default function CleanerCard({ cleaner }) {
  const isNewCleaner = cleaner.total_jobs < 5;
  const baseRateCredits = cleaner.base_rate_credits_per_hour || cleaner.hourly_rate || 300;
  const baseRate = baseRateCredits / 10; // Credits to dollars
  const discountedRate = isNewCleaner ? baseRate * 0.85 : baseRate;
  const displayScore = cleaner.reliability_score || (isNewCleaner ? 30 : 75);

  const tierIcons = {
    'Elite': '👑',
    'Pro': '⭐',
    'Semi Pro': '💫',
    'Developing': '🌟'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`h-full hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden ${getTierCardClasses(cleaner.tier)} shadow-xl`}>
        {isNewCleaner && (
          <div className="bg-gradient-to-r from-fresh-mint to-green-500 text-white py-2 px-4 text-center">
            <p className="text-sm font-fredoka font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              New Cleaner - 15% Off First Booking!
            </p>
          </div>
        )}
        
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Badge className={`${getTierBadgeColor(cleaner.tier)} px-4 py-1.5 rounded-full font-fredoka font-bold shadow-md border`}>
              {tierIcons[cleaner.tier] || '🌟'} {cleaner.tier || 'Developing'}
            </Badge>
            {cleaner.instant_book_enabled && (
              <Badge className="bg-fresh-mint text-white px-3 py-1 rounded-full font-fredoka text-xs shadow-md">
                Instant Book
              </Badge>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white font-fredoka font-bold text-3xl shadow-lg flex-shrink-0`} style={{ backgroundColor: getTierSolidColor(cleaner.tier) }}>
              {cleaner.full_name?.[0] || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-fredoka font-bold text-graphite mb-2 line-clamp-1">
                {cleaner.full_name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-fredoka font-bold text-graphite">
                  {cleaner.average_rating?.toFixed(1) || '5.0'}
                </span>
                <span className="text-sm text-gray-500 font-verdana">
                  ({cleaner.total_reviews || 0})
                </span>
              </div>
              {cleaner.service_locations?.[0] && (
                <div className="flex items-center gap-1 text-sm text-gray-600 font-verdana">
                  <MapPin className="w-4 h-4 text-puretask-blue" />
                  <span className="line-clamp-1">{cleaner.service_locations[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reliability Score */}
          <div className="bg-soft-cloud rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-fredoka font-semibold text-graphite">Reliability Score</span>
              <span className={`text-3xl font-fredoka font-bold ${getTierTextColor(cleaner.tier)}`}>
                {displayScore}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${displayScore}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full bg-gradient-to-r ${getScoreColor(displayScore)}`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl p-3 text-center border-2`} style={{ backgroundColor: getTierLightColor(cleaner.tier), borderColor: getTierSolidColor(cleaner.tier) }}>
              <p className="text-xs text-gray-600 mb-1 font-verdana">Jobs Done</p>
              <p className={`text-2xl font-fredoka font-bold ${getTierTextColor(cleaner.tier)}`}>
                {cleaner.total_jobs || 0}
              </p>
            </div>
            <div className={`rounded-2xl p-3 text-center border-2`} style={{ backgroundColor: getTierLightColor(cleaner.tier), borderColor: getTierSolidColor(cleaner.tier) }}>
              <p className="text-xs text-gray-600 mb-1 font-verdana">On-Time</p>
              <p className={`text-2xl font-fredoka font-bold ${getTierTextColor(cleaner.tier)}`}>
                {cleaner.on_time_rate?.toFixed(0) || (isNewCleaner ? 50 : 100)}%
              </p>
            </div>
          </div>

          {/* Bio */}
          {cleaner.bio && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-verdana leading-relaxed">
              {cleaner.bio}
            </p>
          )}

          {/* Pricing */}
          <div className={`rounded-2xl p-4 mb-4 border-2`} style={{ backgroundColor: getTierLightColor(cleaner.tier), borderColor: getTierSolidColor(cleaner.tier) }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-verdana mb-1">Starting at</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-fredoka font-bold ${getTierTextColor(cleaner.tier)}`}>
                    ${discountedRate.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600 font-verdana">/hour</span>
                </div>
              </div>
              {isNewCleaner && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 line-through font-verdana">
                    ${baseRate.toFixed(2)}/hr
                  </p>
                  <Badge className="bg-fresh-mint text-white font-fredoka text-xs mt-1 shadow-md">
                    Save 15%
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Link to={createPageUrl(`CleanerProfile?cleaner=${cleaner.user_email}`)}>
            <Button className={`w-full text-white rounded-full font-fredoka font-bold shadow-lg hover:shadow-xl text-base py-6`} style={{ backgroundColor: getTierSolidColor(cleaner.tier) }}>
              View Profile & Book
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}