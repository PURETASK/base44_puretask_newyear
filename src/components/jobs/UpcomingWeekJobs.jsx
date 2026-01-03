import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';

export default function UpcomingWeekJobs({ jobs, onJobClick }) {
  const today = new Date();
  const weekEnd = addDays(today, 7);

  const upcomingJobs = jobs
    .filter(job => {
      const jobDate = parseISO(job.date);
      return isWithinInterval(jobDate, { start: today, end: weekEnd });
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateA - dateB;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cleaning_now': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'awaiting_cleaner': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Scheduled',
      'cleaning_now': 'Cleaning Now',
      'in_progress': 'In Progress',
      'awaiting_cleaner': 'Awaiting Confirmation'
    };
    return labels[status] || status;
  };

  if (upcomingJobs.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Upcoming This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No jobs scheduled for this week</p>
          <p className="text-sm text-slate-500 mt-2">Check the job marketplace for new opportunities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          Upcoming This Week ({upcomingJobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {upcomingJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onJobClick(job)}
              className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">
                        {format(parseISO(job.date), 'EEEE, MMMM d')}
                      </p>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.start_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.hours}h
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${job.total_price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">{job.address}</p>
              </div>

              {job.tasks && job.tasks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tasks.slice(0, 3).map((task, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {task}
                    </Badge>
                  ))}
                  {job.tasks.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.tasks.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}