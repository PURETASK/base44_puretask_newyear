import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Ban } from 'lucide-react';

export default function RiskScoreDisplay({ riskProfile }) {
  if (!riskProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-fredoka font-bold text-lg text-graphite">No Risk Profile</p>
          <p className="text-sm text-gray-600 font-verdana">User has clean record</p>
        </CardContent>
      </Card>
    );
  }

  const getTierConfig = (tier) => {
    switch (tier) {
      case 'normal':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: Shield, label: 'Normal' };
      case 'watch':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Eye, label: 'Watch List' };
      case 'restricted':
        return { color: 'text-amber-600', bgColor: 'bg-amber-100', icon: AlertTriangle, label: 'Restricted' };
      case 'blocked':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: Ban, label: 'Blocked' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Shield, label: 'Unknown' };
    }
  };

  const config = getTierConfig(riskProfile.risk_tier);
  const Icon = config.icon;

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-amber-600';
    if (score >= 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className={`border-2 ${
      riskProfile.risk_tier === 'blocked' ? 'border-red-500' :
      riskProfile.risk_tier === 'restricted' ? 'border-amber-500' :
      riskProfile.risk_tier === 'watch' ? 'border-yellow-500' :
      'border-green-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-fredoka font-bold text-2xl text-graphite mb-1">
              Risk Profile
            </h3>
            <Badge className={`${config.bgColor} ${config.color} font-fredoka`}>
              {config.label}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-verdana mb-1">Risk Score</p>
            <p className={`text-4xl font-fredoka font-bold ${getScoreColor(riskProfile.risk_score)}`}>
              {riskProfile.risk_score || 0}
            </p>
            <p className="text-xs text-gray-500 font-verdana">/100</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-verdana mb-1">Open Flags</p>
            <p className="text-xl font-fredoka font-bold text-amber-600">
              {riskProfile.open_flags || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-verdana mb-1">Total Flags</p>
            <p className="text-xl font-fredoka font-bold text-graphite">
              {riskProfile.total_flags || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-verdana mb-1">Bookings</p>
            <p className="text-xl font-fredoka font-bold text-graphite">
              {riskProfile.lifetime_booking_count || 0}
            </p>
          </div>
        </div>

        {riskProfile.tags && riskProfile.tags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 font-verdana mb-2">Risk Tags:</p>
            <div className="flex gap-2 flex-wrap">
              {riskProfile.tags.map(tag => (
                <Badge key={tag} variant="outline" className="font-verdana text-xs">
                  {tag.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}