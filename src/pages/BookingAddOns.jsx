import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sparkles, Wind, Grid, ChefHat, Refrigerator, Lightbulb, Package, Home,
  Zap, ArrowRight, ArrowLeft, Plus, Minus, ShoppingCart, Info, Loader2, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

const ADDITIONAL_SERVICES = [
  {
    key: 'windows',
    icon: Wind,
    name: 'Windows',
    description: 'Interior and exterior cleaning',
    minCredits: 3,
    maxCredits: 7,
    unit: 'per window',
    color: '#66B3FF',
    bgColor: '#EFF6FF'
  },
  {
    key: 'blinds',
    icon: Grid,
    name: 'Blinds',
    description: 'Dusting and deep cleaning',
    minCredits: 10,
    maxCredits: 15,
    unit: 'per set',
    color: '#00D4FF',
    bgColor: '#ECFEFF'
  },
  {
    key: 'oven',
    icon: ChefHat,
    name: 'Oven',
    description: 'Deep clean interior & racks',
    minCredits: 20,
    maxCredits: 40,
    unit: 'per oven',
    color: '#F59E0B',
    bgColor: '#FFFBEB'
  },
  {
    key: 'refrigerator',
    icon: Refrigerator,
    name: 'Refrigerator',
    description: 'Interior shelves & drawers',
    minCredits: 15,
    maxCredits: 30,
    unit: 'per fridge',
    color: '#28C76F',
    bgColor: '#F0FDF4'
  },
  {
    key: 'inside_cabinets',
    icon: Package,
    name: 'Inside Cabinets',
    description: 'Kitchen or bathroom cabinets',
    minCredits: 10,
    maxCredits: 20,
    unit: 'per section',
    color: '#EC4899',
    bgColor: '#FDF2F8'
  },
  {
    key: 'baseboards',
    icon: Home,
    name: 'Baseboards',
    description: 'Full home baseboard cleaning',
    minCredits: 20,
    maxCredits: 40,
    unit: 'per home',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    basicOnly: true
  }
];

