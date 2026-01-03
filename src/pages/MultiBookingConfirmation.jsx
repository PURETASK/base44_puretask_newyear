import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, AlertCircle, Calendar, MapPin, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MultiBookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const groupId = searchParams.get('group');

  const [bookingGroup, setBookingGroup] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (bookingGroup && bookings.length > 0) {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [bookingGroup, bookings]);

  const loadData = async () => {
    try {
      if (!groupId) {
        navigate(createPageUrl('ClientDashboard'));
        return;
      }

      // Load booking group
      const groups = await base44.entities.BookingGroup.filter({ id: groupId });
      if (groups.length === 0) {
        navigate(createPageUrl('ClientDashboard'));
        return;
      }

      const group = groups[0];
      setBookingGroup(group);

      // Load all bookings in this group
      if (group.booking_ids && group.booking_ids.length > 0) {
        const bookingPromises = group.booking_ids.map(id => 
          base44.entities.Booking.filter({ id }).then(results => results[0])
        );
        const loadedBookings = await Promise.all(bookingPromises);
        setBookings(loadedBookings.filter(b => b)); // Filter out any null results
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading confirmation:', showToast: false });
    }
    setLoading(false);
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      basic: 'Basic Clean',
      deep: 'Deep Clean',
      moveout: 'Move-Out Clean'
    };
    return labels[type] || type;
  };

  const getServiceTypeBadgeClass = (type) => {
    const classes = {
      basic: 'bg-blue-100 text-blue-700 border-blue-300',
      deep: 'bg-purple-100 text-purple-700 border-purple-300',
      moveout: 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return classes[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (!bookingGroup) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center p-6">
        <Card className="max-w-md border-red-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-fredoka font-bold text-graphite mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6 font-verdana">The booking group could not be found.</p>
            <Button onClick={() => navigate(createPageUrl('ClientDashboard'))} className="brand-gradient text-white rounded-full font-fredoka">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-4 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 brand-gradient rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-fredoka font-bold text-graphite mb-3">Bookings Confirmed!</h1>
          <p className="text-xl text-gray-600 font-verdana">
            Your {bookings.length} cleaning appointments have been scheduled
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl rounded-2xl mb-6">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Sparkles className="w-6 h-6 text-green-600" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-fredoka font-bold text-puretask-blue">{bookings.length}</p>
                  <p className="text-sm text-gray-600 font-verdana">Cleanings Booked</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-fredoka font-bold text-purple-600">
                    {bookingGroup.final_total_price_credits}
                  </p>
                  <p className="text-sm text-gray-600 font-verdana">Total Credits</p>
                </div>
                {bookingGroup.total_discount_credits > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-fredoka font-bold text-green-600">
                      {bookingGroup.total_discount_credits}
                    </p>
                    <p className="text-sm text-gray-600 font-verdana">Credits Saved</p>
                  </div>
                )}
              </div>

              {bookingGroup.applied_bundle_offer_name && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <p className="font-fredoka font-semibold text-green-800">
                    🎉 {bookingGroup.applied_bundle_offer_name} Applied!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
              <CardTitle className="font-fredoka text-graphite">Your Scheduled Cleanings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-puretask-blue transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge className={`${getServiceTypeBadgeClass(booking.cleaning_type)} border rounded-full font-fredoka`}>
                      {getServiceTypeLabel(booking.cleaning_type)}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-green-300 border rounded-full font-fredoka">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-puretask-blue" />
                      <span className="font-verdana font-semibold">
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-puretask-blue" />
                      <span className="font-verdana">{booking.start_time} • {booking.hours} hours</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-puretask-blue mt-0.5" />
                      <span className="font-verdana text-xs">{booking.address}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
              <CardTitle className="font-fredoka text-graphite">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite">We'll Find Perfect Cleaners</p>
                    <p className="text-sm text-gray-600 font-verdana">Our smart matching system will assign verified cleaners to each appointment based on your preferences.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite">Cleaner Acceptance</p>
                    <p className="text-sm text-gray-600 font-verdana">You'll receive notifications when cleaners accept your bookings, typically within 24 hours.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite">Cleaning Day</p>
                    <p className="text-sm text-gray-600 font-verdana">Your cleaner will check in with GPS, complete the work, and submit photo proof. You'll approve each cleaning when satisfied.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => navigate(createPageUrl('ClientDashboard'))}
            className="brand-gradient text-white rounded-full font-fredoka font-semibold px-8 py-6 text-lg shadow-xl"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('ClientBookings'))}
            variant="outline"
            className="border-2 border-puretask-blue text-puretask-blue rounded-full font-fredoka font-semibold px-8 py-6 text-lg"
          >
            View All Bookings
          </Button>
        </motion.div>
      </div>
    </div>
  );
}