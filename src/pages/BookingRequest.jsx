import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles, Send, MapPin, Calendar, Clock, User, DollarSign, 
  CheckCircle, ArrowLeft, Loader2, Star, Info, Home, Package, TrendingUp, Award, Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const cleanerEmail = searchParams.get('cleaner');

  const [user, setUser] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [addOns, setAddOns] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check auth
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('ClientSignup'));
        return;
      }
      setUser(currentUser);

      // Load client profile
      const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
      }

      // Load booking data
      const savedBooking = localStorage.getItem('bookingDraft');
      const savedAddOns = localStorage.getItem('bookingAddOns');
      
      if (!savedBooking || !cleanerEmail) {
        navigate(createPageUrl('Home'));
        return;
      }

      setBookingData(JSON.parse(savedBooking));
      if (savedAddOns) {
        setAddOns(JSON.parse(savedAddOns));
      }

      // Load cleaner profile
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
      if (cleanerProfiles.length === 0) {
        alert('Cleaner not found');
        navigate(createPageUrl('MatchedCleaners'));
        return;
      }
      setCleaner(cleanerProfiles[0]);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
      navigate(createPageUrl('Home'));
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!cleaner || !bookingData) return { credits: 0, usd: 0 };

    const baseRate = cleaner.base_rate_credits_per_hour || 300;
    let addonRate = 0;

    if (bookingData.serviceType === 'deep') {
      addonRate = cleaner.deep_addon_credits_per_hour || 50;
    } else if (bookingData.serviceType === 'moveout') {
      addonRate = cleaner.moveout_addon_credits_per_hour || 50;
    }

    const hourlyTotal = (baseRate + addonRate) * bookingData.recommendedHours;
    
    // Calculate add-ons (using cleaner's pricing if available)
    let addOnsTotal = 0;
    if (cleaner.additional_service_pricing) {
      Object.keys(addOns).forEach(key => {
        const price = cleaner.additional_service_pricing[key] || 0;
        addOnsTotal += price * addOns[key];
      });
    }

    const totalCredits = hourlyTotal + addOnsTotal;
    return {
      credits: Math.round(totalCredits),
      usd: (totalCredits / 10).toFixed(2),
      hourlyTotal: Math.round(hourlyTotal),
      addOnsTotal: Math.round(addOnsTotal)
    };
  };

  const handleSubmitRequest = async () => {
    setSubmitting(true);

    try {
      const estimate = calculateTotal();

      // Create booking in "awaiting_cleaner_response" status
      const newBooking = await base44.entities.Booking.create({
        client_email: user.email,
        cleaner_email: cleanerEmail,
        cleaning_type: bookingData.serviceType,
        date: bookingData.date,
        start_time: bookingData.time,
        hours: bookingData.recommendedHours,
        estimated_hours: bookingData.recommendedHours,
        address: bookingData.address,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        bedrooms: parseInt(bookingData.bedrooms),
        bathrooms: parseFloat(bookingData.bathrooms),
        square_feet: bookingData.squareFeet,
        additional_services: addOns,
        notes: specialRequests,
        total_price: parseFloat(estimate.usd),
        snapshot_base_rate_cph: cleaner.base_rate_credits_per_hour || 300,
        snapshot_selected_addon_cph: bookingData.serviceType === 'deep' ? (cleaner.deep_addon_credits_per_hour || 50) :
                                     bookingData.serviceType === 'moveout' ? (cleaner.moveout_addon_credits_per_hour || 50) : 0,
        snapshot_total_rate_cph: (cleaner.base_rate_credits_per_hour || 300) + 
                                 (bookingData.serviceType === 'deep' ? (cleaner.deep_addon_credits_per_hour || 50) :
                                  bookingData.serviceType === 'moveout' ? (cleaner.moveout_addon_credits_per_hour || 50) : 0),
        snapshot_additional_service_prices: cleaner.additional_service_pricing || {},
        additional_services_cost_credits: estimate.addOnsTotal,
        escrow_credits_reserved: estimate.credits,
        payout_percentage_at_accept: cleaner.payout_percentage || 0.80,
        status: 'awaiting_cleaner_response',
        request_sent_at: new Date().toISOString(),
        request_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

      // Clear localStorage
      localStorage.removeItem('bookingDraft');
      localStorage.removeItem('bookingAddOns');
      localStorage.removeItem('selectedCleaner');

      // Navigate to confirmation page
      navigate(createPageUrl(`BookingRequestSent?booking=${newBooking.id}`));
    } catch (error) {
      handleError(error, { userMessage: 'Error submitting booking request:', showToast: false });
      alert('Failed to send booking request. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const estimate = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 rounded-full font-fredoka"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cleaners
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <Send className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
              Review & Send Request
            </h1>
            <p className="text-lg text-gray-600 font-verdana">
              Confirm your booking details before sending to {cleaner?.full_name}
            </p>
          </div>
        </motion.div>

        {/* Booking Review */}
        <div className="space-y-8">
          {/* Cleaner Info - ENHANCED */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-4 border-puretask-blue shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white pb-8">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
                  <Award className="w-8 h-8" />
                  Your Selected Cleaner
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                  {cleaner?.profile_photo_url ? (
                    <img 
                      src={cleaner.profile_photo_url} 
                      alt={cleaner.full_name} 
                      className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white ring-4 ring-puretask-blue" 
                    />
                  ) : (
                    <div className="w-32 h-32 brand-gradient rounded-2xl flex items-center justify-center shadow-xl border-4 border-white ring-4 ring-puretask-blue">
                      <span className="text-5xl text-white font-fredoka font-bold">{cleaner?.full_name?.[0] || 'C'}</span>
                    </div>
                  )}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-fredoka font-bold text-3xl text-graphite mb-3">{cleaner?.full_name}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                      <Badge className="rounded-full font-fredoka text-base px-4 py-2 shadow-lg" style={{
                        background: cleaner?.tier === 'Elite' ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 
                                   cleaner?.tier === 'Pro' ? 'linear-gradient(135deg, #66B3FF, #00D4FF)' : 
                                   'linear-gradient(135deg, #818CF8, #6366F1)',
                        color: 'white',
                        border: '2px solid white'
                      }}>
                        {cleaner?.tier === 'Elite' ? '👑' : cleaner?.tier === 'Pro' ? '⭐' : '💫'} {cleaner?.tier}
                      </Badge>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-amber-300">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="font-fredoka font-bold text-xl text-graphite">{cleaner?.average_rating?.toFixed(1) || '5.0'}</span>
                        <span className="text-gray-600 font-verdana">({cleaner?.total_reviews || 0})</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border-2 border-blue-300">
                        <Briefcase className="w-5 h-5 text-puretask-blue" />
                        <span className="font-fredoka font-bold text-xl text-puretask-blue">{cleaner?.total_jobs || 0}</span>
                        <span className="text-gray-600 font-verdana">jobs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RELIABILITY SCORE - HIGHLIGHTED */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-xl border-4 border-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <p className="text-white font-verdana text-sm mb-1 opacity-90">Reliability Score</p>
                        <p className="text-6xl font-fredoka font-bold text-white drop-shadow-lg">
                          {cleaner?.reliability_score || 85}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-fredoka font-bold text-white mb-1">
                        {cleaner?.reliability_score >= 90 ? '🌟 Outstanding' : 
                         cleaner?.reliability_score >= 75 ? '✨ Excellent' : 
                         cleaner?.reliability_score >= 60 ? '👍 Good' : '📈 Developing'}
                      </p>
                      <p className="text-white opacity-90 font-verdana">Performance Rating</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                      <p className="text-2xl font-fredoka font-bold text-white">{cleaner?.attendance_rate || 100}%</p>
                      <p className="text-xs text-white/90 font-verdana">Attendance</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                      <p className="text-2xl font-fredoka font-bold text-white">{cleaner?.punctuality_rate || 100}%</p>
                      <p className="text-xs text-white/90 font-verdana">On-Time</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                      <p className="text-2xl font-fredoka font-bold text-white">{cleaner?.photo_compliance_rate || 100}%</p>
                      <p className="text-xs text-white/90 font-verdana">Photos</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                      <p className="text-2xl font-fredoka font-bold text-white">{cleaner?.communication_rate || 100}%</p>
                      <p className="text-xs text-white/90 font-verdana">Response</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Details - ENHANCED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-4 border-purple-300 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  Your Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                {/* DATE & TIME - HIGHLIGHTED */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 shadow-lg border-4 border-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <Calendar className="w-8 h-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-verdana text-sm mb-1 opacity-90">Scheduled For</p>
                      <p className="text-2xl font-fredoka font-bold text-white drop-shadow">
                        {new Date(bookingData?.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-lg px-3 py-1">
                          <Clock className="w-4 h-4 text-white" />
                          <span className="font-fredoka font-bold text-white">{bookingData?.time}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1">
                          <span className="font-fredoka font-bold text-white">{bookingData?.recommendedHours} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-5 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-md">
                    <MapPin className="w-6 h-6 text-puretask-blue mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-fredoka font-bold text-graphite mb-1">Address</p>
                      <p className="text-gray-700 font-verdana leading-relaxed">{bookingData?.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-5 bg-purple-50 rounded-xl border-2 border-purple-200 shadow-md">
                    <Home className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-fredoka font-bold text-graphite mb-1">Home Details</p>
                      <p className="text-gray-700 font-verdana">
                        {bookingData?.bedrooms} Bedrooms • {bookingData?.bathrooms} Baths
                      </p>
                      <p className="text-gray-700 font-verdana">{bookingData?.squareFeet} sq ft</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 shadow-md">
                  <Sparkles className="w-6 h-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-fredoka font-bold text-graphite mb-1">Service Type</p>
                    <Badge className="text-lg px-4 py-2 font-fredoka font-bold" style={{
                      background: bookingData?.serviceType === 'deep' ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' :
                                 bookingData?.serviceType === 'moveout' ? 'linear-gradient(135deg, #A855F7, #9333EA)' :
                                 'linear-gradient(135deg, #66B3FF, #00D4FF)',
                      color: 'white'
                    }}>
                      {bookingData?.serviceType === 'deep' ? '✨ Deep Clean' :
                       bookingData?.serviceType === 'moveout' ? '📦 Move-Out Clean' :
                       '🧹 Basic Clean'}
                    </Badge>
                  </div>
                </div>

                {/* ADDITIONAL SERVICES */}
                {Object.keys(addOns).length > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200 p-5 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-pink-600" />
                      <p className="font-fredoka font-bold text-xl text-graphite">Additional Services</p>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(addOns).map(([key, quantity]) => {
                        const price = cleaner?.additional_service_pricing?.[key] || 0;
                        const totalPrice = price * quantity;
                        return (
                          <div key={key} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-pink-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-fredoka font-bold text-lg">
                                {quantity}×
                              </div>
                              <span className="font-fredoka font-semibold text-graphite capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-fredoka font-bold text-pink-600">{totalPrice} credits</p>
                              <p className="text-sm text-gray-600 font-verdana">≈ ${(totalPrice / 10).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Price Breakdown - ENHANCED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-4 border-green-400 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  Estimated Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-green-200 shadow-sm">
                    <span className="text-lg font-verdana text-gray-700">Cleaning Service ({bookingData?.recommendedHours} hrs)</span>
                    <div className="text-right">
                      <p className="text-2xl font-fredoka font-bold text-green-600">{estimate.hourlyTotal}</p>
                      <p className="text-sm text-gray-600 font-verdana">credits</p>
                    </div>
                  </div>
                  
                  {estimate.addOnsTotal > 0 && (
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-purple-200 shadow-sm">
                      <span className="text-lg font-verdana text-gray-700">Additional Services</span>
                      <div className="text-right">
                        <p className="text-2xl font-fredoka font-bold text-purple-600">+{estimate.addOnsTotal}</p>
                        <p className="text-sm text-gray-600 font-verdana">credits</p>
                      </div>
                    </div>
                  )}

                  {/* TOTAL - HIGHLIGHTED */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl border-4 border-white mt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-verdana text-sm mb-1 opacity-90">Total Estimated Cost</p>
                        <p className="text-5xl font-fredoka font-bold text-white drop-shadow-lg">{estimate.credits}</p>
                        <p className="text-xl text-white font-verdana mt-2">≈ ${estimate.usd} USD</p>
                      </div>
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="mt-6 border-2 border-blue-300 bg-blue-50 rounded-xl">
                  <Info className="w-5 h-5 text-puretask-blue" />
                  <AlertDescription className="text-base font-verdana text-gray-700 leading-relaxed">
                    <strong>📍 Note:</strong> This is an estimate. Final payment will be based on actual hours worked (GPS tracked) + confirmed add-ons.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          {/* Special Requests - ENHANCED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-4 border-indigo-300 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  Special Requests & Guidelines
                </CardTitle>
                <p className="text-white/90 font-verdana text-sm mt-2">Optional: Add any specific instructions or notes for the cleaner</p>
              </CardHeader>
              <CardContent className="p-8">
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Examples:
• Please focus extra attention on the kitchen and bathrooms
• I have a friendly dog who loves attention
• Please use unscented products (allergies)
• The spare key is under the doormat
• Special instructions for parking..."
                  rows={6}
                  className="rounded-xl font-verdana border-2 border-indigo-200 focus:border-indigo-400 p-4 text-base resize-none"
                />
                <p className="text-sm text-gray-600 font-verdana mt-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  The cleaner will receive these notes before starting the job
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="rounded-full font-fredoka font-semibold border-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleSubmitRequest}
              disabled={submitting}
              size="lg"
              className="flex-1 brand-gradient text-white rounded-full font-fredoka font-bold shadow-xl py-6 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Booking Request to {cleaner?.full_name}
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <Alert className="border-2 border-amber-200 bg-amber-50 rounded-2xl">
            <Info className="w-5 h-5 text-amber-600" />
            <AlertDescription className="font-verdana text-gray-700">
              <strong>What happens next?</strong><br />
              Your request will be sent to {cleaner?.full_name}. They have 24 hours to accept or decline. You'll receive a notification either way. If accepted, you'll proceed to payment!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}