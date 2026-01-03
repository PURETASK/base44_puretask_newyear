import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Shield, Phone, Users, CheckCircle, Star,
  Home, Calendar, Award, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForRetirees() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white py-20">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Heart className="w-5 h-5 mr-2" />
              For Seniors & Retirees
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Enjoy Your Home,<br />We'll Handle the Rest
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-purple-50">
              Safe, reliable cleaning service with the accountability and transparency you deserve. 
              Because peace of mind should not be a luxury.
            </p>
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl text-lg px-10 py-7">
                Find a Trusted Cleaner
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Safety First */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              Your Safety is Our Priority
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              We know trust is earned, not given. That's why we go above and beyond.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Background Checked',
                  description: 'Every single cleaner undergoes a comprehensive background check and identity verification before they can accept jobs.',
                  badge: '100% verified'
                },
                {
                  icon: Award,
                  title: 'Reliability Scoring',
                  description: 'See exactly how each cleaner performs—on-time arrivals, quality ratings, and customer feedback all in one score.',
                  badge: 'Transparent ratings'
                },
                {
                  icon: Phone,
                  title: 'Real-Time Updates',
                  description: 'Get text notifications when your cleaner checks in and out. Know exactly when they arrive and leave.',
                  badge: 'GPS tracking'
                },
                {
                  icon: Home,
                  title: 'Photo Documentation',
                  description: 'Before and after photos show you the work was completed to your standards—no need to be home.',
                  badge: 'Visual proof'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                            <Badge className="bg-purple-100 text-purple-800">
                              {feature.badge}
                            </Badge>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{feature.description}</p>
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

      {/* Easy to Use */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              Simple, Clear, No Confusion
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              We designed PureTask to be as easy as possible
            </p>

            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: 'Browse Verified Cleaners',
                  description: 'See photos, read reviews, and check reliability scores. All cleaners are background-checked and rated by real customers.',
                  icon: Users
                },
                {
                  step: 2,
                  title: 'Pick Your Date & Time',
                  description: 'Choose what works for your schedule. One-time deep cleans or recurring weekly service—you decide.',
                  icon: Calendar
                },
                {
                  step: 3,
                  title: 'Relax & Get Updates',
                  description: 'We will text you when your cleaner is on the way, arrives, and finishes. You do not even need to be home.',
                  icon: Phone
                },
                {
                  step: 4,
                  title: 'See the Results',
                  description: 'Review before and after photos. If you are happy, that is it. If not, we will make it right—automatically.',
                  icon: Star
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                    {step.step}
                  </div>
                  <Card className="flex-1 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon className="w-6 h-6 text-purple-600" />
                        <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-12">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-2xl font-semibold text-slate-900 mb-6 leading-relaxed">
                  "At 72, I cannot clean like I used to. PureTask makes it so easy—I get a text when Maria arrives, 
                  and she always sends photos when she is done. I feel safe and cared for."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    B
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Barbara Johnson</p>
                    <p className="text-sm text-slate-500">Roseville, CA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Special Benefits */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Why Seniors Love PureTask
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Same cleaner every time (if you want)',
                'No apps or confusing tech required',
                'Speak to real people for support',
                'Payment only after work is complete',
                'Family members can book for you',
                'Discounts for recurring service',
                'Senior-friendly cleaners available',
                'Flexible cancellation policy'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready for a Spotless Home?
          </h2>
          <p className="text-xl text-purple-50 mb-10 max-w-2xl mx-auto">
            Join hundreds of seniors who trust PureTask for safe, reliable cleaning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl text-lg px-10 py-7">
                <Sparkles className="w-5 h-5 mr-2" />
                Browse Cleaners
              </Button>
            </Link>
            <Link to={createPageUrl('Support')}>
              <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-white border-2 border-white shadow-xl text-lg px-10 py-7">
                <Phone className="w-5 h-5 mr-2" />
                Talk to a Person
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}