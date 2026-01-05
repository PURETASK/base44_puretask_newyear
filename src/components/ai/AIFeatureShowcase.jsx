import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, MessageSquare, Calendar, TrendingUp, 
  CheckCircle, Star, Clock, DollarSign, Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIFeatureShowcase({ onContinue }) {
  const [activeTab, setActiveTab] = useState('communication');

  const exampleScenarios = {
    communication: {
      icon: MessageSquare,
      title: 'Automated Client Messages',
      demo: {
        before: 'You manually send: "Hi! Confirmed for tomorrow at 2pm"',
        after: 'AI sends: "Hi Sarah! Your cleaning is confirmed for January 15th at 2:00 PM. I\'ll bring eco-friendly products as requested. Looking forward to making your home sparkle! - Maria"',
        impact: 'Professional, personalized, sent instantly'
      },
      features: [
        '7 message types: confirmations, reminders, summaries, reviews',
        'Custom templates with your personal touch',
        'Multi-channel: SMS, Email, In-App',
        'Timing controls: when to send each message'
      ]
    },
    scheduling: {
      icon: Calendar,
      title: 'Smart Schedule Optimization',
      demo: {
        before: 'You have: 9am-11am job, then 4pm-6pm job (5-hour gap)',
        after: 'AI suggests: "Perfect 1pm-3pm booking available - fills your gap, same neighborhood, +$120"',
        impact: '+30% more efficient schedule'
      },
      features: [
        'Detects schedule gaps automatically',
        'Suggests bookings that maximize earnings',
        'Analyzes travel time between jobs',
        'Learns your preferred days/times'
      ]
    },
    matching: {
      icon: Users,
      title: 'Intelligent Job Matching',
      demo: {
        before: 'Generic bookings: any client, any location',
        after: 'AI prioritizes: "Pet-friendly client nearby, eco products preferred, matches your specialties, 95% compatibility"',
        impact: 'Better client fit = better reviews'
      },
      features: [
        'Matches based on your specialties',
        'Considers location & travel time',
        'Learns from your past acceptances',
        'Flags high-risk clients automatically'
      ]
    },
    insights: {
      icon: TrendingUp,
      title: 'Performance Insights',
      demo: {
        before: 'You wonder: "How can I reach Pro tier?"',
        after: 'AI shows: "You\'re 3.2 points away. Upload photos for next 2 jobs (+2 pts) and arrive on-time (+1.5 pts)"',
        impact: 'Clear path to higher earnings'
      },
      features: [
        'Real-time reliability score tracking',
        'Personalized improvement recommendations',
        'Earnings forecasts and goal tracking',
        'To-do list based on your priorities'
      ]
    }
  };

  const current = exampleScenarios[activeTab];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="communication" className="font-fredoka">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="font-fredoka">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="matching" className="font-fredoka">
            <Users className="w-4 h-4 mr-2" />
            Matching
          </TabsTrigger>
          <TabsTrigger value="insights" className="font-fredoka">
            <TrendingUp className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="font-fredoka flex items-center gap-2">
                  <Icon className="w-6 h-6" />
                  {current.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Before/After Demo */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <Badge className="mb-3 bg-red-500 text-white">Without AI</Badge>
                    <p className="text-sm font-verdana text-gray-700">{current.demo.before}</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <Badge className="mb-3 bg-green-500 text-white">With AI</Badge>
                    <p className="text-sm font-verdana text-gray-700">{current.demo.after}</p>
                  </div>
                </div>

                {/* Impact */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <p className="font-fredoka font-bold text-blue-900">{current.demo.impact}</p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="font-fredoka font-semibold text-graphite mb-3">Key Features:</p>
                  <ul className="space-y-2">
                    {current.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-verdana">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border-2 border-purple-200 rounded-xl p-4 text-center">
          <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-fredoka font-bold text-graphite">+30%</p>
          <p className="text-xs text-gray-600 font-verdana">Avg. Earnings Increase</p>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-xl p-4 text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-fredoka font-bold text-graphite">5 hrs/wk</p>
          <p className="text-xs text-gray-600 font-verdana">Time Saved</p>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-xl p-4 text-center">
          <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-fredoka font-bold text-graphite">4.8★</p>
          <p className="text-xs text-gray-600 font-verdana">Avg. User Rating</p>
        </div>
      </div>

      <Button onClick={onContinue} className="w-full brand-gradient text-white font-fredoka font-bold" size="lg">
        Continue to Setup →
      </Button>
    </div>
  );
}