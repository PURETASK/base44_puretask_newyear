import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ClientBookingCard from '../components/booking/ClientBookingCard';

export default function ClientBookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [currentBookingForTip, setCurrentBookingForTip] = useState(null);
  const [tipAmount, setTipAmount] = useState('');
  const [tipProcessing, setTipProcessing] = useState(false);

  useEffect(() => {
    loadUserAndBookings();
  }, []);

  const loadUserAndBookings = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('SignIn'));
        return;
      }
      setUser(currentUser);

      const allBookings = await base44.entities.Booking.filter({
        client_email: currentUser.email
      });

      // Sort by date descending
      allBookings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateB - dateA;
      });

      setBookings(allBookings);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading bookings:', showToast: false });
    } finally {
      setLoading(false);
    }
  };

  const categorizeBookings = () => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    const cancelled = [];

    bookings.forEach(booking => {
      const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
      
      if (booking.status === 'cancelled') {
        cancelled.push(booking);
      } else if (bookingDateTime > now && !['completed', 'approved'].includes(booking.status)) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    return { upcoming, past, cancelled };
  };

  const { upcoming, past, cancelled } = categorizeBookings();

  const handleTipSubmit = async () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      toast.error("Please enter a valid tip amount.");
      return;
    }

    setTipProcessing(true);
    try {
      const response = await base44.functions.invoke('processTip', {
        booking_id: currentBookingForTip.id,
        cleaner_email: currentBookingForTip.cleaner_email,
        amount: parseFloat(tipAmount)
      });

      if (response.data.success) {
        toast.success(`Successfully sent $${parseFloat(tipAmount).toFixed(2)} tip!`);
        setShowTipDialog(false);
        setTipAmount('');
        setCurrentBookingForTip(null);
      } else {
        toast.error(response.data.error || 'Failed to send tip');
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error sending tip:', showToast: false });
      toast.error('An error occurred while sending the tip.');
    } finally {
      setTipProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-graphite font-verdana">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 font-verdana">
            Manage your cleaning appointments
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upcoming" className="font-fredoka font-semibold">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="font-fredoka font-semibold">
              <Clock className="w-4 h-4 mr-2" />
              Past ({past.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="font-fredoka font-semibold">
              Cancelled ({cancelled.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-gray-600 font-verdana mb-6">
                    You don't have any scheduled cleanings yet.
                  </p>
                  <button
                    onClick={() => navigate(createPageUrl('BrowseCleaners'))}
                    className="btn-primary"
                  >
                    Browse Cleaners
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcoming.map(booking => (
                  <ClientBookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdate={loadUserAndBookings}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past Bookings */}
          <TabsContent value="past">
            {past.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">
                    No Past Bookings
                  </h3>
                  <p className="text-gray-600 font-verdana">
                    Your completed bookings will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {past.map(booking => (
                  <div key={booking.id}>
                    <ClientBookingCard
                      booking={booking}
                      onUpdate={loadUserAndBookings}
                      showActions={false}
                    />
                    {booking.status === 'completed' || booking.status === 'approved' ? (
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-2 border-green-500 text-green-600 hover:bg-green-50 font-fredoka font-semibold"
                        onClick={() => {
                          setCurrentBookingForTip(booking);
                          setShowTipDialog(true);
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Leave a Tip
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cancelled Bookings */}
          <TabsContent value="cancelled">
            {cancelled.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">
                    No Cancelled Bookings
                  </h3>
                  <p className="text-gray-600 font-verdana">
                    You haven't cancelled any bookings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cancelled.map(booking => (
                  <ClientBookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdate={loadUserAndBookings}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tip Dialog */}
        <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-fredoka text-2xl">Leave a Tip 💰</DialogTitle>
              <DialogDescription className="font-verdana">
                Show your appreciation for excellent service!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tipAmount" className="font-fredoka font-semibold">
                  Tip Amount ($)
                </Label>
                <Input
                  id="tipAmount"
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  className="text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTipAmount('5')}
                >
                  $5
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTipAmount('10')}
                >
                  $10
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTipAmount('15')}
                >
                  $15
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTipAmount('20')}
                >
                  $20
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTipDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleTipSubmit} 
                disabled={tipProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {tipProcessing ? 'Processing...' : 'Send Tip'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}