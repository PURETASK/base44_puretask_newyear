import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AIImpactExplainer({ 
  settingName, 
  impact = 'neutral', // 'positive', 'negative', 'neutral'
  impactAreas = [], // ['reliability_score', 'earnings', 'bookings']
  description = ''
}) {
  const impactConfig = {
    positive: {
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Positive Impact'
    },
    negative: {
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Caution'
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      label: 'Informational'
    }
  };

  const config = impactConfig[impact];
  const Icon = config.icon;

  const areaLabels = {
    reliability_score: 'Reliability Score',
    earnings: 'Earnings Potential',
    bookings: 'Booking Rate',
    client_satisfaction: 'Client Satisfaction',
    time_saved: 'Time Saved'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} ${config.border} border cursor-help`}>
            <Icon className={`w-3 h-3 ${config.color}`} />
            <span className={`text-xs font-fredoka ${config.color}`}>
              {config.label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-fredoka font-semibold text-sm">{settingName}</p>
            <p className="text-xs text-gray-600 font-verdana">{description}</p>
            {impactAreas.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-fredoka mb-1">Affects:</p>
                <div className="flex flex-wrap gap-1">
                  {impactAreas.map(area => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {areaLabels[area] || area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}