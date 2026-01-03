import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, MapPin, AlertCircle } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

export default function UpcomingJobReminders({ cleanerEmail }) {
  const [upcomingJobs, setUpcomingJobs] = useState([]);

  useEffect(() => {
    loadUpcomingJobs();
  }, [cleanerEmail]);

  const loadUpcomingJobs = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

      const bookings = await base44.entities.Booking.filter({
        cleaner_email: cleanerEmail,
        status: { $in: ['accepted', 'scheduled'] },
        date: { $lte: tomorrowStr }
      });

      // Enrich with client profile data
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const clientProfiles = await base44.entities.ClientProfile.filter({
              user_email: booking.client_email
            });
            if (clientProfiles.length > 0) {
              const profile = clientProfiles[0];
              return {
                ...booking,
                pet_details: booking.pet_details || profile.pet_details,
                pet_temperament: profile.pet_temperament,
                focus_areas: profile.focus_areas,
                avoid_areas: profile.avoid_areas
              };
            }
          } catch (e) {
            console.log('Could not load client profile:', e);
          }
          return booking;
        })
      );

      setUpcomingJobs(enrichedBookings.sort((a, b) => 
        new Date(`${a.date}T${a.start_time}`) - new Date(`${b.date}T${b.start_time}`)
      ).slice(0, 2));
    } catch (error) {
      console.error('Error loading upcoming jobs:', error);
    }
  };

  if (upcomingJobs.length === 0) return null;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-fredoka flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          Upcoming Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingJobs.map(job => {
          const jobDate = parseISO(job.date);
          const timeLabel = isToday(jobDate) ? 'Today' : isTomorrow(jobDate) ? 'Tomorrow' : format(jobDate, 'MMM d');
          
          return (
            <div key={job.id} className="bg-white rounded-lg p-3 border-2 border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-amber-600 text-white text-xs">{timeLabel}</Badge>
                <span className="text-xs text-gray-600 font-verdana">{job.start_time}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="font-verdana">{job.hours}h {job.cleaning_type}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="w-3 h-3 text-gray-500 mt-0.5" />
                  <span className="font-verdana">{job.address}</span>
                </div>
                
                {(job.has_pets || job.parking_instructions || job.entry_instructions || job.notes) && (
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-amber-100">
                    <AlertCircle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-700 font-verdana space-y-0.5">
                      {job.has_pets && <p>🐾 {job.pet_details || 'Has pets'}</p>}
                      {job.parking_instructions && <p>🚗 {job.parking_instructions}</p>}
                      {job.entry_instructions && <p>🔑 {job.entry_instructions}</p>}
                      {job.notes && <p>📝 {job.notes}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}