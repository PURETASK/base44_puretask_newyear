// CleanerJobDetail - AI-Powered Job Workflow Component
// Handles entire job lifecycle from acceptance to completion

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { cleanerJobsService } from '@/services/cleanerJobsService';
// import type { JobRecord } from '@/types/cleanerJobTypes'; // Removed - TypeScript syntax in JSX file
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin, Clock, DollarSign, Camera, CheckCircle, AlertTriangle,
  Navigation, PlayCircle, StopCircle, Upload, MessageSquare,
  Zap, Timer, Info, ChevronRight, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FloatingAIAssistant } from '@/components/ai/CleanerAIChatAssistant';

export default function CleanerJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null); // JobRecord | null
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // GPS state
  const [currentLocation, setCurrentLocation] = useState(null); // { lat: number; lng: number } | null
  const [locationError, setLocationError] = useState('');
  
  // Photo state
  const [beforePhotos, setBeforePhotos] = useState([]); // File[]
  const [afterPhotos, setAfterPhotos] = useState([]); // File[]
  const [uploading, setUploading] = useState(false);
  
  // Extra time state
  const [showExtraTimeForm, setShowExtraTimeForm] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(30);
  const [extraTimeReason, setExtraTimeReason] = useState('');
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    loadJob();
    getCurrentLocation();
  }, [jobId]);
  
  // Timer effect
  useEffect(() => {
    if (job?.state === 'IN_PROGRESS' && job.start_at) {
      const interval = setInterval(() => {
        const start = new Date(job.start_at);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        setElapsedTime(diffMinutes);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [job?.state, job?.start_at]);
  
  const loadJob = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const jobData = await cleanerJobsService.getJob(jobId, currentUser.email);
      if (!jobData) {
        toast.error('Job not found or you are not assigned to this job');
        navigate('/CleanerDashboard');
        return;
      }
      
      setJob(jobData);
    } catch (error) {
      toast.error(error.message || 'Failed to load job');
      navigate('/CleanerDashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable GPS.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('GPS not supported by your device.');
    }
  };
  
  // ACTION HANDLERS
  
  const handleMarkEnRoute = async () => {
    if (!currentLocation) {
      toast.error('GPS location required');
      return;
    }
    
    try {
      setActionLoading(true);
      const updated = await cleanerJobsService.markEnRoute(
        jobId,
        user.email,
        user.id,
        currentLocation
      );
      setJob(updated);
      toast.success('✅ Marked as en route - Client notified!');
    } catch (error) {
      toast.error(error.message || 'Failed to mark en route');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleMarkArrived = async () => {
    if (!currentLocation) {
      toast.error('GPS location required');
      return;
    }
    
    try {
      setActionLoading(true);
      const updated = await cleanerJobsService.markArrived(
        jobId,
        user.email,
        user.id,
        currentLocation
      );
      setJob(updated);
      toast.success('✅ Checked in successfully!');
    } catch (error) {
      toast.error(error.message || 'GPS check-in failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleStartJob = async () => {
    if (!currentLocation) {
      toast.error('GPS location required');
      return;
    }
    
    try {
      setActionLoading(true);
      const updated = await cleanerJobsService.startJob(
        jobId,
        user.email,
        user.id,
        currentLocation
      );
      setJob(updated);
      toast.success('✅ Job started - Timer running!');
    } catch (error) {
      toast.error(error.message || 'Failed to start job');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleUploadBeforePhoto = async (file) => {
    try {
      setUploading(true);
      const result = await cleanerJobsService.uploadBeforePhoto(
        jobId,
        user.email,
        user.id,
        file
      );
      setJob({ ...job, before_photos_count: result.count });
      toast.success(`Before photo ${result.count}/3 uploaded`);
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };
  
  const handleUploadAfterPhoto = async (file) => {
    try {
      setUploading(true);
      const result = await cleanerJobsService.uploadAfterPhoto(
        jobId,
        user.email,
        user.id,
        file
      );
      setJob({ ...job, after_photos_count: result.count });
      toast.success(`After photo ${result.count}/3 uploaded`);
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRequestExtraTime = async () => {
    if (!extraTimeReason.trim()) {
      toast.error('Please provide a reason for extra time');
      return;
    }
    
    try {
      setActionLoading(true);
      const updated = await cleanerJobsService.requestExtraTime(
        jobId,
        user.email,
        user.id,
        extraMinutes,
        extraTimeReason
      );
      setJob(updated);
      toast.success('⏱️ Extra time request sent to client');
      setShowExtraTimeForm(false);
      setExtraTimeReason('');
    } catch (error) {
      toast.error(error.message || 'Failed to request extra time');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCompleteJob = async () => {
    if (!currentLocation) {
      toast.error('GPS location required');
      return;
    }
    
    if ((job?.before_photos_count || 0) < 3) {
      toast.error('Please upload 3 before photos');
      return;
    }
    
    if ((job?.after_photos_count || 0) < 3) {
      toast.error('Please upload 3 after photos');
      return;
    }
    
    try {
      setActionLoading(true);
      const updated = await cleanerJobsService.completeJob(
        jobId,
        user.email,
        user.id,
        currentLocation
      );
      setJob(updated);
      toast.success('🎉 Job completed! Waiting for client approval.');
      navigate('/CleanerDashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to complete job');
    } finally {
      setActionLoading(false);
    }
  };
  
  // RENDERING HELPERS
  
  const getStateBadge = () => {
    const stateConfig = {
      ASSIGNED: { label: 'Assigned', variant: 'system', icon: CheckCircle },
      EN_ROUTE: { label: 'En Route', variant: 'system', icon: Navigation },
      ARRIVED: { label: 'Arrived', variant: 'system', icon: MapPin },
      IN_PROGRESS: { label: 'In Progress', variant: 'system', icon: PlayCircle },
      AWAITING_CLIENT_REVIEW: { label: 'Awaiting Review', variant: 'warning', icon: Clock },
      COMPLETED_APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle }
    };
    
    const config = stateConfig[job?.state || ''] || { label: job?.state, variant: 'default', icon: Info };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="font-heading text-base">
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </Badge>
    );
  };
  
  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };
  
  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-system" />
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // RENDER MAIN UI
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-heading font-bold text-graphite">
            Job Details
          </h1>
          {getStateBadge()}
        </div>
        
        {/* Job Info Card */}
        <Card className="border-system-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-body text-gray-600">Date & Time</p>
                <p className="font-heading font-semibold">{job.date} at {job.time}</p>
              </div>
              <div>
                <p className="text-sm font-body text-gray-600">Duration</p>
                <p className="font-heading font-semibold">{job.duration_hours} hours</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-body text-gray-600">Address</p>
                <p className="font-heading font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-system" />
                  {job.address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* GPS Status */}
      {locationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}
      
      {/* Timer (when in progress) */}
      {job.state === 'IN_PROGRESS' && (
        <Card className="mb-6 bg-system-soft border-system-border">
          <CardContent className="p-6 text-center">
            <Timer className="w-12 h-12 text-system mx-auto mb-2" />
            <p className="text-3xl font-heading font-bold text-system">
              {formatTime(elapsedTime)}
            </p>
            <p className="text-sm font-body text-gray-600 mt-1">
              Max billable: {formatTime(job.max_billable_minutes || 0)}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Action Buttons */}
      <div className="space-y-4">
        {job.state === 'ASSIGNED' && (
          <Button
            onClick={handleMarkEnRoute}
            disabled={actionLoading || !currentLocation}
            className="w-full bg-system hover:bg-system/90 text-white font-heading font-semibold"
            size="lg"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Navigation className="w-5 h-5 mr-2" />}
            Mark En Route
          </Button>
        )}
        
        {job.state === 'EN_ROUTE' && (
          <>
            <Button
              onClick={handleMarkArrived}
              disabled={actionLoading || !currentLocation}
              className="w-full bg-system hover:bg-system/90 text-white font-heading font-semibold"
              size="lg"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MapPin className="w-5 h-5 mr-2" />}
              Check In (I've Arrived)
            </Button>
            <p className="text-sm font-body text-center text-gray-600">
              Must be within 250m of job address
            </p>
          </>
        )}
        
        {(job.state === 'ARRIVED' || job.state === 'EN_ROUTE') && (
          <Button
            onClick={handleStartJob}
            disabled={actionLoading || !currentLocation}
            className="w-full bg-success hover:bg-success/90 text-white font-heading font-semibold"
            size="lg"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
            Start Job
          </Button>
        )}
        
        {job.state === 'IN_PROGRESS' && (
          <>
            {/* Photo Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Photos Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block font-heading font-semibold mb-2">
                    Before Photos ({job.before_photos_count || 0}/3)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => e.target.files?.[0] && handleUploadBeforePhoto(e.target.files[0])}
                    disabled={uploading || (job.before_photos_count || 0) >= 3}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block font-heading font-semibold mb-2">
                    After Photos ({job.after_photos_count || 0}/3)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => e.target.files?.[0] && handleUploadAfterPhoto(e.target.files[0])}
                    disabled={uploading || (job.after_photos_count || 0) >= 3}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Extra Time Request */}
            {!showExtraTimeForm && !job.has_pending_extra_time_request && (
              <Button
                onClick={() => setShowExtraTimeForm(true)}
                variant="outline"
                className="w-full font-heading"
              >
                <Zap className="w-4 h-4 mr-2" />
                Request Extra Time
              </Button>
            )}
            
            {showExtraTimeForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Request Extra Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block font-heading font-semibold mb-2">Minutes Needed</label>
                    <input
                      type="number"
                      value={extraMinutes}
                      onChange={(e) => setExtraMinutes(Number(e.target.value))}
                      className="w-full border rounded p-2"
                      min="15"
                      step="15"
                    />
                  </div>
                  <div>
                    <label className="block font-heading font-semibold mb-2">Reason</label>
                    <textarea
                      value={extraTimeReason}
                      onChange={(e) => setExtraTimeReason(e.target.value)}
                      className="w-full border rounded p-2 h-24"
                      placeholder="Why do you need extra time?"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleRequestExtraTime} disabled={actionLoading} className="flex-1">
                      Send Request
                    </Button>
                    <Button onClick={() => setShowExtraTimeForm(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {job.has_pending_extra_time_request && (
              <Alert>
                <Clock className="w-4 h-4" />
                <AlertDescription>Extra time request pending client approval</AlertDescription>
              </Alert>
            )}
            
            {/* Complete Job Button */}
            <Button
              onClick={handleCompleteJob}
              disabled={actionLoading || !currentLocation || (job.before_photos_count || 0) < 3 || (job.after_photos_count || 0) < 3}
              className="w-full bg-success hover:bg-success/90 text-white font-heading font-semibold"
              size="lg"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              Complete Job
            </Button>
            
            {((job.before_photos_count || 0) < 3 || (job.after_photos_count || 0) < 3) && (
              <p className="text-sm font-body text-center text-gray-600">
                Upload all photos before completing
              </p>
            )}
          </>
        )}
        
        {job.state === 'AWAITING_CLIENT_REVIEW' && (
          <Alert>
            <CheckCircle className="w-4 h-4 text-success" />
            <AlertDescription>
              Job completed! Waiting for client to approve and release payment.
            </AlertDescription>
          </Alert>
        )}
        
        {job.state === 'COMPLETED_APPROVED' && (
          <Alert>
            <CheckCircle className="w-4 h-4 text-success" />
            <AlertDescription>
              ✅ Job approved! Earnings: ${((job.final_credits_charged || 0) * 0.8).toFixed(2)}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Floating AI Assistant */}
      <FloatingAIAssistant
        currentJob={job}
        cleanerId={user?.id || ''}
        cleanerEmail={user?.email || ''}
        stats={{
          totalJobs: 0, // TODO: fetch from cleaner profile
          reliabilityScore: 0,
          avgRating: 0,
          totalEarnings: 0
        }}
      />
    </div>
  );
}

