import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, Clock, MapPin, Star, Search, Filter, Loader2, 
  ArrowRight, User, Droplets, Wind, Package, CheckCircle, 
  AlertCircle, XCircle, Sparkles, TrendingUp 
} from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { convertTo12Hour } from '../components/utils/timeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import BookingDetailsModal from '../components/booking/BookingDetailsModal';

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [cleanerProfiles, setCleanerProfiles] = useState({});
  const [reviews, setReviews] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, timeFilter, bookings]);

  const loadBookings = async () => {
    try {
      const user = await base44.auth.me();
      const userBookings = await base44.entities.Booking.filter({ client_email: user.email }, '-date');
      setBookings(userBookings);

      // Load cleaner profiles
      const cleanerEmails = [...new Set(userBookings.map(b => b.cleaner_email).filter(Boolean))];
      const profiles = {};
      for (const email of cleanerEmails) {
        const cleanerProfs = await base44.entities.CleanerProfile.filter({ user_email: email });
        if (cleanerProfs.length > 0) {
          profiles[email] = cleanerProfs[0];
        }
      }
      setCleanerProfiles(profiles);

      // Load reviews
      const reviewsMap = {};
      for (const booking of userBookings) {
        const bookingReviews = await base44.entities.Review.filter({ booking_id: booking.id });
        if (bookingReviews.length > 0) {
          reviewsMap[booking.id] = bookingReviews[0];
        }
      }
      setReviews(reviewsMap);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading bookings:', showToast: false });
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.cleaner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanerProfiles[b.cleaner_email]?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date);
        return isFuture(bookingDate) || bookingDate.toDateString() === new Date().toDateString();
      });
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.date);
        return isPast(bookingDate) && bookingDate.toDateString() !== new Date().toDateString();
      });
    }

    setFilteredBookings(filtered);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700', icon: Calendar },
      accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      on_the_way: { label: 'On The Way', className: 'bg-cyan-100 text-cyan-700', icon: TrendingUp },
      in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700', icon: Loader2 },
      awaiting_client: { label: 'Awaiting Review', className: 'bg-purple-100 text-purple-700', icon: Star },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600', icon: XCircle },
      disputed: { label: 'Disputed', className: 'bg-red-100 text-red-700', icon: AlertCircle }
    };
    
    const { label, className, icon: Icon } = config[status] || config.scheduled;
    return (
      <Badge className={`${className} rounded-full font-fredoka flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getCleaningIcon = (type) => {
    switch(type) {
      case 'deep': return <Droplets className="w-4 h-4" />;
      case 'moveout': return <Package className="w-4 h-4" />;
      default: return <Wind className="w-4 h-4" />;
    }
  };

  const groupBookingsByMonth = (bookings) => {
    const groups = {};
    bookings.forEach(booking => {
      const monthKey = format(parseISO(booking.date), 'MMMM yyyy');
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(booking);
    });
    return groups;
  };

  const groupedBookings = groupBookingsByMonth(filteredBookings);

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-cloud via-blue-50/30 to-soft-cloud p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-puretask-blue to-cyan-500 p-3 rounded-2xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-graphite">Booking History</h1>
              <p className="text-lg text-gray-600 font-verdana">Track all your cleanings in one place</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-blue-100 text-blue-700 font-fredoka px-4 py-2 text-base">
              {bookings.length} Total Bookings
            </Badge>
            <Badge className="bg-green-100 text-green-700 font-fredoka px-4 py-2 text-base">
              {bookings.filter(b => ['completed', 'approved'].includes(b.status)).length} Completed
            </Badge>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-0 shadow-xl rounded-3xl bg-white">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by address, cleaner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 font-verdana rounded-2xl h-12 border-2"
                  />
                </div>
                
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="rounded-2xl font-verdana h-12 border-2">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-2xl font-verdana h-12 border-2">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="on_the_way">On The Way</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="awaiting_client">Awaiting Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grouped Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedBookings).map(([month, monthBookings], monthIdx) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: monthIdx * 0.1 }}
              >
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-gradient-to-r from-puretask-blue to-transparent flex-1"></div>
                  <h2 className="text-xl font-fredoka font-bold text-graphite px-4 py-2 bg-blue-50 rounded-2xl">
                    {month}
                  </h2>
                  <div className="h-px bg-gradient-to-l from-puretask-blue to-transparent flex-1"></div>
                </div>

                {/* Month's Bookings */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {monthBookings.map((booking, idx) => {
                      const cleaner = cleanerProfiles[booking.cleaner_email];
                      const review = reviews[booking.id];
                      
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Card
                            className="border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer rounded-3xl overflow-hidden bg-white"
                            onClick={() => handleBookingClick(booking)}
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* Date Badge */}
                                <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-2">
                                  <div className="w-20 h-20 bg-gradient-to-br from-puretask-blue to-cyan-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                                    <span className="text-sm font-verdana opacity-90">
                                      {format(parseISO(booking.date), 'MMM')}
                                    </span>
                                    <span className="text-3xl font-fredoka font-bold">
                                      {format(parseISO(booking.date), 'd')}
                                    </span>
                                  </div>
                                  <div className="lg:hidden flex-1">
                                    <p className="font-fredoka font-bold text-graphite text-lg">
                                      {format(parseISO(booking.date), 'EEEE')}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-verdana">
                                      <Clock className="w-4 h-4 text-puretask-blue" />
                                      {convertTo12Hour(booking.start_time)}
                                    </div>
                                  </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 space-y-4">
                                  {/* Top Row - Time & Status */}
                                  <div className="hidden lg:flex items-start justify-between">
                                    <div>
                                      <h3 className="font-fredoka font-bold text-graphite text-xl mb-1">
                                        {format(parseISO(booking.date), 'EEEE, MMMM d')}
                                      </h3>
                                      <div className="flex items-center gap-3 text-gray-600 font-verdana">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4 text-puretask-blue" />
                                          {convertTo12Hour(booking.start_time)}
                                        </span>
                                        <span>•</span>
                                        <span>{booking.hours} hours</span>
                                      </div>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                  </div>

                                  {/* Mobile Status */}
                                  <div className="lg:hidden">
                                    {getStatusBadge(booking.status)}
                                  </div>

                                  {/* Address */}
                                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-2xl">
                                    <div className="bg-white p-2 rounded-xl">
                                      <MapPin className="w-4 h-4 text-puretask-blue" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500 font-verdana uppercase mb-1">Location</p>
                                      <p className="text-sm font-verdana text-graphite font-medium">{booking.address}</p>
                                    </div>
                                  </div>

                                  {/* Cleaner Info */}
                                  {cleaner && (
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl">
                                      <div className="relative">
                                        {cleaner.profile_photo_url ? (
                                          <img 
                                            src={cleaner.profile_photo_url} 
                                            alt={cleaner.full_name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-fredoka font-bold text-lg shadow">
                                            {cleaner.full_name?.charAt(0) || 'C'}
                                          </div>
                                        )}
                                        {cleaner.admin_verified && (
                                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-verdana uppercase">Cleaner</p>
                                        <p className="text-sm font-fredoka font-bold text-graphite">{cleaner.full_name || cleaner.user_email}</p>
                                        {cleaner.average_rating && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                                            <span className="text-xs font-verdana text-gray-600">{cleaner.average_rating.toFixed(1)}</span>
                                          </div>
                                        )}
                                      </div>
                                      <Badge className="bg-purple-200 text-purple-700 text-xs font-fredoka border-0">
                                        {cleaner.tier || 'Pro'}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* Bottom Row - Tags & Price */}
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-fredoka flex items-center gap-1">
                                        {getCleaningIcon(booking.cleaning_type)}
                                        <span className="capitalize">{booking.cleaning_type || 'basic'}</span>
                                      </Badge>
                                      {review ? (
                                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-fredoka flex items-center gap-1">
                                          <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                                              />
                                            ))}
                                          </div>
                                        </Badge>
                                      ) : booking.status === 'awaiting_client' && (
                                        <Badge className="bg-purple-100 text-purple-700 rounded-xl font-fredoka flex items-center gap-1 animate-pulse">
                                          <Star className="w-3 h-3" />
                                          Review Now
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="text-2xl font-fredoka font-bold text-graphite">
                                          {Math.round(booking.total_price)}
                                        </p>
                                        <p className="text-xs text-gray-500 font-verdana">
                                          credits (${booking.total_price.toFixed(2)})
                                        </p>
                                      </div>
                                      <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-16 text-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-puretask-blue/5 to-cyan-500/5"></div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Calendar className="w-24 h-24 text-puretask-blue mx-auto mb-6 opacity-80" />
                </motion.div>
                <h3 className="text-3xl font-fredoka font-bold text-graphite mb-3 relative z-10">No Bookings Found</h3>
                <p className="text-gray-600 text-lg mb-8 font-verdana relative z-10">
                  {searchTerm || statusFilter !== 'all' || timeFilter !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'Start your journey to a cleaner home today'}
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('BrowseCleaners'))}
                  className="brand-gradient text-white rounded-2xl font-fredoka font-semibold px-10 h-14 text-lg shadow-xl hover:shadow-2xl transition-all relative z-10"
                >
                  <Search className="w-5 h-5 mr-3" />
                  Browse Cleaners
                  <Sparkles className="w-5 h-5 ml-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      </div>
    </div>
  );
}