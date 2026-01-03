import { base44 } from '@/api/base44Client';

/**
 * Booking Conflict Checker
 * Checks if a cleaner has conflicting bookings on a specific date/time
 */

// Active booking statuses that block time slots
const ACTIVE_BOOKING_STATUSES = [
  'payment_hold',
  'awaiting_cleaner_response',
  'accepted',
  'scheduled',
  'on_the_way',
  'in_progress',
  'completed',
  'awaiting_client'
];

/**
 * Get all active bookings for a cleaner on a specific date
 */
export const getCleanerBookingsForDate = async (cleanerEmail, date) => {
  try {
    const bookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail,
      date: date,
      status: { $in: ACTIVE_BOOKING_STATUSES }
    });
    return bookings || [];
  } catch (error) {
    console.error('Error fetching cleaner bookings:', error);
    return [];
  }
};

/**
 * Check if a specific time slot conflicts with any existing booking
 * @param {string} slotTime - Time in HH:MM format (e.g., "09:00")
 * @param {array} bookings - Array of booking objects
 * @returns {boolean} - True if there's a conflict
 */
export const isTimeSlotBlocked = (slotTime, bookings) => {
  if (!bookings || bookings.length === 0) return false;

  const slotMinutes = parseTimeToMinutes(slotTime);

  for (const booking of bookings) {
    const bookingStart = parseTimeToMinutes(booking.start_time);
    const bookingEnd = bookingStart + (booking.hours * 60);

    // Check if slot falls within this booking's time range
    // A 30-min slot is blocked if it starts within the booking window
    if (slotMinutes >= bookingStart && slotMinutes < bookingEnd) {
      return true;
    }
  }

  return false;
};

/**
 * Get all blocked time slots for a specific date
 * @param {string} cleanerEmail
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {array} - Array of blocked time strings (e.g., ["09:00", "09:30", "10:00"])
 */
export const getBlockedTimeSlots = async (cleanerEmail, date) => {
  const bookings = await getCleanerBookingsForDate(cleanerEmail, date);
  const blockedSlots = [];

  for (const booking of bookings) {
    const startMinutes = parseTimeToMinutes(booking.start_time);
    const endMinutes = startMinutes + (booking.hours * 60);

    // Generate all 30-minute slots that fall within this booking
    for (let time = startMinutes; time < endMinutes; time += 30) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      if (!blockedSlots.includes(timeString)) {
        blockedSlots.push(timeString);
      }
    }
  }

  return blockedSlots;
};

// Helper: Parse time string to minutes since midnight
const parseTimeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export default {
  getCleanerBookingsForDate,
  isTimeSlotBlocked,
  getBlockedTimeSlots
};