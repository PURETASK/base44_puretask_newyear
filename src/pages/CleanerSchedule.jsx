import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import AITooltip from '../components/ai/AITooltip';
import { analytics } from '../components/analytics/AnalyticsService';
import BookingRequestExplainer from '../components/booking/BookingRequestExplainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, 
  ChevronLeft, ChevronRight, CheckCircle, Circle, Loader2, ArrowRight
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const CLEANING_TYPE_COLORS = {
  basic: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  deep: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
  moveout: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' }
};

export default function CleanerSchedule() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('2weeks');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [jobsForDate, setJobsForDate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate && allJobs.length > 0) {
      const filtered = allJobs.filter(job => {
        const jobDate = new Date(job.date);
        return isSameDay(jobDate, selectedDate);
      });
      setJobsForDate(filtered);
      setSelectedJobId(null);
    }
  }, [selectedDate, allJobs]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
      if (cleanerProfiles.length === 0) {
        navigate(createPageUrl('Home'));
        return;
      }

      const jobs = await base44.entities.Booking.filter({ 
        cleaner_email: currentUser.email,
        status: { $in: ['awaiting_cleaner_response', 'accepted', 'on_the_way', 'in_progress', 'awaiting_client'] }
      });
      setAllJobs(jobs);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await base44.entities.Booking.update(jobId, {
        status: 'accepted',
        cleaner_confirmed: true
      });
      await base44.entities.Event.create({
        booking_id: jobId,
        event_type: 'confirmed',
        user_email: user.email,
        details: 'Cleaner accepted the job'
      });
      
      // Track analytics
      analytics.cleaner('job_accepted', { booking_id: jobId });
      
      // Trigger booking confirmation automation
      try {
        await base44.functions.invoke('sendBookingConfirmation', { booking_id: jobId });
      } catch (e) {
        console.log('Confirmation automation failed:', e);
      }
      
      await loadData();
      setSelectedJobId(null);
    } catch (error) {
      alert('Failed to accept job');
    }
  };

  const handleDeclineJob = async (jobId) => {
    try {
      // Track analytics
      analytics.cleaner('job_declined', { booking_id: jobId });
      
      await base44.entities.Booking.update(jobId, {
        status: 'cleaner_declined'
      });
      await base44.entities.Event.create({
        booking_id: jobId,
        event_type: 'cancelled',
        user_email: user.email,
        details: 'Cleaner declined the job'
      });
      await loadData();
      setSelectedJobId(null);
    } catch (error) {
      alert('Failed to decline job');
    }
  };

  const handleOnMyWay = async (jobId) => {
    try {
      await base44.entities.Booking.update(jobId, {
        status: 'on_the_way'
      });
      await base44.entities.Event.create({
        booking_id: jobId,
        event_type: 'check_in',
        user_email: user.email,
        details: 'Cleaner is on the way'
      });
      
      // Trigger on my way automation
      try {
        await base44.functions.invoke('sendOnMyWay', { booking_id: jobId, eta_minutes: 15 });
      } catch (e) {
        console.log('On my way automation failed:', e);
      }
      
      navigate(createPageUrl(`CleanerJobWorkspace?job_id=${jobId}`));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleViewJob = (jobId) => {
    navigate(createPageUrl(`CleanerJobWorkspace?job_id=${jobId}`));
  };

  const getJobsForDay = (date) => {
    return allJobs.filter(job => {
      const jobDate = new Date(job.date);
      return isSameDay(jobDate, date);
    });
  };

  const renderTwoWeekView = () => {
    const start = startOfWeek(selectedDate);
    const days = [];
    for (let i = 0; i < 14; i++) {
      days.push(addDays(start, i));
    }

    return (
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, idx) => {
          const dayJobs = getJobsForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected 
                  ? 'border-puretask-blue bg-blue-50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <p className="text-xs font-verdana text-gray-500 mb-1">
                  {format(day, 'EEE')}
                </p>
                <p className={`text-2xl font-fredoka font-bold mb-2 ${
                  isToday ? 'text-puretask-blue' : 'text-graphite'
                }`}>
                  {format(day, 'd')}
                </p>
                <div className="flex justify-center gap-1">
                  {dayJobs.map((job, jIdx) => {
                    const colors = CLEANING_TYPE_COLORS[job.cleaning_type] || CLEANING_TYPE_COLORS.basic;
                    const isRequest = job.status === 'awaiting_cleaner_response';
                    return isRequest ? (
                      <Circle key={jIdx} className={`w-2 h-2 ${colors.text}`} />
                    ) : (
                      <div key={jIdx} className={`w-2 h-2 rounded-full ${colors.bg}`} />
                    );
                  })}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-2xl font-fredoka font-bold text-graphite">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-fredoka font-bold text-gray-500 text-sm py-2">
              {d}
            </div>
          ))}
          {days.map((day, idx) => {
            const dayJobs = getJobsForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-lg border transition-all ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${
                  isSelected 
                    ? 'border-puretask-blue bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-lg font-fredoka mb-1 ${
                  isToday ? 'text-puretask-blue font-bold' : 'text-graphite'
                }`}>
                  {format(day, 'd')}
                </p>
                <div className="flex justify-center gap-0.5 flex-wrap">
                  {dayJobs.slice(0, 3).map((job, jIdx) => {
                    const colors = CLEANING_TYPE_COLORS[job.cleaning_type] || CLEANING_TYPE_COLORS.basic;
                    const isRequest = job.status === 'awaiting_cleaner_response';
                    return isRequest ? (
                      <Circle key={jIdx} className={`w-1.5 h-1.5 ${colors.text}`} />
                    ) : (
                      <div key={jIdx} className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  const requests = jobsForDate.filter(j => j.status === 'awaiting_cleaner_response');
  const accepted = jobsForDate.filter(j => ['accepted', 'on_the_way', 'in_progress'].includes(j.status));
  const selectedJob = jobsForDate.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-fredoka font-bold text-graphite mb-8">My Schedule</h1>

        {/* Calendar Panel */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === '2weeks' ? 'default' : 'outline'}
                  onClick={() => setViewMode('2weeks')}
                  size="sm"
                  className="font-fredoka"
                >
                  2 Weeks
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                  size="sm"
                  className="font-fredoka"
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === '2weeks' ? renderTwoWeekView() : renderMonthView()}
          </CardContent>
        </Card>

        {/* Day Summary */}
        {selectedDate && (
          <Card className="mb-6 border-2 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <h2 className="text-2xl font-fredoka font-bold text-graphite mb-2">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <p className="text-gray-600 font-verdana">
                {requests.length} job request{requests.length !== 1 ? 's' : ''} • {accepted.length} accepted job{accepted.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Requests */}
          <div>
            <h3 className="text-xl font-fredoka font-bold text-graphite mb-4">Job Requests</h3>
            {requests.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-8 text-center text-gray-500 font-verdana">
                  No job requests for this day.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map(job => {
                  const colors = CLEANING_TYPE_COLORS[job.cleaning_type] || CLEANING_TYPE_COLORS.basic;
                  const estimatedCredits = Math.round((job.snapshot_total_rate_cph || 300) * (job.hours || 2));
                  
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`cursor-pointer border-l-4 ${colors.border} border-2 transition-all hover:shadow-lg ${
                          selectedJobId === job.id ? 'border-puretask-blue bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedJobId(job.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-2xl font-fredoka font-bold text-graphite mb-1">
                                {job.start_time || 'Time TBD'}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-base text-gray-700 font-verdana font-semibold">{job.client_email}</p>
                                {job.matched_via_smart_algorithm && (
                                  <AITooltip
                                    variant="recommended"
                                    reason="AI matched this booking based on your preferences and schedule"
                                  />
                                )}
                              </div>
                            </div>
                            <Badge className={`${colors.bg} text-white text-sm px-3 py-1`}>
                              {job.cleaning_type}
                            </Badge>
                          </div>
                          <p className="text-base text-gray-700 font-verdana mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {job.address?.substring(0, 40)}...
                          </p>
                          <div className="flex items-center justify-between text-base">
                            <span className="text-gray-700 font-verdana font-semibold flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.hours || 2} hrs
                            </span>
                            <span className="font-fredoka font-bold text-fresh-mint text-lg">~{estimatedCredits} credits</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accepted Jobs */}
          <div>
            <h3 className="text-xl font-fredoka font-bold text-graphite mb-4">Accepted Jobs</h3>
            {accepted.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-8 text-center text-gray-500 font-verdana">
                  No accepted jobs for this day.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {accepted.map(job => {
                  const colors = CLEANING_TYPE_COLORS[job.cleaning_type] || CLEANING_TYPE_COLORS.basic;
                  const estimatedCredits = Math.round((job.snapshot_total_rate_cph || 300) * (job.hours || 2));
                  
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`cursor-pointer border-l-4 ${colors.border} border-2 transition-all hover:shadow-lg ${
                          selectedJobId === job.id ? 'border-puretask-blue bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedJobId(job.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-2xl font-fredoka font-bold text-graphite mb-1">
                                {job.start_time} - {job.start_time ? format(new Date(`2000-01-01 ${job.start_time}`).getTime() + (job.hours || 2) * 3600000, 'HH:mm') : ''}
                              </p>
                              <p className="text-base text-gray-700 font-verdana font-semibold">{job.client_email}</p>
                            </div>
                            <Badge className={`${colors.bg} text-white text-sm px-3 py-1`}>
                              {job.cleaning_type}
                            </Badge>
                          </div>
                          <p className="text-base text-gray-700 font-verdana mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {job.address?.substring(0, 40)}...
                          </p>
                          <div className="flex items-center justify-between text-base mb-2">
                            <span className="text-gray-700 font-verdana font-semibold flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.hours || 2} hrs
                            </span>
                            <span className="font-fredoka font-bold text-fresh-mint text-lg">~{estimatedCredits} credits</span>
                          </div>
                          <Badge variant="outline" className="mt-1">{job.status.replace('_', ' ')}</Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Job Summary Card */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-puretask-blue shadow-2xl z-40"
            >
              <div className="max-w-7xl mx-auto">
                <BookingRequestExplainer booking={selectedJob} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2">
                      {selectedJob.client_email}
                    </h3>
                    <p className="text-gray-600 font-verdana mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.address}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={`${CLEANING_TYPE_COLORS[selectedJob.cleaning_type]?.bg} text-white`}>
                        {selectedJob.cleaning_type}
                      </Badge>
                      <span className="text-sm font-verdana text-gray-600">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {selectedJob.start_time || 'Time TBD'}
                      </span>
                      <span className="text-sm font-verdana text-gray-600">
                        {selectedJob.hours || 2} hours recommended
                      </span>
                      <span className="font-fredoka font-bold text-fresh-mint">
                        ~{Math.round((selectedJob.snapshot_total_rate_cph || 300) * (selectedJob.hours || 2))} credits
                      </span>
                      <Badge variant="outline">{selectedJob.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedJobId(null)}
                    className="text-gray-500 hover:text-graphite"
                  >
                    ✕
                  </Button>
                </div>

                <div className="flex gap-3">
                  {selectedJob.status === 'awaiting_cleaner_response' && (
                    <>
                      <Button
                        onClick={() => handleAcceptJob(selectedJob.id)}
                        className="flex-1 bg-fresh-mint hover:bg-green-600 text-white font-fredoka font-bold"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Accept Job
                      </Button>
                      <Button
                        onClick={() => handleDeclineJob(selectedJob.id)}
                        variant="outline"
                        className="flex-1 font-fredoka border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {selectedJob.status === 'accepted' && (
                    <>
                      <Button
                        onClick={() => handleOnMyWay(selectedJob.id)}
                        className="flex-1 brand-gradient text-white font-fredoka font-bold"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        On My Way
                      </Button>
                      <Button
                        onClick={() => handleViewJob(selectedJob.id)}
                        variant="outline"
                        className="flex-1 font-fredoka"
                      >
                        View Job
                      </Button>
                    </>
                  )}

                  {['on_the_way', 'in_progress'].includes(selectedJob.status) && (
                    <Button
                      onClick={() => handleViewJob(selectedJob.id)}
                      className="flex-1 brand-gradient text-white font-fredoka font-bold"
                    >
                      Continue Job
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}