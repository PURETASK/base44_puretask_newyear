import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Repeat, Loader2, ArrowRight } from 'lucide-react';
import AddressAutocomplete from '@/components/address/AddressAutocomplete';
import MultiBookingCalendar from '@/components/booking/MultiBookingCalendar';
import BookingCart from '@/components/booking/BookingCart';
import RecurringBookingSetup from '@/components/booking/RecurringBookingSetup';

export default function MultiBooking() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('individual'); // 'individual' or 'recurring'
  const [bookingCart, setBookingCart] = useState([]);
  const [currentBooking, setCurrentBooking] = useState({
    address: '',
    latitude: null,
    longitude: null,
    serviceType: 'basic',
    hours: 3,
    date: '',
    time: '',
    estimatedCredits: 0
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [showRecurringSetup, setShowRecurringSetup] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('SignIn'));
        return;
      }
      setUser(currentUser);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
      navigate(createPageUrl('SignIn'));
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedCredits = (booking) => {
    const baseRateMap = {
      basic: 300,
      deep: 330,
      moveout: 330
    };
    return baseRateMap[booking.serviceType] * booking.hours;
  };

  const addBookingToCart = () => {
    if (!currentBooking.date || !currentBooking.time) {
      alert('Please select a date and time');
      return;
    }

    const bookingWithEstimate = {
      ...currentBooking,
      estimatedCredits: calculateEstimatedCredits(currentBooking)
    };

    setBookingCart([...bookingCart, bookingWithEstimate]);
    
    // Reset current booking but keep address
    setCurrentBooking({
      ...currentBooking,
      date: '',
      time: '',
      estimatedCredits: 0
    });
  };

  const addMultipleDatesAsBookings = () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one date');
      return;
    }
    if (!currentBooking.time) {
      alert('Please select a time');
      return;
    }

    const newBookings = selectedDates.map(date => ({
      ...currentBooking,
      date,
      estimatedCredits: calculateEstimatedCredits(currentBooking)
    }));

    setBookingCart([...bookingCart, ...newBookings]);
    setSelectedDates([]);
  };

  const removeBookingFromCart = (index) => {
    setBookingCart(bookingCart.filter((_, i) => i !== index));
  };

  const editBooking = (index) => {
    const booking = bookingCart[index];
    setCurrentBooking(booking);
    removeBookingFromCart(index);
  };

  const handleRecurringGenerate = (recurringData) => {
    const newBookings = recurringData.dates.map(date => ({
      ...currentBooking,
      date,
      estimatedCredits: calculateEstimatedCredits(currentBooking)
    }));

    setBookingCart([...bookingCart, ...newBookings]);
    setShowRecurringSetup(false);
    setMode('individual');
  };

  // Calculate totals and check for bundle offers
  const totalOriginalPrice = bookingCart.reduce((sum, b) => sum + b.estimatedCredits, 0);
  const totalDiscount = appliedOffer ? (totalOriginalPrice * (appliedOffer.discount_percentage / 100)) : 0;
  const finalTotalPrice = totalOriginalPrice - totalDiscount;

  useEffect(() => {
    checkBundleOffers();
  }, [bookingCart]);

  const checkBundleOffers = async () => {
    if (bookingCart.length === 0) {
      setAppliedOffer(null);
      return;
    }

    try {
      const offers = await base44.entities.BundleOffer.filter({
        offer_type: 'multi_booking',
        is_active: true
      });

      const qualifyingOffer = offers.find(offer => {
        const minBookings = offer.conditions?.min_bookings || 0;
        return bookingCart.length >= minBookings;
      });

      setAppliedOffer(qualifyingOffer || null);
    } catch (error) {
      handleError(error, { userMessage: 'Error checking bundle offers:', showToast: false });
    }
  };

  const calculateTotals = () => {
    const subtotal = totalOriginalPrice / 10; // Convert credits to dollars
    const discount = totalDiscount / 10;
    const finalTotal = finalTotalPrice / 10;
    return { subtotal, discount, finalTotal, appliedOffer };
  };

  const proceedToCheckout = () => {
    const totals = calculateTotals();
    const cartData = {
      bookings: bookingCart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      finalTotal: totals.finalTotal,
      appliedOffer: totals.appliedOffer
    };
    localStorage.setItem('multiBookingCart', JSON.stringify(cartData));
    navigate(createPageUrl('MultiBookingCheckout'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('ClientDashboard'))}
            className="mb-4 font-fredoka"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
            Multi-Booking
          </h1>
          <p className="text-gray-600 font-verdana">
            Book multiple cleanings and save with bundle discounts
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => {
              setMode('individual');
              setShowRecurringSetup(false);
            }}
            className={`p-4 rounded-2xl border-2 transition-all ${
              mode === 'individual'
                ? 'border-puretask-blue bg-blue-50 shadow-lg'
                : 'border-gray-300 bg-white hover:border-puretask-blue'
            }`}
          >
            <Plus className="w-8 h-8 mx-auto mb-2 text-puretask-blue" />
            <h3 className="font-fredoka font-bold text-graphite mb-1">Individual Bookings</h3>
            <p className="text-sm text-gray-600 font-verdana">Add multiple bookings one by one</p>
          </button>
          <button
            onClick={() => setMode('recurring')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              mode === 'recurring'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-300 bg-white hover:border-purple-500'
            }`}
          >
            <Repeat className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-fredoka font-bold text-graphite mb-1">Recurring Bookings</h3>
            <p className="text-sm text-gray-600 font-verdana">Set up repeating appointments</p>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Common Fields */}
            <Card className="border-2 border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="font-fredoka text-graphite">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <AddressAutocomplete
                  value={currentBooking.address}
                  onChange={(address) => setCurrentBooking({ ...currentBooking, address })}
                  onLocationSelect={(location) => setCurrentBooking({
                    ...currentBooking,
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude
                  })}
                  label="Service Address"
                  required
                />

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-fredoka font-semibold mb-2 text-graphite">
                    Service Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'basic', label: 'Basic' },
                      { value: 'deep', label: 'Deep' },
                      { value: 'moveout', label: 'Move-Out' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setCurrentBooking({ ...currentBooking, serviceType: type.value })}
                        className={`p-3 rounded-xl font-fredoka font-semibold transition-all border-2 ${
                          currentBooking.serviceType === type.value
                            ? 'border-puretask-blue bg-puretask-blue text-white'
                            : 'border-gray-300 bg-white hover:border-puretask-blue'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-sm font-fredoka font-semibold mb-2 text-graphite">
                    Hours: {currentBooking.hours}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 3, 4, 5, 6, 8].map(hours => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setCurrentBooking({ ...currentBooking, hours })}
                        className={`p-3 rounded-xl font-fredoka font-bold transition-all border-2 ${
                          currentBooking.hours === hours
                            ? 'bg-green-500 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {hours}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-fredoka font-semibold mb-2 text-graphite">
                    Start Time
                  </label>
                  <select
                    value={currentBooking.time}
                    onChange={(e) => setCurrentBooking({ ...currentBooking, time: e.target.value })}
                    className="w-full rounded-xl font-verdana border-2 h-12 px-4"
                    required
                  >
                    <option value="">Select time</option>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Individual Booking Mode */}
            {mode === 'individual' && !showRecurringSetup && (
              <>
                <MultiBookingCalendar
                  selectedDates={selectedDates}
                  onDatesChange={setSelectedDates}
                />
                
                <div className="flex gap-3">
                  <Button
                    onClick={addMultipleDatesAsBookings}
                    disabled={selectedDates.length === 0 || !currentBooking.time}
                    className="flex-1 bg-puretask-blue hover:bg-blue-600 text-white rounded-full font-fredoka font-semibold py-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add {selectedDates.length} Booking{selectedDates.length !== 1 ? 's' : ''} to Cart
                  </Button>
                  <Button
                    onClick={() => setShowRecurringSetup(true)}
                    variant="outline"
                    className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 rounded-full font-fredoka font-semibold py-6"
                  >
                    <Repeat className="w-5 h-5 mr-2" />
                    Set Up Recurring
                  </Button>
                </div>
              </>
            )}

            {/* Recurring Booking Mode */}
            {(mode === 'recurring' || showRecurringSetup) && currentBooking.date && (
              <RecurringBookingSetup
                bookingTemplate={currentBooking}
                onGenerateDates={handleRecurringGenerate}
                onCancel={() => {
                  setShowRecurringSetup(false);
                  setMode('individual');
                }}
              />
            )}
          </div>

          {/* Right Column - Cart */}
          <div className="lg:col-span-1">
            <BookingCart
              bookings={bookingCart}
              onRemoveBooking={removeBookingFromCart}
              onEditBooking={editBooking}
              appliedOffer={appliedOffer}
              totalOriginalPrice={totalOriginalPrice}
              totalDiscount={totalDiscount}
              finalTotalPrice={finalTotalPrice}
            />

            {bookingCart.length > 0 && (
              <Button
                onClick={proceedToCheckout}
                className="w-full mt-4 bg-gradient-to-r from-puretask-blue to-cyan-500 text-white rounded-full font-fredoka font-bold py-6 text-lg shadow-xl hover:shadow-2xl"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}