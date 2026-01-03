import { base44 } from '@/api/base44Client';

/**
 * Calculate historical acceptance rates by time slot for a cleaner
 * Returns map of dayOfWeek_timeSlot -> acceptance percentage
 */
export async function calculateTypicalAvailability(cleanerEmail) {
  try {
    // Get all past bookings for this cleaner
    const bookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail
    });
    
    // Group by day of week + time slot
    const availabilityMap = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = parseInt(booking.start_time.split(':')[0]);
      const timeSlot = `${hour}:00`;
      
      const key = `${dayOfWeek}_${timeSlot}`;
      
      if (!availabilityMap[key]) {
        availabilityMap[key] = { total: 0, accepted: 0 };
      }
      
      availabilityMap[key].total++;
      if (booking.cleaner_confirmed) {
        availabilityMap[key].accepted++;
      }
    });
    
    // Calculate acceptance rate for each slot
    const result = {};
    Object.keys(availabilityMap).forEach(key => {
      const { total, accepted } = availabilityMap[key];
      // Only show indicator if we have at least 3 bookings for confidence
      result[key] = total >= 3 ? Math.round((accepted / total) * 100) : null;
    });
    
    return result;
  } catch (error) {
    console.error('Error calculating availability:', error);
    return {};
  }
}

/**
 * Get availability level based on acceptance rate
 */
export function getAvailabilityLevel(acceptanceRate) {
  if (acceptanceRate === null || acceptanceRate === undefined) return 'unknown';
  if (acceptanceRate >= 80) return 'usually_available';
  if (acceptanceRate >= 50) return 'sometimes_available';
  return 'high_demand';
}

/**
 * Get display configuration for availability indicator
 */
export function getAvailabilityIndicator(acceptanceRate) {
  const level = getAvailabilityLevel(acceptanceRate);
  
  const indicators = {
    usually_available: {
      icon: '✅',
      color: 'text-emerald-600',
      text: 'Usually Available',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'This cleaner accepts 80%+ of requests at this time'
    },
    sometimes_available: {
      icon: '⚠️',
      color: 'text-amber-600',
      text: 'Sometimes Busy',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'This time slot fills up quickly'
    },
    high_demand: {
      icon: '🔥',
      color: 'text-red-600',
      text: 'High Demand',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Consider choosing a backup cleaner or different time'
    },
    unknown: {
      icon: '',
      color: 'text-slate-500',
      text: '',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      description: 'Not enough data for this time slot'
    }
  };
  
  return indicators[level];
}