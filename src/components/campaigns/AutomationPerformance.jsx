import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Bell, MessageSquare } from 'lucide-react';

export default function AutomationPerformance() {
  const [stats, setStats] = useState({
    reminders: { sent: 0, delivered: 0 },
    reviews: { sent: 0, submitted: 0 },
    confirmations: { sent: 0, delivered: 0 },
    reengagement: { sent: 0, converted: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const logs = await base44.asServiceRole.entities.MessageDeliveryLog.list('-sent_at', 500);

      const reminders = logs.filter(l => l.message_type === 'pre_cleaning_reminder');
      const reviews = logs.filter(l => l.message_type === 'review_request');
      const confirmations = logs.filter(l => l.message_type === 'booking_confirmation');
      const reengagement = logs.filter(l => l.message_type === 'reengagement');

      const countDelivered = (logs) => {
        return logs.reduce((count, log) => {
          const successCount = log.delivery_results?.filter(r => r.success).length || 0;
          return count + successCount;
        }, 0);
      };

      // Count submitted reviews
      const reviewBookings = await base44.asServiceRole.entities.Booking.filter({
        review_submitted: true
      });

      setStats({
        reminders: { sent: reminders.length, delivered: countDelivered(reminders) },
        reviews: { sent: reviews.length, submitted: reviewBookings.length },
        confirmations: { sent: confirmations.length, delivered: countDelivered(confirmations) },
        reengagement: { sent: reengagement.length, converted: 0 }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const automations = [
    {
      name: 'Pre-Cleaning Reminders',
      icon: Calendar,
      color: 'blue',
      sent: stats.reminders.sent,
      metric: stats.reminders.delivered,
      metricLabel: 'Delivered',
      rate: stats.reminders.sent > 0 ? ((stats.reminders.delivered / stats.reminders.sent) * 100).toFixed(0) : 0
    },
    {
      name: 'Review Requests',
      icon: Star,
      color: 'yellow',
      sent: stats.reviews.sent,
      metric: stats.reviews.submitted,
      metricLabel: 'Reviews Received',
      rate: stats.reviews.sent > 0 ? ((stats.reviews.submitted / stats.reviews.sent) * 100).toFixed(0) : 0
    },
    {
      name: 'Booking Confirmations',
      icon: Bell,
      color: 'green',
      sent: stats.confirmations.sent,
      metric: stats.confirmations.delivered,
      metricLabel: 'Delivered',
      rate: stats.confirmations.sent > 0 ? ((stats.confirmations.delivered / stats.confirmations.sent) * 100).toFixed(0) : 0
    },
    {
      name: 'Re-engagement Campaigns',
      icon: MessageSquare,
      color: 'purple',
      sent: stats.reengagement.sent,
      metric: stats.reengagement.converted,
      metricLabel: 'Converted',
      rate: stats.reengagement.sent > 0 ? ((stats.reengagement.converted / stats.reengagement.sent) * 100).toFixed(0) : 0
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {automations.map((auto) => {
        const Icon = auto.icon;
        return (
          <Card key={auto.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 text-${auto.color}-500`} />
                <Badge className={`bg-${auto.color}-100 text-${auto.color}-800`}>
                  {auto.rate}%
                </Badge>
              </div>
              <p className="font-fredoka font-bold text-lg mb-1">{auto.name}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sent:</span>
                  <span className="font-bold">{auto.sent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{auto.metricLabel}:</span>
                  <span className="font-bold text-green-600">{auto.metric}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}