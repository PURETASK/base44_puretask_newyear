import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2 } from 'lucide-react';

export default function LocationRecommender({ currentAddress, onLocationsSelected }) {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAddress) {
      generateRecommendations();
    }
  }, [currentAddress]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Parse the address to extract city/area
      const addressParts = currentAddress.split(',').map(part => part.trim());
      const city = addressParts[addressParts.length - 3] || ''; // Usually city is 3rd from end
      const state = addressParts[addressParts.length - 2] || '';

      // Generate nearby location recommendations
      // In a real app, you'd use a geocoding API or database
      const nearby = [
        city,
        `${city} Metro Area`,
        `Greater ${city}`,
        state
      ].filter(loc => loc);

      setRecommendations([...new Set(nearby)]); // Remove duplicates
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    }
    setLoading(false);
  };

  const toggleLocation = (location) => {
    const newSelected = selectedLocations.includes(location)
      ? selectedLocations.filter(loc => loc !== location)
      : [...selectedLocations, location];
    
    setSelectedLocations(newSelected);
    if (onLocationsSelected) {
      onLocationsSelected(newSelected);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="w-4 h-4 text-emerald-500" />
        <span className="font-medium">Recommended Service Areas:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {recommendations.map((location, idx) => (
          <Badge
            key={idx}
            variant={selectedLocations.includes(location) ? 'default' : 'outline'}
            className={`cursor-pointer transition-all ${
              selectedLocations.includes(location)
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'hover:bg-emerald-50'
            }`}
            onClick={() => toggleLocation(location)}
          >
            {location}
          </Badge>
        ))}
      </div>
      {selectedLocations.length > 0 && (
        <p className="text-xs text-slate-500">
          Selected {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}