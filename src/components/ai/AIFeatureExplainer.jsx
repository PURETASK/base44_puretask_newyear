import React, { useState } from 'react';
import { Sparkles, ChevronDown, Bot, MessageSquare, Calendar, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIFeatureExplainer({ userType = 'cleaner' }) {
  const [expanded, setExpanded] = useState(false);

  const cleanerFeatures = [
    {
      icon: MessageSquare,
      title: 'Auto-Responses',
      description: 'AI sends professional messages to clients on your behalf',
      examples: ['Booking confirmations', 'On my way notifications', 'Post-cleaning summaries']
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI suggests optimal booking slots to fill your calendar',
      examples: ['Gap-filling suggestions', 'High-acceptance time slots', 'Route optimization']
    },
    {
      icon: Target,
      title: 'Client Matching',
      description: 'AI connects you with compatible clients',
      examples: ['Location-based matching', 'Specialty alignment', 'Schedule compatibility']
    },
    {
      icon: Zap,
      title: 'Performance Insights',
      description: 'AI analyzes your metrics and suggests improvements',
      examples: ['Reliability tips', 'Pricing recommendations', 'Best times to work']
    }
  ];

  const clientFeatures = [
    {
      icon: Target,
      title: 'Personalized Matching',
      description: 'AI finds cleaners perfect for your needs',
      examples: ['Location proximity', 'Specialty matching', 'Availability sync']
    },
    {
      icon: Calendar,
      title: 'Smart Booking',
      description: 'AI suggests optimal times and services',
      examples: ['Best available slots', 'Service recommendations', 'Price optimization']
    },
    {
      icon: MessageSquare,
      title: 'Auto-Communication',
      description: 'AI handles routine booking communications',
      examples: ['Reminders', 'Status updates', 'Review prompts']
    }
  ];

  const features = userType === 'cleaner' ? cleanerFeatures : clientFeatures;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Features
          </CardTitle>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl p-4 border-2 border-purple-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-fredoka font-bold text-gray-800 mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600 font-verdana">{feature.description}</p>
                      </div>
                      <Badge className="bg-purple-600 text-white font-fredoka text-xs">AI</Badge>
                    </div>
                    
                    <div className="ml-11 space-y-1">
                      {feature.examples.map((example, eIdx) => (
                        <div key={eIdx} className="flex items-center gap-2 text-xs text-gray-600 font-verdana">
                          <div className="w-1 h-1 rounded-full bg-purple-400" />
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-xs text-green-800 font-verdana">
                <Bot className="w-4 h-4 inline mr-1" />
                <strong>Always in Control:</strong> You can customize or disable any AI feature in your settings anytime.
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}