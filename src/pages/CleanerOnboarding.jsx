import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Camera, Clock, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TermsOfService from '../components/terms/TermsOfService';
import { initiateKYCVerification, initiateBackgroundCheck } from '../components/verification/VerificationService';
import { validatePhone, validateHourlyRate, sanitizeString } from '../components/utils/validation';
import LocationRecommender from '../components/address/LocationRecommender';
import { useAnalytics } from '../components/analytics/AnalyticsTracker';

const SERVICE_TAGS = [
  'Standard Clean', 'Deep Clean', 'Eco Supplies', 'Kitchen',
  'Bathroom', 'Laundry', 'Windows', 'Organizing', 'Fridge',
  'Oven', 'Carpets', 'Move In/Out'
];

const ADDITIONAL_SERVICES = [
  { key: 'windows', label: 'Windows', unit: 'per window', min: 20, max: 50 },
  { key: 'blinds', label: 'Blinds', unit: 'per set', min: 15, max: 40 },
  { key: 'oven', label: 'Oven Deep Clean', unit: 'per oven', min: 30, max: 80 },
  { key: 'refrigerator', label: 'Refrigerator Deep Clean', unit: 'per fridge', min: 30, max: 80 },
  { key: 'light_fixtures', label: 'Light Fixtures', unit: 'per fixture', min: 10, max: 30 },
  { key: 'inside_cabinets', label: 'Inside Cabinets', unit: 'per section', min: 20, max: 60 },
  { key: 'baseboards', label: 'Baseboards', unit: 'per home', min: 30, max: 80 },
  { key: 'laundry', label: 'Laundry Service', unit: 'per load', min: 20, max: 50 }
];

const AVAILABILITY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const COMMON_LOCATIONS = [
  'Sacramento', 'Elk Grove', 'Roseville', 'Folsom', 'Davis',
  'Rancho Cordova', 'Citrus Heights', 'Rocklin', 'West Sacramento', 'Natomas',
  'Land Park', 'Midtown', 'Downtown', 'East Sacramento', 'Arden-Arcade',
  'Fair Oaks', 'Carmichael', 'Orangevale', 'Granite Bay', 'Lincoln'
];

