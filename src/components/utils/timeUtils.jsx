/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (e.g., "14:30")
 * @returns {string} - Time in 12-hour format (e.g., "2:30 PM")
 */
export function convertTo12Hour(time24) {
  if (!time24 || typeof time24 !== 'string') {
    return '12:00 PM';
  }
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes || '00';
  
  if (isNaN(hour)) {
    return '12:00 PM';
  }
  
  if (hour === 0) {
    return `12:${min} AM`;
  } else if (hour < 12) {
    return `${hour}:${min} AM`;
  } else if (hour === 12) {
    return `12:${min} PM`;
  } else {
    return `${hour - 12}:${min} PM`;
  }
}

/**
 * Generates time slots in 12-hour format
 * @param {number} startHour - Starting hour (0-23)
 * @param {number} endHour - Ending hour (0-23)
 * @returns {Array} - Array of time objects with 24hr and 12hr formats
 */
export function generateTimeSlots(startHour, endHour) {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    // On the hour
    const time24Hour = `${hour.toString().padStart(2, '0')}:00`;
    slots.push({
      value: time24Hour,
      label: convertTo12Hour(time24Hour)
    });
    
    // Half hour
    if (hour + 0.5 < endHour) {
      const time24HalfHour = `${hour.toString().padStart(2, '0')}:30`;
      slots.push({
        value: time24HalfHour,
        label: convertTo12Hour(time24HalfHour)
      });
    }
  }
  
  return slots;
}