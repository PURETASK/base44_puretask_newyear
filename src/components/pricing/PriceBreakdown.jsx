import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function PriceBreakdown({ pricingData }) {
  if (!pricingData || !pricingData.pricing_breakdown) {
    return null;
  }

  const breakdown = pricingData.pricing_breakdown;
  const labels = pricingData.applied_pricing_labels || [];

  const items = [];

  // Base cleaning
  if (breakdown.base_hours_credits) {
    items.push({
      label: 'Base Cleaning',
      credits: breakdown.base_hours_credits,
      usd: (breakdown.base_hours_credits / 10).toFixed(2),
      isDiscount: false
    });
  }

  // Additional services
  if (breakdown.extras_credits > 0) {
    items.push({
      label: 'Additional Services',
      credits: breakdown.extras_credits,
      usd: (breakdown.extras_credits / 10).toFixed(2),
      isDiscount: false
    });
  }

  // Tier adjustment
  if (breakdown.tier_multiplier && breakdown.tier_multiplier !== 1.0) {
    const tierAdjustment = (breakdown.base_hours_credits + breakdown.extras_credits) * 
                          (breakdown.tier_multiplier - 1.0);
    if (tierAdjustment !== 0) {
      items.push({
        label: breakdown.tier_multiplier > 1.0 ? 'Premium Tier' : 'New Cleaner Discount',
        credits: Math.abs(Math.round(tierAdjustment)),
        usd: Math.abs(tierAdjustment / 10).toFixed(2),
        isDiscount: tierAdjustment < 0
      });
    }
  }

  // Membership discount
  if (breakdown.membership_discount_credits > 0) {
    items.push({
      label: 'Membership Discount',
      credits: breakdown.membership_discount_credits,
      usd: (breakdown.membership_discount_credits / 10).toFixed(2),
      isDiscount: true
    });
  }

  // Recurring discount
  if (breakdown.recurrence_discount_credits > 0) {
    items.push({
      label: 'Recurring Service Discount',
      credits: breakdown.recurrence_discount_credits,
      usd: (breakdown.recurrence_discount_credits / 10).toFixed(2),
      isDiscount: true
    });
  }

  // Bundle discount
  if (breakdown.bundle_discount_credits > 0) {
    items.push({
      label: 'Bundle Savings',
      credits: breakdown.bundle_discount_credits,
      usd: (breakdown.bundle_discount_credits / 10).toFixed(2),
      isDiscount: true
    });
  }

  return (
    <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-puretask-blue" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-2xl">
            <div className="flex items-center gap-2">
              {item.isDiscount ? (
                <TrendingDown className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-gray-600" />
              )}
              <span className="font-verdana text-gray-700">{item.label}</span>
            </div>
            <div className="text-right">
              <span className={`font-fredoka font-bold ${item.isDiscount ? 'text-green-600' : 'text-graphite'}`}>
                {item.isDiscount ? '-' : ''}${item.usd}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({item.isDiscount ? '-' : ''}{item.credits} credits)
              </span>
            </div>
          </div>
        ))}

        <div className="border-t-2 border-blue-200 pt-3 mt-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-puretask-blue" />
              <span className="font-fredoka font-bold text-xl text-graphite">Total</span>
            </div>
            <div className="text-right">
              <span className="font-fredoka font-bold text-3xl text-puretask-blue">
                ${pricingData.estimated_price_usd?.toFixed(2) || '0.00'}
              </span>
              <span className="block text-xs text-gray-600">
                {breakdown.final_estimated_credits} credits
              </span>
            </div>
          </div>
        </div>

        {/* Applied pricing labels */}
        {labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {labels.map((label, index) => (
              <Badge key={index} className="bg-green-100 text-green-800 font-verdana">
                ✓ {label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}