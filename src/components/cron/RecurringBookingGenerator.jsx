import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Repeat, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';

export default function RecurringBookingGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateRecurringBookings = async () => {
    setLoading(true);
    setResult(null);

    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      // Get all active recurring bookings
      const recurringBookings = await base44.entities.RecurringBooking.filter({ is_active: true });
      
      let created = 0;
      let skipped = 0;
      const errors = [];

      for (const recurring of recurringBookings) {
        try {
          const nextBookingDate = parseISO(recurring.next_booking_date);
          
          // Check if we need to create a booking (next date is within the next week)
          if (nextBookingDate <= nextWeek && nextBookingDate >= today) {
            // Check if booking already exists for this date
            const existingBookings = await base44.entities.Booking.filter({
              client_email: recurring.client_email,
              cleaner_email: recurring.cleaner_email,
              date: format(nextBookingDate, 'yyyy-MM-dd'),
              start_time: recurring.start_time
            });

            if (existingBookings.length === 0) {
              // Create the booking
              await base44.entities.Booking.create({
                client_email: recurring.client_email,
                cleaner_email: recurring.cleaner_email,
                date: format(nextBookingDate, 'yyyy-MM-dd'),
                start_time: recurring.start_time,
                hours: recurring.hours,
                tasks: recurring.tasks,
                task_quantities: recurring.task_quantities,
                address: recurring.address,
                latitude: recurring.latitude,
                longitude: recurring.longitude,
                total_price: recurring.total_price,
                status: 'scheduled',
                recurring_booking_id: recurring.id,
                client_confirmed: true,
                cleaner_confirmed: true
              });

              // Calculate next booking date
              let newNextDate;
              switch (recurring.frequency) {
                case 'weekly':
                  newNextDate = addWeeks(nextBookingDate, 1);
                  break;
                case 'biweekly':
                  newNextDate = addWeeks(nextBookingDate, 2);
                  break;
                case 'monthly':
                  newNextDate = addMonths(nextBookingDate, 1);
                  break;
                default:
                  newNextDate = addWeeks(nextBookingDate, 1);
              }

              // Update recurring booking with new next date
              await base44.entities.RecurringBooking.update(recurring.id, {
                next_booking_date: format(newNextDate, 'yyyy-MM-dd')
              });

              created++;
            } else {
              skipped++;
            }
          }
        } catch (error) {
          console.error(`Error processing recurring booking ${recurring.id}:`, error);
          errors.push({ id: recurring.id, error: error.message });
        }
      }

      setResult({
        success: true,
        created,
        skipped,
        errors,
        message: `Successfully created ${created} recurring booking(s). Skipped ${skipped} duplicate(s).`
      });

    } catch (error) {
      console.error('Error generating recurring bookings:', error);
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
          <Repeat className="w-5 h-5 text-purple-500" />
          Generate Recurring Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          This will create new bookings for all active recurring schedules that are due within the next 7 days.
        </p>

        <Button 
          onClick={generateRecurringBookings}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Repeat className="w-4 h-4 mr-2" />
              Run Generator
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
          <strong>Note:</strong> Run this daily via a scheduled task or manually from the admin dashboard.
        </p>
      </CardContent>
    </Card>
  );
}