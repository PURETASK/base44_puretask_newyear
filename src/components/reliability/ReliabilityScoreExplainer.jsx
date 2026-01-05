import React, { useState } from 'react';
import { Info, CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReliabilityScoreExplainer() {
  const [expanded, setExpanded] = useState(false);

  const positiveFactors = [
    { label: 'Show up on time', impact: '+5 points', icon: CheckCircle2 },
    { label: 'Upload photo proof', impact: '+3 points', icon: CheckCircle2 },
    { label: 'Complete jobs as scheduled', impact: '+2 points', icon: CheckCircle2 },
    { label: 'Respond to messages quickly', impact: '+1 point', icon: CheckCircle2 },
    { label: 'Get 5-star reviews', impact: '+3 points', icon: CheckCircle2 }
  ];

  const negativeFactors = [
    { label: 'Cancel within 24 hours', impact: '-15 points', icon: XCircle },
    { label: 'No-show to job', impact: '-30 points', icon: XCircle },
    { label: 'Arrive late (15+ min)', impact: '-5 points', icon: XCircle },
    { label: 'Missing photo proof', impact: '-10 points', icon: XCircle },
    { label: 'Receive dispute', impact: '-20 points', icon: XCircle }
  ];

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            How Your Score Works
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
              <p className="text-sm text-gray-700 font-verdana">
                Your reliability score (0-100) affects your tier, earnings, and client visibility. Here's what impacts it:
              </p>

              {/* Positive Actions */}
              <div>
                <h4 className="font-fredoka font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Positive Actions
                </h4>
                <div className="space-y-2">
                  {positiveFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-green-50 rounded-lg p-2">
                      <span className="text-gray-700 font-verdana">{factor.label}</span>
                      <span className="text-green-700 font-fredoka font-semibold">{factor.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative Actions */}
              <div>
                <h4 className="font-fredoka font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Actions to Avoid
                </h4>
                <div className="space-y-2">
                  {negativeFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-red-50 rounded-lg p-2">
                      <span className="text-gray-700 font-verdana">{factor.label}</span>
                      <span className="text-red-700 font-fredoka font-semibold">{factor.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Ranges */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-fredoka font-semibold text-gray-800 mb-2 text-sm">Score Ranges:</h4>
                <div className="space-y-1 text-xs font-verdana">
                  <div className="flex justify-between">
                    <span>90-100:</span>
                    <span className="text-green-600 font-semibold">Excellent (Elite tier eligible)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>80-89:</span>
                    <span className="text-blue-600 font-semibold">Great (Pro tier eligible)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>70-79:</span>
                    <span className="text-yellow-600 font-semibold">Good (Semi Pro eligible)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Below 70:</span>
                    <span className="text-gray-600 font-semibold">Needs improvement</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-800 font-verdana">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                <strong>Pro Tip:</strong> Maintain 90+ score for 30 days to unlock Elite tier benefits!
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}