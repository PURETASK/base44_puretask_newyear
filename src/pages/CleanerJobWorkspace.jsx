import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Clock, Sparkles, Calendar, CheckCircle2, 
  Loader2, AlertTriangle, Navigation, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import JobStartCheckIn from '../components/jobs/JobStartCheckIn';
import JobPhotoUpload from '../components/jobs/JobPhotoUpload';
import JobTaskChecklist from '../components/jobs/JobTaskChecklist';
import JobEndCheckOut from '../components/jobs/JobEndCheckOut';
import InJobIssueReporter from '../components/jobs/InJobIssueReporter';
import JobSummaryModal from '../components/jobs/JobSummaryModal';
import PhotoProofProgress from '../components/booking/PhotoProofProgress';

export default function CleanerJobWorkspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState('start'); // start, before_photos, in_progress, after_photos, end, complete
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    loadJobData();
  }, [bookingId]);

  useEffect(() => {
    let interval;
    if (currentStage === 'in_progress' && booking?.check_in_time) {
      interval = setInterval(() => {
        const start = new Date(booking.check_in_time);
        const now = new Date();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStage, booking]);

  const loadJobData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('SignIn'));
        return;
      }
      setUser(currentUser);

      if (!bookingId) {
        navigate(createPageUrl('CleanerSchedule'));
        return;
      }

      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      if (bookings.length === 0) {
        navigate(createPageUrl('CleanerSchedule'));
        return;
      }

      const bookingData = bookings[0];
      setBooking(bookingData);

      // Load client profile (for first name only)
      const profiles = await base44.entities.ClientProfile.filter({
        user_email: bookingData.client_email
      });
      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
      }

      // Determine current stage based on booking status and data
      determineStage(bookingData);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading job:', showToast: false });
    } finally {
      setLoading(false);
    }
  };

  const determineStage = (bookingData) => {
    if (bookingData.check_out_time) {
      setCurrentStage('complete');
    } else if (bookingData.after_photos && bookingData.after_photos.length >= 3) {
      setCurrentStage('end');
    } else if (bookingData.before_photos && bookingData.before_photos.length >= 3) {
      setCurrentStage('in_progress');
    } else if (bookingData.check_in_time) {
      setCurrentStage('before_photos');
    } else {
      setCurrentStage('start');
    }
  };

  const handleJobStarted = async () => {
    await loadJobData();
    setCurrentStage('before_photos');
  };

  const handleBeforePhotosComplete = async () => {
    await loadJobData();
    setCurrentStage('in_progress');
  };

  const handleReadyToFinish = () => {
    setCurrentStage('after_photos');
  };

  const handleAfterPhotosComplete = async () => {
    await loadJobData();
    setCurrentStage('end');
  };

  const handleJobEnded = async () => {
    await loadJobData();
    
    // Trigger post-cleaning summary automation
    try {
      await base44.functions.invoke('sendPostCleaningSummary', { booking_id: booking.id });
    } catch (e) {
      console.log('Post-cleaning automation failed:', e);
    }
    
    setCurrentStage('complete');
    setShowSummary(true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCleaningTypeLabel = (type) => {
    const types = {
      basic: 'Basic Cleaning',
      deep: 'Deep Cleaning',
      moveout: 'Move-Out Cleaning'
    };
    return types[type] || type;
  };

  const openMapNavigation = () => {
    if (booking?.latitude && booking?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}`;
      window.open(url, '_blank');
    } else if (booking?.address) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-graphite font-verdana">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">Job Not Found</h3>
            <p className="text-gray-600 font-verdana mb-6">This job could not be found.</p>
            <Button onClick={() => navigate(createPageUrl('CleanerSchedule'))}>
              Back to Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientFirstName = clientProfile?.user_email?.split('@')[0] || 'Client';

  return (
    <div className="min-h-screen bg-soft-cloud py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl('CleanerSchedule'))}
            className="mb-4"
          >
            ← Back to Schedule
          </Button>
          <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">Active Job</h1>
          <p className="text-gray-600 font-verdana">Manage your current cleaning appointment</p>
        </div>

        {/* Stage Indicator */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-verdana mb-1">Current Stage</p>
                <p className="text-xl font-fredoka font-bold text-graphite capitalize">
                  {currentStage === 'start' && '1. Start Job'}
                  {currentStage === 'before_photos' && '2. Upload Before Photos'}
                  {currentStage === 'in_progress' && '3. Cleaning In Progress'}
                  {currentStage === 'after_photos' && '4. Upload After Photos'}
                  {currentStage === 'end' && '5. End Job'}
                  {currentStage === 'complete' && '✓ Job Complete'}
                </p>
              </div>
              {currentStage === 'in_progress' && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-verdana mb-1">Time Elapsed</p>
                  <p className="text-3xl font-fredoka font-bold text-puretask-blue">
                    {formatTime(elapsedTime)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-puretask-blue" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-verdana mb-1">Client</p>
                <p className="font-fredoka font-semibold text-graphite">{clientFirstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-verdana mb-1">Service Type</p>
                <Badge className="font-fredoka">{getCleaningTypeLabel(booking.cleaning_type)}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-verdana mb-1">Date & Time</p>
                <div className="flex items-center gap-2 text-gray-700 font-verdana">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-verdana mb-1">Duration</p>
                <div className="flex items-center gap-2 text-gray-700 font-verdana">
                  <Clock className="w-4 h-4" />
                  <span>{booking.start_time} ({booking.hours}h estimated)</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-verdana mb-2">Address</p>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 text-gray-700 font-verdana flex-1">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-puretask-blue" />
                  <span>{booking.address}</span>
                </div>
                <Button variant="outline" size="sm" onClick={openMapNavigation}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate
                </Button>
              </div>
            </div>

            {/* Additional Services */}
            {booking.additional_services && Object.keys(booking.additional_services).filter(k => booking.additional_services[k] > 0).length > 0 && (
              <div>
                <p className="text-sm text-gray-500 font-verdana mb-2">Additional Services</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(booking.additional_services)
                    .filter(key => booking.additional_services[key] > 0)
                    .map(key => {
                      const serviceNames = {
                        windows: 'Windows',
                        blinds: 'Blinds',
                        oven: 'Oven',
                        refrigerator: 'Refrigerator',
                        light_fixtures: 'Light Fixtures',
                        inside_cabinets: 'Inside Cabinets',
                        baseboards: 'Baseboards',
                        laundry: 'Laundry'
                      };
                      return (
                        <Badge key={key} variant="outline" className="font-verdana">
                          {serviceNames[key]} x{booking.additional_services[key]}
                        </Badge>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {(booking.parking_instructions || booking.entry_instructions || booking.product_preferences || booking.product_allergies) && (
              <div>
                <p className="text-sm text-gray-500 font-verdana mb-2">Special Instructions</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2 text-sm font-verdana">
                  {booking.parking_instructions && (
                    <p><span className="font-semibold">Parking:</span> {booking.parking_instructions}</p>
                  )}
                  {booking.entry_instructions && (
                    <p><span className="font-semibold">Entry:</span> {booking.entry_instructions}</p>
                  )}
                  {booking.product_preferences && (
                    <p><span className="font-semibold">Product Preferences:</span> {booking.product_preferences}</p>
                  )}
                  {booking.product_allergies && (
                    <p><span className="font-semibold">Allergies:</span> {booking.product_allergies}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage-specific Content */}
        {currentStage === 'start' && (
          <JobStartCheckIn 
            booking={booking} 
            onSuccess={handleJobStarted}
          />
        )}

        {currentStage === 'before_photos' && (
          <>
            <PhotoProofProgress 
              booking={booking}
              currentCount={booking.before_photos?.length || 0}
              requiredCount={3}
            />
            <JobPhotoUpload 
              booking={booking}
              photoType="before"
              onSuccess={handleBeforePhotosComplete}
            />
          </>
        )}

        {currentStage === 'in_progress' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job in Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="font-verdana">
                    You're doing great! Complete the tasks below and upload after photos when finished.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(createPageUrl('Inbox') + `?email=${booking.client_email}`)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Client
                  </Button>
                  <InJobIssueReporter booking={booking} />
                </div>

                <Button 
                  onClick={handleReadyToFinish} 
                  className="w-full brand-gradient"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Ready to Upload After Photos
                </Button>
              </CardContent>
            </Card>

            <JobTaskChecklist booking={booking} />
          </div>
        )}

        {currentStage === 'after_photos' && (
          <>
            <PhotoProofProgress 
              booking={booking}
              currentCount={booking.after_photos?.length || 0}
              requiredCount={3}
            />
            <JobPhotoUpload 
              booking={booking}
              photoType="after"
              onSuccess={handleAfterPhotosComplete}
            />
          </>
        )}

        {currentStage === 'end' && (
          <JobEndCheckOut 
            booking={booking}
            onSuccess={handleJobEnded}
          />
        )}

        {currentStage === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-fresh-mint mx-auto mb-4" />
              <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2">Job Complete!</h3>
              <p className="text-gray-600 font-verdana mb-6">
                Great work! The job has been submitted for client approval.
              </p>
              <Button onClick={() => navigate(createPageUrl('CleanerSchedule'))}>
                Back to Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <JobSummaryModal
        open={showSummary}
        onOpenChange={setShowSummary}
        booking={booking}
        elapsedTime={elapsedTime}
      />
    </div>
  );
}