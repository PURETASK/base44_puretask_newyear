
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function JobsMonthlyCalendar({ jobs, onJobClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getJobsForDay = (day) => {
    return jobs.filter(job => isSameDay(new Date(job.date), day));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'payment_hold': return 'bg-cyan-500';
      case 'awaiting_cleaner': return 'bg-amber-500';
      case 'cleaning_now': return 'bg-green-500';
      case 'in_progress': return 'bg-purple-500';
      case 'reschedule_requested': return 'bg-orange-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Confirmed',
      'payment_hold': 'Pending',
      'awaiting_cleaner': 'Awaiting',
      'cleaning_now': 'Active',
      'in_progress': 'In Progress',
      'reschedule_requested': 'Reschedule Requested'
    };
    return labels[status] || status;
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayJobs = getJobsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={idx}
                className={`min-h-24 p-2 rounded-lg border transition-all ${
                  isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                } ${isToday ? 'ring-2 ring-blue-500 border-blue-500' : ''} ${
                  dayJobs.length > 0 ? 'cursor-pointer hover:shadow-md' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {dayJobs.length > 0 && (
                  <div className="space-y-1">
                    {dayJobs.slice(0, 3).map((job, jobIdx) => (
                      <div
                        key={jobIdx}
                        onClick={() => onJobClick(job)}
                        className={`${getStatusColor(job.status)} text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate`}
                        title={`${job.start_time} - ${job.address}`}
                      >
                        {job.start_time}
                      </div>
                    ))}
                    {dayJobs.length > 3 && (
                      <div className="text-xs text-slate-500 text-center">
                        +{dayJobs.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-sm text-slate-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-500"></div>
            <span className="text-sm text-slate-600">Payment Held</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-sm text-slate-600">Awaiting Confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-sm text-slate-600">Cleaning Now</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-sm text-slate-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-sm text-slate-600">Reschedule Requested</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
