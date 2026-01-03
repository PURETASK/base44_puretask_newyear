import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2, Square, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function JobEndCheckOut({ booking, onSuccess }) {
  const [location, setLocation] = useState(null);
  const [checking, setChecking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const [distance, setDistance] = useState(null);
  const [actualHours, setActualHours] = useState(0);

  useEffect(() => {
    checkLocation();
    calculateActualHours();
  }, []);

  const calculateActualHours = () => {
    if (booking.check_in_time) {
      const start = new Date(booking.check_in_time);
      const now = new Date();
      const hours = (now - start) / (1000 * 60 * 60);
      setActualHours(hours.toFixed(2));
    }
  };

  const checkLocation = () => {
    setChecking(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setLocation({ lat: userLat, lng: userLng });

          const dist = calculateDistance(
            userLat,
            userLng,
            booking.latitude,
            booking.longitude
          );
          setDistance(dist);

          if (dist <= 0.2) {
            setIsNearby(true);
          } else {
            setIsNearby(false);
          }
          setChecking(false);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get your location. Please enable location services.');
          setChecking(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setChecking(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const handleEndJob = async () => {
    if (!isNearby) {
      toast.error('You must be at the job location to end the job.');
      return;
    }

    setEnding(true);
    try {
      const checkOutTime = new Date().toISOString();
      const checkInTime = new Date(booking.check_in_time);
      const hours = (new Date(checkOutTime) - checkInTime) / (1000 * 60 * 60);

      await base44.entities.Booking.update(booking.id, {
        check_out_time: checkOutTime,
        check_out_location: `${location.lat},${location.lng}`,
        actual_hours: parseFloat(hours.toFixed(2)),
        status: 'completed'
      });

      toast.success('Job completed successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error ending job:', error);
      toast.error('Failed to end job. Please try again.');
    } finally {
      setEnding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square className="w-5 h-5 text-puretask-blue" />
          End Your Job
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={isNearby ? 'default' : 'destructive'}>
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="font-verdana">
                Checking your location...
              </AlertDescription>
            </>
          ) : isNearby ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="font-verdana">
                You're at the job location! Click "End Job" to complete.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-verdana">
                {distance !== null 
                  ? `You're ${distance.toFixed(2)} miles away. You must be within 0.2 miles to end the job.`
                  : 'Unable to verify your location. Please try again.'}
              </AlertDescription>
            </>
          )}
        </Alert>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-fresh-mint" />
            <p className="font-fredoka font-semibold text-graphite">Job Summary</p>
          </div>
          <div className="space-y-1 text-sm font-verdana text-gray-700">
            <p><span className="font-semibold">Estimated Hours:</span> {booking.hours}h</p>
            <p><span className="font-semibold">Actual Hours:</span> {actualHours}h</p>
            {booking.snapshot_total_rate_cph && (
              <p><span className="font-semibold">Rate:</span> {booking.snapshot_total_rate_cph} credits/hour</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm font-verdana">
          <p className="font-semibold mb-2">Before Ending:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Ensure all tasks are completed</li>
            <li>Double-check all cleaned areas</li>
            <li>Collect any personal items or equipment</li>
            <li>Your payment will be processed after client approval</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={checkLocation}
            disabled={checking}
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Refresh Location
          </Button>
          <Button
            onClick={handleEndJob}
            disabled={!isNearby || ending}
            className="flex-1 brand-gradient"
            size="lg"
          >
            {ending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Ending...
              </>
            ) : (
              <>
                <Square className="w-5 h-5 mr-2" />
                End Job
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}