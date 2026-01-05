import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function CopyLastBookingButton({ userEmail, onCopy }) {
  const [lastBooking, setLastBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLastBooking();
  }, [userEmail]);

  const loadLastBooking = async () => {
    try {
      const bookings = await base44.entities.Booking.filter(
        { client_email: userEmail },
        '-created_date',
        1
      );
      
      if (bookings.length > 0) {
        setLastBooking(bookings[0]);
      }
    } catch (error) {
      console.error('Error loading last booking:', error);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!lastBooking) return;

    const copiedData = {
      address: lastBooking.address,
      latitude: lastBooking.latitude,
      longitude: lastBooking.longitude,
      bedrooms: lastBooking.bedrooms,
      bathrooms: lastBooking.bathrooms,
      square_feet: lastBooking.square_feet,
      home_type: lastBooking.home_type,
      has_pets: lastBooking.has_pets,
      parking_instructions: lastBooking.parking_instructions,
      entry_instructions: lastBooking.entry_instructions,
      product_preferences: lastBooking.product_preferences,
      product_allergies: lastBooking.product_allergies
    };

    onCopy(copiedData);
    toast.success('Copied details from your last booking!');
  };

  if (loading || !lastBooking) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className="rounded-full font-fredoka font-semibold border-2 border-blue-300 hover:bg-blue-50 text-blue-700"
    >
      <Copy className="w-4 h-4 mr-2" />
      Copy from Last Booking
    </Button>
  );
}