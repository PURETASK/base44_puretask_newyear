import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, DollarSign } from 'lucide-react';
import { calculateBookingPrice } from './PricingEngine';

/**
 * Live price calculator component
 * Recalculates price whenever booking parameters change
 */
export default function LivePriceCalculator({ 
  draftBookingId, 
  bookingData, 
  onPriceCalculated 
}) {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookingData?.cleaner_email && bookingData?.client_email) {
      calculatePrice();
    }
  }, [
    bookingData?.cleaner_email,
    bookingData?.cleaning_type,
    bookingData?.estimated_hours,
    bookingData?.hours,
    bookingData?.date,
    bookingData?.start_time,
    JSON.stringify(bookingData?.additional_services),
    bookingData?.recurrence_frequency
  ]);

  const calculatePrice = async () => {
    setLoading(true);
    try {
      const result = await calculateBookingPrice(bookingData);
      setPrice(result);
      
      if (onPriceCalculated) {
        onPriceCalculated(result);
      }

      // If draftBookingId provided, update the draft
      if (draftBookingId) {
        await base44.entities.DraftBooking.update(draftBookingId, {
          estimated_price_credits: result.estimated_price_credits,
          estimated_price_usd: result.estimated_price_usd,
          applied_pricing_labels: result.applied_pricing_labels,
          pricing_breakdown: result.pricing_breakdown
        });
      }
    } catch (error) {
      console.error('Price calculation error:', error);
    }
    setLoading(false);
  };

  if (!price) {
    return (
      <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-verdana mb-1">Estimated Total</p>
            <p className="text-4xl font-fredoka font-bold text-puretask-blue">
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin inline" />
              ) : (
                `$${price.estimated_price_usd.toFixed(2)}`
              )}
            </p>
            <p className="text-xs text-gray-500 font-verdana mt-1">
              {price.estimated_price_credits} credits
            </p>
          </div>
          <DollarSign className="w-16 h-16 text-puretask-blue opacity-30" />
        </div>

        {price.applied_pricing_labels && price.applied_pricing_labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {price.applied_pricing_labels.map((label, index) => (
              <div key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-verdana">
                ✓ {label}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}