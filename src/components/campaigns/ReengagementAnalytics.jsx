import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Calendar, DollarSign } from 'lucide-react';

export default function ReengagementAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalCampaignsSent: 0,
    successfulDeliveries: 0,
    reactivatedClients: 0,
    revenueGenerated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get all re-engagement campaign logs
      const logs = await base44.asServiceRole.entities.MessageDeliveryLog.filter({
        message_type: 'reengagement'
      });

      const successfulDeliveries = logs.reduce((count, log) => {
        const successCount = log.delivery_results?.filter(r => r.success).length || 0;
        return count + successCount;
      }, 0);

      // Get bookings created after re-engagement campaigns
      const campaignClientEmails = [...new Set(logs.map(l => l.client_email))];
      let reactivatedCount = 0;
      let totalRevenue = 0;

      for (const clientEmail of campaignClientEmails) {
        const clientLogs = logs.filter(l => l.client_email === clientEmail);
        const lastCampaignDate = new Date(clientLogs[0]?.sent_at);

        // Check if they booked after campaign
        const bookingsAfterCampaign = await base44.asServiceRole.entities.Booking.filter({
          client_email: clientEmail,
          created_date: { $gte: lastCampaignDate.toISOString() }
        });

        if (bookingsAfterCampaign.length > 0) {
          reactivatedCount++;
          totalRevenue += bookingsAfterCampaign.reduce((sum, b) => sum + (b.total_price || 0), 0);
        }
      }

      setAnalytics({
        totalCampaignsSent: logs.length,
        successfulDeliveries,
        reactivatedClients: reactivatedCount,
        revenueGenerated: totalRevenue
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 text-blue-500" />
            <Badge className="bg-blue-100 text-blue-800">Total</Badge>
          </div>
          <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
            {analytics.totalCampaignsSent}
          </p>
          <p className="text-sm text-gray-600 font-verdana">Campaigns Sent</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-green-500" />
            <Badge className="bg-green-100 text-green-800">Delivered</Badge>
          </div>
          <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
            {analytics.successfulDeliveries}
          </p>
          <p className="text-sm text-gray-600 font-verdana">Successful Deliveries</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-500" />
            <Badge className="bg-purple-100 text-purple-800">Reactivated</Badge>
          </div>
          <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
            {analytics.reactivatedClients}
          </p>
          <p className="text-sm text-gray-600 font-verdana">Clients Won Back</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <Badge className="bg-green-100 text-green-800">Revenue</Badge>
          </div>
          <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
            ${analytics.revenueGenerated.toFixed(0)}
          </p>
          <p className="text-sm text-gray-600 font-verdana">Generated</p>
        </CardContent>
      </Card>
    </div>
  );
}