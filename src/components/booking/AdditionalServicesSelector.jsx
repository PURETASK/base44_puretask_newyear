import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ADDITIONAL_SERVICES } from '../cleaner/AdditionalServicesPricingEditor';
import { Plus, Minus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdditionalServicesSelector({ 
  cleanerPricing, 
  selectedServices, 
  onServicesChange 
}) {
  const [quantities, setQuantities] = useState(selectedServices || {});

  // Filter to only show services the cleaner offers
  const availableServices = ADDITIONAL_SERVICES.filter(service => 
    cleanerPricing && cleanerPricing[service.key] && cleanerPricing[service.key] > 0
  );

  if (availableServices.length === 0) {
    return null; // Don't show if cleaner doesn't offer any additional services
  }

  const handleQuantityChange = (serviceKey, delta) => {
    const currentQty = quantities[serviceKey] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    const newQuantities = { ...quantities };
    if (newQty === 0) {
      delete newQuantities[serviceKey];
    } else {
      newQuantities[serviceKey] = newQty;
    }
    
    setQuantities(newQuantities);
    onServicesChange(newQuantities);
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(quantities).forEach(key => {
      if (cleanerPricing[key]) {
        total += quantities[key] * cleanerPricing[key];
      }
    });
    return total;
  };

  const totalCredits = calculateTotal();

  return (
    <Card className="border-0 shadow-lg rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
        <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-600" />
          Additional Services (Optional)
        </CardTitle>
        <p className="text-sm text-gray-600 font-verdana mt-2">
          Add extra services to your booking - these are one-time charges
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {availableServices.map((service) => {
            const price = cleanerPricing[service.key];
            const quantity = quantities[service.key] || 0;
            const isSelected = quantity > 0;

            return (
              <motion.div
                key={service.key}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card 
                  className={`border-2 transition-all cursor-pointer rounded-2xl ${
                    isSelected ? 'ring-2 shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{ 
                    backgroundColor: service.bgColor,
                    borderColor: service.color,
                    ringColor: isSelected ? service.color : 'transparent'
                  }}
                  onClick={() => handleQuantityChange(service.key, quantity === 0 ? 1 : 0)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: service.color }}>
                          <service.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-fredoka font-bold text-graphite">{service.name}</p>
                          <p className="text-xs text-gray-600 font-verdana">{service.unit}</p>
                        </div>
                      </div>
                      <Badge className="font-fredoka font-semibold" style={{ backgroundColor: service.color, color: 'white' }}>
                        {price} credits
                      </Badge>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t"
                          style={{ borderColor: service.color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-fredoka font-semibold text-graphite">Quantity</span>
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(service.key, -1);
                                }}
                                className="w-8 h-8 rounded-full p-0"
                                style={{ borderColor: service.color, color: service.color }}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-lg font-fredoka font-bold" style={{ color: service.color }}>
                                {quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(service.key, 1);
                                }}
                                className="w-8 h-8 rounded-full p-0"
                                style={{ borderColor: service.color, color: service.color }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 font-verdana mt-2 text-right">
                            Subtotal: {quantity * price} credits (${(quantity * price).toFixed(2)})
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isSelected && (
                      <p className="text-xs text-gray-500 font-verdana text-center mt-2">
                        Click to add
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {totalCredits > 0 && (
          <Alert className="rounded-2xl border-2" style={{ backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }}>
            <AlertDescription className="flex items-center justify-between font-verdana">
              <span className="font-fredoka font-bold text-graphite">Additional Services Total:</span>
              <div className="text-right">
                <p className="text-2xl font-fredoka font-bold" style={{ color: '#28C76F' }}>
                  {totalCredits} credits
                </p>
                <p className="text-sm text-gray-600">
                  ≈ ${totalCredits.toFixed(2)}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}