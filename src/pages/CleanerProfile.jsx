import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin, Star, Calendar as CalendarIcon, CheckCircle, Clock, Loader2, AlertCircle,
  Sparkles, Camera, Shield, Briefcase, MessageCircle, Heart, Award,
  PlayCircle, ChevronLeft, ChevronRight, Check, Zap, TrendingUp, Home, Bath, Maximize, X
} from 'lucide-react';
import FavoriteButton from '@/components/favorites/FavoriteButton';
import MessageButton from '@/components/messaging/MessageButton';
import AddressAutocomplete from '@/components/address/AddressAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { getTierBadgeColor, getTierLightColor, getTierSolidColor } from '../components/utils/tierColors';
import { TIER_BASE_RANGES } from '../components/credits/CreditCalculator';
import AIProfileAssistant from '../components/cleaner/AIProfileAssistant';

const SERVICE_COLORS = {
  basic: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-500' },
  deep: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', dot: 'bg-amber-500' },
  moveout: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', dot: 'bg-purple-500' }
};

export default function CleanerProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleanerEmail, setCleanerEmail] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingData, setBookingData] = useState({
    cleaning_type: 'basic',
    hours: 3,
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 1000,
    home_type: 'apartment',
    has_pets: false,
    parking_instructions: '',
    entry_instructions: '',
    start_time: '09:00'
  });

  useEffect(() => {
    loadProfileAndUser();
  }, []);

  const loadProfileAndUser = async () => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email') || params.get('cleaner');
    setCleanerEmail(emailFromUrl);

    if (!emailFromUrl) {
      navigate(createPageUrl('BrowseCleaners'));
      setLoading(false);
      return;
    }

    try {
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: emailFromUrl });
      const cleanerProfile = profiles[0];

      if (!cleanerProfile) {
        navigate(createPageUrl('BrowseCleaners'));
        setLoading(false);
        return;
      }

      const cleanerReviews = await base44.entities.Review.filter({ cleaner_email: emailFromUrl }, '-created_date');
      const cleanerPhotos = await base44.entities.PhotoPair.filter({ cleaner_email: emailFromUrl }, '-created_date');
      const cleanerBookings = await base44.entities.Booking.filter({ 
        cleaner_email: emailFromUrl,
        status: { $in: ['scheduled', 'accepted', 'in_progress'] }
      });

      setProfile(cleanerProfile);
      setReviews(cleanerReviews);
      setPhotos(cleanerPhotos);
      setBookings(cleanerBookings);
      setEditableProfile({ ...cleanerProfile });

      try {
        const loggedInUser = await base44.auth.me();
        setCurrentUser(loggedInUser);
        if (loggedInUser.email === cleanerProfile.user_email) {
          setIsOwner(true);
        }
      } catch (error) {
        setCurrentUser(null);
        setIsOwner(false);
      }

    } catch (error) {
      handleError(error, { userMessage: 'Error loading cleaner profile:', showToast: false });
      navigate(createPageUrl('BrowseCleaners'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleAddressChange = (addressData) => {
    setBookingData(prev => ({
      ...prev,
      address: addressData.fullAddress,
      latitude: addressData.lat,
      longitude: addressData.lng
    }));
  };

  const handleBookingSubmit = async () => {
    if (!currentUser) {
      navigate(createPageUrl('ClientSignup'));
      return;
    }

    if (currentUser.user_type !== 'client') {
      alert('Please sign in with a client account to book cleanings.');
      return;
    }

    if (!selectedDate || !bookingData.address) {
      alert('Please select a date and enter your address.');
      return;
    }

    try {
      const tierRates = TIER_BASE_RANGES[profile.tier] || TIER_BASE_RANGES['Semi Pro'];
      const baseRate = tierRates.min;
      const addonRate = bookingData.cleaning_type === 'deep' ? 2 : bookingData.cleaning_type === 'moveout' ? 5 : 0;
      const totalRate = baseRate + addonRate;
      const totalCredits = totalRate * bookingData.hours;

      await base44.entities.Booking.create({
        client_email: currentUser.email,
        cleaner_email: profile.user_email,
        date: selectedDate,
        start_time: bookingData.start_time,
        hours: bookingData.hours,
        cleaning_type: bookingData.cleaning_type,
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
        total_price: totalCredits,
        snapshot_base_rate_cph: baseRate,
        snapshot_selected_addon_cph: addonRate,
        snapshot_total_rate_cph: totalRate,
        status: 'awaiting_cleaner_response',
        estimated_hours: bookingData.hours
      });

      alert('Booking request sent successfully!');
      navigate(createPageUrl('ClientBookings'));
    } catch (error) {
      handleError(error, { userMessage: 'Booking error:', showToast: false });
      alert('Failed to create booking. Please try again.');
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr);
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const avail = profile?.availability?.find(a => a.day === dayName);
    return avail && avail.available !== false;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSaveProfile = async () => {
    try {
      await base44.entities.CleanerProfile.update(profile.id, { ...editableProfile });
      setProfile(editableProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      handleError(error, { userMessage: 'Error saving profile:', showToast: false });
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditableProfile({ ...profile });
    setIsEditing(false);
  };

  const handleSpecialtyChange = (specialty) => {
    const currentSpecialties = editableProfile.specialty_tags || [];
    if (currentSpecialties.includes(specialty)) {
      setEditableProfile({
        ...editableProfile,
        specialty_tags: currentSpecialties.filter(s => s !== specialty),
      });
    } else {
      setEditableProfile({
        ...editableProfile,
        specialty_tags: [...currentSpecialties, specialty],
      });
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      setEditableProfile((prev) => ({
        ...prev,
        portfolio_items: [...(prev.portfolio_items || []), ...uploadedUrls.map(url => ({ 
          before_photo_url: url, 
          after_photo_url: url, 
          area: 'General',
          title: 'My Work',
          date: new Date().toISOString().split('T')[0]
        }))]
      }));
      alert('Images uploaded successfully!');
    } catch (error) {
      handleError(error, { userMessage: 'Error uploading images:', showToast: false });
      alert('Failed to upload images. Please try again.');
    }
  };

  const handleRemovePortfolioItem = (indexToRemove) => {
    setEditableProfile((prev) => ({
      ...prev,
      portfolio_items: prev.portfolio_items.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cloud">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cloud">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-verdana mb-4">Cleaner profile not found</p>
          <Button onClick={() => navigate(createPageUrl('BrowseCleaners'))}>
            Browse Other Cleaners
          </Button>
        </div>
      </div>
    );
  }

  const tierIcons = {
    'Elite': '👑',
    'Pro': '⭐',
    'Semi Pro': '💫',
    'Developing': '🌟'
  };
  const tierRates = TIER_BASE_RANGES[profile.tier] || TIER_BASE_RANGES['Semi Pro'];
  const baseRate = tierRates.min;
  const topReviews = reviews.filter(r => r.rating >= 4).slice(0, 2);
  const monthDays = getDaysInMonth(currentMonth);

  const allSpecialties = [
    "Pet-Friendly",
    "Eco-Warrior",
    "Deep Clean Expert",
    "Move-Out Specialist",
    "Same-Day Available",
    "Senior-Friendly",
    "Child-Safe Products",
    "Allergy-Conscious",
    "Organization Pro",
    "Post-Construction"
  ];

  const specialtyIcons = {
    'Pet-Friendly': '🐾',
    'Eco-Warrior': '🌿',
    'Deep Clean Expert': '✨',
    'Move-Out Specialist': '📦',
    'Same-Day Available': '⚡',
    'Senior-Friendly': '❤️',
    'Child-Safe Products': '👶',
    'Allergy-Conscious': '🌸',
    'Organization Pro': '📋',
    'Post-Construction': '🏗️'
  };

  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* HERO SNAPSHOT SECTION */}
      <div className="bg-white border-b-4 border-puretask-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
            {/* LEFT: Profile Photo & Trust Signals */}
            <div className="flex flex-col items-center md:items-start">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative mb-4"
              >
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={profile.full_name}
                    className={`w-32 h-32 sm:w-48 sm:h-48 rounded-3xl object-cover shadow-2xl border-4`}
                    style={{ borderColor: getTierSolidColor(profile.tier) }}
                  />
                ) : (
                  <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-3xl flex items-center justify-center text-5xl sm:text-7xl font-bold text-white shadow-2xl border-4 border-white font-fredoka`} style={{ backgroundColor: getTierSolidColor(profile.tier) }}>
                    {profile.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <Badge className={`${getTierBadgeColor(profile.tier)} absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-lg font-fredoka font-bold shadow-lg border-2 border-white`}>
                  {tierIcons[profile.tier] || '🌟'} {profile.tier}
                </Badge>
              </motion.div>

              {/* Trust Badges */}
              <div className="flex flex-col gap-2 sm:gap-3 w-full mt-4 sm:mt-6">
                {profile.admin_verified && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-white shadow-lg text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 font-fredoka font-bold justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    Admin Verified ✓
                  </Badge>
                )}
                <Badge className="bg-green-100 text-green-700 border-2 border-green-300 text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 font-fredoka font-bold justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Verified Cleaner
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-300 text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 font-fredoka font-bold justify-center">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Background Checked
                </Badge>
                {profile.instant_book_enabled && (
                  <Badge className="bg-purple-100 text-purple-700 border-2 border-purple-300 text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 font-fredoka font-bold justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    Instant Book Available
                  </Badge>
                )}
              </div>
            </div>

            {/* MIDDLE: Info & Bio */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-fredoka font-bold text-graphite mb-3 sm:mb-4">
                  {profile.full_name || 'Professional Cleaner'}
                </h1>
                
                {/* Key Stats Row */}
                <div className="flex flex-wrap gap-3 sm:gap-6 mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Star className="w-5 h-5 sm:w-7 sm:h-7 fill-amber-400 text-amber-400" />
                    <div>
                      <span className="text-xl sm:text-3xl font-fredoka font-bold text-graphite">
                        {profile.average_rating?.toFixed(1) || '5.0'}
                      </span>
                      <span className="text-xs sm:text-base text-gray-600 font-verdana ml-1 sm:ml-2">({profile.total_reviews || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Briefcase className="w-5 h-5 sm:w-7 sm:h-7 text-puretask-blue" />
                    <span className="text-lg sm:text-2xl font-fredoka font-bold text-puretask-blue">
                      {profile.total_jobs || 0} Jobs
                    </span>
                  </div>
                  {profile.years_of_experience > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Award className="w-5 h-5 sm:w-7 sm:h-7 text-fresh-mint" />
                      <span className="text-lg sm:text-2xl font-fredoka font-bold text-fresh-mint">
                        {profile.years_of_experience} Years
                      </span>
                    </div>
                  )}
                </div>

                {/* Years of Experience - Editable */}
                {isEditing && (
                  <div className="mb-4">
                    <Label className="font-fredoka font-semibold text-graphite mb-2 block">Years of Experience</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={editableProfile?.years_of_experience || 0}
                      onChange={(e) => setEditableProfile({ ...editableProfile, years_of_experience: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 5"
                      className="border-2 max-w-xs"
                    />
                  </div>
                )}

                {/* Bio/Tagline */}
                {isEditing ? (
                  <Textarea
                    value={editableProfile?.bio || ''}
                    onChange={(e) => setEditableProfile({ ...editableProfile, bio: e.target.value })}
                    placeholder="Tell clients about yourself..."
                    className="border-2"
                    rows={4}
                  />
                ) : (
                  profile.bio && (
                    <Card className={`border-2 shadow-md`} style={{ backgroundColor: getTierLightColor(profile.tier), borderColor: getTierSolidColor(profile.tier) }}>
                      <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-lg text-gray-700 font-verdana leading-relaxed italic">
                          "{profile.bio}"
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>

              {/* Quick Actions / Edit Profile */}
              <div className="flex gap-2">
                {isOwner ? (
                  isEditing ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 brand-gradient text-white rounded-full font-fredoka font-bold"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1 rounded-full font-fredoka font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 brand-gradient text-white rounded-full font-fredoka font-bold"
                    >
                      Edit Profile
                    </Button>
                  )
                ) : (
                  currentUser && currentUser.user_type === 'client' && (
                    <>
                      <MessageButton 
                        recipientEmail={profile.user_email}
                        recipientName={profile.full_name}
                        variant="outline"
                        className="flex-1 border-2 border-puretask-blue text-puretask-blue hover:bg-blue-50 font-fredoka font-bold"
                      />
                      <FavoriteButton 
                        cleanerEmail={profile.user_email} 
                        user={currentUser}
                        className="font-fredoka font-bold"
                      />
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING SECTION */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* CALENDAR */}
            <Card className="border-2 border-puretask-blue shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white hover:bg-white/20">
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <CardTitle className="font-fredoka text-2xl">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-white/20">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-fredoka font-bold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }
                    const dayBookings = getBookingsForDate(date);
                    const available = isDateAvailable(date);
                    const isSelected = selectedDate === date.toISOString().split('T')[0];
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => available && handleDateSelect(date.toISOString().split('T')[0])}
                        disabled={!available}
                        className={`aspect-square p-1 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-puretask-blue bg-blue-100 shadow-lg scale-105'
                            : available
                            ? 'border-gray-200 hover:border-puretask-blue hover:bg-blue-50 cursor-pointer'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="text-sm font-fredoka font-bold text-graphite">
                          {date.getDate()}
                        </div>
                        <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
                          {dayBookings.slice(0, 3).map((booking, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${SERVICE_COLORS[booking.cleaning_type]?.dot || 'bg-gray-400'}`}
                              title={booking.cleaning_type}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-verdana">Basic Clean</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-verdana">Deep Clean</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="font-verdana">Move-Out</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BOOKING FORM */}
            <Card className="border-2 border-puretask-blue shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6" />
                  Book Your Cleaning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Service Type */}
                <div>
                  <Label className="font-fredoka font-bold text-graphite mb-2 block">Service Type</Label>
                  <Select value={bookingData.cleaning_type} onValueChange={(val) => setBookingData({...bookingData, cleaning_type: val})}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Clean (${baseRate}/hr)</SelectItem>
                      <SelectItem value="deep">Deep Clean (${baseRate + 2}/hr)</SelectItem>
                      <SelectItem value="moveout">Move-Out (${baseRate + 5}/hr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block">Date</Label>
                    <Input 
                      value={selectedDate || ''} 
                      readOnly 
                      placeholder="Select from calendar"
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block">Time</Label>
                    <Select value={bookingData.start_time} onValueChange={(val) => setBookingData({...bookingData, start_time: val})}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hours */}
                <div>
                  <Label className="font-fredoka font-bold text-graphite mb-2 block">Hours Needed</Label>
                  <Select value={bookingData.hours.toString()} onValueChange={(val) => setBookingData({...bookingData, hours: parseInt(val)})}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map(h => (
                        <SelectItem key={h} value={h.toString()}>{h} hours</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
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
                    label="Your Address"
                    required
                  />
                  {bookingData.latitude && bookingData.longitude && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-verdana mt-2">
                      <CheckCircle className="w-4 h-4" />
                      Address verified ✓
                    </div>
                  )}
                </div>

                {/* Home Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block flex items-center gap-1">
                      <Home className="w-4 h-4" /> Beds
                    </Label>
                    <Input 
                      type="number" 
                      value={bookingData.bedrooms}
                      onChange={(e) => setBookingData({...bookingData, bedrooms: parseInt(e.target.value)})}
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block flex items-center gap-1">
                      <Bath className="w-4 h-4" /> Baths
                    </Label>
                    <Input 
                      type="number" 
                      value={bookingData.bathrooms}
                      onChange={(e) => setBookingData({...bookingData, bathrooms: parseFloat(e.target.value)})}
                      className="border-2"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block flex items-center gap-1">
                      <Maximize className="w-4 h-4" /> Sq Ft
                    </Label>
                    <Input 
                      type="number" 
                      value={bookingData.square_feet}
                      onChange={(e) => setBookingData({...bookingData, square_feet: parseInt(e.target.value)})}
                      className="border-2"
                    />
                  </div>
                </div>

                {/* Home Type & Pets */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block">Home Type</Label>
                    <Select value={bookingData.home_type} onValueChange={(val) => setBookingData({...bookingData, home_type: val})}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-fredoka font-bold text-graphite mb-2 block">Pets?</Label>
                    <Select value={bookingData.has_pets.toString()} onValueChange={(val) => setBookingData({...bookingData, has_pets: val === 'true'})}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <Label className="font-fredoka font-bold text-graphite mb-2 block">Parking Instructions</Label>
                  <Textarea 
                    value={bookingData.parking_instructions}
                    onChange={(e) => setBookingData({...bookingData, parking_instructions: e.target.value})}
                    className="border-2"
                    rows={2}
                    placeholder="Where should the cleaner park?"
                  />
                </div>

                <div>
                  <Label className="font-fredoka font-bold text-graphite mb-2 block">Entry Instructions</Label>
                  <Textarea 
                    value={bookingData.entry_instructions}
                    onChange={(e) => setBookingData({...bookingData, entry_instructions: e.target.value})}
                    className="border-2"
                    rows={2}
                    placeholder="How should the cleaner enter?"
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-puretask-blue">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-fredoka font-bold text-graphite">Estimated Total:</span>
                    <span className="text-3xl font-fredoka font-bold text-puretask-blue">
                      ${(baseRate + (bookingData.cleaning_type === 'deep' ? 2 : bookingData.cleaning_type === 'moveout' ? 5 : 0)) * bookingData.hours}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-verdana">
                    {bookingData.hours} hours × ${baseRate + (bookingData.cleaning_type === 'deep' ? 2 : bookingData.cleaning_type === 'moveout' ? 5 : 0)}/hr
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleBookingSubmit}
                  className="w-full brand-gradient text-white font-fredoka font-bold text-lg py-6"
                  size="lg"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Request Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">
        
        {/* VIDEO INTRODUCTION */}
        {profile.video_intro_url && (
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="font-fredoka text-xl sm:text-3xl flex items-center gap-2 sm:gap-3">
                <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                Meet {profile.full_name?.split(' ')[0]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
                <video 
                  src={profile.video_intro_url} 
                  controls 
                  className="w-full h-full"
                  poster={profile.profile_photo_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
          {/* LEFT COLUMN: Reliability & Availability */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            
            {/* RELIABILITY SCORE */}
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className={`text-white`} style={{ backgroundColor: getTierSolidColor(profile.tier) }}>
                <CardTitle className="font-fredoka text-xl sm:text-3xl flex items-center gap-2 sm:gap-3">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                  Reliability Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
                  <div className="text-center sm:text-left">
                    <p className="text-5xl sm:text-7xl font-fredoka font-bold text-puretask-blue mb-2">
                      {profile.reliability_score || 75}
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 font-verdana">
                      {profile.reliability_score >= 90 ? 'Outstanding' : 
                       profile.reliability_score >= 75 ? 'Excellent' : 
                       profile.reliability_score >= 60 ? 'Good' : 'Developing'} Performance
                    </p>
                  </div>
                  <div className="w-32 h-32 sm:w-48 sm:h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="10"
                        strokeDasharray={`${((profile.reliability_score || 75) / 100) * 283} 283`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#66B3FF" />
                          <stop offset="100%" stopColor="#00D4FF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700 font-verdana mb-4 sm:mb-6">
                  This score reflects on-time arrival, task completion, photo quality, and client satisfaction.
                </p>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-3 sm:p-4 text-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                    <p className="text-lg sm:text-2xl font-fredoka font-bold text-green-600">{profile.attendance_rate || 100}%</p>
                    <p className="text-xs text-gray-600 font-verdana">Attendance</p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 sm:p-4 text-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                    <p className="text-lg sm:text-2xl font-fredoka font-bold text-blue-600">{profile.punctuality_rate || 100}%</p>
                    <p className="text-xs text-gray-600 font-verdana">On-Time</p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 sm:p-4 text-center">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                    <p className="text-lg sm:text-2xl font-fredoka font-bold text-purple-600">{profile.photo_compliance_rate || 100}%</p>
                    <p className="text-xs text-gray-600 font-verdana">Photo Quality</p>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 sm:p-4 text-center">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mx-auto mb-1 sm:mb-2" />
                    <p className="text-lg sm:text-2xl font-fredoka font-bold text-amber-600">{profile.communication_rate || 100}%</p>
                    <p className="text-xs text-gray-600 font-verdana">Communication</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HIGHLIGHTED REVIEWS */}
            {topReviews.length > 0 && (
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  <CardTitle className="font-fredoka text-xl sm:text-3xl flex items-center gap-2 sm:gap-3">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8" />
                    What Clients Say
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  {topReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 sm:w-6 sm:h-6 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm sm:text-lg text-gray-700 font-verdana leading-relaxed mb-2 sm:mb-3 italic">
                        "{review.comment}"
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 font-verdana">
                          {new Date(review.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        {review.would_recommend && (
                          <Badge className="bg-green-500 text-white font-fredoka">
                            <Check className="w-4 h-4 mr-1" />
                            Recommends
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {reviews.length > 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-fredoka font-bold"
                    >
                      {showAllReviews ? 'Show Less Reviews' : `View All ${reviews.length} Reviews`}
                    </Button>
                  )}

                  {showAllReviews && reviews.slice(2).map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 font-verdana leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      <p className="text-sm text-gray-500 font-verdana">
                        {new Date(review.created_date).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* BEFORE & AFTER PHOTOS */}
            {photos.length > 0 && (
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  <CardTitle className="font-fredoka text-xl sm:text-3xl flex items-center gap-2 sm:gap-3">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                    Before & After Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPhotoIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-fredoka font-bold text-gray-600 mb-2 sm:mb-3">BEFORE</p>
                          <img
                            src={photos[currentPhotoIndex].before_photo_url}
                            alt="Before"
                            className="w-full h-48 sm:h-80 object-cover rounded-2xl shadow-lg border-4 border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-fredoka font-bold text-green-600 mb-2 sm:mb-3">AFTER</p>
                          <img
                            src={photos[currentPhotoIndex].after_photo_url}
                            alt="After"
                            className="w-full h-48 sm:h-80 object-cover rounded-2xl shadow-lg border-4 border-green-400"
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {photos.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={prevPhoto}
                          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl rounded-full w-12 h-12"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={nextPhoto}
                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl rounded-full w-12 h-12"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                  </div>

                  {photos[currentPhotoIndex].area && (
                    <p className="text-center text-sm sm:text-lg font-fredoka font-bold text-gray-700 mt-4 sm:mt-6">
                      {photos[currentPhotoIndex].area}
                    </p>
                  )}

                  <div className="flex justify-center gap-2 mt-6">
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === currentPhotoIndex ? 'bg-puretask-blue w-8' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI PROFILE ASSISTANT */}
            {isOwner && (
              <AIProfileAssistant 
                profile={profile}
                bookings={bookings}
                reviews={reviews}
                onUpdate={(updated) => {
                  setProfile(updated);
                  setEditableProfile(updated);
                }}
              />
            )}

            {/* AI PROFILE ASSISTANT */}
            {isOwner && (
              <AIProfileAssistant 
                profile={profile}
                bookings={bookings}
                reviews={reviews}
                onUpdate={(updated) => {
                  setProfile(updated);
                  setEditableProfile(updated);
                }}
              />
            )}

            {/* GALLERY EDIT SECTION */}
            {isOwner && isEditing && (
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-green-500 text-white">
                  <CardTitle className="font-fredoka text-xl sm:text-3xl flex items-center gap-2 sm:gap-3">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                    Manage Your Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-8 space-y-4">
                  <Label htmlFor="portfolio-upload" className="font-fredoka font-bold text-graphite mb-2 block">Upload Photos</Label>
                  <Input 
                    id="portfolio-upload"
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload} 
                    className="border-2 p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-puretask-blue file:text-white hover:file:bg-blue-600"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {editableProfile?.portfolio_items?.map((item, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={item.after_photo_url || item.before_photo_url}
                          alt={`Portfolio item ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePortfolioItem(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* RIGHT COLUMN: Services & Stats */}
          <div className="space-y-6">

            {/* SERVICES & SPECIALTIES */}
            <Card className="border-0 shadow-2xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className="font-fredoka text-lg sm:text-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  Services & Specialties
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Cleaning Types */}
                <div>
                  <p className="text-sm font-fredoka font-bold text-gray-600 mb-3">CLEANING TYPES</p>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-300 text-base px-4 py-2 font-fredoka font-bold justify-start">
                      ✓ Basic Clean
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-2 border-amber-300 text-base px-4 py-2 font-fredoka font-bold justify-start">
                      ✓ Deep Clean
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 border-2 border-purple-300 text-base px-4 py-2 font-fredoka font-bold justify-start">
                      ✓ Move-Out Clean
                    </Badge>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <p className="text-sm font-fredoka font-bold text-gray-600 mb-3">SPECIALTIES</p>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {allSpecialties.map((specialty, idx) => (
                        <Badge
                          key={idx}
                          onClick={() => handleSpecialtyChange(specialty)}
                          className={`cursor-pointer transition-colors text-sm px-3 py-2 font-fredoka font-bold ${
                            editableProfile?.specialty_tags?.includes(specialty)
                              ? 'bg-puretask-blue text-white border-2 border-puretask-blue'
                              : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {specialtyIcons[specialty] || '✨'} {specialty}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    profile.specialty_tags && profile.specialty_tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.specialty_tags.map((specialty, idx) => (
                          <Badge
                            key={idx}
                            className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-2 border-purple-300 text-sm px-3 py-2 font-fredoka font-bold"
                          >
                            {specialtyIcons[specialty] || '✨'} {specialty}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 font-verdana">No specialties listed.</p>
                    )
                  )}
                </div>

                {/* Service Areas */}
                <div>
                  <p className="text-sm font-fredoka font-bold text-gray-600 mb-3">SERVICE AREAS</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editableProfile?.service_locations?.join(', ') || ''}
                        onChange={(e) => setEditableProfile({
                          ...editableProfile,
                          service_locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="e.g., Downtown, Midtown, Uptown"
                        className="border-2"
                      />
                      <p className="text-xs text-gray-500 font-verdana">Separate areas with commas</p>
                    </div>
                  ) : (
                    profile.service_locations && profile.service_locations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.service_locations.map((location, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-sm px-3 py-1 font-verdana border-2"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {location}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 font-verdana">No service areas listed.</p>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RESPONSE TIME */}
            <Card className="border-0 shadow-2xl rounded-3xl">
              <CardContent className="p-4 sm:p-6 text-center">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-puretask-blue mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-gray-600 font-verdana mb-1">Typical Response Time</p>
                <p className="text-2xl sm:text-3xl font-fredoka font-bold text-puretask-blue">
                  {profile.typical_response_time || '< 2 hours'}
                </p>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}