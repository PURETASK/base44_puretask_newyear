import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Clock, DollarSign, Calendar, Navigation, 
  CheckCircle2, Eye, AlertCircle, MessageSquare
} from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { motion } from 'framer-motion';
import MessageButton from '../messaging/MessageButton';

export default function JobCardWithCheckIn({ job, index, onViewDetails, onCheckIn, onCheckOut }) {
  const jobDateTime = parseISO(`${job.date}T${job.start_time}`);
  const now = new Date();
  const minutesUntilStart = differenceInMinutes(jobDateTime, now);
  const minutesSinceStart = -minutesUntilStart;

  // Determine if check-in/check-out is available
  const canCheckIn = minutesUntilStart <= 30 && minutesUntilStart >= -15 && !job.check_in_time;
  const canCheckOut = job.check_in_time && !job.check_out_time && minutesSinceStart >= (job.hours * 60);
  const isLate = minutesUntilStart < -15 && !job.check_in_time;
  const isCheckedIn = job.check_in_time && !job.check_out_time;
  const isCompleted = job.check_in_time && job.check_out_time;

  const getCheckInButtonColor = () => {
    if (isLate) return 'bg-red-600 hover:bg-red-700 animate-pulse';
    if (minutesUntilStart <= 0) return 'bg-amber-600 hover:bg-amber-700';
    if (minutesUntilStart <= 15) return 'bg-yellow-600 hover:bg-yellow-700';
    return 'bg-green-600 hover:bg-green-700';
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (isCheckedIn) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Cleaning Now
        </Badge>
      );
    }
    if (isLate) {
      return (
        <Badge className="bg-red-100 text-red-800 animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          Check-In Required!
        </Badge>
      );
    }
    
    // Show status-based badges for jobs not yet started
    switch (job.status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'awaiting_cleaner':
        return <Badge className="bg-amber-100 text-amber-800">Awaiting Confirmation</Badge>;
      case 'payment_hold':
        return <Badge className="bg-cyan-100 text-cyan-800">Payment Held</Badge>;
      case 'reschedule_requested':
        return <Badge className="bg-orange-100 text-orange-800">Reschedule Requested</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 ${
        isLate ? 'ring-2 ring-red-500' : isCheckedIn ? 'ring-2 ring-green-500' : ''
      }`}>
        <CardContent className="p-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-slate-900">
                {format(jobDateTime, 'EEE, MMM d')}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Time and Pay */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-sm">{job.start_time} • {job.hours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-lg font-bold text-emerald-600">${job.total_price}</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 mb-4 bg-slate-50 p-3 rounded-lg">
            <MapPin className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-700">{job.address}</span>
          </div>

          {/* Time Until/Since Start */}
          {!isCompleted && (
            <div className="mb-4 text-center">
              {minutesUntilStart > 0 ? (
                <p className="text-sm text-slate-600">
                  Starts in <strong>{minutesUntilStart} min</strong>
                </p>
              ) : minutesUntilStart >= -15 ? (
                <p className="text-sm text-amber-700 font-semibold">
                  Started {Math.abs(minutesUntilStart)} min ago
                </p>
              ) : !job.check_in_time ? (
                <p className="text-sm text-red-700 font-bold">
                  Late by {Math.abs(minutesUntilStart)} min - Check in now!
                </p>
              ) : (
                <p className="text-sm text-green-700">
                  In progress ({Math.floor(minutesSinceStart / 60)}h {minutesSinceStart % 60}m)
                </p>
              )}
            </div>
          )}

          {/* Check-In/Check-Out Status */}
          {job.check_in_time && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-900">
                <CheckCircle2 className="w-4 h-4" />
                <span>Checked in at {format(new Date(job.check_in_time), 'h:mm a')}</span>
              </div>
              {job.check_out_time && (
                <div className="flex items-center gap-2 text-sm text-green-900 mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Checked out at {format(new Date(job.check_out_time), 'h:mm a')}</span>
                </div>
              )}
            </div>
          )}

          {/* Message Client Section */}
          {job.status === 'scheduled' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Contact Client</span>
                </div>
                <MessageButton 
                  recipientEmail={job.client_email}
                  bookingId={job.id}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Send updates, confirm details, or ask questions
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(job)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>
            
            {canCheckIn && (
              <Button
                size="sm"
                onClick={() => onCheckIn(job)}
                className={`flex-1 ${getCheckInButtonColor()} text-white`}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Check In
              </Button>
            )}

            {canCheckOut && (
              <Button
                size="sm"
                onClick={() => onCheckOut(job)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}