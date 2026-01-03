import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Info, Sparkles, TrendingUp } from 'lucide-react';
import {
  TIER_BASE_RANGES,
  ADDON_RANGES,
  getTierKey,
  validateBaseRate,
  validateAddonRate,
  getPayoutPercentage,
  creditsToUSD
} from '../credits/CreditCalculator';

export default function CleanerPricingSettings({ cleanerProfile, onUpdate }) {
  const [baseRate, setBaseRate] = useState(300);
  const [deepAddon, setDeepAddon] = useState(30);
  const [moveoutAddon, setMoveoutAddon] = useState(30);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (cleanerProfile) {
      setBaseRate(cleanerProfile.base_rate_credits_per_hour || 300);
      setDeepAddon(cleanerProfile.deep_addon_credits_per_hour || 30);
      setMoveoutAddon(cleanerProfile.moveout_addon_credits_per_hour || 30);
    }
  }, [cleanerProfile]);

  const tierKey = getTierKey(cleanerProfile?.tier);
  const baseRange = TIER_BASE_RANGES[tierKey] || TIER_BASE_RANGES['Semi Pro'];
  const addonRange = ADDON_RANGES['deep']; // Both deep and moveout use same range
  const payoutPercentage = getPayoutPercentage(cleanerProfile?.tier);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Validate rates
      const baseValidation = validateBaseRate(baseRate, cleanerProfile?.tier);
      if (!baseValidation.valid) {
        throw new Error(baseValidation.error);
      }
      
      const deepValidation = validateAddonRate(deepAddon, 'deep');
      if (!deepValidation.valid) {
        throw new Error(deepValidation.error);
      }
      
      const moveoutValidation = validateAddonRate(moveoutAddon, 'moveout');
      if (!moveoutValidation.valid) {
        throw new Error(moveoutValidation.error);
      }
      
      // Update profile
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        base_rate_credits_per_hour: baseRate,
        deep_addon_credits_per_hour: deepAddon,
        moveout_addon_credits_per_hour: moveoutAddon,
        payout_percentage: payoutPercentage
      });
      
      setMessage('✅ Pricing updated successfully!');
      if (onUpdate) onUpdate();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating pricing:', error);
      setMessage('❌ ' + error.message);
    }
    
    setSaving(false);
  };

  // Calculate earnings preview
  const basicEarnings = creditsToUSD(baseRate * 3) * payoutPercentage;
  const deepEarnings = creditsToUSD((baseRate + deepAddon) * 3) * payoutPercentage;
  const moveoutEarnings = creditsToUSD((baseRate + moveoutAddon) * 3) * payoutPercentage;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" />
          Your Pricing Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Tier Badge */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600">Your Tier</p>
            <p className="text-2xl font-bold text-slate-900">{cleanerProfile?.tier || 'Semi Pro'}</p>
          </div>
          <Badge className="bg-emerald-500 text-white">
            {(payoutPercentage * 100).toFixed(0)}% Payout Rate
          </Badge>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-sm">
            <strong>How it works:</strong> Set your rates in credits (10 credits = $1). 
            You earn {(payoutPercentage * 100).toFixed(0)}% of what clients pay. 
            Rates are frozen when clients book, so changes only affect new bookings.
          </AlertDescription>
        </Alert>

        {/* Base Rate */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-base font-semibold">Base Rate (Basic Clean)</label>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{baseRate}</p>
              <p className="text-xs text-slate-600">credits/hr (≈${creditsToUSD(baseRate)}/hr)</p>
            </div>
          </div>
          <Slider
            value={[baseRate]}
            onValueChange={([value]) => setBaseRate(value)}
            min={baseRange.min}
            max={baseRange.max}
            step={5}
            className="mb-2"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{baseRange.min} credits/hr</span>
            <span>{baseRange.max} credits/hr</span>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Your tier allows {baseRange.min}-{baseRange.max} credits/hr
          </p>
        </div>

        {/* Deep Clean Add-On */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-base font-semibold">Deep Clean Add-On</label>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">+{deepAddon}</p>
              <p className="text-xs text-slate-600">credits/hr (≈+${creditsToUSD(deepAddon)}/hr)</p>
            </div>
          </div>
          <Slider
            value={[deepAddon]}
            onValueChange={([value]) => setDeepAddon(value)}
            min={addonRange.min}
            max={addonRange.max}
            step={5}
            className="mb-2"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>+{addonRange.min} credits/hr</span>
            <span>+{addonRange.max} credits/hr</span>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Applied when client selects "Deep Clean"
          </p>
        </div>

        {/* Move-Out Add-On */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-base font-semibold">Move-Out Add-On</label>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">+{moveoutAddon}</p>
              <p className="text-xs text-slate-600">credits/hr (≈+${creditsToUSD(moveoutAddon)}/hr)</p>
            </div>
          </div>
          <Slider
            value={[moveoutAddon]}
            onValueChange={([value]) => setMoveoutAddon(value)}
            min={addonRange.min}
            max={addonRange.max}
            step={5}
            className="mb-2"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>+{addonRange.min} credits/hr</span>
            <span>+{addonRange.max} credits/hr</span>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Applied when client selects "Move-Out Clean"
          </p>
        </div>

        {/* Earnings Preview */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-200">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Your Earnings Preview (3 hours)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Basic Clean</p>
              <p className="text-2xl font-bold text-emerald-600">${basicEarnings.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{baseRate} cr/hr</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Deep Clean</p>
              <p className="text-2xl font-bold text-blue-600">${deepEarnings.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{baseRate + deepAddon} cr/hr</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Move-Out</p>
              <p className="text-2xl font-bold text-purple-600">${moveoutEarnings.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{baseRate + moveoutAddon} cr/hr</p>
            </div>
          </div>
          <p className="text-xs text-center text-slate-600 mt-3">
            You keep {(payoutPercentage * 100).toFixed(0)}% • Platform fee {((1 - payoutPercentage) * 100).toFixed(0)}%
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Pricing'}
        </Button>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-2">
            <strong>💡 Tips:</strong>
          </p>
          <ul className="text-sm text-blue-900 space-y-1">
            <li>• Higher rates may reduce bookings but increase earnings per job</li>
            <li>• Add-ons only apply when clients select that cleaning type</li>
            <li>• Competitive pricing helps you get more bookings</li>
            <li>• Your tier determines your rate ranges</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}