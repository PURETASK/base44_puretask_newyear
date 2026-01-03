import React from 'react';
import { Clock, Award, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function BookingRequestExplainer({ booking, timeLeft }) {
  if (!booking || booking.status !== 'awaiting_cleaner_response') return null;

  const isPrimary = !booking.requested_cleaners || booking.requested_cleaners.length === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-fredoka font-bold text-blue-900">Job Request</h4>
            {isPrimary && (
              <Badge className="bg-blue-600 text-white font-fredoka">1st Choice</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-verdana">
              {isPrimary ? (
                <>You've been <strong>personally selected</strong> by this client! You have <strong>24 hours</strong> to respond.</>
              ) : (
                <>This client is looking for an available cleaner. <strong>First to accept gets the job!</strong></>
              )}
            </p>

            {isPrimary && (
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>If you accept: Job is yours, client is notified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>If you decline: Request goes to alternative cleaners</span>
                </div>
              </div>
            )}

            {!isPrimary && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <Award className="w-4 h-4 inline mr-1 text-purple-600" />
                  <strong>Smart Match:</strong> AI selected you based on your availability, location, and skills.
                </p>
              </div>
            )}

            {timeLeft && (
              <div className="text-xs text-blue-700 font-semibold">
                ⏰ Expires in {timeLeft}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}