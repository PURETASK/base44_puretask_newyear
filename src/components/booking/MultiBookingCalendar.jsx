import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isAfter, isBefore } from 'date-fns';

export default function MultiBookingCalendar({ selectedDates, onDatesChange, minDate = new Date() }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date) => {
    // Don't allow selecting dates in the past
    if (isBefore(date, minDate)) return;

    const isSelected = selectedDates.some(d => isSameDay(new Date(d), date));
    
    if (isSelected) {
      // Remove date
      onDatesChange(selectedDates.filter(d => !isSameDay(new Date(d), date)));
    } else {
      // Add date
      onDatesChange([...selectedDates, format(date, 'yyyy-MM-dd')]);
    }
  };

  const clearAllDates = () => {
    onDatesChange([]);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Card className="border-2 border-puretask-blue rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
            <Calendar className="w-5 h-5 text-puretask-blue" />
            Select Dates
          </CardTitle>
          {selectedDates.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllDates}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        {selectedDates.length > 0 && (
          <Badge className="bg-puretask-blue text-white font-fredoka">
            {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={prevMonth}
            className="hover:bg-blue-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="font-fredoka font-bold text-lg text-graphite">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={nextMonth}
            className="hover:bg-blue-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-fredoka font-semibold text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map(date => {
            const isSelected = selectedDates.some(d => isSameDay(new Date(d), date));
            const isPast = isBefore(date, minDate);
            const isToday = isSameDay(date, new Date());

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={isPast}
                className={`
                  p-2 rounded-lg text-sm font-verdana font-medium transition-all
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                  ${isSelected ? 'bg-puretask-blue text-white hover:bg-blue-600 shadow-md' : 'text-graphite'}
                  ${isToday && !isSelected ? 'border-2 border-puretask-blue' : ''}
                `}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>

        {/* Selected Dates List */}
        {selectedDates.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-fredoka font-semibold text-gray-700 mb-2">
              Selected Dates:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDates.sort().map(date => (
                <Badge 
                  key={date} 
                  className="bg-blue-100 text-puretask-blue font-verdana cursor-pointer hover:bg-blue-200"
                  onClick={() => handleDateClick(new Date(date))}
                >
                  {format(new Date(date), 'MMM d, yyyy')}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}