export default function BookingAddOns() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('ClientSignup'));
        return;
      }
      setUser(currentUser);

      // Get cleaner from URL
      const searchParams = new URLSearchParams(window.location.search);
      const cleanerEmail = searchParams.get('cleaner');
      
      if (cleanerEmail) {
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
        if (cleanerProfiles.length > 0) {
          setCleaner(cleanerProfiles[0]);
        }
      }

      // Load saved selections from bookingDraft
      const draftStr = localStorage.getItem('bookingDraft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        if (draft.additional_services) {
          setSelectedServices(draft.additional_services);
        }
      }
    } catch (error) {
      navigate(createPageUrl('ClientSignup'));
    }
    setLoading(false);
  };

  const handleQuantityChange = (serviceKey, delta) => {
    setSelectedServices(prev => {
      const current = prev[serviceKey] || 0;
      const newValue = Math.max(0, current + delta);
      const updated = { ...prev };
      if (newValue === 0) {
        delete updated[serviceKey];
      } else {
        updated[serviceKey] = newValue;
      }
      return updated;
    });
  };

  const getTotalEstimate = () => {
    let total = 0;
    if (!cleaner || !cleaner.additional_service_pricing) {
      // Fallback to midpoint of range if cleaner not loaded
      Object.keys(selectedServices).forEach(key => {
        const service = ADDITIONAL_SERVICES.find(s => s.key === key);
        if (service) {
          const midpoint = Math.round((service.minCredits + service.maxCredits) / 2);
          total += midpoint * selectedServices[key];
        }
      });
    } else {
      // Use cleaner's actual prices
      Object.keys(selectedServices).forEach(key => {
        const price = cleaner.additional_service_pricing[key];
        if (price) {
          total += price * selectedServices[key];
        }
      });
    }
    return total;
  };

  const handleContinue = () => {
    // Update bookingDraft with additional services
    const draftStr = localStorage.getItem('bookingDraft');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      draft.additional_services = selectedServices;
      localStorage.setItem('bookingDraft', JSON.stringify(draft));
    }
    
    // Continue to next step in BookingFlow
    const searchParams = new URLSearchParams(window.location.search);
    const cleanerEmail = searchParams.get('cleaner');
    if (cleanerEmail) {
      navigate(createPageUrl(`BookingFlow?cleaner=${cleanerEmail}`));
    } else {
      navigate(createPageUrl('BrowseCleaners'));
    }
  };

  const handleSkip = () => {
    // Update bookingDraft with empty services
    const draftStr = localStorage.getItem('bookingDraft');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      draft.additional_services = {};
      localStorage.setItem('bookingDraft', JSON.stringify(draft));
    }
    
    // Continue to next step in BookingFlow
    const searchParams = new URLSearchParams(window.location.search);
    const cleanerEmail = searchParams.get('cleaner');
    if (cleanerEmail) {
      navigate(createPageUrl(`BookingFlow?cleaner=${cleanerEmail}`));
    } else {
      navigate(createPageUrl('BrowseCleaners'));
    }
  };

  const totalServices = Object.keys(selectedServices).length;
  const estimatedCredits = getTotalEstimate();

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
            Want to Add Anything Extra?
          </h1>
          <p className="text-lg text-gray-600 font-verdana">
            Optional add-on services to make your home shine ✨
          </p>
        </motion.div>

        {/* Enhanced Info Alert with 1:1 conversion explanation */}
        <Alert className="mb-8 border-2 rounded-2xl shadow-lg" style={{ borderColor: '#66B3FF', backgroundColor: '#EFF6FF' }}>
          <DollarSign className="w-6 h-6 text-puretask-blue" />
          <AlertTitle className="font-fredoka font-bold text-lg text-graphite mb-2">
            💰 Additional Services Pricing
          </AlertTitle>
          <AlertDescription className="font-verdana text-gray-700 space-y-2">
            <p>
              Each cleaner sets their own prices for these services based on their reliability tier. 
              {cleaner ? (
                <span className="font-semibold text-puretask-blue"> Your selected cleaner's exact prices are shown below.</span>
              ) : (
                <span> When you select a cleaner, their exact prices will be displayed.</span>
              )}
            </p>
            {cleaner && (
              <div className="mt-2 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-sm">
                  <strong>Your Cleaner:</strong> {cleaner.full_name} 
                  <Badge className="ml-2" style={{ backgroundColor: '#FCD34D', color: '#92400E' }}>
                    {cleaner.tier} Tier
                  </Badge>
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {ADDITIONAL_SERVICES.filter(service => {
            // Get cleaning type from bookingDraft
            const draftStr = localStorage.getItem('bookingDraft');
            if (draftStr) {
              const draft = JSON.parse(draftStr);
              const cleaningType = draft.cleaning_type;
              // Only show baseboards for basic cleans
              if (service.basicOnly && cleaningType !== 'basic') {
                return false;
              }
            }
            return true;
          }).map((service, idx) => {
            const quantity = selectedServices[service.key] || 0;
            const ServiceIcon = service.icon;
            const cleanerPrice = cleaner?.additional_service_pricing?.[service.key];
            const subtotal = quantity > 0 ? (cleanerPrice || Math.round((service.minCredits + service.maxCredits) / 2)) * quantity : 0;
            
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className={`border-2 shadow-lg rounded-2xl transition-all ${
                    quantity > 0 ? 'ring-4 ring-offset-2' : 'hover:shadow-xl'
                  }`}
                  style={{ 
                    backgroundColor: service.bgColor,
                    borderColor: service.color,
                    ringColor: quantity > 0 ? service.color : 'transparent'
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: service.color }}>
                        <ServiceIcon className="w-6 h-6 text-white" />
                      </div>
                      {quantity > 0 && (
                        <Badge className="rounded-full font-fredoka text-white" style={{ backgroundColor: service.color }}>
                          {quantity}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-fredoka text-lg text-graphite">
                      {service.name}
                    </CardTitle>
                    <p className="text-xs text-gray-600 font-verdana mt-1">
                      {service.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Only show price when service is selected and quantity > 0 */}
                    {quantity > 0 && cleanerPrice && (
                      <div className="mb-3 p-2 rounded-lg bg-white">
                        <p className="text-xs font-verdana text-gray-600">Price {service.unit}:</p>
                        <p className="text-sm font-fredoka font-bold" style={{ color: service.color }}>
                          ${cleanerPrice.toFixed(2)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-verdana text-gray-600">Subtotal:</p>
                          <p className="text-lg font-fredoka font-bold" style={{ color: service.color }}>
                            ${subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(service.key, -1)}
                        disabled={quantity === 0}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="font-fredoka font-bold text-xl text-graphite min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleQuantityChange(service.key, 1)}
                        className="rounded-full w-10 h-10 p-0 text-white"
                        style={{ background: service.color }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Summary Card */}
        {totalServices > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-fredoka font-bold text-graphite text-lg">
                        {totalServices} Add-On Service{totalServices > 1 ? 's' : ''} Selected
                      </p>
                      <p className="text-sm text-gray-600 font-verdana">
                        Total: <span className="font-bold text-green-600 text-2xl">${estimatedCredits.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedServices({})}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full font-fredoka"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="rounded-full font-fredoka font-semibold border-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleSkip}
            variant="outline"
            size="lg"
            className="flex-1 rounded-full font-fredoka font-semibold border-2"
          >
            Skip Add-Ons
          </Button>

          <Button
            onClick={handleContinue}
            size="lg"
            className="flex-1 brand-gradient text-white rounded-full font-fredoka font-bold shadow-xl"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Enhanced Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <h3 className="font-fredoka font-bold text-graphite text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Good to Know
              </h3>
              <ul className="space-y-2 font-verdana text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Final prices are set by your chosen cleaner within their tier range</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>You can discuss specific needs with your cleaner before confirming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>All add-ons include before/after photo proof for quality assurance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sticky Price Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-puretask-blue shadow-2xl p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-verdana">Add-Ons Total</p>
              <p className="text-2xl font-fredoka font-bold text-graphite">
                ${estimatedCredits.toFixed(2)}
              </p>
              {totalServices > 0 && (
                <p className="text-xs text-gray-500 font-verdana">
                  {totalServices} service{totalServices > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              size="lg"
              className="rounded-full font-fredoka font-semibold border-2"
            >
              Skip
            </Button>
            <Button
              onClick={handleContinue}
              size="lg"
              className="brand-gradient text-white rounded-full font-fredoka font-bold shadow-xl"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}