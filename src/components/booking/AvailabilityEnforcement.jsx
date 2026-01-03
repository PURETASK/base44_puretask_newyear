/**
 * Availability Enforcement Service
 * Prevents double-booking and enforces cleaner availability
 */

import { base44 } from '@/api/base44Client';

/**
 * Check if cleaner is available for a specific date/time
 * @param {string} cleanerEmail - Cleaner's email
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} hours - Duration in hours
 * @param {string} excludeBookingId - Booking ID to exclude (for rescheduling)
 * @returns {Promise<Object>} { available, conflicts, reason }
 */
export async function checkCleanerAvailability(
  cleanerEmail,
  date,
  startTime,
  hours,
  excludeBookingId = null
) {
  try {
    // Get cleaner's schedule for the date
    const bookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail,
      date: date,
      status: { $in: ['scheduled', 'in_progress', 'payment_hold'] }
    });

    // Exclude current booking if rescheduling
    const relevantBookings = excludeBookingId
      ? bookings.filter(b => b.id !== excludeBookingId)
      : bookings;

    // Calculate time slot
    const requestedStart = parseTime(startTime);
    const requestedEnd = requestedStart + (hours * 60); // minutes since midnight

    // Check for conflicts
    const conflicts = [];
    for (const booking of relevantBookings) {
      const bookingStart = parseTime(booking.start_time);
      const bookingEnd = bookingStart + ((booking.estimated_hours || booking.hours) * 60);

      // Check if time slots overlap
      const hasOverlap = !(requestedEnd <= bookingStart || requestedStart >= bookingEnd);
      
      if (hasOverlap) {
        conflicts.push({
          booking_id: booking.id,
          start_time: booking.start_time,
          hours: booking.hours,
          address: booking.address
        });
      }
    }

    if (conflicts.length > 0) {
      return {
        available: false,
        conflicts,
        reason: `Cleaner has ${conflicts.length} conflicting booking(s) on this date/time`
      };
    }

    // Check cleaner's availability schedule
    const profile = await base44.entities.CleanerProfile.filter({ 
      user_email: cleanerEmail 
    });

    if (profile.length > 0 && profile[0].availability) {
      const dayOfWeek = getDayOfWeek(date);
      const availability = profile[0].availability.find(a => a.day === dayOfWeek);

      if (availability && !availability.available) {
        return {
          available: false,
          conflicts: [],
          reason: `Cleaner is not available on ${dayOfWeek}s`
        };
      }

      if (availability && availability.start_time && availability.end_time) {
        const availStart = parseTime(availability.start_time);
        const availEnd = parseTime(availability.end_time);

        if (requestedStart < availStart || requestedEnd > availEnd) {
          return {
            available: false,
            conflicts: [],
            reason: `Cleaner is only available ${availability.start_time} - ${availability.end_time} on ${dayOfWeek}s`
          };
        }
      }
    }

    return {
      available: true,
      conflicts: [],
      reason: 'Cleaner is available'
    };

  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      available: false,
      conflicts: [],
      reason: 'Error checking availability. Please try again.'
    };
  }
}

/**
 * Get available time slots for a cleaner on a specific date
 * @param {string} cleanerEmail - Cleaner's email
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} duration - Required duration in hours
 * @returns {Promise<Array>} Array of available time slots
 */
export async function getAvailableTimeSlots(cleanerEmail, date, duration = 3) {
  try {
    const dayOfWeek = getDayOfWeek(date);
    
    // Get cleaner profile for availability
    const profiles = await base44.entities.CleanerProfile.filter({ 
      user_email: cleanerEmail 
    });

    if (profiles.length === 0) {
      return [];
    }

    const profile = profiles[0];
    const dayAvailability = profile.availability?.find(a => a.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.available) {
      return [];
    }

    // Default to 8 AM - 6 PM if no specific hours
    const availStart = dayAvailability.start_time 
      ? parseTime(dayAvailability.start_time) 
      : 480; // 8 AM
    const availEnd = dayAvailability.end_time 
      ? parseTime(dayAvailability.end_time) 
      : 1080; // 6 PM

    // Get existing bookings
    const bookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail,
      date: date,
      status: { $in: ['scheduled', 'in_progress', 'payment_hold'] }
    });

    // Generate potential time slots (every 30 minutes)
    const slots = [];
    const durationMinutes = duration * 60;

    for (let time = availStart; time <= availEnd - durationMinutes; time += 30) {
      const slotStart = time;
      const slotEnd = time + durationMinutes;

      // Check if slot conflicts with any booking
      const hasConflict = bookings.some(booking => {
        const bookingStart = parseTime(booking.start_time);
        const bookingEnd = bookingStart + ((booking.estimated_hours || booking.hours) * 60);
        return !(slotEnd <= bookingStart || slotStart >= bookingEnd);
      });

      if (!hasConflict) {
        slots.push({
          time: formatTime(time),
          available: true
        });
      }
    }

    return slots;

  } catch (error) {
    console.error('Error getting time slots:', error);
    return [];
  }
}

/**
 * Parse time string to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:MM
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get day of week from date string
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Day name (Monday, Tuesday, etc.)
 */
function getDayOfWeek(dateStr) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}

/**
 * Validate booking doesn't conflict with cleaner's schedule
 * Used in booking creation/update
 */
export async function validateBookingAvailability(bookingData) {
  const { cleaner_email, date, start_time, hours, id } = bookingData;

  if (!cleaner_email || !date || !start_time || !hours) {
    return {
      valid: false,
      message: 'Missing required booking information'
    };
  }

  const availability = await checkCleanerAvailability(
    cleaner_email,
    date,
    start_time,
    hours,
    id
  );

  if (!availability.available) {
    return {
      valid: false,
      message: availability.reason,
      conflicts: availability.conflicts
    };
  }

  return {
    valid: true,
    message: 'Booking slot is available'
  };
}

export default {
  checkCleanerAvailability,
  getAvailableTimeSlots,
  validateBookingAvailability
};