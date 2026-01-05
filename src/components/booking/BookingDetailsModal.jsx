import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Clock, MapPin, User, Star, DollarSign,
  CheckCircle, Home, Droplets, Package, Image,
  AlertCircle, XCircle, TrendingUp, Loader2, FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { convertTo12Hour } from '../utils/timeUtils';

export default function BookingDetailsModal({ booking, open, onClose }) {
  const [cleaner, setCleaner] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && booking) {
      loadDetails();
    }
  }, [open, booking]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      // Load cleaner profile
      if (booking.cleaner_email) {
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({
          user_email: booking.cleaner_email
        });
        if (cleanerProfiles.length > 0) {
          setCleaner(cleanerProfiles[0]);
        }
      }

      // Load review
      const reviews = await base44.entities.Review.filter({
        booking_id: booking.id
      });
      if (reviews.length > 0) {
        setReview(reviews[0]);
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
    }
    setLoading(false);
  };

  if (!booking) return null;

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Calendar },
      accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      on_the_way: { label: 'On The Way', color: 'bg-cyan-100 text-cyan-700', icon: TrendingUp },
      in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: Loader2 },
      awaiting_client: { label: 'Awaiting Review', color: 'bg-purple-100 text-purple-700', icon: Star },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: XCircle },
      disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertCircle }
    };
    return configs[status] || configs.scheduled;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-fredoka font-bold text-graphite flex items-center gap-3">
            <div className="bg-gradient-to-br from-puretask-blue to-cyan-500 p-3 rounded-2xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Booking Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Status Banner */}
            <div className={`${statusConfig.color} rounded-2xl p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <StatusIcon className="w-6 h-6" />
                <div>
                  <p className="font-fredoka font-bold text-lg">{statusConfig.label}</p>
                  <p className="text-sm opacity-80 font-verdana">
                    Booking ID: {booking.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/50 border-0 text-inherit font-fredoka">
                {format(parseISO(booking.date), 'MMM d, yyyy')}
              </Badge>
            </div>

            {/* Date & Time */}
            <Card className="border-2 border-blue-100 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-puretask-blue" />
                  <h3 className="font-fredoka font-bold text-slate-900 text-lg">Date & Time</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-xs text-slate-600 font-verdana uppercase mb-1 font-semibold">Date</p>
                    <p className="font-fredoka font-bold text-slate-900">
                      {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-xs text-slate-600 font-verdana uppercase mb-1 font-semibold">Time</p>
                    <p className="font-fredoka font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-puretask-blue" />
                      {convertTo12Hour(booking.start_time)} ({booking.hours} hours)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-2 border-purple-100 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h3 className="font-fredoka font-bold text-slate-900 text-lg">Location</h3>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl">
                  <p className="font-verdana text-slate-900">{booking.address}</p>
                  {booking.entry_instructions && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-slate-600 font-verdana uppercase mb-1 font-semibold">Entry Instructions</p>
                      <p className="text-sm font-verdana text-slate-800">{booking.entry_instructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cleaner Info */}
              {cleaner && (
                <Card className="border-2 border-green-100 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-green-600" />
                      <h3 className="font-fredoka font-bold text-slate-900 text-lg">Cleaner</h3>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {cleaner.profile_photo_url ? (
                          <img
                            src={cleaner.profile_photo_url}
                            alt={cleaner.full_name}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-fredoka font-bold text-2xl shadow-lg">
                            {cleaner.full_name?.charAt(0) || 'C'}
                          </div>
                        )}
                        {cleaner.admin_verified && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-2 border-white shadow">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-fredoka font-bold text-graphite text-lg mb-1">
                          {cleaner.full_name || 'Professional Cleaner'}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-700 font-fredoka border-0">
                            {cleaner.tier || 'Pro'}
                          </Badge>
                          {cleaner.average_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="text-sm font-verdana text-gray-700">
                                {cleaner.average_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-verdana">{booking.cleaner_email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Details */}
              <Card className="border-2 border-amber-100 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplets className="w-5 h-5 text-amber-600" />
                    <h3 className="font-fredoka font-bold text-slate-900 text-lg">Service</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-amber-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-600 font-verdana uppercase mb-1 font-semibold">Cleaning Type</p>
                      <p className="font-fredoka font-bold text-slate-900 capitalize">
                        {booking.cleaning_type || 'Basic'} Cleaning
                      </p>
                    </div>
                    {(booking.bedrooms || booking.bathrooms || booking.square_feet) && (
                      <div className="bg-amber-50 p-4 rounded-2xl">
                        <p className="text-xs text-slate-600 font-verdana uppercase mb-2 font-semibold">Property Details</p>
                        <div className="flex flex-wrap gap-3 text-sm font-verdana">
                          {booking.bedrooms && (
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4 text-amber-600" />
                              {booking.bedrooms} bed
                            </span>
                          )}
                          {booking.bathrooms && (
                            <span className="flex items-center gap-1">
                              <Droplets className="w-4 h-4 text-amber-600" />
                              {booking.bathrooms} bath
                            </span>
                          )}
                          {booking.square_feet && (
                            <span>{booking.square_feet} sq ft</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing */}
            <Card className="border-2 border-emerald-100 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-fredoka font-bold text-slate-900 text-lg">Pricing Breakdown</h3>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-2xl space-y-4">
                  {/* Base Rate */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                    <div>
                      <p className="text-sm text-slate-600 font-verdana mb-1 font-semibold">Hourly Rate</p>
                      <p className="font-fredoka font-bold text-slate-900">
                        {booking.snapshot_total_rate_cph || booking.snapshot_base_rate_cph || 'N/A'} credits/hour
                      </p>
                      <p className="text-xs text-slate-600 font-verdana mt-1">
                        {booking.hours || booking.estimated_hours} hours × {booking.snapshot_total_rate_cph || booking.snapshot_base_rate_cph} credits
                      </p>
                    </div>
                    <p className="text-xl font-fredoka font-bold text-slate-900">
                      {Math.round((booking.snapshot_total_rate_cph || booking.snapshot_base_rate_cph || 0) * (booking.hours || booking.estimated_hours || 0))}
                    </p>
                  </div>

                  {/* Additional Services */}
                  {booking.additional_services && Object.keys(booking.additional_services).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-verdana font-semibold text-slate-800">Additional Services</p>
                      {Object.entries(booking.additional_services).map(([service, quantity]) => {
                        if (quantity > 0) {
                          const servicePrice = booking.snapshot_additional_service_prices?.[service] || 0;
                          const serviceCost = servicePrice * quantity;
                          return (
                            <div key={service} className="flex items-center justify-between py-2 px-3 bg-white border border-emerald-200 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-600" />
                                <div>
                                  <p className="text-sm font-verdana text-slate-900 capitalize font-medium">
                                    {service.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {quantity} × {servicePrice} credits
                                  </p>
                                </div>
                              </div>
                              <p className="font-fredoka font-bold text-slate-900">
                                {serviceCost}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-slate-300">
                    <div>
                      <p className="text-sm text-slate-600 font-verdana mb-1 font-semibold">Total Amount</p>
                      <p className="font-fredoka text-lg font-bold text-slate-900">
                        {Math.round(booking.total_price)} credits
                      </p>
                      <p className="text-xs text-slate-600 font-verdana mt-1">
                        = ${booking.total_price.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-fredoka font-bold text-emerald-600">
                        {Math.round(booking.total_price)}
                      </p>
                      <p className="text-sm text-slate-600 font-verdana">credits</p>
                    </div>
                  </div>

                  {booking.actual_hours && booking.actual_hours !== booking.hours && (
                    <div className="pt-3 border-t border-gray-200 bg-blue-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                      <p className="text-sm text-gray-600 font-verdana">
                        ℹ️ Actual time worked: <span className="font-bold">{booking.actual_hours}h</span>
                        {booking.refund_credits > 0 && (
                          <span className="text-green-600"> • Refunded: {booking.refund_credits} credits</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            {(booking.before_photos?.length > 0 || booking.after_photos?.length > 0) && (
              <Card className="border-2 border-pink-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Image className="w-5 h-5 text-pink-600" />
                    <h3 className="font-fredoka font-bold text-graphite text-lg">Photos</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {booking.before_photos?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 font-verdana uppercase mb-3">Before</p>
                        <div className="grid grid-cols-2 gap-2">
                          {booking.before_photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Before ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {booking.after_photos?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 font-verdana uppercase mb-3">After</p>
                        <div className="grid grid-cols-2 gap-2">
                          {booking.after_photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`After ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review */}
            {review && (
              <Card className="border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-600 fill-current" />
                    <h3 className="font-fredoka font-bold text-graphite text-lg">Your Review</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xl font-fredoka font-bold text-graphite">
                        {review.rating}.0
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 font-verdana leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {booking.notes && (
              <Card className="border-2 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="font-fredoka font-bold text-graphite text-lg">Additional Notes</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-gray-700 font-verdana">{booking.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}