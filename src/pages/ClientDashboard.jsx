import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Heart, RefreshCw, Search, Wallet, Users, Gift,
  History, MessageSquare, Star, TrendingUp, Sparkles, ChevronRight,
  Loader2, Clock, CheckCircle, Home, Droplets, Wind, Package,
  MapPin, ArrowRight, Zap, HelpCircle, Settings, Plus, Repeat,
  Timer, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isPast, isFuture, parseISO, differenceInHours, differenceInMinutes, differenceInDays } from 'date-fns';
import LiveBookingStatus from '@/components/booking/LiveBookingStatus';
import CreditWallet from '@/components/credits/CreditWallet';
import { convertTo12Hour } from '@/components/utils/timeUtils';
import FAQChatbot from '@/components/chat/FAQChatbot';
import SmartMatchExplainer from '../components/matching/SmartMatchExplainer';
import MembershipExplainer from '../components/membership/MembershipExplainer';
import LoyaltyExplainer from '../components/loyalty/LoyaltyExplainer';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [recurringCount, setRecurringCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cleanerProfiles, setCleanerProfiles] = useState({});
  const [bookingReviews, setBookingReviews] = useState({});
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'client') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Load client profile
      const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
        
        // If onboarding not completed, redirect to onboarding
        if (!profiles[0].onboarding_completed) {
          navigate(createPageUrl('ClientOnboarding'));
          return;
        }
      } else {
        // No profile exists, redirect to onboarding
        navigate(createPageUrl('ClientOnboarding'));
        return;
      }

      // Load bookings
      const allBookings = await base44.entities.Booking.filter(
        { client_email: currentUser.email },
        '-date'
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = allBookings.filter(b => {
        if (!b.date) return false;
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        const isUpcoming = bookingDate >= today;
        const isValidStatus = ['created', 'payment_hold', 'awaiting_cleaner_response', 'accepted', 'scheduled', 'on_the_way', 'in_progress'].includes(b.status);
        return isUpcoming && isValidStatus;
      });
      const recent = allBookings.filter(b => 
        ['completed', 'approved'].includes(b.status)
      ).slice(0, 3);

      setUpcomingBookings(upcoming);
      setRecentBookings(recent);

      // Load favorites count
      const favorites = await base44.entities.FavoriteCleaner.filter({ client_email: currentUser.email });
      setFavoriteCount(favorites.length);

      // Load recurring count
      const recurring = await base44.entities.RecurringBooking.filter({ 
        client_email: currentUser.email,
        is_active: true 
      });
      setRecurringCount(recurring.length);

      // Load unread messages
      const threads = await base44.entities.ConversationThread.filter({
        participants: { $in: [currentUser.email] }
      });
      const unread = threads.reduce((sum, t) => sum + (t.unread_count_client || 0), 0);
      setUnreadMessages(unread);

      // Load cleaner profiles for upcoming bookings
      const cleanerEmails = [...new Set(upcoming.map(b => b.cleaner_email).filter(Boolean))];
      const cleanerProfilesMap = {};
      for (const email of cleanerEmails) {
        const cleanerProfs = await base44.entities.CleanerProfile.filter({ user_email: email });
        if (cleanerProfs.length > 0) {
          cleanerProfilesMap[email] = cleanerProfs[0];
        }
      }
      setCleanerProfiles(cleanerProfilesMap);

      // Load reviews for recent bookings
      const reviews = {};
      for (const booking of recent) {
        const bookingReviews = await base44.entities.Review.filter({ booking_id: booking.id });
        if (bookingReviews.length > 0) {
          reviews[booking.id] = bookingReviews[0];
        }
      }
      setBookingReviews(reviews);

    } catch (error) {
      handleError(error, { userMessage: 'Error loading dashboard:', showToast: false });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;
  const nextCleaner = nextBooking?.cleaner_email ? cleanerProfiles[nextBooking.cleaner_email] : null;

  const getCleaningIcon = (type) => {
    switch(type) {
      case 'deep': return <Droplets className="w-5 h-5" />;
      case 'moveout': return <Package className="w-5 h-5" />;
      default: return <Wind className="w-5 h-5" />;
    }
  };

  const getStatusProgress = (status) => {
    const statusMap = {
      'created': 10,
      'payment_hold': 20,
      'awaiting_cleaner_response': 30,
      'accepted': 50,
      'scheduled': 60,
      'on_the_way': 80,
      'in_progress': 90,
      'completed': 100
    };
    return statusMap[status] || 0;
  };

  const getStatusColor = (status) => {
    if (['on_the_way', 'in_progress'].includes(status)) return 'bg-green-500';
    if (['accepted', 'scheduled'].includes(status)) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getCountdownText = (booking) => {
    if (!booking) return null;
    const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
    const now = new Date();
    
    const days = differenceInDays(bookingDateTime, now);
    const hours = differenceInHours(bookingDateTime, now);
    const minutes = differenceInMinutes(bookingDateTime, now);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} min`;
    return 'Starting soon';
  };

  const handleBookAgain = (booking) => {
    // Save booking details to draft for quick rebooking
    localStorage.setItem('quickRebookDraft', JSON.stringify({
      cleaner_email: booking.cleaner_email,
      hours: booking.hours,
      cleaning_type: booking.cleaning_type,
      address: booking.address,
      bedrooms: booking.bedrooms,
      bathrooms: booking.bathrooms
    }));
    navigate(createPageUrl('BrowseCleaners'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-cloud via-blue-50/30 to-soft-cloud p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-white to-blue-50/50 p-8 shadow-lg border border-blue-100"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-puretask-blue/10 to-transparent rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Sparkles className="w-8 h-8 text-puretask-blue" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-graphite">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
              </h1>
            </div>
            <p className="text-gray-600 font-verdana text-lg">Your home's cleanliness, managed effortlessly</p>
          </div>
        </motion.div>

        {/* Next Cleaning - Enhanced Hero Section */}
        {nextBooking ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div className="relative bg-gradient-to-br from-puretask-blue via-blue-500 to-cyan-500 p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        {getCleaningIcon(nextBooking.cleaning_type)}
                      </div>
                      <div>
                        <p className="text-sm font-fredoka font-semibold uppercase tracking-wide opacity-90">Next Cleaning</p>
                        <p className="text-xs opacity-75 font-verdana capitalize">{nextBooking.cleaning_type || 'basic'} clean</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 rounded-full font-fredoka px-4 py-1.5 backdrop-blur-sm">
                      {nextBooking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                   <h2 className="text-4xl font-fredoka font-bold">
                     {format(parseISO(nextBooking.date), 'EEEE, MMMM d')}
                   </h2>
                   <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                     <Timer className="w-5 h-5" />
                     <div>
                       <p className="text-xs opacity-75 font-verdana">in</p>
                       <p className="text-lg font-fredoka font-bold">{getCountdownText(nextBooking)}</p>
                     </div>
                   </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 opacity-80" />
                        <p className="text-sm opacity-80 font-verdana">Time</p>
                      </div>
                      <p className="text-2xl font-fredoka font-bold">{convertTo12Hour(nextBooking.start_time)}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 opacity-80" />
                        <p className="text-sm opacity-80 font-verdana">Duration</p>
                      </div>
                      <p className="text-2xl font-fredoka font-bold">{nextBooking.hours} hours</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-verdana opacity-90">Booking Progress</p>
                      <p className="text-sm font-fredoka font-bold">{getStatusProgress(nextBooking.status)}%</p>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getStatusProgress(nextBooking.status)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${getStatusColor(nextBooking.status)} rounded-full`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 bg-gradient-to-br from-white to-blue-50/30">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <MapPin className="w-5 h-5 text-puretask-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-verdana uppercase mb-1">Address</p>
                      <p className="text-sm font-verdana text-graphite font-medium">{nextBooking.address}</p>
                    </div>
                  </div>

                  {nextCleaner && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="relative">
                        {nextCleaner.profile_photo_url ? (
                          <img 
                            src={nextCleaner.profile_photo_url} 
                            alt={nextCleaner.full_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-puretask-blue"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-puretask-blue to-cyan-500 flex items-center justify-center text-white font-fredoka font-bold text-xl border-2 border-white shadow-lg">
                            {nextCleaner.full_name?.charAt(0) || 'C'}
                          </div>
                        )}
                        {nextCleaner.admin_verified && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-verdana uppercase mb-1">Your Cleaner</p>
                        <p className="text-base font-fredoka font-bold text-graphite">{nextCleaner.full_name || nextCleaner.user_email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-verdana text-gray-600">{nextCleaner.average_rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <Badge className="bg-blue-50 text-puretask-blue text-xs font-fredoka border-0">{nextCleaner.tier || 'Pro'}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => navigate(createPageUrl(`BookingHistory?id=${nextBooking.id}`))}
                    className="flex-1 brand-gradient text-white rounded-2xl font-fredoka font-semibold h-12 shadow-lg hover:shadow-xl transition-all"
                  >
                    View Full Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl('Inbox'))}
                    variant="outline"
                    className="rounded-2xl font-fredoka font-semibold h-12 px-6 border-2 hover:bg-blue-50"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-puretask-blue/5 to-cyan-500/5"></div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Calendar className="w-20 h-20 text-puretask-blue mx-auto mb-6 opacity-80" />
                </motion.div>
                <h3 className="text-3xl font-fredoka font-bold text-graphite mb-3 relative z-10">No Upcoming Cleanings</h3>
                <p className="text-gray-600 font-verdana text-lg mb-8 relative z-10">Ready for a fresh, sparkling clean space?</p>
                <Button
                  onClick={() => navigate(createPageUrl('BrowseCleaners'))}
                  className="brand-gradient text-white rounded-2xl font-fredoka font-semibold px-10 h-14 text-lg shadow-xl hover:shadow-2xl transition-all relative z-10"
                >
                  <Search className="w-5 h-5 mr-3" />
                  Book Your First Cleaning
                  <Sparkles className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Explainers Row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <SmartMatchExplainer />
          <MembershipExplainer />
          <LoyaltyExplainer />
        </div>

        {/* Credits & Enhanced Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CreditWallet clientProfile={clientProfile} onUpdate={loadDashboardData} />
          
          <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-white to-blue-50/20">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-puretask-blue" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate(createPageUrl('BrowseCleaners'))}
                  className="w-full justify-between brand-gradient text-white rounded-2xl font-fredoka font-semibold h-14 shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-xl mr-3">
                      <Search className="w-5 h-5" />
                    </div>
                    <span>Book Single Cleaning</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate(createPageUrl('MultiBooking'))}
                  variant="outline"
                  className="w-full justify-between rounded-2xl font-fredoka font-semibold h-14 border-2 hover:bg-blue-50 hover:border-puretask-blue transition-all group"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-xl mr-3">
                      <Calendar className="w-5 h-5 text-puretask-blue" />
                    </div>
                    <span>Book Multiple Dates</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate(createPageUrl('BookingHistory'))}
                  variant="outline"
                  className="w-full justify-between rounded-2xl font-fredoka font-semibold h-14 border-2 hover:bg-blue-50 hover:border-puretask-blue transition-all group"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-xl mr-3">
                      <History className="w-5 h-5 text-puretask-blue" />
                    </div>
                    <span>View All Bookings</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* Modernized Activity Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Card 
              className="border-0 shadow-lg rounded-3xl cursor-pointer hover:shadow-2xl transition-all bg-gradient-to-br from-blue-50 to-white"
              onClick={() => navigate(createPageUrl('BookingHistory'))}
            >
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-puretask-blue" />
                </div>
                <p className="text-4xl font-fredoka font-bold text-graphite mb-1">{upcomingBookings.length}</p>
                <p className="text-sm text-gray-600 font-verdana font-medium">Upcoming</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Card 
              className="border-0 shadow-lg rounded-3xl cursor-pointer hover:shadow-2xl transition-all bg-gradient-to-br from-red-50 to-white"
              onClick={() => navigate(createPageUrl('FavoriteCleaners'))}
            >
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
                </div>
                <p className="text-4xl font-fredoka font-bold text-graphite mb-1">{favoriteCount}</p>
                <p className="text-sm text-gray-600 font-verdana font-medium">Favorites</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Card 
              className="border-0 shadow-lg rounded-3xl cursor-pointer hover:shadow-2xl transition-all bg-gradient-to-br from-purple-50 to-white"
              onClick={() => navigate(createPageUrl('RecurringBookings'))}
            >
              <CardContent className="p-6 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-4xl font-fredoka font-bold text-graphite mb-1">{recurringCount}</p>
                <p className="text-sm text-gray-600 font-verdana font-medium">Recurring</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Card 
              className="border-0 shadow-lg rounded-3xl cursor-pointer hover:shadow-2xl transition-all bg-gradient-to-br from-green-50 to-white"
              onClick={() => navigate(createPageUrl('Inbox'))}
            >
              <CardContent className="p-6 text-center relative">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-4xl font-fredoka font-bold text-graphite mb-1">{unreadMessages}</p>
                <p className="text-sm text-gray-600 font-verdana font-medium">Messages</p>
                {unreadMessages > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full shadow-lg"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Profile & Help Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Quick Profile Card */}
          <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-white to-purple-50/20">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite text-xl flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-puretask-blue to-purple-500 flex items-center justify-center text-white font-fredoka font-bold text-2xl shadow-lg">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-fredoka font-bold text-graphite text-lg">{user?.full_name}</p>
                  <p className="text-sm text-gray-600 font-verdana">{user?.email}</p>
                  {clientProfile?.membership_tier && clientProfile.membership_tier !== 'Standard' && (
                    <Badge className="mt-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 font-fredoka">
                      {clientProfile.membership_tier} Member
                    </Badge>
                  )}
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate(createPageUrl('Profile'))}
                  variant="outline"
                  className="w-full rounded-2xl font-fredoka font-semibold h-12 border-2 hover:bg-purple-50 hover:border-purple-400 transition-all group"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Manage Profile & Settings
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* Quick Help Card */}
          <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-white to-cyan-50/20">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite text-xl flex items-center gap-2">
                <div className="bg-cyan-100 p-2 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-cyan-600" />
                </div>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-verdana mb-4">
                We're here to help! Get answers to common questions or reach out to our support team.
              </p>
              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate(createPageUrl('Support'))}
                    variant="outline"
                    className="w-full rounded-2xl font-fredoka font-semibold h-12 border-2 hover:bg-cyan-50 hover:border-cyan-400 transition-all group justify-between"
                  >
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Visit Help Center
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate(createPageUrl('Inbox'))}
                    variant="outline"
                    className="w-full rounded-2xl font-fredoka font-semibold h-12 border-2 hover:bg-cyan-50 hover:border-cyan-400 transition-all group justify-between"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Contact Support
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Completions */}
        {recentBookings.length > 0 && (
          <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-white to-green-50/20">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite text-xl flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                Recent Completions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBookings.slice(0, 3).map((booking) => {
                const review = bookingReviews[booking.id];
                return (
                  <motion.div 
                    key={booking.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-xl">
                        {getCleaningIcon(booking.cleaning_type)}
                      </div>
                      <div>
                        <p className="font-fredoka font-bold text-graphite text-base">
                          {format(parseISO(booking.date), 'MMM d, yyyy')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-600 font-verdana">{booking.hours} hours</p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-600 font-verdana capitalize">{booking.cleaning_type || 'basic'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                     {review ? (
                       <div className="flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl">
                         {[...Array(5)].map((_, i) => (
                           <Star 
                             key={i} 
                             className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                           />
                         ))}
                       </div>
                     ) : (
                       <Button
                         size="sm"
                         className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-fredoka font-semibold shadow-md hover:shadow-lg transition-all"
                         onClick={() => navigate(createPageUrl(`BookingHistory?review=${booking.id}`))}
                       >
                         <Star className="w-4 h-4 mr-2 fill-current" />
                         Leave Review
                       </Button>
                     )}
                     <Button
                       size="sm"
                       variant="outline"
                       className="rounded-xl font-fredoka font-semibold border-2"
                       onClick={() => handleBookAgain(booking)}
                     >
                       <Repeat className="w-4 h-4 mr-2" />
                       Book Again
                     </Button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Floating Book Button */}
        {showFloatingButton && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(createPageUrl('BrowseCleaners'))}
              className="w-16 h-16 rounded-full brand-gradient text-white shadow-2xl flex items-center justify-center group relative"
            >
              <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute -top-12 right-0 bg-graphite text-white px-4 py-2 rounded-lg text-sm font-fredoka whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Book a Cleaning
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* FAQ Chatbot */}
      {user && <FAQChatbot agentName="clientFAQChatbot" title="Client Assistant" userType="client" />}
    </div>
  );
}