import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Clock, Shield, Zap, CheckCircle, Star,
  Calendar, TrendingUp, Coffee, Laptop
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForProfessionals() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Briefcase className="w-5 h-5 mr-2" />
              For Busy Professionals
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              More Time for What Matters
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-blue-50">
              You work hard. Let verified, reliable cleaners handle your home so you can focus on your career, family, and life.
            </p>
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-10 py-7">
                Book Your First Cleaning
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              We Get It—Your Time is Precious
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 border-slate-200">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">😓 Your Current Reality</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li>• Spending weekends cleaning instead of relaxing</li>
                    <li>• Wondering if your cleaner will actually show up</li>
                    <li>• No time to vet or interview cleaners yourself</li>
                    <li>• Stressed about leaving strangers in your home</li>
                    <li>• Can't track if the work was actually done</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-emerald-900 mb-4">✨ With PureTask</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Book in 3 minutes, from your phone or laptop</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>GPS notifications when cleaners arrive & leave</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Every cleaner is background-checked & verified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Photo proof so you know it's done right</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Automatic refunds if anything goes wrong</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Professionals */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Built for Your Busy Schedule
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: 'Same-Day Booking',
                  description: 'Need a clean home before guests arrive? Book verified cleaners for today.',
                  color: 'blue'
                },
                {
                  icon: Calendar,
                  title: 'Recurring Service',
                  description: 'Set it and forget it. Weekly or bi-weekly cleanings, same trusted cleaner.',
                  color: 'emerald'
                },
                {
                  icon: Laptop,
                  title: 'Manage from Anywhere',
                  description: 'Book, reschedule, or manage cleanings from your phone during your commute.',
                  color: 'purple'
                },
                {
                  icon: Shield,
                  title: 'No-Risk Guarantee',
                  description: 'Automatic credits for no-shows. Your payment is protected until work is verified.',
                  color: 'amber'
                },
                {
                  icon: Star,
                  title: 'Reliability Scoring',
                  description: 'Filter by top-rated cleaners. See exactly who shows up on time.',
                  color: 'pink'
                },
                {
                  icon: Coffee,
                  title: 'White-Glove Options',
                  description: 'Choose Elite-tier cleaners for premium service with pro-grade products.',
                  color: 'cyan'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-lg flex items-center justify-center mb-4 shadow-md`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
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
                  "As a consultant, I'm on the road constantly. PureTask's GPS tracking gives me peace of mind 
                  knowing my cleaner actually showed up and finished the job—even when I'm 3,000 miles away."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Michael Chen</p>
                    <p className="text-sm text-slate-500">Management Consultant, Sacramento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Reclaim Your Weekends
          </h2>
          <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto">
            Professional cleaning that works with your schedule, not against it
          </p>
          <Link to={createPageUrl('BrowseCleaners')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-10 py-7">
              <Zap className="w-5 h-5 mr-2" />
              Find Your Cleaner
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}