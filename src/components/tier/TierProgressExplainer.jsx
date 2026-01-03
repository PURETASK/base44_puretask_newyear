import React, { useState } from 'react';
import { Trophy, Star, TrendingUp, ChevronDown, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

export default function TierProgressExplainer({ currentTier, score, totalJobs }) {
  const [expanded, setExpanded] = useState(false);

  const tiers = [
    {
      name: 'Developing',
      icon: '🌱',
      requirements: { jobs: 0, score: 0 },
      benefits: ['Basic platform access', 'Standard visibility']
    },
    {
      name: 'Semi Pro',
      icon: '✓',
      requirements: { jobs: 5, score: 70 },
      benefits: ['Profile badge', '+5% in search', 'Priority support']
    },
    {
      name: 'Pro',
      icon: '⭐',
      requirements: { jobs: 20, score: 80 },
      benefits: ['Pro badge', '+10% in search', 'Featured listings', 'Early job access']
    },
    {
      name: 'Elite',
      icon: '👑',
      requirements: { jobs: 50, score: 90 },
      benefits: ['Elite badge', 'Top search priority', 'Premium support', '5% higher rates', 'Exclusive jobs']
    }
  ];

  const currentIndex = tiers.findIndex(t => t.name === currentTier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  const jobsProgress = nextTier ? Math.min((totalJobs / nextTier.requirements.jobs) * 100, 100) : 100;
  const scoreProgress = nextTier ? Math.min((score / nextTier.requirements.score) * 100, 100) : 100;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Tier System
          </CardTitle>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-4">
              {/* Current Progress to Next Tier */}
              {nextTier && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-300">
                  <h4 className="font-fredoka font-bold text-purple-900 mb-3">
                    Progress to {nextTier.name}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-verdana text-gray-700">Completed Jobs</span>
                        <span className="font-fredoka font-semibold">
                          {totalJobs} / {nextTier.requirements.jobs}
                        </span>
                      </div>
                      <Progress value={jobsProgress} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-verdana text-gray-700">Reliability Score</span>
                        <span className="font-fredoka font-semibold">
                          {score} / {nextTier.requirements.score}
                        </span>
                      </div>
                      <Progress value={scoreProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              )}

              {/* All Tiers */}
              <div className="space-y-3">
                {tiers.map((tier, idx) => {
                  const isCurrentTier = tier.name === currentTier;
                  const isPastTier = idx < currentIndex;
                  const isFutureTier = idx > currentIndex;

                  return (
                    <div
                      key={tier.name}
                      className={`rounded-xl p-4 border-2 transition-all ${
                        isCurrentTier 
                          ? 'border-purple-500 bg-purple-50 shadow-lg' 
                          : isPastTier
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{tier.icon}</span>
                          <div>
                            <h5 className="font-fredoka font-bold text-gray-800">{tier.name}</h5>
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-verdana">
                              <span>{tier.requirements.jobs} jobs</span>
                              <span>•</span>
                              <span>{tier.requirements.score}+ score</span>
                            </div>
                          </div>
                        </div>
                        {isCurrentTier && (
                          <Badge className="bg-purple-600 text-white font-fredoka">Current</Badge>
                        )}
                        {isPastTier && (
                          <Badge className="bg-green-600 text-white font-fredoka">✓ Unlocked</Badge>
                        )}
                        {isFutureTier && (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        {tier.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2 text-xs text-gray-700 font-verdana">
                            <Star className="w-3 h-3 text-purple-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-800 font-verdana">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                <strong>Tip:</strong> Higher tiers get more job requests and can charge premium rates!
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}