import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MembershipUpgrade({ currentTier = 'Standard', onUpgrade }) {
  const tiers = [
    {
      name: 'Plus',
      price: 9.99,
      icon: <Star className="w-8 h-8 text-amber-500" />,
      color: 'amber',
      benefits: [
        '10% off all bookings',
        'Priority booking access',
        'Free cancellations',
        'Dedicated customer support',
        'Monthly cleaning reminders'
      ]
    },
    {
      name: 'Platinum',
      price: 19.99,
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      color: 'purple',
      popular: true,
      benefits: [
        'Everything in Plus, plus:',
        '15% off all bookings',
        'PureTask Protect included',
        'Same-day booking priority',
        'Concierge service',
        'VIP support line'
      ]
    }
  ];

  if (currentTier !== 'Standard') return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Upgrade Your Experience</h2>
        <p className="text-slate-600">Save more, book easier, get VIP treatment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className={`relative border-2 ${
              tier.popular 
                ? 'border-purple-300 shadow-2xl' 
                : 'border-slate-200'
            }`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className={`bg-gradient-to-br from-${tier.color}-50 to-${tier.color}-100`}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {tier.icon}
                      PureTask {tier.name}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-900">${tier.price}</p>
                    <p className="text-sm text-slate-600">/month</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className={`w-5 h-5 text-${tier.color}-600 mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onUpgrade(tier.name)}
                  className={`w-full ${
                    tier.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  }`}
                  size="lg"
                >
                  Upgrade to {tier.name}
                </Button>

                {tier.popular && (
                  <p className="text-xs text-center text-slate-500 mt-3">
                    Save up to $600/year with Platinum
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Cancel anytime. No long-term contracts. Money-back guarantee.
        </p>
      </div>
    </div>
  );
}