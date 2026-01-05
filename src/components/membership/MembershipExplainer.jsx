import React, { useState } from 'react';
import { Crown, ChevronDown, Star, CheckCircle2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function MembershipExplainer() {
  const [expanded, setExpanded] = useState(false);

  const tiers = [
    {
      name: 'Standard',
      price: 0,
      discount: 0,
      benefits: ['Standard pricing', 'Basic support', 'All cleaners available']
    },
    {
      name: 'Plus',
      price: 29,
      discount: 10,
      benefits: ['10% off all bookings', 'Priority support', 'Free cancellations', 'Loyalty points boost']
    },
    {
      name: 'Platinum',
      price: 79,
      discount: 20,
      benefits: ['20% off all bookings', 'VIP support', 'Unlimited free cancellations', '2x loyalty points', 'Exclusive cleaners', 'Insurance included']
    }
  ];

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Membership Plans
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
              <p className="text-sm font-verdana text-gray-700 mb-4">
                Save money on every booking with a monthly membership. The more you clean, the more you save!
              </p>

              {/* Tier Comparison */}
              <div className="space-y-3">
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.name}
                    className={`bg-white rounded-xl p-4 border-2 ${
                      tier.name === 'Plus' ? 'border-blue-400' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-fredoka font-bold text-gray-800 text-lg flex items-center gap-2">
                          {tier.name}
                          {tier.name === 'Plus' && (
                            <Badge className="bg-blue-600 text-white font-fredoka">Popular</Badge>
                          )}
                        </h4>
                        {tier.discount > 0 && (
                          <p className="text-sm text-green-600 font-fredoka font-semibold mt-1">
                            Save {tier.discount}% on every booking
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-fredoka font-bold text-gray-800">
                          ${tier.price}
                        </p>
                        <p className="text-xs text-gray-500 font-verdana">per month</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {tier.benefits.map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="font-verdana text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Savings Calculator */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Example Savings
                </h4>
                <div className="space-y-2 text-sm font-verdana">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-gray-700">2 cleanings/month @ $100 each:</span>
                    <span className="font-fredoka font-bold">$200</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded-lg">
                    <span className="text-gray-700">Plus membership ($29):</span>
                    <span className="font-fredoka font-bold text-green-600">Save $20/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded-lg">
                    <span className="text-gray-700">Platinum membership ($79):</span>
                    <span className="font-fredoka font-bold text-green-600">Save $40/mo</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-800 font-verdana">
                <Star className="w-4 h-4 inline mr-1" />
                <strong>Pro Tip:</strong> If you clean twice a month or more, a membership pays for itself!
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}