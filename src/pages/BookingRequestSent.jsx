import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle, Clock, Bell, Home, Loader2, Sparkles, MessageSquare, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingRequestSent() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('booking');

  const [booking, setBooking] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      navigate(createPageUrl('ClientDashboard'));
      return;
    }
    loadBooking();

    // Poll for updates every 10 seconds
    const interval = setInterval(loadBooking, 10000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      if (bookings.length === 0) {
        navigate(createPageUrl('ClientDashboard'));
        return;
      }

      const bookingData = bookings[0];
      setBooking(bookingData);

      // Load cleaner info
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ 
        user_email: bookingData.cleaner_email 
      });
      if (cleanerProfiles.length > 0) {
        setCleaner(cleanerProfiles[0]);
      }

      // If status changed to accepted, redirect to payment
      if (bookingData.status === 'accepted' || bookingData.status === 'payment_hold') {
        navigate(createPageUrl(`PaymentCheckout?booking=${bookingData.id}`));
      }

      // If declined, show alert
      if (bookingData.status === 'cleaner_declined') {
        // Will show declined state in UI
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading booking:', showToast: false });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const isDeclined = booking?.status === 'cleaner_declined';
  const timeLeft = booking?.request_expires_at 
    ? Math.max(0, Math.round((new Date(booking.request_expires_at) - new Date()) / 1000 / 60 / 60)) 
    : 24;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {!isDeclined ? (
            <>
              {/* Success State */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 brand-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <CheckCircle className="w-14 h-14 text-white" />
                </motion.div>
                <h1 className="text-4xl font-fredoka font-bold text-graphite mb-3">
                  Request Sent Successfully! 🎉
                </h1>
                <p className="text-lg text-gray-600 font-verdana">
                  We've notified {cleaner?.full_name} about your booking
                </p>
              </div>

              {/* Status Card */}
              <Card className="border-0 shadow-2xl rounded-2xl mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8" />
                      <div>
                        <p className="font-fredoka font-bold text-xl">Awaiting Response</p>
                        <p className="text-sm opacity-90 font-verdana">{timeLeft} hours remaining</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Bell className="w-8 h-8" />
                    </motion.div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <Alert className="border-blue-200 bg-blue-50 rounded-xl">
                    <Info className="w-4 h-4 text-puretask-blue" />
                    <AlertDescription className="font-verdana text-gray-700">
                      <strong>{cleaner?.full_name}</strong> has 24 hours to respond to your request. We'll notify you immediately via email and SMS once they accept!
                    </AlertDescription>
                  </Alert>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      </div>
                      <span className="font-verdana text-gray-700">Request sent to cleaner</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-verdana text-gray-500">Waiting for acceptance...</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-30">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-verdana text-gray-400">Payment processing</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-30">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-verdana text-gray-400">Booking confirmed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Declined State */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-14 h-14 text-red-600" />
                </div>
                <h1 className="text-4xl font-fredoka font-bold text-graphite mb-3">
                  Request Declined
                </h1>
                <p className="text-lg text-gray-600 font-verdana">
                  {cleaner?.full_name} is unable to accept this booking
                </p>
              </div>

              <Card className="border-0 shadow-2xl rounded-2xl mb-6">
                <CardContent className="p-8 text-center">
                  <p className="font-verdana text-gray-700 mb-6">
                    Don't worry! We have many other great cleaners available for your date and time.
                  </p>
                  <Button
                    onClick={() => navigate(createPageUrl('MatchedCleaners'))}
                    className="brand-gradient text-white rounded-full font-fredoka font-bold px-8 py-6"
                  >
                    View Other Available Cleaners
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => navigate(createPageUrl('ClientDashboard'))}
              variant="outline"
              size="lg"
              className="rounded-full font-fredoka font-semibold border-2"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>

            {booking && !isDeclined && (
              <Button
                onClick={() => navigate(createPageUrl(`ChatThread?booking=${booking.id}`))}
                variant="outline"
                size="lg"
                className="rounded-full font-fredoka font-semibold border-2"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Message {cleaner?.full_name}
              </Button>
            )}
          </div>

          {/* Auto-refresh indicator */}
          {!isDeclined && (
            <p className="text-center text-sm text-gray-500 font-verdana mt-6">
              ⟳ Checking for updates automatically...
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}