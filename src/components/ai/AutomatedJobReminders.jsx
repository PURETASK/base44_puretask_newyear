import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, Clock, Calendar, MapPin, User, FileText, 
  CheckCircle, Send, Loader2, AlertCircle
} from 'lucide-react';
import { format, parseISO, addHours, isBefore, isToday, isTomorrow } from 'date-fns';

export default function AutomatedJobReminders() {
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    loadUpcomingJobs();
    const interval = setInterval(checkAndSendReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadUpcomingJobs = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Get bookings for next 48 hours
      const twoDaysFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const tomorrow = format(twoDaysFromNow, 'yyyy-MM-dd');

      const bookings = await base44.entities.Booking.filter({
        cleaner_email: currentUser.email,
        status: { $in: ['accepted', 'scheduled'] },
        date: { $lte: tomorrow }
      });

      // Sort by date/time
      const sorted = bookings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateA - dateB;
      });

      setUpcomingJobs(sorted);

      // Load existing reminders sent
      const sentReminders = await base44.entities.Message.filter({
        sender_email: currentUser.email,
        type: 'ai_message',
        content: { $regex: 'reminder' }
      });

      setReminders(sentReminders);

    } catch (error) {
      console.error('Error loading upcoming jobs:', error);
    }
    setLoading(false);
  };

  const checkAndSendReminders = async () => {
    for (const job of upcomingJobs) {
      const jobDateTime = new Date(`${job.date}T${job.start_time || '09:00'}`);
      const timeUntilJob = jobDateTime - new Date();
      const hoursUntil = timeUntilJob / (1000 * 60 * 60);

      // Send reminder 24 hours before if not already sent
      if (hoursUntil <= 24 && hoursUntil > 23 && !hasReminderBeenSent(job.id, '24h')) {
        await sendAutomatedReminder(job, '24h');
      }

      // Send reminder 2 hours before if not already sent
      if (hoursUntil <= 2 && hoursUntil > 1.5 && !hasReminderBeenSent(job.id, '2h')) {
        await sendAutomatedReminder(job, '2h');
      }
    }
  };

  const hasReminderBeenSent = (bookingId, reminderType) => {
    return reminders.some(r => 
      r.content.includes(bookingId) && r.content.includes(reminderType)
    );
  };

  const sendAutomatedReminder = async (job, reminderType) => {
    try {
      const currentUser = await base44.auth.me();
      
      // Get client profile for special notes
      const clientProfiles = await base44.entities.ClientProfile.filter({
        user_email: job.client_email
      });

      const clientNotes = clientProfiles[0]?.special_requests || '';
      const parkingInfo = job.parking_instructions || clientProfiles[0]?.default_parking_instructions || '';
      const entryInfo = job.entry_instructions || clientProfiles[0]?.default_entry_instructions || '';
      const petInfo = job.has_pets ? (job.pet_details || 'Client has pets') : '';

      // Create reminder message
      let message = '';
      if (reminderType === '24h') {
        message = `🔔 Reminder: You have a cleaning job tomorrow!\n\n`;
      } else {
        message = `⏰ Heads up: Your cleaning job starts in 2 hours!\n\n`;
      }

      message += `📅 ${format(parseISO(job.date), 'EEEE, MMMM d, yyyy')}\n`;
      message += `🕐 ${job.start_time} (${job.hours} hours)\n`;
      message += `📍 ${job.address}\n\n`;

      if (parkingInfo) {
        message += `🚗 Parking: ${parkingInfo}\n`;
      }
      if (entryInfo) {
        message += `🔑 Entry: ${entryInfo}\n`;
      }
      if (petInfo) {
        message += `🐾 Pets: ${petInfo}\n`;
      }
      if (clientNotes) {
        message += `📝 Notes: ${clientNotes}\n`;
      }

      message += `\n✨ Remember to take before/after photos and check in when you arrive!`;

      // Save as AI message
      const reminderMsg = await base44.entities.Message.create({
        sender_email: currentUser.email,
        content: message,
        type: 'ai_message',
        timestamp: new Date().toISOString(),
        metadata: {
          booking_id: job.id,
          reminder_type: reminderType,
          automated: true
        }
      });

      // Add to reminders list
      setReminders(prev => [...prev, reminderMsg]);

      return true;
    } catch (error) {
      console.error('Error sending automated reminder:', error);
      return false;
    }
  };

  const sendManualReminder = async (job) => {
    setSendingId(job.id);
    await sendAutomatedReminder(job, 'manual');
    await loadUpcomingJobs();
    setSendingId(null);
  };

  const getTimeUntilJob = (job) => {
    const jobDateTime = new Date(`${job.date}T${job.start_time || '09:00'}`);
    const now = new Date();
    const diff = jobDateTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 0) return 'Past';
    if (hours === 0) return `${minutes}m`;
    if (hours < 24) return `${hours}h ${minutes}m`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  const getJobTimeLabel = (job) => {
    const jobDate = parseISO(job.date);
    if (isToday(jobDate)) return 'Today';
    if (isTomorrow(jobDate)) return 'Tomorrow';
    return format(jobDate, 'MMM d');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (upcomingJobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-fredoka">No upcoming jobs in the next 48 hours</p>
          <p className="text-sm text-slate-500 font-verdana mt-1">
            Job reminders will appear here automatically
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <Bell className="w-4 h-4 text-amber-600" />
        <AlertDescription className="font-verdana">
          Automated reminders will be sent 24 hours and 2 hours before each job with all client-specific details
        </AlertDescription>
      </Alert>

      {upcomingJobs.map((job) => {
        const timeUntil = getTimeUntilJob(job);
        const timeLabel = getJobTimeLabel(job);
        const reminderSent24h = hasReminderBeenSent(job.id, '24h');
        const reminderSent2h = hasReminderBeenSent(job.id, '2h');

        return (
          <Card key={job.id} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-puretask-blue text-white">
                      {timeLabel}
                    </Badge>
                    <span className="text-sm font-verdana text-slate-600">
                      in {timeUntil}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-fredoka">
                    {job.hours}-Hour Cleaning
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  {reminderSent24h && (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      24h
                    </Badge>
                  )}
                  {reminderSent2h && (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      2h
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
                  <span className="font-verdana">
                    {format(parseISO(job.date), 'EEEE, MMMM d, yyyy')} at {job.start_time}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                  <span className="font-verdana">{job.address}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-500 mt-0.5" />
                  <span className="font-verdana">{job.client_email}</span>
                </div>
              </div>

              {(job.parking_instructions || job.entry_instructions || job.has_pets) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span className="text-sm font-fredoka font-semibold text-amber-900">
                      Important Details:
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 font-verdana space-y-1 ml-6">
                    {job.parking_instructions && <p>🚗 {job.parking_instructions}</p>}
                    {job.entry_instructions && <p>🔑 {job.entry_instructions}</p>}
                    {job.has_pets && <p>🐾 {job.pet_details || 'Client has pets'}</p>}
                  </div>
                </div>
              )}

              <Button
                onClick={() => sendManualReminder(job)}
                disabled={sendingId === job.id}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {sendingId === job.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reminder...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}