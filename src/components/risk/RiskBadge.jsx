import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Ban } from 'lucide-react';

export default function RiskBadge({ userEmail, userType = 'client' }) {
  const [riskProfile, setRiskProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskProfile();
  }, [userEmail]);

  const loadRiskProfile = async () => {
    try {
      const profiles = await base44.entities.RiskProfile.filter({ user_email: userEmail });
      if (profiles.length > 0) {
        setRiskProfile(profiles[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading risk profile:', error);
      setLoading(false);
    }
  };

  if (loading || !riskProfile) return null;

  const getTierConfig = (tier) => {
    switch (tier) {
      case 'normal':
        return { color: 'bg-green-100 text-green-800', icon: Shield, label: 'Verified' };
      case 'watch':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Watch List' };
      case 'restricted':
        return { color: 'bg-amber-100 text-amber-800', icon: AlertTriangle, label: 'Restricted' };
      case 'blocked':
        return { color: 'bg-red-100 text-red-800', icon: Ban, label: 'Blocked' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Shield, label: 'Unknown' };
    }
  };

  const config = getTierConfig(riskProfile.risk_tier);
  const Icon = config.icon;

  if (riskProfile.risk_tier === 'normal') return null; // Don't show badge for normal users

  return (
    <Badge className={`${config.color} font-fredoka text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}