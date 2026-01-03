/**
 * GPS Validation Service
 * Enforces 250m check-in/out distance rule
 */

const MAX_DISTANCE_METERS = 250;
const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Validate GPS check-in/out location
 * @param {Object} userLocation - { latitude, longitude, accuracy }
 * @param {Object} jobLocation - { latitude, longitude }
 * @returns {Object} { valid, distance, message, accuracy }
 */
export function validateGPSLocation(userLocation, jobLocation) {
  // Check if coordinates are valid
  if (!userLocation.latitude || !userLocation.longitude) {
    return {
      valid: false,
      distance: null,
      message: 'Unable to get your location. Please enable GPS.',
      accuracy: null
    };
  }

  if (!jobLocation.latitude || !jobLocation.longitude) {
    return {
      valid: false,
      distance: null,
      message: 'Job location not found. Please contact support.',
      accuracy: null
    };
  }

  // Calculate distance
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    jobLocation.latitude,
    jobLocation.longitude
  );

  // Check accuracy
  const accuracy = userLocation.accuracy || 0;
  const hasGoodAccuracy = accuracy > 0 && accuracy <= 50; // Within 50m accuracy

  // Validate distance (≤250m rule)
  const isWithinRange = distance <= MAX_DISTANCE_METERS;

  // Build result
  const result = {
    valid: isWithinRange,
    distance,
    accuracy,
    message: ''
  };

  if (!isWithinRange) {
    result.message = `You are ${Math.round(distance)}m away from the job location. You must be within ${MAX_DISTANCE_METERS}m to check in/out.`;
  } else if (!hasGoodAccuracy) {
    result.message = `GPS accuracy is ${Math.round(accuracy)}m. For best results, ensure you have a clear view of the sky.`;
  } else {
    result.message = `Location verified! You are ${Math.round(distance)}m from the job site.`;
  }

  return result;
}

/**
 * Get user's current GPS position
 * @returns {Promise<Object>} { latitude, longitude, accuracy }
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        let message = 'Unable to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable GPS access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }
        
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get validation status color
 * @param {boolean} valid - Whether location is valid
 * @param {number} distance - Distance in meters
 * @returns {string} Color class for UI
 */
export function getValidationStatusColor(valid, distance) {
  if (!valid) return 'red';
  if (distance <= 50) return 'green';
  if (distance <= 150) return 'blue';
  return 'amber';
}

/**
 * Check if GPS validation should be enforced
 * This allows for feature flag control in the future
 * @returns {boolean}
 */
export function shouldEnforceGPSValidation() {
  // For now, always enforce
  // In future, can check feature flags here
  return true;
}

export default {
  validateGPSLocation,
  getCurrentPosition,
  formatDistance,
  getValidationStatusColor,
  shouldEnforceGPSValidation,
  MAX_DISTANCE_METERS
};