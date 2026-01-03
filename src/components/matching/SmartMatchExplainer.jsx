import React, { useState } from 'react';
import { Sparkles, ChevronDown, Target, MapPin, Clock, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartMatchExplainer() {
  const [expanded, setExpanded] = useState(false);

  const matchFactors = [
    {
      icon: MapPin,
      label: 'Location & Distance',
      weight: '25%',
      description: 'Nearby cleaners for faster service'
    },
    {
      icon: Clock,
      label: 'Availability Match',
      weight: '20%',
      description: 'Cleaners available at your preferred time'
    },
    {
      icon: Star,
      label: 'Specialty & Skills',
      weight: '20%',
      description: 'Cleaners with your needed specialties'
    },
    {
      icon: Target,
      label: 'Reliability Score',
      weight: '15%',
      description: 'High-performing, dependable cleaners'
    },
    {
      icon: Heart,
      label: 'Past Preferences',
      weight: '10%',
      description: 'Cleaners you\'ve favorited or booked before'
    }
  ];

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Smart Matching
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
              {/* What Is It */}
              <div className="bg-white rounded-xl p-4 border-2 border-purple-300">
                <p className="text-sm font-verdana text-gray-700 mb-3">
                  Our AI analyzes <strong>50+ factors</strong> to match you with the perfect cleaner for your specific needs, location, and schedule.
                </p>
                <Badge className="bg-purple-600 text-white font-fredoka">
                  Personalized Just for You
                </Badge>
              </div>

              {/* Match Factors */}
              <div className="space-y-2">
                <h4 className="font-fredoka font-bold text-gray-800 text-sm">What We Consider:</h4>
                {matchFactors.map((factor, idx) => {
                  const Icon = factor.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-purple-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <Icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-fredoka font-semibold text-gray-800 text-sm">{factor.label}</span>
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                              {factor.weight}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 font-verdana">{factor.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benefits */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3">Why It Matters</h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Better Results:</strong> Cleaners matched to your specific needs</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Higher Acceptance:</strong> Cleaners more likely to accept</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Faster Service:</strong> Nearby cleaners get priority</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Consistent Quality:</strong> Top-rated cleaners matched first</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 font-verdana text-center">
                The more you use PureTask, the smarter your matches become!
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}