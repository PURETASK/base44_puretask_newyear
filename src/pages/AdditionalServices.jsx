import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Home,
  Zap,
  Wind,
  ChefHat,
  Grid,
  Refrigerator,
  Lightbulb,
  Package,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';

const ADDITIONAL_SERVICES = [
  {
    key: 'windows',
    icon: Wind,
    name: 'Windows',
    description: 'Interior and exterior window cleaning',
    priceRange: '$3-7',
    unit: 'per window',
    credits: '30-70 credits',
    notes: 'Price varies by window size and accessibility',
    tips: [
      'Charge more for exterior windows (higher floors)',
      'Large picture windows warrant higher rates',
      'Include screens in your pricing'
    ],
    color: '#66B3FF',
    bgColor: '#EFF6FF'
  },
  {
    key: 'blinds',
    icon: Grid,
    name: 'Blinds',
    description: 'Dusting and cleaning window blinds',
    priceRange: '$10',
    unit: 'per set (2 blinds)',
    credits: '100 credits',
    notes: 'Set = 2 individual blinds',
    tips: [
      'Deep cleaning may cost more',
      'Consider time for venetian vs. vertical blinds',
      'Charge extra for removal/reinstallation'
    ],
    color: '#00D4FF',
    bgColor: '#ECFEFF'
  },
  {
    key: 'oven',
    icon: ChefHat,
    name: 'Oven',
    description: 'Deep cleaning of oven interior and racks',
    priceRange: '$20-40',
    unit: 'per oven',
    credits: '200-400 credits',
    notes: 'Depends on level of buildup and oven size',
    tips: [
      'Heavily soiled ovens = higher end of range',
      'Include stovetop for complete service',
      'Self-cleaning ovens may take less time'
    ],
    color: '#F59E0B',
    bgColor: '#FFFBEB'
  },
  {
    key: 'refrigerator',
    icon: Refrigerator,
    name: 'Refrigerator',
    description: 'Interior cleaning, shelves, and drawers',
    priceRange: '$15-30',
    unit: 'per refrigerator',
    credits: '150-300 credits',
    notes: 'Full interior and exterior cleaning',
    tips: [
      'Charge more for deep organization',
      'Consider if client empties fridge first',
      'Include freezer for complete service'
    ],
    color: '#28C76F',
    bgColor: '#F0FDF4'
  },
  {
    key: 'light_fixtures',
    icon: Lightbulb,
    name: 'Light Fixtures',
    description: 'Dusting and cleaning light fixtures and ceiling fans',
    priceRange: '$5-15',
    unit: 'per fixture',
    credits: '50-150 credits',
    notes: 'Varies by fixture complexity',
    tips: [
      'Chandeliers = higher rate',
      'Ceiling fans require ladder work',
      'Consider accessibility and height'
    ],
    color: '#A855F7',
    bgColor: '#FAF5FF'
  },
  {
    key: 'inside_cabinets',
    icon: Package,
    name: 'Inside Cabinets',
    description: 'Cleaning inside kitchen or bathroom cabinets',
    priceRange: '$10-20',
    unit: 'per cabinet section',
    credits: '100-200 credits',
    notes: 'Client should empty cabinets first',
    tips: [
      'Charge more if organizing included',
      'Kitchen vs. bathroom pricing',
      'Set expectations about emptying'
    ],
    color: '#EC4899',
    bgColor: '#FDF2F8'
  },
  {
    key: 'baseboards',
    icon: Home,
    name: 'Baseboards',
    description: 'Detailed baseboard cleaning throughout home',
    priceRange: '$20-40',
    unit: 'per home',
    credits: '200-400 credits',
    notes: 'Full home baseboard service',
    tips: [
      'Price by square footage',
      'Include in deep clean packages',
      'Charge per room for spot cleaning'
    ],
    color: '#14B8A6',
    bgColor: '#F0FDFA'
  },
  {
    key: 'laundry',
    icon: Zap,
    name: 'Laundry',
    description: 'Wash, dry, fold client laundry',
    priceRange: '$15-25',
    unit: 'per load',
    credits: '150-250 credits',
    notes: 'Time-based service add-on',
    tips: [
      'Consider machine availability',
      'Set expectations for timing',
      'Charge more for ironing'
    ],
    color: '#F43F5E',
    bgColor: '#FFF1F2'
  }
];

