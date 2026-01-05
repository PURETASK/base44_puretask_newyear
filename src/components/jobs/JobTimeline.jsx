import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { motion } from 'framer-motion';
import { convertTo12Hour } from '../utils/timeUtils';
import JobMapPreview from './JobMapPreview';

export default function JobTimeline({ jobs, inProgressJobs, completedJobs, onSelectJob, onStatusChange, onReload, userEmail }) {
  const navigate = useNavigate();

  const getDateLabel = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending_confirmation': return 'bg-amber-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  // Group jobs by date
  const groupJobsByDate = () => {
    const grouped = {};
    
    jobs.forEach(job => {
      const dateKey = job.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(job);
    });

    // Sort jobs within each date by start_time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  };

  const groupedJobs = groupJobsByDate();
  const sortedDates = Object.keys(groupedJobs).sort();

  return (
    <div className="space-y-8">
      {/* In Progress Jobs */}
      {inProgressJobs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            Currently Working
          </h2>
          <div className="space-y-4">
            {inProgressJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-2 border-blue-500 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="bg-blue-500 text-white mb-2">IN PROGRESS</Badge>
                        <h3 className="text-xl font-bold text-slate-900">{format(parseISO(job.date), 'EEEE, MMMM d')}</h3>
                        <p className="text-slate-600">{convertTo12Hour(job.start_time)} • {job.hours} hours</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${(job.total_price * 0.85).toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Your earnings</p>
                      </div>
                    </div>

                    <JobMapPreview job={job} />

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => onSelectJob(job)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onStatusChange(job, 'completed')}
                        className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Jobs by Date */}
      {sortedDates.map((date, idx) => (
        <div key={date}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-500" />
            {getDateLabel(date)}
          </h2>
          <div className="space-y-4">
            {groupedJobs[date].map((job, jobIdx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: jobIdx * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {job.status === 'pending_confirmation' && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 animate-pulse">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Needs Confirmation
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {convertTo12Hour(job.start_time)} • {job.hours} hour{job.hours !== 1 ? 's' : ''}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{job.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">${(job.total_price * 0.85).toFixed(2)}</p>
                        <p className="text-sm text-slate-500">Your earnings</p>
                      </div>
                    </div>

                    {/* Tasks */}
                    {job.tasks && job.tasks.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Tasks:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.tasks.map((task, idx) => (
                            <Badge key={idx} variant="outline">{task}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <JobMapPreview job={job} />

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => onSelectJob(job)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Details
                      </Button>
                      {job.status === 'pending_confirmation' && (
                        <Button
                          onClick={() => onStatusChange(job, 'confirmed')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Job
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {sortedDates.length === 0 && inProgressJobs.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Jobs</h3>
            <p className="text-slate-600 mb-4">Browse available jobs to get started</p>
            <Button onClick={() => navigate(createPageUrl('BrowseJobs'))}>
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed Jobs Summary */}
      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Recently Completed
          </h2>
          <Card className="border-0 shadow-md bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {completedJobs.length} completed job{completedJobs.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Total earned: ${completedJobs.reduce((sum, j) => sum + (j.total_price * 0.85), 0).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl('CleanerPayouts'))}
                >
                  View Payouts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}