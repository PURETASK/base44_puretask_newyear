import React from 'react';
import { Camera, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function PhotoProofProgress({ booking, currentCount, requiredCount = 3 }) {
  if (!booking) return null;

  const photoCount = currentCount ?? booking.photo_pair_count ?? 0;
  const required = requiredCount;
  const percentage = Math.min((photoCount / required) * 100, 100);
  const isComplete = photoCount >= required;
  const needsMore = photoCount < required;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border-2 ${
        isComplete 
          ? 'bg-green-50 border-green-300'
          : needsMore && photoCount > 0
          ? 'bg-yellow-50 border-yellow-300'
          : 'bg-blue-50 border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : needsMore ? (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          ) : (
            <Camera className="w-6 h-6 text-blue-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-fredoka font-bold text-gray-900">
              Photo Proof Required
            </h4>
            <Badge className={`${
              isComplete 
                ? 'bg-green-600 text-white'
                : 'bg-yellow-600 text-white'
            } font-fredoka font-bold`}>
              {photoCount}/{required}
            </Badge>
          </div>

          <Progress value={percentage} className="mb-2 h-2" />

          <p className="text-sm text-gray-700 font-verdana">
            {isComplete ? (
              <span className="text-green-700 font-semibold">
                ✓ All required photos uploaded! Great job.
              </span>
            ) : photoCount > 0 ? (
              <>
                Upload <strong>{required - photoCount} more before/after photo pair{required - photoCount !== 1 ? 's' : ''}</strong> to complete this requirement.
              </>
            ) : (
              <>
                Upload at least <strong>{required} before/after photo pairs</strong> to verify job completion.
              </>
            )}
          </p>

          {needsMore && (
            <div className="mt-3 text-xs text-gray-600 font-verdana space-y-1">
              <p>• Take photos before you start cleaning each area</p>
              <p>• Take matching after photos when complete</p>
              <p>• Recommended areas: kitchen, bathroom, living room</p>
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2 text-xs text-green-700 font-verdana"
            >
              <p>This helps build your reliability score and protects both you and the client.</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}