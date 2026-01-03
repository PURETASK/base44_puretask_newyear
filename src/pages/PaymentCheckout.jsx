import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, CreditCard, CheckCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('booking');

  const [booking, setBooking] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!bookingId) {
        navigate(createPageUrl('ClientDashboard'));
        return;
      }

      const currentUser = await base44.auth.me();

      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      if (bookings.length === 0) {
        navigate(createPageUrl('ClientDashboard'));
        return;
      }

      const bookingData = bookings[0];
      setBooking(bookingData);

      const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
      }

      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ 
        user_email: bookingData.cleaner_email 
      });
      if (cleanerProfiles.length > 0) {
        setCleaner(cleanerProfiles[0]);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading checkout:', showToast: false });
    }
    setLoading(false);
  };

  const handlePaymentConfirm = async () => {
    setProcessing(true);
    try {
      const totalCredits = Math.round((booking.total_price || 0) * 10);
      const currentBalance = Math.round((clientProfile?.credits_balance || 0) * 10);

      if (currentBalance < totalCredits) {
        alert('Insufficient credits. Please purchase more credits first.');
        navigate(createPageUrl('BuyCredits'));
        return;
      }

      // Deduct credits and update booking status
      await base44.entities.ClientProfile.update(clientProfile.id, {
        credits_balance: (currentBalance - totalCredits) / 10
      });

      await base44.entities.Booking.update(booking.id, {
        status: 'awaiting_cleaner_response',
        payment_held: true,
        escrow_credits_reserved: totalCredits
      });

      // Create credit transaction
      await base44.entities.CreditTransaction.create({
        client_email: clientProfile.user_email,
        transaction_type: 'hold',
        amount_credits: -totalCredits,
        booking_id: booking.id,
        note: `Escrow hold for booking on ${booking.date}`,
        balance_after: currentBalance - totalCredits
      });

      navigate(createPageUrl(`BookingConfirmation?booking=${bookingId}`));
    } catch (error) {
      handleError(error, { userMessage: 'Payment error:', showToast: false });
      alert('Payment failed. Please try again.');
    }
    setProcessing(false);
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
        <Card className="max-w-md border-red-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-fredoka font-bold text-graphite mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6 font-verdana">The booking you're trying to pay for doesn't exist.</p>
            <Button onClick={() => navigate(createPageUrl('ClientDashboard'))} className="brand-gradient text-white rounded-full font-fredoka">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCredits = Math.round((booking.total_price || 0) * 10);
  const currentBalance = Math.round((clientProfile?.credits_balance || 0) * 10);
  const hasSufficientCredits = currentBalance >= totalCredits;

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Confirm Booking</h1>
          <p className="text-lg text-gray-600 font-verdana">Review your booking details and confirm payment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                <CardTitle className="font-fredoka text-graphite">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-verdana mb-1">Cleaner</p>
                  <p className="font-fredoka font-semibold text-graphite">{cleaner?.full_name}</p>
                  <Badge className={`mt-2 ${
                    cleaner?.tier === 'Elite' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                    cleaner?.tier === 'Pro' ? 'bg-blue-100 text-puretask-blue border-blue-300' :
                    'bg-gray-100 text-gray-700 border-gray-300'
                  } border rounded-full font-fredoka`}>
                    {cleaner?.tier}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-verdana mb-1">Date & Time</p>
                  <p className="font-verdana text-graphite">
                    {new Date(booking.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="font-verdana text-gray-600">{booking.start_time} • {booking.hours} hours</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-verdana mb-1">Service Type</p>
                  <p className="font-verdana text-graphite capitalize">{booking.cleaning_type} Cleaning</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-gray-600 font-verdana">Total Amount</span>
                    <div className="text-right">
                      <p className="text-3xl font-fredoka font-bold text-puretask-blue">{totalCredits}</p>
                      <p className="text-sm text-gray-600 font-verdana">credits</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-verdana text-right">
                    ≈ ${(booking.total_price || 0).toFixed(2)}
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-puretask-blue" />
                  <AlertDescription className="text-sm text-blue-900 font-verdana">
                    Your payment will be held securely in escrow until you approve the completed work.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Confirmation */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-fredoka font-semibold text-graphite">Your Credit Balance</span>
                    <div className="text-right">
                      <p className="text-2xl font-fredoka font-bold text-purple-600">{currentBalance}</p>
                      <p className="text-xs text-gray-500 font-verdana">credits</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="font-fredoka font-semibold text-graphite">After Payment</span>
                    <div className="text-right">
                      <p className="text-2xl font-fredoka font-bold text-graphite">{currentBalance - totalCredits}</p>
                      <p className="text-xs text-gray-500 font-verdana">credits</p>
                    </div>
                  </div>
                </div>

                {!hasSufficientCredits && (
                  <Alert className="border-red-200 bg-red-50 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <AlertDescription className="text-red-900 font-verdana">
                      Insufficient credits. Please purchase {totalCredits - currentBalance} more credits to complete this booking.
                    </AlertDescription>
                  </Alert>
                )}

                {hasSufficientCredits ? (
                  <Button
                    onClick={handlePaymentConfirm}
                    disabled={processing}
                    className="w-full brand-gradient text-white text-lg py-6 rounded-full font-fredoka font-semibold shadow-xl"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(createPageUrl('BuyCredits'))}
                    className="w-full brand-gradient text-white text-lg py-6 rounded-full font-fredoka font-semibold shadow-xl"
                  >
                    Buy More Credits
                  </Button>
                )}

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 font-verdana">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    <span>Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}