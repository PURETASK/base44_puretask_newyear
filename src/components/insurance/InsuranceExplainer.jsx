import React, { useState } from 'react';
import { Shield, ChevronDown, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function InsuranceExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Damage Protection Insurance
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
              {/* Coverage */}
              <div className="bg-white rounded-xl p-4 border-2 border-green-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  What's Covered
                </h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Accidental Damage:</strong> Up to $2,500 per incident</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Broken Items:</strong> Furniture, electronics, decorations</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Property Damage:</strong> Walls, floors, fixtures</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p><strong>Fast Claims:</strong> 24-48 hour processing</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Simple Pricing
                </h4>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 font-verdana mb-1">Add to any booking for:</p>
                  <p className="text-3xl font-fredoka font-bold text-blue-600">$5</p>
                  <p className="text-xs text-gray-500 font-verdana mt-1">One-time fee per booking</p>
                </div>
              </div>

              {/* How Claims Work */}
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300">
                <h4 className="font-fredoka font-bold text-gray-800 mb-3">How Claims Work</h4>
                <div className="space-y-2 text-sm font-verdana text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-700 font-bold">1.</span>
                    <p>File a claim within <strong>24 hours</strong> of damage</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-700 font-bold">2.</span>
                    <p>Upload photos and description of damage</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-700 font-bold">3.</span>
                    <p>Our team reviews and approves within 48 hours</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-700 font-bold">4.</span>
                    <p>Compensation issued as credits or direct payment</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-xs text-green-800 font-verdana">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                <strong>Peace of Mind:</strong> All cleaners are screened, but accidents happen. Insurance protects you!
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}