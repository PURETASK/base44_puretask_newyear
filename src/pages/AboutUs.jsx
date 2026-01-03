import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Shield, Users, TrendingUp, Heart, Target,
  CheckCircle, Star, Camera, MapPin, Award, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Heart className="w-5 h-5 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Cleaning Services,<br />
              <span className="text-emerald-100">Rebuilt on Trust</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-emerald-50">
              We started PureTask because finding a reliable cleaner shouldn't feel like a gamble. 
              Every homeowner deserves transparency, accountability, and peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Our Mission
              </h2>
              <p className="text-xl text-slate-600">
                Making home cleaning transparent, trustworthy, and stress-free
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Shield,
                  title: 'Trust First',
                  description: 'Every cleaner is background-checked, identity-verified, and rated by real clients.',
                  color: 'emerald'
                },
                {
                  icon: TrendingUp,
                  title: 'Transparency Always',
                  description: 'GPS tracking, photo proof, and reliability scores mean no surprises—ever.',
                  color: 'blue'
                },
                {
                  icon: Heart,
                  title: 'Fair for Everyone',
                  description: 'Cleaners earn more for great work. Clients get peace of mind. Win-win.',
                  color: 'purple'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg text-center">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-10">
                <blockquote className="text-2xl font-semibold text-slate-900 text-center italic leading-relaxed">
                  "We believe great cleaning shouldn't come with anxiety. 
                  When you know your cleaner is verified, tracked, and accountable—
                  you can finally relax."
                </blockquote>
                <p className="text-center text-slate-600 mt-6">— The PureTask Team</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 text-center">
              The Problem We're Solving
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              Traditional cleaning services leave too many questions unanswered
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-red-900 mb-4">❌ The Old Way</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li>• No way to verify if cleaners actually showed up</li>
                    <li>• Unclear what you're paying for</li>
                    <li>• No accountability or proof of work</li>
                    <li>• Ratings can be fake or manipulated</li>
                    <li>• You pay upfront and hope for the best</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200 bg-emerald-50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-emerald-900 mb-4">✅ The PureTask Way</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li>• GPS check-in/out proves arrival & completion</li>
                    <li>• Transparent pricing with no hidden fees</li>
                    <li>• Before/after photos document every job</li>
                    <li>• Reliability Score based on real performance</li>
                    <li>• Payment released only after work is verified</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-16 text-center">
              What Makes PureTask Different
            </h2>

            <div className="space-y-6">
              {[
                {
                  icon: Shield,
                  title: 'Real Verification, Not Just Checkboxes',
                  description: 'Full KYC + background checks + identity verification for every single cleaner. We don\'t cut corners on safety.',
                  stat: '100% of cleaners verified',
                  color: 'emerald'
                },
                {
                  icon: TrendingUp,
                  title: 'Dynamic Reliability Scoring',
                  description: 'Cleaners earn higher scores (and higher pay) by showing up on time, communicating well, and delivering quality. It\'s merit-based.',
                  stat: 'Updated after every job',
                  color: 'blue'
                },
                {
                  icon: Camera,
                  title: 'Photo Proof is Standard',
                  description: 'Before/after photos aren\'t optional—they\'re expected. You see exactly what you\'re paying for.',
                  stat: '95%+ photo compliance',
                  color: 'purple'
                },
                {
                  icon: MapPin,
                  title: 'GPS Accountability',
                  description: 'Know when your cleaner arrives and leaves. No more "did they actually show up?" anxiety.',
                  stat: 'Real-time tracking',
                  color: 'amber'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                          <p className="text-slate-600 leading-relaxed mb-3">{feature.description}</p>
                          <Badge className={`bg-${feature.color}-100 text-${feature.color}-800 border-${feature.color}-200`}>
                            {feature.stat}
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

      {/* Our Values */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 text-center">
              What We Stand For
            </h2>
            <p className="text-xl text-slate-600 text-center mb-16">
              These aren't just buzzwords—they guide every decision we make
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Target,
                  title: 'Radical Transparency',
                  points: [
                    'You see exactly what you\'re paying for',
                    'No hidden fees, ever',
                    'Full visibility into cleaner performance',
                    'Honest communication, even when things go wrong'
                  ]
                },
                {
                  icon: Award,
                  title: 'Meritocracy',
                  points: [
                    'Great cleaners earn more and get priority',
                    'Scores based on real performance, not seniority',
                    'Clients can filter by reliability',
                    'Excellence is rewarded automatically'
                  ]
                },
                {
                  icon: Users,
                  title: 'Fair Marketplace',
                  points: [
                    'Cleaners set their own rates',
                    'Independent contractors, not employees',
                    'Build your own cleaning business',
                    'Direct relationship between cleaner & client'
                  ]
                },
                {
                  icon: Heart,
                  title: 'Customer First',
                  points: [
                    'Automatic credits for no-shows',
                    'Dispute resolution within 24 hours',
                    'Real human support, not bots',
                    'Your satisfaction is our success'
                  ]
                }
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                          <value.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{value.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {value.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-16 text-center">
              PureTask by the Numbers
            </h2>

            <div className="grid md:grid-cols-4 gap-8 mb-16">
              {[
                { number: '500+', label: 'Verified Cleaners', icon: Users },
                { number: '10,000+', label: 'Cleanings Completed', icon: Sparkles },
                { number: '4.9★', label: 'Average Rating', icon: Star },
                { number: '95%+', label: 'Photo Compliance', icon: Camera }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-slate-900 mb-2">{stat.number}</p>
                  <p className="text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  What Our Customers Say
                </h3>
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  "I used to stress about whether my cleaner would show up. With PureTask's GPS tracking 
                  and photo proof, I finally have peace of mind. Game changer."
                </blockquote>
                <p className="text-slate-600">— Sarah M., Sacramento</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Commitments */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-16 text-center">
              Our Commitments to You
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: 'We Never Compromise on Safety',
                  description: 'Every cleaner goes through full background checks and identity verification. No exceptions.',
                  icon: Shield,
                  badge: 'Non-negotiable'
                },
                {
                  title: 'We Believe in Accountability',
                  description: 'GPS tracking and photo proof aren\'t extras—they\'re how we build trust at scale.',
                  icon: Camera,
                  badge: 'Always included'
                },
                {
                  title: 'We Support Independent Cleaners',
                  description: 'PureTask is a marketplace, not an agency. Cleaners control their schedules, rates, and business.',
                  icon: Zap,
                  badge: 'Fair & flexible'
                },
                {
                  title: 'We Stand Behind Every Booking',
                  description: 'Automatic credits for no-shows. Fast dispute resolution. Real human support when you need it.',
                  icon: Heart,
                  badge: 'Customer protection'
                }
              ].map((commitment, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <commitment.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{commitment.title}</h3>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              {commitment.badge}
                            </Badge>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{commitment.description}</p>
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

      {/* Join Us CTA */}
      <section className="py-24 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of homeowners who've discovered stress-free cleaning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BrowseCleaners')}>
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl text-lg px-10 py-7">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Browse Cleaners
                </Button>
              </Link>
              <Link to={createPageUrl('HowItWorks')}>
                <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white border-2 border-white shadow-xl text-lg px-10 py-7">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}