import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { getEarningStatusInfo } from './PayoutService';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EarningsBreakdown({ cleanerEmail, statusFilter = 'all', limit = 20 }) {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, [cleanerEmail, statusFilter]);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const filter = { cleaner_email: cleanerEmail };
      if (statusFilter !== 'all') {
        filter.status = statusFilter;
      }

      const data = await base44.entities.CleanerEarning.filter(
        filter,
        '-created_date',
        limit
      );
      setEarnings(data);
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (earnings.length === 0) {
    return (
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-verdana">No earnings to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-fredoka text-2xl">Earnings Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {earnings.map((earning) => {
          const statusInfo = getEarningStatusInfo(earning.status);
          const isNegative = (earning.usd_due || 0) < 0;
          
          return (
            <div
              key={earning.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  earning.status === 'paid' ? 'bg-green-100' :
                  earning.status === 'reversed' ? 'bg-red-100' :
                  earning.status === 'batched' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {earning.status === 'paid' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {earning.status === 'reversed' && <XCircle className="w-5 h-5 text-red-600" />}
                  {earning.status === 'batched' && <Package className="w-5 h-5 text-blue-600" />}
                  {earning.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={createPageUrl('BookingDataInspector') + '?id=' + earning.booking_id}
                      className="font-fredoka font-semibold text-puretask-blue hover:underline"
                    >
                      Booking #{earning.booking_id.slice(0, 8)}
                    </Link>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-verdana">
                    {format(new Date(earning.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                  {earning.credits_earned && (
                    <p className="text-xs text-gray-500 font-verdana mt-1">
                      {earning.credits_earned.toFixed(0)} credits × {(earning.payout_percentage * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className={`font-fredoka font-bold text-xl ${
                  isNegative ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isNegative ? '-' : ''}${Math.abs(earning.usd_due || 0).toFixed(2)}
                </p>
                {earning.payout_id && (
                  <p className="text-xs text-gray-400 font-verdana mt-1">
                    Batch: {earning.payout_id.slice(0, 8)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}