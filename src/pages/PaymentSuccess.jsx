import React, { useEffect, useState } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Clock, Bell, Camera, Star, Calendar, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { convertTo12Hour } from '../components/utils/timeUtils';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    if (bookingId) {
      loadBooking(bookingId);
    } else {
      navigate(createPageUrl('Home'));
    }
  }, []);

  const loadBooking = async (id) => {
    try {
      const fetchedBooking = await base44.entities.Booking.get(id);
      setBooking(fetchedBooking);

      // Load cleaner profile
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({
        user_email: fetchedBooking.cleaner_email
      });
      if (cleanerProfiles.length > 0) {
        setCleaner(cleanerProfiles[0]);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading booking:', showToast: false });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  const timelineSteps = [
    {
      title: 'Payment Hold Placed',
      description: 'Your card has been authorized but not charged yet',
      icon: CheckCircle,
      status: 'complete',
      time: 'Just now'
    },
    {
      title: 'Cleaner Confirmation',
      description: `${cleaner?.full_name || 'Your cleaner'} will confirm within 4 hours`,
      icon: Bell,
      status: booking?.cleaner_confirmed ? 'complete' : 'pending',
      time: booking?.cleaner_confirmed ? 'Confirmed' : 'Within 4 hours'
    },
    {
      title: 'Cleaning Day',
      description: 'Your cleaner will arrive and complete the service',
      icon: Calendar,
      status: 'upcoming',
      time: booking ? format(parseISO(booking.date), 'MMM d, yyyy') + ' at ' + convertTo12Hour(booking.start_time) : ''
    },
    {
      title: 'Photo Verification',
      description: 'Review before/after photos and approve the work',
      icon: Camera,
      status: 'upcoming',
      time: 'After cleaning'
    },
    {
      title: 'Payment Processed',
      description: 'Payment will be captured only after you approve',
      icon: CheckCircle,
      status: 'upcoming',
      time: 'After approval'
    },
    {
      title: 'Leave a Review',
      description: 'Share your experience to help others',
      icon: Star,
      status: 'upcoming',
      time: 'Optional'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-slate-600 mb-4">
            Your cleaning is scheduled and payment is secured
          </p>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-sm px-4 py-1">
            Booking ID: {booking?.id?.slice(0, 8)}
          </Badge>
        </motion.div>

        {/* Booking Summary */}
        {booking && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-8 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date & Time</p>
                      <p className="font-semibold text-slate-900">
                        {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-slate-700">{convertTo12Hour(booking.start_time)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Duration</p>
                      <p className="font-semibold text-slate-900">{booking.hours} hours</p>
                    </div>
                    {cleaner && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Your Cleaner</p>
                        <p className="font-semibold text-slate-900">{cleaner.full_name}</p>
                        <Badge className="mt-1 bg-purple-100 text-purple-800 border-purple-200">
                          {cleaner.tier} Tier
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Address</p>
                      <p className="font-semibold text-slate-900">{booking.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Total Price</p>
                      <p className="text-2xl font-bold text-emerald-600">${booking.total_price.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Payment hold placed - will be charged after cleaning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* What Happens Next - Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                What Happens Next
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete = step.status === 'complete';
                  const isPending = step.status === 'pending';
                  const isUpcoming = step.status === 'upcoming';

                  return (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex gap-4"
                    >
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isComplete ? 'bg-emerald-500' :
                          isPending ? 'bg-blue-500 animate-pulse' :
                          'bg-slate-300'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isComplete || isPending ? 'text-white' : 'text-slate-500'
                          }`} />
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div className={`w-0.5 h-12 ${
                            isComplete ? 'bg-emerald-300' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`font-semibold ${
                            isComplete ? 'text-emerald-900' :
                            isPending ? 'text-blue-900' :
                            'text-slate-700'
                          }`}>
                            {step.title}
                          </h3>
                          <span className={`text-sm ${
                            isComplete ? 'text-emerald-600 font-medium' :
                            isPending ? 'text-blue-600 font-medium' :
                            'text-slate-500'
                          }`}>
                            {step.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{step.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-slate-200 hover:border-emerald-300">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Message Your Cleaner</h3>
              <p className="text-sm text-slate-600 mb-4">
                Ask questions or provide special instructions
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl('Inbox'))}>
                Open Messages
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-slate-200 hover:border-purple-300">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">View Your Bookings</h3>
              <p className="text-sm text-slate-600 mb-4">
                See all your scheduled cleanings
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl('ClientDashboard'))}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-slate-200 hover:border-green-300">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Book Another Cleaning</h3>
              <p className="text-sm text-slate-600 mb-4">
                Schedule your next cleaning service
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl('BrowseCleaners'))}>
                Browse Cleaners
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps Reminder */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-6 text-center"
        >
          <Bell className="w-8 h-8 text-amber-600 mx-auto mb-3" />
          <h3 className="font-semibold text-amber-900 mb-2">We'll Keep You Updated</h3>
          <p className="text-sm text-amber-800">
            You'll receive email and SMS notifications at each step. Check your inbox for confirmation details.
          </p>
        </motion.div>
      </div>
    </div>
  );
}