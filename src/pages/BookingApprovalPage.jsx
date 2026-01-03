import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, XCircle, Calendar, Clock, MapPin, Home, 
  User, MessageSquare, Loader2, AlertCircle, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function BookingApprovalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = new URLSearchParams(location.search).get('booking_id');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [client, setClient] = useState(null);
  const [user, setUser] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!bookingId) {
        toast.error('No booking ID provided');
        navigate(createPageUrl('CleanerDashboard'));
        return;
      }

      const bookingData = await base44.entities.Booking.get(bookingId);
      if (!bookingData) {
        toast.error('Booking not found');
        navigate(createPageUrl('CleanerDashboard'));
        return;
      }

      if (bookingData.cleaner_email !== currentUser.email) {
        toast.error('This booking is not assigned to you');
        navigate(createPageUrl('CleanerDashboard'));
        return;
      }

      setBooking(bookingData);

      // Load client profile
      const clientProfiles = await base44.entities.ClientProfile.filter({
        user_email: bookingData.client_email
      });
      if (clientProfiles.length > 0) {
        setClient(clientProfiles[0]);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading booking:', showToast: false });
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const response = await base44.functions.invoke('cleanerBookingApproval', {
        booking_id: booking.id,
        cleaner_email: user.email,
        decision: 'approve'
      });

      if (response.data.success) {
        toast.success('Booking approved! Client has been notified.');
        setTimeout(() => {
          navigate(createPageUrl('CleanerSchedule'));
        }, 2000);
      } else {
        toast.error(response.data.error || 'Failed to approve booking');
      }
    } catch (error) {
      toast.error('Failed to approve booking');
      handleError(error, { showToast: false });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    try {
      setProcessing(true);
      const response = await base44.functions.invoke('cleanerBookingApproval', {
        booking_id: booking.id,
        cleaner_email: user.email,
        decision: 'decline',
        decline_reason: declineReason
      });

      if (response.data.success) {
        toast.info('Booking declined. Client has been notified.');
        setTimeout(() => {
          navigate(createPageUrl('CleanerDashboard'));
        }, 2000);
      } else {
        toast.error(response.data.error || 'Failed to decline booking');
      }
    } catch (error) {
      toast.error('Failed to decline booking');
      handleError(error, { showToast: false });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Booking not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">
            Booking Request Approval
          </h1>
          <p className="text-gray-600 font-verdana">
            Review and decide on this booking request
          </p>
        </motion.div>

        {/* Booking Details */}
        <Card className="mb-6 border-2 border-puretask-blue">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="font-fredoka flex items-center gap-2">
              <Calendar className="w-5 h-5 text-puretask-blue" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Date & Time */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-puretask-blue to-cyan-500 flex flex-col items-center justify-center text-white">
                <p className="text-2xl font-fredoka font-bold">
                  {new Date(booking.date).getDate()}
                </p>
                <p className="text-xs">
                  {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                </p>
              </div>
              <div>
                <p className="font-fredoka font-bold text-lg">
                  {new Date(booking.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-verdana">{booking.start_time} • {booking.hours} hours</span>
                </div>
              </div>
            </div>

            {/* Cleaning Type */}
            <div className="flex items-center gap-2">
              <Badge className="bg-puretask-blue text-white font-fredoka">
                {booking.cleaning_type === 'basic' ? 'Basic Clean' : 
                 booking.cleaning_type === 'deep' ? 'Deep Clean' : 'Move-Out Clean'}
              </Badge>
              <Badge variant="outline">${booking.total_price?.toFixed(2)}</Badge>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-puretask-blue flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-fredoka font-bold mb-1">Location</p>
                  <p className="text-gray-700 font-verdana">{booking.address}</p>
                </div>
              </div>
            </div>

            {/* Entry Instructions */}
            {booking.entry_instructions && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-fredoka font-bold mb-1 text-amber-900">Entry Instructions</p>
                    <p className="text-amber-800 font-verdana text-sm">{booking.entry_instructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Home Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Home className="w-5 h-5 text-puretask-blue mx-auto mb-1" />
                <p className="text-sm text-gray-600">Bedrooms</p>
                <p className="font-fredoka font-bold text-lg">{booking.bedrooms || 'N/A'}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <Home className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Bathrooms</p>
                <p className="font-fredoka font-bold text-lg">{booking.bathrooms || 'N/A'}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <Home className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Sq Ft</p>
                <p className="font-fredoka font-bold text-lg">{booking.square_feet || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-fredoka flex items-center gap-2">
              <User className="w-5 h-5 text-puretask-blue" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-fredoka font-bold text-2xl">
                {booking.client_email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-fredoka font-bold text-lg">{booking.client_email}</p>
                {client && (
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">
                      {client.total_bookings || 0} Bookings
                    </Badge>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('Inbox'))}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expiration Notice */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-fredoka font-bold text-orange-900 mb-1">⏰ Decision Required</p>
              <p className="text-sm text-orange-800 font-verdana">
                Please approve or decline within 48 hours. After that, this booking will expire.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!showDeclineForm ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowDeclineForm(true)}
              className="gap-2 border-2"
              disabled={processing}
            >
              <XCircle className="w-5 h-5" />
              Decline
            </Button>

            <Button
              size="lg"
              onClick={handleApprove}
              disabled={processing}
              className="brand-gradient text-white gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Approve Booking
                </>
              )}
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-red-600">Decline Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Please provide a reason for declining:</p>
                <Textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g., Schedule conflict, location too far, etc."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeclineForm(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={processing}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Declining...
                    </>
                  ) : (
                    'Confirm Decline'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}