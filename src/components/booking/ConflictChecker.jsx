import { base44 } from '@/api/base44Client';
import { parseISO, addHours, isWithinInterval } from 'date-fns';

/**
 * Check if a cleaner has conflicting bookings at the requested time
 * @param {string} cleanerEmail - Cleaner's email
 * @param {string} date - Booking date (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:MM)
 * @param {number} hours - Duration in hours
 * @param {string} excludeBookingId - Optional: exclude this booking ID from conflict check (for rescheduling)
 * @returns {Promise<{hasConflict: boolean, conflictingBookings: Array}>}
 */
export async function checkBookingConflict(cleanerEmail, date, startTime, hours, excludeBookingId = null) {
  try {
    // Get all bookings for this cleaner on this date
    const allBookings = await base44.entities.Booking.filter({ 
      cleaner_email: cleanerEmail,
      date: date,
      status: ['scheduled', 'confirmed', 'awaiting_cleaner', 'cleaning_now']
    });

    // Filter out the booking being rescheduled
    const relevantBookings = excludeBookingId 
      ? allBookings.filter(b => b.id !== excludeBookingId)
      : allBookings;

    if (relevantBookings.length === 0) {
      return { hasConflict: false, conflictingBookings: [] };
    }

    // Parse requested booking time range
    const requestedStart = parseISO(`${date}T${startTime}`);
    const requestedEnd = addHours(requestedStart, hours);

    // Check for overlaps
    const conflicts = relevantBookings.filter(booking => {
      const bookingStart = parseISO(`${booking.date}T${booking.start_time}`);
      const bookingEnd = addHours(bookingStart, booking.hours);

      // Check if times overlap (allowing 30-min buffer between bookings)
      const bufferMinutes = 30;
      const requestedStartWithBuffer = addHours(requestedStart, -bufferMinutes / 60);
      const requestedEndWithBuffer = addHours(requestedEnd, bufferMinutes / 60);

      const overlaps = (
        isWithinInterval(bookingStart, { start: requestedStartWithBuffer, end: requestedEndWithBuffer }) ||
        isWithinInterval(bookingEnd, { start: requestedStartWithBuffer, end: requestedEndWithBuffer }) ||
        isWithinInterval(requestedStart, { start: bookingStart, end: bookingEnd }) ||
        isWithinInterval(requestedEnd, { start: bookingStart, end: bookingEnd })
      );

      return overlaps;
    });

    return {
      hasConflict: conflicts.length > 0,
      conflictingBookings: conflicts
    };
  } catch (error) {
    console.error('Error checking booking conflict:', error);
    return { hasConflict: false, conflictingBookings: [], error: error.message };
  }
}

/**
 * Check if a cleaner is available at the requested time based on their availability schedule
 * @param {Array} availability - Cleaner's availability array
 * @param {string} date - Booking date
 * @param {string} startTime - Start time
 * @param {number} hours - Duration
 * @returns {boolean} - True if cleaner is available
 */
export function checkScheduleAvailability(availability, date, startTime, hours) {
  try {
    const bookingDate = parseISO(date);
    const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find availability for this day
    const dayAvailability = availability.find(a => a.day === dayName);
    
    if (!dayAvailability || !dayAvailability.available) {
      return false;
    }

    // Parse times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const requestedStartMinutes = startHour * 60 + startMinute;
    const requestedEndMinutes = requestedStartMinutes + (hours * 60);

    const [availStartHour, availStartMinute] = dayAvailability.start_time.split(':').map(Number);
    const availStartMinutes = availStartHour * 60 + availStartMinute;

    const [availEndHour, availEndMinute] = dayAvailability.end_time.split(':').map(Number);
    const availEndMinutes = availEndHour * 60 + availEndMinute;

    // Check if requested time fits within availability
    return requestedStartMinutes >= availStartMinutes && requestedEndMinutes <= availEndMinutes;
  } catch (error) {
    console.error('Error checking schedule availability:', error);
    return false;
  }
}