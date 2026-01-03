import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Home, Zap, Crown } from 'lucide-react';

export default function QuickBookPresets({ homeSize, onSelectPreset }) {
  const presets = {
    small: [
      {
        name: 'Standard Clean',
        icon: Home,
        color: 'from-blue-500 to-cyan-500',
        hours: 2,
        tasks: ['general_cleaning', 'vacuum', 'dust', 'kitchen', 'bathroom'],
        taskQuantities: { bathroom: 1, kitchen: 1 },
        description: 'Perfect for regular maintenance'
      },
      {
        name: 'Deep Clean',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        hours: 3,
        tasks: ['deep_cleaning', 'vacuum', 'dust', 'kitchen', 'bathroom', 'baseboards', 'inside_cabinets'],
        taskQuantities: { bathroom: 1, kitchen: 1 },
        description: 'Thorough top-to-bottom cleaning'
      }
    ],
    medium: [
      {
        name: 'Standard Clean',
        icon: Home,
        color: 'from-blue-500 to-cyan-500',
        hours: 3,
        tasks: ['general_cleaning', 'vacuum', 'dust', 'kitchen', 'bathroom', 'living_areas'],
        taskQuantities: { bathroom: 2, kitchen: 1 },
        description: 'Perfect for regular maintenance'
      },
      {
        name: 'Deep Clean',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        hours: 4.5,
        tasks: ['deep_cleaning', 'vacuum', 'dust', 'kitchen', 'bathroom', 'baseboards', 'inside_cabinets', 'windows'],
        taskQuantities: { bathroom: 2, kitchen: 1, windows: 8 },
        description: 'Thorough top-to-bottom cleaning'
      },
      {
        name: 'Move Out Clean',
        icon: Zap,
        color: 'from-amber-500 to-orange-500',
        hours: 5,
        tasks: ['deep_cleaning', 'inside_oven', 'inside_fridge', 'inside_cabinets', 'baseboards', 'windows', 'bathroom', 'kitchen'],
        taskQuantities: { bathroom: 2, kitchen: 1, windows: 10 },
        description: 'Spotless for move-out inspection'
      }
    ],
    large: [
      {
        name: 'Standard Clean',
        icon: Home,
        color: 'from-blue-500 to-cyan-500',
        hours: 4,
        tasks: ['general_cleaning', 'vacuum', 'dust', 'kitchen', 'bathroom', 'living_areas', 'bedrooms'],
        taskQuantities: { bathroom: 3, kitchen: 1 },
        description: 'Perfect for regular maintenance'
      },
      {
        name: 'Deep Clean',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        hours: 6,
        tasks: ['deep_cleaning', 'vacuum', 'dust', 'kitchen', 'bathroom', 'baseboards', 'inside_cabinets', 'windows', 'living_areas'],
        taskQuantities: { bathroom: 3, kitchen: 1, windows: 12 },
        description: 'Thorough top-to-bottom cleaning'
      },
      {
        name: 'Premium Full Service',
        icon: Crown,
        color: 'from-emerald-500 to-green-600',
        hours: 8,
        tasks: ['deep_cleaning', 'inside_oven', 'inside_fridge', 'inside_cabinets', 'baseboards', 'windows', 'bathroom', 'kitchen', 'laundry', 'organization'],
        taskQuantities: { bathroom: 3, kitchen: 1, windows: 15 },
        description: 'Complete luxury cleaning experience'
      }
    ]
  };

  const sizePresets = presets[homeSize] || presets.medium;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Book Options</h3>
        <p className="text-sm text-slate-600">Choose a preset or customize your own below</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {sizePresets.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <Card
              key={idx}
              className="border-2 border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onSelectPreset(preset)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-slate-900 text-center mb-2">{preset.name}</h4>
                <p className="text-xs text-slate-600 text-center mb-3">{preset.description}</p>
                <div className="flex justify-center mb-3">
                  <Badge variant="outline" className="text-slate-700">
                    ~{preset.hours} hours
                  </Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white">
                  Select
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Not sure what you need? <button className="text-emerald-600 hover:underline font-medium">Chat with a cleaner first</button>
        </p>
      </div>
    </div>
  );
}