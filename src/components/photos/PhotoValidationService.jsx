import { base44 } from '@/api/base44Client';

/**
 * Photo Validation Service
 * Validates photo requirements for job completion
 */

const MIN_PHOTOS_REQUIRED = 3;
const MAX_PHOTO_SIZE_MB = 5;

/**
 * Check if a booking has sufficient photos
 */
export const validateBookingPhotos = async (bookingId) => {
  try {
    const photos = await base44.entities.PhotoPair.filter({ booking_id: bookingId });
    
    return {
      valid: photos.length >= MIN_PHOTOS_REQUIRED,
      count: photos.length,
      required: MIN_PHOTOS_REQUIRED,
      missing: Math.max(0, MIN_PHOTOS_REQUIRED - photos.length),
      photos
    };
  } catch (error) {
    console.error('Error validating photos:', error);
    return {
      valid: false,
      count: 0,
      required: MIN_PHOTOS_REQUIRED,
      missing: MIN_PHOTOS_REQUIRED,
      error: error.message
    };
  }
};

/**
 * Validate individual photo file before upload
 */
export const validatePhotoFile = (file) => {
  const errors = [];

  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push(`"${file.name}" is not an image file`);
  }

  // Check file size
  const maxSizeBytes = MAX_PHOTO_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`"${file.name}" exceeds ${MAX_PHOTO_SIZE_MB}MB limit`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate multiple photo files
 */
export const validatePhotoFiles = (files, currentCount = 0) => {
  const MAX_PHOTOS_ALLOWED = 10;
  const errors = [];
  const warnings = [];

  // Check total count
  if (currentCount + files.length > MAX_PHOTOS_ALLOWED) {
    errors.push(`Cannot upload ${files.length} photos. Maximum ${MAX_PHOTOS_ALLOWED} photos allowed (currently have ${currentCount})`);
  }

  // Validate each file
  files.forEach(file => {
    const fileValidation = validatePhotoFile(file);
    if (!fileValidation.valid) {
      errors.push(...fileValidation.errors);
    }
  });

  // Check if meets minimum
  const totalAfterUpload = currentCount + files.length;
  if (totalAfterUpload < MIN_PHOTOS_REQUIRED) {
    warnings.push(`You will have ${totalAfterUpload} photo(s). ${MIN_PHOTOS_REQUIRED - totalAfterUpload} more needed to meet minimum.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalAfterUpload
  };
};

/**
 * Check if job can be completed (has enough photos)
 */
export const canCompleteJob = async (bookingId) => {
  const validation = await validateBookingPhotos(bookingId);
  return validation.valid;
};

/**
 * Get photo completion status for display
 */
export const getPhotoStatus = (photoCount) => {
  if (photoCount >= MIN_PHOTOS_REQUIRED) {
    return {
      status: 'complete',
      color: 'green',
      message: `✓ ${photoCount} photos uploaded`,
      icon: 'CheckCircle'
    };
  } else if (photoCount > 0) {
    return {
      status: 'partial',
      color: 'amber',
      message: `${MIN_PHOTOS_REQUIRED - photoCount} more photo(s) needed`,
      icon: 'AlertCircle'
    };
  } else {
    return {
      status: 'none',
      color: 'red',
      message: `${MIN_PHOTOS_REQUIRED} photos required`,
      icon: 'Camera'
    };
  }
};

/**
 * Update booking photo proof status
 */
export const updatePhotoProofStatus = async (bookingId) => {
  try {
    const validation = await validateBookingPhotos(bookingId);
    
    await base44.entities.Booking.update(bookingId, {
      photo_proof_submitted: validation.valid,
      photo_count: validation.count
    });

    return validation;
  } catch (error) {
    console.error('Error updating photo proof status:', error);
    throw error;
  }
};

export default {
  MIN_PHOTOS_REQUIRED,
  MAX_PHOTO_SIZE_MB,
  validateBookingPhotos,
  validatePhotoFile,
  validatePhotoFiles,
  canCompleteJob,
  getPhotoStatus,
  updatePhotoProofStatus
};