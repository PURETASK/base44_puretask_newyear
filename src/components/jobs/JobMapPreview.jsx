import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JobMapPreview({ job }) {
  const openInMaps = () => {
    if (job.latitude && job.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, '_blank');
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 mb-1">{job.address}</p>
            {job.latitude && job.longitude && (
              <p className="text-xs text-slate-500 mb-2">
                GPS: {job.latitude.toFixed(6)}, {job.longitude.toFixed(6)}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={openInMaps}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}