import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Sparkles, Clock, Star, Heart, Calendar, TrendingUp, Gift, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getHours } from 'date-fns';

export default function AIPersonalizedRecommendations({ clientEmail, onSelectCleaner, onSelectTime, onSelectAddOn }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);

  useEffect(() => {
    if (clientEmail) {
      loadRecommendations();
    }
  }, [clientEmail]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);

      // Load client profile
      const profiles = await base44.entities.ClientProfile.filter({ user_email: clientEmail });
      const profile = profiles[0];
      setClientProfile(profile);

      // Load booking history
      const bookings = await base44.entities.Booking.filter(
        { client_email: clientEmail, status: { $in: ['completed', 'approved'] } },
        '-date',
        20
      );
      setBookingHistory(bookings);

      // Analyze patterns
      const recommendations = await analyzeAndRecommend(profile, bookings);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAndRecommend = async (profile, bookings) => {
    // Analyze booking patterns
    const preferredDays = {};
    const preferredTimes = {};
    const cleanerFrequency = {};
    const serviceTypes = {};
    const addOns = {};

    bookings.forEach(booking => {
      // Day preferences
      const day = new Date(booking.date).getDay();
      preferredDays[day] = (preferredDays[day] || 0) + 1;

      // Time preferences
      const hour = getHours(new Date(`2000-01-01T${booking.start_time}`));
      const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      preferredTimes[timeSlot] = (preferredTimes[timeSlot] || 0) + 1;

      // Cleaner preferences
      if (booking.cleaner_email) {
        cleanerFrequency[booking.cleaner_email] = (cleanerFrequency[booking.cleaner_email] || 0) + 1;
      }

      // Service types
      serviceTypes[booking.cleaning_type] = (serviceTypes[booking.cleaning_type] || 0) + 1;

      // Add-ons
      if (booking.additional_services) {
        Object.keys(booking.additional_services).forEach(service => {
          addOns[service] = (addOns[service] || 0) + 1;
        });
      }
    });

    // Get most preferred day
    const topDay = Object.entries(preferredDays).sort((a, b) => b[1] - a[1])[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const preferredDay = topDay ? dayNames[topDay[0]] : null;

    // Get most preferred time
    const topTime = Object.entries(preferredTimes).sort((a, b) => b[1] - a[1])[0];
    const preferredTimeSlot = topTime ? topTime[0] : 'morning';

    // Get favorite cleaners
    const topCleaners = Object.entries(cleanerFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const favoriteCleanerEmails = topCleaners.map(([email]) => email);
    const favoriteCleaners = [];
    for (const email of favoriteCleanerEmails) {
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: email });
      if (cleanerProfiles.length > 0) {
        favoriteCleaners.push(cleanerProfiles[0]);
      }
    }

    // Get frequently used add-ons
    const topAddOns = Object.entries(addOns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([service]) => service);

    // Determine promotional offer
    const totalBookings = bookings.length;
    let promotionalOffer = null;
    
    if (totalBookings === 0) {
      promotionalOffer = {
        type: 'first_booking',
        title: 'Welcome Bonus',
        description: 'Get 15% off your first booking!',
        discount: 15,
        code: 'WELCOME15'
      };
    } else if (totalBookings >= 5 && !profile.membership_active) {
      promotionalOffer = {
        type: 'membership',
        title: 'Upgrade to Plus',
        description: 'Save 10% on all bookings with Plus membership',
        discount: 10
      };
    } else if (totalBookings >= 3) {
      const lastBooking = bookings[0];
      const daysSinceLastBooking = Math.floor((Date.now() - new Date(lastBooking.date)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastBooking > 60) {
        promotionalOffer = {
          type: 'comeback',
          title: 'We Miss You!',
          description: 'Get 20% off your next booking',
          discount: 20,
          code: 'COMEBACK20'
        };
      }
    }

    return {
      favoriteCleaners,
      preferredDay,
      preferredTimeSlot,
      topAddOns,
      promotionalOffer,
      bookingCount: totalBookings,
      patterns: {
        hasPattern: totalBookings >= 3,
        frequency: totalBookings >= 5 ? 'regular' : totalBookings >= 2 ? 'occasional' : 'new'
      }
    };
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-verdana">Analyzing your preferences...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || !recommendations.patterns.hasPattern) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* AI Badge */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-fredoka font-bold text-graphite">AI Recommendations</h3>
        <Badge className="bg-purple-500 text-white border-0 font-fredoka">Personalized</Badge>
      </div>

      {/* Promotional Offer */}
      {recommendations.promotionalOffer && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-fredoka font-bold text-graphite mb-1">
                    {recommendations.promotionalOffer.title}
                  </h4>
                  <p className="text-sm text-gray-700 font-verdana mb-2">
                    {recommendations.promotionalOffer.description}
                  </p>
                  {recommendations.promotionalOffer.code && (
                    <Badge className="bg-green-600 text-white border-0 font-fredoka">
                      Code: {recommendations.promotionalOffer.code}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Favorite Cleaners */}
      {recommendations.favoriteCleaners.length > 0 && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-fredoka flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              Your Favorite Cleaners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.favoriteCleaners.slice(0, 2).map((cleaner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all cursor-pointer"
                onClick={() => onSelectCleaner && onSelectCleaner(cleaner)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-fredoka font-bold">
                    {cleaner.full_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite text-sm">{cleaner.full_name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600 font-verdana">{cleaner.average_rating?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Optimal Timing */}
      {recommendations.preferredDay && (
        <Card className="border-2 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-fredoka flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              Best Time for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <div>
                <p className="text-sm font-verdana text-gray-700 mb-1">
                  You usually book on <span className="font-semibold">{recommendations.preferredDay}</span>
                </p>
                <p className="text-sm font-verdana text-gray-700">
                  in the <span className="font-semibold capitalize">{recommendations.preferredTimeSlot}</span>
                </p>
              </div>
              <Calendar className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Add-ons */}
      {recommendations.topAddOns.length > 0 && (
        <Card className="border-2 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-fredoka flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Services You Love
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendations.topAddOns.map((addOn, idx) => (
                <Badge
                  key={idx}
                  className="bg-amber-100 text-amber-800 border-amber-300 font-verdana cursor-pointer hover:bg-amber-200"
                  onClick={() => onSelectAddOn && onSelectAddOn(addOn)}
                >
                  {addOn.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}