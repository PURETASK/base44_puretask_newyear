import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Zap, Clock } from 'lucide-react';
import { getPayoutStatusInfo } from './PayoutService';
import { format } from 'date-fns';

export default function PayoutHistoryTable({ cleanerEmail }) {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, [cleanerEmail]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Payout.filter(
        { cleaner_email: cleanerEmail },
        '-created_date',
        50
      );
      setPayouts(data);
    } catch (error) {
      console.error('Error loading payouts:', error);
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

  if (payouts.length === 0) {
    return (
      <Card className="rounded-3xl border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-verdana">No payout history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-fredoka text-2xl">Payout History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {payouts.map((payout) => {
          const statusInfo = getPayoutStatusInfo(payout.status);
          const isInstant = payout.payout_type === 'instant';
          
          return (
            <div
              key={payout.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isInstant ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {isInstant ? (
                    <Zap className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Calendar className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-fredoka font-semibold text-graphite">
                      {isInstant ? 'Instant Payout' : 'Weekly Payout'}
                    </p>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-verdana">
                    {format(new Date(payout.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                  {payout.booking_ids && (
                    <p className="text-xs text-gray-500 font-verdana mt-1">
                      {payout.booking_ids.length} job{payout.booking_ids.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-fredoka font-bold text-2xl text-green-600">
                  ${payout.amount.toFixed(2)}
                </p>
                {payout.fee > 0 && (
                  <p className="text-sm text-gray-500 font-verdana">
                    Fee: ${payout.fee.toFixed(2)}
                  </p>
                )}
                {payout.stripe_transfer_id && (
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {payout.stripe_transfer_id.slice(-8)}
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