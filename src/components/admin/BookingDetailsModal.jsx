
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { CleanerProfile } from '@/api/entities'; // This import seems unused based on the provided code, but kept as per instructions
import { Booking } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin, Clock, DollarSign, Home, Calendar as CalendarIcon,
  User as UserIcon, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

// Utility function to convert 24-hour time string to 12-hour format with AM/PM
const convertTo12Hour = (time24h) => {
  if (!time24h) return 'Not set';
  try {
    const [hours, minutes] = time24h.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return time24h; // Return original if parsing fails
    }
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Converts 0 (midnight) to 12 AM and 12 (noon) to 12 PM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours12}:${formattedMinutes} ${period}`;
  } catch (error) {
    console.error('Error converting time to 12-hour format:', error);
    return time24h; // Fallback to original
  }
};

export default function BookingDetailsModal({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking?.status || 'available');
  const [clientInfo, setClientInfo] = useState(null);
  const [cleanerInfo, setCleanerInfo] = useState(null);

  useEffect(() => {
    loadUserInfo();
  }, [booking]);

  const loadUserInfo = async () => {
    if (!booking) return;

    try {
      if (booking.client_email) {
        const users = await User.filter({ email: booking.client_email });
        if (users.length > 0) setClientInfo(users[0]);
      }

      if (booking.cleaner_email) {
        const users = await User.filter({ email: booking.cleaner_email });
        if (users.length > 0) setCleanerInfo(users[0]);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await Booking.update(booking.id, { status: newStatus });
      setStatus(newStatus);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (!booking) return null;

  // Safely parse and format the date
  const getFormattedDate = () => {
    if (!booking.date) return 'Date not set';

    try {
      const parsedDate = typeof booking.date === 'string' ? parseISO(booking.date) : new Date(booking.date);
      if (isValid(parsedDate)) {
        return format(parsedDate, 'EEEE, MMMM d, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    return booking.date; // Fallback to raw date string
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'confirmed': return 'bg-blue-500 text-white';
      case 'pending_confirmation': return 'bg-amber-500 text-white';
      case 'in_progress': return 'bg-purple-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'disputed': return 'bg-orange-500 text-white';
      case 'available': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Management */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Status Management</h3>
              <Badge className={getStatusColor(status)}>
                {status.replace('_', ' ')}
              </Badge>
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Date</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {getFormattedDate()}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Time</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {convertTo12Hour(booking.start_time)} • {booking.hours || 0} hours
              </p>
            </div>
          </div>

          {/* Financial Info */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Price</p>
                <p className="text-3xl font-bold text-slate-900">${booking.total_price?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-200">
              <div>
                <p className="text-xs text-slate-500">Platform Fee (15%)</p>
                <p className="font-semibold text-slate-700">${((booking.total_price || 0) * 0.15).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cleaner Payout (85%)</p>
                <p className="font-semibold text-slate-700">${((booking.total_price || 0) * 0.85).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Client Information</h3>
            </div>
            {clientInfo ? (
              <div className="space-y-2">
                <p className="text-sm"><strong>Name:</strong> {clientInfo.full_name}</p>
                <p className="text-sm"><strong>Email:</strong> {clientInfo.email}</p>
                <p className="text-sm"><strong>Phone:</strong> {clientInfo.phone || 'Not provided'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {booking.client_confirmed ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No client assigned</p>
            )}
          </div>

          {/* Cleaner Info */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Cleaner Information</h3>
            </div>
            {cleanerInfo ? (
              <div className="space-y-2">
                <p className="text-sm"><strong>Name:</strong> {cleanerInfo.full_name}</p>
                <p className="text-sm"><strong>Email:</strong> {cleanerInfo.email}</p>
                <p className="text-sm"><strong>Phone:</strong> {cleanerInfo.phone || 'Not provided'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {booking.cleaner_confirmed ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No cleaner assigned</p>
            )}
          </div>

          <Separator />

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-lg">Location</h3>
            </div>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
              {booking.address || 'Address not provided'}
            </p>
          </div>

          {/* Tasks */}
          {booking.tasks && booking.tasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Tasks</h3>
              <div className="flex flex-wrap gap-2">
                {booking.tasks.map((task, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50">
                    {task.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {booking.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Client Notes</h3>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Photos */}
          {(booking.before_photos?.length > 0 || booking.after_photos?.length > 0) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                {booking.before_photos?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Before</p>
                    <div className="grid grid-cols-2 gap-2">
                      {booking.before_photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt="Before"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {booking.after_photos?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">After</p>
                    <div className="grid grid-cols-2 gap-2">
                      {booking.after_photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt="After"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Check-in/out Info */}
          {(booking.check_in_time || booking.check_out_time) && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                {booking.check_in_time && (
                  <p><strong>Checked In:</strong> {new Date(booking.check_in_time).toLocaleString()}</p>
                )}
                {booking.check_out_time && (
                  <p><strong>Checked Out:</strong> {new Date(booking.check_out_time).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
