/**
 * GPS Validation Service
 * Implements anti-spoof measures and distance validation per Section 2.3
 * 
 * Key Rules:
 * - Require device location services enabled
 * - Enforce ≤ 250m radius from job address
 * - Log validation attempts for audit
 */

const VALID_RADIUS_METERS = 250;

export const validateGPSLocation = (checkInLocation, jobAddress) => {
  if (!checkInLocation || !checkInLocation.latitude || !checkInLocation.longitude) {
    return {
      valid: false,
      error: 'Location services not enabled. Please enable GPS on your device.',
      code: 'GPS_DISABLED'
    };
  }

  if (!jobAddress || !jobAddress.latitude || !jobAddress.longitude) {
    return {
      valid: false,
      error: 'Job address coordinates not found. Contact support.',
      code: 'INVALID_ADDRESS'
    };
  }

  const distance = calculateDistance(
    checkInLocation.latitude,
    checkInLocation.longitude,
    jobAddress.latitude,
    jobAddress.longitude
  );

  if (distance > VALID_RADIUS_METERS) {
    return {
      valid: false,
      error: `You are ${Math.round(distance)}m from the job location. Please move closer (within 250m) to check in.`,
      distance,
      code: 'OUT_OF_RANGE'
    };
  }

  return {
    valid: true,
    distance,
    message: `GPS verified: ${Math.round(distance)}m from job location`
  };
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Request device location with high accuracy
 */
export const requestDeviceLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        valid: false,
        error: 'GPS not supported on this device',
        code: 'GPS_NOT_SUPPORTED'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        let errorCode = 'GPS_ERROR';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable GPS in your device settings.';
            errorCode = 'GPS_PERMISSION_DENIED';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Please check your GPS signal.';
            errorCode = 'GPS_UNAVAILABLE';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            errorCode = 'GPS_TIMEOUT';
            break;
        }

        reject({
          valid: false,
          error: errorMessage,
          code: errorCode
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Format location data for storage
 */
export const formatLocationForStorage = (location, distanceFromJob) => {
  return JSON.stringify({
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: location.timestamp,
    distance_from_job: distanceFromJob
  });
};

/**
 * Parse stored location data
 */
export const parseStoredLocation = (locationString) => {
  try {
    return JSON.parse(locationString);
  } catch (error) {
    return null;
  }
};

export default {
  validateGPSLocation,
  calculateDistance,
  requestDeviceLocation,
  formatLocationForStorage,
  parseStoredLocation,
  VALID_RADIUS_METERS
};