export default function AdditionalServices() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const cleanerEmail = searchParams.get('cleaner');
  
  const [cleaner, setCleaner] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedBooking = localStorage.getItem('bookingDraft');
      if (!savedBooking || !cleanerEmail) {
        navigate(createPageUrl('Home'));
        return;
      }
      
      setBookingData(JSON.parse(savedBooking));

      // Load cleaner's pricing
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
      if (cleanerProfiles.length > 0) {
        setCleaner(cleanerProfiles[0]);
      }

      // Load existing selections if any
      const savedAddOns = localStorage.getItem('bookingAddOns');
      if (savedAddOns) {
        setSelections(JSON.parse(savedAddOns));
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
    }
    setLoading(false);
  };

  const updateQuantity = (serviceKey, change) => {
    setSelections(prev => {
      const current = prev[serviceKey] || 0;
      const newValue = Math.max(0, current + change);
      if (newValue === 0) {
        const { [serviceKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceKey]: newValue };
    });
  };

  const getServicePrice = (serviceKey) => {
    if (!cleaner?.additional_service_pricing) return 0;
    return cleaner.additional_service_pricing[serviceKey] || 0;
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selections).forEach(key => {
      total += getServicePrice(key) * selections[key];
    });
    return total;
  };

  const handleContinue = () => {
    localStorage.setItem('bookingAddOns', JSON.stringify(selections));
    navigate(createPageUrl(`MatchedCleaners?cleaner=${cleanerEmail}`));
  };

  const handleSkip = () => {
    localStorage.removeItem('bookingAddOns');
    navigate(createPageUrl(`MatchedCleaners?cleaner=${cleanerEmail}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="font-fredoka text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  const totalCredits = calculateTotal();
  const selectedCount = Object.keys(selections).length;

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(to bottom, #66B3FF 0%, #F7F9FC 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 px-6 py-2 text-lg rounded-full font-fredoka shadow-lg" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)', color: 'white' }}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add-On Services
          </Badge>
          <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-white mb-3">
            Enhance Your Cleaning
          </h1>
          <p className="text-lg text-white font-verdana" style={{ opacity: 0.9 }}>
            Select any additional services you'd like to add
          </p>
        </motion.div>

        {/* Summary Card */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-fredoka font-bold text-2xl">{totalCredits} credits</p>
                    <p className="text-sm opacity-90">≈ ${(totalCredits / 10).toFixed(2)} • {selectedCount} add-on{selectedCount > 1 ? 's' : ''} selected</p>
                  </div>
                  <ShoppingCart className="w-10 h-10 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {ADDITIONAL_SERVICES.map((service, idx) => {
            const quantity = selections[service.key] || 0;
            const servicePrice = getServicePrice(service.key);
            const isSelected = quantity > 0;

            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`h-full border-2 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl ${isSelected ? 'ring-4 ring-opacity-50' : ''}`}
                  style={{ 
                    backgroundColor: service.bgColor,
                    borderColor: isSelected ? service.color : 'transparent',
                    ringColor: service.color
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: service.color }}>
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      {isSelected && (
                        <Badge className="rounded-full font-fredoka font-bold animate-pulse" style={{ backgroundColor: service.color, color: 'white' }}>
                          {quantity}×
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-fredoka text-xl mb-1" style={{ color: '#1D2533' }}>
                      {service.name}
                    </CardTitle>
                    <p className="text-xs text-gray-600 font-verdana">
                      {service.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-white bg-opacity-60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-verdana text-gray-600">Price per {service.unit.toLowerCase()}</span>
                        </div>
                        <p className="font-fredoka font-bold text-lg" style={{ color: service.color }}>
                          {servicePrice} credits
                        </p>
                        <p className="text-xs text-gray-500">≈ ${(servicePrice / 10).toFixed(2)}</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(service.key, -1)}
                          disabled={quantity === 0}
                          className="h-10 w-10 rounded-full p-0 border-2"
                          style={{ borderColor: service.color, color: service.color }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex-1 text-center">
                          <Input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setSelections(prev => val === 0 ? { ...prev, [service.key]: undefined } : { ...prev, [service.key]: val });
                            }}
                            className="text-center font-fredoka font-bold text-lg h-10 rounded-full"
                            style={{ borderColor: service.color }}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(service.key, 1)}
                          className="h-10 w-10 rounded-full p-0 border-2"
                          style={{ borderColor: service.color, color: service.color, backgroundColor: isSelected ? service.color : 'white' }}
                        >
                          <Plus className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} />
                        </Button>
                      </div>

                      {quantity > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-lg text-center" style={{ backgroundColor: service.color }}
                        >
                          <p className="font-fredoka font-bold text-white">
                            = {servicePrice * quantity} credits
                          </p>
                          <p className="text-xs text-white opacity-90">
                            ≈ ${((servicePrice * quantity) / 10).toFixed(2)}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-6 z-10"
        >
          <Card className="border-0 shadow-2xl rounded-2xl bg-white">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full font-fredoka font-semibold border-2"
                >
                  Skip Add-Ons
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="flex-1 brand-gradient text-white rounded-full font-fredoka font-bold shadow-xl"
                >
                  {selectedCount > 0 ? `Continue with ${selectedCount} Add-On${selectedCount > 1 ? 's' : ''}` : 'Continue'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {selectedCount > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-verdana text-gray-600">Add-ons Total:</span>
                    <div className="text-right">
                      <p className="font-fredoka font-bold text-xl text-puretask-blue">{totalCredits} credits</p>
                      <p className="text-sm text-gray-500">≈ ${(totalCredits / 10).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}