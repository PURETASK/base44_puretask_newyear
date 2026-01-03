import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AutoApprovalWarning({ booking, onReviewClick }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isVeryUrgent, setIsVeryUrgent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!booking?.client_review_deadline) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const deadline = new Date(booking.client_review_deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setIsVeryUrgent(hours < 1);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes} minutes`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 30000);

    return () => clearInterval(interval);
  }, [booking?.client_review_deadline]);

  if (!booking || booking.status !== 'awaiting_client' || !booking.client_review_deadline) {
    return null;
  }

  const handleReviewClick = () => {
    if (onReviewClick) {
      onReviewClick();
    } else {
      navigate(createPageUrl('ClientReview') + `?booking_id=${booking.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-4 ${
        isVeryUrgent
          ? 'bg-red-50 border-red-400'
          : 'bg-orange-50 border-orange-400'
      }`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{
            scale: isVeryUrgent ? [1, 1.2, 1] : 1,
          }}
          transition={{
            repeat: isVeryUrgent ? Infinity : 0,
            duration: 1,
          }}
        >
          <AlertCircle className={`w-6 h-6 ${
            isVeryUrgent ? 'text-red-600' : 'text-orange-600'
          }`} />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-fredoka font-bold ${
              isVeryUrgent ? 'text-red-900' : 'text-orange-900'
            }`}>
              {isVeryUrgent ? '⚠️ Urgent: ' : ''}Review Needed
            </h4>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-fredoka font-semibold">
                {timeLeft}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-700 font-verdana mb-3">
            {isVeryUrgent ? (
              <strong>This job will auto-approve in {timeLeft}!</strong>
            ) : (
              <>This job will auto-approve in {timeLeft} if not reviewed.</>
            )}
            {' '}Review now to ensure everything was perfect, or report any issues.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleReviewClick}
              className={`${
                isVeryUrgent
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white font-fredoka flex items-center gap-2`}
            >
              <Star className="w-4 h-4" />
              Review Now
            </Button>
          </div>

          {!isVeryUrgent && (
            <p className="text-xs text-gray-600 font-verdana mt-2">
              Auto-approval confirms the job was completed satisfactorily and releases payment to the cleaner.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}