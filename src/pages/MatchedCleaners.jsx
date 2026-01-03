import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles, Star, MapPin, Clock, Shield, Heart, Loader2, ArrowLeft,
  Calendar, CheckCircle, TrendingUp, Award, Info, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import CleanerCard from '../components/cleaner/CleanerCard';

export default function MatchedCleaners() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [addOns, setAddOns] = useState({});

  useEffect(() => {
    loadMatchedCleaners();
  }, []);

  const loadMatchedCleaners = async () => {
    try {
      // Check auth
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'client') {
        navigate(createPageUrl('ClientSignup'));
        return;
      }
      setUser(currentUser);

      // Load booking data from localStorage
      const savedBooking = localStorage.getItem('bookingDraft');
      const savedAddOns = localStorage.getItem('bookingAddOns');
      
      if (!savedBooking) {
        navigate(createPageUrl('Home'));
        return;
      }

      const booking = JSON.parse(savedBooking);
      setBookingData(booking);
      
      if (savedAddOns) {
        setAddOns(JSON.parse(savedAddOns));
      }

      // Fetch all cleaners
      const allCleaners = await base44.entities.CleanerProfile.filter({ is_active: true });

      // Filter by location (within reasonable distance)
      // Sort by tier (Elite > Pro > Semi Pro > Developing)
      const tierOrder = { 'Elite': 4, 'Pro': 3, 'Semi Pro': 2, 'Developing': 1 };
      
      const sortedCleaners = allCleaners
        .sort((a, b) => {
          // First by tier
          const tierDiff = (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0);
          if (tierDiff !== 0) return tierDiff;
          
          // Then by reliability score
          return (b.reliability_score || 0) - (a.reliability_score || 0);
        });

      setCleaners(sortedCleaners);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading cleaners:', showToast: false });
      alert('Failed to load cleaners. Please try again.');
      navigate(createPageUrl('Home'));
    }
    setLoading(false);
  };

  const handleSelectCleaner = (cleaner) => {
    // Save selected cleaner
    localStorage.setItem('selectedCleaner', cleaner.user_email);
    
    // Navigate to add-ons selection first
    navigate(createPageUrl(`AdditionalServices?cleaner=${cleaner.user_email}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-gray-600 font-verdana">Finding perfect cleaners for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 rounded-full font-fredoka"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite">
                Available Cleaners for You
              </h1>
              <p className="text-gray-600 font-verdana">
                Showing {cleaners.length} verified cleaner{cleaners.length !== 1 ? 's' : ''} • Sorted by tier & rating
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          {bookingData && (
            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">Service</p>
                    <p className="font-fredoka font-bold text-graphite capitalize">{bookingData.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">Date & Time</p>
                    <p className="font-fredoka font-bold text-graphite">
                      {new Date(bookingData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {bookingData.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">Duration</p>
                    <p className="font-fredoka font-bold text-graphite">{bookingData.recommendedHours} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-verdana mb-1">Add-Ons</p>
                    <p className="font-fredoka font-bold text-graphite">{Object.keys(addOns).length} selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-2 border-purple-200 bg-purple-50 rounded-2xl">
          <Award className="w-5 h-5 text-purple-600" />
          <AlertDescription className="font-verdana text-gray-700">
            <strong>Tier Priority:</strong> Higher-tier cleaners appear first because they have proven track records of excellence. All cleaners are verified and background-checked.
          </AlertDescription>
        </Alert>

        {/* Cleaners List */}
        <div className="space-y-6">
          {cleaners.length > 0 ? (
            cleaners.map((cleaner, idx) => (
              <motion.div
                key={cleaner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-4 gap-6 p-6">
                      {/* Profile Section */}
                      <div className="lg:col-span-1">
                        <div className="relative">
                          {cleaner.profile_photo_url ? (
                            <img
                              src={cleaner.profile_photo_url}
                              alt={cleaner.full_name}
                              className="w-full h-48 object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-48 brand-gradient rounded-xl flex items-center justify-center">
                              <span className="text-5xl text-white font-fredoka font-bold">
                                {cleaner.full_name?.[0] || 'C'}
                              </span>
                            </div>
                          )}
                          <Badge 
                            className="absolute top-3 right-3 font-fredoka font-bold shadow-lg"
                            style={{
                              backgroundColor: cleaner.tier === 'Elite' ? '#FBBF24' :
                                             cleaner.tier === 'Pro' ? '#66B3FF' :
                                             cleaner.tier === 'Semi Pro' ? '#00D4FF' : '#9CA3AF',
                              color: 'white'
                            }}
                          >
                            {cleaner.tier}
                          </Badge>
                        </div>
                        <h3 className="font-fredoka font-bold text-xl text-graphite mt-3">
                          {cleaner.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-fredoka font-semibold text-graphite">
                            {cleaner.average_rating?.toFixed(1) || '5.0'}
                          </span>
                          <span className="text-sm text-gray-500 font-verdana">
                            ({cleaner.total_reviews || 0} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="lg:col-span-2">
                        {cleaner.bio && (
                          <p className="text-gray-600 font-verdana mb-4 line-clamp-3">
                            {cleaner.bio}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 font-verdana mb-1">Base Rate</p>
                            <p className="font-fredoka font-bold text-graphite">
                              {cleaner.base_rate_credits_per_hour || 300} credits/hr
                            </p>
                            <p className="text-xs text-gray-500 font-verdana">
                              ≈ ${((cleaner.base_rate_credits_per_hour || 300) / 10).toFixed(0)}/hr
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana mb-1">Reliability</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${cleaner.reliability_score || 75}%`,
                                    backgroundColor: cleaner.reliability_score >= 90 ? '#28C76F' :
                                                   cleaner.reliability_score >= 75 ? '#66B3FF' : '#9CA3AF'
                                  }}
                                />
                              </div>
                              <span className="font-fredoka font-bold text-sm">
                                {cleaner.reliability_score || 75}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {cleaner.specialty_tags && cleaner.specialty_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {cleaner.specialty_tags.slice(0, 5).map((tag, i) => (
                              <Badge key={i} variant="outline" className="rounded-full font-fredoka text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Section */}
                      <div className="lg:col-span-1 flex flex-col justify-center">
                        <div className="space-y-3">
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 text-center">
                            <p className="text-sm text-gray-600 font-verdana mb-1">Estimated Total</p>
                            <p className="text-3xl font-fredoka font-bold text-purple-600">
                              {Math.round((cleaner.base_rate_credits_per_hour || 300) * (bookingData?.recommendedHours || 3))}
                            </p>
                            <p className="text-xs text-gray-500 font-verdana">credits</p>
                          </div>

                          <Button
                            onClick={() => handleSelectCleaner(cleaner)}
                            className="w-full brand-gradient text-white rounded-full font-fredoka font-bold py-6 shadow-xl hover:shadow-2xl"
                          >
                            Select Cleaner
                          </Button>

                          <Button
                            onClick={() => navigate(createPageUrl(`CleanerProfile?email=${cleaner.user_email}`))}
                            variant="outline"
                            className="w-full rounded-full font-fredoka font-semibold border-2"
                          >
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="font-fredoka font-bold text-graphite text-2xl mb-2">
                  No cleaners available
                </h3>
                <p className="text-gray-600 font-verdana mb-6">
                  Try adjusting your date/time or location
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="brand-gradient text-white rounded-full font-fredoka font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back & Adjust
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}