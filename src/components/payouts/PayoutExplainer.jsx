import React, { useState } from 'react';
import { DollarSign, Calendar, Zap, Info, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayoutExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            How You Get Paid
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
              {/* Weekly Payouts */}
              <div className="bg-white rounded-xl p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h4 className="font-fredoka font-bold text-gray-800">Weekly Payouts (Free)</h4>
                  <Badge className="bg-green-600 text-white font-fredoka ml-auto">Recommended</Badge>
                </div>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <p>• Automatic every <strong>Friday</strong></p>
                  <p>• <strong>No fees</strong> - you keep 100% of your earnings</p>
                  <p>• Includes all jobs approved during the week</p>
                  <p>• Direct deposit to your bank account</p>
                </div>
                <div className="mt-3 p-2 bg-green-50 rounded-lg text-xs text-green-800">
                  <strong>Example:</strong> Complete jobs Mon-Thu → Get paid Friday
                </div>
              </div>

              {/* Instant Payouts */}
              <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h4 className="font-fredoka font-bold text-gray-800">Instant Payout (5% fee)</h4>
                </div>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <p>• Cash out <strong>anytime</strong> you want</p>
                  <p>• Small <strong>5% convenience fee</strong></p>
                  <p>• Minimum <strong>$20</strong> required</p>
                  <p>• Arrives in 1-2 business days</p>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                  <strong>Example:</strong> $100 pending → Pay $5 fee → Get $95 now
                </div>
              </div>

              {/* When You Earn */}
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-yellow-600" />
                  When Do I Earn?
                </h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p>Job is completed and checked out</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p>Client reviews and approves (or auto-approves after 12 hours)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p>Payment settles and becomes available in your pending balance</p>
                  </div>
                </div>
              </div>

              {/* Protection Info */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 font-verdana">
                <p className="mb-2"><strong>Payment Protection:</strong></p>
                <p>• Credits held in escrow during job</p>
                <p>• You're paid based on actual hours worked</p>
                <p>• Disputes are reviewed fairly by our team</p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}