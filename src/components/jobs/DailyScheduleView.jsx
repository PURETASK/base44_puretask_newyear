import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Calendar, Eye, Home, Bed, Bath } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { motion } from 'framer-motion';

export default function DailyScheduleView({ jobs, selectedDate, onSelectJob, myJobIds = [] }) {
  const displayDate = selectedDate || new Date();
  
  // Filter jobs for selected date - Handle both available and claimed jobs
  const dayJobs = jobs.filter(job => {
    try {
      const jobDate = parseISO(job.date);
      return format(jobDate, 'yyyy-MM-dd') === format(displayDate, 'yyyy-MM-dd');
    } catch {
      return false;
    }
  }).sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Group by time slots
  const timeSlots = [
    { label: 'Morning (6 AM - 12 PM)', start: '06:00', end: '12:00' },
    { label: 'Afternoon (12 PM - 5 PM)', start: '12:00', end: '17:00' },
    { label: 'Evening (5 PM - 10 PM)', start: '17:00', end: '22:00' }
  ];

  const getJobsForSlot = (start, end) => {
    return dayJobs.filter(job => job.start_time >= start && job.start_time < end);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-500" />
          My Schedule for {format(displayDate, 'EEEE, MMMM d, yyyy')}
          {isToday(displayDate) && (
            <Badge className="ml-2 bg-emerald-500">Today</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {dayJobs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-500">No jobs scheduled for this day</p>
            <p className="text-sm text-slate-400 mt-2">Browse available jobs to claim more work</p>
          </div>
        ) : (
          <>
            {timeSlots.map(slot => {
              const slotJobs = getJobsForSlot(slot.start, slot.end);
              if (slotJobs.length === 0) return null;

              return (
                <div key={slot.label}>
                  <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {slot.label}
                  </h3>
                  <div className="space-y-3">
                    {slotJobs.map((job, index) => {
                      const isMine = myJobIds.includes(job.id);
                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`${isMine ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="font-semibold text-slate-900">{job.start_time}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-600">{job.hours}h</span>
                                    {isMine && (
                                      <Badge className="bg-emerald-500">Your Job</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{job.address}</span>
                                  </div>
                                  
                                  {/* Property Details */}
                                  <div className="flex items-center gap-3 mb-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Home className="w-3 h-3" />
                                      {job.home_type || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Bed className="w-3 h-3" />
                                      {job.bedrooms || 0} bed
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Bath className="w-3 h-3" />
                                      {job.bathrooms || 0} bath
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {job.tasks?.slice(0, 3).map((task, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {task.replace(/_/g, ' ')}
                                      </Badge>
                                    ))}
                                    {job.tasks && job.tasks.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{job.tasks.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-xl font-bold text-emerald-600 mb-2">
                                    ${job.total_price}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSelectJob(job)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}