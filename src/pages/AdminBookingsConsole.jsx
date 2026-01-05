import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPermissions } from '@/components/admin/AdminPermissions';
import { AdminAuditLogger } from '@/components/admin/AdminAuditLogger';
import { Calendar, Loader2, Eye, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminBookingsConsole() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      const isAdmin = await AdminPermissions.isAdmin(currentUser);
      
      if (!isAdmin) {
        navigate(createPageUrl('Home'));
        return;
      }
      
      setUser(currentUser);
      await loadBookings();
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const allBookings = await base44.entities.Booking.list('-created_date', 200);
      setBookings(allBookings);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading bookings:', showToast: false });
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!confirm('Cancel this booking? Client will be refunded.')) return;
    
    const hasPermission = await AdminPermissions.hasCapability(user.email, 'can_edit_bookings');
    if (!hasPermission) {
      alert('You do not have permission to cancel bookings');
      return;
    }

    try {
      const reason = prompt('Reason for cancellation:');
      if (!reason) return;

      // Log audit trail
      await AdminAuditLogger.log({
        adminEmail: user.email,
        actionType: 'CANCEL_BOOKING',
        targetType: 'booking',
        targetId: booking.id,
        beforeState: { status: booking.status },
        afterState: { status: 'cancelled' },
        metadata: { reason, cancelled_by: 'admin' }
      });

      // Update booking
      await base44.entities.Booking.update(booking.id, {
        status: 'cancelled',
        cancelled_by: 'admin',
        cancellation_reason: reason,
        cancellation_timestamp: new Date().toISOString()
      });

      // Issue refund if payment was made
      if (booking.escrow_credits_reserved > 0) {
        await base44.entities.CreditTransaction.create({
          client_email: booking.client_email,
          transaction_type: 'refund',
          amount_credits: booking.escrow_credits_reserved,
          booking_id: booking.id,
          note: `Admin cancellation: ${reason}`
        });
      }

      alert('Booking cancelled and refund issued');
      loadBookings();
    } catch (error) {
      handleError(error, { userMessage: 'Error cancelling booking:', showToast: false });
      alert('Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-blue-100 text-blue-800',
      accepted: 'bg-cyan-100 text-cyan-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-red-100 text-red-800',
      payment_hold: 'bg-amber-100 text-amber-800',
      awaiting_cleaner_response: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = !searchTerm || 
      b.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cleaner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Bookings Console</h1>
          <p className="text-gray-600 font-verdana mt-2">Manage all platform bookings</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Search by ID, client, or cleaner email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-verdana"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="font-fredoka"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('scheduled')}
                  className="font-fredoka"
                >
                  Scheduled
                </Button>
                <Button
                  variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('in_progress')}
                  className="font-fredoka"
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === 'disputed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('disputed')}
                  className="font-fredoka"
                >
                  Disputed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 font-verdana">Total Bookings</p>
              <p className="text-2xl font-fredoka font-bold text-graphite">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 font-verdana">Disputed</p>
              <p className="text-2xl font-fredoka font-bold text-red-600">
                {bookings.filter(b => b.status === 'disputed').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 font-verdana">In Progress</p>
              <p className="text-2xl font-fredoka font-bold text-blue-600">
                {bookings.filter(b => b.status === 'in_progress').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 font-verdana">Completed</p>
              <p className="text-2xl font-fredoka font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed' || b.status === 'approved').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`font-fredoka ${getStatusColor(booking.status)}`}>
                          {booking.status.replace(/_/g, ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 font-verdana">ID: {booking.id}</p>
                        {booking.status === 'disputed' && (
                          <Badge className="bg-red-600 text-white font-fredoka">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Needs Attention
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-verdana">Client</p>
                          <p className="font-verdana text-sm font-semibold">{booking.client_email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-verdana">Cleaner</p>
                          <p className="font-verdana text-sm">{booking.cleaner_email || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-verdana">Date & Time</p>
                          <p className="font-verdana text-sm font-semibold">
                            {new Date(booking.date).toLocaleDateString()} at {booking.start_time}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-verdana">Duration</p>
                          <p className="font-verdana text-sm">{booking.hours}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-verdana">Total</p>
                          <p className="font-verdana text-sm font-semibold">
                            {booking.total_price?.toFixed(0)} credits
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-verdana">Created</p>
                          <p className="font-verdana text-sm">
                            {new Date(booking.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                        className="font-fredoka"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking)}
                          className="font-fredoka text-red-600 border-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-fredoka font-bold text-graphite">No bookings found</p>
              <p className="text-gray-600 font-verdana mt-2">Try adjusting your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Booking ID</p>
                  <p className="font-verdana font-semibold">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Status</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Client</p>
                  <p className="font-verdana">{selectedBooking.client_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Cleaner</p>
                  <p className="font-verdana">{selectedBooking.cleaner_email || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Date & Time</p>
                  <p className="font-verdana font-semibold">
                    {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.start_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Duration</p>
                  <p className="font-verdana">{selectedBooking.hours} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Address</p>
                  <p className="font-verdana text-sm">{selectedBooking.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-verdana">Total Price</p>
                  <p className="font-verdana font-semibold">{selectedBooking.total_price?.toFixed(0)} credits</p>
                </div>
              </div>

              {selectedBooking.check_in_time && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-verdana font-semibold mb-2">GPS Tracking</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Check-in</p>
                      <p className="text-sm">{new Date(selectedBooking.check_in_time).toLocaleString()}</p>
                    </div>
                    {selectedBooking.check_out_time && (
                      <div>
                        <p className="text-xs text-gray-600">Check-out</p>
                        <p className="text-sm">{new Date(selectedBooking.check_out_time).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setSelectedBooking(null)} className="font-fredoka">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}