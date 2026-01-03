import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, MessageSquare, Calendar, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import BookingProgressTracker from '../components/booking/BookingProgressTracker';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  
  const [booking, setBooking] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const currentUser = await base44.auth.me();
      const bookingData = await base44.entities.Booking.get(bookingId);
      
      if (bookingData.client_email !== currentUser.email) {
        navigate(createPageUrl('ClientDashboard'));
        return;
      }

      setBooking(bookingData);

      const cleanerProfiles = await base44.entities.CleanerProfile.filter({
        user_email: bookingData.cleaner_email
      });
      
      if (cleanerProfiles.length > 0) {
        setCleaner(cleanerProfiles[0]);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading booking:', showToast: false });
      navigate(createPageUrl('ClientDashboard'));
    }
    setLoading(false);
  };

  const handleMessageCleaner = () => {
    navigate(createPageUrl('Inbox'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading your booking...</p>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Request Sent!</h1>
          <p className="text-lg text-slate-600">We've sent your booking to {cleaner?.full_name}</p>
        </motion.div>

        {/* Progress Tracker */}
        <BookingProgressTracker booking={booking} />

        {/* What Happens Next */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Your cleaner reviews the request</p>
                  <p className="text-sm text-slate-600 mt-1">
                    They have <strong>4 hours</strong> to accept. You'll receive an SMS & email notification when they respond.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">What if they don't respond?</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {booking.fallback_cleaners && booking.fallback_cleaners.length > 0 ? (
                      <>We'll automatically send your request to your backup cleaner ({booking.fallback_cleaners.length} selected). Your booking won't be cancelled!</>
                    ) : (
                      <>Don't worry - we'll notify you and help you find another great cleaner. Your payment won't be processed.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Once accepted, you're all set!</p>
                  <p className="text-sm text-slate-600 mt-1">
                    You'll receive a confirmation with all the details. Your cleaner will arrive on time, check in via GPS, and send you before/after photos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle>Your Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Date & Time</p>
                  <p className="font-medium text-slate-900">
                    {new Date(booking.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {booking.start_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Address</p>
                  <p className="font-medium text-slate-900">{booking.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Services</p>
                  <p className="font-medium text-slate-900">{booking.tasks.join(', ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleMessageCleaner}
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Your Cleaner
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('ClientDashboard'))}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600"
          >
            Go to My Dashboard
          </Button>
        </div>

        {/* Payment Info */}
        <Alert className="border-slate-200 bg-slate-50">
          <AlertDescription className="text-slate-700 text-sm">
            <strong>Payment Status:</strong> Your card has been authorized for ${booking.total_price.toFixed(2)}, 
            but you won't be charged until the cleaning is completed and you approve the photos. 
            You can cancel anytime before the cleaning starts.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}