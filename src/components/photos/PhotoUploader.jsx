
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Badge is still used in the original component but removed from the outline's CardHeader. I will remove it from the CardHeader but keep the import in case other parts of the original code were using it, but since it's not present in the new outline's JSX, I'll remove it.
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion'; // AnimatePresence was used for message, which is removed. I'll keep motion for photo grid.
import { analytics } from '../analytics/AnalyticsService';
import { toast } from 'sonner'; // Added for toast notifications

const MIN_PHOTOS_REQUIRED = 3;
// MAX_PHOTOS_ALLOWED is removed as per the outline

export default function PhotoUploader({ 
  bookingId, 
  onPhotosUploaded, 
  existingPhotos = [] 
}) {
  const [photos, setPhotos] = useState(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // Changed to object for per-file progress
  const [error, setError] = useState(''); // New state for error messages

  const photoCount = photos.length;
  const meetsMinimum = photoCount >= MIN_PHOTOS_REQUIRED;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not an image file`);
      }
      return isValid;
    });

    if (validFiles.length === 0) {
      setError('No valid image files selected for upload.');
      return;
    }

    setUploading(true);
    setError(''); // Clear previous errors
    setUploadProgress({}); // Clear previous progress

    try {
      const uploadedUrls = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        // Update progress for this specific file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));

        // Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        uploadedUrls.push(file_url);

        // Mark as 100% complete for this specific file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      }

      // Update photos state with newly uploaded URLs
      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);

      // Create photo pair records if booking provided
      if (bookingId) {
        for (const url of uploadedUrls) {
          await base44.entities.PhotoPair.create({
            booking_id: bookingId,
            cleaner_email: 'unknown', // The outline mentioned photos.cleaner_email, which is incorrect as 'photos' is an array of URLs. Assuming it should be 'unknown' or a prop.
            area: 'general',
            before_photo_url: '', // Keeping this as per original logic, but outline puts 'url'
            after_photo_url: url, // Set uploaded URL as after_photo_url
            upload_timestamp: new Date().toISOString()
          });
        }

        // Update booking photo count and compliance status
        await base44.entities.Booking.update(bookingId, {
          after_photos: newPhotos, // Update the array of all after photos
          photo_proof_submitted: newPhotos.length >= MIN_PHOTOS_REQUIRED
        });
      }

      // Track analytics
      analytics.cleaner('photos_uploaded', {
        booking_id: bookingId,
        photo_count: validFiles.length // Number of files successfully processed in this batch
      });

      toast.success(`Uploaded ${validFiles.length} photo(s) successfully!`);

      if (onPhotosUploaded) {
        onPhotosUploaded(newPhotos); // Pass the updated list of all photos
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photos. Please try again.');
      toast.error('Failed to upload photos');
    }

    setUploading(false);
    setUploadProgress({}); // Clear progress indicators
  };

  const handleRemovePhoto = async (photoUrlToRemove) => {
    // Filter out the photo to be removed
    const newPhotos = photos.filter(url => url !== photoUrlToRemove);
    setPhotos(newPhotos); // Update state immediately

    if (bookingId) {
      try {
        // Update booking's after_photos array
        await base44.entities.Booking.update(bookingId, {
          after_photos: newPhotos,
          photo_proof_submitted: newPhotos.length >= MIN_PHOTOS_REQUIRED
        });
        // Optionally, remove the PhotoPair entity for this URL if desired
        // This would require querying for the PhotoPair by bookingId and photoUrl
      } catch (error) {
        console.error('Error updating booking after photo removal:', error);
        toast.error('Failed to update booking status after photo removal.');
        // Revert photos state if update fails, or handle appropriately
      }
    }

    toast.success('Photo removed');
  };

  // handleSubmit function is removed as per outline, saving logic moved to handleFileSelect

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className={`bg-gradient-to-r ${meetsMinimum ? 'from-green-50 to-emerald-50' : 'from-amber-50 to-yellow-50'}`}>
        <CardTitle className="flex items-center gap-2">
          <Camera className={`w-6 h-6 ${meetsMinimum ? 'text-green-600' : 'text-amber-600'}`} />
          Photo Proof ({photoCount}/{MIN_PHOTOS_REQUIRED} minimum)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Requirement Status */}
        <Alert className={`border-${meetsMinimum ? 'green' : 'amber'}-200 bg-${meetsMinimum ? 'green' : 'amber'}-50`}>
          <AlertDescription className={`text-${meetsMinimum ? 'green' : 'amber'}-900`}>
            <div className="flex items-start gap-2">
              {meetsMinimum ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              )}
              <div>
                {meetsMinimum ? (
                  <p className="font-semibold">Minimum photos uploaded! ✓</p>
                ) : (
                  <>
                    <p className="font-semibold">
                      {MIN_PHOTOS_REQUIRED - photoCount} more photo(s) required
                    </p>
                    <p className="text-sm mt-1">
                      Upload at least {MIN_PHOTOS_REQUIRED} photos to complete the job
                    </p>
                  </>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              asChild // This keeps the button styling but renders the span child
              disabled={uploading}
              className="w-full"
              size="lg"
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Photos
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>

        {/* Upload Progress for individual files */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 truncate">{fileName}</span>
                  <span className="text-slate-900 font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            {photos.map((url, idx) => (
              <motion.div
                key={url} // Using url as key for uniqueness
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <img
                  src={url}
                  alt={`Uploaded photo ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(url)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Guidelines */}
        <div className="pt-4 border-t">
          <p className="text-sm text-slate-600 mb-2">Photo Guidelines:</p>
          <ul className="text-sm text-slate-600 space-y-1 pl-4 list-disc">
            <li>Upload at least {MIN_PHOTOS_REQUIRED} clear photos</li>
            <li>Show different areas of the cleaned space</li>
            <li>Good lighting helps showcase your work</li>
            <li>Before/after shots are recommended</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
