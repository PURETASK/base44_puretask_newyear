import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { rateLimiter, RateLimitPresets } from '@/lib/rateLimiter';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Clock, DollarSign, User, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskSelector from '../components/booking/TaskSelector';
import CalendarBooking from '../components/booking/CalendarBooking';
import AddressAutocomplete from '../components/address/AddressAutocomplete';
import AdditionalServicesSelector from '../components/booking/AdditionalServicesSelector';
import BundleOffers from '../components/booking/BundleOffers';
import InsufficientCreditsDialog from '../components/booking/InsufficientCreditsDialog';
import StickyPriceSummary from '../components/booking/StickyPriceSummary';
import AutoSaveIndicator from '../components/booking/AutoSaveIndicator';
import ValidationMessage from '../components/booking/ValidationMessage';
import CopyLastBookingButton from '../components/booking/CopyLastBookingButton';
import { creditsToUSD } from '../components/credits/CreditCalculator';
import { toast } from 'sonner';

const STEPS = ['Service', 'Date & Time', 'Details', 'Review'];

export default function BookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const cleanerEmail = searchParams.get('cleaner');

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cleaner, setCleaner] = useState(null);
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [appliedBundle, setAppliedBundle] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [bookingData, setBookingData] = useState({
    cleaning_type: '',
    date: '',
    start_time: '',
    hours: 3,
    address: '',
    latitude: null,
    longitude: null,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1200,
    home_type: 'apartment',
    has_pets: false,
    parking_instructions: '',
    entry_instructions: '',
    product_preferences: '',
    product_allergies: '',
    additional_services: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (user && bookingData.cleaning_type) {
        setIsSaving(true);
        localStorage.setItem('bookingDraft', JSON.stringify({
          ...bookingData,
          cleanerEmail,
          lastSaved: new Date().toISOString()
        }));
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
        }, 300);
      }
    }, 1000); // Auto-save 1 second after last change

    return () => clearTimeout(saveTimer);
  }, [bookingData, user, cleanerEmail]);

  useEffect(() => {
    // Load bookingDraft when component mounts or when returning to this page
    const loadDraft = () => {
      const draftStr = localStorage.getItem('bookingDraft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        setBookingData(prev => ({
          ...prev,
          ...draft,
          cleanerEmail: undefined // Remove this field
        }));
        // Start at step 1 (Date & Time) after returning from add-ons
        if (draft.cleaning_type && draft.additional_services && !draft.date) {
          setCurrentStep(1);
        }
      }
    };
    
    loadDraft();
    
    // Also reload when window gains focus (user returns from another page)
    window.addEventListener('focus', loadDraft);
    return () => window.removeEventListener('focus', loadDraft);
  }, [location]);

  const loadData = async () => {
    try {
      if (!cleanerEmail) {
        navigate(createPageUrl('BrowseCleaners'));
        return;
      }

      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'client') {
        navigate(createPageUrl('RoleSelection'));
        return;
      }
      setUser(currentUser);

      const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
        if (profiles[0].default_address) {
          setBookingData(prev => ({ ...prev, address: profiles[0].default_address }));
        }
      }

      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
      if (cleanerProfiles.length > 0) {
        setCleaner(cleanerProfiles[0]);
      } else {
        navigate(createPageUrl('BrowseCleaners'));
        return;
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading booking data:', showToast: false });
      toast.error('Failed to load booking data');
    }
    setLoading(false);
  };

  const calculateEstimate = () => {
    if (!bookingData.cleaning_type || !bookingData.hours || !cleaner) {
      return { credits: 0, usd: 0, baseRate: 0, addonRate: 0, totalRate: 0, additionalServicesCredits: 0, bundleDiscount: 0, finalCredits: 0, hourlyCredits: 0, finalUSD: 0 };
    }

    const baseRate = cleaner.base_rate_credits_per_hour || 25;
    let addonRate = 0;

    if (bookingData.cleaning_type === 'deep') {
      addonRate = cleaner.deep_addon_credits_per_hour || 30;
    } else if (bookingData.cleaning_type === 'moveout') {
      addonRate = cleaner.moveout_addon_credits_per_hour || 50;
    }

    const totalRate = baseRate + addonRate;
    const hourlyCredits = totalRate * bookingData.hours;

    let additionalServicesCredits = 0;
    if (bookingData.additional_services && Object.keys(bookingData.additional_services).length > 0) {
      Object.keys(bookingData.additional_services).forEach(serviceKey => {
        const quantity = bookingData.additional_services[serviceKey];
        if (quantity > 0) {
          const price = cleaner?.additional_service_pricing?.[serviceKey] || 0;
          additionalServicesCredits += quantity * price;
        }
      });
    }

    const subtotalCredits = hourlyCredits + additionalServicesCredits;
    const bundleDiscount = appliedBundle?.discountCredits || 0;
    const finalCredits = Math.max(0, subtotalCredits - bundleDiscount);

    return {
      credits: Math.round(subtotalCredits),
      usd: creditsToUSD(subtotalCredits),
      baseRate,
      addonRate,
      totalRate,
      hourlyCredits: Math.round(hourlyCredits),
      additionalServicesCredits: Math.round(additionalServicesCredits),
      bundleDiscount: Math.round(bundleDiscount),
      finalCredits: Math.round(finalCredits),
      finalUSD: creditsToUSD(finalCredits)
    };
  };

  const validateStep = () => {
    const errors = {};
    
    switch (currentStep) {
      case 0:
        if (!bookingData.cleaning_type) {
          errors.cleaning_type = 'Please select a cleaning type';
        }
        break;
      case 1:
        if (!bookingData.date) {
          errors.date = 'Please select a date';
        }
        if (!bookingData.start_time) {
          errors.start_time = 'Please select a time';
        }
        break;
      case 2:
        if (!bookingData.address) {
          errors.address = 'Address is required';
        }
        if (!bookingData.hours || bookingData.hours < 2) {
          errors.hours = 'Minimum 2 hours required';
        }
        break;
      case 3:
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return bookingData.cleaning_type !== '';
      case 1:
        return bookingData.date && bookingData.start_time;
      case 2:
        return bookingData.address && bookingData.hours > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (canProceed()) {
      if (currentStep === 0) {
        // After selecting cleaning type, go to BookingAddOns page
        localStorage.setItem('bookingDraft', JSON.stringify({
          ...bookingData,
          cleanerEmail
        }));
        navigate(createPageUrl(`BookingAddOns?cleaner=${cleanerEmail}`));
      } else if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        setValidationErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const estimate = calculateEstimate();
    const clientBalance = clientProfile?.credits_balance || 0;

    if (clientBalance < estimate.finalCredits) {
      setShowInsufficientCredits(true);
      return;
    }

    setSubmitting(true);
    try {
      // Apply rate limiting (3 attempts per minute)
      await rateLimiter.attempt(
        `booking:${user.email}`,
        async () => {
          const newBooking = await base44.entities.Booking.create({
            client_email: user.email,
            cleaner_email: cleanerEmail,
            cleaning_type: bookingData.cleaning_type,
            date: bookingData.date,
            start_time: bookingData.start_time,
            hours: bookingData.hours,
            estimated_hours: bookingData.hours,
            address: bookingData.address,
            latitude: bookingData.latitude,
            longitude: bookingData.longitude,
            bedrooms: bookingData.bedrooms,
            bathrooms: bookingData.bathrooms,
            square_feet: bookingData.square_feet,
            home_type: bookingData.home_type,
            has_pets: bookingData.has_pets,
            parking_instructions: bookingData.parking_instructions,
            entry_instructions: bookingData.entry_instructions,
            product_preferences: bookingData.product_preferences,
            product_allergies: bookingData.product_allergies,
            additional_services: bookingData.additional_services,
            additional_services_cost_credits: estimate.additionalServicesCredits,
            snapshot_additional_service_prices: cleaner.additional_service_pricing || {},
            total_price: estimate.finalUSD,
            snapshot_base_rate_cph: estimate.baseRate,
            snapshot_selected_addon_cph: estimate.addonRate,
            snapshot_total_rate_cph: estimate.totalRate,
            escrow_credits_reserved: estimate.finalCredits,
            payout_percentage_at_accept: cleaner.payout_percentage || 0.80,
            status: 'created'
          });

          navigate(createPageUrl(`PaymentCheckout?booking=${newBooking.id}`));
        },
        {
          ...RateLimitPresets.BOOKING,
          onRateLimited: (result) => {
            toast.error(`Too many booking attempts. Please wait ${result.retryAfter} seconds before trying again.`);
          }
        }
      );
    } catch (error) {
      if (error.rateLimitInfo) {
        // Already handled by onRateLimited callback
        return;
      }
      handleError(error, {
        userMessage: 'Failed to create booking',
        context: { page: 'BookingFlow' }
      });
      toast.error('Failed to create booking');
    }
    setSubmitting(false);
  };

  const estimate = calculateEstimate();

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Book Your Cleaning</h1>
              <p className="text-lg text-gray-600 font-verdana">Complete your booking with {cleaner?.full_name}</p>
            </div>

            <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  {STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-fredoka font-bold transition-all ${
                        idx <= currentStep ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/20 text-white/60'
                      }`}>
                        {idx < currentStep ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 transition-all ${
                          idx < currentStep ? 'bg-white' : 'bg-white/20'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {STEPS.map((step, idx) => (
                    <p key={idx} className={`text-sm font-fredoka transition-all ${
                      idx <= currentStep ? 'text-white font-semibold' : 'text-white/60'
                    }`}>
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            </Card>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <Card className="mb-8 border-0 shadow-lg rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                      <CardTitle className="font-fredoka text-graphite">Select Cleaning Type</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <TaskSelector
                        selectedType={bookingData.cleaning_type}
                        onSelectType={(type) => setBookingData(prev => ({ ...prev, cleaning_type: type }))}
                        cleaner={cleaner}
                      />
                      <ValidationMessage show={validationErrors.cleaning_type} message={validationErrors.cleaning_type} />
                    </CardContent>
                  </Card>
                )}

                {currentStep === 1 && (
                  <div className="mb-8">
                    <CalendarBooking
                      cleaner={cleaner}
                      selectedDate={bookingData.date}
                      selectedTime={bookingData.start_time}
                      onDateSelect={(date) => setBookingData(prev => ({ ...prev, date }))}
                      onTimeSelect={(time) => setBookingData(prev => ({ ...prev, start_time: time }))}
                    />
                    <ValidationMessage show={validationErrors.date} message={validationErrors.date} />
                    <ValidationMessage show={validationErrors.start_time} message={validationErrors.start_time} />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg rounded-2xl">
                      <CardHeader className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-cyan-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="font-fredoka text-white text-2xl">Essential Details</CardTitle>
                            <p className="text-white/90 font-verdana text-sm mt-1">Property basics and timing</p>
                          </div>
                          {user && (
                            <CopyLastBookingButton
                              userEmail={user.email}
                              onCopy={(data) => setBookingData(prev => ({ ...prev, ...data }))}
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <AddressAutocomplete
                              value={bookingData.address}
                              onChange={(address) => {
                                setBookingData(prev => ({
                                  ...prev,
                                  address,
                                  latitude: null,
                                  longitude: null
                                }));
                              }}
                              onLocationSelect={(location) => {
                                setBookingData(prev => ({
                                  ...prev,
                                  address: location.address,
                                  latitude: location.latitude,
                                  longitude: location.longitude
                                }));
                              }}
                              placeholder="Start typing your address..."
                              label="Address *"
                              required
                            />
                            {bookingData.latitude && bookingData.longitude && (
                              <div className="flex items-center gap-2 text-sm text-green-600 font-verdana mt-2">
                                <CheckCircle className="w-4 h-4" />
                                Address verified ✓
                              </div>
                            )}
                            <ValidationMessage show={validationErrors.address} message={validationErrors.address} />
                          </div>

                          <div>
                            <label className="block text-sm font-fredoka font-medium text-graphite mb-2">Estimated Hours</label>
                            <select
                              value={bookingData.hours}
                              onChange={(e) => setBookingData(prev => ({ ...prev, hours: parseInt(e.target.value) }))}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2 font-verdana focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {[2, 3, 4, 5, 6, 8].map(h => (
                                <option key={h} value={h}>{h} hours</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-fredoka font-medium text-graphite mb-2">Home Type</label>
                          <select
                            value={bookingData.home_type}
                            onChange={(e) => setBookingData(prev => ({ ...prev, home_type: e.target.value }))}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 font-verdana focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="condo">Condo</option>
                            <option value="townhouse">Townhouse</option>
                            <option value="office">Office</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-fredoka font-medium text-graphite mb-2">Bedrooms</label>
                          <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setBookingData(prev => ({ ...prev, bedrooms: n }))}
                                className={`px-4 py-2 rounded-full font-fredoka font-semibold transition-all ${
                                  bookingData.bedrooms === n
                                    ? 'bg-puretask-blue text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-fredoka font-medium text-graphite mb-2">Bathrooms</label>
                          <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setBookingData(prev => ({ ...prev, bathrooms: n }))}
                                className={`px-4 py-2 rounded-full font-fredoka font-semibold transition-all ${
                                  bookingData.bathrooms === n
                                    ? 'bg-puretask-blue text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-fredoka font-medium text-graphite mb-2">Square Feet</label>
                          <select
                            value={bookingData.square_feet}
                            onChange={(e) => setBookingData(prev => ({ ...prev, square_feet: parseInt(e.target.value) }))}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 font-verdana focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="500">500 sq ft</option>
                            <option value="750">750 sq ft</option>
                            <option value="1000">1,000 sq ft</option>
                            <option value="1200">1,200 sq ft</option>
                            <option value="1500">1,500 sq ft</option>
                            <option value="1800">1,800 sq ft</option>
                            <option value="2000">2,000 sq ft</option>
                            <option value="2500">2,500 sq ft</option>
                            <option value="3000">3,000 sq ft</option>
                            <option value="3500">3,500 sq ft</option>
                            <option value="4000">4,000 sq ft</option>
                            <option value="5000">5,000+ sq ft</option>
                          </select>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bookingData.has_pets}
                              onChange={(e) => setBookingData(prev => ({ ...prev, has_pets: e.target.checked }))}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-fredoka font-medium text-graphite">🐾 I have pets</span>
                          </label>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Optional Details - Collapsible */}
                    <Card className="border-0 shadow-lg rounded-2xl">
                      <CardHeader 
                        className="rounded-t-2xl bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
                        onClick={() => setBookingData(prev => ({ ...prev, showOptional: !prev.showOptional }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="font-fredoka text-graphite">Access & Preferences</CardTitle>
                            <p className="text-sm text-gray-600 font-verdana mt-1">Optional details (click to expand)</p>
                          </div>
                          <motion.div
                            animate={{ rotate: bookingData.showOptional ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
                          </motion.div>
                        </div>
                      </CardHeader>
                      <AnimatePresence>
                        {bookingData.showOptional && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent className="p-6 space-y-4">
                              <div>
                                <label className="block text-sm font-fredoka font-medium text-graphite mb-2">
                                  🅿️ Parking Instructions
                                </label>
                                <textarea
                                  value={bookingData.parking_instructions}
                                  onChange={(e) => setBookingData(prev => ({ ...prev, parking_instructions: e.target.value }))}
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-verdana focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  rows="2"
                                  placeholder="e.g., Street parking in front, guest parking in lot B..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-fredoka font-medium text-graphite mb-2">
                                  🚪 Entry Instructions
                                </label>
                                <textarea
                                  value={bookingData.entry_instructions}
                                  onChange={(e) => setBookingData(prev => ({ ...prev, entry_instructions: e.target.value }))}
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-verdana focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  rows="2"
                                  placeholder="e.g., Key under mat, ring doorbell, lockbox code 1234..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-fredoka font-medium text-graphite mb-2">
                                  🧴 Product Preferences
                                </label>
                                <textarea
                                  value={bookingData.product_preferences}
                                  onChange={(e) => setBookingData(prev => ({ ...prev, product_preferences: e.target.value }))}
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-verdana focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  rows="2"
                                  placeholder="e.g., Please use eco-friendly products, avoid strong scents..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-fredoka font-medium text-graphite mb-2">
                                  ⚠️ Allergies
                                </label>
                                <textarea
                                  value={bookingData.product_allergies}
                                  onChange={(e) => setBookingData(prev => ({ ...prev, product_allergies: e.target.value }))}
                                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-verdana focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  rows="2"
                                  placeholder="e.g., Allergic to bleach, ammonia..."
                                />
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                <Card className="mb-8 border-0 shadow-lg rounded-2xl">
                  <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(to right, #0095FF, #00D4FF)' }}>
                    <CardTitle className="font-fredoka text-white">Review & Confirm</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-5 rounded-2xl border-2 border-puretask-blue shadow-md" style={{ background: 'linear-gradient(to right, rgba(0, 149, 255, 0.1), rgba(0, 212, 255, 0.1))' }}>
                        <User className="w-6 h-6 text-puretask-blue mt-1" />
                        <div>
                          <p className="font-fredoka font-bold text-graphite text-lg">Cleaner</p>
                          <p className="text-graphite font-verdana font-semibold text-base">{cleaner?.full_name}</p>
                          <Badge className={`mt-2 ${
                            cleaner?.tier === 'Elite' ? 'bg-amber-100 text-amber-700' :
                            cleaner?.tier === 'Pro' ? 'bg-blue-100 text-puretask-blue' :
                            'bg-gray-100 text-gray-700'
                          } border rounded-full font-fredoka`}>
                            {cleaner?.tier}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-5 rounded-2xl border-2 border-puretask-blue shadow-md" style={{ background: 'linear-gradient(to right, rgba(0, 149, 255, 0.1), rgba(0, 212, 255, 0.1))' }}>
                        <CheckCircle className="w-6 h-6 text-puretask-blue mt-1" />
                        <div>
                          <p className="font-fredoka font-bold text-graphite text-lg">Service</p>
                          <p className="text-graphite font-verdana font-semibold text-base capitalize">{bookingData.cleaning_type} Cleaning</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-5 rounded-2xl border-2 border-puretask-blue shadow-md" style={{ background: 'linear-gradient(to right, rgba(0, 149, 255, 0.1), rgba(0, 212, 255, 0.1))' }}>
                        <Calendar className="w-6 h-6 text-puretask-blue mt-1" />
                        <div>
                          <p className="font-fredoka font-bold text-graphite text-lg">Date & Time</p>
                          <p className="text-graphite font-verdana font-semibold">
                            {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-graphite font-verdana font-semibold">{bookingData.start_time} • {bookingData.hours} hours (estimated)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-6 rounded-2xl border-4 shadow-lg" style={{ borderColor: '#0095FF', background: 'linear-gradient(to right, rgba(0, 149, 255, 0.15), rgba(0, 212, 255, 0.15))' }}>
                        <MapPin className="w-7 h-7 text-puretask-blue mt-1" />
                        <div>
                          <p className="font-fredoka font-bold text-graphite text-xl mb-1">Address</p>
                          <p className="text-graphite font-verdana font-semibold text-base">{bookingData.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                        <DollarSign className="w-5 h-5 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-fredoka font-semibold text-graphite mb-2">Total Estimate</p>
                          {estimate.bundleDiscount > 0 && (
                            <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-xl">
                              <p className="text-sm font-fredoka font-semibold text-green-800 mb-1">
                                🎉 Bundle Discount Applied!
                              </p>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-verdana">Original:</span>
                                <span className="text-gray-500 line-through font-verdana">{estimate.credits} credits</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-verdana">Discount:</span>
                                <span className="text-green-700 font-fredoka font-bold">-{estimate.bundleDiscount} credits</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-fredoka font-bold text-purple-600">{estimate.finalCredits}</p>
                            <p className="text-gray-600 font-verdana">credits</p>
                          </div>
                          <p className="text-sm text-gray-600 font-verdana mt-1">≈ ${estimate.finalUSD.toFixed(2)}</p>
                          
                          <div className="mt-3 space-y-1 text-sm font-verdana">
                            <div className="flex justify-between text-gray-600">
                              <span>Base rate:</span>
                              <span>{estimate.baseRate} credits/hr</span>
                            </div>
                            {estimate.addonRate > 0 && (
                              <div className="flex justify-between text-gray-600">
                                <span>Service add-on:</span>
                                <span>+{estimate.addonRate} credits/hr</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                              <span>Hourly charges ({bookingData.hours}h):</span>
                              <span>{estimate.hourlyCredits} credits</span>
                            </div>
                            
                            {bookingData.additional_services && Object.keys(bookingData.additional_services).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-gray-700 font-semibold mb-1">Add-On Services:</p>
                                {Object.keys(bookingData.additional_services)
                                  .filter(serviceKey => bookingData.additional_services[serviceKey] > 0)
                                  .map(serviceKey => {
                                    const quantity = bookingData.additional_services[serviceKey];
                                    const price = cleaner?.additional_service_pricing?.[serviceKey] || 0;
                                    const serviceNames = {
                                      windows: 'Windows',
                                      blinds: 'Blinds',
                                      oven: 'Oven',
                                      refrigerator: 'Refrigerator',
                                      light_fixtures: 'Light Fixtures',
                                      inside_cabinets: 'Inside Cabinets',
                                      baseboards: 'Baseboards',
                                      laundry: 'Laundry'
                                    };
                                    const lineTotal = price * quantity;
                                    return (
                                      <div key={serviceKey} className="flex justify-between text-gray-600 text-xs ml-2">
                                        <span>{serviceNames[serviceKey]} x{quantity} @ {price} credits</span>
                                        <span className="font-semibold">+{lineTotal} credits</span>
                                      </div>
                                    );
                                  })}
                                <div className="flex justify-between text-gray-700 font-semibold mt-1">
                                  <span>Add-ons subtotal:</span>
                                  <span>+{estimate.additionalServicesCredits} credits</span>
                                </div>
                              </div>
                            )}
                            
                            {estimate.bundleDiscount > 0 && (
                              <div className="flex justify-between text-green-700 font-semibold">
                                <span>Bundle discount:</span>
                                <span>-{estimate.bundleDiscount} credits</span>
                              </div>
                            )}
                            <div className="flex justify-between font-fredoka font-semibold text-graphite pt-2 border-t border-gray-300">
                              <span>Total:</span>
                              <span>{estimate.finalCredits} credits</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
                      <AlertDescription className="text-sm text-blue-900 font-verdana">
                        Your payment will be held in escrow until you approve the completed work. 
                        You'll be charged for actual hours worked (calculated from clock-in/out times) plus selected additional services.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                    <BundleOffers
                      bookingData={bookingData}
                      totalCredits={estimate.credits}
                      onApplyBundle={setAppliedBundle}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between gap-4">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0 || submitting}
                variant="outline"
                size="lg"
                className="rounded-full font-fredoka font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  size="lg"
                  className="brand-gradient text-white rounded-full font-fredoka font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                  className="brand-gradient text-white rounded-full font-fredoka font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sticky Price Summary - Right Side */}
          <div className="hidden lg:block lg:col-span-1">
            <StickyPriceSummary
              estimate={estimate}
              bookingData={bookingData}
              cleaner={cleaner}
              showWarning={clientProfile && clientProfile.credits_balance < estimate.finalCredits}
            />
          </div>
        </div>
      </div>

      <InsufficientCreditsDialog
        open={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
        required={estimate.finalCredits}
        current={clientProfile?.credits_balance || 0}
      />

      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
    </div>
  );
}