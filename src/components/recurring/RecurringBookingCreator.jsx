import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

export default function RecurringBookingCreator({ clientEmail, cleanerEmail, bookingData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    frequency: 'weekly',
    day_of_week: 'Monday',
    start_time: bookingData?.start_time || '09:00',
    ...bookingData
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Create RecurringBooking
      const recurring = await base44.entities.RecurringBooking.create({
        client_email: clientEmail,
        cleaner_email: cleanerEmail,
        frequency: formData.frequency,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        hours: formData.hours,
        tasks: formData.tasks || [],
        task_quantities: formData.task_quantities || {},
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        total_price: formData.total_price,
        is_active: true,
        next_booking_date: calculateNextDate(formData.day_of_week)
      });

      alert('Recurring booking created! Future bookings will be generated automatically.');
      
      if (onSuccess) onSuccess(recurring);
    } catch (error) {
      console.error('Error creating recurring booking:', error);
      alert('Failed to create recurring booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDate = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayOfWeek);
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) daysUntilTarget += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    
    return nextDate.toISOString().split('T')[0];
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly', description: 'Every week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Once a month' }
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-puretask-blue" />
          Set Up Recurring Booking
        </CardTitle>
        <CardDescription>
          Schedule regular cleanings with the same cleaner
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <select 
            value={formData.frequency} 
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full rounded-full border border-gray-300 px-4 py-2"
          >
            {frequencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} - {opt.description}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Day of Week
            </label>
            <select 
              value={formData.day_of_week} 
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              className="w-full rounded-full border border-gray-300 px-4 py-2"
            >
              {dayOptions.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Start Time
            </label>
            <Input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-verdana">
            <strong>Next cleaning:</strong> {calculateNextDate(formData.day_of_week)}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Future bookings will be automatically created 7 days in advance
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-fredoka font-semibold">
            ✨ Benefits of Recurring Bookings
          </p>
          <ul className="text-xs text-green-700 mt-2 space-y-1 ml-4 list-disc">
            <li>Same cleaner every time</li>
            <li>Automatic scheduling</li>
            <li>Priority booking</li>
            <li>Easy to pause or modify</li>
          </ul>
        </div>

        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full brand-gradient text-white font-fredoka font-semibold"
        >
          {loading ? 'Creating...' : 'Create Recurring Booking'}
        </Button>
      </CardContent>
    </Card>
  );
}