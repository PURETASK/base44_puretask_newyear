import React, { useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp, Info, TrendingUp, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function PricingBreakdownCard({ booking }) {
  const [expanded, setExpanded] = useState(false);

  if (!booking) return null;

  const baseRate = booking.snapshot_base_rate_cph || 0;
  const addonRate = booking.snapshot_selected_addon_cph || 0;
  const totalRate = booking.snapshot_total_rate_cph || baseRate + addonRate;
  const hours = booking.actual_hours || booking.hours || 0;
  const additionalServices = booking.additional_services_cost_credits || 0;
  const membershipDiscount = booking.snapshot_membership_discount_pct || 0;
  const dynamicMultiplier = booking.snapshot_dynamic_pricing_multiplier || 1;
  const tierMultiplier = booking.snapshot_tier_multiplier || 1;

  const baseSubtotal = hours * baseRate;
  const addonSubtotal = hours * addonRate;
  const subtotal = hours * totalRate;
  const finalTotal = booking.final_charge_credits || booking.total_price || (subtotal + additionalServices);

  const appliedLabels = booking.applied_pricing_labels || [];

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Pricing Details
          </CardTitle>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Always Visible: Final Total */}
        <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
          <div className="flex justify-between items-center">
            <span className="font-fredoka font-semibold text-gray-700">Total Charge:</span>
            <span className="text-2xl font-fredoka font-bold text-blue-600">
              {finalTotal} credits
            </span>
          </div>
          <p className="text-xs text-gray-600 font-verdana mt-1">
            ≈ ${(finalTotal / 10).toFixed(2)} USD
          </p>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Frozen Rates Notice */}
              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                <p className="text-xs font-verdana text-green-800 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  <strong>Price Protection:</strong> Rates frozen at booking time
                </p>
              </div>

              {/* Base Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-verdana">Base Rate:</span>
                  <span className="font-fredoka">{baseRate} credits/hour</span>
                </div>

                {/* Cleaning Type Add-on */}
                {addonRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-verdana">
                      {booking.cleaning_type === 'deep' ? 'Deep Clean' : 'Move-Out'} Add-on:
                    </span>
                    <span className="font-fredoka text-blue-600">+{addonRate} credits/hour</span>
                  </div>
                )}

                {/* Total Rate */}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-700 font-verdana font-semibold">Hourly Rate:</span>
                  <span className="font-fredoka font-semibold">{totalRate} credits/hour</span>
                </div>
              </div>

              {/* Hours Calculation */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-verdana">Hours:</span>
                  <span className="font-fredoka">{hours} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-verdana">Subtotal:</span>
                  <span className="font-fredoka">{subtotal} credits</span>
                </div>
              </div>

              {/* Additional Services */}
              {additionalServices > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-verdana">Additional Services:</span>
                    <span className="font-fredoka text-blue-600">+{additionalServices} credits</span>
                  </div>
                  {booking.additional_services && Object.keys(booking.additional_services).length > 0 && (
                    <div className="pl-4 space-y-1">
                      {Object.entries(booking.additional_services).map(([service, qty]) => (
                        qty > 0 && (
                          <div key={service} className="text-xs text-gray-500 flex justify-between">
                            <span className="capitalize">{service.replace(/_/g, ' ')}:</span>
                            <span>×{qty}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Modifiers */}
              {(membershipDiscount > 0 || dynamicMultiplier !== 1 || tierMultiplier !== 1) && (
                <div className="bg-yellow-50 rounded-lg p-3 space-y-2 border border-yellow-200">
                  <div className="flex items-center gap-2 text-sm font-fredoka font-semibold text-yellow-800">
                    <TrendingUp className="w-4 h-4" />
                    Applied Adjustments:
                  </div>
                  {membershipDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Membership Discount:</span>
                      <span className="text-green-600 font-fredoka">-{membershipDiscount}%</span>
                    </div>
                  )}
                  {dynamicMultiplier !== 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dynamic Pricing:</span>
                      <span className={`font-fredoka ${dynamicMultiplier > 1 ? 'text-red-600' : 'text-green-600'}`}>
                        ×{dynamicMultiplier}
                      </span>
                    </div>
                  )}
                  {tierMultiplier !== 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cleaner Tier:</span>
                      <span className="font-fredoka">×{tierMultiplier}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Applied Labels */}
              {appliedLabels.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-fredoka font-semibold text-gray-700">
                    <Tag className="w-4 h-4" />
                    Active Offers:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {appliedLabels.map((label, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-700 border-purple-300 font-verdana text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Snapshot Info */}
              <div className="pt-3 border-t text-xs text-gray-500 font-verdana">
                <p>All rates frozen at booking time. Current market rates don't affect your price.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}