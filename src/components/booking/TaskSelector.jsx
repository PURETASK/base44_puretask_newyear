import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Sparkles, Home, Briefcase, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TaskSelector({ selectedType, onSelectType, cleaner }) {
  const handleTypeChange = onSelectType;
  
  // Calculate rates for each service type
  // Use base_rate_credits_per_hour if available, otherwise fall back to hourly_rate (legacy field)
  const baseRate = cleaner?.base_rate_credits_per_hour || cleaner?.hourly_rate || 0;
  const deepAddon = cleaner?.deep_addon_credits_per_hour || 0;
  const moveoutAddon = cleaner?.moveout_addon_credits_per_hour || 0;

  const cleaningTypes = [
    {
      id: 'basic',
      name: 'Basic Cleaning',
      icon: Home,
      description: 'Standard maintenance cleaning',
      rate: baseRate,
      color: 'blue'
    },
    {
      id: 'deep',
      name: 'Deep Cleaning',
      icon: Sparkles,
      description: 'Detailed deep cleaning service',
      rate: baseRate + deepAddon,
      color: 'purple',
      popular: true
    },
    {
      id: 'moveout',
      name: 'Move-Out / Move-In',
      icon: Briefcase,
      description: 'Complete property transition cleaning',
      rate: baseRate + moveoutAddon,
      color: 'amber'
    }
  ];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Elite': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Pro': return 'bg-blue-100 text-puretask-blue border-blue-300';
      case 'Semi Pro': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Developing': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cleaner Info Card */}
      {cleaner && (
        <Card className="border-2 border-puretask-blue rounded-2xl shadow-lg bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {cleaner.profile_photo_url ? (
                <img 
                  src={cleaner.profile_photo_url} 
                  alt={cleaner.full_name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full brand-gradient flex items-center justify-center text-white text-2xl font-fredoka font-bold shadow-md">
                  {cleaner.full_name?.[0] || 'C'}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-fredoka font-bold text-graphite mb-1">{cleaner.full_name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getTierColor(cleaner.tier)} font-fredoka border rounded-full`}>
                    {cleaner.tier || 'Semi Pro'}
                  </Badge>
                  {cleaner.average_rating && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-verdana font-semibold">{cleaner.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Selection */}
      <div>
        <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2">Select Cleaning Type</h3>
        <p className="text-gray-600 font-verdana mb-6">Choose your service - pricing is specific to this cleaner</p>

        <div className="grid md:grid-cols-3 gap-6">
          {cleaningTypes.map((type, idx) => {
            const isSelected = selectedType === type.id;
            const Icon = type.icon;

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  onClick={() => handleTypeChange(type.id)}
                  className={`cursor-pointer transition-all duration-300 rounded-2xl relative h-full ${
                    isSelected
                      ? 'border-4 border-puretask-blue shadow-2xl scale-105 bg-blue-50/50'
                      : 'border-2 border-gray-200 hover:border-puretask-blue hover:shadow-lg'
                  }`}
                >
                  {type.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="brand-gradient text-white px-4 py-1 font-fredoka rounded-full shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Check Circle in Top Right Corner */}
                  <div className="absolute -top-3 -right-3 z-20">
                    {isSelected ? (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <CheckCircle className="w-6 h-6 text-white fill-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                        <Circle className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      type.color === 'blue' ? 'bg-blue-100' :
                      type.color === 'purple' ? 'bg-purple-100' :
                      'bg-amber-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        type.color === 'blue' ? 'text-puretask-blue' :
                        type.color === 'purple' ? 'text-purple-600' :
                        'text-amber-600'
                      }`} />
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-xl font-fredoka font-bold text-graphite mb-2">
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 font-verdana flex-grow">
                      {type.description}
                    </p>

                    {/* Pricing */}
                    <div className={`rounded-xl p-4 mt-auto ${
                      type.color === 'blue' ? 'bg-blue-50 border-2 border-blue-200' :
                      type.color === 'purple' ? 'bg-purple-50 border-2 border-purple-200' :
                      'bg-amber-50 border-2 border-amber-200'
                    }`}>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl font-fredoka font-bold text-graphite">
                          {type.rate}
                        </span>
                        <span className="text-sm text-gray-600 font-verdana">credits/hr</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-verdana text-center">
                        ≈${type.rate.toFixed(0)}/hour
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200 rounded-2xl">
        <CardContent className="p-4">
          <p className="text-sm text-graphite font-verdana">
            <strong className="font-fredoka">Note:</strong> Cleaners are independent contractors who define their own service standards. 
            All cleaners bring their own professional supplies and equipment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}