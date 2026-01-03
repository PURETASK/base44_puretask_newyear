import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { 
  Wind,
  Grid,
  ChefHat,
  Refrigerator,
  Lightbulb,
  Package,
  Home,
  Zap,
  DollarSign,
  Save,
  Info,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ADDITIONAL_SERVICES = [
  {
    key: 'windows',
    icon: Wind,
    name: 'Windows',
    unit: 'per window',
    minCredits: 30,
    maxCredits: 70,
    color: '#66B3FF',
    bgColor: '#EFF6FF'
  },
  {
    key: 'blinds',
    icon: Grid,
    name: 'Blinds',
    unit: 'per set (2 blinds)',
    minCredits: 80,
    maxCredits: 120,
    color: '#00D4FF',
    bgColor: '#ECFEFF'
  },
  {
    key: 'oven',
    icon: ChefHat,
    name: 'Oven',
    unit: 'per oven',
    minCredits: 200,
    maxCredits: 400,
    color: '#F59E0B',
    bgColor: '#FFFBEB'
  },
  {
    key: 'refrigerator',
    icon: Refrigerator,
    name: 'Refrigerator',
    unit: 'per refrigerator',
    minCredits: 150,
    maxCredits: 300,
    color: '#28C76F',
    bgColor: '#F0FDF4'
  },
  {
    key: 'light_fixtures',
    icon: Lightbulb,
    name: 'Light Fixtures',
    unit: 'per fixture',
    minCredits: 50,
    maxCredits: 150,
    color: '#A855F7',
    bgColor: '#FAF5FF'
  },
  {
    key: 'inside_cabinets',
    icon: Package,
    name: 'Inside Cabinets',
    unit: 'per cabinet section',
    minCredits: 100,
    maxCredits: 200,
    color: '#EC4899',
    bgColor: '#FDF2F8'
  },
  {
    key: 'baseboards',
    icon: Home,
    name: 'Baseboards',
    unit: 'per home',
    minCredits: 200,
    maxCredits: 400,
    color: '#14B8A6',
    bgColor: '#F0FDFA'
  },
  {
    key: 'laundry',
    icon: Zap,
    name: 'Laundry',
    unit: 'per load',
    minCredits: 150,
    maxCredits: 250,
    color: '#F43F5E',
    bgColor: '#FFF1F2'
  }
];

export default function AdditionalServicesPricingEditor({ cleanerProfile, onUpdate }) {
  const [pricing, setPricing] = useState(cleanerProfile.additional_service_pricing || {});
  const [offeredServices, setOfferedServices] = useState(() => {
    const offered = {};
    ADDITIONAL_SERVICES.forEach(service => {
      offered[service.key] = pricing[service.key] !== undefined && pricing[service.key] > 0;
    });
    return offered;
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggleService = (serviceKey) => {
    setOfferedServices(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
    
    // If unchecking, clear the price
    if (offeredServices[serviceKey]) {
      setPricing(prev => {
        const newPricing = { ...prev };
        delete newPricing[serviceKey];
        return newPricing;
      });
    }
  };

  const handlePriceChange = (serviceKey, value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setPricing({ ...pricing, [serviceKey]: undefined });
    } else {
      setPricing({ ...pricing, [serviceKey]: numValue });
    }
  };

  const validatePricing = () => {
    for (const service of ADDITIONAL_SERVICES) {
      if (offeredServices[service.key]) {
        const price = pricing[service.key];
        if (!price || price < service.minCredits || price > service.maxCredits) {
          setError(`${service.name}: Please set a price between ${service.minCredits} and ${service.maxCredits} credits`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    if (!validatePricing()) {
      return;
    }

    // Only save prices for services that are offered
    const finalPricing = {};
    Object.keys(offeredServices).forEach(key => {
      if (offeredServices[key] && pricing[key]) {
        finalPricing[key] = pricing[key];
      }
    });

    setLoading(true);
    try {
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        additional_service_pricing: finalPricing
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating pricing:', err);
      setError('Failed to save pricing. Please try again.');
    }
    setLoading(false);
  };

  const getTierMultiplier = () => {
    const tier = cleanerProfile.tier || 'Developing';
    switch(tier) {
      case 'Developing': return { low: 0.7, high: 0.85 };
      case 'Semi Pro': return { low: 0.85, high: 1.0 };
      case 'Pro': return { low: 1.0, high: 1.15 };
      case 'Elite': return { low: 1.15, high: 1.3 };
      default: return { low: 1.0, high: 1.0 };
    }
  };

  const multiplier = getTierMultiplier();

  return (
    <Card className="border-0 shadow-xl rounded-2xl" style={{ background: 'linear-gradient(135deg, #F7F9FC 0%, #FFFFFF 100%)' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 font-fredoka text-2xl" style={{ color: '#1D2533' }}>
              <DollarSign className="w-8 h-8" style={{ color: '#66B3FF' }} />
              Additional Services Pricing
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 font-verdana">
              Select which services you offer and set your prices
            </p>
          </div>
          <Badge className="font-fredoka" style={{ backgroundColor: '#66B3FF', color: 'white' }}>
            {cleanerProfile.tier || 'Developing'} Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="rounded-2xl border-2" style={{ backgroundColor: '#EFF6FF', borderColor: '#66B3FF' }}>
          <Info className="w-5 h-5" style={{ color: '#66B3FF' }} />
          <AlertTitle className="font-fredoka font-bold" style={{ color: '#1D2533' }}>
            Pricing Tips for {cleanerProfile.tier || 'Developing'} Tier
          </AlertTitle>
          <AlertDescription className="mt-2 font-verdana text-gray-700">
            <p className="mb-2">
              Based on your tier, we recommend pricing at <strong>{Math.round(multiplier.low * 100)}%-{Math.round(multiplier.high * 100)}%</strong> of the suggested ranges below.
            </p>
            <p className="text-xs">
              💡 Check the services you offer, then set your price. These are one-time charges added to the total booking cost.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-4">
          {ADDITIONAL_SERVICES.map((service) => {
            const suggestedMin = Math.round(service.minCredits * multiplier.low);
            const suggestedMax = Math.round(service.maxCredits * multiplier.high);
            const currentPrice = pricing[service.key];
            const isOffered = offeredServices[service.key];

            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-2 hover:shadow-lg transition-all rounded-2xl ${
                  isOffered ? 'ring-2' : ''
                }`} style={{ 
                  backgroundColor: service.bgColor, 
                  borderColor: service.color,
                  ringColor: isOffered ? service.color : 'transparent'
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isOffered}
                          onChange={() => handleToggleService(service.key)}
                          className="w-5 h-5 rounded border-2"
                          style={{ accentColor: service.color }}
                        />
                        <div>
                          <p className="font-fredoka font-bold" style={{ color: '#1D2533' }}>{service.name}</p>
                          <p className="text-xs text-gray-600 font-verdana">{service.unit}</p>
                        </div>
                      </label>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: service.color }}>
                        <service.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {isOffered && (
                      <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: service.color }}>
                        <div className="flex items-center justify-between text-xs font-verdana text-gray-600">
                          <span>Suggested range:</span>
                          <span className="font-semibold" style={{ color: service.color }}>
                            {suggestedMin}-{suggestedMax} credits
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-verdana" style={{ color: '#1D2533' }}>Your Price</label>
                          <div className="flex-1 relative">
                            <Input
                              type="number"
                              value={currentPrice || ''}
                              onChange={(e) => handlePriceChange(service.key, e.target.value)}
                              placeholder={`${suggestedMin}-${suggestedMax}`}
                              min={service.minCredits}
                              max={service.maxCredits}
                              className="pr-16 font-verdana text-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-verdana">
                              credits
                            </span>
                          </div>
                        </div>

                        {currentPrice && (
                          <p className="text-xs font-verdana" style={{ color: service.color }}>
                            ≈ ${(currentPrice / 10).toFixed(2)} USD per {service.unit.replace('per ', '')}
                          </p>
                        )}
                      </div>
                    )}

                    {!isOffered && (
                      <p className="text-xs text-gray-500 font-verdana text-center mt-2">
                        Check to offer this service
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription className="font-verdana">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="rounded-2xl" style={{ backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }}>
            <CheckCircle className="w-5 h-5" style={{ color: '#28C76F' }} />
            <AlertDescription className="font-verdana" style={{ color: '#1D2533' }}>
              Pricing saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="rounded-full font-fredoka font-semibold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Services & Pricing
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}