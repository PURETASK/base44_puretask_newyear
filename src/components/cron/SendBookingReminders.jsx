import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { differenceInHours, parseISO } from 'date-fns';

export default function SendBookingReminders() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendReminders = async () => {
    setLoading(true);
    setResult(null);

    try {
      const allBookings = await base44.entities.Booking.filter({ 
        status: 'scheduled' 
      });
      
      const now = new Date();
      let sent = 0;
      let skipped = 0;
      const errors = [];

      for (const booking of allBookings) {
        try {
          const bookingDateTime = parseISO(`${booking.date}T${booking.start_time}`);
          const hoursUntil = differenceInHours(bookingDateTime, now);

          // Send reminder if booking is 23-25 hours away (24hr window)
          if (hoursUntil >= 23 && hoursUntil <= 25) {
            // Send to client
            const clientUsers = await base44.entities.User.filter({ email: booking.client_email });
            if (clientUsers.length > 0 && clientUsers[0].sms_consent) {
              await base44.integrations.Core.SendEmail({
                to: booking.client_email,
                subject: '⏰ Reminder: Your Cleaning is Tomorrow',
                body: `This is a friendly reminder about your upcoming cleaning:

Date: ${booking.date}
Time: ${booking.start_time}
Address: ${booking.address}
Duration: ${booking.hours} hours

Your cleaner will arrive within the scheduled window. Make sure someone is available to let them in!`
              });
            }

            // Send to cleaner
            const cleanerUsers = await base44.entities.User.filter({ email: booking.cleaner_email });
            if (cleanerUsers.length > 0 && cleanerUsers[0].sms_consent) {
              await base44.integrations.Core.SendEmail({
                to: booking.cleaner_email,
                subject: '⏰ Reminder: You Have a Job Tomorrow',
                body: `This is a reminder about your upcoming cleaning job:

Date: ${booking.date}
Time: ${booking.start_time}
Address: ${booking.address}
Duration: ${booking.hours} hours
Tasks: ${booking.tasks.join(', ')}

Don't forget to check in via GPS when you arrive!`
              });
            }

            sent++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`Error sending reminder for booking ${booking.id}:`, error);
          errors.push({ id: booking.id, error: error.message });
        }
      }

      setResult({
        success: true,
        sent,
        skipped,
        errors,
        message: `Sent ${sent} reminder(s). ${skipped} booking(s) not in 24hr window.`
      });

    } catch (error) {
      console.error('Error sending reminders:', error);
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          Send 24hr Booking Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          This will send reminder emails to all clients and cleaners with bookings scheduled in 24 hours.
        </p>

        <Button 
          onClick={sendReminders}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Send Reminders
            </>
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.message}
              </p>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2 text-sm text-red-800">
                <p className="font-medium">Errors:</p>
                <ul className="list-disc list-inside">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>Booking {err.id}: {err.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-500">
          <strong>Recommended:</strong> Run this once daily at a scheduled time (e.g., 9 AM).
        </p>
      </CardContent>
    </Card>
  );
}