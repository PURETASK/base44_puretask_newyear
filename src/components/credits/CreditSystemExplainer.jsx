import React, { useState } from 'react';
import { Coins, DollarSign, ChevronDown, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreditSystemExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-600" />
            How Credits Work
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
              {/* Conversion Rate */}
              <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h4 className="font-fredoka font-bold text-gray-800">Simple Conversion</h4>
                </div>
                <div className="text-center py-4">
                  <div className="text-4xl font-fredoka font-bold text-blue-600 mb-2">
                    10 Credits = $1 USD
                  </div>
                  <div className="flex justify-center gap-4 text-sm font-verdana text-gray-600">
                    <span>100 credits = $10</span>
                    <span>•</span>
                    <span>500 credits = $50</span>
                  </div>
                </div>
              </div>

              {/* Why Credits */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h4 className="font-fredoka font-bold text-gray-800">Why Use Credits?</h4>
                </div>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Payment Protection:</strong> Credits held safely until job completion</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Fair Pricing:</strong> Pay only for actual time worked (not estimate)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Easy Refunds:</strong> Unused credits returned immediately</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Flexible:</strong> Buy in bulk, save for later, or get discounts</p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-fredoka font-bold text-gray-800">Payment Flow</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Book & Hold</p>
                      <p className="text-gray-600 font-verdana">Credits held in escrow (estimate × rate)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Job Complete</p>
                      <p className="text-gray-600 font-verdana">Actual hours calculated from check-in/out</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Final Charge</p>
                      <p className="text-gray-600 font-verdana">Charged for actual time, excess refunded</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div className="text-sm">
                      <p className="font-fredoka font-semibold text-gray-800">Review & Approve</p>
                      <p className="text-gray-600 font-verdana">Client approves (or auto-approves after 12h)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-fredoka font-semibold text-gray-800 mb-2 text-sm">Examples:</h4>
                <div className="space-y-2 text-xs font-verdana text-gray-700">
                  <div className="flex justify-between">
                    <span>3hr job at 300 credits/hr:</span>
                    <span className="font-semibold">900 credits ($90)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual time: 2.5 hours:</span>
                    <span className="font-semibold text-green-600">750 credits charged, 150 refunded</span>
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