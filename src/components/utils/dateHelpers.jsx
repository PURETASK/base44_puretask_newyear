import { format, parseISO, isValid, differenceInHours, differenceInMinutes } from 'date-fns';

/**
 * Safely format a booking date
 */
export function formatBookingDate(date) {
  if (!date) return 'Date not set';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'EEEE, MMMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  return String(date);
}

/**
 * Safely format a short date
 */
export function formatShortDate(date) {
  if (!date) return '';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  return String(date);
}

/**
 * Calculate cancellation fee based on time until booking
 */
export function calculateCancellationFee(bookingDate, bookingTime, totalPrice) {
  try {
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();
    const hoursUntil = differenceInHours(bookingDateTime, now);
    
    if (hoursUntil > 24) {
      return 0; // Free cancellation
    } else if (hoursUntil > 12) {
      return totalPrice * 0.5; // 50% fee
    } else {
      return totalPrice; // 100% fee
    }
  } catch (error) {
    console.error('Error calculating cancellation fee:', error);
    return totalPrice; // Default to full fee on error
  }
}

/**
 * Check if booking can be rescheduled for free
 */
export function canRescheduleForFree(bookingDate, bookingTime) {
  try {
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();
    const hoursUntil = differenceInHours(bookingDateTime, now);
    
    return hoursUntil > 24;
  } catch (error) {
    return false;
  }
}

/**
 * Check if cleaner is within grace period for check-in
 */
export function isWithinGracePeriod(scheduledDateTime, actualDateTime, gracePeriodMinutes = 15) {
  try {
    const scheduled = new Date(scheduledDateTime);
    const actual = new Date(actualDateTime);
    const diffMinutes = Math.abs(differenceInMinutes(actual, scheduled));
    
    return diffMinutes <= gracePeriodMinutes;
  } catch (error) {
    return false;
  }
}