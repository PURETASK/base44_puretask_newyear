
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, Clock, DollarSign, Home, Bed, Bath,
  Maximize, Eye, Zap, Briefcase
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getServiceIcon, ServiceBadge } from '../utils/serviceIcons';

export default function JobCard({ job, index, onSelect, onClaim, isMine = false, isRecommended = false, isUrgent = false, showPayHighlight = false }) {
  const [isClaimed, setIsClaimed] = useState(isMine);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOptimisticClaim = async () => {
    setIsAnimating(true);
    setIsClaimed(true);

    try {
      await onClaim(job.id);
      toast.success('Job claimed successfully!');
    } catch (error) {
      setIsClaimed(false);
      toast.error('Failed to claim job. Please try again.');
    }
    setIsAnimating(false);
  };

  const getFormattedDate = () => {
    try {
      const parsedDate = typeof job.date === 'string' ? parseISO(job.date) : new Date(job.date);
      return format(parsedDate, 'EEE, MMM d');
    } catch (error) {
      return job.date;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
        isClaimed ? 'ring-2 ring-emerald-500' : ''
      }`} onClick={() => onSelect(job)}>
        {isUrgent && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">Today - Act Fast!</span>
          </div>
        )}

        <CardContent className="p-6">
          {/* Date & Time */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-semibold text-slate-900">{getFormattedDate()}</p>
                <p className="text-sm text-slate-600">{job.start_time} • {job.hours}h</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">${job.total_price}</p>
              <p className="text-xs text-slate-500">${(job.total_price / job.hours).toFixed(0)}/hr</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
            <p className="text-sm text-slate-700 line-clamp-2">{job.address}</p>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center bg-slate-50 rounded p-2">
              <Bed className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <p className="text-xs font-semibold">{job.bedrooms || 0}</p>
            </div>
            <div className="text-center bg-slate-50 rounded p-2">
              <Bath className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <p className="text-xs font-semibold">{job.bathrooms || 0}</p>
            </div>
            <div className="text-center bg-slate-50 rounded p-2">
              <Maximize className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <p className="text-xs font-semibold">{job.square_feet || 'N/A'}</p>
            </div>
            <div className="text-center bg-slate-50 rounded p-2">
              <Home className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <p className="text-xs font-semibold capitalize">{job.home_type?.slice(0, 4) || 'N/A'}</p>
            </div>
          </div>

          {/* Tasks with NEW icon system */}
          {job.tasks && job.tasks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2 uppercase font-semibold">Services</p>
              <div className="flex flex-wrap gap-2">
                {job.tasks.slice(0, 3).map((task, idx) => (
                  <ServiceBadge key={idx} serviceName={task} size="small" />
                ))}
                {job.tasks.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.tasks.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons with Animation */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onSelect(job); }}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
            </motion.div>
            {!isClaimed && onClaim && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleOptimisticClaim(); }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  disabled={isAnimating}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Claim
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
