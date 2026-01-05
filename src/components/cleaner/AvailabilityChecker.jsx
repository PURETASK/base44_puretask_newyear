import { getBlockedTimeSlots } from '../booking/BookingConflictChecker';

/**
 * Cleaner Availability Checker
 * Validates if a cleaner is available for a specific date/time
 * Now includes conflict checking against existing bookings
 */

export const checkCleanerAvailability = (cleanerProfile, date, startTime) => {
  if (!cleanerProfile || !date || !startTime) {
    return { available: false, reason: 'Missing required parameters' };
  }

  // Check if cleaner is active
  if (!cleanerProfile.is_active) {
    return { available: false, reason: 'Cleaner is not currently accepting bookings' };
  }

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];

  // Check weekly availability schedule
  const availability = cleanerProfile.availability || [];
  const daySchedule = availability.find(a => a.day === dayName);

  if (!daySchedule || !daySchedule.available) {
    return { 
      available: false, 
      reason: `${cleanerProfile.full_name} is not available on ${dayName}s` 
    };
  }

  // Check if time falls within available hours
  if (daySchedule.start_time && daySchedule.end_time) {
    const requestedTime = parseTime(startTime);
    const availableStart = parseTime(daySchedule.start_time);
    const availableEnd = parseTime(daySchedule.end_time);

    if (requestedTime < availableStart || requestedTime > availableEnd) {
      return {
        available: false,
        reason: `${cleanerProfile.full_name} is available ${dayName}s from ${convertTo12Hour(daySchedule.start_time)} to ${convertTo12Hour(daySchedule.end_time)}`
      };
    }
  }

  // Check blackout dates (future feature - would need BlackoutDate entity)
  // const blackoutDates = await checkBlackoutDates(cleanerProfile.user_email, date);
  // if (blackoutDates.length > 0) {
  //   return { available: false, reason: 'This date is blocked by the cleaner' };
  // }

  return { available: true, reason: null };
};

export const getAvailableTimeSlots = async (cleanerProfile, date) => {
  const slots = [];
  
  if (!cleanerProfile || !date) return slots;

  const dayOfWeek = date.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];

  const availability = cleanerProfile.availability || [];
  const daySchedule = availability.find(a => a.day === dayName);

  if (!daySchedule || !daySchedule.available) {
    return slots; // No slots available on this day
  }

  // Generate time slots from start to end time
  const startTime = daySchedule.start_time || '08:00';
  const endTime = daySchedule.end_time || '18:00';

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  // Get blocked time slots from existing bookings
  const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const blockedSlots = await getBlockedTimeSlots(cleanerProfile.user_email, dateString);

  // Generate 30-minute intervals
  for (let time = start; time <= end - 30; time += 30) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    // Check if this slot is blocked by an existing booking
    const isBlocked = blockedSlots.includes(timeString);
    
    slots.push({
      time: timeString,
      display: convertTo12Hour(timeString),
      available: !isBlocked
    });
  }

  return slots;
};

export const getUnavailableDays = (cleanerProfile) => {
  const unavailableDays = [];
  
  if (!cleanerProfile || !cleanerProfile.availability) {
    return unavailableDays;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  dayNames.forEach((day, index) => {
    const daySchedule = cleanerProfile.availability.find(a => a.day === day);
    if (!daySchedule || !daySchedule.available) {
      unavailableDays.push(index);
    }
  });

  return unavailableDays;
};

// Helper: Parse time string to minutes
const parseTime = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: Convert 24h to 12h format
const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

export default {
  checkCleanerAvailability,
  getAvailableTimeSlots,
  getUnavailableDays
};