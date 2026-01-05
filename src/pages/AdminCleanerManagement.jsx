import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminPermissions } from '@/components/admin/AdminPermissions';
import { AdminAuditLogger } from '@/components/admin/AdminAuditLogger';
import RiskScoreDisplay from '@/components/risk/RiskScoreDisplay';
import {
  Users, Star, Loader2, Ban, CheckCircle, Filter, X, Grid, List,
  Edit, MessageSquare, Award, Clock, MapPin, Briefcase, Activity,
  CheckSquare, Download, BarChart3, Shield, BookmarkCheck, ChevronRight, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTierBadgeColor, getTierCardClasses, getTierChartColor, getTierSolidColor } from '../components/utils/tierColors';

export default function AdminCleanerManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaners, setCleaners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [cleanerDetails, setCleanerDetails] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [detailsTab, setDetailsTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [expandedTiers, setExpandedTiers] = useState({
    'Elite': true,
    'Pro': true,
    'Semi Pro': true,
    'Developing': true
  });
  
  // Filters
  const [filters, setFilters] = useState({
    tier: [],
    status: [],
    minRating: 0,
    serviceTags: [],
    minJobs: 0
  });

  // Saved views
  const [savedViews, setSavedViews] = useState([]);
  const [currentView, setCurrentView] = useState('default');

  useEffect(() => {
    checkAdminAndLoad();
    loadSavedViews();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const currentUser = await base44.auth.me();
      const isAdmin = await AdminPermissions.isAdmin(currentUser);
      
      if (!isAdmin) {
        navigate(createPageUrl('Home'));
        return;
      }
      
      setUser(currentUser);
      await loadCleaners();
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadCleaners = async () => {
    setLoading(true);
    try {
      const profiles = await base44.entities.CleanerProfile.list('-created_date', 300);
      setCleaners(profiles);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading cleaners:', showToast: false });
      setLoading(false);
    }
  };

  const loadSavedViews = async () => {
    try {
      const views = await base44.entities.AdminSavedView.filter({
        target: 'cleaners'
      });
      setSavedViews(views);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading saved views:', showToast: false });
    }
  };

  const loadCleanerDetails = async (cleaner) => {
    setLoadingDetails(true);
    try {
      const [bookings, disputes, earnings, riskProfiles, analytics, auditLogs] = await Promise.all([
        base44.entities.Booking.filter({ cleaner_email: cleaner.user_email }),
        base44.entities.Dispute.filter({ filed_by_email: cleaner.user_email }),
        base44.entities.CleanerEarning.filter({ cleaner_email: cleaner.user_email }),
        base44.entities.RiskProfile.filter({ user_email: cleaner.user_email, user_type: 'cleaner' }),
        base44.entities.CleanerAnalytics.filter({ cleaner_email: cleaner.user_email }),
        base44.entities.AdminAuditLog.filter({ target_type: 'cleaner', target_id: cleaner.user_email })
      ]);

      const completedJobs = bookings.filter(b => b.status === 'completed' || b.status === 'approved').length;
      const totalEarnings = earnings
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + (e.credits_earned || 0), 0);

      // Calculate monthly stats for charts
      const monthlyData = calculateMonthlyStats(bookings, earnings);

      // Calculate onboarding progress
      const onboardingProgress = calculateOnboardingProgress(cleaner, bookings);

      setCleanerDetails({
        ...cleaner,
        totalBookings: bookings.length,
        completedJobs,
        disputes: disputes.length,
        totalEarnings,
        bookings,
        earnings,
        monthlyData,
        riskProfile: riskProfiles.length > 0 ? riskProfiles[0] : null,
        analytics: analytics.length > 0 ? analytics[0] : null,
        auditLogs: auditLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
        onboardingProgress
      });
      
      setSelectedCleaner(cleaner);
      setEditData({
        tier: cleaner.tier,
        payout_percentage: cleaner.payout_percentage,
        base_rate_credits_per_hour: cleaner.base_rate_credits_per_hour,
        is_active: cleaner.is_active
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading cleaner details:', showToast: false });
    } finally {
      setLoadingDetails(false);
    }
  };

  const calculateMonthlyStats = (bookings, earnings) => {
    const monthlyMap = {};
    const now = new Date();
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { month: key, jobs: 0, earnings: 0 };
    }

    bookings.forEach(b => {
      const date = new Date(b.created_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].jobs++;
      }
    });

    earnings.forEach(e => {
      if (e.status === 'paid' && e.created_date) {
        const date = new Date(e.created_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[key]) {
          monthlyMap[key].earnings += (e.credits_earned || 0) / 10;
        }
      }
    });

    return Object.values(monthlyMap);
  };

  const calculateOnboardingProgress = (cleaner, bookings) => {
    const steps = [
      { id: 'profile_photo', label: 'Profile Photo', completed: !!cleaner.profile_photo_url },
      { id: 'bio', label: 'Bio Written', completed: !!cleaner.bio },
      { id: 'availability', label: 'Availability Set', completed: cleaner.availability && cleaner.availability.length > 0 },
      { id: 'pricing', label: 'Pricing Configured', completed: !!cleaner.base_rate_credits_per_hour },
      { id: 'first_job', label: 'First Job Completed', completed: bookings.some(b => b.status === 'completed' || b.status === 'approved') },
      { id: 'stripe', label: 'Stripe Connected', completed: !!cleaner.stripe_account_id }
    ];

    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    return { steps, completedSteps, totalSteps: steps.length, progress };
  };

  const handleSuspendCleaner = async () => {
    if (!cleanerDetails) return;
    
    const hasPermission = await AdminPermissions.hasCapability(user.email, 'can_block_users');
    if (!hasPermission) {
      alert('You do not have permission to suspend cleaners');
      return;
    }

    const reason = prompt('Reason for suspension:');
    if (!reason) return;

    try {
      await AdminAuditLogger.log({
        adminEmail: user.email,
        actionType: 'SUSPEND_CLEANER',
        targetType: 'cleaner',
        targetId: cleanerDetails.user_email,
        beforeState: { is_active: cleanerDetails.is_active },
        afterState: { is_active: false },
        metadata: { reason }
      });

      await base44.entities.CleanerProfile.update(cleanerDetails.id, {
        is_active: false
      });

      alert('Cleaner suspended');
      setSelectedCleaner(null);
      loadCleaners();
    } catch (error) {
      handleError(error, { userMessage: 'Error suspending cleaner:', showToast: false });
      alert('Failed to suspend cleaner');
    }
  };

  const handleReactivateCleaner = async () => {
    if (!cleanerDetails) return;

    try {
      await AdminAuditLogger.log({
        adminEmail: user.email,
        actionType: 'REACTIVATE_CLEANER',
        targetType: 'cleaner',
        targetId: cleanerDetails.user_email,
        beforeState: { is_active: cleanerDetails.is_active },
        afterState: { is_active: true },
        metadata: {}
      });

      await base44.entities.CleanerProfile.update(cleanerDetails.id, {
        is_active: true
      });

      alert('Cleaner reactivated');
      setSelectedCleaner(null);
      loadCleaners();
    } catch (error) {
      handleError(error, { userMessage: 'Error reactivating cleaner:', showToast: false });
      alert('Failed to reactivate cleaner');
    }
  };

  const handleSaveEdit = async () => {
    if (!cleanerDetails) return;

    try {
      await AdminAuditLogger.log({
        adminEmail: user.email,
        actionType: 'UPDATE_CLEANER_PROFILE',
        targetType: 'cleaner',
        targetId: cleanerDetails.user_email,
        beforeState: {
          tier: cleanerDetails.tier,
          payout_percentage: cleanerDetails.payout_percentage,
          base_rate_credits_per_hour: cleanerDetails.base_rate_credits_per_hour,
          is_active: cleanerDetails.is_active
        },
        afterState: editData,
        metadata: {}
      });

      await base44.entities.CleanerProfile.update(cleanerDetails.id, editData);

      alert('Cleaner profile updated');
      setEditMode(false);
      loadCleanerDetails(cleanerDetails);
      loadCleaners();
    } catch (error) {
      handleError(error, { userMessage: 'Error updating cleaner:', showToast: false });
      alert('Failed to update cleaner');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCleaners.length === 0) {
      alert('Please select cleaners first');
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedCleaners.length} cleaners?`);
    if (!confirmed) return;

    try {
      for (const cleanerId of selectedCleaners) {
        const cleaner = cleaners.find(c => c.id === cleanerId);
        if (!cleaner) continue;

        if (action === 'suspend') {
          await base44.entities.CleanerProfile.update(cleanerId, { is_active: false });
          await AdminAuditLogger.log({
            adminEmail: user.email,
            actionType: 'BULK_SUSPEND_CLEANER',
            targetType: 'cleaner',
            targetId: cleaner.user_email,
            metadata: { bulk: true }
          });
        } else if (action === 'reactivate') {
          await base44.entities.CleanerProfile.update(cleanerId, { is_active: true });
          await AdminAuditLogger.log({
            adminEmail: user.email,
            actionType: 'BULK_REACTIVATE_CLEANER',
            targetType: 'cleaner',
            targetId: cleaner.user_email,
            metadata: { bulk: true }
          });
        }
      }

      alert(`Bulk action completed for ${selectedCleaners.length} cleaners`);
      setSelectedCleaners([]);
      loadCleaners();
    } catch (error) {
      handleError(error, { userMessage: 'Bulk action error:', showToast: false });
      alert('Failed to complete bulk action');
    }
  };

  const handleSaveView = async () => {
    const viewName = prompt('Enter a name for this view:');
    if (!viewName) return;

    try {
      await base44.entities.AdminSavedView.create({
        admin_email: user.email,
        name: viewName,
        target: 'cleaners',
        filters: filters,
        sort: {},
        is_shared: false
      });

      alert('View saved');
      loadSavedViews();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving view:', showToast: false });
      alert('Failed to save view');
    }
  };

  const handleLoadView = (view) => {
    setFilters(view.filters);
    setCurrentView(view.name);
  };



  const toggleTier = (tier) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const getActivityStatus = (cleaner) => {
    // Check for banned status (not active but has specific risk flags)
    if (!cleaner.is_active) {
      const isBanned = (cleaner.dispute_rate > 50 || cleaner.no_show_rate > 50);
      if (isBanned) {
        return { status: 'banned', label: 'Banned', color: 'gradient-red-orange' };
      }
      return { status: 'suspended', label: 'Suspended', color: 'bg-red-500' };
    }
    
    // Check if cleaner is actually active (has recent activity)
    if (cleaner.updated_date) {
      const lastUpdate = new Date(cleaner.updated_date);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate < 7) {
        return { status: 'active', label: 'Active', color: 'bg-green-500' };
      }
    }
    
    // Default to inactive if no recent activity
    return { status: 'inactive', label: 'Inactive', color: 'bg-gray-500' };
  };

  const filteredCleaners = cleaners.filter(c => {
    // Search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        c.user_email.toLowerCase().includes(search) ||
        (c.full_name && c.full_name.toLowerCase().includes(search));
      if (!matchesSearch) return false;
    }

    // Tier filter
    if (filters.tier.length > 0 && !filters.tier.includes(c.tier)) return false;

    // Status filter
    if (filters.status.length > 0) {
      if (filters.status.includes('active') && !c.is_active) return false;
      if (filters.status.includes('suspended') && c.is_active) return false;
    }

    // Min rating filter
    if (filters.minRating > 0 && (c.average_rating || 0) < filters.minRating) return false;

    // Min jobs filter
    if (filters.minJobs > 0 && (c.total_jobs || 0) < filters.minJobs) return false;

    // Service tags filter
    if (filters.serviceTags.length > 0) {
      const cleanerTags = c.service_tags || [];
      const hasTag = filters.serviceTags.some(tag => cleanerTags.includes(tag));
      if (!hasTag) return false;
    }

    return true;
  });

  const handleExportCleaners = () => {
    const csvData = filteredCleaners.map(c => ({
      Email: c.user_email,
      Name: c.full_name || '',
      Tier: c.tier,
      'Reliability Score': c.reliability_score || 0,
      'Total Jobs': c.total_jobs || 0,
      'Average Rating': c.average_rating || 0,
      'Total Reviews': c.total_reviews || 0,
      Status: c.is_active ? 'Active' : 'Suspended',
      'Service Locations': (c.service_locations || []).join('; ')
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaners_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Tier distribution
  const tierDistribution = ['Elite', 'Pro', 'Semi Pro', 'Developing'].map(tier => ({
    tier,
    count: filteredCleaners.filter(c => c.tier === tier).length,
    percentage: ((filteredCleaners.filter(c => c.tier === tier).length / filteredCleaners.length) * 100).toFixed(1)
  }));

  // Group cleaners by tier
  const cleanersByTier = {
    'Elite': filteredCleaners.filter(c => c.tier === 'Elite'),
    'Pro': filteredCleaners.filter(c => c.tier === 'Pro'),
    'Semi Pro': filteredCleaners.filter(c => c.tier === 'Semi Pro'),
    'Developing': filteredCleaners.filter(c => c.tier === 'Developing')
  };

  // Pagination
  const totalPages = Math.ceil(filteredCleaners.length / itemsPerPage);
  const paginatedCleaners = filteredCleaners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCleanerSelection = (cleanerId) => {
    setSelectedCleaners(prev =>
      prev.includes(cleanerId)
        ? prev.filter(id => id !== cleanerId)
        : [...prev, cleanerId]
    );
  };

  const selectAllCleaners = () => {
    if (selectedCleaners.length === paginatedCleaners.length) {
      setSelectedCleaners([]);
    } else {
      setSelectedCleaners(paginatedCleaners.map(c => c.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Cleaner Management</h1>
            <p className="text-gray-600 font-verdana mt-2">
              {filteredCleaners.length} cleaners {selectedCleaners.length > 0 && `• ${selectedCleaners.length} selected`}
            </p>
          </div>
          
          {/* Status Legend */}
          <Card className="border-2 border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs font-fredoka font-bold text-gray-700 mb-2">Status Legend</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs font-verdana text-gray-700">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs font-verdana text-gray-700">Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs font-verdana text-gray-700">Suspended</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #ef4444 50%, #f97316 50%)' }}></div>
                  <span className="text-xs font-verdana text-gray-700">Banned</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')} variant="outline" className="font-fredoka">
            {viewMode === 'cards' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
            {viewMode === 'cards' ? 'Table View' : 'Card View'}
          </Button>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="font-fredoka">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleExportCleaners} variant="outline" className="font-fredoka">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Tier Distribution Chart */}
        <Card className="border-2 border-puretask-blue">
          <CardHeader>
            <CardTitle className="font-fredoka flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-puretask-blue" />
              Cleaner Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={tierDistribution}
                      dataKey="count"
                      nameKey="tier"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.tier}: ${entry.count}`}
                    >
                      {tierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getTierChartColor(entry.tier)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {tierDistribution.map(tier => (
                  <div key={tier.tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getTierSolidColor(tier.tier) }}></div>
                      <span className="font-fredoka font-semibold">{tier.tier}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-verdana text-gray-600">{tier.count} cleaners</span>
                      <Badge className={getTierBadgeColor(tier.tier)}>{tier.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="border-2 border-puretask-blue">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-fredoka">
                    <span>Advanced Filters</span>
                    <Button onClick={() => setFilters({ tier: [], status: [], minRating: 0, serviceTags: [], minJobs: 0 })} variant="ghost" size="sm">
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Tier Filter */}
                    <div>
                      <label className="block text-sm font-fredoka font-semibold mb-2">Tier</label>
                      <div className="space-y-2">
                        {['Elite', 'Pro', 'Semi Pro', 'Developing'].map(tier => (
                          <label key={tier} className="flex items-center gap-2">
                            <Checkbox
                              checked={filters.tier.includes(tier)}
                              onCheckedChange={(checked) => {
                                setFilters(prev => ({
                                  ...prev,
                                  tier: checked ? [...prev.tier, tier] : prev.tier.filter(t => t !== tier)
                                }));
                              }}
                            />
                            <span className="text-sm font-verdana">{tier}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-fredoka font-semibold mb-2">Status</label>
                      <div className="space-y-2">
                        {['active', 'suspended'].map(status => (
                          <label key={status} className="flex items-center gap-2">
                            <Checkbox
                              checked={filters.status.includes(status)}
                              onCheckedChange={(checked) => {
                                setFilters(prev => ({
                                  ...prev,
                                  status: checked ? [...prev.status, status] : prev.status.filter(s => s !== status)
                                }));
                              }}
                            />
                            <span className="text-sm font-verdana capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Min Jobs Filter */}
                    <div>
                      <label className="block text-sm font-fredoka font-semibold mb-2">Min Jobs Completed</label>
                      <Input
                        type="number"
                        value={filters.minJobs}
                        onChange={(e) => setFilters(prev => ({ ...prev, minJobs: parseInt(e.target.value) || 0 }))}
                        className="font-verdana"
                      />
                    </div>
                  </div>

                  {/* Service Tags Filter */}
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-fredoka font-semibold mb-2">Service Tags</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['Pet-Friendly', 'Eco-Warrior', 'Deep Clean Expert', 'Move-Out Specialist', 'Same-Day Available', 'Senior-Friendly'].map(tag => (
                        <label key={tag} className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.serviceTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                serviceTags: checked ? [...prev.serviceTags, tag] : prev.serviceTags.filter(t => t !== tag)
                              }));
                            }}
                          />
                          <span className="text-xs font-verdana">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Saved Views */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-fredoka font-semibold">Saved Views</label>
                      <Button onClick={handleSaveView} size="sm" variant="outline" className="font-fredoka">
                        <BookmarkCheck className="w-4 h-4 mr-1" />
                        Save Current View
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {savedViews.map(view => (
                        <Button
                          key={view.id}
                          onClick={() => handleLoadView(view)}
                          size="sm"
                          variant={currentView === view.name ? "default" : "outline"}
                          className="font-fredoka"
                        >
                          {view.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions Bar */}
        {selectedCleaners.length > 0 && (
          <Card className="border-2 border-puretask-blue bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-fredoka font-semibold text-graphite">
                  {selectedCleaners.length} cleaner{selectedCleaners.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button onClick={() => handleBulkAction('suspend')} variant="outline" size="sm" className="font-fredoka">
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Selected
                  </Button>
                  <Button onClick={() => handleBulkAction('reactivate')} variant="outline" size="sm" className="font-fredoka">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reactivate Selected
                  </Button>
                  <Button onClick={() => setSelectedCleaners([])} variant="ghost" size="sm" className="font-fredoka">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedCleaners.length === paginatedCleaners.length && paginatedCleaners.length > 0}
                onCheckedChange={selectAllCleaners}
              />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-verdana flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cleaners List - Grouped by Tier */}
        {viewMode === 'cards' ? (
          <div className="space-y-6">
            {['Elite', 'Pro', 'Semi Pro', 'Developing'].map(tierName => {
              const tieredCleaners = cleanersByTier[tierName];
              if (tieredCleaners.length === 0) return null;

              return (
                <div key={tierName}>
                  <Card 
                    className={`cursor-pointer hover:shadow-md transition-all ${getTierCardClasses(tierName)}`}
                    onClick={() => toggleTier(tierName)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: expandedTiers[tierName] ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </motion.div>
                          <Award className="w-6 h-6" style={{ color: getTierSolidColor(tierName) }} />
                          <h3 className="text-xl font-fredoka font-bold text-graphite">{tierName} Tier</h3>
                          <Badge className={`${getTierBadgeColor(tierName)} border font-fredoka`}>
                            {tieredCleaners.length} cleaners
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleTier(tierName); }}>
                          {expandedTiers[tierName] ? 'Collapse' : 'Expand'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {expandedTiers[tierName] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 mt-3"
                      >
                        {tieredCleaners.map((cleaner, idx) => {
            const activityStatus = getActivityStatus(cleaner);
            const isSelected = selectedCleaners.includes(cleaner.id);

            return (
              <motion.div
                key={cleaner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card className={`hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'border-2 border-puretask-blue bg-blue-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCleanerSelection(cleaner.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="relative">
                        <div className="w-14 h-14 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold text-xl">
                          {cleaner.user_email[0].toUpperCase()}
                        </div>
                        {activityStatus.color === 'gradient-red-orange' ? (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{ background: 'linear-gradient(90deg, #ef4444 50%, #f97316 50%)' }}></div>
                        ) : (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${activityStatus.color}`}></div>
                        )}
                      </div>

                      <div className="flex-1" onClick={() => loadCleanerDetails(cleaner)}>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-fredoka font-bold text-lg text-graphite">{cleaner.full_name || cleaner.user_email}</p>
                          {cleaner.cleaner_id && (
                            <Badge variant="outline" className="font-mono text-xs font-semibold flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {cleaner.cleaner_id}
                            </Badge>
                          )}
                          <Badge className={`${getTierBadgeColor(cleaner.tier)} border font-fredoka`}>
                            {cleaner.tier}
                          </Badge>
                          {!cleaner.is_active && (
                            <Badge className="bg-red-100 text-red-800 border-red-300 border font-fredoka">Suspended</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-verdana font-semibold">{cleaner.average_rating?.toFixed(1) || '5.0'}</span>
                            <span className="text-gray-500 font-verdana">({cleaner.total_reviews || 0})</span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-700">
                            <Briefcase className="w-4 h-4 text-puretask-blue" />
                            <span className="font-verdana">{cleaner.total_jobs || 0} jobs</span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-700">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span className="font-verdana">{cleaner.reliability_score || 75}%</span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-verdana">{cleaner.service_locations?.[0] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button onClick={() => loadCleanerDetails(cleaner)} size="sm" variant="outline" className="font-fredoka">
                          View Details
                        </Button>
                        <Button size="sm" variant="ghost" className="font-fredoka">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
            })}
            </div>
        ) : (
          /* Table View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedCleaners.length === paginatedCleaners.length && paginatedCleaners.length > 0}
                          onCheckedChange={selectAllCleaners}
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Cleaner</th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Tier</th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Rating</th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Jobs</th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Reliability</th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Status</th>
                      <th className="px-4 py-3 text-left font-fredoka text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCleaners.map((cleaner) => {
                      const isSelected = selectedCleaners.includes(cleaner.id);
                      return (
                        <tr key={cleaner.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleCleanerSelection(cleaner.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold">
                                {cleaner.user_email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-fredoka font-semibold text-graphite">{cleaner.full_name || cleaner.user_email}</p>
                                  {cleaner.cleaner_id && (
                                    <Badge variant="outline" className="font-mono text-xs font-semibold">
                                      {cleaner.cleaner_id}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-verdana">{cleaner.user_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                           <Badge className={`${getTierBadgeColor(cleaner.tier)} border font-fredoka text-xs`}>
                             {cleaner.tier}
                           </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-verdana text-sm">{cleaner.average_rating?.toFixed(1) || '5.0'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-verdana text-sm">{cleaner.total_jobs || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-verdana text-sm">{cleaner.reliability_score || 75}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cleaner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {cleaner.is_active ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button onClick={() => loadCleanerDetails(cleaner)} size="sm" variant="outline" className="font-fredoka text-xs">
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-verdana">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCleaners.length)} of {filteredCleaners.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="font-fredoka"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="font-fredoka"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="font-fredoka"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Cleaner Details Modal */}
      {selectedCleaner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCleaner(null)}>
          {loadingDetails ? (
            <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-puretask-blue mx-auto mb-4" />
                <p className="text-gray-600 font-verdana">Loading cleaner details...</p>
              </CardContent>
            </Card>
          ) : cleanerDetails ? (
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
                  <Users className="w-6 h-6 text-puretask-blue" />
                  {cleanerDetails.full_name || cleanerDetails.user_email}
                  {cleanerDetails.cleaner_id && (
                    <Badge variant="outline" className="font-mono text-sm font-bold flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      {cleanerDetails.cleaner_id}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => setEditMode(!editMode)} size="sm" variant="outline" className="font-fredoka">
                    <Edit className="w-4 h-4 mr-2" />
                    {editMode ? 'Cancel Edit' : 'Edit'}
                  </Button>
                  <Button onClick={() => setSelectedCleaner(null)} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Tabs value={detailsTab} onValueChange={setDetailsTab}>
                <TabsList className="grid w-full grid-cols-6 mb-6">
                  <TabsTrigger value="overview" className="font-fredoka">Overview</TabsTrigger>
                  <TabsTrigger value="bookings" className="font-fredoka">Bookings</TabsTrigger>
                  <TabsTrigger value="performance" className="font-fredoka">Performance</TabsTrigger>
                  <TabsTrigger value="payouts" className="font-fredoka">Payouts</TabsTrigger>
                  <TabsTrigger value="risk" className="font-fredoka">Risk</TabsTrigger>
                  <TabsTrigger value="audit" className="font-fredoka">Audit Log</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-gray-600 font-verdana">Reliability Score</p>
                      <p className="text-3xl font-fredoka font-bold text-graphite">{cleanerDetails.reliability_score || 0}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <p className="text-sm text-gray-600 font-verdana">Completed Jobs</p>
                      <p className="text-3xl font-fredoka font-bold text-fresh-mint">{cleanerDetails.completedJobs}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <p className="text-sm text-gray-600 font-verdana">Total Earnings</p>
                      <p className="text-3xl font-fredoka font-bold text-purple-600">{cleanerDetails.totalEarnings} credits</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                      <p className="text-sm text-gray-600 font-verdana">Tier</p>
                      <p className="text-2xl font-fredoka font-bold text-amber-600">{cleanerDetails.tier}</p>
                    </div>
                  </div>

                  {/* Onboarding Progress */}
                  {cleanerDetails.onboardingProgress && (
                    <Card className="border-2 border-indigo-200 bg-indigo-50">
                      <CardHeader>
                        <CardTitle className="font-fredoka text-lg flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                          Onboarding Progress ({cleanerDetails.onboardingProgress.completedSteps}/{cleanerDetails.onboardingProgress.totalSteps})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {cleanerDetails.onboardingProgress.steps.map(step => (
                            <div key={step.id} className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                                {step.completed && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                              <span className={`font-verdana ${step.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-puretask-blue to-cyan-500 h-full transition-all"
                            style={{ width: `${cleanerDetails.onboardingProgress.progress}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Edit Form */}
                  {editMode && (
                    <Card className="border-2 border-yellow-300 bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="font-fredoka">Edit Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-fredoka font-semibold mb-2">Tier</label>
                          <select
                            value={editData.tier}
                            onChange={(e) => setEditData({ ...editData, tier: e.target.value })}
                            className="w-full rounded-xl border-2 p-2 font-verdana"
                          >
                            <option value="Developing">Developing</option>
                            <option value="Semi Pro">Semi Pro</option>
                            <option value="Pro">Pro</option>
                            <option value="Elite">Elite</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-fredoka font-semibold mb-2">Payout Percentage</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editData.payout_percentage}
                            onChange={(e) => setEditData({ ...editData, payout_percentage: parseFloat(e.target.value) })}
                            className="font-verdana"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-fredoka font-semibold mb-2">Base Rate (Credits/Hour)</label>
                          <Input
                            type="number"
                            value={editData.base_rate_credits_per_hour}
                            onChange={(e) => setEditData({ ...editData, base_rate_credits_per_hour: parseInt(e.target.value) })}
                            className="font-verdana"
                          />
                        </div>
                        <Button onClick={handleSaveEdit} className="w-full brand-gradient text-white font-fredoka">
                          Save Changes
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-2xl font-fredoka font-bold text-graphite">{cleanerDetails.bookings?.length || 0}</p>
                    <p className="text-gray-600 font-verdana">Total Bookings</p>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {cleanerDetails.bookings?.slice(0, 10).map(booking => (
                      <Card key={booking.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-fredoka font-semibold text-graphite">{booking.address}</p>
                              <p className="text-sm text-gray-600 font-verdana">
                                {new Date(booking.date).toLocaleDateString()} • {booking.start_time}
                              </p>
                            </div>
                            <Badge className={
                              booking.status === 'completed' || booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  <div>
                    <h3 className="font-fredoka font-bold text-lg mb-4">Monthly Jobs</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={cleanerDetails.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="jobs" fill="#66B3FF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="font-fredoka font-bold text-lg mb-4">Monthly Earnings</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={cleanerDetails.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="earnings" stroke="#00D4FF" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {/* Payouts Tab */}
                <TabsContent value="payouts" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <p className="text-sm text-gray-600 font-verdana">Paid</p>
                      <p className="text-2xl font-fredoka font-bold text-green-600">
                        {cleanerDetails.earnings?.filter(e => e.status === 'paid').length || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl text-center">
                      <p className="text-sm text-gray-600 font-verdana">Pending</p>
                      <p className="text-2xl font-fredoka font-bold text-yellow-600">
                        {cleanerDetails.earnings?.filter(e => e.status === 'pending').length || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                      <p className="text-sm text-gray-600 font-verdana">Total Earnings</p>
                      <p className="text-2xl font-fredoka font-bold text-purple-600">
                        {cleanerDetails.totalEarnings}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Risk Tab */}
                <TabsContent value="risk">
                  {cleanerDetails.riskProfile ? (
                    <RiskScoreDisplay riskProfile={cleanerDetails.riskProfile} />
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-verdana">No risk profile data available</p>
                    </div>
                  )}
                </TabsContent>

                {/* Audit Log Tab */}
                <TabsContent value="audit" className="space-y-3">
                  {cleanerDetails.auditLogs && cleanerDetails.auditLogs.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cleanerDetails.auditLogs.map(log => (
                        <Card key={log.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-puretask-blue rounded-full flex items-center justify-center flex-shrink-0">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-fredoka font-semibold text-graphite">{log.action_type}</p>
                                <p className="text-sm text-gray-600 font-verdana">
                                  by {log.admin_email}
                                </p>
                                <p className="text-xs text-gray-500 font-verdana">
                                  {new Date(log.created_date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-verdana">No audit log entries</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t mt-6">
                {cleanerDetails.is_active ? (
                  <Button onClick={handleSuspendCleaner} variant="outline" className="font-fredoka text-red-600 border-red-600">
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Cleaner
                  </Button>
                ) : (
                  <Button onClick={handleReactivateCleaner} className="font-fredoka bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                )}
                <Button onClick={() => navigate(createPageUrl(`CleanerProfile?email=${cleanerDetails.user_email}`))} variant="outline" className="font-fredoka">
                  View Public Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}