import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Award } from 'lucide-react';

export default function EarningsCalculator() {
  const [city, setCity] = useState('boston');
  const [tier, setTier] = useState('Semi Pro');
  const [hoursPerWeek, setHoursPerWeek] = useState(20);

  const cityRates = {
    boston: { Developing: 25, 'Semi Pro': 35, Pro: 45, Elite: 60 },
    newyork: { Developing: 30, 'Semi Pro': 40, Pro: 55, Elite: 75 },
    chicago: { Developing: 22, 'Semi Pro': 32, Pro: 42, Elite: 55 },
    sanfrancisco: { Developing: 35, 'Semi Pro': 50, Pro: 65, Elite: 85 }
  };

  const hourlyRate = cityRates[city][tier];
  const weeklyEarnings = hourlyRate * hoursPerWeek * 0.85; // 85% after platform fee
  const monthlyEarnings = weeklyEarnings * 4.33;
  const yearlyEarnings = monthlyEarnings * 12;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <DollarSign className="w-7 h-7 text-emerald-600" />
          Earnings Calculator
        </CardTitle>
        <p className="text-slate-600 mt-2">See your earning potential as a PureTask cleaner</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Your City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boston">Boston</SelectItem>
              <SelectItem value="newyork">New York</SelectItem>
              <SelectItem value="chicago">Chicago</SelectItem>
              <SelectItem value="sanfrancisco">San Francisco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Developing">Developing</SelectItem>
              <SelectItem value="Semi Pro">Semi Pro</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label>Hours Per Week</Label>
            <Badge variant="outline">{hoursPerWeek} hours</Badge>
          </div>
          <Slider
            value={[hoursPerWeek]}
            onValueChange={([value]) => setHoursPerWeek(value)}
            min={5}
            max={40}
            step={5}
          />
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Hourly Rate:</span>
            <span className="text-2xl font-bold text-emerald-600">${hourlyRate}/hr</span>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Weekly:</span>
              <span className="font-bold text-lg">${weeklyEarnings.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Monthly:</span>
              <span className="font-bold text-lg">${monthlyEarnings.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-slate-900 font-semibold">Yearly:</span>
              <span className="font-bold text-2xl text-emerald-600">${yearlyEarnings.toFixed(0)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            * Earnings shown after 15% platform fee. Actual earnings may vary.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Tier Up to Earn More!</p>
              <p>Elite cleaners in {city === 'boston' ? 'Boston' : city === 'newyork' ? 'New York' : city === 'chicago' ? 'Chicago' : 'San Francisco'} earn ${cityRates[city].Elite}/hr - 
              that's ${((cityRates[city].Elite * hoursPerWeek * 0.85 * 12 * 4.33) / 1000).toFixed(0)}k/year!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}