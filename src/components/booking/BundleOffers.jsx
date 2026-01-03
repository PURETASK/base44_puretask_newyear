import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Tag, CheckCircle, TrendingUp, Package, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BundleOffers({ 
  bookingData, 
  totalCredits, 
  onApplyBundle 
}) {
  const [availableOffers, setAvailableOffers] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, [bookingData]);

  const loadOffers = async () => {
    try {
      const allOffers = await base44.entities.BundleOffer.filter({
        is_active: true
      });

      // Filter offers based on current booking context
      const applicable = allOffers.filter(offer => {
        // Check if offer is still valid
        if (offer.valid_until) {
          const validDate = new Date(offer.valid_until);
          if (validDate < new Date()) return false;
        }

        // Check offer conditions
        if (offer.offer_type === 'multi_service' && bookingData?.additional_services) {
          const serviceCount = Object.keys(bookingData.additional_services).length;
          const requiredCount = offer.conditions?.min_services || 3;
          return serviceCount >= requiredCount;
        }

        if (offer.offer_type === 'upgrade_upsell' && bookingData?.cleaning_type === 'basic') {
          return true;
        }

        if (offer.offer_type === 'multi_booking') {
          // Could check booking history here
          return true;
        }

        return false;
      });

      setAvailableOffers(applicable);
    } catch (error) {
      console.error('Error loading bundle offers:', error);
    }
    setLoading(false);
  };

  const calculateDiscount = (offer) => {
    if (offer.discount_percentage) {
      return Math.round(totalCredits * (offer.discount_percentage / 100));
    }
    if (offer.discount_amount) {
      return Math.round(offer.discount_amount * 10); // Convert USD to credits
    }
    return 0;
  };

  const handleSelectBundle = (offer) => {
    const discount = calculateDiscount(offer);
    setSelectedBundle(offer);
    if (onApplyBundle) {
      onApplyBundle({
        offerId: offer.id,
        offerName: offer.offer_name,
        discountCredits: discount,
        discountPercentage: offer.discount_percentage || 0
      });
    }
  };

  const handleRemoveBundle = () => {
    setSelectedBundle(null);
    if (onApplyBundle) {
      onApplyBundle(null);
    }
  };

  if (loading || availableOffers.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-300 shadow-xl rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Tag className="w-6 h-6 text-purple-600" />
          Special Offers Available!
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <AnimatePresence>
          {availableOffers.map((offer, idx) => {
            const discount = calculateDiscount(offer);
            const isSelected = selectedBundle?.id === offer.id;

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-2 transition-all cursor-pointer rounded-2xl ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-100 shadow-lg scale-105' 
                    : 'border-purple-200 bg-white hover:shadow-md hover:scale-102'
                }`}
                onClick={() => isSelected ? handleRemoveBundle() : handleSelectBundle(offer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {offer.offer_type === 'multi_service' && <Package className="w-4 h-4 text-purple-600" />}
                          {offer.offer_type === 'multi_booking' && <Calendar className="w-4 h-4 text-purple-600" />}
                          {offer.offer_type === 'upgrade_upsell' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                          
                          <p className="font-fredoka font-bold text-graphite">{offer.offer_name}</p>
                          
                          {isSelected && (
                            <Badge className="bg-purple-600 text-white rounded-full font-fredoka">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Applied
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 font-verdana mb-3">
                          {offer.display_message}
                        </p>

                        {offer.valid_until && (
                          <p className="text-xs text-gray-500 font-verdana">
                            Expires: {new Date(offer.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-fredoka text-lg px-4 py-2 rounded-full">
                          -{discount}
                        </Badge>
                        <p className="text-xs text-gray-600 font-verdana mt-1">credits off</p>
                        <p className="text-xs text-gray-500 font-verdana">
                          ≈ ${(discount / 10).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-3 border-t border-purple-300"
                      >
                        <div className="flex items-center justify-between text-sm font-verdana">
                          <span className="text-purple-900 font-semibold">Your savings:</span>
                          <span className="text-xl font-fredoka font-bold text-purple-600">
                            {discount} credits
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {selectedBundle && (
          <Alert className="border-purple-300 bg-purple-100 rounded-2xl">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <AlertDescription className="text-purple-900 font-verdana font-semibold">
              Bundle discount applied! You're saving {calculateDiscount(selectedBundle)} credits.
            </AlertDescription>
          </Alert>
        )}

        {!selectedBundle && availableOffers.length > 1 && (
          <p className="text-xs text-center text-gray-500 font-verdana">
            💡 Click an offer to apply it to your booking
          </p>
        )}
      </CardContent>
    </Card>
  );
}