import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, User, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminBookingsConsoleV2() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionData, setActionData] = useState({});

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const allBookings = await base44.entities.Booking.list('-created_date', 100);
      setBookings(allBookings);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading bookings:', showToast: false });
    }
    setLoading(false);
  };

  const filteredBookings = bookings.filter(b => 
    b.id.includes(searchTerm) ||
    b.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.cleaner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = async (action) => {
    try {
      const response = await base44.functions.invoke('adminWorkflows', {
        action,
        ...actionData,
        booking_id: selectedBooking.id
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setActionModal(null);
        setActionData({});
        loadBookings();
      } else {
        alert('Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-puretask-blue mx-auto mb-4"></div>
          <p className="text-gray-600 font-verdana">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">Bookings Console</h1>
          <p className="text-gray-600 font-verdana">Manage all platform bookings</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search by booking ID, client email, or cleaner email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-fredoka font-bold text-graphite">
                        Booking #{booking.id.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      {booking.dispute_status && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Disputed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 font-verdana">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(booking.date), 'MMM dd, yyyy')} at {booking.start_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {booking.hours} hours
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Client: {booking.client_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Cleaner: {booking.cleaner_email || 'Unassigned'}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {booking.total_price} credits
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedBooking(booking)}
                    variant="outline"
                    className="font-fredoka"
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Actions Dialog */}
        {selectedBooking && !actionModal && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-fredoka">Manage Booking</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setActionModal('reschedule')}
                    variant="outline"
                    className="font-fredoka"
                  >
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => setActionModal('reassign')}
                    variant="outline"
                    className="font-fredoka"
                  >
                    Reassign Cleaner
                  </Button>
                  <Button
                    onClick={() => setActionModal('cancel')}
                    variant="outline"
                    className="font-fredoka text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    onClick={() => setActionModal('refund')}
                    variant="outline"
                    className="font-fredoka"
                  >
                    Issue Refund
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Action Modals */}
        {actionModal === 'reschedule' && (
          <Dialog open={true} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-fredoka">Reschedule Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  type="date"
                  value={actionData.new_date || ''}
                  onChange={(e) => setActionData({...actionData, new_date: e.target.value})}
                  placeholder="New Date"
                />
                <Input
                  type="time"
                  value={actionData.new_time || ''}
                  onChange={(e) => setActionData({...actionData, new_time: e.target.value})}
                  placeholder="New Time"
                />
                <Textarea
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                  placeholder="Reason for rescheduling"
                />
                <Button onClick={() => handleAction('reschedule_booking')} className="w-full font-fredoka">
                  Reschedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {actionModal === 'reassign' && (
          <Dialog open={true} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-fredoka">Reassign Cleaner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  value={actionData.new_cleaner_email || ''}
                  onChange={(e) => setActionData({...actionData, new_cleaner_email: e.target.value})}
                  placeholder="New Cleaner Email"
                />
                <Textarea
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                  placeholder="Reason for reassignment"
                />
                <Button onClick={() => handleAction('reassign_cleaner')} className="w-full font-fredoka">
                  Reassign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {actionModal === 'cancel' && (
          <Dialog open={true} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-fredoka">Cancel Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                  placeholder="Cancellation reason"
                />
                <Input
                  type="number"
                  value={actionData.refund_amount || ''}
                  onChange={(e) => setActionData({...actionData, refund_amount: parseFloat(e.target.value)})}
                  placeholder="Refund amount (credits)"
                />
                <Button
                  onClick={() => handleAction('cancel_booking')}
                  className="w-full font-fredoka bg-red-600 hover:bg-red-700"
                >
                  Cancel Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {actionModal === 'refund' && (
          <Dialog open={true} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-fredoka">Issue Refund</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  type="number"
                  value={actionData.amount_credits || ''}
                  onChange={(e) => setActionData({...actionData, amount_credits: parseFloat(e.target.value), client_email: selectedBooking.client_email})}
                  placeholder="Refund amount (credits)"
                />
                <Textarea
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                  placeholder="Reason for refund"
                />
                <Button onClick={() => handleAction('issue_refund')} className="w-full font-fredoka">
                  Issue Refund
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}