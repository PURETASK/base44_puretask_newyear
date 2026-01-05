import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, Upload, Trash2, Play, Loader2, CheckCircle, Info, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function VideoIntroUpload({ cleanerProfile, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const hasVideo = cleanerProfile.video_intro_url;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Video must be less than 100MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update profile with video URL
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        video_intro_url: file_url
      });

      toast.success('Video uploaded successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your video intro?')) return;

    setDeleting(true);
    try {
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        video_intro_url: null
      });
      toast.success('Video deleted');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
    setDeleting(false);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            Video Introduction
          </CardTitle>
          {hasVideo && (
            <Badge className="bg-fresh-mint text-white font-fredoka">
              <CheckCircle className="w-3 h-3 mr-1" />
              Uploaded
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
          <Info className="w-5 h-5 text-puretask-blue" />
          <AlertTitle className="font-fredoka font-bold text-graphite">Why Add a Video?</AlertTitle>
          <AlertDescription className="font-verdana text-gray-700 mt-2 space-y-1">
            <p>✨ Profiles with videos get <strong>3x more bookings</strong></p>
            <p>🎥 Keep it under 30 seconds</p>
            <p>💡 Introduce yourself, show your personality, highlight your experience</p>
          </AlertDescription>
        </Alert>

        {/* Current Video Preview */}
        {hasVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-purple-300 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative">
                  <video
                    src={cleanerProfile.video_intro_url}
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    Your browser does not support video playback.
                  </video>
                  
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-purple-600 text-white font-fredoka">
                      <Play className="w-3 h-3 mr-1" />
                      Your Intro
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upload Section */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <Card className="border-2 border-purple-300 bg-purple-50 rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="font-fredoka font-bold text-graphite mb-2">Uploading Video...</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <motion.div
                      className="bg-purple-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-verdana">{uploadProgress}% complete</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="brand-gradient text-white rounded-full font-fredoka font-semibold"
              >
                <Upload className="w-4 h-4 mr-2" />
                {hasVideo ? 'Replace Video' : 'Upload Video'}
              </Button>

              {hasVideo && (
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="destructive"
                  className="rounded-full font-fredoka"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <Card className="border-2 border-green-200 bg-green-50 rounded-2xl">
          <CardContent className="p-4">
            <p className="font-fredoka font-semibold text-graphite mb-3 text-sm">Video Tips:</p>
            <ul className="space-y-2 text-sm font-verdana text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5 flex-shrink-0" />
                <span><strong>Length:</strong> 20-30 seconds is perfect</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5 flex-shrink-0" />
                <span><strong>Lighting:</strong> Good natural light, face the camera</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5 flex-shrink-0" />
                <span><strong>Content:</strong> Name, experience, what makes you unique</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-fresh-mint mt-0.5 flex-shrink-0" />
                <span><strong>Format:</strong> MP4, MOV, or WebM (max 100MB)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Impact Stats */}
        {hasVideo && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-fredoka font-bold text-purple-900 mb-1">Profile Complete!</p>
                  <p className="text-sm text-purple-700 font-verdana">
                    Cleaners with videos earn 40% more and get booked 3x faster
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}