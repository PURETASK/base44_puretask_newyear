/**
 * Photo Validation Service
 * Implements photo proof requirements per Section 2.3
 * 
 * Key Rules:
 * - Minimum 3 photos at checkout
 * - Strict MIME/type validation
 * - Required for deep & move-out cleans
 * - Recommended for all bookings
 */

const MINIMUM_PHOTOS_REQUIRED = 3;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const validatePhotoUpload = (file) => {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type (${file.type}). Only JPEG, PNG, and WebP images are allowed.`
    };
  }

  return {
    valid: true,
    message: 'Photo is valid'
  };
};

export const validatePhotoRequirements = (beforePhotos, afterPhotos, cleaningType) => {
  const totalPhotos = (beforePhotos?.length || 0) + (afterPhotos?.length || 0);
  
  // Deep cleaning and move-out REQUIRE photos
  const isPhotoMandatory = cleaningType === 'deep' || cleaningType === 'moveout';
  
  if (isPhotoMandatory && totalPhotos < MINIMUM_PHOTOS_REQUIRED) {
    return {
      valid: false,
      required: true,
      error: `${cleaningType === 'deep' ? 'Deep cleaning' : 'Move-out cleaning'} requires minimum ${MINIMUM_PHOTOS_REQUIRED} photos. You have ${totalPhotos}.`,
      missing: MINIMUM_PHOTOS_REQUIRED - totalPhotos
    };
  }

  // For basic cleaning, photos are recommended but not required
  if (!isPhotoMandatory && totalPhotos < MINIMUM_PHOTOS_REQUIRED) {
    return {
      valid: true,
      warning: true,
      message: `Photos recommended: ${totalPhotos}/${MINIMUM_PHOTOS_REQUIRED}. Upload more to boost your Reliability Score (+10 points).`,
      missing: MINIMUM_PHOTOS_REQUIRED - totalPhotos
    };
  }

  return {
    valid: true,
    message: `Photo requirements met (${totalPhotos} photos uploaded)`,
    bonus: totalPhotos >= MINIMUM_PHOTOS_REQUIRED
  };
};

export const getPhotoUploadGuidelines = () => {
  return {
    minimum_required: MINIMUM_PHOTOS_REQUIRED,
    max_file_size_mb: MAX_FILE_SIZE_MB,
    allowed_formats: ['JPEG', 'PNG', 'WebP'],
    guidelines: [
      'Good lighting and clear focus',
      'Show the cleaned area from similar angles (before/after)',
      'No identifying client information visible',
      'Photos are automatically geotagged and timestamped'
    ],
    mandatory_for: ['deep', 'moveout'],
    recommended_for: ['basic']
  };
};

export const calculatePhotoComplianceScore = (booking) => {
  if (!booking) return 0;

  const totalPhotos = (booking.before_photos?.length || 0) + (booking.after_photos?.length || 0);
  
  if (totalPhotos === 0) return 0;
  if (totalPhotos < MINIMUM_PHOTOS_REQUIRED) return 50;
  if (totalPhotos >= MINIMUM_PHOTOS_REQUIRED) return 100;

  return 75; // Partial compliance
};

export default {
  validatePhotoUpload,
  validatePhotoRequirements,
  getPhotoUploadGuidelines,
  calculatePhotoComplianceScore,
  MINIMUM_PHOTOS_REQUIRED,
  MAX_FILE_SIZE_MB,
  ALLOWED_MIME_TYPES
};