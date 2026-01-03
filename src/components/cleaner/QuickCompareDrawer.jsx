import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Star, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickCompareDrawer({ pinnedCleaners, onRemove, onClear }) {
  const navigate = useNavigate();

  if (pinnedCleaners.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-puretask-blue shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-fredoka font-bold text-graphite">
                Compare Cleaners ({pinnedCleaners.length}/3)
              </h3>
              <p className="text-sm text-gray-600 font-verdana">
                Pin up to 3 cleaners to compare
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClear}
              className="text-red-600 hover:bg-red-50 rounded-full"
            >
              <X className="w-5 h-5 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {pinnedCleaners.map((cleaner) => (
              <Card key={cleaner.id} className="border-2 border-puretask-blue rounded-2xl relative">
                <button
                  onClick={() => onRemove(cleaner.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-fredoka font-bold">
                      {cleaner.full_name?.[0] || 'C'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-fredoka font-bold text-graphite truncate">
                        {cleaner.full_name}
                      </h4>
                      <p className="text-xs text-gray-600 font-verdana">{cleaner.tier}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-600 font-verdana">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        Rating
                      </span>
                      <span className="font-fredoka font-semibold">
                        {cleaner.average_rating?.toFixed(1) || '5.0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-600 font-verdana">
                        <TrendingUp className="w-4 h-4 text-fresh-mint" />
                        Reliability
                      </span>
                      <span className="font-fredoka font-semibold">
                        {cleaner.reliability_score || 75}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-600 font-verdana">
                        <DollarSign className="w-4 h-4 text-puretask-blue" />
                        Base Rate
                      </span>
                      <span className="font-fredoka font-semibold text-puretask-blue">
                        {Math.round((cleaner.base_rate_credits_per_hour || 300) / 10)} cr/hr
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(createPageUrl(`CleanerProfile?email=${cleaner.user_email}`))}
                    className="w-full rounded-full font-fredoka font-semibold text-sm brand-gradient text-white"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}