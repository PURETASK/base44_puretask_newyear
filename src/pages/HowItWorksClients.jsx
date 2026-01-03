import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Calendar, DollarSign, MapPin, Star, CheckCircle, Shield,
  Camera, Clock, MessageSquare, Award, TrendingUp, Users
} from 'lucide-react';

export default function HowItWorksClients() {
  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* Hero */}
      <section className="brand-gradient text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-white/20 text-white px-6 py-2 text-lg rounded-full font-fredoka">
            <Users className="w-5 h-5 mr-2" />
            For Clients
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-fredoka font-bold mb-6">How PureTask Works for Clients</h1>
          <p className="text-xl font-verdana max-w-2xl mx-auto">
            Book verified cleaners in minutes with complete transparency and peace of mind
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: 1,
                icon: Search,
                title: 'Browse & Filter Verified Cleaners',
                description: 'Search our marketplace of background-checked, verified cleaning professionals. Use advanced filters to find the perfect match.',
                features: [
                  'Filter by reliability score, pricing, and location',
                  'View detailed profiles with photos and reviews',
                  'Check real-time availability',
                  'See before/after photo galleries from previous jobs'
                ]
              },
              {
                step: 2,
                icon: Calendar,
                title: 'Select Date, Time & Custom Tasks',
                description: 'Choose your preferred date and time. Select exactly what you want cleaned from our comprehensive task list.',
                features: [
                  'Pick from basic, deep, or move-out cleaning',
                  'Customize with specific room-by-room tasks',
                  'See transparent pricing before you book',
                  'Add special instructions or allergy information'
                ]
              },
              {
                step: 3,
                icon: DollarSign,
                title: 'Secure Credit-Based Payment',
                description: 'Pay with our credit system (10 credits = $1). Your payment is held in escrow - you only pay for actual time worked.',
                features: [
                  'Buy credits in advance or pay per booking',
                  'Payment held safely until job completion',
                  'Automatic refund if job takes less time',
                  'No hidden fees - 15% platform fee included'
                ]
              },
              {
                step: 4,
                icon: MapPin,
                title: 'GPS Tracking & Live Updates',
                description: 'Get real-time notifications when your cleaner checks in with GPS verification. See before/after photos as they work.',
                features: [
                  'GPS check-in confirms cleaner arrival',
                  'Live photo updates during cleaning',
                  'Direct messaging with your cleaner',
                  'Track progress in real-time'
                ]
              },
              {
                step: 5,
                icon: Star,
                title: 'Approve & Pay Only When Satisfied',
                description: 'Review the completed work and uploaded photos. Your payment is only released after you approve the job.',
                features: [
                  'Review before/after photos',
                  'Approve work to release payment',
                  'Rate your cleaner',
                  'Dispute resolution if needed'
                ]
              }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="w-20 h-20 brand-gradient rounded-2xl flex items-center justify-center text-white font-fredoka font-bold text-3xl shadow-lg flex-shrink-0">
                  {step.step}
                </div>
                <Card className="flex-1 border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <step.icon className="w-8 h-8 text-puretask-blue" />
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
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="brand-gradient text-white text-lg px-10 py-6 rounded-full font-fredoka font-semibold shadow-xl">
                <Search className="w-5 h-5 mr-2" />
                Browse Cleaners Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-soft-cloud">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-fredoka font-bold text-graphite mb-4">Trust & Safety Features</h2>
            <p className="text-xl text-gray-600 font-verdana">Multiple layers of protection for every booking</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: 'ID Verified', description: 'Government ID check with liveness detection' },
              { icon: CheckCircle, title: 'Background Checked', description: 'Comprehensive criminal screening' },
              { icon: MapPin, title: 'GPS Tracking', description: 'Check-in/out location verification' },
              { icon: Camera, title: 'Photo Proof', description: 'Before/after documentation required' }
            ].map((item, idx) => (
              <Card key={idx} className="border-0 shadow-lg text-center rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 brand-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">{item.title}</h3>
                  <p className="text-gray-600 font-verdana">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}