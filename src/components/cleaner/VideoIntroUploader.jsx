import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, Loader2, CheckCircle, X, Play } from 'lucide-react';

export default function VideoIntroUploader({ currentVideoUrl, onVideoUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(currentVideoUrl || null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('video/')) {
      setMessage('Please upload a video file');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setMessage('Video file must be less than 50MB');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Upload video
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setPreview(file_url);
      if (onVideoUploaded) {
        onVideoUploaded(file_url);
      }
      setMessage('Video uploaded successfully! Save your profile to apply changes.');
    } catch (error) {
      console.error('Video upload error:', error);
      setMessage('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setPreview(null);
    if (onVideoUploaded) {
      onVideoUploaded(null);
    }
    setMessage('Video removed. Save your profile to apply changes.');
  };

  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" />
          Intro Video
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-sm text-gray-600 font-verdana">
          Upload a short video (30-60 seconds) introducing yourself to potential clients. Show your personality and cleaning expertise!
        </p>

        {message && (
          <Alert className={message.includes('success') ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}>
            {message.includes('success') ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-amber-600" />
            )}
            <AlertDescription className="font-verdana">{message}</AlertDescription>
          </Alert>
        )}

        {preview ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <video
                src={preview}
                controls
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <Button
              onClick={removeVideo}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 font-fredoka"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Video
            </Button>
          </div>
        ) : (
          <div>
            <label htmlFor="video-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:bg-purple-50 transition-all">
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                    <p className="font-fredoka text-purple-600">Uploading video...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-purple-600" />
                    <div>
                      <p className="font-fredoka font-semibold text-graphite mb-1">
                        Click to upload video
                      </p>
                      <p className="text-sm text-gray-600 font-verdana">
                        MP4, MOV, AVI (max 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm font-fredoka font-semibold text-blue-900 mb-2">💡 Tips for a great intro video:</p>
          <ul className="text-sm text-blue-800 font-verdana space-y-1 list-disc list-inside">
            <li>Keep it under 60 seconds</li>
            <li>Speak clearly and smile</li>
            <li>Mention your experience and specialties</li>
            <li>Film in good lighting</li>
            <li>Show your cleaning supplies or a workspace</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}