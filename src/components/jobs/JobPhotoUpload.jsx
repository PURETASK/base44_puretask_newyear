import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Loader2, Upload, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MINIMUM_PHOTOS = 3;

export default function JobPhotoUpload({ booking, photoType, onSuccess }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load existing photos if any
    if (photoType === 'before' && booking.before_photos) {
      setPhotos(booking.before_photos);
    } else if (photoType === 'after' && booking.after_photos) {
      setPhotos(booking.after_photos);
    }
  }, [booking, photoType]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        // Upload to server
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      setPhotos([...photos, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} photo(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (photos.length < MINIMUM_PHOTOS) {
      toast.error(`Please upload at least ${MINIMUM_PHOTOS} photos`);
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {};
      if (photoType === 'before') {
        updateData.before_photos = photos;
        updateData.photo_count = photos.length;
      } else {
        updateData.after_photos = photos;
        updateData.photo_proof_submitted = true;
        updateData.photo_count = booking.before_photos?.length + photos.length || photos.length;
      }

      await base44.entities.Booking.update(booking.id, updateData);

      toast.success(`${photoType === 'before' ? 'Before' : 'After'} photos submitted successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Error submitting photos:', error);
      toast.error('Failed to submit photos. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isComplete = photos.length >= MINIMUM_PHOTOS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-puretask-blue" />
          {photoType === 'before' ? 'Upload Before Photos' : 'Upload After Photos'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={isComplete ? 'default' : 'destructive'}>
          {isComplete ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="font-verdana">
                Great! You've uploaded {photos.length} photo(s). You can add more or submit now.
              </AlertDescription>
            </>
          ) : (
            <AlertDescription className="font-verdana">
              <span className="font-semibold">Required:</span> Upload at least {MINIMUM_PHOTOS} {photoType} photos 
              ({photos.length}/{MINIMUM_PHOTOS} uploaded)
            </AlertDescription>
          )}
        </Alert>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm font-verdana">
          <p className="font-semibold mb-2">Photo Guidelines:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Take clear, well-lit photos</li>
            <li>Capture different angles and areas of the space</li>
            <li>Include overview shots and detail shots</li>
            <li>{photoType === 'before' ? 'Document the initial state before cleaning' : 'Show the cleaned areas clearly'}</li>
            <li>Photos must be under 10MB each</li>
          </ul>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`${photoType} photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              onClick={(e) => e.currentTarget.previousElementSibling.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Photos
                </>
              )}
            </Button>
          </label>

          <Button
            onClick={handleSubmit}
            disabled={!isComplete || submitting}
            className="flex-1 brand-gradient"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submit Photos
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}