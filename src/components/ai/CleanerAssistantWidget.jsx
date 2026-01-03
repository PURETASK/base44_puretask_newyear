import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, DollarSign, MapPin, Clock, Check, X, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function CleanerAssistantWidget({ cleanerEmail }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadPendingRequests();
  }, [cleanerEmail]);

  const loadPendingRequests = async () => {
    try {
      // Get pending booking requests
      const requests = await base44.entities.Booking.filter({
        cleaner_email: cleanerEmail,
        status: { $in: ['awaiting_cleaner_response', 'checking_fallback'] },
        request_expires_at: { $gt: new Date().toISOString() }
      });

      setPendingRequests(requests);

      // Get AI recommendations for each request
      if (requests.length > 0) {
        await getAIRecommendations(requests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
    setLoading(false);
  };

  const getAIRecommendations = async (requests) => {
    try {
      // Get cleaner profile and existing bookings for context
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
      const profile = profiles[0];

      const existingBookings = await base44.entities.Booking.filter({
        cleaner_email: cleanerEmail,
        status: { $in: ['scheduled', 'accepted'] }
      });

      const prompt = `You are a scheduling assistant for a cleaner. Analyze these booking requests and provide recommendations.

CLEANER INFO:
- Name: ${profile.full_name}
- Tier: ${profile.tier}
- Base Rate: ${profile.base_rate_credits_per_hour} credits/hour
- Preferred Services: ${profile.specialty_tags?.join(', ') || 'General cleaning'}

EXISTING SCHEDULE:
${existingBookings.map(b => `${b.date} ${b.start_time} - ${b.hours}h at ${b.address.split(',')[0]}`).join('\n')}

PENDING REQUESTS:
${requests.map((b, i) => `Request ${i + 1}: ${b.date} ${b.start_time} - ${b.hours}h, ${b.cleaning_type}, ${(b.total_price * 0.8 / 100).toFixed(2)} earnings, Location: ${b.address.split(',')[0]}`).join('\n')}

For EACH request, provide:
1. recommendation: "accept" or "decline" or "reschedule"
2. reason: Brief explanation (schedule fit, earnings, location)
3. suggested_time: If reschedule, suggest better time
4. priority: "high", "medium", or "low"

Return ONLY valid JSON array:
[
  {
    "request_index": 0,
    "recommendation": "accept",
    "reason": "Fits perfectly between morning jobs, great earnings",
    "priority": "high"
  }
]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  request_index: { type: "number" },
                  recommendation: { type: "string" },
                  reason: { type: "string" },
                  suggested_time: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    }
  };

  const handleApprove = async (booking, recommendation) => {
    setProcessing(booking.id);
    try {
      // Accept the booking
      await base44.entities.Booking.update(booking.id, {
        status: 'accepted',
        cleaner_confirmed: true,
        request_status: 'accepted'
      });

      // Send notification
      await base44.entities.Notification.create({
        recipient_email: booking.client_email,
        type: 'booking_accepted',
        title: '✓ Booking Accepted!',
        message: `Your cleaning for ${format(parseISO(booking.date), 'MMM d')} has been confirmed`,
        link: '/ClientBookings',
        is_read: false
      });

      toast.success('Booking accepted and added to your schedule!');
      loadPendingRequests();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error('Failed to accept booking');
    }
    setProcessing(null);
  };

  const handleDecline = async (booking) => {
    setProcessing(booking.id);
    try {
      await base44.entities.Booking.update(booking.id, {
        status: 'cleaner_declined',
        request_status: 'declined'
      });

      toast.success('Booking declined');
      loadPendingRequests();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error('Failed to decline booking');
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-puretask-blue" />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-puretask-blue" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 font-verdana">
            No pending requests. I'll notify you when new opportunities arrive! 🎯
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-fredoka flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-puretask-blue" />
          AI Assistant - {pendingRequests.length} New Request{pendingRequests.length !== 1 ? 's' : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.map((booking, idx) => {
          const recommendation = recommendations.find(r => r.request_index === idx);
          const earnings = (booking.total_price * 0.8) / 100;

          return (
            <div
              key={booking.id}
              className={`p-4 rounded-lg border-2 ${
                recommendation?.recommendation === 'accept'
                  ? 'border-green-200 bg-green-50'
                  : recommendation?.recommendation === 'decline'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Recommendation Badge */}
              {recommendation && (
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    className={`${
                      recommendation.recommendation === 'accept'
                        ? 'bg-green-600'
                        : recommendation.recommendation === 'decline'
                        ? 'bg-red-600'
                        : 'bg-amber-600'
                    } text-white`}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggests: {recommendation.recommendation.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${
                    recommendation.priority === 'high' ? 'border-red-500 text-red-700' :
                    recommendation.priority === 'medium' ? 'border-amber-500 text-amber-700' :
                    'border-gray-400 text-gray-600'
                  }`}>
                    {recommendation.priority} priority
                  </Badge>
                </div>
              )}

              {/* Booking Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-fredoka font-semibold">
                    {format(parseISO(booking.date), 'EEE, MMM d')} at {booking.start_time}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {booking.cleaning_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-verdana">{booking.hours} hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-verdana">{booking.address.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-fredoka font-semibold text-green-700">
                    ${earnings.toFixed(2)} earnings
                  </span>
                </div>
              </div>

              {/* AI Reasoning */}
              {recommendation && (
                <div className="p-2 bg-white/50 rounded text-xs mb-3">
                  <p className="font-verdana text-gray-700">
                    <span className="font-semibold">AI Analysis:</span> {recommendation.reason}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(booking, recommendation)}
                  disabled={processing === booking.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {processing === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(booking)}
                  disabled={processing === booking.id}
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}