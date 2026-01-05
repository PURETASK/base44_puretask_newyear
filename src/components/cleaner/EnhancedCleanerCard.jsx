import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EnhancedCleanerCard({ cleaner, onPin, isPinned }) {
  const baseRateCredits = cleaner.base_rate_credits_per_hour || cleaner.hourly_rate || 25;
  const baseRate = baseRateCredits; // 1 credit = $1 USD
  const displayScore = cleaner.reliability_score || 75;

  const tierGradientClass = {
    'Elite': 'bg-gradient-to-r from-purple-600 to-purple-700',
    'Pro': 'bg-gradient-to-r from-blue-600 to-blue-700',
    'Semi Pro': 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    'Developing': 'bg-gradient-to-r from-slate-600 to-slate-700'
  }[cleaner.tier] || 'bg-gradient-to-r from-slate-600 to-slate-700';

  const tierLightBgClass = {
    'Elite': 'bg-purple-50',
    'Pro': 'bg-blue-50',
    'Semi Pro': 'bg-emerald-50',
    'Developing': 'bg-slate-50'
  }[cleaner.tier] || 'bg-slate-50';

  const tierBorderClass = {
    'Elite': 'border-purple-300',
    'Pro': 'border-blue-300',
    'Semi Pro': 'border-emerald-300',
    'Developing': 'border-slate-300'
  }[cleaner.tier] || 'border-slate-300';

  const tierTextClass = {
    'Elite': 'text-purple-700',
    'Pro': 'text-blue-700',
    'Semi Pro': 'text-emerald-700',
    'Developing': 'text-slate-700'
  }[cleaner.tier] || 'text-slate-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Card className={`h-full hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden bg-white border ${tierBorderClass}`}>
        <CardContent className="p-4">
          {/* Tier Badge */}
          <div className="flex justify-center mb-3">
            <div className={`px-3 py-1 rounded-full ${tierGradientClass} text-white text-xs font-fredoka font-bold shadow-sm`}>
              {cleaner.tier || 'Developing'}
            </div>
          </div>

          {/* Name & Initial */}
          <div className="text-center mb-3">
            <div className={`w-14 h-14 mx-auto rounded-full ${tierGradientClass} flex items-center justify-center text-white font-fredoka font-bold text-xl shadow-sm mb-2`}>
              {cleaner.full_name?.[0] || 'C'}
            </div>
            <h3 className="font-fredoka font-bold text-sm text-slate-900 line-clamp-1">
              {cleaner.full_name || 'Cleaner'}
            </h3>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className={`${tierLightBgClass} rounded-lg p-2 text-center`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-sm font-fredoka font-bold text-slate-900">
                  {cleaner.average_rating?.toFixed(1) || '5.0'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-verdana">{cleaner.total_reviews || 0} reviews</p>
            </div>
            <div className={`${tierLightBgClass} rounded-lg p-2 text-center`}>
              <p className="text-sm font-fredoka font-bold text-slate-900 mb-1">{displayScore}</p>
              <p className="text-xs text-slate-600 font-verdana">Score</p>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-3">
            <p className="text-xs text-slate-600 font-verdana mb-0.5">Starting at</p>
            <p className={`text-xl font-fredoka font-bold ${tierTextClass}`}>
              ${baseRate.toFixed(0)}
              <span className="text-sm text-slate-600 font-normal">/hr</span>
            </p>
          </div>

          {/* View Profile Button */}
          <Link to={createPageUrl(`CleanerProfile?email=${cleaner.user_email}`)}>
            <Button className={`w-full ${tierGradientClass} text-white rounded-lg font-verdana font-semibold text-xs py-2 hover:opacity-90 shadow-sm`}>
              View Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}