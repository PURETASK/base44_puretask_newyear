import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle, Shield, Zap, Info, Sparkles, Target
} from 'lucide-react';

export default function Pricing() {
  const [userType, setUserType] = useState('client');

  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* Hero */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-6xl font-fredoka font-bold mb-6 text-white">Transparent, Fair Pricing</h1>
          <p className="text-xl font-verdana max-w-2xl mx-auto mb-4 text-white">
            No hidden fees. Pay for quality service at rates you choose.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="text-center">
              <p className="text-4xl font-fredoka font-bold text-white">10 credits = $1</p>
              <p className="text-sm opacity-90 font-verdana mt-1 text-white">Simple conversion</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-fredoka font-bold text-white">15%</p>
              <p className="text-sm opacity-90 font-verdana mt-1 text-white">Platform fee</p>
            </div>
          </div>

          <Tabs value={userType} onValueChange={setUserType} className="max-w-md mx-auto mt-12">
            <TabsList className="grid w-full grid-cols-2 bg-white/20 rounded-full p-1">
              <TabsTrigger value="client" className="data-[state=active]:text-puretask-blue rounded-full font-fredoka font-semibold text-white" style={{ backgroundColor: userType === 'client' ? 'white' : 'transparent' }}>
                For Clients
              </TabsTrigger>
              <TabsTrigger value="cleaner" className="data-[state=active]:text-fresh-mint rounded-full font-fredoka font-semibold text-white" style={{ backgroundColor: userType === 'cleaner' ? 'white' : 'transparent' }}>
                For Cleaners
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Client Pricing */}
      {userType === 'client' && (
        <>
          <section className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-fredoka font-bold text-graphite mb-4">Choose Your Cleaner Tier</h2>
                <p className="text-xl text-gray-600 font-verdana">Higher reliability = Better service • All cleaners are verified</p>
              </div>

              {/* Tier Cards */}
              <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
                {[
                  {
                    tier: 'Developing',
                    score: '0-59',
                    creditsRange: '150-350',
                    usdRange: '$15-35',
                    color: 'slate',
                    description: 'Great for regular maintenance and budget-friendly options',
                    features: [
                      'ID verified & background checked',
                      'GPS tracking & photo proof',
                      'Standard cleaning supplies',
                      'Building their reputation',
                      'Often new to platform',
                      'Great value for basic cleans'
                    ]
                  },
                  {
                    tier: 'Semi Pro',
                    score: '60-74',
                    creditsRange: '350-450',
                    usdRange: '$35-45',
                    color: 'blue',
                    description: 'Consistent performers with proven track records',
                    features: [
                      'All Developing features',
                      'Proven reliability (60-74 score)',
                      'Quality cleaning products',
                      'Priority scheduling available',
                      'Specialty services offered',
                      'Detailed work and communication'
                    ]
                  },
                  {
                    tier: 'Pro',
                    score: '75-89',
                    creditsRange: '450-600',
                    usdRange: '$45-60',
                    color: 'purple',
                    popular: true,
                    description: 'Experienced professionals - our most popular tier',
                    features: [
                      'All Semi Pro features',
                      'High reliability score (75-89)',
                      'Professional/eco-friendly products',
                      'Same-day booking accepted',
                      'Guaranteed on-time arrival',
                      'Advanced cleaning techniques'
                    ]
                  },
                  {
                    tier: 'Elite',
                    score: '90-100',
                    creditsRange: '600-850',
                    usdRange: '$60-85',
                    color: 'emerald',
                    description: 'Top 10% of all cleaners - exceptional service',
                    features: [
                      'All Pro features',
                      'Elite reliability (90-100)',
                      'Premium professional products',
                      'White-glove service',
                      'Highest priority scheduling',
                      'Expert certifications & training'
                    ]
                  }
                ].map((plan, idx) => (
                  <Card key={idx} className={`relative border-2 hover:shadow-2xl transition-all rounded-2xl ${
                    plan.popular ? 'border-purple-500 shadow-xl' : 'border-gray-200'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 font-fredoka rounded-full shadow-lg">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-6 pt-8">
                      <Badge className={`mb-4 bg-${plan.color}-100 text-${plan.color}-700 w-fit mx-auto px-4 py-2 text-base rounded-full font-fredoka`}>
                        <Target className="w-4 h-4 mr-2" />
                        {plan.tier} Tier
                      </Badge>
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 font-verdana mb-1">Reliability Score: {plan.score}</p>
                        <p className="text-4xl font-fredoka font-bold text-graphite mb-1">{plan.creditsRange}</p>
                        <p className="text-sm text-gray-500 font-verdana">credits/hour</p>
                      </div>
                      <p className="text-lg text-puretask-blue font-fredoka font-bold">≈ {plan.usdRange}/hour</p>
                      <p className="text-gray-600 mt-4 font-verdana text-sm leading-relaxed px-2">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-fresh-mint flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 font-verdana text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to={createPageUrl('BrowseCleaners')}>
                        <Button className={`w-full rounded-full font-fredoka font-semibold ${
                          plan.popular
                            ? 'brand-gradient text-white'
                            : 'border-2 border-puretask-blue text-puretask-blue hover:bg-blue-50'
                        }`}>
                          Browse {plan.tier} Cleaners
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add-Ons */}
              <div className="max-w-4xl mx-auto mt-16">
                <h3 className="text-3xl font-fredoka font-bold text-graphite mb-8 text-center">Service Add-Ons</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-lg rounded-2xl bg-white">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🏠</span>
                      </div>
                      <h4 className="font-fredoka font-bold text-graphite text-lg mb-2">Basic Cleaning</h4>
                      <p className="text-sm text-gray-600 font-verdana mb-4">Standard maintenance and tidying</p>
                      <Badge className="bg-blue-500 text-white font-fredoka">Base Rate Only</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-500 shadow-xl rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-fredoka font-bold text-graphite text-lg mb-2">Deep Clean</h4>
                      <p className="text-sm text-gray-600 font-verdana mb-4">Baseboards, fans, inside appliances</p>
                      <Badge className="bg-purple-500 text-white font-fredoka text-base">+30-80 credits/hr</Badge>
                      <p className="text-xs text-gray-600 mt-2 font-verdana">≈ +$3-8/hour</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-emerald-500 shadow-xl rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📦</span>
                      </div>
                      <h4 className="font-fredoka font-bold text-graphite text-lg mb-2">Move-Out/In</h4>
                      <p className="text-sm text-gray-600 font-verdana mb-4">Complete vacant property deep clean</p>
                      <Badge className="bg-emerald-500 text-white font-fredoka text-base">+30-80 credits/hr</Badge>
                      <p className="text-xs text-gray-600 mt-2 font-verdana">≈ +$3-8/hour</p>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="mt-8 border-blue-200 bg-blue-50 rounded-2xl">
                  <Info className="w-4 h-4 text-puretask-blue" />
                  <AlertDescription className="text-blue-900 font-verdana">
                    <strong>Add-on Pricing:</strong> Each cleaner sets their own add-on rate within the $3-8/hour range based on their experience and the extra work involved. Deep cleans and move-outs take significantly more time and effort than basic cleaning.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Platform Fee */}
              <div className="max-w-3xl mx-auto mt-16">
                <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <Shield className="w-8 h-8 text-puretask-blue mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-fredoka font-bold text-graphite text-xl mb-3">Platform Fee: 15%</h4>
                        <p className="text-gray-700 leading-relaxed font-verdana mb-4">
                          Our 15% platform fee covers the costs and features that make PureTask the safest, most transparent cleaning marketplace:
                        </p>
                        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                          {[
                            'Identity & background verification',
                            'GPS tracking & geolocation',
                            'Before/after photo storage',
                            'Secure escrow payment system',
                            '24/7 customer support',
                            'Dispute resolution services',
                            'Platform maintenance & development',
                            'Trust & safety monitoring'
                          ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 font-verdana">
                              <CheckCircle className="w-4 h-4 text-fresh-mint flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Example Pricing */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-fredoka font-bold text-graphite mb-4">Example Pricing</h2>
                <p className="text-xl text-gray-600 font-verdana">See how it all works out</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-center font-fredoka">Basic Clean Example</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">Semi Pro cleaner</span>
                        <span className="font-bold font-fredoka">400 credits/hr</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">3 hours × 400</span>
                        <span className="font-bold font-fredoka">1,200 credits</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-3 mt-3">
                        <span className="font-bold text-graphite font-fredoka">Total Cost</span>
                        <span className="text-2xl font-bold text-fresh-mint font-fredoka">$120</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2 font-verdana">You pay $120 • Cleaner earns $102 • Platform: $18</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-500 shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-center font-fredoka">Deep Clean Example</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">Pro cleaner base</span>
                        <span className="font-bold font-fredoka">500 credits/hr</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">Deep clean add-on</span>
                        <span className="font-bold font-fredoka">+50 credits/hr</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">4 hours × 550</span>
                        <span className="font-bold font-fredoka">2,200 credits</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-purple-50 rounded-lg px-3 mt-3">
                        <span className="font-bold text-graphite font-fredoka">Total Cost</span>
                        <span className="text-2xl font-bold text-purple-600 font-fredoka">$220</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2 font-verdana">You pay $220 • Cleaner earns $187 • Platform: $33</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-500 shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <CardTitle className="text-center font-fredoka">Move-Out Example</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">Elite cleaner base</span>
                        <span className="font-bold font-fredoka">700 credits/hr</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">Move-out add-on</span>
                        <span className="font-bold font-fredoka">+60 credits/hr</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-verdana">5 hours × 760</span>
                        <span className="font-bold font-fredoka">3,800 credits</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-3 mt-3">
                        <span className="font-bold text-graphite font-fredoka">Total Cost</span>
                        <span className="text-2xl font-bold text-fresh-mint font-fredoka">$380</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2 font-verdana">You pay $380 • Cleaner earns $323 • Platform: $57</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Cleaner Earnings */}
      {userType === 'cleaner' && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-fredoka font-bold text-graphite mb-4">Your Earning Potential</h2>
              <p className="text-xl text-gray-600 font-verdana">Keep 80-85% of every booking • Set your own rates</p>
            </div>

            {/* Tier Earnings */}
            <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
              {[
                { tier: 'Developing', baseRange: '150-350', earnRange: '$12-28/hr', score: '0-59', payout: '80%' },
                { tier: 'Semi Pro', baseRange: '350-450', earnRange: '$28-36/hr', score: '60-74', payout: '80%' },
                { tier: 'Pro', baseRange: '450-600', earnRange: '$36-48/hr', score: '75-89', payout: '80%', popular: true },
                { tier: 'Elite', baseRange: '600-850', earnRange: '$51-72/hr', score: '90-100', payout: '85%' }
              ].map((tier, idx) => (
                <Card key={idx} className={`border-2 ${tier.popular ? 'border-fresh-mint shadow-xl' : 'border-green-200'} rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50`}>
                  <CardContent className="p-6 text-center">
                    {tier.popular && (
                      <Badge className="mb-3 text-white font-fredoka" style={{ backgroundColor: '#28C76F' }}>Most Cleaners</Badge>
                    )}
                    <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">{tier.tier}</h3>
                    <Badge variant="outline" className="mb-4 font-verdana border-green-300">Score: {tier.score}</Badge>
                    <div className="my-4">
                      <p className="text-sm text-gray-600 font-verdana mb-1">You charge:</p>
                      <p className="text-2xl font-fredoka font-bold text-fresh-mint">{tier.baseRange}</p>
                      <p className="text-xs text-gray-500 font-verdana">credits/hour</p>
                    </div>
                    <div className="py-4 bg-white rounded-xl border-2 border-green-200">
                      <p className="text-sm text-gray-600 font-verdana mb-1">You earn ({tier.payout}):</p>
                      <p className="text-3xl font-fredoka font-bold text-fresh-mint">{tier.earnRange}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 font-verdana">Plus add-ons: +$2.40-6.40/hr</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payout Options */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-fredoka font-bold text-graphite mb-8 text-center">Payout Options</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-green-300 shadow-lg rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="font-fredoka text-fresh-mint">Weekly Payouts (Free)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {[
                        'Automatic weekly deposits',
                        'No fees - 100% of earnings',
                        'Direct deposit to your bank',
                        'Processing time: 2-3 business days'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 font-verdana">
                          <CheckCircle className="w-5 h-5 text-fresh-mint" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-xl rounded-2xl" style={{ borderColor: '#28C76F' }}>
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <CardTitle className="font-fredoka text-fresh-mint">Instant Payout (5% fee)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {[
                        'Cash out anytime',
                        '5% convenience fee',
                        'Money in your account within hours',
                        'FREE for milestone achievements!'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 font-verdana">
                          <CheckCircle className="w-5 h-5 text-fresh-mint" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-fredoka font-bold mb-6 text-white">
            {userType === 'client' ? 'Ready to Book?' : 'Ready to Start Earning?'}
          </h2>
          <p className="text-xl font-verdana mb-10 max-w-2xl mx-auto text-white">
            {userType === 'client'
              ? 'Find your perfect cleaner and book in minutes'
              : 'Join hundreds of cleaners earning on their own terms'}
          </p>
          <Link to={createPageUrl(userType === 'client' ? 'BrowseCleaners' : 'RoleSelection')}>
            <Button size="lg" className="bg-white hover:bg-blue-50 rounded-full shadow-xl text-lg px-10 py-7 font-fredoka font-semibold" style={{ color: '#66B3FF' }}>
              <Zap className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}