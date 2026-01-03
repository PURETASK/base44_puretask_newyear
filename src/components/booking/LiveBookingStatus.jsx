import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, CheckCircle, AlertCircle, Loader2, Calendar, 
  MapPin, User, MessageSquare, ArrowRight, Bell, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInHours, isPast, isFuture } from 'date-fns';
import { convertTo12Hour } from '../utils/timeUtils';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATUS_CONFIG = {
  'payment_hold': {
    label: 'Payment Hold Placed',
    color: 'blue',
    icon: Clock,
    progress: 16,
    description: 'Waiting for cleaner confirmation',
    urgent: false
  },
  'awaiting_cleaner_response': {
    label: 'Awaiting Cleaner',
    color: 'amber',
    icon: Clock,
    progress: 25,
    description: 'Cleaner has 4 hours to respond',
    urgent: true
  },
  'checking_fallback': {
    label: 'Finding Backup Cleaner',
    color: 'purple',
    icon: Loader2,
    progress: 35,
    description: 'Checking backup cleaners',
    urgent: true
  },
  'scheduled': {
    label: 'Confirmed & Scheduled',
    color: 'emerald',
    icon: CheckCircle,
    progress: 50,
    description: 'Your cleaning is all set!',
    urgent: false
  },
  'on_the_way': {
    label: 'Cleaner On The Way',
    color: 'blue',
    icon: MapPin,
    progress: 75,
    description: 'Your cleaner is heading to you',
    urgent: false
  },
  'in_progress': {
    label: 'Cleaning In Progress',
    color: 'indigo',
    icon: Loader2,
    progress: 85,
    description: 'Your home is being cleaned',
    urgent: false
  },
  'completed': {
    label: 'Completed',
    color: 'green',
    icon: CheckCircle,
    progress: 100,
    description: 'Cleaning finished - review photos',
    urgent: false
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'red',
    icon: AlertCircle,
    progress: 0,
    description: 'This booking was cancelled',
    urgent: false
  },
  'disputed': {
    label: 'Under Review',
    color: 'orange',
    icon: AlertCircle,
    progress: 90,
    description: 'Support team is reviewing',
    urgent: true
  }
};

export default function LiveBookingStatus({ bookingId, onUpdate }) {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      // Poll for updates every 30 seconds
      const interval = setInterval(loadBooking, 30000);
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const fetchedBooking = await base44.entities.Booking.get(bookingId);
      setBooking(fetchedBooking);

      if (fetchedBooking.cleaner_email) {
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({
          user_email: fetchedBooking.cleaner_email
        });
        if (cleanerProfiles.length > 0) {
          setCleaner(cleanerProfiles[0]);
        }
      }

      if (onUpdate) {
        onUpdate(fetchedBooking);
      }
    } catch (err) {
      console.error('Error loading booking:', err);
      setError('Failed to load booking status');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Loading booking status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !booking) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-800">{error || 'Booking not found'}</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG['payment_hold'];
  const StatusIcon = statusConfig.icon;
  const isUrgent = statusConfig.urgent;

  const bookingDateTime = parseISO(`${booking.date}T${booking.start_time}`);
  const hoursUntilBooking = differenceInHours(bookingDateTime, new Date());
  const isToday = hoursUntilBooking >= 0 && hoursUntilBooking < 24;
  const isTomorrow = hoursUntilBooking >= 24 && hoursUntilBooking < 48;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={booking.status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`border-2 ${
          isUrgent ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
        } shadow-lg overflow-hidden`}>
          {/* Status Header */}
          <div className={`bg-gradient-to-r ${
            statusConfig.color === 'blue' ? 'from-blue-500 to-cyan-600' :
            statusConfig.color === 'emerald' ? 'from-emerald-500 to-green-600' :
            statusConfig.color === 'amber' ? 'from-amber-500 to-yellow-600' :
            statusConfig.color === 'purple' ? 'from-purple-500 to-pink-600' :
            statusConfig.color === 'indigo' ? 'from-indigo-500 to-blue-600' :
            statusConfig.color === 'green' ? 'from-green-500 to-emerald-600' :
            statusConfig.color === 'red' ? 'from-red-500 to-rose-600' :
            'from-slate-500 to-gray-600'
          } p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <StatusIcon className={`w-5 h-5 ${
                    statusConfig.icon === Loader2 ? 'animate-spin' : ''
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{statusConfig.label}</h3>
                  <p className="text-sm text-white/90">{statusConfig.description}</p>
                </div>
              </div>
              {isUrgent && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.div>
              )}
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-600">Progress</span>
                <span className="text-xs font-bold text-slate-900">{statusConfig.progress}%</span>
              </div>
              <Progress value={statusConfig.progress} className="h-2" />
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Date & Time</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {format(bookingDateTime, 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-slate-600">{convertTo12Hour(booking.start_time)}</p>
                {isToday && (
                  <Badge className="mt-1 bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                    Today
                  </Badge>
                )}
                {isTomorrow && (
                  <Badge className="mt-1 bg-blue-100 text-blue-800 border-blue-300 text-[10px]">
                    Tomorrow
                  </Badge>
                )}
              </div>

              {cleaner && (
                <div>
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Your Cleaner</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{cleaner.full_name}</p>
                  <Badge className="mt-1 bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
                    {cleaner.tier} • {cleaner.average_rating.toFixed(1)}★
                  </Badge>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(createPageUrl('Inbox'))}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                onClick={() => navigate(createPageUrl(`ClientDashboard?booking=${bookingId}`))}
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Time-sensitive alerts */}
            {booking.status === 'awaiting_cleaner_response' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-1">Waiting for Confirmation</p>
                    <p>Your cleaner has 4 hours to accept. If they don't respond, we'll automatically check your backup cleaners.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {booking.status === 'completed' && !booking.review_submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <Camera className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-800">
                    <p className="font-semibold mb-1">Cleaning Complete!</p>
                    <p>Review the before/after photos and leave feedback for your cleaner.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}