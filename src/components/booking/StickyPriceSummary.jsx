import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StickyPriceSummary({ estimate, bookingData, cleaner, showWarning = false }) {
  const hasAddons = bookingData.additional_services && Object.keys(bookingData.additional_services).length > 0;
  
  if (!estimate || estimate.finalCredits === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-6"
    >
      <Card className="border-2 shadow-2xl rounded-2xl overflow-hidden" style={{ borderColor: '#66B3FF' }}>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-fredoka font-bold text-lg">Price Summary</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-fredoka font-bold text-white">{estimate.finalCredits}</span>
            <span className="text-white/90 font-verdana text-sm">credits</span>
          </div>
          <p className="text-white/90 font-verdana text-sm mt-1">
            ≈ ${estimate.finalUSD.toFixed(2)} USD
          </p>
        </div>

        <CardContent className="p-4 space-y-3 bg-gradient-to-b from-blue-50 to-white">
          {/* Cleaner Info */}
          {cleaner && (
            <div className="flex items-center justify-between pb-3 border-b border-blue-200">
              <span className="text-sm font-verdana text-gray-600">Cleaner</span>
              <div className="text-right">
                <p className="font-fredoka font-semibold text-graphite text-sm">{cleaner.full_name}</p>
                <Badge className="text-xs mt-1" style={{ 
                  backgroundColor: cleaner.tier === 'Elite' ? '#FCD34D' : '#66B3FF',
                  color: cleaner.tier === 'Elite' ? '#92400E' : 'white'
                }}>
                  {cleaner.tier}
                </Badge>
              </div>
            </div>
          )}

          {/* Service Type */}
          {bookingData.cleaning_type && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-verdana text-gray-600">Service</span>
              <span className="font-fredoka font-semibold text-graphite capitalize">
                {bookingData.cleaning_type}
              </span>
            </div>
          )}

          {/* Hours */}
          {bookingData.hours > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-verdana text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Hours
              </span>
              <span className="font-fredoka font-semibold text-graphite">
                {bookingData.hours}h
              </span>
            </div>
          )}

          {/* Rate Breakdown */}
          <div className="pt-3 border-t border-blue-200 space-y-2">
            <div className="flex justify-between text-xs font-verdana">
              <span className="text-gray-600">Base rate</span>
              <span className="text-gray-700">{estimate.baseRate} credits/hr</span>
            </div>
            
            {estimate.addonRate > 0 && (
              <div className="flex justify-between text-xs font-verdana">
                <span className="text-gray-600">Service add-on</span>
                <span className="text-gray-700">+{estimate.addonRate} credits/hr</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs font-verdana font-semibold">
              <span className="text-gray-700">Hourly total</span>
              <span className="text-graphite">{estimate.hourlyCredits} credits</span>
            </div>
          </div>

          {/* Additional Services */}
          {hasAddons && estimate.additionalServicesCredits > 0 && (
            <div className="pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-verdana text-gray-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Add-ons
                </span>
                <span className="font-fredoka font-semibold text-gray-700">
                  +{estimate.additionalServicesCredits} credits
                </span>
              </div>
              <div className="text-xs text-gray-500 font-verdana">
                {Object.keys(bookingData.additional_services).filter(k => bookingData.additional_services[k] > 0).length} service(s)
              </div>
            </div>
          )}

          {/* Bundle Discount */}
          <AnimatePresence>
            {estimate.bundleDiscount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-green-200"
              >
                <div className="flex justify-between text-sm bg-green-50 rounded-lg p-2">
                  <span className="font-verdana text-green-700">Bundle savings</span>
                  <span className="font-fredoka font-bold text-green-700">
                    -{estimate.bundleDiscount} credits
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning for insufficient credits */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-verdana text-amber-800">
                  Insufficient balance. You'll need to add credits before checkout.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final Total */}
          <div className="pt-3 border-t-2 border-blue-300">
            <div className="flex justify-between items-center">
              <span className="font-fredoka font-bold text-graphite">Total</span>
              <div className="text-right">
                <p className="text-2xl font-fredoka font-bold text-blue-600">
                  {estimate.finalCredits}
                </p>
                <p className="text-xs text-gray-600 font-verdana">
                  ${estimate.finalUSD.toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-verdana text-center pt-2">
            💳 Held in escrow until job completion
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}