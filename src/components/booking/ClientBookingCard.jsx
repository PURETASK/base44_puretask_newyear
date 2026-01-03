import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, Calendar, Clock, User, DollarSign, Sparkles,
  MessageSquare, CalendarRange, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import CancelBookingDialog from './CancelBookingDialog';
import MessageButton from '../messaging/MessageButton';
import EscrowStatusBadge from './EscrowStatusBadge';
import FallbackCleanerStatus from './FallbackCleanerStatus';
import AutoApprovalWarning from './AutoApprovalWarning';
import ReviewCountdownTimer from './ReviewCountdownTimer';
import HoursComparisonDisplay from './HoursComparisonDisplay';
import PricingBreakdownCard from './PricingBreakdownCard';

export default function ClientBookingCard({ booking, onUpdate, showActions }) {
  const navigate = useNavigate();
  const [cleaner, setCleaner] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCleaner();
  }, [booking]);

  const loadCleaner = async () => {
    try {
      const profiles = await base44.entities.CleanerProfile.filter({
        user_email: booking.cleaner_email
      });
      if (profiles.length > 0) {
        setCleaner(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading cleaner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    localStorage.setItem('rescheduleBookingId', booking.id);
    navigate(createPageUrl('BookingFlow') + `?cleaner=${booking.cleaner_email}&reschedule=true`);
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      created: { label: 'Created', variant: 'secondary' },
      payment_hold: { label: 'Payment Hold', variant: 'secondary' },
      awaiting_cleaner_response: { label: 'Awaiting Response', variant: 'default' },
      accepted: { label: 'Accepted', variant: 'success' },
      scheduled: { label: 'Scheduled', variant: 'success' },
      on_the_way: { label: 'On The Way', variant: 'default' },
      in_progress: { label: 'In Progress', variant: 'default' },
      completed: { label: 'Completed', variant: 'success' },
      awaiting_client: { label: 'Awaiting Review', variant: 'secondary' },
      approved: { label: 'Approved', variant: 'success' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
      disputed: { label: 'Disputed', variant: 'destructive' }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant} className="font-fredoka">{config.label}</Badge>;
  };

  const getCleaningTypeLabel = (type) => {
    const types = {
      basic: 'Basic Cleaning',
      deep: 'Deep Cleaning',
      moveout: 'Move-Out Cleaning'
    };
    return types[type] || type;
  };

  const bookingDate = booking.date ? new Date(booking.date) : null;
  const isPastBooking = bookingDate ? bookingDate < new Date() : false;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left Section */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-puretask-blue" />
                    <h3 className="text-xl font-fredoka font-bold text-graphite">
                      {getCleaningTypeLabel(booking.cleaning_type)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(booking.status)}
                    <EscrowStatusBadge booking={booking} />
                  </div>
                </div>
              </div>

              {/* Cleaner Info */}
              {cleaner && (
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-puretask-blue" />
                  <span className="font-verdana font-semibold">{cleaner.business_name || cleaner.user_email}</span>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center gap-4 text-gray-600 font-verdana">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-puretask-blue" />
                  <span>{bookingDate ? format(bookingDate, 'MMM dd, yyyy') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-puretask-blue" />
                  <span>{booking.start_time || 'N/A'} ({booking.hours}h)</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-gray-600 font-verdana">
                <MapPin className="w-4 h-4 text-puretask-blue mt-1 flex-shrink-0" />
                <span className="text-sm">{booking.address}</span>
              </div>

              {/* Additional Services */}
              {booking.additional_services && Object.keys(booking.additional_services).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.keys(booking.additional_services)
                    .filter(key => booking.additional_services[key] > 0)
                    .map(key => {
                      const serviceNames = {
                        windows: 'Windows',
                        blinds: 'Blinds',
                        oven: 'Oven',
                        refrigerator: 'Refrigerator',
                        light_fixtures: 'Light Fixtures',
                        inside_cabinets: 'Inside Cabinets',
                        baseboards: 'Baseboards',
                        laundry: 'Laundry'
                      };
                      return (
                        <Badge key={key} variant="outline" className="text-xs font-verdana">
                          +{serviceNames[key]} x{booking.additional_services[key]}
                        </Badge>
                      );
                    })}
                </div>
              )}

              {/* Fallback Status */}
              {(booking.status === 'checking_fallback' || booking.status === 'open_to_fallbacks') && (
                <FallbackCleanerStatus booking={booking} />
              )}

              {/* Auto-Approval Warning */}
              {booking.status === 'awaiting_client' && booking.client_review_deadline && (
                <AutoApprovalWarning booking={booking} />
              )}

              {/* Review Countdown Timer */}
              {booking.status === 'awaiting_client' && booking.client_review_deadline && (
                <ReviewCountdownTimer deadline={booking.client_review_deadline} />
              )}

              {/* Hours Comparison */}
              {booking.check_out_time && booking.actual_hours && (
                <HoursComparisonDisplay booking={booking} />
              )}

              {/* Price */}
              <div className="flex items-center gap-2 text-lg font-fredoka font-bold text-graphite">
                <DollarSign className="w-5 h-5 text-fresh-mint" />
                <span>{booking.final_charge_credits || booking.total_price} credits</span>
              </div>

              {/* Pricing Breakdown */}
              <PricingBreakdownCard booking={booking} />

              {/* Cancellation Info */}
              {booking.status === 'cancelled' && booking.cancelled_by && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="font-verdana text-gray-700">
                    <span className="font-semibold">Cancelled by:</span> {booking.cancelled_by}
                  </p>
                  {booking.cancellation_reason && (
                    <p className="font-verdana text-gray-600 mt-1">
                      <span className="font-semibold">Reason:</span> {booking.cancellation_reason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Section - Actions */}
            {showActions && (
              <div className="flex flex-col gap-2 md:min-w-[200px]">
                {booking.cleaner_email && (
                  <MessageButton
                    recipientEmail={booking.cleaner_email}
                    bookingId={booking.id}
                    variant="outline"
                    className="w-full"
                  />
                )}

                {booking.status === 'awaiting_cleaner_response' || booking.status === 'accepted' || booking.status === 'scheduled' ? (
                  <>
                    <Button
                      onClick={handleReschedule}
                      variant="outline"
                      className="w-full"
                    >
                      <CalendarRange className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </>
                ) : null}

                {booking.status === 'awaiting_client' && (
                  <Button
                    onClick={() => navigate(createPageUrl('ClientReview') + `?booking=${booking.id}`)}
                    className="w-full brand-gradient"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Review & Approve
                  </Button>
                )}

                {booking.status === 'completed' && !booking.review_submitted && (
                  <Button
                    onClick={() => navigate(createPageUrl('ClientReview') + `?booking=${booking.id}`)}
                    variant="outline"
                    className="w-full"
                  >
                    Leave Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Using new CancellationFeePreview instead of old CancelBookingDialog */}
      {/* <CancelBookingDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        booking={booking}
        onSuccess={onUpdate}
      /> */}
    </>
  );
}