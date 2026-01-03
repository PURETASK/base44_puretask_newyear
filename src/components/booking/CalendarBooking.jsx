import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Info, Zap, Sun, Sunset, Moon, Check, Sparkles } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, startOfDay, addWeeks, isTomorrow, isWeekend } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableTimeSlots, getUnavailableDays } from '../cleaner/AvailabilityChecker';
import { checkCleanerAvailability } from './AvailabilityEnforcement';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarBooking({ 
  cleaner,
  selectedDate, 
  selectedTime, 
  onDateTimeSelect,
  onDateSelect,
  onTimeSelect 
}) {
  const [currentStartDate, setCurrentStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [availabilityError, setAvailabilityError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [expandedTimeGroup, setExpandedTimeGroup] = useState('all');

  useEffect(() => {
    if (cleaner) {
      setUnavailableDays(getUnavailableDays(cleaner));
    }
  }, [cleaner]);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedDate && cleaner) {
        setLoadingSlots(true);
        const dateObj = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
        const slots = await getAvailableTimeSlots(cleaner, dateObj);
        setAvailableSlots(slots);
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDate, cleaner]);

  const handleDateSelect = (date) => {
    setAvailabilityError('');
    
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      setAvailabilityError('Cannot book dates in the past');
      return;
    }

    const dayOfWeek = date.getDay();
    if (unavailableDays.includes(dayOfWeek)) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setAvailabilityError(`${cleaner?.full_name || 'This cleaner'} is not available on ${dayNames[dayOfWeek]}s`);
      return;
    }

    // Format date without timezone offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Support both callback patterns
    if (onDateSelect) {
      onDateSelect(dateString);
    }
    if (onDateTimeSelect) {
      onDateTimeSelect(dateString, selectedTime);
    }
  };

  const handleTimeSelect = async (time) => {
    if (!selectedDate) {
      setAvailabilityError('Please select a date first');
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityError('');

    // Support both callback patterns
    if (onTimeSelect) {
      onTimeSelect(time);
      setCheckingAvailability(false);
      return;
    }

    try {
      const dateStr = typeof selectedDate === 'string' ? selectedDate : selectedDate.toISOString().split('T')[0];
      const estimatedHours = 3;

      if (cleaner?.user_email) {
        const availability = await checkCleanerAvailability(
          cleaner.user_email,
          dateStr,
          time,
          estimatedHours
        );

        if (!availability.available) {
          setAvailabilityError(availability.reason);
          toast.error(availability.reason);
          
          if (availability.conflicts && availability.conflicts.length > 0) {
            const conflict = availability.conflicts[0];
            toast.error(
              `Conflicts with existing booking at ${conflict.start_time}`,
              { duration: 4000 }
            );
          }
          return;
        }
      }

      if (onDateTimeSelect) {
        onDateTimeSelect(selectedDate, time);
      }
      toast.success('Time slot selected!');

    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError('Error checking availability. Please try again.');
      toast.error('Could not verify availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentStartDate(addDays(currentStartDate, -14));
  };

  const goToNextWeek = () => {
    setCurrentStartDate(addDays(currentStartDate, 14));
  };

  const handleQuickSelect = (days) => {
    const date = addDays(new Date(), days);
    handleDateSelect(date);
  };

  // Generate 2 weeks (14 days)
  const twoWeekDays = Array.from({ length: 14 }, (_, i) => addDays(currentStartDate, i));

  const parsedSelectedDate = selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate) : null;

  // Group time slots by period
  const groupTimeSlots = (slots) => {
    const morning = slots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    const afternoon = slots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    const evening = slots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 17 && hour < 21;
    });
    return { morning, afternoon, evening };
  };

  const groupedSlots = groupTimeSlots(availableSlots);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Confirmation Summary */}
      <AnimatePresence>
        {parsedSelectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-puretask-blue to-cyan-400 rounded-2xl p-6 text-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Check className="w-7 h-7 text-puretask-blue" />
                </div>
                <div>
                  <p className="text-sm opacity-90 font-verdana">You selected</p>
                  <p className="text-2xl font-fredoka font-bold">
                    {format(parsedSelectedDate, 'EEEE, MMM d')} at {selectedTime}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onTimeSelect && onTimeSelect(null)}
                className="text-white hover:bg-white/20 font-fredoka"
              >
                Change
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Select Buttons */}
      <div>
        <p className="text-sm font-verdana text-gray-600 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-puretask-blue" />
          Quick Select
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleQuickSelect(1)}
            variant="outline"
            className="rounded-full border-puretask-blue text-puretask-blue hover:bg-blue-50 font-fredoka"
          >
            Tomorrow
          </Button>
          <Button
            onClick={() => handleQuickSelect(2)}
            variant="outline"
            className="rounded-full border-puretask-blue text-puretask-blue hover:bg-blue-50 font-fredoka"
          >
            In 2 Days
          </Button>
          <Button
            onClick={() => handleQuickSelect(7)}
            variant="outline"
            className="rounded-full border-puretask-blue text-puretask-blue hover:bg-blue-50 font-fredoka"
          >
            Next Week
          </Button>
        </div>
      </div>

      {/* Calendar Header with Navigation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={goToPreviousWeek} variant="ghost" size="sm" className="text-puretask-blue hover:bg-blue-50 rounded-full font-fredoka">
            <ChevronLeft className="w-4 h-4" />
            <span className="ml-2">Previous 2 Weeks</span>
          </Button>
          <div className="text-center">
            <h3 className="text-xl font-fredoka font-bold text-graphite">
              {format(currentStartDate, 'MMM d')} - {format(addDays(currentStartDate, 13), 'MMM d, yyyy')}
            </h3>
            <p className="text-sm text-gray-600 font-verdana">Select your preferred date</p>
          </div>
          <Button onClick={goToNextWeek} variant="ghost" size="sm" className="text-puretask-blue hover:bg-blue-50 rounded-full font-fredoka">
            <span className="mr-2">Next 2 Weeks</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-verdana text-gray-600 justify-center mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-puretask-blue"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-puretask-blue border-2 border-puretask-blue"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {/* 2-Week Calendar */}
        <div className="grid grid-cols-7 gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-fredoka font-semibold text-gray-500 pb-2">
              {day}
            </div>
          ))}
          
          {twoWeekDays.map((date, idx) => {
            const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
            const isSelected = parsedSelectedDate && isSameDay(date, parsedSelectedDate);
            const dayOfWeek = date.getDay();
            const isUnavailable = unavailableDays.includes(dayOfWeek);
            const isTodayDate = isToday(date);
            
            return (
              <motion.button
                key={idx}
                whileHover={!isPast && !isUnavailable ? { scale: 1.02 } : {}}
                whileTap={!isPast && !isUnavailable ? { scale: 0.98 } : {}}
                onClick={() => !isPast && !isUnavailable && handleDateSelect(date)}
                disabled={isPast || isUnavailable}
                className={`
                  aspect-square p-4 rounded-xl transition-all font-fredoka font-semibold relative
                  ${isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''}
                  ${isUnavailable && !isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''}
                  ${isSelected ? 'bg-puretask-blue text-white shadow-sm ring-2 ring-puretask-blue ring-offset-2' : ''}
                  ${!isPast && !isUnavailable && !isSelected ? 'hover:bg-blue-50 bg-white border border-gray-200 hover:border-puretask-blue' : ''}
                  ${isTodayDate && !isPast && !isSelected ? 'ring-1 ring-puretask-blue' : ''}
                `}
              >
                <div className="text-base">{format(date, 'd')}</div>
                {isTodayDate && !isSelected && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-puretask-blue rounded-full"></div>
                )}
                {isSelected && (
                  <Check className="absolute top-1 right-1 w-3 h-3" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Selection Area */}
      <AnimatePresence>
        {parsedSelectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-puretask-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-fredoka font-bold text-graphite">Select Your Time</h3>
                    <p className="text-gray-600 font-verdana text-sm">
                      {format(parsedSelectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingSlots ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-xl" />
                      ))}
                    </div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="space-y-6">
                    {/* Morning Slots */}
                    {groupedSlots.morning.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <h4 className="font-fredoka font-semibold text-graphite">Morning (6 AM - 12 PM)</h4>
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                            {groupedSlots.morning.filter(s => s.available).length} available
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {groupedSlots.morning.map((slot) => (
                            <Button
                              key={slot.time}
                              onClick={() => handleTimeSelect(slot.time)}
                              variant={selectedTime === slot.time ? 'default' : 'outline'}
                              disabled={checkingAvailability || !slot.available}
                              className={`h-11 font-fredoka font-medium text-sm rounded-xl ${
                                selectedTime === slot.time
                                  ? 'bg-puretask-blue hover:bg-puretask-blue/90 text-white shadow-sm'
                                  : !slot.available
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'hover:border-puretask-blue hover:bg-blue-50 border-gray-200'
                              }`}
                            >
                              {slot.display}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Afternoon Slots */}
                    {groupedSlots.afternoon.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sunset className="w-4 h-4 text-orange-500" />
                          <h4 className="font-fredoka font-semibold text-graphite">Afternoon (12 PM - 5 PM)</h4>
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                            {groupedSlots.afternoon.filter(s => s.available).length} available
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {groupedSlots.afternoon.map((slot) => (
                            <Button
                              key={slot.time}
                              onClick={() => handleTimeSelect(slot.time)}
                              variant={selectedTime === slot.time ? 'default' : 'outline'}
                              disabled={checkingAvailability || !slot.available}
                              className={`h-11 font-fredoka font-medium text-sm rounded-xl ${
                                selectedTime === slot.time
                                  ? 'bg-puretask-blue hover:bg-puretask-blue/90 text-white shadow-sm'
                                  : !slot.available
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'hover:border-puretask-blue hover:bg-blue-50 border-gray-200'
                              }`}
                            >
                              {slot.display}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evening Slots */}
                    {groupedSlots.evening.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          <h4 className="font-fredoka font-semibold text-graphite">Evening (5 PM - 9 PM)</h4>
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {groupedSlots.evening.filter(s => s.available).length} available
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {groupedSlots.evening.map((slot) => (
                            <Button
                              key={slot.time}
                              onClick={() => handleTimeSelect(slot.time)}
                              variant={selectedTime === slot.time ? 'default' : 'outline'}
                              disabled={checkingAvailability || !slot.available}
                              className={`h-11 font-fredoka font-medium text-sm rounded-xl ${
                                selectedTime === slot.time
                                  ? 'bg-puretask-blue hover:bg-puretask-blue/90 text-white shadow-sm'
                                  : !slot.available
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'hover:border-puretask-blue hover:bg-blue-50 border-gray-200'
                              }`}
                            >
                              {slot.display}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert className="bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <AlertDescription className="text-amber-900 font-verdana">
                      No time slots available on this date. Please select another day.
                    </AlertDescription>
                  </Alert>
                )}
                {checkingAvailability && (
                  <div className="text-center text-gray-600 font-verdana mt-4 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Checking availability...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Messages */}
      <AnimatePresence>
        {availabilityError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-900 font-verdana">
                {availabilityError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cleaner Availability Info */}
      {cleaner?.availability && (
        <Alert className="bg-blue-50 border border-blue-200 rounded-xl">
          <Info className="w-4 h-4 text-puretask-blue" />
          <AlertDescription className="text-gray-700 font-verdana">
            <strong className="font-fredoka text-sm text-graphite">{cleaner.full_name}'s Available Days:</strong>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {cleaner.availability
                .filter(a => a.available)
                .map((a, idx) => {
                  const convertTo12Hour = (time) => {
                    if (!time) return '';
                    const [hours, minutes] = time.split(':').map(Number);
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const hours12 = hours % 12 || 12;
                    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
                  };
                  
                  return (
                    <Badge key={idx} variant="outline" className="bg-white border-blue-200 text-gray-700">
                      <strong>{a.day}:</strong> {convertTo12Hour(a.start_time)} - {convertTo12Hour(a.end_time)}
                    </Badge>
                  );
                })}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}