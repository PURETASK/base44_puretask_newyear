import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdvancedFiltersPanel({ filters, onFilterChange, onClose, allLocations }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-soft-cloud border-b-2 border-gray-200"
    >
      <Card className="max-w-7xl mx-auto border-0 shadow-none rounded-none bg-transparent">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-fredoka font-bold text-graphite">Filter Options</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div>
              <label className="text-sm font-fredoka font-semibold text-gray-700 mb-3 block">
                Price Range (credits/hr)
              </label>
              <div className="space-y-3">
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    onFilterChange('minPrice', min);
                    onFilterChange('maxPrice', max);
                  }}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm font-verdana text-gray-600">
                  <span>{filters.minPrice} credits</span>
                  <span>{filters.maxPrice} credits</span>
                </div>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-sm font-fredoka font-semibold text-gray-700 mb-3 block">
                Minimum Rating
              </label>
              <Select 
                value={filters.minRating.toString()} 
                onValueChange={(value) => onFilterChange('minRating', parseFloat(value))}
              >
                <SelectTrigger className="rounded-full border-2 border-gray-200 font-verdana bg-white">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.8">4.8+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reliability Score */}
            <div>
              <label className="text-sm font-fredoka font-semibold text-gray-700 mb-3 block">
                Reliability Score
              </label>
              <Select 
                value={filters.minReliability.toString()} 
                onValueChange={(value) => onFilterChange('minReliability', parseInt(value))}
              >
                <SelectTrigger className="rounded-full border-2 border-gray-200 font-verdana bg-white">
                  <SelectValue placeholder="Any score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any score</SelectItem>
                  <SelectItem value="90">Elite (90-100)</SelectItem>
                  <SelectItem value="75">Pro (75-89)</SelectItem>
                  <SelectItem value="60">Semi Pro (60-74)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <label className="text-sm font-fredoka font-semibold text-gray-700 mb-3 block">
                Availability
              </label>
              <Select 
                value={filters.availability} 
                onValueChange={(value) => onFilterChange('availability', value)}
              >
                <SelectTrigger className="rounded-full border-2 border-gray-200 font-verdana bg-white">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cleaning Type */}
            <div>
              <label className="text-sm font-fredoka font-semibold text-gray-700 mb-3 block">
                Cleaning Type Specialty
              </label>
              <Select 
                value={filters.cleaningType} 
                onValueChange={(value) => onFilterChange('cleaningType', value)}
              >
                <SelectTrigger className="rounded-full border-2 border-gray-200 font-verdana bg-white">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="basic">Basic clean</SelectItem>
                  <SelectItem value="deep">Deep clean</SelectItem>
                  <SelectItem value="move-out">Move-out clean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tier */}
            <div>
              <label className="text-sm font-fredoka font-semibold text-gray-700 mb-3 block">
                Tier Level
              </label>
              <Select 
                value={filters.tier} 
                onValueChange={(value) => onFilterChange('tier', value)}
              >
                <SelectTrigger className="rounded-full border-2 border-gray-200 font-verdana bg-white">
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="Elite">Elite</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Semi Pro">Semi Pro</SelectItem>
                  <SelectItem value="Developing">Developing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}