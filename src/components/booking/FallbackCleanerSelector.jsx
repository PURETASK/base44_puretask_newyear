import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Info, Sparkles, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper for Skeleton Card
const SkeletonCleanerCard = () => (
  <div className="relative p-4 rounded-lg border-2 border-slate-200 bg-white animate-pulse">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="text-right">
        <div className="h-6 bg-slate-200 rounded w-12 mb-1"></div>
        <div className="h-3 bg-slate-200 rounded w-8"></div>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <div className="h-5 bg-slate-200 rounded w-20"></div>
      <div className="h-5 bg-slate-200 rounded w-32"></div>
    </div>
  </div>
);

// Helper for Tier Badge colors
const getTierColorClasses = (tier) => {
  switch (tier) {
    case 'Developing': return { bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'Semi Pro': return { bg: 'bg-green-100 text-green-800 border-green-200' };
    case 'Pro': return { bg: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'Elite': return { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    default: return { bg: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
};

export default function FallbackCleanerSelector({ 
  primaryCleanerEmail, 
  selectedBackups = [], 
  onBackupsChange,
  bookingDate,
  bookingTime 
}) {
  const [availableCleaners, setAvailableCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [primaryCleaner, setPrimaryCleaner] = useState(null);

  useEffect(() => {
    if (primaryCleanerEmail) {
      loadAvailableCleaners();
    }
  }, [primaryCleanerEmail]);

  // Calculate similarity score between cleaners
  const scoreCleanerSimilarity = (cleaner, primaryCleaner) => {
    let score = 0;
    
    // Similar hourly rate (within $10)
    const rateDiff = Math.abs(cleaner.hourly_rate - primaryCleaner.hourly_rate);
    if (rateDiff <= 10) {
      score += 30;
    } else if (rateDiff <= 20) {
      score += 15;
    }
    
    // Same tier
    if (cleaner.tier === primaryCleaner.tier) {
      score += 25;
    } else {
      // Adjacent tiers get partial credit
      const tiers = ['Developing', 'Semi Pro', 'Pro', 'Elite'];
      const primaryIndex = tiers.indexOf(primaryCleaner.tier);
      const cleanerIndex = tiers.indexOf(cleaner.tier);
      if (primaryIndex !== -1 && cleanerIndex !== -1 && Math.abs(primaryIndex - cleanerIndex) === 1) {
        score += 12;
      }
    }
    
    // Similar rating (within 0.5 stars)
    const ratingDiff = Math.abs(cleaner.average_rating - primaryCleaner.average_rating);
    if (ratingDiff <= 0.5) {
      score += 20;
    } else if (ratingDiff <= 1.0) {
      score += 10;
    }
    
    // Overlapping service tags
    const primaryTags = new Set(primaryCleaner.service_tags || []);
    const overlap = (cleaner.service_tags || []).filter(t => primaryTags.has(t));
    score += overlap.length * 5;
    
    // High reliability score
    if (cleaner.reliability_score >= 85) {
      score += 15;
    } else if (cleaner.reliability_score >= 75) {
      score += 8;
    }
    
    // Similar product preference
    if (cleaner.product_preference === primaryCleaner.product_preference) {
      score += 10;
    }
    
    return score;
  };

  const loadAvailableCleaners = async () => {
    setLoading(true);
    try {
      const [fetchedPrimary] = await base44.entities.CleanerProfile.filter(
        { user_email: primaryCleanerEmail }
      );
      setPrimaryCleaner(fetchedPrimary);
      
      if (!fetchedPrimary) {
        setAvailableCleaners([]);
        setLoading(false);
        return;
      }
      
      const allCleaners = await base44.entities.CleanerProfile.filter(
        { is_active: true },
        '-reliability_score',
        100
      );
      
      const others = allCleaners
        .filter(c => 
          c.user_email !== primaryCleanerEmail &&
          c.service_locations?.some(loc => fetchedPrimary.service_locations?.includes(loc))
        )
        .map(c => ({
          ...c,
          similarityScore: scoreCleanerSimilarity(c, fetchedPrimary)
        }))
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 8);
      
      setAvailableCleaners(others);
      
      // Auto-select top 2 if no selections yet
      if (selectedBackups.length === 0 && others.length >= 2) {
        onBackupsChange([others[0].user_email, others[1].user_email]);
      }
    } catch (error) {
      console.error('Error loading backup cleaners:', error);
    }
    setLoading(false);
  };

  const handleToggleBackup = (cleanerEmail) => {
    const current = [...selectedBackups];
    const index = current.indexOf(cleanerEmail);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(cleanerEmail);
    }
    
    onBackupsChange(current);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-900 mb-1">Smart Backup Selection</p>
          <p className="text-sm text-blue-800">
            We've pre-selected the 2 most similar cleaners to {primaryCleaner?.full_name || 'your first choice'} 
            based on rate, tier, ratings, and services. You can change these anytime.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCleanerCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {availableCleaners.map((cleaner, index) => {
            const isRecommended = index < 2;
            const isSelected = selectedBackups.includes(cleaner.user_email);
            const selectionIndex = selectedBackups.indexOf(cleaner.user_email);
            
            return (
              <motion.div
                key={cleaner.user_email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
                onClick={() => handleToggleBackup(cleaner.user_email)}
              >
                {isRecommended && !isSelected && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-emerald-500 text-white shadow-lg">
                      Backup #{selectionIndex + 1}
                    </Badge>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    {cleaner.profile_photo_url ? (
                      <img
                        src={cleaner.profile_photo_url}
                        alt={cleaner.full_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                        {cleaner.full_name ? cleaner.full_name[0].toUpperCase() : '?'}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{cleaner.full_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span>{cleaner.average_rating?.toFixed(1) || 'N/A'}</span>
                      <span>•</span>
                      <span>{cleaner.total_jobs || 0} jobs</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      ${cleaner.hourly_rate}
                    </p>
                    <p className="text-xs text-slate-500">per hour</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getTierColorClasses(cleaner.tier).bg}>
                    {cleaner.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {cleaner.reliability_score}/100 reliability
                  </Badge>
                </div>

                {isRecommended && (
                  <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-700">
                    <strong>Why recommended:</strong> Similar rate, tier, and services
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedBackups.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-900 mb-1">No Backup Cleaners Selected</p>
            <p className="text-sm text-amber-800">
              Select at least one backup to ensure your cleaning gets confirmed even if your 
              first choice isn't available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}