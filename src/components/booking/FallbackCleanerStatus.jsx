import React from 'react';
import { Users, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function FallbackCleanerStatus({ booking }) {
  if (!booking) return null;

  const isFallbackMode = booking.status === 'checking_fallback' || 
                         booking.status === 'open_to_fallbacks' ||
                         (booking.requested_cleaners && booking.requested_cleaners.length > 1);

  if (!isFallbackMode) return null;

  const requestedCount = booking.requested_cleaners?.length || 0;
  const totalFallbacks = booking.fallback_cleaners?.length || 0;
  const currentCleaner = booking.current_request_cleaner_email;

  const isOpenToAll = booking.status === 'open_to_fallbacks';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {isOpenToAll ? (
            <Users className="w-6 h-6 text-blue-600" />
          ) : (
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-fredoka font-bold text-blue-900">
              {isOpenToAll ? 'Finding You a Cleaner' : 'Checking Availability'}
            </h4>
            <Badge className="bg-blue-600 text-white font-fredoka">
              {requestedCount}/{Math.max(requestedCount, totalFallbacks)} Asked
            </Badge>
          </div>

          <p className="text-sm text-gray-700 font-verdana mb-3">
            {isOpenToAll ? (
              <>We've sent your request to <strong>{totalFallbacks} qualified cleaners</strong>. First to accept gets the job!</>
            ) : (
              <>Waiting for response from alternative cleaner. We'll notify you once confirmed.</>
            )}
          </p>

          {/* Timeline */}
          <div className="space-y-2">
            {booking.requested_cleaners?.map((email, idx) => {
              const isPrimary = idx === 0;
              const isDeclined = idx < requestedCount - 1; // All but current are declined
              const isCurrent = email === currentCleaner;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  {isDeclined ? (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-600 font-verdana">
                    {isPrimary ? 'First Choice' : `Alternative ${idx}`} Cleaner
                    {isDeclined && ' - Declined'}
                    {isCurrent && ' - Waiting for response...'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Expiry Info */}
          {booking.overall_job_offer_expires_at && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600 font-verdana">
                <Clock className="w-3 h-3 inline mr-1" />
                Offer expires: {new Date(booking.overall_job_offer_expires_at).toLocaleDateString()} at {new Date(booking.overall_job_offer_expires_at).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}