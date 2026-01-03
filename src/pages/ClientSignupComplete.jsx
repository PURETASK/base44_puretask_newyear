import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader2, Shield, MapPin, Home, Mail, Phone, User, Sparkles } from 'lucide-react';
import AddressAutocomplete from '../components/address/AddressAutocomplete';
import { motion } from 'framer-motion';
import { useAnalytics } from '../components/analytics/AnalyticsTracker';

export default function ClientSignupComplete() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    default_address: '',
    home_size: 'medium',
    bedrooms: '',
    bathrooms: '',
    sms_consent: true,
    email_consent: true,
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    trackEvent('client_profile_setup_started', {
      step: 1
    });
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Pre-fill with user data
      setFormData(prev => ({
        ...prev,
        full_name: currentUser.full_name || '',
        email: currentUser.email || ''
      }));

      trackEvent('client_profile_setup_user_loaded', {
        user_email: currentUser.email,
        has_completed_onboarding: currentUser.onboarding_completed
      });

      const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0 && currentUser.onboarding_completed) {
        trackEvent('client_profile_already_complete', {
          user_email: currentUser.email
        });
        navigate(createPageUrl('ClientDashboard'));
        return;
      }
    } catch (error) {
      trackEvent('client_profile_setup_error', {
        error_type: 'user_not_found',
        error_message: error.message
      });
      navigate(createPageUrl('ClientSignup'));
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.default_address || !formData.latitude || !formData.longitude) {
      alert('Please fill in all required fields, including a valid address selected from the suggestions.');

      trackEvent('client_profile_validation_failed', {
        user_email: user?.email,
        missing_fields: {
          full_name: !formData.full_name,
          email: !formData.email,
          phone: !formData.phone,
          address: !formData.default_address,
          coordinates: !formData.latitude || !formData.longitude
        }
      });

      setSubmitting(false);
      return;
    }

    try {
      trackEvent('client_profile_submit_started', {
        user_email: user.email,
        home_size: formData.home_size,
        sms_consent: formData.sms_consent,
        email_consent: formData.email_consent
      });

      // Update user profile
      await base44.auth.updateMe({
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: 'client',
        sms_consent: formData.sms_consent,
        onboarding_completed: true
      });

      // Create client profile
      await base44.entities.ClientProfile.create({
        user_email: user.email,
        default_address: formData.default_address,
        home_size: formData.home_size,
        credits_balance: 0,
        membership_tier: 'Standard',
        total_bookings: 0,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      // CRITICAL: Clear the cached user data so Layout re-fetches with correct user_type
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserTime');
      localStorage.removeItem(`userProfile_${user.email}`);
      
      // Set the profile cache to 'client'
      localStorage.setItem(`userProfile_${user.email}`, 'client');

      trackEvent('client_signup_success', {
        user_email: user.email,
        home_size: formData.home_size,
        sms_consent: formData.sms_consent,
        email_consent: formData.email_consent
      });

      // Check if there's a booking draft from Home page
      const bookingDraft = localStorage.getItem('bookingDraft');
      if (bookingDraft) {
        // Continue with booking flow
        navigate(createPageUrl('BookingAddOns'));
      } else {
        // No draft, go to browse cleaners
        navigate(createPageUrl('BrowseCleaners'));
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error completing signup:', showToast: false });

      trackEvent('client_profile_submit_error', {
        user_email: user?.email,
        error_message: error.message,
        error_type: 'submission_failed'
      });

      alert('Failed to complete signup. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cloud">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-gray-600 font-verdana">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
            Welcome to PureTask! 🎉
          </h1>
          <p className="text-lg text-gray-600 font-verdana">
            Let's set up your profile to find the perfect cleaner
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 py-8">
              <CardTitle className="text-center text-2xl font-fredoka font-bold text-white">
                Complete Your Profile
              </CardTitle>
              <p className="text-center text-white text-sm font-verdana opacity-90 mt-2">
                All fields marked with * are required
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-puretask-blue" />
                    </div>
                    <h3 className="text-xl font-fredoka font-bold text-graphite">Personal Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center gap-2 font-fredoka font-semibold text-graphite mb-2">
                        <User className="w-4 h-4" />
                        Full Name
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="font-verdana border-2 rounded-xl"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 font-fredoka font-semibold text-graphite mb-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        disabled
                        className="font-verdana border-2 rounded-xl bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1 font-verdana">
                        Email cannot be changed after signup
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 font-fredoka font-semibold text-graphite mb-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        required
                        className="font-verdana border-2 rounded-xl"
                      />
                      <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <Shield className="w-4 h-4 text-fresh-mint flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700 font-verdana">
                          <strong>Privacy:</strong> Your phone is used for booking confirmations and urgent updates. We never spam or share your information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Details Section */}
                <div className="border-t-2 border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-fredoka font-bold text-graphite">Home Details</h3>
                  </div>

                  {/* Address */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 font-fredoka font-semibold text-graphite mb-2">
                      <MapPin className="w-4 h-4" />
                      Home Address
                      <span className="text-red-500">*</span>
                    </label>
                    <AddressAutocomplete
                      value={formData.default_address}
                      onChange={(address, location) => {
                        setFormData({
                          ...formData,
                          default_address: address,
                          latitude: location?.latitude !== undefined ? location.latitude : formData.latitude,
                          longitude: location?.longitude !== undefined ? location.longitude : formData.longitude,
                        });
                      }}
                      onLocationSelect={(location) => {
                        setFormData({
                          ...formData,
                          default_address: location.address,
                          latitude: location.latitude,
                          longitude: location.longitude
                        });
                      }}
                      placeholder="Start typing your address..."
                      required
                    />
                    <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <MapPin className="w-4 h-4 text-puretask-blue flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700 font-verdana">
                        <strong>GPS Verified:</strong> Your address helps us match you with nearby cleaners and verify service completion via GPS.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Home Size */}
                    <div>
                      <label className="font-fredoka font-semibold text-graphite mb-2 block">
                        Home Size
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.home_size}
                        onChange={(e) => setFormData({ ...formData, home_size: e.target.value })}
                        className="w-full rounded-xl font-verdana border-2 px-4 py-2"
                        required
                      >
                        <option value="small">Small (&lt;1,000 sq ft)</option>
                        <option value="medium">Medium (1,000-2,000 sq ft)</option>
                        <option value="large">Large (&gt;2,000 sq ft)</option>
                      </select>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <label className="font-fredoka font-semibold text-graphite mb-2 block">
                        Bedrooms
                      </label>
                      <select
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full rounded-xl font-verdana border-2 px-4 py-2"
                      >
                        <option value="">Select</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5+">5+ Bedrooms</option>
                      </select>
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="font-fredoka font-semibold text-graphite mb-2 block">
                        Bathrooms
                      </label>
                      <select
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        className="w-full rounded-xl font-verdana border-2 px-4 py-2"
                      >
                        <option value="">Select</option>
                        <option value="1">1 Bathroom</option>
                        <option value="1.5">1.5 Bathrooms</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="2.5">2.5 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                        <option value="3.5">3.5 Bathrooms</option>
                        <option value="4+">4+ Bathrooms</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 font-verdana">
                    💡 <strong>Why we ask:</strong> This helps us provide accurate pricing estimates and recommend appropriate cleaning times.
                  </p>
                </div>

                {/* Notifications Section */}
                <div className="border-t-2 border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-fredoka font-bold text-graphite">Communication Preferences</h3>
                  </div>

                  <div className="space-y-4">
                    {/* SMS Consent */}
                    <div className="p-4 rounded-xl border-2 transition-all" style={{
                      backgroundColor: formData.sms_consent ? '#DBEAFE' : '#F9FAFB',
                      borderColor: formData.sms_consent ? '#93C5FD' : '#E5E7EB'
                    }}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="sms_consent"
                          checked={formData.sms_consent}
                          onChange={(e) => setFormData({ ...formData, sms_consent: e.target.checked })}
                          className="mt-1 w-5 h-5 rounded border-2 cursor-pointer"
                        />
                        <label htmlFor="sms_consent" className="cursor-pointer font-verdana text-sm text-graphite flex-1">
                          <strong className="text-base">📱 SMS Notifications</strong>
                          <p className="mt-1 text-gray-600">
                            Receive text messages for booking confirmations, cleaner on-the-way alerts, and completion notices. Standard message rates may apply.
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Email Consent */}
                    <div className="p-4 rounded-xl border-2 transition-all" style={{
                      backgroundColor: formData.email_consent ? '#DBEAFE' : '#F9FAFB',
                      borderColor: formData.email_consent ? '#93C5FD' : '#E5E7EB'
                    }}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="email_consent"
                          checked={formData.email_consent}
                          onChange={(e) => setFormData({ ...formData, email_consent: e.target.checked })}
                          className="mt-1 w-5 h-5 rounded border-2 cursor-pointer"
                        />
                        <label htmlFor="email_consent" className="cursor-pointer font-verdana text-sm text-graphite flex-1">
                          <strong className="text-base">✉️ Email Notifications</strong>
                          <p className="mt-1 text-gray-600">
                            Receive email confirmations, receipts, and important updates about your bookings and account.
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4 font-verdana text-center">
                    You can update your preferences anytime in your profile settings
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full py-6 text-xl rounded-2xl font-fredoka font-bold text-white shadow-xl hover:shadow-2xl transition-all"
                    style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Setting Up Your Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Complete Setup & Start Booking
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-4 font-verdana">
                    By completing signup, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </form>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-gray-600 font-verdana text-sm">
            <Shield className="w-5 h-5 text-fresh-mint" />
            <span>Verified Cleaners</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 font-verdana text-sm">
            <CheckCircle className="w-5 h-5 text-puretask-blue" />
            <span>GPS Tracking</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 font-verdana text-sm">
            <MapPin className="w-5 h-5 text-purple-500" />
            <span>Photo Proof Required</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}