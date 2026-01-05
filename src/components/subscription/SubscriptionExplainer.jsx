import React, { useState } from 'react';
import { Repeat, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubscriptionExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Repeat className="w-5 h-5 text-purple-600" />
            How Subscriptions Work
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
              {/* Benefits */}
              <div className="bg-white rounded-xl p-4 border-2 border-purple-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  Subscription Benefits
                </h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <p><strong>Priority Scheduling:</strong> Same day, same time, every week/month</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <p><strong>Same Cleaner:</strong> Build trust with your dedicated cleaner</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <p><strong>Auto-Booking:</strong> Jobs created automatically, no manual booking</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <p><strong>Flexible Pausing:</strong> Pause anytime for vacations or breaks</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <p><strong>Easy Cancellation:</strong> Cancel with 24h notice, no penalty</p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3">How It Works</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Choose Your Schedule</p>
                      <p className="text-gray-600 font-verdana">Weekly, bi-weekly, or monthly - your choice</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Auto-Booking Created</p>
                      <p className="text-gray-600 font-verdana">New booking created automatically each cycle</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Pay Per Job</p>
                      <p className="text-gray-600 font-verdana">Charged only when each cleaning happens</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Manage Anytime</p>
                      <p className="text-gray-600 font-verdana">Pause, reschedule, or cancel from dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800 font-verdana space-y-1">
                    <p><strong>No Upfront Payment:</strong> You're only charged when each cleaning happens</p>
                    <p><strong>Cancel Anytime:</strong> No long-term commitment or cancellation fees</p>
                    <p><strong>Pause for Free:</strong> Going on vacation? Pause your subscription hassle-free</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}