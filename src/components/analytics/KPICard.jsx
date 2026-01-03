import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = '#66B3FF' }) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Card className="border-2" style={{ borderColor: color }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-verdana text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8" style={{ color }} />}
          <div className="flex-1">
            <p className="text-3xl font-fredoka font-bold text-graphite">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 font-verdana mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex flex-col items-end">
              {getTrendIcon()}
              {trendValue && (
                <span className={`text-xs font-fredoka font-semibold ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}