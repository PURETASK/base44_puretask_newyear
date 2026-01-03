import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, MapPin, Plus, X, Briefcase } from 'lucide-react';
import AISettingTooltip from './AISettingTooltip';

const SPECIALTY_OPTIONS = [
  'Pet-Friendly',
  'Eco-Warrior',
  'Deep Clean Expert',
  'Move-Out Specialist',
  'Same-Day Available',
  'Senior-Friendly',
  'Child-Safe Products',
  'Allergy-Conscious',
  'Organization Pro',
  'Post-Construction'
];

const ADDITIONAL_SERVICES = [
  { value: 'windows', label: 'Windows' },
  { value: 'blinds', label: 'Blinds' },
  { value: 'oven', label: 'Oven' },
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'light_fixtures', label: 'Light Fixtures' },
  { value: 'inside_cabinets', label: 'Inside Cabinets' },
  { value: 'baseboards', label: 'Baseboards' },
  { value: 'laundry', label: 'Laundry' }
];

export default function SmartMatchingSettings({ settings, onChange }) {
  const [newLocation, setNewLocation] = useState('');

  const handleSpecialtyToggle = (specialty) => {
    const current = settings?.specialty_tags || [];
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty];
    onChange({ ...settings, specialty_tags: updated });
  };

  const handleServiceToggle = (service) => {
    const current = settings?.offers_additional_services || [];
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    onChange({ ...settings, offers_additional_services: updated });
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const current = settings?.service_locations || [];
      onChange({ ...settings, service_locations: [...current, newLocation.trim()] });
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (location) => {
    const current = settings?.service_locations || [];
    onChange({ ...settings, service_locations: current.filter(l => l !== location) });
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Users className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-fredoka font-semibold text-gray-800">Smart Matching is Always Active</p>
            <p className="text-sm font-verdana text-gray-700 mt-1">
              These settings help AI match you with ideal clients based on your expertise and preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Specialties Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-puretask-blue" />
            My Expertise Areas
          </CardTitle>
          <CardDescription className="font-verdana">
            AI prioritizes matching you with clients looking for these specialties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((specialty) => {
              const isSelected = settings?.specialty_tags?.includes(specialty);
              return (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className={`px-4 py-2 rounded-full font-fredoka text-sm transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Services Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka text-lg">Additional Services I Provide</CardTitle>
          <CardDescription className="font-verdana">
            AI matches you with clients requesting these add-ons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ADDITIONAL_SERVICES.map((service) => {
              const isSelected = settings?.offers_additional_services?.includes(service.value);
              return (
                <div key={service.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.value}
                    checked={isSelected}
                    onCheckedChange={() => handleServiceToggle(service.value)}
                  />
                  <Label htmlFor={service.value} className="font-verdana cursor-pointer">
                    {service.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service Locations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Areas I Serve
            <AISettingTooltip
              title="Service Locations"
              description="Geographic areas where you provide cleaning services"
              benefits={[
                'AI prioritizes jobs in these areas',
                'Better job matching',
                'Less travel time'
              ]}
              considerations={[
                'Be specific with area names',
                'Too many areas may dilute focus'
              ]}
            />
          </CardTitle>
          <CardDescription className="font-verdana">
            AI prioritizes jobs in these locations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Location Input */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Downtown Seattle"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
              className="flex-1"
            />
            <Button onClick={handleAddLocation} className="brand-gradient text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Location Chips */}
          <div className="flex flex-wrap gap-2">
            {settings?.service_locations?.length > 0 ? (
              settings.service_locations.map((location, idx) => (
                <Badge key={idx} className="bg-green-100 text-green-800 pr-1 flex items-center gap-1">
                  {location}
                  <button
                    onClick={() => handleRemoveLocation(location)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500 font-verdana">No locations added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}