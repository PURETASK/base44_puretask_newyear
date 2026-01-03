import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import EnhancedCleanerCard from '../components/cleaner/EnhancedCleanerCard';
import StickyFiltersBar from '@/components/cleaner/StickyFiltersBar';
import AdvancedFiltersPanel from '@/components/cleaner/AdvancedFiltersPanel';
import QuickCompareDrawer from '@/components/cleaner/QuickCompareDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const SkeletonCleanerCard = () => (
  <div className="rounded-3xl shadow-xl h-full flex flex-col animate-pulse bg-gray-100">
    <div className="aspect-video bg-gray-300 rounded-t-3xl"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-300 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-gray-200 rounded-full"></div>
        <div className="h-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default function BrowseCleaners() {
  const navigate = useNavigate();
  const [allCleaners, setAllCleaners] = useState([]);
  const [filteredCleaners, setFilteredCleaners] = useState([]);
  const [blockedCleaners, setBlockedCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pinnedCleaners, setPinnedCleaners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cleanersPerPage = 5;
  
  const [selectedTier, setSelectedTier] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'tier_then_reliability',
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    minReliability: 0,
    availability: 'all',
    cleaningType: 'all',
    tier: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-apply when data loads or blocked list changes
    applyFilters();
  }, [allCleaners, blockedCleaners, selectedTier]);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const profiles = await base44.entities.CleanerProfile.filter(
        { is_active: true },
        '-reliability_score',
        500
      );
      
      if (profiles.length === 0) {
        setLoadError('No active cleaners found. Please check back later.');
        setLoading(false);
        return;
      }

      setAllCleaners(profiles);

      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        if (user.user_type === 'client') {
          const blocked = await base44.entities.BlockedCleaner.filter({ client_email: user.email });
          setBlockedCleaners(blocked.map(b => b.cleaner_email));
        }
      } catch (error) {
        setCurrentUser(null);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading cleaners:', showToast: false });
      setLoadError('Failed to load cleaners. Please refresh the page.');
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...allCleaners];

    if (blockedCleaners.length > 0) {
      result = result.filter(c => !blockedCleaners.includes(c.user_email));
    }

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c => 
        c.full_name?.toLowerCase().includes(searchLower) ||
        c.bio?.toLowerCase().includes(searchLower) ||
        c.service_locations?.some(loc => loc.toLowerCase().includes(searchLower))
      );
    }

    if (filters.minRating > 0) {
      result = result.filter(c => (c.average_rating || 0) >= filters.minRating);
    }

    if (filters.minReliability > 0) {
      result = result.filter(c => (c.reliability_score || 75) >= filters.minReliability);
    }

    result = result.filter(c => {
      const effectiveRate = (c.base_rate_credits_per_hour || c.hourly_rate || 300) / 10;
      return effectiveRate >= filters.minPrice && effectiveRate <= filters.maxPrice;
    });

    if (selectedTier !== 'all') {
      result = result.filter(c => c.tier === selectedTier);
    } else if (filters.tier !== 'all') {
      result = result.filter(c => c.tier === filters.tier);
    }

    // Sort based on selected option
    switch (filters.sortBy) {
      case 'top_rated':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'most_reliable':
        result.sort((a, b) => (b.reliability_score || 75) - (a.reliability_score || 75));
        break;
      case 'lowest_price':
        result.sort((a, b) => {
          const aRate = (a.base_rate_credits_per_hour || 300) / 10;
          const bRate = (b.base_rate_credits_per_hour || 300) / 10;
          return aRate - bRate;
        });
        break;
      case 'tier_then_reliability':
        // Sort by tier first, then reliability within each tier
        const tierOrder = { 'Elite': 0, 'Pro': 1, 'Semi Pro': 2, 'Developing': 3 };
        result.sort((a, b) => {
          const aTier = tierOrder[a.tier] ?? 4;
          const bTier = tierOrder[b.tier] ?? 4;
          if (aTier !== bTier) return aTier - bTier;
          return (b.reliability_score || 75) - (a.reliability_score || 75);
        });
        break;
      case 'recommended':
      default:
        result.sort((a, b) => {
          const aScore = ((a.reliability_score || 75) * 0.6) + ((a.average_rating || 5) * 20 * 0.4);
          const bScore = ((b.reliability_score || 75) * 0.6) + ((b.average_rating || 5) * 20 * 0.4);
          return bScore - aScore;
        });
    }

    setFilteredCleaners(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    applyFilters();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'tier_then_reliability',
      minPrice: 0,
      maxPrice: 100,
      minRating: 0,
      minReliability: 0,
      availability: 'all',
      cleaningType: 'all',
      tier: 'all'
    });
  };

  const handlePinCleaner = (cleaner) => {
    setPinnedCleaners(prev => {
      const isAlreadyPinned = prev.some(c => c.id === cleaner.id);
      if (isAlreadyPinned) {
        return prev.filter(c => c.id !== cleaner.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, cleaner];
    });
  };

  const handleRemovePin = (cleanerId) => {
    setPinnedCleaners(prev => prev.filter(c => c.id !== cleanerId));
  };

  const handleClearPins = () => {
    setPinnedCleaners([]);
  };

  const allLocations = [...new Set(allCleaners.flatMap(c => c.service_locations || []))].sort();

  const indexOfLastCleaner = currentPage * cleanersPerPage;
  const indexOfFirstCleaner = indexOfLastCleaner - cleanersPerPage;
  const currentCleaners = filteredCleaners.slice(indexOfFirstCleaner, indexOfLastCleaner);
  const totalPages = Math.ceil(filteredCleaners.length / cleanersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-fredoka font-bold text-graphite mb-2">Find Your Perfect Cleaner</h1>
            <p className="text-xl text-gray-600 font-verdana">Loading verified professionals...</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCleanerCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (loadError || allCleaners.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cloud p-6">
        <Card className="max-w-md rounded-3xl bg-white shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-fredoka font-bold text-graphite mb-2">
              {loadError || 'No Cleaners Available'}
            </h2>
            <p className="text-gray-600 mb-6 font-verdana">Please check back soon or try refreshing.</p>
            <Button onClick={loadData} className="brand-gradient text-white rounded-full font-fredoka">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 pb-24 sm:pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-fredoka font-bold text-slate-900 mb-2">
              Professional Cleaners
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-verdana">
              {allCleaners.length} verified professionals • Sorted by tier & reliability
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sticky Filters Bar */}
      <StickyFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onSearch={handleSearch}
        showAdvanced={showAdvancedFilters}
        setShowAdvanced={setShowAdvancedFilters}
        allLocations={allLocations}
      />

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <AdvancedFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowAdvancedFilters(false)}
            allLocations={allLocations}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Tier Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-fredoka font-bold text-slate-900 mb-4">Select Cleaner Tier</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <button
              onClick={() => setSelectedTier('all')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTier === 'all'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <p className="font-fredoka font-bold text-base mb-1">All Tiers</p>
              <p className="text-xs opacity-80">{allCleaners.length} cleaners</p>
            </button>
            
            <button
              onClick={() => setSelectedTier('Elite')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTier === 'Elite'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-600 text-white shadow-lg'
                  : 'bg-white border-purple-300 hover:bg-purple-50 text-slate-700'
              }`}
            >
              <p className="font-fredoka font-bold text-base mb-1">👑 Elite</p>
              <p className="text-xs opacity-80">{allCleaners.filter(c => c.tier === 'Elite').length} cleaners</p>
            </button>

            <button
              onClick={() => setSelectedTier('Pro')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTier === 'Pro'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 text-white shadow-lg'
                  : 'bg-white border-blue-300 hover:bg-blue-50 text-slate-700'
              }`}
            >
              <p className="font-fredoka font-bold text-base mb-1">⭐ Pro</p>
              <p className="text-xs opacity-80">{allCleaners.filter(c => c.tier === 'Pro').length} cleaners</p>
            </button>

            <button
              onClick={() => setSelectedTier('Semi Pro')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTier === 'Semi Pro'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-600 text-white shadow-lg'
                  : 'bg-white border-emerald-300 hover:bg-emerald-50 text-slate-700'
              }`}
            >
              <p className="font-fredoka font-bold text-base mb-1">💫 Semi Pro</p>
              <p className="text-xs opacity-80">{allCleaners.filter(c => c.tier === 'Semi Pro').length} cleaners</p>
            </button>

            <button
              onClick={() => setSelectedTier('Developing')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTier === 'Developing'
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-600 text-white shadow-lg'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <p className="font-fredoka font-bold text-base mb-1">🌟 Developing</p>
              <p className="text-xs opacity-80">{allCleaners.filter(c => c.tier === 'Developing').length} cleaners</p>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm sm:text-base text-slate-700 font-verdana">
            <span className="font-fredoka font-bold text-slate-900 text-lg sm:text-xl">
              {filteredCleaners.length}
            </span>
            {' '}professional{filteredCleaners.length !== 1 ? 's' : ''} available
            {totalPages > 1 && (
              <span className="text-slate-500 ml-2 text-xs sm:text-sm">• Page {currentPage} of {totalPages}</span>
            )}
          </p>
        </div>

        {/* Cleaners List (Professional Grid) */}
        {currentCleaners.length > 0 ? (
          <>
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {currentCleaners.map(cleaner => (
                <EnhancedCleanerCard
                  key={cleaner.id}
                  cleaner={cleaner}
                  onPin={handlePinCleaner}
                  isPinned={pinnedCleaners.some(c => c.id === cleaner.id)}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="rounded-lg font-fredoka font-semibold px-6 sm:px-8 h-11 border border-slate-300 disabled:opacity-40 text-sm hover:bg-slate-50"
                >
                  Previous
                </Button>
                <span className="font-verdana text-slate-700 font-medium text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg font-fredoka font-semibold px-6 sm:px-8 h-11 bg-slate-900 text-white hover:bg-slate-800 text-sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-0 shadow-xl rounded-3xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2">
                No cleaners match your filters
              </h3>
              <p className="text-gray-600 mb-6 font-verdana">
                Try adjusting your search criteria
              </p>
              <Button 
                onClick={resetFilters} 
                className="brand-gradient text-white rounded-full font-fredoka font-semibold px-8"
              >
                Reset All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Compare Drawer */}
      <QuickCompareDrawer
        pinnedCleaners={pinnedCleaners}
        onRemove={handleRemovePin}
        onClear={handleClearPins}
      />
    </div>
  );
}