import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionPlans({ cleanerProfile, bookingDetails, onSelectPlan }) {
  if (!cleanerProfile || !bookingDetails) return null;

  const oneTimePrice = bookingDetails.hours * cleanerProfile.hourly_rate;
  
  const plans = [
    {
      type: 'weekly',
      name: 'Weekly Plan',
      icon: '🌟',
      frequency: '4 cleanings/month',
      monthlyPrice: oneTimePrice * 4 * 0.80,
      perCleaningPrice: oneTimePrice * 0.80,
      savings: oneTimePrice * 4 * 0.20,
      savingsPercent: 20,
      popular: true,
      features: [
        '20% discount on every cleaning',
        'Same cleaner, same time every week',
        'Priority scheduling',
        'Pause or cancel anytime',
        'Free rescheduling'
      ]
    },
    {
      type: 'biweekly',
      name: 'Bi-Weekly Plan',
      icon: '⭐',
      frequency: '2 cleanings/month',
      monthlyPrice: oneTimePrice * 2 * 0.80,
      perCleaningPrice: oneTimePrice * 0.80,
      savings: oneTimePrice * 2 * 0.20,
      savingsPercent: 20,
      popular: false,
      features: [
        '20% discount on every cleaning',
        'Consistent bi-weekly schedule',
        'Priority scheduling',
        'Pause or cancel anytime',
        'Free rescheduling'
      ]
    },
    {
      type: 'monthly',
      name: 'Monthly Plan',
      icon: '💎',
      frequency: '1 cleaning/month',
      monthlyPrice: oneTimePrice * 0.80,
      perCleaningPrice: oneTimePrice * 0.80,
      savings: oneTimePrice * 0.20,
      savingsPercent: 20,
      popular: false,
      features: [
        '20% discount',
        'Flexible monthly scheduling',
        'Pause or cancel anytime',
        'Free rescheduling'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-slate-900 mb-2">
          Save 20% with a Subscription
        </h3>
        <p className="text-lg text-slate-600">
          Lock in your favorite cleaner and save on every booking
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={`border-2 transition-all hover:shadow-2xl h-full flex flex-col ${
                plan.popular
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 transform scale-105'
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-center py-2 font-bold text-sm">
                  ⭐ MOST POPULAR
                </div>
              )}
              <CardHeader>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{plan.icon}</div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">{plan.frequency}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-black text-emerald-600">
                      ${plan.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="text-slate-600 font-semibold">/month</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    ${plan.perCleaningPrice.toFixed(2)} per cleaning
                  </p>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-4 py-1">
                    Save ${plan.savings.toFixed(2)}/month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full text-lg py-6 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg'
                      : 'bg-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* One-Time Comparison */}
      <div className="p-6 bg-slate-100 rounded-xl border-2 border-slate-200 text-center">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          <strong>Prefer one-time bookings?</strong>
        </p>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-3xl font-bold text-slate-900">
            ${oneTimePrice.toFixed(2)}
          </span>
          <span className="text-sm text-slate-600">per booking (no discount)</span>
        </div>
        <Button
          variant="outline"
          onClick={() => onSelectPlan(null)}
          className="border-2 border-slate-300 hover:bg-slate-50"
        >
          Continue with One-Time Booking
        </Button>
      </div>
    </div>
  );
}