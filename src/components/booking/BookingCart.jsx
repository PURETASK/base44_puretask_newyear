import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Trash2, Edit, Calendar, Clock, Home, Sparkles, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingCart({ 
  bookings, 
  onRemoveBooking, 
  onEditBooking, 
  appliedOffer,
  totalOriginalPrice,
  totalDiscount,
  finalTotalPrice 
}) {
  
  const getServiceTypeLabel = (type) => {
    const labels = {
      basic: 'Basic Cleaning',
      deep: 'Deep Cleaning',
      moveout: 'Move-Out Cleaning'
    };
    return labels[type] || type;
  };

  const getServiceTypeBadge = (type) => {
    const styles = {
      basic: 'bg-blue-100 text-blue-800',
      deep: 'bg-amber-100 text-amber-800',
      moveout: 'bg-purple-100 text-purple-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  if (bookings.length === 0) {
    return (
      <Card className="border-2 border-gray-200 rounded-2xl">
        <CardContent className="py-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-fredoka font-bold text-graphite mb-2">
            Your Cart is Empty
          </h3>
          <p className="text-sm text-gray-600 font-verdana">
            Add bookings to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-puretask-blue rounded-2xl shadow-lg sticky top-20">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-puretask-blue" />
          Booking Cart ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Bookings List */}
        {bookings.map((booking, index) => (
          <div 
            key={index} 
            className="border-2 border-gray-200 rounded-xl p-3 hover:border-puretask-blue transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <Badge className={`${getServiceTypeBadge(booking.serviceType)} font-fredoka`}>
                {getServiceTypeLabel(booking.serviceType)}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditBooking(index)}
                  className="h-7 w-7 p-0 hover:bg-blue-50"
                >
                  <Edit className="w-3 h-3 text-puretask-blue" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveBooking(index)}
                  className="h-7 w-7 p-0 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1 text-sm font-verdana">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-3 h-3" />
                {format(new Date(booking.date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-3 h-3" />
                {booking.time} • {booking.hours}h
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Home className="w-3 h-3" />
                {booking.address.split(',')[0]}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t flex justify-between items-center">
              <span className="text-xs text-gray-500 font-verdana">Estimated</span>
              <span className="font-fredoka font-bold text-puretask-blue">
                {booking.estimatedCredits} credits
              </span>
            </div>
          </div>
        ))}

        {/* Applied Offer */}
        {appliedOffer && (
          <Alert className="border-green-200 bg-green-50 rounded-xl">
            <Tag className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-sm font-verdana">
              <span className="font-semibold text-green-800">{appliedOffer.offer_name}</span>
              <br />
              <span className="text-green-700">{appliedOffer.display_message}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Summary */}
        <div className="space-y-2 pt-4 border-t-2 border-gray-200">
          <div className="flex justify-between text-sm font-verdana">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-graphite font-semibold">{totalOriginalPrice} credits</span>
          </div>
          
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm font-verdana">
              <span className="text-green-600">Discount:</span>
              <span className="text-green-600 font-semibold">-{totalDiscount} credits</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t">
            <span className="font-fredoka font-bold text-lg text-graphite">Total:</span>
            <div className="text-right">
              <span className="font-fredoka font-bold text-2xl text-puretask-blue">
                {finalTotalPrice}
              </span>
              <span className="text-sm text-gray-500 font-verdana ml-1">credits</span>
              <div className="text-xs text-gray-500 font-verdana">
                ≈ ${(finalTotalPrice / 10).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}