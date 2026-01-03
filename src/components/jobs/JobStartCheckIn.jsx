import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JobStartCheckIn({ booking, onSuccess }) {
  const [location, setLocation] = useState(null);
  const [checking, setChecking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = () => {
    setChecking(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setLocation({ lat: userLat, lng: userLng });

          // Calculate distance
          const dist = calculateDistance(
            userLat,
            userLng,
            booking.latitude,
            booking.longitude
          );
          setDistance(dist);

          // Check if within 0.2 miles (roughly 320 meters)
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
    const R = 3959; // Earth radius in miles
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

  const handleStartJob = async () => {
    if (!isNearby) {
      toast.error('You must be at the job location to start the job.');
      return;
    }

    setStarting(true);
    try {
      await base44.entities.Booking.update(booking.id, {
        check_in_time: new Date().toISOString(),
        check_in_location: `${location.lat},${location.lng}`,
        status: 'in_progress'
      });

      toast.success('Job started successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error starting job:', error);
      toast.error('Failed to start job. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-puretask-blue" />
          Start Your Job
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
                You're at the job location! Click "Start Job" to begin.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-verdana">
                {distance !== null 
                  ? `You're ${distance.toFixed(2)} miles away. You must be within 0.2 miles to start the job.`
                  : 'Unable to verify your location. Please try again.'}
              </AlertDescription>
            </>
          )}
        </Alert>

        <div className="bg-system-soft border border-system-border rounded-lg p-4 text-sm font-body">
          <p className="font-heading font-semibold mb-2 text-system-text">Before Starting:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Ensure you're at the correct address</li>
            <li>Have all necessary cleaning supplies ready</li>
            <li>Review any special instructions from the client</li>
            <li>After starting, you'll need to upload "before" photos</li>
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
            onClick={handleStartJob}
            disabled={!isNearby || starting}
            className="flex-1 brand-gradient"
            size="lg"
          >
            {starting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Job
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}