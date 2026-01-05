import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Repeat, Calendar, Info } from 'lucide-react';
import { format, addWeeks, addMonths } from 'date-fns';

export default function RecurringBookingSetup({ bookingTemplate, onGenerateDates, onCancel }) {
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [occurrences, setOccurrences] = useState(4);
  const [previewDates, setPreviewDates] = useState([]);

  const generatePreviewDates = () => {
    const dates = [];
    const startDate = new Date(bookingTemplate.date);
    
    for (let i = 0; i < occurrences; i++) {
      let nextDate;
      if (frequency === 'weekly') {
        nextDate = addWeeks(startDate, i);
      } else if (frequency === 'biweekly') {
        nextDate = addWeeks(startDate, i * 2);
      } else if (frequency === 'monthly') {
        nextDate = addMonths(startDate, i);
      }
      dates.push(format(nextDate, 'yyyy-MM-dd'));
    }
    
    setPreviewDates(dates);
    return dates;
  };

  const handleGenerate = () => {
    const dates = generatePreviewDates();
    onGenerateDates({
      frequency,
      dayOfWeek,
      occurrences,
      dates
    });
  };

  React.useEffect(() => {
    if (occurrences > 0) {
      generatePreviewDates();
    }
  }, [frequency, occurrences, bookingTemplate.date]);

  return (
    <Card className="border-2 border-purple-300 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Repeat className="w-5 h-5 text-purple-600" />
          Set Up Recurring Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert className="border-purple-200 bg-purple-50 rounded-xl">
          <Info className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900 font-verdana">
            Create multiple bookings with the same settings, repeating at regular intervals.
          </AlertDescription>
        </Alert>

        {/* Frequency Selection */}
        <div>
          <Label className="font-fredoka font-medium text-graphite mb-2 block">
            Frequency
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'weekly', label: 'Weekly' },
              { value: 'biweekly', label: 'Bi-Weekly' },
              { value: 'monthly', label: 'Monthly' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFrequency(option.value)}
                className={`p-3 rounded-xl text-sm font-fredoka font-semibold transition-all border-2 ${
                  frequency === option.value
                    ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                    : 'border-gray-300 bg-white text-graphite hover:border-purple-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Occurrences */}
        <div>
          <Label className="font-fredoka font-medium text-graphite mb-2 block">
            Number of Bookings
          </Label>
          <Input
            type="number"
            min="1"
            max="52"
            value={occurrences}
            onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
            className="font-verdana"
          />
          <p className="text-xs text-gray-500 mt-1 font-verdana">
            Maximum 52 recurring bookings
          </p>
        </div>

        {/* Preview Dates */}
        {previewDates.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-fredoka font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Preview ({previewDates.length} bookings)
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {previewDates.map((date, index) => (
                <div key={index} className="flex items-center justify-between text-sm font-verdana py-1">
                  <span className="text-gray-700">Booking #{index + 1}</span>
                  <Badge variant="outline" className="font-verdana">
                    {format(new Date(date), 'MMM d, yyyy')} at {bookingTemplate.time}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-full font-fredoka font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-fredoka font-semibold"
          >
            Generate {occurrences} Bookings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}