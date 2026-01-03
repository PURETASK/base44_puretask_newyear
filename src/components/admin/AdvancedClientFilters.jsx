import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdvancedClientFilters({ onApplyFilters, onClearFilters }) {
  const [filters, setFilters] = useState({
    creditBalanceMin: '',
    creditBalanceMax: '',
    membershipTier: 'all',
    totalBookingsMin: '',
    totalBookingsMax: '',
    onboardingCompleted: 'all'
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.creditBalanceMin) count++;
    if (newFilters.creditBalanceMax) count++;
    if (newFilters.membershipTier !== 'all') count++;
    if (newFilters.totalBookingsMin) count++;
    if (newFilters.totalBookingsMax) count++;
    if (newFilters.onboardingCompleted !== 'all') count++;
    
    setActiveFiltersCount(count);
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      creditBalanceMin: '',
      creditBalanceMax: '',
      membershipTier: 'all',
      totalBookingsMin: '',
      totalBookingsMax: '',
      onboardingCompleted: 'all'
    };
    setFilters(clearedFilters);
    setActiveFiltersCount(0);
    onClearFilters();
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <Filter className="w-6 h-6 text-indigo-600" />
            Advanced Client Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge className="bg-indigo-600 text-white font-fredoka">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Credit Balance Range */}
          <div className="space-y-2">
            <Label className="font-fredoka text-graphite">Credit Balance Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.creditBalanceMin}
                onChange={(e) => updateFilter('creditBalanceMin', e.target.value)}
                className="rounded-full font-verdana"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.creditBalanceMax}
                onChange={(e) => updateFilter('creditBalanceMax', e.target.value)}
                className="rounded-full font-verdana"
              />
            </div>
          </div>

          {/* Membership Tier */}
          <div className="space-y-2">
            <Label className="font-fredoka text-graphite">Membership Tier</Label>
            <Select value={filters.membershipTier} onValueChange={(val) => updateFilter('membershipTier', val)}>
              <SelectTrigger className="rounded-full font-verdana">
                <SelectValue placeholder="All tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Plus">Plus</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Bookings Range */}
          <div className="space-y-2">
            <Label className="font-fredoka text-graphite">Total Bookings Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.totalBookingsMin}
                onChange={(e) => updateFilter('totalBookingsMin', e.target.value)}
                className="rounded-full font-verdana"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.totalBookingsMax}
                onChange={(e) => updateFilter('totalBookingsMax', e.target.value)}
                className="rounded-full font-verdana"
              />
            </div>
          </div>

          {/* Onboarding Status */}
          <div className="space-y-2">
            <Label className="font-fredoka text-graphite">Onboarding Status</Label>
            <Select value={filters.onboardingCompleted} onValueChange={(val) => updateFilter('onboardingCompleted', val)}>
              <SelectTrigger className="rounded-full font-verdana">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Completed</SelectItem>
                <SelectItem value="false">Not Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleApply}
            className="flex-1 brand-gradient text-white rounded-full font-fredoka font-semibold"
          >
            <Search className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="rounded-full font-fredoka"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}