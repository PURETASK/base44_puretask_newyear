import React, { useState } from 'react';
import { MapPin, ChevronDown, Shield, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function GPSExplainer({ userType = 'client' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            GPS Tracking & Verification
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
              <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                <p className="text-sm font-verdana text-gray-700 mb-3">
                  We use GPS location tracking to verify that cleaners are physically present at your address during the job. This protects both clients and cleaners.
                </p>
                <Badge className="bg-blue-600 text-white font-fredoka">
                  Trust & Accountability
                </Badge>
              </div>

              {/* How It Works */}
              <div className="space-y-3">
                <h4 className="font-fredoka font-bold text-gray-800 text-sm">How It Works:</h4>
                
                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                    <div>
                      <p className="font-fredoka font-semibold text-gray-800 text-sm mb-1">Check-In (Job Start)</p>
                      <p className="text-xs text-gray-600 font-verdana">
                        Cleaner must be <strong>within 100 meters</strong> of your address to check in
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                    <div>
                      <p className="font-fredoka font-semibold text-gray-800 text-sm mb-1">Check-Out (Job End)</p>
                      <p className="text-xs text-gray-600 font-verdana">
                        Cleaner must check out from the same location to complete job
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-fredoka font-semibold text-gray-800 text-sm mb-1">Automatic Time Tracking</p>
                      <p className="text-xs text-gray-600 font-verdana">
                        Check-in/out times calculate <strong>exact hours worked</strong> - no guesswork
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-300">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h4 className="font-fredoka font-bold text-gray-800 text-sm">Your Privacy</h4>
                </div>
                <div className="space-y-2 text-xs font-verdana text-gray-700">
                  <p>• Location only captured at check-in/check-out</p>
                  <p>• Not tracked during the job or outside work</p>
                  <p>• Data encrypted and stored securely</p>
                  <p>• Only visible to involved parties and support</p>
                </div>
              </div>

              {userType === 'client' && (
                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-xs text-green-800 font-verdana">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  <strong>Your Protection:</strong> GPS verification ensures the cleaner was actually at your address and worked the claimed hours.
                </div>
              )}

              {userType === 'cleaner' && (
                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-xs text-green-800 font-verdana">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  <strong>Your Protection:</strong> GPS verification proves you were on-site, protecting you from false claims.
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}