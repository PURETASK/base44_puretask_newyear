import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function OfferConditionsBuilder({ offerType, conditions, onChange }) {
  const updateCondition = (key, value) => {
    const newConditions = { ...conditions };
    
    // Convert value to appropriate type
    if (value === '') {
      delete newConditions[key];
    } else if (key === 'min_bookings' || key === 'min_services') {
      newConditions[key] = parseInt(value);
    } else if (key === 'is_first_booking' || key === 'is_recurring') {
      newConditions[key] = value === 'true';
    } else {
      newConditions[key] = value;
    }
    
    onChange(newConditions);
  };

  const renderMultiBookingFields = () => (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50 rounded-xl">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 font-verdana">
          Multi-booking offers apply when clients book multiple appointments at once.
        </AlertDescription>
      </Alert>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">Minimum Bookings Required</Label>
        <Input
          type="number"
          min="1"
          value={conditions.min_bookings || ''}
          onChange={(e) => updateCondition('min_bookings', e.target.value)}
          placeholder="e.g., 3"
          className="font-verdana"
        />
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          Client must book at least this many appointments to qualify
        </p>
      </div>
    </div>
  );

  const renderMultiServiceFields = () => (
    <div className="space-y-4">
      <Alert className="border-purple-200 bg-purple-50 rounded-xl">
        <Info className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900 font-verdana">
          Multi-service offers apply when clients add multiple services to one booking.
        </AlertDescription>
      </Alert>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">Minimum Services Required</Label>
        <Input
          type="number"
          min="1"
          value={conditions.min_services || ''}
          onChange={(e) => updateCondition('min_services', e.target.value)}
          placeholder="e.g., 2"
          className="font-verdana"
        />
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          Client must add at least this many additional services
        </p>
      </div>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">Required Service Categories (comma-separated)</Label>
        <Input
          value={conditions.service_categories || ''}
          onChange={(e) => updateCondition('service_categories', e.target.value)}
          placeholder="e.g., windows,oven"
          className="font-verdana"
        />
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          Optional: Specific services that must be included
        </p>
      </div>
    </div>
  );

  const renderUpgradeUpsellFields = () => (
    <div className="space-y-4">
      <Alert className="border-green-200 bg-green-50 rounded-xl">
        <Info className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-sm text-green-900 font-verdana">
          Upgrade offers encourage clients to choose premium cleaning types.
        </AlertDescription>
      </Alert>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">From Cleaning Type</Label>
        <Input
          value={conditions.from_type || ''}
          onChange={(e) => updateCondition('from_type', e.target.value)}
          placeholder="e.g., basic"
          className="font-verdana"
        />
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          The basic cleaning type to upgrade from
        </p>
      </div>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">To Cleaning Type</Label>
        <Input
          value={conditions.to_type || ''}
          onChange={(e) => updateCondition('to_type', e.target.value)}
          placeholder="e.g., deep"
          className="font-verdana"
        />
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          The premium cleaning type to upgrade to
        </p>
      </div>
    </div>
  );

  const renderSingleOfferFields = () => (
    <div className="space-y-4">
      <Alert className="border-orange-200 bg-orange-50 rounded-xl">
        <Info className="w-4 h-4 text-orange-600" />
        <AlertDescription className="text-sm text-orange-900 font-verdana">
          Single offers are promotional discounts that apply based on specific conditions.
        </AlertDescription>
      </Alert>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">First Booking Only?</Label>
        <select
          value={conditions.is_first_booking !== undefined ? conditions.is_first_booking.toString() : ''}
          onChange={(e) => updateCondition('is_first_booking', e.target.value)}
          className="w-full rounded-full px-4 py-2 border border-gray-300 font-verdana"
        >
          <option value="">Not specified</option>
          <option value="true">Yes - First booking only</option>
          <option value="false">No - All bookings</option>
        </select>
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          Limit this offer to first-time customers only
        </p>
      </div>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">Recurring Bookings Only?</Label>
        <select
          value={conditions.is_recurring !== undefined ? conditions.is_recurring.toString() : ''}
          onChange={(e) => updateCondition('is_recurring', e.target.value)}
          className="w-full rounded-full px-4 py-2 border border-gray-300 font-verdana"
        >
          <option value="">Not specified</option>
          <option value="true">Yes - Recurring bookings only</option>
          <option value="false">No - One-time bookings only</option>
        </select>
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          Apply this offer only to recurring/subscription bookings
        </p>
      </div>
      
      <div>
        <Label className="font-fredoka font-medium text-graphite">Minimum Booking Value ($)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={conditions.min_value || ''}
          onChange={(e) => updateCondition('min_value', e.target.value)}
          placeholder="e.g., 100"
          className="font-verdana"
        />
        <p className="text-xs text-gray-500 mt-1 font-verdana">
          Optional: Minimum booking value to qualify for this offer
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Label className="font-fredoka font-medium text-graphite text-lg">Offer Conditions</Label>
      
      {offerType === 'multi_booking' && renderMultiBookingFields()}
      {offerType === 'multi_service' && renderMultiServiceFields()}
      {offerType === 'upgrade_upsell' && renderUpgradeUpsellFields()}
      {offerType === 'single_offer' && renderSingleOfferFields()}
      
      {!offerType && (
        <Alert className="border-gray-200 bg-gray-50 rounded-xl">
          <Info className="w-4 h-4 text-gray-600" />
          <AlertDescription className="text-sm text-gray-700 font-verdana">
            Select an offer type above to configure conditions
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}