import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StickyFiltersBar({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  onSearch, 
  showAdvanced, 
  setShowAdvanced,
  allLocations 
}) {
  const activeFiltersCount = [
    filters.search,
    filters.minRating > 0,
    filters.minReliability > 0,
    filters.availability !== 'all',
    filters.cleaningType !== 'all',
    filters.tier !== 'all',
    filters.minPrice > 0 || filters.maxPrice < 100
  ].filter(Boolean).length;

  return (
    <div className="sticky top-16 z-40 bg-white border-b-2 border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by city, ZIP, cleaner name..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="pl-12 h-12 rounded-full border-2 border-gray-200 focus:border-puretask-blue font-verdana bg-soft-cloud"
              />
            </div>
            <Button
              onClick={onSearch}
              className="h-12 px-8 rounded-full brand-gradient text-white font-fredoka font-semibold hover:opacity-90"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Sort */}
            <Select value={filters.sortBy} onValueChange={(value) => onFilterChange('sortBy', value)}>
              <SelectTrigger className="w-[180px] rounded-full border-2 border-gray-200 font-fredoka h-12 bg-soft-cloud">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">🌟 PureTask Recommended</SelectItem>
                <SelectItem value="top_rated">⭐ Top Rated</SelectItem>
                <SelectItem value="most_reliable">⚡ Most Reliable</SelectItem>
                <SelectItem value="lowest_price">💸 Lowest Price</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Button */}
            <Button
              variant={showAdvanced ? "default" : "outline"}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`rounded-full font-fredoka h-12 px-6 ${
                showAdvanced 
                  ? 'brand-gradient text-white' 
                  : 'border-2 border-puretask-blue text-puretask-blue hover:bg-blue-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-white text-puretask-blue rounded-full h-6 w-6 p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Reset Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={onResetFilters}
                className="rounded-full font-fredoka h-12 text-red-600 hover:bg-red-50"
              >
                <X className="w-5 h-5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}