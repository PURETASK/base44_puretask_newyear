import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function BookingCalendar({ availability, onSelectDateTime }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const availableDays = availability?.map(a => a.day.toLowerCase()) || [];

  const isDateAvailable = (date) => {
    const dayName = format(date, 'EEEE').toLowerCase();
    return availableDays.includes(dayName) && date >= new Date();
  };

  const getTimeSlots = () => {
    if (!selectedDate) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const dayAvailability = availability?.find(a => a.day.toLowerCase() === dayName);
    
    if (!dayAvailability) return [];

    const slots = [];
    const start = parseInt(dayAvailability.start_time.split(':')[0]);
    const end = parseInt(dayAvailability.end_time.split(':')[0]);

    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (selectedDate && onSelectDateTime) {
      onSelectDateTime(selectedDate, time);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5 text-emerald-500" />
          Select Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateAvailable(date)}
              fromDate={new Date()}
              toDate={addDays(new Date(), 90)}
              className="rounded-md border"
            />
          </div>

          <div>
            {selectedDate ? (
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  Available times for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {getTimeSlots().map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Select a date to view available times</p>
              </div>
            )}
          </div>
        </div>

        {selectedDate && selectedTime && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Selected:</span>
              <Badge className="bg-emerald-500 text-white text-sm">
                {format(selectedDate, 'MMM d, yyyy')} at {selectedTime}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}