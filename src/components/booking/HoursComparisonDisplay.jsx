import React from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function HoursComparisonDisplay({ booking }) {
  if (!booking) return null;

  const estimatedHours = booking.estimated_hours || booking.hours || 0;
  const actualHours = booking.actual_hours || booking.hours || 0;
  const difference = actualHours - estimatedHours;
  
  // Only show if there's actual time tracking data
  const hasActualData = booking.check_in_time && booking.check_out_time;
  if (!hasActualData) return null;

  const rate = booking.snapshot_total_rate_cph || 300;
  const creditDifference = Math.abs(difference * rate);
  const usdDifference = (creditDifference / 10).toFixed(2);

  const isOver = difference > 0.1;
  const isUnder = difference < -0.1;
  const isSame = Math.abs(difference) <= 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border-2 ${
        isOver 
          ? 'bg-red-50 border-red-300'
          : isUnder
          ? 'bg-green-50 border-green-300'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {isOver ? (
            <TrendingUp className="w-6 h-6 text-red-600" />
          ) : isUnder ? (
            <TrendingDown className="w-6 h-6 text-green-600" />
          ) : (
            <Minus className="w-6 h-6 text-gray-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-fredoka font-bold text-gray-900">
              Time Comparison
            </h4>
            <Badge className={`${
              isOver 
                ? 'bg-red-600 text-white'
                : isUnder
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-white'
            } font-fredoka font-bold`}>
              {isOver ? '+' : ''}{difference.toFixed(1)} hrs
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Estimated */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 font-verdana mb-1">Estimated</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-fredoka font-semibold">{estimatedHours}h</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(estimatedHours * rate)} credits
              </div>
            </div>

            {/* Actual */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 font-verdana mb-1">Actual</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-fredoka font-semibold text-blue-600">{actualHours.toFixed(1)}h</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(actualHours * rate).toFixed(0)} credits
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className={`text-sm font-verdana p-3 rounded-lg ${
            isOver 
              ? 'bg-red-100 text-red-800'
              : isUnder
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isOver ? (
              <>
                <strong>Additional charge:</strong> Job took longer than estimated.
                <br />
                <span className="text-xs">+{creditDifference} credits (${usdDifference}) will be charged</span>
              </>
            ) : isUnder ? (
              <>
                <strong>Refund issued:</strong> Job finished faster than estimated!
                <br />
                <span className="text-xs">{creditDifference} credits (${usdDifference}) refunded to your wallet</span>
              </>
            ) : (
              <>
                <strong>On target:</strong> Job completed within estimated time.
              </>
            )}
          </div>

          {/* Check-in/out times */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 font-verdana space-y-1">
            <div className="flex justify-between">
              <span>Check-in:</span>
              <span className="font-semibold">
                {booking.check_in_time && new Date(booking.check_in_time).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Check-out:</span>
              <span className="font-semibold">
                {booking.check_out_time && new Date(booking.check_out_time).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}