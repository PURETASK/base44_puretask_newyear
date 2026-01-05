import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Calendar as CalendarIcon, Clock, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { convertTo12Hour } from '../utils/timeUtils';
import { Badge } from '@/components/ui/badge';

export default function BookAgainButton({ lastBooking, cleanerProfile, variant = 'default', className = '' }) {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(lastBooking?.start_time || '09:00');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleBookAgain = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    try {
      // Create draft booking with all previous details
      const draft = await base44.entities.DraftBooking.create({
        client_email: lastBooking.client_email,
        cleaner_email: lastBooking.cleaner_email,
        fallback_cleaners: lastBooking.fallback_cleaners || [],
        current_step: 4, // Skip to review step
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        hours: lastBooking.hours,
        tasks: lastBooking.tasks,
        task_quantities: lastBooking.task_quantities || {},
        address: lastBooking.address,
        latitude: lastBooking.latitude,
        longitude: lastBooking.longitude,
        bedrooms: lastBooking.bedrooms || 0,
        bathrooms: lastBooking.bathrooms || 0,
        square_feet: lastBooking.square_feet || 0,
        home_type: lastBooking.home_type || 'apartment',
        has_pets: lastBooking.has_pets || false,
        allergy_severity: lastBooking.allergy_severity || 'none',
        product_allergies_text: lastBooking.product_allergies_text || '',
        specific_allergies_list: lastBooking.specific_allergies_list || [],
        product_preferences: lastBooking.product_preferences || '',
        parking_instructions: lastBooking.parking_instructions || '',
        entry_instructions: lastBooking.entry_instructions || '',
        total_price: lastBooking.total_price
      });

      // Navigate to payment step
      navigate(createPageUrl('BookingFlow') + `?draft=${draft.id}&step=4`);
    } catch (error) {
      console.error('Error creating repeat booking:', error);
    }
    setLoading(false);
  };

  if (!lastBooking || !cleanerProfile) return null;

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant={variant}
        className={`${variant === 'default' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''} ${className}`}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Book {cleanerProfile.full_name} Again
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              Book {cleanerProfile.full_name} Again
            </DialogTitle>
            <p className="text-sm text-slate-600 mt-2">
              We'll use all your previous details. Just pick a date and time!
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Quick Summary of What's Being Booked */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
              <p className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Booking Summary:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700">{lastBooking.hours} hours cleaning</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 truncate">{lastBooking.address}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <div className="flex flex-wrap gap-2">
                  {lastBooking.tasks?.slice(0, 4).map((task, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {task.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {lastBooking.tasks?.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{lastBooking.tasks.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-2xl font-bold text-emerald-600">
                  ${lastBooking.total_price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-3 block">
                Select Date
              </label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border-2 border-slate-200"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Select Time
              </label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="border-2 border-slate-200">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {convertTo12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleBookAgain}
              disabled={!selectedDate || !selectedTime || loading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}