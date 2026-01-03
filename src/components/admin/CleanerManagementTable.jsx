
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { CleanerProfile } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Eye, CheckCircle, XCircle, Search, Ban, Play, AlertCircle } from 'lucide-react';
import CleanerDetailsModal from './CleanerDetailsModal';
import { calculateReliabilityScore } from '../reliability/ReliabilityScoreCalculator';

export default function CleanerManagementTable({ onCleanerSelect = () => {}, showOnlyPending = false }) {
  // 'cleaners' will now hold combined objects: { ...CleanerProfile, user: User | PlaceholderUser }
  const [cleaners, setCleaners] = useState([]); 
  const [filteredCleaners, setFilteredCleaners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // 'selectedCleaner' will be a combined { ...CleanerProfile, user: User | PlaceholderUser } object
  const [selectedCleaner, setSelectedCleaner] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCleaners();
  }, []);

  useEffect(() => {
    filterCleaners();
  }, [searchTerm, cleaners, showOnlyPending]); // Removed 'profiles' from dependencies

  const loadCleaners = async () => {
    try {
      const allProfiles = await CleanerProfile.list();
      
      // For admin purposes, we need user verification data.
      // We'll load users individually only for profiles we're displaying.
      const profilesWithUsers = await Promise.all(
        allProfiles.map(async (profile) => {
          try {
            // Try to get the user, but don't fail if we can't
            const users = await User.filter({ email: profile.user_email });
            const user = users.length > 0 ? users[0] : {
              // Placeholder user object
              id: `ghost-${profile.id}`, // Unique ID for placeholder user
              full_name: profile.full_name || 'Unknown User', // Use profile.full_name if available
              email: profile.user_email || 'unknown@example.com',
              kyc_status: 'unknown',
              background_check_status: 'unknown',
              user_type: 'cleaner', // Default user type for placeholder
            };
            return { ...profile, user };
          } catch (error) {
            // Fallback if user query fails, create a placeholder User object
            console.warn(`Could not retrieve user for email: ${profile.user_email}. Error: ${error.message}`);
            return {
              ...profile,
              user: {
                id: `ghost-${profile.id}`, // Unique ID for placeholder user
                full_name: profile.full_name || 'Unknown User', // Use profile.full_name if available
                email: profile.user_email || 'unknown@example.com',
                kyc_status: 'unknown',
                background_check_status: 'unknown',
                user_type: 'cleaner', // Default user type for placeholder
              }
            };
          }
        })
      );

      setCleaners(profilesWithUsers);
    } catch (error) {
      console.error('Error loading cleaners:', error);
    }
    setLoading(false);
  };

  const filterCleaners = () => {
    let filtered = cleaners; // 'cleaners' now contains the combined profile+user objects

    if (showOnlyPending) {
      filtered = filtered.filter(c => 
        c.user.kyc_status === 'pending' || c.user.background_check_status === 'pending'
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCleaners(filtered);
  };

  // Action handlers now receive the combined 'cleaner' object, but act on User or CleanerProfile entities
  const handleApproveKYC = async (cleaner) => {
    try {
      if (cleaner.user.id.startsWith('ghost-')) {
        console.warn('Cannot approve KYC for a placeholder user without a real user record.');
        return;
      }
      await User.update(cleaner.user.id, { kyc_status: 'approved' });
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const handleRejectKYC = async (cleaner) => {
    try {
      if (cleaner.user.id.startsWith('ghost-')) {
        console.warn('Cannot reject KYC for a placeholder user without a real user record.');
        return;
      }
      await User.update(cleaner.user.id, { kyc_status: 'rejected' });
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  const handleApproveBGC = async (cleaner) => {
    try {
      if (cleaner.user.id.startsWith('ghost-')) {
        console.warn('Cannot approve BGC for a placeholder user without a real user record.');
        return;
      }
      await User.update(cleaner.user.id, { background_check_status: 'approved' });
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error approving BGC:', error);
    }
  };

  const handleRejectBGC = async (cleaner) => {
    try {
      if (cleaner.user.id.startsWith('ghost-')) {
        console.warn('Cannot reject BGC for a placeholder user without a real user record.');
        return;
      }
      await User.update(cleaner.user.id, { background_check_status: 'rejected' });
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error rejecting BGC:', error);
    }
  };

  const handleSuspend = async (cleaner) => { // 'cleaner' is the combined object, containing profile properties
    try {
      await CleanerProfile.update(cleaner.id, { is_active: false }); // 'cleaner.id' is the CleanerProfile's ID
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error suspending cleaner:', error);
    }
  };

  const handleActivate = async (cleaner) => { // 'cleaner' is the combined object, containing profile properties
    try {
      await CleanerProfile.update(cleaner.id, { is_active: true }); // 'cleaner.id' is the CleanerProfile's ID
      
      const newScore = await calculateReliabilityScore(cleaner.user.email);
      let tier = 'Basic';
      if (newScore >= 85) tier = 'Elite';
      else if (newScore >= 70) tier = 'Pro';
      
      await CleanerProfile.update(cleaner.id, {
        reliability_score: newScore,
        tier: tier
      });
      
      await loadCleaners();
      if (onCleanerSelect) onCleanerSelect();
    } catch (error) {
      console.error('Error activating cleaner:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'pending':
        return 'bg-amber-500 text-white';
      case 'unknown': // Added for placeholder users' statuses
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

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
          <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-slate-700" />
              <span>{showOnlyPending ? 'Pending Verifications' : 'All Cleaners'}</span>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cleaners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">KYC Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">BGC Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Active</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Tier</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCleaners.map(cleaner => {
                  const isGhostUser = cleaner.user.id.startsWith('ghost-'); // Check if the user record is a placeholder
                  return (
                    // Use cleaner.id (profile ID) for the key, as it's guaranteed to be unique per row
                    <tr key={cleaner.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">
                          {cleaner.user.full_name}
                          {isGhostUser && (
                            <Badge variant="outline" className="ml-2 text-slate-500 border-slate-300">
                              <AlertCircle className="inline-block w-3 h-3 mr-1" /> No User Record
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-sm">{cleaner.user.email}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className={getStatusColor(cleaner.user.kyc_status)}>
                            {cleaner.user.kyc_status}
                          </Badge>
                          {/* Enable KYC actions only for non-ghost users with pending status */}
                          {cleaner.user.kyc_status === 'pending' && !isGhostUser && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveKYC(cleaner)} // Pass combined cleaner object
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 h-7 px-2"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectKYC(cleaner)} // Pass combined cleaner object
                                className="text-red-600 border-red-300 hover:bg-red-50 h-7 px-2"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className={getStatusColor(cleaner.user.background_check_status)}>
                            {cleaner.user.background_check_status}
                          </Badge>
                          {/* Enable BGC actions only for non-ghost users with pending status */}
                          {cleaner.user.background_check_status === 'pending' && !isGhostUser && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveBGC(cleaner)} // Pass combined cleaner object
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 h-7 px-2"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectBGC(cleaner)} // Pass combined cleaner object
                                className="text-red-600 border-red-300 hover:bg-red-50 h-7 px-2"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {/* 'cleaner' itself now contains profile properties like is_active */}
                        <Badge className={cleaner.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}>
                            {cleaner.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {/* 'cleaner' itself now contains profile properties like tier */}
                        <Badge variant="outline" className="font-semibold">{cleaner.tier}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCleaner(cleaner)} // Pass the entire combined object
                            className="hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* Suspend/Activate buttons directly use the 'cleaner' (combined) object */}
                          {cleaner.is_active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspend(cleaner)} // Pass combined cleaner object
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivate(cleaner)} // Pass combined cleaner object
                              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredCleaners.length === 0 && (
              <div className="text-center py-16">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">
                  {showOnlyPending ? 'No pending verifications' : 'No cleaners found'}
                </p>
                <p className="text-sm text-slate-500">
                  {showOnlyPending 
                    ? 'All cleaners have been verified' 
                    : searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'Cleaners will appear here after they complete onboarding'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCleaner && (
        <CleanerDetailsModal
          cleaner={selectedCleaner.user} // Pass the User part of the combined object
          profile={selectedCleaner}     // Pass the CleanerProfile part (which is the combined object itself)
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
