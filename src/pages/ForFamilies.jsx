import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Shield, Users, Baby, CheckCircle, Star,
  Home, Sparkles, Award, Clock, AlertTriangle, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForFamilies() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Heart className="w-5 h-5 mr-2" />
              For Families with Kids
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Safe, Trusted Cleaners<br />
              Your Family Can Count On
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-pink-50">
              Background-checked cleaners who understand families with kids, pets, and the need for child-safe products.
            </p>
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 shadow-xl text-lg px-10 py-7">
                Find a Family-Friendly Cleaner
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Safety for Families */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              Safety First, Always
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              When kids are involved, there is no room for shortcuts
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Verified & Background Checked',
                  description: 'Every cleaner passes comprehensive background checks and identity verification. We take safety seriously because you do.',
                  badge: 'Required'
                },
                {
                  icon: Baby,
                  title: 'Child-Safe Products',
                  description: 'Filter for cleaners who use non-toxic, child-safe cleaning products. No harsh chemicals around your kids.',
                  badge: 'Pet & kid friendly'
                },
                {
                  icon: Star,
                  title: 'Family-Reviewed',
                  description: 'See reviews specifically from other families. Know which cleaners are patient, careful, and kid-friendly.',
                  badge: 'Real feedback'
                },
                {
                  icon: Home,
                  title: 'Track Everything',
                  description: 'GPS check-in/out and photo proof mean you always know who is in your home and what they are doing.',
                  badge: 'Full visibility'
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
                        <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                          </div>
                          <p className="text-slate-600 leading-relaxed mb-3">{feature.description}</p>
                          <Badge className="bg-pink-100 text-pink-800">
                            {feature.badge}
                          </Badge>
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

      {/* Special Features for Families */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">
              Features Families Love
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: AlertTriangle,
                  title: 'Allergy-Conscious Cleaning',
                  description: 'Specify allergies and product sensitivities. Our cleaners come prepared with safe alternatives.'
                },
                {
                  icon: Users,
                  title: 'Same Cleaner Every Time',
                  description: 'Kids feel comfortable with familiar faces. Book the same trusted cleaner for recurring service.'
                },
                {
                  icon: Clock,
                  title: 'Flexible Scheduling',
                  description: 'Book during school hours, weekends, or whenever works for your family routine.'
                },
                {
                  icon: Home,
                  title: 'Kid & Pet-Friendly Options',
                  description: 'Filter for cleaners experienced with children and pets. They get it.'
                },
                {
                  icon: Calendar,
                  title: 'Recurring Discounts',
                  description: 'Save 20% with weekly or bi-weekly subscriptions. One less thing to remember.'
                },
                {
                  icon: Award,
                  title: 'Quality Guarantee',
                  description: 'Not satisfied? We will send someone to re-clean for free or issue automatic credits.'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                          <p className="text-sm text-slate-600">{feature.description}</p>
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
                  "With two kids under 5, keeping the house clean felt impossible. Now Maria comes every Tuesday 
                  while the kids are at daycare. The photo updates are amazing—I can see it is done even when I am at work."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    E
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Emily Rodriguez</p>
                    <p className="text-sm text-slate-500">Working Mom, Sacramento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Questions from Parents
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I request cleaners with child-safe products?',
                  a: 'Absolutely. Use the "Child-Safe Products" filter when browsing cleaners. You can also note specific allergies or sensitivities.'
                },
                {
                  q: 'What if my kids are home during the cleaning?',
                  a: 'Many cleaners are comfortable working with kids present. Check their profile for "Senior-Friendly" and "Child-Safe" badges.'
                },
                {
                  q: 'Do I need to be home?',
                  a: 'Nope! GPS check-in/out and photo proof mean you can verify everything remotely. Many working parents book during school hours.'
                },
                {
                  q: 'What if my cleaner cancels last-minute?',
                  a: 'Our backup system automatically finds a replacement. You will get notified immediately with options.'
                }
              ].map((item, idx) => (
                <Card key={idx} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-2">{item.q}</h3>
                    <p className="text-slate-600">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Give Your Family the Gift of a Clean Home
          </h2>
          <p className="text-xl text-pink-50 mb-10 max-w-2xl mx-auto">
            Verified, safe cleaners who understand families
          </p>
          <Link to={createPageUrl('BrowseCleaners')}>
            <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 shadow-xl text-lg px-10 py-7">
              <Sparkles className="w-5 h-5 mr-2" />
              Book Your First Cleaning
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}