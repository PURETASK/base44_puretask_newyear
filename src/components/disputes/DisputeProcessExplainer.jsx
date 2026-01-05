import React, { useState } from 'react';
import { Scale, ChevronDown, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputeProcessExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-600" />
            Dispute Resolution Process
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
              {/* Timeline */}
              <div className="bg-white rounded-xl p-4 border-2 border-orange-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Resolution Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div className="text-sm flex-1">
                      <p className="font-fredoka font-semibold text-gray-800">File Dispute</p>
                      <p className="text-gray-600 font-verdana text-xs">Submit within 48 hours of job completion</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 font-verdana text-xs">Day 1</Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div className="text-sm flex-1">
                      <p className="font-fredoka font-semibold text-gray-800">Initial Review</p>
                      <p className="text-gray-600 font-verdana text-xs">Team reviews evidence and contacts both parties</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 font-verdana text-xs">24h</Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div className="text-sm flex-1">
                      <p className="font-fredoka font-semibold text-gray-800">Investigation</p>
                      <p className="text-gray-600 font-verdana text-xs">Photos, GPS, messages reviewed for fair decision</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 font-verdana text-xs">48h</Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div className="text-sm flex-1">
                      <p className="font-fredoka font-semibold text-gray-800">Resolution</p>
                      <p className="text-gray-600 font-verdana text-xs">Decision made, refunds/credits issued if applicable</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 font-verdana text-xs">72h</Badge>
                  </div>
                </div>
              </div>

              {/* Possible Outcomes */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3">Possible Outcomes</h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 text-white font-fredoka text-xs">Client</Badge>
                    <p>Full/partial refund + service credit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-blue-600 text-white font-fredoka text-xs">Split</Badge>
                    <p>Partial refund, both parties compensated</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-purple-600 text-white font-fredoka text-xs">Cleaner</Badge>
                    <p>Payment upheld, no client refund</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-gray-600 text-white font-fredoka text-xs">None</Badge>
                    <p>Insufficient evidence, no action taken</p>
                  </div>
                </div>
              </div>

              {/* Fair Review */}
              <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h4 className="font-fredoka font-semibold text-gray-800 text-sm">Fair & Impartial</h4>
                </div>
                <p className="text-xs text-gray-700 font-verdana">
                  Our support team reviews all evidence objectively: photos, GPS data, messages, and both parties' accounts. We aim for fair outcomes that protect everyone.
                </p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}