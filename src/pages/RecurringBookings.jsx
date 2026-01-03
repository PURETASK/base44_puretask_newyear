import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar, Clock, MapPin, DollarSign, Plus, Pause, Play, Trash2,
  Loader2, RefreshCw, AlertCircle, CheckCircle, Sparkles, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { convertTo12Hour } from '../components/utils/timeUtils';
import { creditsToUSD } from '../components/credits/CreditCalculator';
import { toast } from 'sonner';

export default function RecurringBookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [recurringBookings, setRecurringBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pausingBooking, setPausingBooking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      const type = currentUser.user_type || 'client';
      setUserType(type);

      let bookings = [];
      if (type === 'client') {
        bookings = await base44.entities.RecurringBooking.filter(
          { client_email: currentUser.email },
          '-created_date'
        );
      } else if (type === 'cleaner') {
        bookings = await base44.entities.RecurringBooking.filter(
          { cleaner_email: currentUser.email },
          '-created_date'
        );
      }

      setRecurringBookings(bookings);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading recurring bookings:', showToast: false });
      toast.error('Failed to load recurring bookings');
    }
    setLoading(false);
  };

  const handlePauseToggle = async (booking) => {
    try {
      const isPaused = !!booking.pause_until;
      
      if (isPaused) {
        // Resume
        await base44.entities.RecurringBooking.update(booking.id, {
          pause_until: null,
          is_active: true
        });
        toast.success('Subscription resumed');
      } else {
        // Show pause dialog
        setPausingBooking(booking);
        return;
      }
      
      loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error toggling pause:', showToast: false });
      toast.error('Failed to update subscription');
    }
  };

  const confirmPause = async (pauseUntil) => {
    try {
      await base44.entities.RecurringBooking.update(pausingBooking.id, {
        pause_until: pauseUntil,
        is_active: false
      });
      toast.success('Subscription paused');
      setPausingBooking(null);
      loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error pausing:', showToast: false });
      toast.error('Failed to pause subscription');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this recurring booking? This cannot be undone.')) {
      return;
    }

    try {
      await base44.entities.RecurringBooking.update(bookingId, {
        is_active: false
      });
      toast.success('Recurring booking cancelled');
      loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error cancelling:', showToast: false });
      toast.error('Failed to cancel booking');
    }
  };

  const getNextOccurrences = (booking, count = 3) => {
    if (!booking.next_booking_date) return [];
    
    const dates = [];
    let current = parseISO(booking.next_booking_date);
    
    for (let i = 0; i < count; i++) {
      dates.push(current);
      
      if (booking.frequency === 'weekly') {
        current = addWeeks(current, 1);
      } else if (booking.frequency === 'biweekly') {
        current = addWeeks(current, 2);
      } else if (booking.frequency === 'monthly') {
        current = addMonths(current, 1);
      }
    }
    
    return dates;
  };

  const activeBookings = recurringBookings.filter(b => b.is_active && !b.pause_until);
  const pausedBookings = recurringBookings.filter(b => b.pause_until);
  const cancelledBookings = recurringBookings.filter(b => !b.is_active && !b.pause_until);

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
              {userType === 'client' ? 'My Recurring Cleanings' : 'Recurring Clients'}
            </h1>
            <p className="text-lg text-gray-600 font-verdana">
              {userType === 'client' 
                ? 'Set up automatic weekly, bi-weekly, or monthly cleanings'
                : 'Manage your recurring client relationships'}
            </p>
          </div>
          
          {userType === 'client' && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="brand-gradient text-white rounded-full font-fredoka font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Recurring Booking
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-fresh-mint mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{activeBookings.length}</p>
              <p className="text-sm text-gray-600 font-verdana">Active Subscriptions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <Pause className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{pausedBookings.length}</p>
              <p className="text-sm text-gray-600 font-verdana">Paused</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                {activeBookings.reduce((sum, b) => sum + (b.total_price * 10 || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 font-verdana">Monthly Credits</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Recurring Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-fresh-mint" />
            Active Subscriptions
          </h2>

          {activeBookings.length > 0 ? (
            <div className="grid gap-6">
              {activeBookings.map((booking, idx) => {
                const nextDates = getNextOccurrences(booking);
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-fresh-mint" />
                              <CardTitle className="font-fredoka text-graphite">
                                {booking.frequency === 'weekly' ? 'Weekly' : 
                                 booking.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'} Cleaning
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-fresh-mint text-white rounded-full font-fredoka">
                                {booking.day_of_week}s
                              </Badge>
                              <Badge className="bg-blue-100 text-puretask-blue rounded-full font-fredoka">
                                {convertTo12Hour(booking.start_time)}
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-700 rounded-full font-fredoka">
                                {booking.hours} hours
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-3xl font-fredoka font-bold text-fresh-mint">
                              {Math.round(booking.total_price * 10)}
                            </p>
                            <p className="text-sm text-gray-600 font-verdana">credits/visit</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <p className="text-sm text-gray-600 font-verdana mb-2">
                              <MapPin className="w-4 h-4 inline mr-1 text-puretask-blue" />
                              Service Address
                            </p>
                            <p className="font-fredoka font-semibold text-graphite">{booking.address}</p>
                          </div>
                          
                          {userType === 'client' && booking.cleaner_email && (
                            <div>
                              <p className="text-sm text-gray-600 font-verdana mb-2">
                                <User className="w-4 h-4 inline mr-1 text-puretask-blue" />
                                Your Cleaner
                              </p>
                              <p className="font-fredoka font-semibold text-graphite">{booking.cleaner_email}</p>
                            </div>
                          )}
                          
                          {userType === 'cleaner' && booking.client_email && (
                            <div>
                              <p className="text-sm text-gray-600 font-verdana mb-2">
                                <User className="w-4 h-4 inline mr-1 text-puretask-blue" />
                                Client
                              </p>
                              <p className="font-fredoka font-semibold text-graphite">{booking.client_email}</p>
                            </div>
                          )}
                        </div>

                        {/* Next Occurrences */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                          <p className="text-sm font-fredoka font-semibold text-graphite mb-3">
                            Next Scheduled Cleanings:
                          </p>
                          <div className="space-y-2">
                            {nextDates.map((date, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm font-verdana text-gray-700">
                                <Calendar className="w-4 h-4 text-puretask-blue" />
                                <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
                                {i === 0 && (
                                  <Badge className="bg-puretask-blue text-white rounded-full font-fredoka text-xs">
                                    Next
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handlePauseToggle(booking)}
                            variant="outline"
                            className="flex-1 rounded-full font-fredoka border-2 border-amber-500 text-amber-700 hover:bg-amber-50"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                          
                          {userType === 'client' && (
                            <Button
                              onClick={() => navigate(createPageUrl(`BookingFlow?cleaner=${booking.cleaner_email}`))}
                              variant="outline"
                              className="flex-1 rounded-full font-fredoka border-2 border-puretask-blue text-puretask-blue hover:bg-blue-50"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Book One-Time
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => handleCancel(booking.id)}
                            variant="destructive"
                            className="rounded-full font-fredoka"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">No Active Subscriptions</h3>
                <p className="text-gray-600 font-verdana mb-6">
                  {userType === 'client'
                    ? 'Save time and money with recurring cleanings'
                    : 'Your recurring clients will appear here'}
                </p>
                {userType === 'client' && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="brand-gradient text-white rounded-full font-fredoka font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Recurring Booking
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Paused Bookings */}
        {pausedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-fredoka font-bold text-graphite mb-4 flex items-center gap-2">
              <Pause className="w-6 h-6 text-amber-600" />
              Paused Subscriptions
            </h2>

            <div className="space-y-4">
              {pausedBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-2 border-amber-300 bg-amber-50 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-fredoka font-bold text-graphite text-lg mb-1">
                            {booking.frequency === 'weekly' ? 'Weekly' : 
                             booking.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'} Cleaning (Paused)
                          </p>
                          <p className="text-sm text-gray-600 font-verdana">
                            Paused until: {format(parseISO(booking.pause_until), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600 font-verdana mt-1">
                            {booking.address}
                          </p>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handlePauseToggle(booking)}
                            className="bg-fresh-mint text-white rounded-full font-fredoka"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                          <Button
                            onClick={() => handleCancel(booking.id)}
                            variant="destructive"
                            className="rounded-full font-fredoka"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section (Client Only) */}
        {userType === 'client' && activeBookings.length === 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite">Benefits of Recurring Cleanings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: DollarSign, title: 'Save 10%', desc: 'Automatic discount on all recurring visits' },
                  { icon: Calendar, title: 'Never Forget', desc: 'Automatic scheduling on your preferred day' },
                  { icon: User, title: 'Same Cleaner', desc: 'Build a relationship with your trusted pro' },
                  { icon: Sparkles, title: 'Priority Booking', desc: 'Your slot is reserved every week/month' }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl">
                    <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-fredoka font-bold text-graphite mb-1">{benefit.title}</p>
                      <p className="text-sm text-gray-600 font-verdana">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pause Dialog */}
      <Dialog open={!!pausingBooking} onOpenChange={() => setPausingBooking(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-graphite">Pause Subscription</DialogTitle>
            <DialogDescription className="font-verdana">
              Your subscription will be paused until the date you select
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-fredoka font-medium mb-2 block text-graphite">
                Resume Date
              </label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    confirmPause(e.target.value);
                  }
                }}
                className="font-verdana"
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
              <AlertDescription className="text-sm text-blue-900 font-verdana">
                💡 Your cleaner will be notified. Automatic scheduling will resume on your selected date.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog (Client Only) */}
      {userType === 'client' && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-fredoka text-graphite">Create Recurring Booking</DialogTitle>
              <DialogDescription className="font-verdana">
                Set up automatic cleanings with your favorite cleaner
              </DialogDescription>
            </DialogHeader>

            <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
              <AlertDescription className="text-sm text-blue-900 font-verdana">
                💡 To create a recurring booking, first complete a one-time booking with your preferred cleaner. 
                You can then convert it to recurring from your booking history.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => {
                setShowCreateDialog(false);
                navigate(createPageUrl('BrowseCleaners'));
              }}
              className="brand-gradient text-white rounded-full font-fredoka font-semibold"
            >
              Browse Cleaners
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}