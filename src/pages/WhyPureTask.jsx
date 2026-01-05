import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield, TrendingUp, Camera, MapPin, Star, Users,
  CheckCircle, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyPureTask() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Why Choose PureTask?
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-indigo-50">
              The only cleaning platform built on trust, transparency, and real accountability
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Differentiators */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              What Makes Us Different
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              Most platforms say they're trustworthy. We prove it.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Full Verification',
                  description: 'KYC + background checks + ID verification for every cleaner',
                  stat: '100%',
                  color: 'emerald'
                },
                {
                  icon: MapPin,
                  title: 'GPS Tracking',
                  description: 'Real-time check-in/out proves arrival and completion times',
                  stat: 'Every job',
                  color: 'blue'
                },
                {
                  icon: Camera,
                  title: 'Photo Proof',
                  description: 'Before/after photos document the work—no guessing',
                  stat: '95%+ compliance',
                  color: 'purple'
                },
                {
                  icon: TrendingUp,
                  title: 'Merit-Based Scoring',
                  description: 'Reliability Score based on real performance, not manipulated reviews',
                  stat: 'Live updates',
                  color: 'amber'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg text-center">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
                      <Badge variant="outline" className="font-semibold">
                        {feature.stat}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">
              PureTask vs Traditional Services
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-slate-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">❌ Traditional Platforms</h3>
                  <ul className="space-y-4">
                    {[
                      'Ratings can be fake or bought',
                      'No proof cleaners actually showed up',
                      'No accountability for quality',
                      'Pay upfront and hope for the best',
                      'No way to verify background checks',
                      'Limited recourse if something goes wrong'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-emerald-900 mb-6">✅ PureTask Platform</h3>
                  <ul className="space-y-4">
                    {[
                      'Reliability Score based on real performance data',
                      'GPS check-in/out for every job',
                      'Before/after photo proof',
                      'Payment released only after work verified',
                      'Full background check & ID verification',
                      'Automatic credits + fast dispute resolution'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">
              Trusted by Thousands
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: Users, number: '500+', label: 'Verified Cleaners' },
                { icon: Sparkles, number: '10k+', label: 'Cleanings Completed' },
                { icon: Star, number: '4.9★', label: 'Average Rating' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-5xl font-bold text-slate-900 mb-2">{stat.number}</p>
                  <p className="text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: 'GPS tracking gives me complete peace of mind.',
                  name: 'Sarah M.',
                  role: 'Sacramento'
                },
                {
                  quote: 'The reliability score makes choosing so much easier.',
                  name: 'David L.',
                  role: 'Elk Grove'
                },
                {
                  quote: 'Photo proof means I never have to wonder if it was done right.',
                  name: 'Jennifer K.',
                  role: 'Roseville'
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                    <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Experience the PureTask Difference
          </h2>
          <p className="text-xl text-indigo-50 mb-10 max-w-2xl mx-auto">
            Join thousands who've discovered stress-free, transparent cleaning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl text-lg px-10 py-7">
                Browse Cleaners
              </Button>
            </Link>
            <Link to={createPageUrl('HowItWorks')}>
              <Button size="lg" className="bg-indigo-700 hover:bg-indigo-800 text-white border-2 border-white shadow-xl text-lg px-10 py-7">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}