import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Shield, Clock, Award, Star, CheckCircle, TrendingUp, Users, MapPin, Camera, Zap, Calendar, Briefcase, Home as HomeIcon, Heart, ArrowRight, AlertCircle, Loader2, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageCarousel from '@/components/home/ImageCarousel';
import AddressAutocomplete from '@/components/address/AddressAutocomplete';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookingData, setBookingData] = useState({
    address: '',
    latitude: null,
    longitude: null,
    serviceType: 'basic',
    bedrooms: '2',
    bathrooms: '2',
    squareFeet: 1500,
    recommendedHours: 3,
    date: '',
    time: ''
  });

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        if (isMounted) {
          await checkUser();
          // Load draft from localStorage if exists
          const savedDraft = localStorage.getItem('bookingDraft');
          if (savedDraft && isMounted) {
            setBookingData(JSON.parse(savedDraft));
          }
        }
      } catch (error) {
        if (isMounted) {
          handleError(error, { userMessage: 'Error loading home:', showToast: false });
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty array - only run once on mount

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me().catch(() => null);
      setUser(currentUser);
    } catch (error) {
      // User not logged in - this is fine for Home page
      setUser(null);
    }
  };

  const handleBooking = (e) => {
    e.preventDefault();

    if (!bookingData.address || !bookingData.latitude || !bookingData.longitude) {
      alert('Please select a valid address from the dropdown suggestions');
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      alert('Please select both date and time');
      return;
    }

    // Save booking data to localStorage
    localStorage.setItem('bookingDraft', JSON.stringify(bookingData));

    // Always go to browse cleaners first
    // Users can browse without logging in
    navigate(createPageUrl('BrowseCleaners'));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Booking Form */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-12 lg:py-16 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <Badge className="mb-3 sm:mb-4 text-sm sm:text-base px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-fredoka border-2 bg-white shadow-md" style={{ color: '#66B3FF', borderColor: '#66B3FF' }}>
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Verified & Trusted Platform
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-fredoka font-bold mb-2 sm:mb-3 leading-tight text-graphite px-2">
                Book a Trusted Cleaner in Minutes
              </h1>
              <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-verdana text-gray-600 px-2">
                Professional cleaning with GPS tracking, photo proof, and verified cleaners
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Left Column - Image Carousel */}
              <div className="hidden lg:block">
                <ImageCarousel />
              </div>

              {/* Right Column - Booking Form */}
              <Card className="border-2 border-blue-200 shadow-2xl rounded-xl sm:rounded-2xl bg-white">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleBooking} className="space-y-6">
                  {/* Address Section */}
                  <div className="space-y-3">
                    <AddressAutocomplete
                      value={bookingData.address}
                      onChange={(address) => {
                        setBookingData({
                          ...bookingData,
                          address,
                          latitude: null,
                          longitude: null
                        });
                      }}
                      onLocationSelect={(location) => {
                        setBookingData({
                          ...bookingData,
                          address: location.address,
                          latitude: location.latitude,
                          longitude: location.longitude
                        });
                      }}
                      placeholder="Start typing your address..."
                      label="Your Address"
                      required
                    />
                    {bookingData.latitude && bookingData.longitude && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-verdana">
                        <CheckCircle className="w-4 h-4" />
                        Address verified ✓
                      </div>
                    )}
                  </div>

                  {/* SERVICE TYPE - MAJOR FOCUS */}
                  <div className="p-4 sm:p-6 border-4 border-puretask-blue rounded-2xl bg-blue-50 shadow-lg">
                    <label className="block text-base sm:text-lg font-fredoka font-bold mb-3 sm:mb-4 text-graphite flex items-center gap-2">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-puretask-blue" />
                      Service Type *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { value: 'basic', label: 'Basic Cleaning', desc: 'Standard cleaning service', price: '', borderColor: 'border-blue-600', textColor: 'text-blue-600' },
                        { value: 'deep', label: 'Deep Cleaning', desc: 'Thorough, detailed cleaning', price: '+$5-8/hr', borderColor: 'border-amber-500', textColor: 'text-amber-600' },
                        { value: 'moveout', label: 'Move-Out Cleaning', desc: 'Get your deposit back', price: '+$5-8/hr', borderColor: 'border-purple-500', textColor: 'text-purple-600' }
                      ].map((service) => (
                        <button
                          key={service.value}
                          type="button"
                          onClick={() => setBookingData({...bookingData, serviceType: service.value})}
                          className={`p-3 sm:p-4 rounded-xl text-left transition-all font-verdana ${
                            bookingData.serviceType === service.value
                              ? `border-4 ${service.borderColor} bg-white shadow-lg scale-105`
                              : `border-2 ${service.borderColor} bg-white hover:shadow-md`
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className={`font-fredoka font-bold text-sm sm:text-base ${bookingData.serviceType === service.value ? service.textColor : 'text-graphite'} truncate`}>
                                {service.label}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">{service.desc}</p>
                            </div>
                            {service.price && (
                              <Badge className="bg-amber-100 text-amber-800 font-fredoka text-xs whitespace-nowrap flex-shrink-0">{service.price}</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CLEANING HOURS - MAJOR FOCUS */}
                  <div className="p-6 border-4 border-green-500 rounded-2xl bg-green-50 shadow-lg">
                    <label className="block text-lg font-fredoka font-bold mb-4 text-graphite flex items-center gap-2">
                      <Clock className="w-6 h-6 text-green-600" />
                      How Many Hours? *
                    </label>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-fredoka font-bold text-green-600 mb-2">
                        {bookingData.recommendedHours}
                      </p>
                      <p className="text-lg font-fredoka text-graphite">hour{bookingData.recommendedHours > 1 ? 's' : ''}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => setBookingData({...bookingData, recommendedHours: hours})}
                          className={`h-14 rounded-xl font-fredoka font-bold text-lg transition-all border-2 ${
                            bookingData.recommendedHours === hours
                              ? 'bg-green-500 text-white border-green-600 shadow-lg scale-110'
                              : 'bg-white text-gray-700 hover:bg-green-100 border-gray-300'
                          }`}
                        >
                          {hours}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 font-verdana text-center">
                      💡 Typical: 2-4 hrs • Deep clean: 4-8 hrs
                    </p>
                  </div>

                  {/* DATE & TIME - HIGHLIGHTED */}
                  <div className="p-6 border-4 border-amber-500 rounded-2xl bg-amber-50 shadow-lg">
                    <label className="block text-lg font-fredoka font-bold mb-4 text-graphite flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-amber-600" />
                      When Do You Need Cleaning? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-fredoka font-bold mb-2 text-graphite">
                          Date *
                        </label>
                        <Input
                          required
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          className="font-verdana border-3 h-14 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-fredoka font-bold mb-2 text-graphite">
                          Time *
                        </label>
                        <select 
                          value={bookingData.time} 
                          onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                          className="w-full rounded-xl font-verdana border-3 h-14 text-lg font-semibold px-4"
                          required
                        >
                          <option value="">Pick time</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="08:30">8:30 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="09:30">9:30 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="10:30">10:30 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="12:30">12:30 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="13:30">1:30 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="14:30">2:30 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="15:30">3:30 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="16:30">4:30 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Home Details */}
                  <div className="space-y-4">
                    <label className="block text-sm font-fredoka font-semibold text-graphite">
                      Additional Details
                    </label>
                    
                    {/* Square Feet */}
                    <div>
                      <label className="block text-xs font-fredoka font-semibold mb-2 text-gray-600">
                        Home Size: <span className="text-puretask-blue">{bookingData.squareFeet.toLocaleString()} sq ft</span>
                      </label>
                      <Slider
                        value={[bookingData.squareFeet]}
                        onValueChange={(value) => setBookingData({...bookingData, squareFeet: value[0]})}
                        min={500}
                        max={6000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 font-verdana mt-1">
                        <span>500</span>
                        <span>6,000</span>
                      </div>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-fredoka font-semibold mb-2 text-gray-600">
                          Bedrooms
                        </label>
                        <select 
                          value={bookingData.bedrooms} 
                          onChange={(e) => setBookingData({...bookingData, bedrooms: e.target.value})}
                          className="w-full rounded-lg font-verdana border h-9 text-sm px-3"
                        >
                          <option value="0">Studio</option>
                          <option value="1">1 BR</option>
                          <option value="2">2 BR</option>
                          <option value="3">3 BR</option>
                          <option value="4">4 BR</option>
                          <option value="5">5+ BR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-fredoka font-semibold mb-2 text-gray-600">
                          Bathrooms
                        </label>
                        <select 
                          value={bookingData.bathrooms} 
                          onChange={(e) => setBookingData({...bookingData, bathrooms: e.target.value})}
                          className="w-full rounded-lg font-verdana border h-9 text-sm px-3"
                        >
                          <option value="1">1 BA</option>
                          <option value="1.5">1.5 BA</option>
                          <option value="2">2 BA</option>
                          <option value="2.5">2.5 BA</option>
                          <option value="3">3 BA</option>
                          <option value="4">4+ BA</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons - LARGE & VISIBLE */}
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      type="submit"
                      className="w-full text-xl py-8 rounded-2xl font-fredoka font-bold shadow-2xl hover:shadow-3xl transition-all"
                      style={{ 
                        background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)',
                        color: 'white',
                        border: '3px solid #0078FF'
                      }}
                    >
                      Find Available Cleaners
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => navigate(createPageUrl('MultiBooking'))}
                      className="w-full text-lg py-6 rounded-2xl font-fredoka font-bold border-2 shadow-lg hover:shadow-xl transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                        color: 'white',
                        border: '2px solid #7E22CE'
                      }}
                    >
                      <Repeat className="w-5 h-5 mr-2" />
                      Book Multiple Dates & Save
                    </Button>
                  </div>

                  {!user && (
                    <p className="text-center text-sm text-gray-600 font-verdana mt-2">
                      Don't worry - you'll create an account in the next step
                    </p>
                  )}
                </form>

                {/* Trust Indicators Below Form */}
                <div className="mt-6 pt-6 border-t-2 border-blue-200">
                  <div className="flex flex-wrap justify-center gap-6 text-sm font-verdana font-semibold text-graphite">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      <span>GPS Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      <span>Photo Proof</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      <span>Pay After Approval</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Stats Below Form */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
              <Card className="text-center border-3 bg-white shadow-lg hover:shadow-xl transition-all" style={{ borderColor: '#66B3FF' }}>
                <CardContent className="p-3 sm:p-5 flex flex-col items-center justify-center">
                  <p className="text-3xl sm:text-4xl font-fredoka font-bold mb-1" style={{ color: '#66B3FF' }}>500+</p>
                  <p className="text-xs sm:text-sm font-verdana font-semibold text-graphite text-center">Verified Cleaners</p>
                </CardContent>
              </Card>
              <Card className="text-center border-3 bg-white shadow-lg hover:shadow-xl transition-all" style={{ borderColor: '#28C76F' }}>
                <CardContent className="p-3 sm:p-5 flex flex-col items-center justify-center">
                  <p className="text-3xl sm:text-4xl font-fredoka font-bold mb-1" style={{ color: '#28C76F' }}>10k+</p>
                  <p className="text-xs sm:text-sm font-verdana font-semibold text-graphite text-center">Jobs Completed</p>
                </CardContent>
              </Card>
              <Card className="text-center border-3 bg-white shadow-lg hover:shadow-xl transition-all" style={{ borderColor: '#F59E0B' }}>
                <CardContent className="p-3 sm:p-5 flex flex-col items-center justify-center">
                  <p className="text-3xl sm:text-4xl font-fredoka font-bold mb-1" style={{ color: '#F59E0B' }}>4.9★</p>
                  <p className="text-xs sm:text-sm font-verdana font-semibold text-graphite text-center">Average Rating</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-8 sm:py-12 bg-white border-y-2 border-gray-300">
        <div className="container mx-auto px-3 sm:px-6 max-w-full overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            <Card className="border-2 border-puretask-blue bg-blue-50 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-puretask-blue mx-auto mb-2" />
                <span className="font-fredoka font-bold text-graphite text-sm block">Background Checked</span>
              </CardContent>
            </Card>
            <Card className="border-2 border-fresh-mint bg-green-50 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-fresh-mint mx-auto mb-2" />
                <span className="font-fredoka font-bold text-graphite text-sm block">Identity Verified</span>
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-500 bg-amber-50 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <span className="font-fredoka font-bold text-graphite text-sm block">Rated by Clients</span>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-500 bg-purple-50 shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4 text-center">
                <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <span className="font-fredoka font-bold text-graphite text-sm block">Photo Proof</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="container mx-auto px-3 sm:px-6 max-w-full overflow-hidden">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-fredoka font-bold mb-3 sm:mb-4 text-graphite px-2">
              Why Choose PureTask?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-verdana px-2">
              The most trusted platform for premium cleaning services
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Cleaners',
                description: 'Full KYC, background checks, and identity verification for every cleaner',
                bgColor: '#EFF6FF',
                iconBg: '#66B3FF',
                textColor: '#66B3FF',
                borderColor: '#93C5FD'
              },
              {
                icon: TrendingUp,
                title: 'Reliability Scoring',
                description: 'Dynamic ratings based on punctuality, quality, and professionalism',
                bgColor: '#F0FDF4',
                iconBg: '#28C76F',
                textColor: '#28C76F',
                borderColor: '#86EFAC'
              },
              {
                icon: Clock,
                title: 'GPS Check-In/Out',
                description: 'Real-time tracking ensures cleaners arrive and complete on time',
                bgColor: '#ECFEFF',
                iconBg: '#00D4FF',
                textColor: '#00D4FF',
                borderColor: '#67E8F9'
              },
              {
                icon: Camera,
                title: 'Photo Proof',
                description: 'Before/after photos for every job guarantee quality results',
                bgColor: '#FFFBEB',
                iconBg: '#F59E0B',
                textColor: '#D97706',
                borderColor: '#FCD34D'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl" style={{ backgroundColor: feature.bgColor, borderColor: feature.borderColor }}>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg border-2 border-white mx-auto" style={{ backgroundColor: feature.iconBg }}>
                      <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-fredoka font-bold mb-2 sm:mb-3" style={{ color: feature.textColor }}>{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-verdana">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg font-fredoka font-semibold max-w-2xl mx-auto text-graphite">
              You're not just booking a cleaner — you're booking a proven professional.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-4 text-graphite">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 font-verdana">No hidden fees, just quality service</p>
            <p className="text-sm text-gray-500 mt-2 font-verdana">💡 10 credits = $1 USD</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {[
              {
                tier: 'Developing',
                credits: '150-280',
                usd: '$15-28',
                bgColor: 'white',
                borderColor: '#9CA3AF',
                badgeBg: '#F3F4F6',
                badgeText: '#374151'
              },
              {
                tier: 'Semi Pro',
                credits: '280-400',
                usd: '$28-40',
                bgColor: 'white',
                borderColor: '#66B3FF',
                badgeBg: '#DBEAFE',
                badgeText: '#66B3FF'
              },
              {
                tier: 'Pro',
                credits: '400-550',
                usd: '$40-55',
                bgColor: 'white',
                borderColor: '#66B3FF',
                badgeBg: '#DBEAFE',
                badgeText: '#66B3FF',
                popular: true
              },
              {
                tier: 'Elite',
                credits: '550-750',
                usd: '$55-75',
                bgColor: 'white',
                borderColor: '#FBBF24',
                badgeBg: '#FEF3C7',
                badgeText: '#92400E'
              }
            ].map((plan, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all rounded-2xl relative border-2 shadow-md" style={{ background: plan.bgColor, borderColor: plan.borderColor }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 font-fredoka rounded-full shadow-lg text-white border-2 border-white" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 sm:p-8 text-center">
                  <Badge className="mb-3 sm:mb-4 font-fredoka rounded-full" style={{ backgroundColor: plan.badgeBg, color: plan.badgeText }}>
                    {plan.tier}
                  </Badge>
                  <p className="text-3xl sm:text-5xl font-fredoka font-bold mb-1 sm:mb-2 text-graphite">{plan.usd}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-verdana">/hour</p>
                  <p className="text-xs text-gray-500 mb-4 sm:mb-6 font-verdana">{plan.credits} credits</p>
                  <ul className="text-left space-y-3 font-verdana">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      <span className="text-sm">Verified cleaners</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      <span className="text-sm">GPS tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-fresh-mint" />
                      <span className="text-sm">Photo proof</span>
                    </li>
                    {plan.tier !== 'Developing' && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-fresh-mint" />
                        <span className="text-sm">Quality products</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('BrowseCleaners')}>
              <Button size="lg" className="text-lg px-10 py-6 rounded-full font-fredoka font-semibold shadow-xl hover:shadow-2xl text-white border-2 border-transparent" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                View All Cleaners
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reliability Score Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-4 text-graphite">
              Reliability Score = Peace of Mind
            </h2>
            <p className="text-xl text-gray-600 font-verdana italic max-w-3xl mx-auto">
              "Because trust should be earned — not assumed."
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Clock,
                title: 'On-Time Arrival',
                description: 'GPS-verified check-ins track punctuality',
                stat: '95%',
                color: '#66B3FF',
                bg: '#EFF6FF',
                borderColor: '#93C5FD'
              },
              {
                icon: Camera,
                title: 'Before & After Photos',
                description: 'Visual proof of quality work',
                stat: '100%',
                color: '#00D4FF',
                bg: '#ECFEFF',
                borderColor: '#67E8F9'
              },
              {
                icon: Star,
                title: 'Customer Satisfaction',
                description: 'Real reviews from verified bookings',
                stat: '4.9★',
                color: '#F59E0B',
                bg: '#FFFBEB',
                borderColor: '#FCD34D'
              },
              {
                icon: CheckCircle,
                title: 'Consistent Completion',
                description: 'Track record of finished jobs',
                stat: '98%',
                color: '#28C76F',
                bg: '#F0FDF4',
                borderColor: '#86EFAC'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-2 shadow-lg rounded-2xl" style={{ backgroundColor: item.bg, borderColor: item.borderColor }}>
                  <CardContent className="p-8 text-center">
                    <item.icon className="w-12 h-12 mx-auto mb-4" style={{ color: item.color }} />
                    <h3 className="text-xl font-fredoka font-bold mb-2 text-graphite">{item.title}</h3>
                    <p className="text-gray-600 font-verdana text-sm mb-4">{item.description}</p>
                    <p className="text-3xl font-fredoka font-bold" style={{ color: item.color }}>{item.stat}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg font-fredoka font-semibold max-w-2xl mx-auto text-graphite">
              You're not just booking a cleaner — you're booking a proven professional.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-4 text-graphite">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 font-verdana">Simple, transparent, and reliable</p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {[
              { 
                step: 1, 
                title: 'Enter Your Details', 
                description: 'Fill out the form above with your address, service type, home size, and preferred date/time.',
                icon: HomeIcon
              },
              { 
                step: 2, 
                title: 'Browse & Choose Your Cleaner', 
                description: 'View available cleaners based on your location and preferences. Compare reliability scores, rates, reviews, and specialties.',
                icon: Users
              },
              { 
                step: 3, 
                title: 'Finalize Your Booking', 
                description: 'Confirm your cleaner, review pricing, add any special requests, and secure your booking with credits.',
                icon: Calendar
              },
              { 
                step: 4, 
                title: 'Track & Approve', 
                description: 'Get GPS check-in notifications, view before/after photos, and approve the work to release payment.',
                icon: Star
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-fredoka font-bold text-2xl shadow-lg flex-shrink-0 border-2 border-white" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                  {item.step}
                </div>
                <Card className="flex-1 border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className="w-6 h-6 text-puretask-blue" />
                      <h3 className="text-2xl font-fredoka font-bold text-graphite">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-verdana">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('HowItWorks')}>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full font-fredoka border-2 shadow-md">
                Learn More About Our Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who PureTask Is For */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-4 text-graphite">
              Who PureTask Is For
            </h2>
            <p className="text-xl text-gray-600 font-verdana">Perfect cleaning solutions for every lifestyle</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Link to={createPageUrl('ForProfessionals')}>
              <Card className="h-full border-2 border-puretask-blue hover:shadow-xl transition-all cursor-pointer rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-fredoka font-bold mb-3 text-puretask-blue">For Professionals</h3>
                  <p className="text-gray-600 font-verdana text-sm mb-4">Busy professionals who need reliable, scheduled cleaning</p>
                  <Button variant="ghost" className="text-puretask-blue font-fredoka">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('ForRetirees')}>
              <Card className="h-full border-2 border-purple-400 hover:shadow-xl transition-all cursor-pointer rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-purple-500">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-fredoka font-bold mb-3 text-purple-600">For Retirees</h3>
                  <p className="text-gray-600 font-verdana text-sm mb-4">Senior-friendly service with trusted, caring cleaners</p>
                  <Button variant="ghost" className="text-purple-600 font-fredoka">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('ForAirbnbHosts')}>
              <Card className="h-full border-2 border-amber-400 hover:shadow-xl transition-all cursor-pointer rounded-2xl bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-500">
                    <HomeIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-fredoka font-bold mb-3 text-amber-600">For Airbnb Hosts</h3>
                  <p className="text-gray-600 font-verdana text-sm mb-4">Fast turnaround cleaning between guest stays</p>
                  <Button variant="ghost" className="text-amber-600 font-fredoka">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('ForFamilies')}>
              <Card className="h-full border-2 border-fresh-mint hover:shadow-xl transition-all cursor-pointer rounded-2xl bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-fresh-mint">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-fredoka font-bold mb-3 text-fresh-mint">For Families</h3>
                  <p className="text-gray-600 font-verdana text-sm mb-4">Child-safe products and family-friendly service</p>
                  <Button variant="ghost" className="text-fresh-mint font-fredoka">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-white" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-6">
              Are You a Professional Cleaner?
            </h2>
            <p className="text-xl font-verdana mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our platform and build your business with flexible hours, fair pay, and a steady stream of clients
            </p>
            <Button 
              onClick={() => navigate(createPageUrl('RoleSelection'))}
              size="lg" 
              className="rounded-full shadow-xl text-lg px-10 py-7 font-fredoka font-semibold border-2 border-white" 
              style={{ backgroundColor: 'white', color: '#66B3FF' }}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Join as a Cleaner
            </Button>

            <div className="mt-12 flex flex-wrap justify-center gap-8 font-verdana">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Earn 80-85%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Set Your Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Weekly Payouts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}