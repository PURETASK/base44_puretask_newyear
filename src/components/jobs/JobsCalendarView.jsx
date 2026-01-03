import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';

export default function JobsCalendarView({ jobs, onSelectJob, myJobIds = [] }) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getJobsForDay = (day) => {
    return jobs.filter(job => {
      try {
        return isSameDay(parseISO(job.date), day);
      } catch {
        return false;
      }
    });
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const today = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span className="text-slate-600">Your Jobs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-slate-600">Available</span>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dayJobs = getJobsForDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`min-h-24 p-2 rounded-lg border transition-all ${
                  isToday ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200'
                } ${!isCurrentMonth ? 'bg-slate-50 opacity-50' : 'bg-white hover:shadow-md'}`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map(job => {
                    const isMine = myJobIds.includes(job.id);
                    return (
                      <button
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className={`w-full text-left p-1.5 rounded text-xs transition-all ${
                          isMine 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' 
                            : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                        }`}
                      >
                        <div className="font-semibold truncate flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.start_time}
                        </div>
                        <div className="truncate flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${job.total_price}
                        </div>
                      </button>
                    );
                  })}
                  {dayJobs.length > 3 && (
                    <div className="text-xs text-slate-500 text-center font-medium">
                      +{dayJobs.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}