const PRODUCT_PREFERENCES = [
  { value: 'standard', label: 'Standard Cleaning Products', description: 'Effective, affordable cleaning supplies' },
  { value: 'eco-friendly', label: 'Eco-Friendly Products', description: 'Environmentally conscious, natural cleaners' },
  { value: 'professional-grade', label: 'Professional-Grade Products', description: 'Commercial-quality cleaning supplies' },
  { value: 'premium-eco', label: 'Top-tier Eco-Luxury', description: 'Top-tier eco-friendly and specialized products' }
];

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    hourly_rate: '', // Stored as string from input
    service_tags: [],
    service_locations: [],
    availability: [],
    background_check_consent: false,
    sms_consent: false,
    product_preference: 'standard',
    additional_services: {}, // { service_name: price_in_credits }
    deep_addon_rate: 2, // Default addon rates in credits (1:1 with USD)
    moveout_addon_rate: 5
  });

  const [uploads, setUploads] = useState({
    id_front: null,
    id_back: null,
    selfie: null,
    profile_photo: null,
    insurance_certificate: null,
    product_photos: []
  });

  useEffect(() => {
    trackEvent('cleaner_onboarding_started', {
      step: 1
    });
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      trackEvent('cleaner_onboarding_user_loaded', {
        user_email: currentUser.email,
        onboarding_completed: currentUser.onboarding_completed
      });

      if (currentUser.onboarding_completed) {
        const profiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
        if (profiles.length > 0) {
          trackEvent('cleaner_onboarding_already_complete', {
            user_email: currentUser.email
          });
          navigate(createPageUrl('CleanerDashboard'));
          return;
        }
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
      setError('Please log in first');

      trackEvent('cleaner_onboarding_error', {
        error_type: 'user_not_found',
        error_message: error.message
      });

      setTimeout(() => navigate(createPageUrl('CleanerSignup')), 2000);
    }
  };

  const handleFileUpload = async (field, file) => {
    setLoading(true);
    setError('');
    try {
      trackEvent('cleaner_file_upload_started', {
        user_email: user?.email,
        field,
        file_size: file.size
      });

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploads(prev => ({ ...prev, [field]: file_url }));

      trackEvent('cleaner_file_upload_success', {
        user_email: user?.email,
        field
      });
    } catch (err) {
      setError('Failed to upload file. Please try again.');

      trackEvent('cleaner_file_upload_error', {
        user_email: user?.email,
        field,
        error_message: err.message
      });
    }
    setLoading(false);
  };

  const handleProductPhotoUpload = async (file) => {
    setLoading(true);
    setError('');
    try {
      trackEvent('cleaner_product_photo_upload_started', {
        user_email: user?.email,
        file_name: file.name,
        file_size: file.size
      });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploads(prev => ({
        ...prev,
        product_photos: [...prev.product_photos, file_url]
      }));
      trackEvent('cleaner_product_photo_upload_success', {
        user_email: user?.email,
        file_url: file_url
      });
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      trackEvent('cleaner_product_photo_upload_error', {
        user_email: user?.email,
        error_message: err.message
      });
    }
    setLoading(false);
  };

  const removeProductPhoto = (index) => {
    setUploads(prev => ({
      ...prev,
      product_photos: prev.product_photos.filter((_, i) => i !== index)
    }));
    trackEvent('cleaner_product_photo_removed', {
      user_email: user?.email,
      index: index
    });
  };

  const toggleServiceTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      service_tags: prev.service_tags.includes(tag)
        ? prev.service_tags.filter(t => t !== tag)
        : [...prev.service_tags, tag]
    }));
  };

  const toggleLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      service_locations: prev.service_locations.includes(location)
        ? prev.service_locations.filter(l => l !== location)
        : [...prev.service_locations, location]
    }));
  };

  const updateAvailability = (day, field, value) => {
    setFormData(prev => {
      const existing = prev.availability.find(a => a.day === day);
      if (existing) {
        return {
          ...prev,
          availability: prev.availability.map(a =>
            a.day === day ? { ...a, [field]: value } : a
          )
        };
      } else {
        return {
          ...prev,
          availability: [
            ...prev.availability,
            {
              day,
              available: field === 'available' ? value : true,
              start_time: field === 'start_time' ? value : '',
              end_time: field === 'end_time' ? value : ''
            }
          ]
        };
      }
    });
  };

  const copyToAllDays = () => {
    const mondayAvail = formData.availability.find(a => a.day === AVAILABILITY_DAYS[0]);

    if (!mondayAvail || mondayAvail.available === false || !mondayAvail.start_time || !mondayAvail.end_time) {
      setError('Please set an available time slot (start and end time) for Monday first to copy.');
      trackEvent('cleaner_availability_copy_failed', {
        user_email: user?.email,
        reason: 'monday_not_set'
      });
      return;
    }
    setError('');

    const allDays = AVAILABILITY_DAYS.map(day => ({
      day,
      available: mondayAvail.available,
      start_time: mondayAvail.start_time,
      end_time: mondayAvail.end_time
    }));

    setFormData(prev => ({ ...prev, availability: allDays }));
    trackEvent('cleaner_availability_copied_to_all_days', {
      user_email: user?.email,
      monday_availability: mondayAvail
    });
  };

  const clearAllDays = () => {
    setFormData(prev => ({ ...prev, availability: [] }));
    trackEvent('cleaner_availability_cleared_all_days', {
      user_email: user?.email
    });
  };

  useEffect(() => {
  if (step > 1) {
    trackEvent('cleaner_onboarding_step_complete', {
      user_email: user?.email,
      step: step - 1,
      total_steps: 7
    });
  }
  trackEvent('cleaner_onboarding_step_entered', {
    user_email: user?.email,
    step: step
  });
  }, [step, user?.email, trackEvent]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    trackEvent('cleaner_onboarding_submit_started', {
      user_email: user?.email,
      hourly_rate: formData.hourly_rate,
      service_tags_count: formData.service_tags.length,
      service_locations_count: formData.service_locations.length,
      availability_count: formData.availability.length,
      product_preference: formData.product_preference
    });

    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      trackEvent('cleaner_onboarding_validation_failed', {
        user_email: user?.email,
        field: 'phone',
        value: formData.phone
      });
      setLoading(false);
      return;
    }

    // Validate rate is within Developing tier range (1:1 credit system)
    const rateCredits = parseInt(formData.hourly_rate);
    if (isNaN(rateCredits) || rateCredits < 15 || rateCredits > 25) {
      setError('Hourly rate must be between 15 and 25 credits per hour for Developing tier');
      trackEvent('cleaner_onboarding_validation_failed', {
        user_email: user?.email,
        field: 'hourly_rate',
        value: formData.hourly_rate
      });
      setLoading(false);
      return;
    }

    const sanitizedBio = sanitizeString(formData.bio);
    if (sanitizedBio.length < 50) {
      setError('Bio must be at least 50 characters');
      trackEvent('cleaner_onboarding_validation_failed', {
        user_email: user?.email,
        field: 'bio',
        length: sanitizedBio.length
      });
      setLoading(false);
      return;
    }

    try {
      await base44.auth.updateMe({
        phone: formData.phone.replace(/\D/g, ''),
        id_front_url: uploads.id_front,
        id_back_url: uploads.id_back,
        selfie_url: uploads.selfie,
        insurance_certificate_url: uploads.insurance_certificate,
        user_type: 'cleaner',
        sms_consent: formData.sms_consent,
        onboarding_completed: true
      });

      const currentUser = await base44.auth.me();

      // Create cleaner profile with Developing tier and credits-based rate
      await base44.entities.CleanerProfile.create({
      user_email: currentUser.email,
      full_name: currentUser.full_name,
      bio: sanitizedBio,
      base_rate_credits_per_hour: rateCredits,
      hourly_rate: rateCredits, // 1:1 credit system
      deep_addon_credits_per_hour: formData.deep_addon_rate || 2,
      moveout_addon_credits_per_hour: formData.moveout_addon_rate || 5,
      additional_service_pricing: formData.additional_services,
      payout_percentage: 0.80, // Standard 80% payout for Developing tier
      service_tags: formData.service_tags.map(tag => sanitizeString(tag)),
      service_locations: formData.service_locations.map(loc => sanitizeString(loc)),
      availability: formData.availability.filter(a => a.available !== false && a.start_time && a.end_time),
      profile_photo_url: uploads.profile_photo,
      reliability_score: 75,
      tier: 'Developing', // All new cleaners start here
      is_active: false,
      product_preference: formData.product_preference,
      product_verification_photos: uploads.product_photos
      });

      try {
        setError('Initiating identity verification...');
        const kycResult = await initiateKYCVerification(currentUser.email, {
          id_front: uploads.id_front,
          id_back: uploads.id_back,
          selfie: uploads.selfie
        });

        await base44.auth.updateMe({
          kyc_status: kycResult.status,
          kyc_details: JSON.stringify(kycResult)
        });
        
        trackEvent('cleaner_kyc_initiated', {
          user_email: currentUser.email,
          kyc_status: kycResult.status
        });

        if (kycResult.status === 'approved' || kycResult.status === 'consider') {
          setError('Initiating background check...');
          const bgcResult = await initiateBackgroundCheck(currentUser.email, {
            full_name: currentUser.full_name,
            email: currentUser.email,
            phone: formData.phone.replace(/\D/g, ''),
            consent: formData.background_check_consent
          });

          await base44.auth.updateMe({
            background_check_status: bgcResult.mapped_status,
            background_check_details: JSON.stringify(bgcResult)
          });
          
          trackEvent('cleaner_background_check_initiated', {
            user_email: currentUser.email,
            background_check_status: bgcResult.mapped_status
          });
        } else {
          await base44.auth.updateMe({
            background_check_status: 'rejected'
          });
          
          trackEvent('cleaner_background_check_skipped', {
            user_email: currentUser.email,
            reason: 'kyc_not_approved'
          });
        }
      } catch (verificationError) {
        console.error('Verification pipeline error:', verificationError);
        await base44.auth.updateMe({
          kyc_status: 'pending',
          background_check_status: 'pending'
        });
        
        trackEvent('cleaner_verification_pipeline_error', {
          user_email: currentUser.email,
          error_message: verificationError.message
        });
      }

      trackEvent('cleaner_signup_success', {
        user_email: currentUser.email,
        base_rate_credits_per_hour: rateCredits,
        tier: 'Developing',
        product_preference: formData.product_preference,
        service_tags_count: formData.service_tags.length,
        service_locations_count: formData.service_locations.length
      });

      navigate(createPageUrl('CleanerDashboard'));
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to complete onboarding. Please try again.');

      trackEvent('cleaner_onboarding_submit_error', {
        user_email: user?.email,
        error_message: err.message
      });
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="text-center">
          <p className="text-lg text-gray-600 font-verdana">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = (step / 7) * 100;
  
  // Calculate tier from current reliability score (defaults to Developing for new cleaners)
  const currentTier = 'Developing';
  const tierRanges = {
    'Developing': { base: { min: 15, max: 25 }, deep: { min: 1, max: 2 }, moveout: { min: 4, max: 5 } },
    'Semi Pro': { base: { min: 25, max: 35 }, deep: { min: 1, max: 3 }, moveout: { min: 4, max: 6 } },
    'Pro': { base: { min: 35, max: 45 }, deep: { min: 1, max: 4 }, moveout: { min: 4, max: 7 } },
    'Elite': { base: { min: 45, max: 65 }, deep: { min: 1, max: 5 }, moveout: { min: 4, max: 8 } }
  };

  const mondayAvail = formData.availability.find(a => a.day === AVAILABILITY_DAYS[0]);
  const isMondayAvailableAndSet = mondayAvail && mondayAvail.available === true && mondayAvail.start_time && mondayAvail.end_time;

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom, #0078FF 0%, #F7F9FC 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-white mb-2">Cleaner Onboarding</h1>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-white mt-2 font-verdana" style={{ opacity: 0.9 }}>Step {step} of 7</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-2xl">
            <AlertDescription className="font-verdana">{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #ECFEFF 100%)' }}>
                  <CardTitle className="flex items-center gap-2 font-fredoka" style={{ color: '#1D2533' }}>
                    <FileText className="w-6 h-6" style={{ color: '#0078FF' }} />
                    Terms of Service
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2 font-verdana">
                    Please review and accept our terms before continuing
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <TermsOfService userType="cleaner" />

                  <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
                    <Checkbox
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked)}
                      id="terms"
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer font-verdana" style={{ color: '#1D2533' }}>
                      I have read and agree to the Cleaner Terms of Service and Independent Contractor Agreement. I understand that I am not an employee of PureTask and am responsible for my own taxes and insurance.
                    </Label>
                  </div>

                  <Button
                    className="w-full rounded-full font-fredoka font-semibold text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #0078FF 0%, #00D4FF 100%)' }}
                    onClick={() => setStep(2)}
                    disabled={!termsAccepted}
                  >
                    Accept and Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #ECFEFF 100%)' }}>
                  <CardTitle className="flex items-center gap-2 font-fredoka" style={{ color: '#1D2533' }}>
                    <Camera className="w-6 h-6" style={{ color: '#28C76F' }} />
                    Identity Verification
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2 font-verdana">
                    Upload clear photos of your government-issued ID and a selfie for liveness verification
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Instructions Alert */}
                  <Alert className="rounded-2xl" style={{ backgroundColor: '#EFF6FF', border: '2px solid #66B3FF' }}>
                    <Camera className="w-5 h-5" style={{ color: '#66B3FF' }} />
                    <AlertTitle className="font-fredoka font-bold" style={{ color: '#1D2533' }}>
                      📸 Photo Requirements
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2 font-verdana text-gray-700">
                      <p className="font-semibold" style={{ color: '#1D2533' }}>
                        Acceptable ID Types:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Driver's License</li>
                        <li>State-issued ID Card</li>
                        <li>Passport</li>
                        <li>Military ID</li>
                      </ul>
                      
                      <p className="font-semibold mt-3" style={{ color: '#1D2533' }}>
                        ID Photo Guidelines:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Take clear photos of <strong>both front AND back</strong> of your ID</li>
                        <li>Ensure all text is readable and not blurry</li>
                        <li>Photo should not be expired</li>
                        <li>Avoid glare or shadows on the ID</li>
                        <li>Place ID on a flat, contrasting surface</li>
                      </ul>

                      <p className="font-semibold mt-3" style={{ color: '#1D2533' }}>
                        Selfie Requirements:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Show your <strong>entire face clearly</strong></li>
                        <li><strong>NO sunglasses</strong> - eyes must be visible</li>
                        <li><strong>NO hats or head coverings</strong> (except for religious purposes)</li>
                        <li><strong>NO masks</strong> or anything covering your face</li>
                        <li>Look directly at the camera</li>
                        <li>Good lighting - avoid shadows on your face</li>
                        <li>Neutral expression preferred</li>
                      </ul>

                      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4" style={{ color: '#F59E0B' }} />
                          <span style={{ color: '#92400E' }}>
                            Why we need this: We verify your identity to ensure platform safety and trust for all users.
                          </span>
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label className="font-fredoka font-semibold flex items-center gap-2" style={{ color: '#1D2533' }}>
                      <span>ID Front</span>
                      <span className="text-xs font-verdana font-normal text-gray-500">(Required)</span>
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('id_front', e.target.files[0])}
                      className="mt-2 font-verdana"
                    />
                    {uploads.id_front && (
                      <Badge className="mt-2 rounded-full font-fredoka" style={{ backgroundColor: '#28C76F', color: 'white' }}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold flex items-center gap-2" style={{ color: '#1D2533' }}>
                      <span>ID Back</span>
                      <span className="text-xs font-verdana font-normal text-gray-500">(Required)</span>
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('id_back', e.target.files[0])}
                      className="mt-2 font-verdana"
                    />
                    {uploads.id_back && (
                      <Badge className="mt-2 rounded-full font-fredoka" style={{ backgroundColor: '#28C76F', color: 'white' }}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold flex items-center gap-2" style={{ color: '#1D2533' }}>
                      <span>Selfie for Liveness Check</span>
                      <span className="text-xs font-verdana font-normal text-gray-500">(Required)</span>
                    </Label>
                    <p className="text-xs text-gray-500 mb-2 font-verdana">
                      Take a clear photo of your face - no sunglasses, hats, or masks
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('selfie', e.target.files[0])}
                      className="mt-2 font-verdana"
                    />
                    {uploads.selfie && (
                      <Badge className="mt-2 rounded-full font-fredoka" style={{ backgroundColor: '#28C76F', color: 'white' }}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-full font-fredoka">Back</Button>
                    <Button
                      className="flex-1 rounded-full font-fredoka font-semibold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}
                      onClick={() => setStep(3)}
                      disabled={!uploads.id_front || !uploads.id_back || !uploads.selfie || loading}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%)' }}>
                  <CardTitle className="flex items-center gap-2 font-fredoka" style={{ color: '#1D2533' }}>
                    <Shield className="w-6 h-6" style={{ color: '#66B3FF' }} />
                    Background Check Consent
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: '#DBEAFE', border: '1px solid #93C5FD' }}>
                    <h3 className="font-fredoka font-semibold mb-2" style={{ color: '#1D2533' }}>Why we need this</h3>
                    <p className="text-sm text-gray-600 font-verdana">
                      PureTask requires all cleaners to pass a comprehensive background check to ensure client safety and platform trust. This includes criminal record checks and verification of your work history.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.background_check_consent}
                      onCheckedChange={(checked) => setFormData({ ...formData, background_check_consent: checked })}
                      id="consent"
                    />
                    <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer font-verdana" style={{ color: '#1D2533' }}>
                      I consent to PureTask conducting a background check on me, including criminal record verification, employment history, and identity confirmation. I understand this is required to work on the platform.
                    </Label>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="rounded-full font-fredoka">Back</Button>
                    <Button
                      className="flex-1 rounded-full font-fredoka font-semibold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}
                      onClick={() => setStep(4)}
                      disabled={!formData.background_check_consent}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FEFCE8 100%)' }}>
                  <CardTitle className="font-fredoka" style={{ color: '#1D2533' }}>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="font-verdana"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-verdana">Clients and support will use this to contact you</p>
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Profile Photo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => handleFileUpload('profile_photo', e.target.files[0])}
                      className="mt-2 font-verdana"
                    />
                    {uploads.profile_photo && (
                      <Badge className="mt-2 rounded-full font-fredoka" style={{ backgroundColor: '#28C76F', color: 'white' }}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Professional Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell clients about your experience, certifications, and what makes you a great cleaner..."
                      rows={4}
                      required
                      className="font-verdana"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-verdana">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="sms_consent"
                        checked={formData.sms_consent}
                        onChange={(e) => setFormData({ ...formData, sms_consent: e.target.checked })}
                        className="mt-1"
                      />
                      <label htmlFor="sms_consent" className="text-sm cursor-pointer font-verdana" style={{ color: '#1D2533' }}>
                        <strong className="font-fredoka">I agree to receive SMS/email notifications</strong> about job confirmations, reminders, and updates. Message and data rates may apply. You can opt out at any time.
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Liability Insurance Certificate (Recommended for Pro/Elite)</Label>
                    <p className="text-sm text-gray-600 mb-2 font-verdana">
                      Upload proof of liability insurance. Required for Pro and Elite tiers. This protects both you and clients.
                    </p>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={(e) => handleFileUpload('insurance_certificate', e.target.files[0])}
                      className="mt-2 font-verdana"
                    />
                    {uploads.insurance_certificate && (
                      <Badge className="mt-2 rounded-full font-fredoka" style={{ backgroundColor: '#28C76F', color: 'white' }}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Product Preference</Label>
                    <p className="text-sm text-gray-600 mb-3 font-verdana">
                      Let clients know what type of cleaning products you typically use. This helps set expectations and can attract more bookings.
                    </p>
                    <div className="space-y-3">
                      {PRODUCT_PREFERENCES.map(pref => (
                        <button
                          key={pref.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, product_preference: pref.value })}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            formData.product_preference === pref.value
                              ? 'border-[#28C76F] bg-[#DCFCE7]'
                              : 'border-slate-200 hover:border-[#28C76F]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {formData.product_preference === pref.value && (
                              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#28C76F' }} />
                            )}
                            <div>
                              <p className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>{pref.label}</p>
                              <p className="text-sm text-gray-600 font-verdana">{pref.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Product Verification Photos (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-2 font-verdana">
                      Upload photos of the cleaning products you use. This builds trust with clients and can help you get more bookings. <span className="font-semibold" style={{ color: '#28C76F' }}>Cleaners with product photos get 34% more bookings!</span>
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          Array.from(e.target.files).forEach(file => handleProductPhotoUpload(file));
                        }
                        e.target.value = null;
                      }}
                      className="mt-2 font-verdana"
                      multiple
                    />
                    {uploads.product_photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {uploads.product_photos.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded-lg border-2 border-[#86EFAC]" />
                            <button
                              type="button"
                              onClick={() => removeProductPhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Service Locations</Label>
                    <p className="text-sm text-gray-600 mb-3 font-verdana">
                      Select all areas you're willing to serve (minimum 1)
                    </p>

                    {user?.default_address && (
                      <LocationRecommender
                        userAddress={user.default_address}
                        preSelectedLocations={formData.service_locations}
                        onSelectLocations={(locations) => setFormData({ ...formData, service_locations: locations })}
                      />
                    )}

                    <p className="text-sm font-fredoka font-semibold mt-4" style={{ color: '#1D2533' }}>
                      Or choose from all available locations:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg mt-2">
                      {COMMON_LOCATIONS.map(location => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => toggleLocation(location)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.service_locations.includes(location)
                              ? 'border-[#28C76F] bg-[#DCFCE7]'
                              : 'border-slate-200 hover:border-[#28C76F]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {formData.service_locations.includes(location) && (
                              <CheckCircle className="w-4 h-4" style={{ color: '#28C76F' }} />
                            )}
                            <span className="font-fredoka text-sm" style={{ color: '#1D2533' }}>{location}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {formData.service_locations.length > 0 && (
                      <p className="text-sm mt-2 font-verdana" style={{ color: '#28C76F' }}>
                        ✓ {formData.service_locations.length} location{formData.service_locations.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>

                  {/* New Cleaner Tier & Rate Explanation */}
                  <Alert className="rounded-2xl" style={{ backgroundColor: '#FFFBEB', border: '2px solid #FCD34D' }}>
                    <Shield className="w-5 h-5" style={{ color: '#F59E0B' }} />
                    <AlertTitle className="font-fredoka font-bold" style={{ color: '#1D2533' }}>
                      🌟 Your Starting Tier: Developing
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2 font-verdana text-gray-700">
                      <p>
                        <strong>All new cleaners start in the "Developing" tier.</strong> As you complete more jobs and maintain high reliability, you'll automatically advance to higher tiers with increased earning potential!
                      </p>
                      
                      <div className="mt-3 space-y-2">
                        <p className="font-semibold" style={{ color: '#1D2533' }}>Tier Rate Ranges (1 credit = $1):</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                          <li><strong>Developing:</strong> 15-25 credits/hr ($15-25/hr) ← You are here</li>
                          <li><strong>Semi Pro:</strong> 25-35 credits/hr ($25-35/hr)</li>
                          <li><strong>Pro:</strong> 35-45 credits/hr ($35-45/hr)</li>
                          <li><strong>Elite:</strong> 45-65 credits/hr ($45-65/hr)</li>
                        </ul>
                      </div>

                      <p className="text-xs mt-2" style={{ color: '#92400E' }}>
                        💡 <strong>Tip:</strong> Build your reputation by maintaining high punctuality, photo compliance, and customer satisfaction scores to advance faster!
                      </p>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label className="font-fredoka font-semibold flex items-center gap-2" style={{ color: '#1D2533' }}>
                      <span>Hourly Rate</span>
                      <Badge className="rounded-full font-fredoka text-xs" style={{ backgroundColor: '#FCD34D', color: '#92400E' }}>
                        Developing Tier
                      </Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mb-2 font-verdana">
                      Set your rate in credits per hour. <strong>Your tier limits: 15-25 credits/hr ($15-25/hr)</strong>
                    </p>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 15 && value <= 25) {
                            setFormData({ ...formData, hourly_rate: e.target.value });
                          } else if (e.target.value === '') {
                            setFormData({ ...formData, hourly_rate: '' });
                          }
                        }}
                        placeholder="20"
                        min="15"
                        max="25"
                        step="1"
                        required
                        className="font-verdana pr-20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-verdana">
                        credits/hr
                      </span>
                    </div>
                    {formData.hourly_rate && !isNaN(parseInt(formData.hourly_rate)) && (
                      <p className="text-xs mt-2 font-verdana" style={{ color: '#28C76F' }}>
                        ≈ ${parseInt(formData.hourly_rate)}/hour in USD (1 credit = $1)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 font-verdana">
                      💰 Recommended starting rate: <strong>20-25 credits/hr ($20-25/hr)</strong> for competitive positioning
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(3)} className="rounded-full font-fredoka">Back</Button>
                    <Button
                      className="flex-1 rounded-full font-fredoka font-semibold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}
                      onClick={() => setStep(5)}
                      disabled={!formData.phone || !formData.bio || formData.service_locations.length === 0 || !formData.hourly_rate || parseInt(formData.hourly_rate) < 15 || parseInt(formData.hourly_rate) > 25}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)' }}>
                  <CardTitle className="font-fredoka" style={{ color: '#1D2533' }}>Services Offered</CardTitle>
                  <p className="text-sm text-gray-600 mt-2 font-verdana">
                    Select all services you can provide (minimum 3)
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICE_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleServiceTag(tag)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.service_tags.includes(tag)
                            ? 'border-[#28C76F] bg-[#DCFCE7]'
                            : 'border-slate-200 hover:border-[#28C76F]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.service_tags.includes(tag) && (
                            <CheckCircle className="w-4 h-4 mr-1" style={{ color: '#28C76F' }} />
                          )}
                          <span className="font-fredoka text-sm" style={{ color: '#1D2533' }}>{tag}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(4)} className="rounded-full font-fredoka">Back</Button>
                    <Button
                      className="flex-1 rounded-full font-fredoka font-semibold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}
                      onClick={() => setStep(6)}
                      disabled={formData.service_tags.length < 3}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)' }}>
                  <CardTitle className="flex items-center gap-2 font-fredoka" style={{ color: '#1D2533' }}>
                    <Shield className="w-6 h-6" style={{ color: '#28C76F' }} />
                    Pricing & Additional Services
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2 font-verdana">
                    Set your rates for add-ons and extra services based on your tier
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Alert className="rounded-2xl" style={{ backgroundColor: '#FEF3C7', border: '2px solid #FCD34D' }}>
                    <Shield className="w-5 h-5" style={{ color: '#F59E0B' }} />
                    <AlertTitle className="font-fredoka font-bold" style={{ color: '#1D2533' }}>
                      💰 Your Tier: {currentTier}
                    </AlertTitle>
                    <AlertDescription className="mt-2 font-verdana text-gray-700">
                      <p>Your reliability score determines your pricing ranges. As a <strong>{currentTier}</strong> cleaner:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-sm">
                        <li>Base rate: {tierRanges[currentTier].base.min}-{tierRanges[currentTier].base.max} credits/hr (${tierRanges[currentTier].base.min}-${tierRanges[currentTier].base.max}/hr)</li>
                        <li>Deep clean add-on: +{tierRanges[currentTier].deep.min}-{tierRanges[currentTier].deep.max} credits/hr (+${tierRanges[currentTier].deep.min}-${tierRanges[currentTier].deep.max}/hr)</li>
                        <li>Move-out add-on: +{tierRanges[currentTier].moveout.min}-{tierRanges[currentTier].moveout.max} credits/hr (+${tierRanges[currentTier].moveout.min}-${tierRanges[currentTier].moveout.max}/hr)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Deep Clean Add-On Rate</Label>
                    <p className="text-sm text-gray-600 mb-2 font-verdana">
                      Extra charge per hour for deep cleaning services (Range: {tierRanges[currentTier].deep.min}-{tierRanges[currentTier].deep.max} credits/hr = ${tierRanges[currentTier].deep.min}-${tierRanges[currentTier].deep.max}/hr)
                    </p>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.deep_addon_rate}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= tierRanges[currentTier].deep.min && value <= tierRanges[currentTier].deep.max) {
                            setFormData({ ...formData, deep_addon_rate: value });
                          } else if (e.target.value === '') {
                            setFormData({ ...formData, deep_addon_rate: tierRanges[currentTier].deep.min });
                          }
                        }}
                        placeholder="2"
                        min={tierRanges[currentTier].deep.min}
                        max={tierRanges[currentTier].deep.max}
                        step="1"
                        className="font-verdana pr-20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-verdana">
                        credits/hr
                      </span>
                    </div>
                    {formData.deep_addon_rate && (
                      <p className="text-xs mt-2 font-verdana" style={{ color: '#28C76F' }}>
                        ≈ ${formData.deep_addon_rate}/hr extra for deep cleaning
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Move-Out Clean Add-On Rate</Label>
                    <p className="text-sm text-gray-600 mb-2 font-verdana">
                      Extra charge per hour for move-out cleaning services (Range: {tierRanges[currentTier].moveout.min}-{tierRanges[currentTier].moveout.max} credits/hr = ${tierRanges[currentTier].moveout.min}-${tierRanges[currentTier].moveout.max}/hr)
                    </p>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.moveout_addon_rate}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= tierRanges[currentTier].moveout.min && value <= tierRanges[currentTier].moveout.max) {
                            setFormData({ ...formData, moveout_addon_rate: value });
                          } else if (e.target.value === '') {
                            setFormData({ ...formData, moveout_addon_rate: tierRanges[currentTier].moveout.min });
                          }
                        }}
                        placeholder="5"
                        min={tierRanges[currentTier].moveout.min}
                        max={tierRanges[currentTier].moveout.max}
                        step="1"
                        className="font-verdana pr-20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-verdana">
                        credits/hr
                      </span>
                    </div>
                    {formData.moveout_addon_rate && (
                      <p className="text-xs mt-2 font-verdana" style={{ color: '#28C76F' }}>
                        ≈ ${formData.moveout_addon_rate}/hr extra for move-out cleaning
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="font-fredoka font-semibold" style={{ color: '#1D2533' }}>Additional Services (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-3 font-verdana">
                      Select which extra services you offer and set your prices. Prices are limited by your tier.
                    </p>
                    <div className="space-y-4">
                      {ADDITIONAL_SERVICES.map(service => {
                        const isSelected = formData.additional_services[service.key] !== undefined;
                        const currentPrice = formData.additional_services[service.key] || service.min;
                        
                        return (
                          <div key={service.key} className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected ? 'border-[#28C76F] bg-[#DCFCE7]' : 'border-slate-200'
                          }`}>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      additional_services: {
                                        ...prev.additional_services,
                                        [service.key]: service.min
                                      }
                                    }));
                                  } else {
                                    const { [service.key]: _, ...rest } = formData.additional_services;
                                    setFormData(prev => ({ ...prev, additional_services: rest }));
                                  }
                                }}
                                id={service.key}
                              />
                              <div className="flex-1">
                                <Label htmlFor={service.key} className="font-fredoka font-semibold cursor-pointer" style={{ color: '#1D2533' }}>
                                  {service.label}
                                </Label>
                                <p className="text-xs text-gray-500 font-verdana mb-2">{service.unit}</p>
                                
                                {isSelected && (
                                  <div className="mt-2">
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value);
                                          if (!isNaN(value) && value >= service.min && value <= service.max) {
                                            setFormData(prev => ({
                                              ...prev,
                                              additional_services: {
                                                ...prev.additional_services,
                                                [service.key]: value
                                              }
                                            }));
                                          }
                                        }}
                                        min={service.min}
                                        max={service.max}
                                        step="5"
                                        className="font-verdana pr-20"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-verdana">
                                        credits
                                      </span>
                                    </div>
                                    <p className="text-xs mt-1 text-gray-500 font-verdana">
                                      Range: {service.min}-{service.max} credits (${(service.min/10).toFixed(0)}-${(service.max/10).toFixed(0)}) • You: ${(currentPrice/10).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(5)} className="rounded-full font-fredoka">Back</Button>
                    <Button
                      className="flex-1 rounded-full font-fredoka font-semibold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #28C76F 0%, #00D4FF 100%)' }}
                      onClick={() => setStep(7)}
                      disabled={!formData.deep_addon_rate || !formData.moveout_addon_rate}
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardHeader className="rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEFCE8 100%)' }}>
                  <CardTitle className="flex items-center gap-2 font-fredoka" style={{ color: '#1D2533' }}>
                    <Clock className="w-6 h-6" style={{ color: '#F59E0B' }} />
                    Set Your Availability
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2 font-verdana">
                    Set your working hours for each day or mark as unavailable
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyToAllDays}
                      disabled={!isMondayAvailableAndSet}
                      className="flex-1 rounded-full font-fredoka"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" style={{ color: '#0078FF' }} />
                      Copy Monday to All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllDays}
                      disabled={formData.availability.length === 0}
                      className="flex-1 rounded-full font-fredoka"
                    >
                      Clear All
                    </Button>
                  </div>

                  {AVAILABILITY_DAYS.map(day => {
                    const dayAvail = formData.availability.find(a => a.day === day);
                    const isUnavailable = dayAvail ? dayAvail.available === false : false;

                    return (
                      <div key={day} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label className="w-28 font-fredoka font-semibold" style={{ color: '#1D2533' }}>{day}</Label>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isUnavailable}
                              onCheckedChange={(checked) => updateAvailability(day, 'available', !checked)}
                              id={`unavailable-${day}`}
                            />
                            <Label htmlFor={`unavailable-${day}`} className="text-sm text-gray-600 cursor-pointer font-verdana">
                              Unavailable
                            </Label>
                          </div>
                        </div>

                        {!isUnavailable && (
                          <div className="flex items-center gap-4 ml-32">
                            <Input
                              type="time"
                              value={dayAvail?.start_time || ''}
                              onChange={(e) => updateAvailability(day, 'start_time', e.target.value)}
                              className="flex-1 font-verdana"
                            />
                            <span className="text-gray-500 font-verdana">to</span>
                            <Input
                              type="time"
                              value={dayAvail?.end_time || ''}
                              onChange={(e) => updateAvailability(day, 'end_time', e.target.value)}
                              className="flex-1 font-verdana"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(6)} className="rounded-full font-fredoka">Back</Button>
                    <Button
                      className="flex-1 rounded-full font-fredoka font-semibold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #28C76F 0%, #00D4FF 100%)' }}
                      onClick={handleSubmit}
                      disabled={loading || formData.availability.filter(a => a.available !== false && a.start_time && a.end_time).length === 0}
                    >
                      {loading ? 'Submitting...' : 'Complete Onboarding'}
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl mt-4" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <p className="text-sm text-gray-700 font-verdana">
                      <strong className="font-fredoka">What happens next:</strong> Your application will be reviewed within 24-48 hours. We'll verify your identity and conduct a background check. You'll receive an email once approved to start accepting bookings.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}