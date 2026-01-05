import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home, Clock, Zap, CheckCircle, Camera, DollarSign, TrendingUp, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForAirbnbHosts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-rose-500 to-orange-600 text-white py-20">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Home className="w-5 h-5 mr-2" />
              For Airbnb & Short-Term Rental Hosts
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Turnover Cleaning,<br />Perfected
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-rose-50">
              Fast, reliable, photo-documented cleaning between guests. Keep your 5-star rating with verified cleaners.
            </p>
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl text-lg px-10 py-7">
                <Zap className="w-5 h-5 mr-2" />
                Book Turnover Cleaning
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Built for Hosts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              Built for the Demands of Airbnb Hosting
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              Your guests expect perfection. So do we.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: Clock,
                  title: 'Same-Day Turnovers',
                  description: 'Guest checking out at 11am, next one at 3pm? We will have your place spotless in between.',
                  color: 'rose'
                },
                {
                  icon: Camera,
                  title: 'Photo Proof',
                  description: 'Before/after photos sent instantly. Perfect for remote hosts managing multiple properties.',
                  color: 'blue'
                },
                {
                  icon: Shield,
                  title: 'Verified Cleaners',
                  description: 'Background-checked professionals who understand Airbnb standards and guest expectations.',
                  color: 'emerald'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Airbnb Host Problem */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              We Solve Your Biggest Hosting Headaches
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  problem: 'Tight Turnover Windows',
                  solution: 'Same-day booking with verified cleaners who specialize in quick turnarounds.',
                  icon: Clock
                },
                {
                  problem: 'Cannot Be On-Site',
                  solution: 'GPS check-in/out + photos mean you never have to be there to verify the work.',
                  icon: Camera
                },
                {
                  problem: 'Consistency Issues',
                  solution: 'Reliability Score shows you exactly which cleaners are punctual and thorough.',
                  icon: TrendingUp
                },
                {
                  problem: 'Last-Minute Cancellations',
                  solution: 'Backup cleaner system finds replacements automatically if your cleaner cancels.',
                  icon: Shield
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-red-600 font-semibold mb-1">Problem:</p>
                          <p className="font-bold text-slate-900 mb-2">{item.problem}</p>
                          <p className="text-sm text-emerald-600 font-semibold mb-1">Solution:</p>
                          <p className="text-slate-600 text-sm">{item.solution}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI for Hosts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              Protect Your 5-Star Rating
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              Cleanliness is the #1 factor in guest reviews
            </p>

            <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50">
              <CardContent className="p-10">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <p className="text-5xl font-bold text-rose-600 mb-2">93%</p>
                    <p className="text-slate-700">Of negative Airbnb reviews mention cleanliness</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-emerald-600 mb-2">$47</p>
                    <p className="text-slate-700">Average lost revenue per bad review</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-blue-600 mb-2">4.9★</p>
                    <p className="text-slate-700">Average cleanliness rating with PureTask</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-12 grid md:grid-cols-2 gap-6">
              {[
                'Photo proof protects against false complaints',
                'GPS tracking shows cleaners were actually there',
                'Reliability Score = consistent quality',
                'Automatic refunds if standards are not met'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing for Hosts */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Special Pricing for Multi-Property Hosts
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Managing 3+ properties? Get volume discounts and dedicated support.
            </p>
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white text-lg px-10 py-7 shadow-xl">
                <DollarSign className="w-5 h-5 mr-2" />
                See Pricing & Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-orange-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Never Worry About Turnover Cleaning Again
          </h2>
          <p className="text-xl text-rose-50 mb-10 max-w-2xl mx-auto">
            Book verified cleaners with photo proof and GPS tracking
          </p>
          <Link to={createPageUrl('RoleSelection')}>
            <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-50 shadow-xl text-lg px-10 py-7">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}