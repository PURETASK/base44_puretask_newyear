import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Pause, Play, X, RefreshCw, Clock, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';


export default function ManageRecurringBookings() {
  const [user, setUser] = useState(null);
  const [recurringBookings, setRecurringBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const bookings = await base44.entities.RecurringBooking.filter({ 
        client_email: currentUser.email 
      });
      setRecurringBookings(bookings);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
      console.error('Failed to load recurring bookings');
    } finally {
      setLoading(false);
    }
  };

  const pauseBooking = async (id, days = 30) => {
    try {
      const pauseDate = new Date();
      pauseDate.setDate(pauseDate.getDate() + days);
      
      await base44.entities.RecurringBooking.update(id, {
        is_active: false,
        pause_until: pauseDate.toISOString().split('T')[0]
      });
      
      alert(`Recurring booking paused for ${days} days`);
      loadData();
    } catch (error) {
      alert('Failed to pause booking');
    }
  };

  const resumeBooking = async (id) => {
    try {
      await base44.entities.RecurringBooking.update(id, {
        is_active: true,
        pause_until: null
      });
      
      alert('Recurring booking resumed');
      loadData();
    } catch (error) {
      alert('Failed to resume booking');
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this recurring booking?')) return;
    
    try {
      await base44.entities.RecurringBooking.update(id, {
        is_active: false
      });
      
      alert('Recurring booking cancelled');
      loadData();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  const frequencyLabels = {
    weekly: 'Weekly',
    biweekly: 'Every 2 Weeks',
    monthly: 'Monthly'
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">
          Recurring Bookings
        </h1>
        <p className="text-gray-600 font-verdana">
          Manage your scheduled recurring cleanings
        </p>
      </div>

      {recurringBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">
              No Recurring Bookings
            </h3>
            <p className="text-gray-600 font-verdana mb-6">
              Set up recurring bookings to automatically schedule regular cleanings
            </p>
            <Button className="brand-gradient text-white">
              Create Recurring Booking
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recurringBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-puretask-blue" />
                        {frequencyLabels[booking.frequency]} Cleaning
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        Every {booking.day_of_week} at {booking.start_time}
                      </p>
                    </div>
                    <Badge className={booking.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                      {booking.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{booking.cleaner_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{booking.hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 truncate">{booking.address}</span>
                    </div>
                  </div>

                  {booking.next_booking_date && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-verdana">
                        <strong>Next cleaning:</strong> {new Date(booking.next_booking_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {booking.pause_until && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-verdana">
                        <strong>Paused until:</strong> {new Date(booking.pause_until).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {booking.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pauseBooking(booking.id)}
                        className="flex items-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resumeBooking(booking.id)}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelBooking(booking.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}