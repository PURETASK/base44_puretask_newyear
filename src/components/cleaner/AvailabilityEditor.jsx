import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Save, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_AVAILABILITY = DAYS.map(day => ({
  day,
  available: day !== 'Sunday', // Default: closed Sundays
  start_time: '08:00',
  end_time: '18:00'
}));

export default function AvailabilityEditor({ cleanerProfile, onUpdate }) {
  const [availability, setAvailability] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (cleanerProfile && cleanerProfile.availability) {
      setAvailability(cleanerProfile.availability);
    } else {
      setAvailability(DEFAULT_AVAILABILITY);
    }
  }, [cleanerProfile]);

  const handleDayToggle = (day) => {
    setAvailability(prev =>
      prev.map(a =>
        a.day === day ? { ...a, available: !a.available } : a
      )
    );
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability(prev =>
      prev.map(a =>
        a.day === day ? { ...a, [field]: value } : a
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        availability
      });

      setMessage('✅ Availability updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving availability:', error);
      setMessage('❌ Failed to save availability');
    }

    setSaving(false);
  };

  const setAllDays = (available) => {
    setAvailability(prev =>
      prev.map(a => ({ ...a, available }))
    );
  };

  const getTotalHours = () => {
    return availability.reduce((total, day) => {
      if (!day.available) return total;
      
      const start = parseTime(day.start_time);
      const end = parseTime(day.end_time);
      const hours = (end - start) / 60;
      
      return total + hours;
    }, 0);
  };

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const availableDaysCount = availability.filter(a => a.available).length;
  const totalWeeklyHours = getTotalHours();

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Weekly Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-sm">
            Set your weekly schedule. Clients will only be able to book during your available hours.
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllDays(true)}
          >
            Enable All Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllDays(false)}
          >
            Disable All Days
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{availableDaysCount}</p>
              <p className="text-sm text-slate-600">Days Available</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{totalWeeklyHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600">Hours/Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Day-by-Day Schedule */}
        <div className="space-y-4">
          {availability.map((daySchedule, idx) => (
            <motion.div
              key={daySchedule.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                daySchedule.available
                  ? 'bg-white border-emerald-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={daySchedule.available}
                    onCheckedChange={() => handleDayToggle(daySchedule.day)}
                  />
                  <span className="text-base font-semibold">
                    {daySchedule.day}
                  </span>
                  {daySchedule.available && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      Open
                    </Badge>
                  )}
                </div>
              </div>

              {daySchedule.available && (
                <div className="grid grid-cols-2 gap-4 ml-10">
                  <div>
                    <label className="text-xs text-slate-600 mb-1 flex items-center gap-1 block">
                      <Clock className="w-3 h-3" />
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={daySchedule.start_time}
                      onChange={(e) =>
                        handleTimeChange(daySchedule.day, 'start_time', e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 flex items-center gap-1 block">
                      <Clock className="w-3 h-3" />
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={daySchedule.end_time}
                      onChange={(e) =>
                        handleTimeChange(daySchedule.day, 'end_time', e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Availability'}
        </Button>
      </CardContent>
    </Card>
  );
}