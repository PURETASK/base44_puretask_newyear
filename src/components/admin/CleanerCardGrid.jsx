
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Shield, Award, Star, MapPin, Clock, Eye, Ban, Play } from 'lucide-react'; // Removed CheckCircle, XCircle
import { motion } from 'framer-motion';
import CleanerDetailsModal from './CleanerDetailsModal';
import ReliabilityMeter from '../reliability/ReliabilityMeter'; // This component is not used in the current version of the file, but keep the import.
import { calculateReliabilityScore } from '../reliability/ReliabilityScoreCalculator';

export default function CleanerCardGrid({ onCleanerSelect }) {
  const [cleaners, setCleaners] = useState([]);
  const [filteredCleaners, setFilteredCleaners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCleaners();
  }, []);

  useEffect(() => {
    filterCleaners();
  }, [searchTerm, statusFilter, tierFilter, cleaners]);

  const loadCleaners = async () => {
    try {
      // Profiles now have full_name, no need to match with User entity
      const allProfiles = await base44.entities.CleanerProfile.list('-reliability_score');
      setCleaners(allProfiles);
    } catch (error) {
      console.error('Error loading cleaners:', error);
    }
    setLoading(false);
  };

  const filterCleaners = () => {
    let filtered = cleaners;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.service_locations?.some(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(profile => profile.is_active);
      } else if (statusFilter === 'suspended') {
        filtered = filtered.filter(profile => !profile.is_active);
      }
      // The 'pending' status filter logic has been removed as it relied on User entity properties.
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(profile => profile.tier === tierFilter);
    }

    setFilteredCleaners(filtered);
  };

  const handleSuspend = async (profile) => {
    try {
      await base44.entities.CleanerProfile.update(profile.id, { is_active: false });
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error suspending cleaner:', error);
    }
  };

  const handleActivate = async (profile) => {
    try {
      await base44.entities.CleanerProfile.update(profile.id, { is_active: true });
      
      const newScore = await calculateReliabilityScore(profile.user_email);
      let tier = 'Basic';
      if (newScore >= 85) tier = 'Elite';
      else if (newScore >= 70) tier = 'Pro';
      
      await base44.entities.CleanerProfile.update(profile.id, {
        reliability_score: newScore,
        tier: tier
      });
      
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error activating cleaner:', error);
    }
  };

  const tierColors = {
    Elite: 'from-amber-400 to-yellow-500',
    Pro: 'from-blue-500 to-cyan-500',
    Basic: 'from-slate-400 to-gray-500'
  };

  // getVerificationStatus function removed as KYC/background check status are no longer combined from User entity.

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">Loading cleaners...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-700" />
            All Cleaner Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="suspended">Suspended Only</SelectItem>
                {/* 'Pending Verification' filter removed */}
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <Badge variant="outline" className="text-slate-600">
              {filteredCleaners.length} cleaner{filteredCleaners.length !== 1 ? 's' : ''} found
            </Badge>
          </div>

          {/* Cleaner Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCleaners.map((profile) => {
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-0 bg-white h-full">
                    <div className={`h-2 bg-gradient-to-r ${tierColors[profile.tier]}`} />
                    <CardContent className="p-6">
                      {/* Header with Avatar and Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {profile.full_name ? profile.full_name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{profile.full_name || 'Cleaner'}</h3>
                            <p className="text-xs text-slate-500">{profile.user_email}</p>
                          </div>
                        </div>
                        {/* Replaced verification badge with active/suspended badge */}
                        <Badge className={profile.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}>
                          {profile.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                      </div>

                      {/* Tier and Reliability */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`bg-gradient-to-r ${tierColors[profile.tier]} text-white`}>
                          <Award className="w-3 h-3 mr-1" />
                          {profile.tier}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="relative w-12 h-12">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="4"
                              />
                              <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                fill="none"
                                stroke={profile.reliability_score >= 85 ? '#10b981' : profile.reliability_score >= 70 ? '#3b82f6' : '#f59e0b'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 45 * (profile.reliability_score / 100)} ${2 * Math.PI * 45}`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">{profile.reliability_score}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <div className="flex items-center gap-1 text-emerald-600 mb-1">
                            <Star className="w-3 h-3 fill-emerald-500" />
                            <span className="text-xs font-medium">Rating</span>
                          </div>
                          <p className="text-lg font-bold text-slate-900">{profile.average_rating.toFixed(1)}</p>
                          <p className="text-xs text-slate-500">{profile.total_reviews} reviews</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-1 text-blue-600 mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">Jobs</span>
                          </div>
                          <p className="text-lg font-bold text-slate-900">{profile.total_jobs}</p>
                          <p className="text-xs text-slate-500">{profile.on_time_rate}% on-time</p>
                        </div>
                      </div>

                      {/* Location */}
                      {profile.service_locations && profile.service_locations.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="truncate">{profile.service_locations.slice(0, 2).join(', ')}</span>
                          {profile.service_locations.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{profile.service_locations.length - 2}</Badge>
                          )}
                        </div>
                      )}

                      {/* Hourly Rate */}
                      <div className="mb-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-slate-900">${profile.hourly_rate}</span>
                            <span className="text-slate-500 ml-1">/hour</span>
                          </div>
                          {/* Active/Suspended badge was here, moved to header */}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCleaner(profile)} // Pass the profile object directly
                          className="flex-1 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {profile.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspend(profile)} // Pass the profile object directly
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivate(profile)} // Pass the profile object directly
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredCleaners.length === 0 && (
            <div className="text-center py-16">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700 mb-2">No cleaners found</p>
              <p className="text-sm text-slate-500">
                {searchTerm || statusFilter !== 'all' || tierFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Cleaners will appear here after they complete onboarding'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCleaner && (
        <CleanerDetailsModal
          cleaner={selectedCleaner} // selectedCleaner is now the full profile object
          profile={selectedCleaner} // Pass the same profile object to both props
          onClose={() => setSelectedCleaner(null)}
          onUpdate={() => {
            loadCleaners();
            if (onCleanerSelect) onCleanerSelect();
          }}
        />
      )}
    </>
  );
}
