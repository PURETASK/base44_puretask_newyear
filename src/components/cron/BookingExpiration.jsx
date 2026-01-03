import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';

/**
 * Process expired bookings that haven't been confirmed by both parties
 * Runs as a scheduled task (cron job)
 */
export async function processExpiredBookings() {
  try {
    const allBookings = await base44.entities.Booking.list();
    const now = new Date();
    const results = [];

    for (const booking of allBookings) {
      if (booking.status !== 'pending_confirmation') continue;

      const createdDate = new Date(booking.created_date);
      const hoursSinceCreation = (now - createdDate) / (1000 * 60 * 60);

      if (hoursSinceCreation > 24) {
        await base44.entities.Booking.update(booking.id, {
          status: 'cancelled'
        });

        await base44.entities.Credit.create({
          client_email: booking.client_email,
          amount: booking.total_price,
          reason: 'no_show',
          booking_id: booking.id,
          used: false
        });

        const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
        if (clientProfiles.length > 0) {
          const profile = clientProfiles[0];
          await base44.entities.ClientProfile.update(profile.id, {
            credits_balance: (profile.credits_balance || 0) + booking.total_price
          });
        }

        results.push({
          booking_id: booking.id,
          action: 'expired_and_refunded',
          amount: booking.total_price
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error processing expired bookings:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check for no-show bookings (booking date passed without check-in)
 */
export async function processNoShowBookings() {
  try {
    const allBookings = await base44.entities.Booking.list();
    const now = new Date();
    const results = [];

    for (const booking of allBookings) {
      if (booking.status !== 'confirmed') continue;

      const bookingDate = new Date(booking.date);
      if (bookingDate >= now) continue;

      if (!booking.check_in_time) {
        await base44.entities.Booking.update(booking.id, {
          status: 'cancelled'
        });

        const totalCredit = booking.total_price + 15;
        
        await base44.entities.Credit.create({
          client_email: booking.client_email,
          amount: totalCredit,
          reason: 'no_show',
          booking_id: booking.id,
          used: false
        });

        const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: booking.client_email });
        if (clientProfiles.length > 0) {
          const profile = clientProfiles[0];
          await base44.entities.ClientProfile.update(profile.id, {
            credits_balance: (profile.credits_balance || 0) + totalCredit
          });
        }

        results.push({
          booking_id: booking.id,
          action: 'no_show_credit_issued',
          amount: totalCredit
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error processing no-show bookings:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// React component for manual triggering
export default function BookingExpiration() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const runExpiredBookings = async () => {
    setLoading(true);
    const res = await processExpiredBookings();
    setResult(res);
    setLoading(false);
  };

  const runNoShowCheck = async () => {
    setLoading(true);
    const res = await processNoShowBookings();
    setResult(res);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Booking Expiration & No-Show Handler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runExpiredBookings} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Process Expired Bookings
          </Button>
          <Button onClick={runNoShowCheck} disabled={loading} variant="outline">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Check No-Shows
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <p className="text-green-800">
                ✅ Processed {result.processed} bookings
              </p>
            ) : (
              <p className="text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error: {result.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}