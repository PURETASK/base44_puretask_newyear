import React, { useState } from 'react';
import { Gift, Star, Trophy, ChevronDown, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoyaltyExplainer() {
  const [expanded, setExpanded] = useState(false);

  const tiers = [
    {
      name: 'Bronze',
      threshold: 0,
      color: 'bg-orange-700',
      benefits: ['Earn 1 point per $1', 'Birthday bonus', 'Member support']
    },
    {
      name: 'Silver',
      threshold: 500,
      color: 'bg-gray-400',
      benefits: ['Earn 1.5 points per $1', '10% off rewards', 'Priority booking']
    },
    {
      name: 'Gold',
      threshold: 1500,
      color: 'bg-yellow-500',
      benefits: ['Earn 2 points per $1', '15% off rewards', 'Free add-ons', 'Early access']
    },
    {
      name: 'Platinum',
      threshold: 3000,
      color: 'bg-purple-600',
      benefits: ['Earn 3 points per $1', '20% off rewards', 'Premium perks', 'Exclusive deals']
    }
  ];

  const rewards = [
    { name: '10% Discount', points: 100, value: '$10+' },
    { name: '15% Discount', points: 200, value: '$15+' },
    { name: '20% Discount', points: 300, value: '$20+' },
    { name: 'Free Add-On Service', points: 250, value: '$15+' },
    { name: 'Priority Booking', points: 150, value: 'Skip the line' }
  ];

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-600" />
            Loyalty Rewards Program
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
              {/* How to Earn */}
              <div className="bg-white rounded-xl p-4 border-2 border-yellow-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  How to Earn Points
                </h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span>Every dollar spent:</span>
                    <span className="font-fredoka font-bold text-yellow-700">+1-3 points</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span>Leave a review:</span>
                    <span className="font-fredoka font-bold text-yellow-700">+10 points</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span>Refer a friend:</span>
                    <span className="font-fredoka font-bold text-yellow-700">+50 points</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span>Complete 5 bookings:</span>
                    <span className="font-fredoka font-bold text-yellow-700">+100 points</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Tiers */}
              <div className="space-y-2">
                <h4 className="font-fredoka font-bold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Loyalty Tiers
                </h4>
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.name}
                    className="bg-white rounded-lg p-3 border-2 border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${tier.color} rounded-lg flex items-center justify-center`}>
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-fredoka font-bold text-gray-800">{tier.name}</span>
                      </div>
                      <Badge className="bg-gray-100 text-gray-700 border-0 font-verdana">
                        {tier.threshold}+ points
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-10">
                      {tier.benefits.map((benefit, bIdx) => (
                        <Badge key={bIdx} variant="outline" className="text-xs font-verdana">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards Catalog */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Popular Rewards
                </h4>
                <div className="space-y-2">
                  {rewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200"
                    >
                      <span className="text-sm font-verdana text-gray-700">{reward.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-verdana">{reward.value}</span>
                        <Badge className="bg-green-600 text-white font-fredoka">
                          {reward.points} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-800 font-verdana">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                <strong>Pro Tip:</strong> Combine with membership for maximum savings - earn points + get member discounts!
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}