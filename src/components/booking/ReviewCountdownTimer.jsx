import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewCountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(deadline);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setPercentage(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      // Calculate percentage (12 hours = 100%)
      const totalMinutes = 12 * 60;
      const remainingMinutes = hours * 60 + minutes;
      const pct = (remainingMinutes / totalMinutes) * 100;
      setPercentage(pct);

      setIsUrgent(hours < 2);
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border-2 ${
        isUrgent 
          ? 'bg-red-50 border-red-300' 
          : 'bg-blue-50 border-blue-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-blue-600" />
          )}
          <span className={`font-fredoka font-semibold ${
            isUrgent ? 'text-red-700' : 'text-blue-700'
          }`}>
            Review Deadline
          </span>
        </div>
        <Badge className={`${
          isUrgent 
            ? 'bg-red-600 text-white' 
            : 'bg-blue-600 text-white'
        } font-fredoka font-bold text-sm px-3 py-1`}>
          {timeLeft}
        </Badge>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <motion.div
          className={`h-2 rounded-full ${
            isUrgent ? 'bg-red-600' : 'bg-blue-600'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-sm text-gray-600 font-verdana">
        {isUrgent ? (
          <strong className="text-red-600">Urgent:</strong>
        ) : null} Review this job or it will auto-approve in {timeLeft}
      </p>
    </motion.div>
  );
}