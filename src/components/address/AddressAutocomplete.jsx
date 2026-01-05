import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onLocationSelect,
  label = "Address",
  placeholder = "Start typing your address...",
  required = false 
}) {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value || '');
    }
  }, [value]);

  useEffect(() => {
    const searchAddress = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=us&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to search addresses');
        }

        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (err) {
        console.error('Error searching addresses:', err);
        setError('Failed to search addresses. Please try again.');
      }
      
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchAddress, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (onChange) onChange(newValue);
    setSelectedLocation(null);
  };

  const handleSelectSuggestion = (suggestion) => {
    const address = suggestion.display_name;
    const addressDetails = suggestion.address || {};
    
    setSearchQuery(address);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Auto-fill city and zip from suggestion
    if (addressDetails.city || addressDetails.town || addressDetails.village) {
      setCity(addressDetails.city || addressDetails.town || addressDetails.village);
    }
    if (addressDetails.postcode) {
      setZipCode(addressDetails.postcode);
    }
    
    const location = {
      address,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      place_id: suggestion.place_id
    };
    
    setSelectedLocation(location);
    setError('');
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    if (onChange) {
      onChange(address);
    }
  };

  return (
    <div className="space-y-2 relative">
      {label && (
        <label className="text-base font-fredoka font-semibold block mb-2" style={{ color: '#1D2533' }}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Single Address Input with Autocomplete */}
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required}
          className="font-verdana pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-puretask-blue" />
          </div>
        )}
        {selectedLocation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-puretask-blue rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-puretask-blue mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-verdana text-graphite">
                    {suggestion.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-verdana">{error}</span>
        </div>
      )}

      {selectedLocation && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-verdana">
          <MapPin className="w-4 h-4" />
          Address verified ✓
        </div>
      )}

      {/* City and Zip Code Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="city" className="text-sm font-verdana block mb-1" style={{ color: '#1D2533' }}>City</label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            required={required}
            className="font-verdana"
          />
        </div>
        <div>
          <label htmlFor="zip-code" className="text-sm font-verdana block mb-1" style={{ color: '#1D2533' }}>Zip Code</label>
          <Input
            id="zip-code"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="12345"
            required={required}
            maxLength={5}
            pattern="[0-9]{5}"
            className="font-verdana"
          />
        </div>
      </div>

      {/* Map Display */}
      {selectedLocation && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #86EFAC' }}>
          <div className="px-4 py-2" style={{ backgroundColor: '#DCFCE7', borderBottom: '1px solid #86EFAC' }}>
            <p className="text-sm font-fredoka font-semibold flex items-center gap-2" style={{ color: '#15803D' }}>
              <MapPin className="w-4 h-4" />
              Verified Location
            </p>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <MapContainer
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              whenReady={(map) => { map.target.invalidateSize(); }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-fredoka font-semibold mb-1" style={{ color: '#1D2533' }}>Your Location</p>
                    <p className="font-verdana text-gray-600">{selectedLocation.address}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}