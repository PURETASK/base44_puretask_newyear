import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Calendar, Target, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIAssistantGuide({ onStartSetup }) {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'Smart Communication',
      description: 'Automated booking confirmations, reminders, and follow-ups sent on your behalf',
      impact: '+45% client satisfaction',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calendar,
      title: 'Schedule Optimization',
      description: 'AI analyzes your calendar to suggest gap-filling bookings and optimal times',
      impact: '+30% earnings potential',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'Get matched with clients based on your specialties, location, and preferences',
      impact: '+25% booking acceptance',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Personalized Insights',
      description: 'Real-time recommendations for improving your reliability score and tier',
      impact: 'Faster tier progression',
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="inline-block mb-4"
        >
          <Sparkles className="w-16 h-16 text-blue-500" />
        </motion.div>
        <h1 className="text-4xl font-fredoka font-bold text-graphite mb-3">
          Meet Your AI Assistant
        </h1>
        <p className="text-lg text-gray-600 font-verdana max-w-2xl mx-auto">
          Your personal business partner that works 24/7 to help you get more bookings, 
          optimize your schedule, and build stronger client relationships.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-2 hover:shadow-lg transition-all h-full">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-verdana mb-3">
                    {feature.description}
                  </p>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    {feature.impact}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* How It Works */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            How Your AI Assistant Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: 'Setup Your Preferences',
                desc: 'Choose which messages to automate, set your scheduling preferences, and add your specialties'
              },
              {
                step: 2,
                title: 'AI Learns Your Style',
                desc: 'As you accept/decline bookings, the AI learns what jobs you prefer and optimizes suggestions'
              },
              {
                step: 3,
                title: 'Get Smart Recommendations',
                desc: 'Receive personalized booking suggestions, schedule optimizations, and automated client communications'
              },
              {
                step: 4,
                title: 'Track Your Growth',
                desc: 'View AI-driven insights on your dashboard showing earnings impact and performance improvements'
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-fredoka font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-fredoka font-semibold text-graphite">{item.title}</p>
                  <p className="text-sm text-gray-600 font-verdana">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onStartSetup}
              className="flex-1 brand-gradient text-white font-fredoka font-bold"
              size="lg"
            >
              Start Setup
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('CleanerDashboard'))}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Privacy */}
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="font-fredoka font-bold text-graphite mb-2">Your Control, Your Choice</h3>
        <p className="text-sm text-gray-700 font-verdana leading-relaxed">
          You have full control over the AI Assistant. Turn features on/off anytime, customize message templates, 
          and review all suggestions before they're sent. The AI works FOR you, not instead of you.
        </p>
      </div>
    </div>
  );
}