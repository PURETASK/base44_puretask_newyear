import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  MapPin, Shield, ExternalLink, AlertTriangle, CheckCircle, 
  Eye, Lock, Navigation, Home
} from 'lucide-react';
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

export default function AddressVerification() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState({
    addressCorrect: false,
    accessInstructions: false,
    parkingAcknowledged: false,
    homeSecure: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Get booking data from session storage (passed from BookingFlow)
      const storedData = sessionStorage.getItem('pendingBooking');
      if (!storedData) {
        navigate(createPageUrl('BrowseCleaners'));
        return;
      }

      const data = JSON.parse(storedData);
      setBookingData(data);

      // Validate coordinates exist
      if (!data.latitude || !data.longitude) {
        setError('Address coordinates are missing. Please go back and re-enter your address.');
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading verification page:', showToast: false });
      navigate(createPageUrl('BrowseCleaners'));
    }
    setLoading(false);
  };

  const allConfirmed = Object.values(confirmed).every(v => v === true);

  const handleProceed = async () => {
    if (!allConfirmed) {
      setError('Please confirm all security checkpoints before proceeding.');
      return;
    }

    setError('');

    try {
      // Create the booking
      const newBooking = await base44.entities.Booking.create({
        client_email: user.email,
        cleaner_email: bookingData.cleanerEmail,
        date: bookingData.date,
        start_time: bookingData.time,
        hours: bookingData.hours,
        tasks: bookingData.tasks,
        task_quantities: bookingData.taskQuantities || {},
        address: bookingData.address,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        product_allergies: bookingData.product_allergies || '',
        product_preferences: bookingData.product_preferences || '',
        total_price: bookingData.totalPrice,
        status: 'available',
        parking_instructions: bookingData.parkingInstructions || '',
        entry_instructions: bookingData.entryInstructions || ''
      });

      // Clear session storage
      sessionStorage.removeItem('pendingBooking');

      // If recurring booking was requested
      if (bookingData.wantsRecurring) {
        sessionStorage.setItem('setupRecurring', JSON.stringify({
          bookingId: newBooking.id,
          ...bookingData
        }));
      }

      // Proceed to payment
      navigate(createPageUrl(`PaymentCheckout?bookingId=${newBooking.id}`));
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-700">Loading verification...</p>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${bookingData.latitude},${bookingData.longitude}`;
  const googleMapsStaticImage = `https://maps.googleapis.com/maps/api/staticmap?center=${bookingData.latitude},${bookingData.longitude}&zoom=16&size=600x400&markers=color:red%7C${bookingData.latitude},${bookingData.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-emerald-500" />
            <h1 className="text-4xl font-bold text-slate-900">Address Verification</h1>
          </div>
          <p className="text-lg text-slate-600">
            Please confirm your cleaning location for security purposes
          </p>
          <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
            <Lock className="w-3 h-3 mr-1" />
            Secure Verification Step
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Address Display */}
        <Card className="mb-6 border-2 border-emerald-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
              Cleaning Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Address</p>
                <p className="text-xl font-semibold text-slate-900">{bookingData.address}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Latitude</p>
                  <p className="font-mono text-sm text-slate-900">{bookingData.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Longitude</p>
                  <p className="font-mono text-sm text-slate-900">{bookingData.longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="mb-6 border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-6 h-6 text-blue-600" />
                Location Map
              </CardTitle>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span className="text-sm font-medium">Open in Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer
                center={[bookingData.latitude, bookingData.longitude]}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[bookingData.latitude, bookingData.longitude]}>
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-semibold mb-1">Cleaning Location</p>
                      <p className="text-xs text-slate-600">{bookingData.address}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Street View Link */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Eye className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">View Street Level</h3>
                <p className="text-sm text-purple-700 mb-3">
                  See what your property looks like from the street to help your cleaner find it easily
                </p>
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${bookingData.latitude},${bookingData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Open Street View
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Checkpoints */}
        <Card className="mb-6 border-2 border-amber-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-600" />
              Security Verification Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>Why we verify:</strong> Address confirmation helps prevent fraud, ensures cleaners arrive at the correct location, and protects both parties.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Checkpoint 1 */}
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                <Checkbox
                  id="addressCorrect"
                  checked={confirmed.addressCorrect}
                  onCheckedChange={(checked) => setConfirmed({ ...confirmed, addressCorrect: checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="addressCorrect" className="text-base font-semibold cursor-pointer text-slate-900">
                    ✓ I confirm this is the correct address for cleaning
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    The map above accurately shows the property that needs cleaning
                  </p>
                </div>
              </div>

              {/* Checkpoint 2 */}
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                <Checkbox
                  id="accessInstructions"
                  checked={confirmed.accessInstructions}
                  onCheckedChange={(checked) => setConfirmed({ ...confirmed, accessInstructions: checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="accessInstructions" className="text-base font-semibold cursor-pointer text-slate-900">
                    ✓ I will provide clear access instructions
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Including building codes, lockbox information, or entry procedures
                  </p>
                </div>
              </div>

              {/* Checkpoint 3 */}
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                <Checkbox
                  id="parkingAcknowledged"
                  checked={confirmed.parkingAcknowledged}
                  onCheckedChange={(checked) => setConfirmed({ ...confirmed, parkingAcknowledged: checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="parkingAcknowledged" className="text-base font-semibold cursor-pointer text-slate-900">
                    ✓ I acknowledge parking availability
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    If parking is limited or requires payment, I will inform the cleaner in advance
                  </p>
                </div>
              </div>

              {/* Checkpoint 4 */}
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                <Checkbox
                  id="homeSecure"
                  checked={confirmed.homeSecure}
                  onCheckedChange={(checked) => setConfirmed({ ...confirmed, homeSecure: checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="homeSecure" className="text-base font-semibold cursor-pointer text-slate-900">
                    ✓ My home is secure and accessible
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    The property is safe to enter and there are no hazards or access issues
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!allConfirmed}
            className={`flex-1 ${
              allConfirmed
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {allConfirmed ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm & Proceed to Payment
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Complete All Checkpoints
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <Alert className="mt-6 bg-slate-50 border-slate-200">
          <Shield className="w-4 h-4" />
          <AlertDescription className="text-slate-700">
            <strong>Security Notice:</strong> This verification step helps protect both clients and cleaners. Your address information is encrypted and only shared with your assigned cleaner after booking confirmation.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}