import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, CreditCard, CheckCircle, Loader2, AlertCircle, Sparkles, Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiBookingCheckout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('SignIn'));
        return;
      }
      setUser(currentUser);

      // Load cart data from localStorage
      const savedCart = localStorage.getItem('multiBookingCart');
      if (!savedCart) {
        navigate(createPageUrl('MultiBooking'));
        return;
      }

      const cart = JSON.parse(savedCart);
      setCartData(cart);

      // Load client profile for credit balance
      const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
      }
    } catch (err) {
      console.error('Error loading checkout:', err);
      setError('Failed to load checkout data');
    }
    setLoading(false);
  };

  const handleConfirmBooking = async () => {
    setProcessing(true);
    setError(null);

    try {
      const finalTotalCredits = Math.round(cartData.finalTotal * 10);
      const currentBalance = Math.round((clientProfile?.credits_balance || 0) * 10);

      // Check sufficient credits
      if (currentBalance < finalTotalCredits) {
        alert(`Insufficient credits. You need ${finalTotalCredits - currentBalance} more credits.`);
        navigate(createPageUrl('BuyCredits'));
        return;
      }

      // 1. Create BookingGroup
      const bookingGroup = await base44.entities.BookingGroup.create({
        client_email: user.email,
        booking_ids: [],
        status: 'pending_payment',
        applied_bundle_offer_id: cartData.appliedOffer?.id || null,
        applied_bundle_offer_name: cartData.appliedOffer?.offer_name || null,
        total_original_price_credits: Math.round(cartData.subtotal * 10),
        total_discount_credits: Math.round(cartData.discount * 10),
        final_total_price_credits: finalTotalCredits,
        is_recurring_group: false,
        payment_status: 'pending'
      });

      // 2. Create all individual bookings with booking_group_id
      const bookingIds = [];
      for (const bookingData of cartData.bookings) {
        const booking = await base44.entities.Booking.create({
          client_email: user.email,
          booking_group_id: bookingGroup.id,
          date: bookingData.date,
          start_time: bookingData.time,
          hours: bookingData.hours,
          cleaning_type: bookingData.serviceType,
          address: bookingData.address,
          total_price: bookingData.estimatedCredits / 10,
          status: 'created',
          payment_held: false,
          escrow_credits_reserved: 0
        });
        bookingIds.push(booking.id);
      }

      // 3. Update BookingGroup with booking IDs
      await base44.entities.BookingGroup.update(bookingGroup.id, {
        booking_ids: bookingIds
      });

      // 4. Deduct credits from client balance
      await base44.entities.ClientProfile.update(clientProfile.id, {
        credits_balance: (currentBalance - finalTotalCredits) / 10
      });

      // 5. Update BookingGroup payment status
      await base44.entities.BookingGroup.update(bookingGroup.id, {
        status: 'confirmed',
        payment_status: 'held'
      });

      // 6. Update all bookings to payment_hold status and set escrow
      const individualEscrow = Math.floor(finalTotalCredits / bookingIds.length);
      for (const bookingId of bookingIds) {
        await base44.entities.Booking.update(bookingId, {
          status: 'payment_hold',
          payment_held: true,
          escrow_credits_reserved: individualEscrow
        });
      }

      // 7. Create credit transaction
      await base44.entities.CreditTransaction.create({
        client_email: user.email,
        transaction_type: 'charge',
        amount_credits: -finalTotalCredits,
        booking_id: bookingGroup.id,
        note: `Multi-booking package: ${cartData.bookings.length} cleanings${cartData.appliedOffer ? ` with ${cartData.appliedOffer.offer_name} discount` : ''}`,
        balance_after: currentBalance - finalTotalCredits
      });

      // Clear cart
      localStorage.removeItem('multiBookingCart');

      // Navigate to confirmation
      navigate(createPageUrl(`MultiBookingConfirmation?group=${bookingGroup.id}`));
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process booking. Please try again.');
    }
    setProcessing(false);
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      basic: 'Basic Clean',
      deep: 'Deep Clean',
      moveout: 'Move-Out Clean'
    };
    return labels[type] || type;
  };

  const getServiceTypeBadgeClass = (type) => {
    const classes = {
      basic: 'bg-blue-100 text-blue-700 border-blue-300',
      deep: 'bg-purple-100 text-purple-700 border-purple-300',
      moveout: 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return classes[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (!cartData || !cartData.bookings || cartData.bookings.length === 0) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center p-6">
        <Card className="max-w-md border-red-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-fredoka font-bold text-graphite mb-2">Cart Empty</h2>
            <p className="text-gray-600 mb-6 font-verdana">Your booking cart is empty. Please add bookings first.</p>
            <Button onClick={() => navigate(createPageUrl('MultiBooking'))} className="brand-gradient text-white rounded-full font-fredoka">
              Go to Multi-Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalTotalCredits = Math.round(cartData.finalTotal * 10);
  const currentBalance = Math.round((clientProfile?.credits_balance || 0) * 10);
  const hasSufficientCredits = currentBalance >= finalTotalCredits;

  return (
    <div className="min-h-screen bg-soft-cloud p-4 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Confirm Multi-Booking</h1>
          <p className="text-lg text-gray-600 font-verdana">
            Review your {cartData.bookings.length} cleaning appointments and confirm payment
          </p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 rounded-2xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-900 font-verdana">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                <CardTitle className="font-fredoka text-graphite">
                  Your Bookings ({cartData.bookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {cartData.bookings.map((booking, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-puretask-blue transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`${getServiceTypeBadgeClass(booking.serviceType)} border rounded-full font-fredoka`}>
                        {getServiceTypeLabel(booking.serviceType)}
                      </Badge>
                      <p className="text-lg font-fredoka font-bold text-puretask-blue">
                        {booking.estimatedCredits} credits
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-puretask-blue" />
                        <span className="font-verdana">
                          {new Date(booking.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-puretask-blue" />
                        <span className="font-verdana">{booking.time} • {booking.hours} hours</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-puretask-blue mt-0.5" />
                        <span className="font-verdana text-xs">{booking.address}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <Card className="border-0 shadow-xl rounded-2xl sticky top-6">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-verdana">Subtotal</span>
                    <span className="font-fredoka font-semibold">{Math.round(cartData.subtotal * 10)} credits</span>
                  </div>
                  {cartData.appliedOffer && cartData.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-verdana text-sm">{cartData.appliedOffer.offer_name}</span>
                      <span className="font-fredoka font-semibold">-{Math.round(cartData.discount * 10)} credits</span>
                    </div>
                  )}
                  <div className="pt-3 border-t-2 border-gray-200">
                    <div className="flex justify-between items-baseline">
                      <span className="font-fredoka font-semibold text-graphite">Total</span>
                      <div className="text-right">
                        <p className="text-3xl font-fredoka font-bold text-puretask-blue">{finalTotalCredits}</p>
                        <p className="text-sm text-gray-600 font-verdana">credits</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-verdana text-right mt-1">
                      ≈ ${cartData.finalTotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Credit Balance */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-fredoka font-semibold text-gray-700">Your Balance</span>
                    <div className="text-right">
                      <p className="text-2xl font-fredoka font-bold text-purple-600">{currentBalance}</p>
                      <p className="text-xs text-gray-500 font-verdana">credits</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="font-fredoka font-semibold text-gray-700">After Payment</span>
                    <div className="text-right">
                      <p className="text-2xl font-fredoka font-bold text-graphite">{currentBalance - finalTotalCredits}</p>
                      <p className="text-xs text-gray-500 font-verdana">credits</p>
                    </div>
                  </div>
                </div>

                {/* Insufficient Credits Warning */}
                {!hasSufficientCredits && (
                  <Alert className="border-red-200 bg-red-50 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <AlertDescription className="text-red-900 font-verdana text-sm">
                      You need {finalTotalCredits - currentBalance} more credits to complete this booking.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Escrow Notice */}
                <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-puretask-blue" />
                  <AlertDescription className="text-sm text-blue-900 font-verdana">
                    Payment will be held securely in escrow for each booking until you approve the completed work.
                  </AlertDescription>
                </Alert>

                {/* Action Button */}
                {hasSufficientCredits ? (
                  <Button
                    onClick={handleConfirmBooking}
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
                        Confirm All Bookings
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

                {/* Security Badges */}
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
          </div>
        </div>
      </div>
    </div>
  );
}