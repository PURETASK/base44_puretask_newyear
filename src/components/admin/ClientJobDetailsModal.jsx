
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar, Clock, MapPin, User, DollarSign, Home, Package,
  Star, Camera, MessageSquare, AlertTriangle, FileText, Shield,
  Sparkles, Info, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { convertTo12Hour } from '../utils/timeUtils';
import { ServiceBadge } from '../utils/serviceIcons';

export default function ClientJobDetailsModal({ booking, onClose, onUpdate }) {
  const [clientProfile, setClientProfile] = useState(null);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdditionalData();
  }, [booking]);

  const loadAdditionalData = async () => {
    setLoading(true);
    try {
      // Load client profile
      const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
      if (clientProfiles.length > 0) setClientProfile(clientProfiles[0]);

      // Load cleaner profile if assigned
      if (booking.cleaner_email) {
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: booking.cleaner_email });
        if (cleanerProfiles.length > 0) setCleanerProfile(cleanerProfiles[0]);
      }

      // Load reviews
      const bookingReviews = await base44.entities.Review.filter({ booking_id: booking.id });
      setReviews(bookingReviews);

      // Load photos
      const bookingPhotos = await base44.entities.PhotoPair.filter({ booking_id: booking.id });
      setPhotos(bookingPhotos);

      // Load disputes
      const bookingDisputes = await base44.entities.Dispute.filter({ booking_id: booking.id });
      setDisputes(bookingDisputes);

      // Load messages related to this booking
      if (booking.cleaner_email) {
        const allMessages = await base44.entities.Message.filter({ booking_id: booking.id });
        setMessages(allMessages);
      }
    } catch (error) {
      console.error('Error loading additional data:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-slate-100 text-slate-800',
      'payment_hold': 'bg-amber-100 text-amber-800',
      'awaiting_cleaner': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'cleaning_now': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
      'disputed': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            Complete Job Details
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="client">Client Info</TabsTrigger>
            <TabsTrigger value="cleaner">Cleaner Info</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Basic Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="font-medium">{format(new Date(booking.date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-slate-500">Time & Duration</p>
                      <p className="font-medium">{convertTo12Hour(booking.start_time)} ({booking.hours}h / ~{booking.estimated_hours || booking.hours}h estimated)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg md:col-span-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="font-medium">{booking.address}</p>
                      {booking.latitude && booking.longitude && (
                        <p className="text-xs text-slate-400 mt-1">
                          GPS: {booking.latitude.toFixed(4)}, {booking.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-slate-500">Total Price</p>
                      <p className="font-bold text-2xl text-green-600">${booking.total_price.toFixed(2)}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-600">
                          Base Rate: {booking.snapshot_base_rate_cph || 'N/A'} credits/hr
                        </p>
                        <p className="text-xs text-slate-600">
                          Add-on: +{booking.snapshot_selected_addon_cph || 0} credits/hr ({booking.cleaning_type || 'basic'})
                        </p>
                        <p className="text-xs text-slate-600">
                          Total Rate: {booking.snapshot_total_rate_cph || 'N/A'} credits/hr
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Escrow & Charges</p>
                      <p className="text-sm font-semibold text-blue-900">Reserved: {booking.escrow_credits_reserved || 0} credits</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Final Charge: {booking.final_charge_credits || 'Pending'} credits
                      </p>
                      {booking.refund_credits > 0 && (
                        <p className="text-xs text-green-600">
                          Refunded: {booking.refund_credits} credits
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Booking ID</p>
                      <p className="font-mono text-xs text-slate-700 break-all">{booking.id}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Created: {format(new Date(booking.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Cleaning Type</p>
                      <Badge className="bg-purple-500 text-white capitalize mt-1">
                        {booking.cleaning_type || 'basic'}
                      </Badge>
                      {booking.matched_via_smart_algorithm && (
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Smart Match
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.price_multipliers && booking.price_multipliers.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Price Breakdown
                    </p>
                    <div className="space-y-1">
                      {booking.price_multipliers.map((mult, idx) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span className="text-slate-600">{mult.reason}:</span>
                          <span className="font-medium">${mult.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Home Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-purple-500" />
                  Home Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-900">{booking.bedrooms}</p>
                    <p className="text-xs text-slate-500">Bedrooms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-900">{booking.bathrooms}</p>
                    <p className="text-xs text-slate-500">Bathrooms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-900">{booking.square_feet}</p>
                    <p className="text-xs text-slate-500">Square Feet</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-sm font-bold text-slate-900 capitalize">{booking.home_type}</p>
                    <p className="text-xs text-slate-500">Type</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center border border-amber-200">
                    <p className="text-lg">{booking.has_pets ? '🐾' : '❌'}</p>
                    <p className="text-xs text-slate-500">Pets</p>
                  </div>
                </div>

                {/* The following block was moved into the grid above as part of changes. */}
                {/* {booking.has_pets && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800">🐾 Home has pets</p>
                  </div>
                )} */}
              </CardContent>
            </Card>

            {/* Tasks Requested */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-500" />
                  Tasks Requested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {booking.tasks?.map((task, idx) => (
                    <ServiceBadge key={idx} serviceName={task} />
                  ))}
                </div>

                {booking.task_quantities && Object.keys(booking.task_quantities).length > 0 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-sm mb-2">Quantities:</p>
                    <div className="space-y-1">
                      {Object.entries(booking.task_quantities).map(([task, qty]) => (
                        <div key={task} className="text-sm flex justify-between">
                          <span className="capitalize">{task.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">{qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Special Requests */}
            {(booking.product_allergies || booking.product_preferences || booking.parking_instructions || booking.entry_instructions || booking.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Special Requests & Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.product_allergies && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-semibold text-sm text-red-800 mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Product Allergies
                      </p>
                      <p className="text-sm text-red-700">{booking.product_allergies}</p>
                    </div>
                  )}

                  {booking.product_preferences && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-sm text-blue-800 mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Product Preferences
                      </p>
                      <p className="text-sm text-blue-700">{booking.product_preferences}</p>
                    </div>
                  )}

                  {booking.parking_instructions && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-sm text-slate-700 mb-1">🅿️ Parking Instructions</p>
                      <p className="text-sm text-slate-600">{booking.parking_instructions}</p>
                    </div>
                  )}

                  {booking.entry_instructions && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-sm text-slate-700 mb-1">🚪 Entry Instructions</p>
                      <p className="text-sm text-slate-600">{booking.entry_instructions}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-sm text-slate-700 mb-1">📝 Additional Notes</p>
                      <p className="text-sm text-slate-600">{booking.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Check-in/Check-out */}
            {(booking.check_in_time || booking.check_out_time) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    Check-in / Check-out
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {booking.check_in_time && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-semibold text-sm text-green-800 mb-1">✅ Check-in</p>
                        <p className="text-sm text-green-700">
                          {format(new Date(booking.check_in_time), 'MMM d, yyyy h:mm a')}
                        </p>
                        {booking.check_in_location && (
                          <p className="text-xs text-green-600 mt-1">{booking.check_in_location}</p>
                        )}
                      </div>
                    )}

                    {booking.check_out_time && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-sm text-blue-800 mb-1">🏁 Check-out</p>
                        <p className="text-sm text-blue-700">
                          {format(new Date(booking.check_out_time), 'MMM d, yyyy h:mm a')}
                        </p>
                        {booking.check_out_location && (
                          <p className="text-xs text-blue-600 mt-1">{booking.check_out_location}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Client Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-700 mb-3">{review.comment}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {review.on_time && (
                          <Badge className="bg-green-100 text-green-800">On Time</Badge>
                        )}
                        {review.photo_quality && (
                          <Badge className="bg-blue-100 text-blue-800">Good Photos</Badge>
                        )}
                        {review.would_recommend && (
                          <Badge className="bg-purple-100 text-purple-800">Would Recommend</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Disputes */}
            {disputes.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    Disputes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {disputes.map((dispute) => (
                    <div key={dispute.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200 mb-3 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-500 text-white">{dispute.category.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline">{dispute.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{dispute.description}</p>
                      <p className="text-xs text-slate-500">
                        Filed by: {dispute.filed_by} • {format(new Date(dispute.created_date), 'MMM d, yyyy')}
                      </p>
                      {dispute.resolution && (
                        <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Resolution:</p>
                          <p className="text-sm text-slate-600">{dispute.resolution}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Client Info Tab */}
          <TabsContent value="client" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Name</p>
                  <p className="font-medium text-slate-900">{booking.client_email}</p>
                </div>

                {clientProfile && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Default Address</p>
                        <p className="font-medium text-slate-900">{clientProfile.default_address || 'Not set'}</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Home Size</p>
                        <p className="font-medium text-slate-900 capitalize">{clientProfile.home_size}</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-slate-600 mb-1">Credits Balance</p>
                        <p className="font-bold text-3xl text-green-600">{clientProfile.credits_balance?.toFixed(0) || '0'}</p>
                        <p className="text-xs text-slate-500 mt-1">≈ ${(clientProfile.credits_balance / 10).toFixed(2)} USD</p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-slate-600 mb-1">Membership Tier</p>
                        <Badge className="bg-purple-500 text-white">{clientProfile.membership_tier}</Badge>
                        {clientProfile.membership_active && (
                          <p className="text-xs text-green-600 mt-2">✓ Active Member</p>
                        )}
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
                        <p className="font-bold text-2xl text-slate-900">{clientProfile.total_bookings}</p>
                        {clientProfile.completed_first_booking && (
                          <p className="text-xs text-green-600 mt-1">✓ Completed first booking</p>
                        )}
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-slate-600 mb-1">Grace Cancellations Left</p>
                        <p className="font-bold text-2xl text-amber-600">{clientProfile.grace_cancellations_left || 0}/2</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cleaner Info Tab */}
          <TabsContent value="cleaner" className="space-y-6">
            {booking.cleaner_email ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    Cleaner Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Email</p>
                    <p className="font-medium text-slate-900">{booking.cleaner_email}</p>
                  </div>

                  {cleanerProfile && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">Full Name</p>
                          <p className="font-medium text-slate-900">{cleanerProfile.full_name}</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">Hourly Rate</p>
                          <p className="font-bold text-2xl text-emerald-600">${cleanerProfile.hourly_rate}/hr</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-slate-600 mb-1">Tier</p>
                          <Badge className="bg-purple-500 text-white">{cleanerProfile.tier}</Badge>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-slate-600 mb-1">Reliability Score</p>
                          <p className="font-bold text-2xl text-blue-600">{cleanerProfile.reliability_score || 75}/100</p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-sm text-slate-600 mb-1">Average Rating</p>
                          <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                            <p className="font-bold text-2xl text-amber-600">{cleanerProfile.average_rating.toFixed(1)}</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">({cleanerProfile.total_reviews} reviews)</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 mb-1">Total Jobs</p>
                          <p className="font-bold text-2xl text-slate-900">{cleanerProfile.total_jobs}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Bio</p>
                        <p className="text-sm text-slate-600">{cleanerProfile.bio || 'No bio available'}</p>
                      </div>

                      {cleanerProfile.product_preference && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-600" />
                            Product Preference
                          </p>
                          <Badge className="bg-green-500 text-white capitalize">
                            {cleanerProfile.product_preference.replace(/-/g, ' ')}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No cleaner assigned to this booking yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            {photos.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        <Camera className="w-5 h-5 text-blue-500" />
                        {photo.area}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Before</p>
                        <img
                          src={photo.before_photo_url}
                          alt="Before"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">After</p>
                        <img
                          src={photo.after_photo_url}
                          alt="After"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Uploaded: {format(new Date(photo.upload_timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No photos uploaded for this job yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            {messages.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Messages ({messages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender_email === booking.client_email
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-slate-700">
                            {message.sender_email === booking.client_email ? 'Client' : 'Cleaner'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(message.created_date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700">{message.content}</p>
                        {message.attachment_url && (
                          <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View Attachment
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No messages exchanged for this booking</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
