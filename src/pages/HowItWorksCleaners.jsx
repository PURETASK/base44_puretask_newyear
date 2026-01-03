import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, TrendingUp, Users, Camera, DollarSign, CheckCircle,
  Award, Zap
} from 'lucide-react';

const CLEANER_STEPS = [
  {
    step: 1,
    icon: Shield,
    title: 'Get Verified (One-Time Setup)',
    description: 'Complete our simple verification process. This builds trust with clients and unlocks the platform.',
    features: [
      'Upload government-issued ID',
      'Pass background check (we handle it)',
      'Complete your profile with photo and bio',
      'Set your service areas and availability'
    ]
  },
  {
    step: 2,
    icon: DollarSign,
    title: 'Set Your Rates & Schedule',
    description: 'Control your pricing and availability. Work when you want at rates based on your tier.',
    features: [
      'Choose your base hourly rate (150-850 credits/hr)',
      'Set deep clean and move-out add-on rates ($3-8/hr)',
      'Update your weekly availability',
      'Turn instant-booking on or off'
    ]
  },
  {
    step: 3,
    icon: Users,
    title: 'Browse & Accept Jobs',
    description: 'View available jobs in your area. Accept bookings that fit your schedule and preferences.',
    features: [
      'See all job details before accepting',
      'Filter by location and date',
      'Choose your clients',
      'Set up recurring bookings with favorites'
    ]
  },
  {
    step: 4,
    icon: Camera,
    title: 'Complete Jobs with Photo Proof',
    description: 'GPS check-in when you arrive. Upload before/after photos. Complete work using your methods.',
    features: [
      'GPS verification at arrival and departure',
      'Upload before/after photos (required)',
      'Communicate with clients via messaging',
      'Track your time and tasks'
    ]
  },
  {
    step: 5,
    icon: TrendingUp,
    title: 'Get Paid & Build Your Reputation',
    description: 'Earn 80-85% of every booking. Get paid weekly or cash out instantly. Build your reliability score.',
    features: [
      'Weekly payouts (free)',
      'Instant payout option (5% fee, waived for milestones)',
      'Earn bonuses for performance milestones',
      'Increase your tier and rates with reliability score'
    ]
  }
];

const TIER_EARNINGS = [
  { tier: 'Developing', range: '$15-35/hr', score: '0-59', color: 'slate' },
  { tier: 'Semi Pro', range: '$35-45/hr', score: '60-74', color: 'blue' },
  { tier: 'Pro', range: '$45-60/hr', score: '75-89', color: 'purple', popular: true },
  { tier: 'Elite', range: '$60-85/hr', score: '90-100', color: 'emerald' }
];

export default function HowItWorksCleaners() {
  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* Hero */}
      <section className="bg-gradient-to-br from-fresh-mint to-emerald-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-white/20 text-white px-6 py-2 text-lg rounded-full font-fredoka">
            <Zap className="w-5 h-5 mr-2" />
            For Cleaners
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-fredoka font-bold mb-6">How PureTask Works for Cleaners</h1>
          <p className="text-xl font-verdana max-w-2xl mx-auto">
            Build your cleaning business with flexible hours, fair pay, and complete independence
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {CLEANER_STEPS.map((step, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="w-20 h-20 bg-fresh-mint rounded-2xl flex items-center justify-center text-white font-fredoka font-bold text-3xl shadow-lg flex-shrink-0">
                  {step.step}
                </div>
                <Card className="flex-1 border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <step.icon className="w-8 h-8 text-fresh-mint" />
                      <h3 className="text-2xl font-fredoka font-bold text-graphite">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg mb-4 font-verdana">{step.description}</p>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {step.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 font-verdana">
                          <CheckCircle className="w-5 h-5 text-fresh-mint" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to={createPageUrl('RoleSelection')}>
              <Button size="lg" className="bg-fresh-mint hover:bg-green-600 text-white text-lg px-10 py-6 rounded-full font-fredoka font-semibold shadow-xl">
                <Award className="w-5 h-5 mr-2" />
                Become a Cleaner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Earnings Potential */}
      <section className="py-20 bg-soft-cloud">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-fredoka font-bold text-graphite mb-4">Earnings Potential</h2>
            <p className="text-xl text-gray-600 font-verdana">Your income grows with your reliability score</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {TIER_EARNINGS.map((tier, idx) => (
              <Card key={idx} className={`border-2 ${tier.popular ? 'border-purple-500' : 'border-gray-200'} shadow-lg rounded-2xl`}>
                <CardContent className="p-6 text-center">
                  {tier.popular && (
                    <Badge className="mb-3 bg-purple-500 text-white font-fredoka">Most Common</Badge>
                  )}
                  <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">{tier.tier}</h3>
                  <p className="text-3xl font-fredoka font-bold text-fresh-mint mb-2">{tier.range}</p>
                  <Badge variant="outline" className="font-verdana">Score: {tier.score}</Badge>
                  <p className="text-xs text-gray-500 mt-3 font-verdana">Plus add-ons: +$3-8/hr</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}