
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, CheckCircle, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { validateGPSLocation, getCurrentPosition, formatDistance, getValidationStatusColor } from './GPSValidator';
import { analytics } from '../analytics/AnalyticsService';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is installed and configured

export default function GPSCheckIn({ booking, onCheckInComplete, onCheckOutComplete }) {
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');

  // Determine if the current action is checking out
  const isCheckingOut = booking?.check_in_time && !booking?.check_out_time;

  useEffect(() => {
    // If checking out and no position is set, attempt to get location automatically.
    // This provides a better UX for checkout. For check-in, we typically want explicit action.
    if (isCheckingOut && !position) {
      handleGetLocation();
    }
  }, [isCheckingOut, position]); // Re-run if isCheckingOut changes or position is cleared

  const handleGetLocation = async () => {
    setLoading(true);
    setError('');
    setValidationResult(null);
    setPosition(null); // Clear previous position

    try {
      const currentPosition = await getCurrentPosition();
      setPosition(currentPosition);

      // Validate against job location
      const validation = validateGPSLocation(
        currentPosition,
        {
          latitude: booking.latitude,
          longitude: booking.longitude
        }
      );

      setValidationResult(validation);

      if (!validation.valid) {
        setError(validation.message);
      }

    } catch (err) {
      setError(err.message || 'Failed to get location. Please ensure location services are enabled.');
    }

    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!validationResult?.valid) {
      setError('You must be within 250m of the job location to check in.');
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      const checkInData = {
        check_in_time: new Date().toISOString(),
        check_in_location: JSON.stringify({
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          distance_from_job: validationResult.distance,
          timestamp: position.timestamp
        }),
        status: 'in_progress'
      };

      await base44.entities.Booking.update(booking.id, checkInData);

      // Create event
      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'check_in',
        user_email: booking.cleaner_email,
        details: `Checked in at ${formatDistance(validationResult.distance)} from job site`,
        timestamp: new Date().toISOString()
      });

      analytics.cleaner('check_in', {
        booking_id: booking.id,
        distance_from_job: validationResult.distance,
        accuracy: position.accuracy
      });

      toast.success('Successfully checked in!');

      if (onCheckInComplete) {
        onCheckInComplete(checkInData);
      }

    } catch (err) {
      console.error('Check-in error:', err);
      setError('Failed to check in. Please try again.');
    }

    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!validationResult?.valid) {
      setError('You must be within 250m of the job location to check out.');
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      const checkInTime = new Date(booking.check_in_time);
      const checkOutTime = new Date();
      const durationMs = checkOutTime - checkInTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      const actualHours = Math.ceil(durationHours * 4) / 4; // Round up to nearest 0.25h

      const checkOutData = {
        check_out_time: checkOutTime.toISOString(),
        check_out_location: JSON.stringify({
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          distance_from_job: validationResult.distance,
          timestamp: position.timestamp
        }),
        actual_hours: actualHours,
        status: 'completed'
      };

      await base44.entities.Booking.update(booking.id, checkOutData);

      // Create event
      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'check_out',
        user_email: booking.cleaner_email,
        details: `Checked out after ${actualHours}h at ${formatDistance(validationResult.distance)} from job site`,
        timestamp: new Date().toISOString()
      });

      analytics.cleaner('check_out', {
        booking_id: booking.id,
        actual_hours: actualHours,
        distance_from_job: validationResult.distance
      });

      toast.success(`Job completed! Worked ${actualHours} hours.`);

      if (onCheckOutComplete) {
        onCheckOutComplete(checkOutData);
      }

    } catch (err) {
      console.error('Check-out error:', err);
      setError('Failed to check out. Please try again.');
    }

    setLoading(false);
  };

  // Determine the status color for the UI
  const statusColor = validationResult
    ? getValidationStatusColor(validationResult.valid, validationResult.distance)
    : 'slate';

  // Prevent actions if booking or required details are missing
  if (!booking || !booking.latitude || !booking.longitude) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            GPS Check-In/Out Error
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-900">
              <p>Booking details (latitude/longitude) are missing. Cannot perform GPS operations.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className={`bg-gradient-to-r from-${statusColor}-50 to-${statusColor}-100`}>
        <CardTitle className="flex items-center gap-2">
          <MapPin className={`w-6 h-6 text-${statusColor}-600`} />
          GPS {isCheckingOut ? 'Check-Out' : 'Check-In'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Instructions */}
        <Alert className={`border-${statusColor}-200 bg-${statusColor}-50`}>
          <AlertDescription className={`text-${statusColor}-900`}>
            {isCheckingOut ? (
              <div>
                <p className="font-semibold mb-1">Ready to check out?</p>
                <p className="text-sm">Verify your location to complete the job.</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-1">Before you start cleaning:</p>
                <p className="text-sm">You must be within 250m of the job location to check in.</p>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Get Location Button - Only show if location hasn't been obtained yet or if there's an error */}
        {!position || error ? (
          <Button
            onClick={handleGetLocation}
            disabled={loading}
            className="w-full bg-system hover:bg-system/90 text-white font-heading font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" />
                Get My Location
              </>
            )}
          </Button>
        ) : null}

        {/* Validation Result */}
        {validationResult && position && (
          <div className="space-y-3">
            <Alert className={`border-${statusColor}-200 bg-${statusColor}-50`}>
              <AlertDescription className={`text-${statusColor}-900`}>
                <div className="flex items-start gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className={`w-5 h-5 text-${statusColor}-600 mt-0.5`} />
                  ) : (
                    <AlertCircle className={`w-5 h-5 text-${statusColor}-600 mt-0.5`} />
                  )}
                  <div>
                    <p className="font-semibold">{validationResult.message}</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>Distance: <strong>{formatDistance(validationResult.distance)}</strong></p>
                      <p>GPS Accuracy: <strong>{Math.round(position.accuracy)}m</strong></p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {validationResult.valid ? (
              <Button
                onClick={isCheckingOut ? handleCheckOut : handleCheckIn}
                disabled={loading}
                className={`w-full bg-${statusColor}-500 hover:bg-${statusColor}-600 text-white`}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm {isCheckingOut ? 'Check-Out' : 'Check-In'}
                  </>
                )}
              </Button>
            ) : (
              // If not valid, show a "Try Again" button
              <Button
                onClick={handleGetLocation}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !validationResult?.valid && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p>{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Job Location Info */}
        <div className="pt-4 border-t">
          <p className="text-sm text-slate-600 mb-2">Job Location:</p>
          <p className="text-sm font-medium text-slate-900">{booking.address}</p>
        </div>
      </CardContent>
    </Card>
  );
}
