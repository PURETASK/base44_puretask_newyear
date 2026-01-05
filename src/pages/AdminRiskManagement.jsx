import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, CheckCircle, Loader2, XCircle, Eye, Lock, Ban, UserX, Clock, TrendingUp, BarChart3, Bell, ExternalLink, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function AdminRiskManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [flags, setFlags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [tierNotes, setTierNotes] = useState('');
  const [profileFlags, setProfileFlags] = useState([]);
  const [profileActions, setProfileActions] = useState([]);
  const [profileIncidents, setProfileIncidents] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadRiskData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
    }
  };

  const loadRiskData = async () => {
    try {
      const [profiles, riskFlags, alerts] = await Promise.all([
        base44.entities.RiskProfile.list('-risk_score', 100),
        base44.entities.RiskFlag.filter({ status: 'open' }),
        base44.entities.SystemAlert.filter({ is_resolved: false }).catch(() => [])
      ]);
      
      setRiskProfiles(profiles);
      setFlags(riskFlags);
      setSystemAlerts(alerts);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading risk data:', showToast: false });
      setLoading(false);
    }
  };

  const loadProfileDetails = async (profile) => {
    try {
      const [userFlags, actionLogs, incidents] = await Promise.all([
        base44.entities.RiskFlag.filter({ subject_id: profile.user_email }),
        base44.entities.RiskActionLog.filter({ user_email: profile.user_email }),
        base44.entities.SafetyIncident.filter({ 
          $or: [
            { client_email: profile.user_email },
            { cleaner_email: profile.user_email }
          ]
        }).catch(() => [])
      ]);
      
      setProfileFlags(userFlags);
      setProfileActions(actionLogs);
      setProfileIncidents(incidents);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading profile details:', showToast: false });
      toast.error('Failed to load profile details');
    }
  };

  const handleResolveFlag = async (flagId) => {
    try {
      await base44.entities.RiskFlag.update(flagId, { 
        status: 'resolved',
        notes: 'Resolved by admin'
      });
      loadRiskData();
    } catch (error) {
      handleError(error, { userMessage: 'Error resolving flag:', showToast: false });
    }
  };

  const handleOpenDetails = async (profile) => {
    setSelectedProfile(profile);
    await loadProfileDetails(profile);
    setDetailsModalOpen(true);
  };

  const handleOpenTierChange = (profile, tier) => {
    setSelectedProfile(profile);
    setSelectedTier(tier);
    setTierNotes('');
    setTierModalOpen(true);
  };

  const handleUpdateTier = async () => {
    if (!selectedProfile || !selectedTier) return;
    
    try {
      await base44.entities.RiskProfile.update(selectedProfile.id, { 
        risk_tier: selectedTier,
        last_reviewed_at: new Date().toISOString(),
        notes: tierNotes || undefined
      });

      // Log audit trail
      if (currentUser) {
        await base44.entities.AdminAuditLog.create({
          admin_email: currentUser.email,
          action_type: 'UPDATE_RISK_TIER',
          target_type: 'risk_profile',
          target_id: selectedProfile.id,
          metadata: {
            user_email: selectedProfile.user_email,
            old_tier: selectedProfile.risk_tier,
            new_tier: selectedTier,
            notes: tierNotes
          }
        });
      }
      
      toast.success(`Risk tier updated to ${selectedTier}`);
      setTierModalOpen(false);
      loadRiskData();
    } catch (error) {
      handleError(error, { userMessage: 'Error updating tier:', showToast: false });
      toast.error('Failed to update tier');
    }
  };

  const handleApplyAction = async (action) => {
    if (!selectedProfile) return;

    try {
      const actionData = {
        user_type: selectedProfile.user_type,
        user_email: selectedProfile.user_email,
        action_type: action,
        action_direction: 'apply',
        reason_code: 'admin_review',
        severity: 'medium',
        performed_by: 'admin',
        performed_by_email: currentUser?.email,
        target_type: 'account',
        target_id: selectedProfile.user_email,
        metadata: {
          applied_from: 'risk_management_page',
          risk_score: selectedProfile.risk_score,
          risk_tier: selectedProfile.risk_tier
        }
      };

      await base44.entities.RiskActionLog.create(actionData);

      // Send notification
      await base44.entities.Notification.create({
        recipient_email: selectedProfile.user_email,
        type: 'system_alert',
        title: 'Account Action Applied',
        message: `An action has been applied to your account for security reasons. Please contact support if you have questions.`,
        priority: 'high'
      });

      // Log audit
      if (currentUser) {
        await base44.entities.AdminAuditLog.create({
          admin_email: currentUser.email,
          action_type: 'APPLY_RISK_ACTION',
          target_type: 'risk_profile',
          target_id: selectedProfile.id,
          metadata: {
            action_type: action,
            user_email: selectedProfile.user_email
          }
        });
      }

      toast.success(`Action "${action}" applied successfully`);
      await loadProfileDetails(selectedProfile);
    } catch (error) {
      handleError(error, { userMessage: 'Error applying action:', showToast: false });
      toast.error('Failed to apply action');
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'watch': return 'bg-yellow-100 text-yellow-800';
      case 'restricted': return 'bg-amber-100 text-amber-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-amber-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredProfiles = riskProfiles.filter(p => {
    const matchesSearch = !searchTerm || 
      p.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || p.risk_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // Analytics data
  const riskTrendData = [
    { name: 'Week 1', critical: 2, high: 5, medium: 8 },
    { name: 'Week 2', critical: 3, high: 7, medium: 10 },
    { name: 'Week 3', critical: 1, high: 4, medium: 6 },
    { name: 'Week 4', critical: flags.filter(f => f.severity === 'critical').length, 
      high: flags.filter(f => f.severity === 'high').length,
      medium: flags.filter(f => f.severity === 'medium').length }
  ];

  const tierDistributionData = [
    { name: 'Normal', value: riskProfiles.filter(p => p.risk_tier === 'normal').length, color: '#10B981' },
    { name: 'Watch', value: riskProfiles.filter(p => p.risk_tier === 'watch').length, color: '#F59E0B' },
    { name: 'Restricted', value: riskProfiles.filter(p => p.risk_tier === 'restricted').length, color: '#F97316' },
    { name: 'Blocked', value: riskProfiles.filter(p => p.risk_tier === 'blocked').length, color: '#EF4444' }
  ];

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
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Risk Management</h1>
          <p className="text-gray-600 font-verdana mt-2">Monitor and manage fraud, trust & safety</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Normal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-fresh-mint">
                {riskProfiles.filter(p => p.risk_tier === 'normal').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Watch List</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-yellow-600">
                {riskProfiles.filter(p => p.risk_tier === 'watch').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Restricted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-amber-600">
                {riskProfiles.filter(p => p.risk_tier === 'restricted').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-red-600">
                {riskProfiles.filter(p => p.risk_tier === 'blocked').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-puretask-blue" />
                Risk Trend (Last 4 Weeks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="high" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#FBBF24" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-puretask-blue" />
                Risk Tier Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tierDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Active Flags & Alerts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                Active Risk Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-verdana text-gray-600 mb-1">Safety Issues</p>
                  <p className="text-2xl font-fredoka font-bold text-red-700">
                    {flags.filter(f => f.category === 'safety_issue').length}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-verdana text-gray-600 mb-1">Payment Risk</p>
                  <p className="text-2xl font-fredoka font-bold text-amber-700">
                    {flags.filter(f => f.category === 'payment_risk').length}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-verdana text-gray-600 mb-1">Refund Abuse</p>
                  <p className="text-2xl font-fredoka font-bold text-yellow-700">
                    {flags.filter(f => f.category === 'refund_abuse').length}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 font-fredoka"
                onClick={() => navigate(createPageUrl('AdminRiskFlags'))}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Flags
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-fredoka text-xl flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemAlerts.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {systemAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <Badge className={`${getSeverityColor(alert.severity)} mb-1`}>
                            {alert.type.replace(/_/g, ' ')}
                          </Badge>
                          <p className="text-xs font-verdana text-gray-700">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 font-verdana py-8">No active alerts</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-verdana"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterTier === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterTier('all')}
                  className="font-fredoka"
                >
                  All
                </Button>
                <Button
                  variant={filterTier === 'watch' ? 'default' : 'outline'}
                  onClick={() => setFilterTier('watch')}
                  className="font-fredoka"
                >
                  Watch
                </Button>
                <Button
                  variant={filterTier === 'restricted' ? 'default' : 'outline'}
                  onClick={() => setFilterTier('restricted')}
                  className="font-fredoka"
                >
                  Restricted
                </Button>
                <Button
                  variant={filterTier === 'blocked' ? 'default' : 'outline'}
                  onClick={() => setFilterTier('blocked')}
                  className="font-fredoka"
                >
                  Blocked
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Profiles List */}
        <div className="space-y-4">
          {filteredProfiles.map((profile, idx) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`border-2 ${
                profile.risk_tier === 'blocked' ? 'border-red-500' :
                profile.risk_tier === 'restricted' ? 'border-amber-500' :
                profile.risk_tier === 'watch' ? 'border-yellow-500' :
                'border-gray-200'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-fredoka font-bold text-lg">
                        {profile.user_email[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-fredoka font-bold text-lg text-graphite">
                            {profile.user_email}
                          </h3>
                          <Badge className={`font-fredoka text-xs capitalize ${getTierColor(profile.risk_tier)}`}>
                            {profile.risk_tier}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 font-fredoka text-xs capitalize">
                            {profile.user_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Risk Score</p>
                            <p className="text-lg font-fredoka font-bold text-graphite">
                              {profile.risk_score || 0}/100
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Open Flags</p>
                            <p className="text-lg font-fredoka font-bold text-amber-600">
                              {profile.open_flags || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Total Bookings</p>
                            <p className="text-lg font-fredoka font-bold text-graphite">
                              {profile.lifetime_booking_count || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Recent (30d)</p>
                            <p className="text-lg font-fredoka font-bold text-graphite">
                              {profile.recent_booking_count || 0}
                            </p>
                          </div>
                        </div>
                        {profile.tags && profile.tags.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {profile.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="font-verdana text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleOpenDetails(profile)}
                        variant="default"
                        className="font-fredoka text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        onClick={() => handleOpenTierChange(profile, 'normal')}
                        disabled={profile.risk_tier === 'normal'}
                        variant="outline"
                        className="font-fredoka text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                      <Button
                        onClick={() => handleOpenTierChange(profile, 'watch')}
                        disabled={profile.risk_tier === 'watch'}
                        variant="outline"
                        className="font-fredoka text-xs"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                      <Button
                        onClick={() => handleOpenTierChange(profile, 'restricted')}
                        disabled={profile.risk_tier === 'restricted'}
                        variant="outline"
                        className="font-fredoka text-xs text-amber-600"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Restrict
                      </Button>
                      <Button
                        onClick={() => handleOpenTierChange(profile, 'blocked')}
                        disabled={profile.risk_tier === 'blocked'}
                        variant="outline"
                        className="font-fredoka text-xs text-red-600 border-red-600"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Block
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredProfiles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-fredoka font-bold text-graphite">No risk profiles found</p>
                <p className="text-gray-600 font-verdana mt-2">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tier Change Modal */}
        <Dialog open={tierModalOpen} onOpenChange={setTierModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-fredoka">Update Risk Tier</DialogTitle>
              <DialogDescription className="font-verdana">
                Change risk tier for <strong>{selectedProfile?.user_email}</strong> to{' '}
                <Badge className={getTierColor(selectedTier)}>{selectedTier}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-fredoka font-semibold">Notes (Optional)</Label>
                <Textarea
                  value={tierNotes}
                  onChange={(e) => setTierNotes(e.target.value)}
                  placeholder="Add reason for tier change..."
                  className="font-verdana mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTierModalOpen(false)} className="font-fredoka">
                Cancel
              </Button>
              <Button onClick={handleUpdateTier} className="font-fredoka brand-gradient text-white">
                Update Tier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detailed Profile Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-fredoka text-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-fredoka font-bold">
                  {selectedProfile?.user_email[0].toUpperCase()}
                </div>
                {selectedProfile?.user_email}
              </DialogTitle>
              <DialogDescription className="font-verdana flex items-center gap-2">
                <Badge className={getTierColor(selectedProfile?.risk_tier)}>{selectedProfile?.risk_tier}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{selectedProfile?.user_type}</Badge>
                <span className="text-gray-600">Risk Score: {selectedProfile?.risk_score}/100</span>
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="font-fredoka">Overview</TabsTrigger>
                <TabsTrigger value="flags" className="font-fredoka">Risk Flags ({profileFlags.length})</TabsTrigger>
                <TabsTrigger value="actions" className="font-fredoka">Actions ({profileActions.length})</TabsTrigger>
                <TabsTrigger value="incidents" className="font-fredoka">Incidents ({profileIncidents.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-fredoka">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => handleApplyAction('restricted_account')} className="font-fredoka">
                        <Lock className="w-4 h-4 mr-2" />
                        Restrict Account
                      </Button>
                      <Button variant="outline" onClick={() => handleApplyAction('blocked_account')} className="font-fredoka">
                        <Ban className="w-4 h-4 mr-2" />
                        Block Account
                      </Button>
                      <Button variant="outline" onClick={() => handleApplyAction('soft_lock_payment')} className="font-fredoka">
                        <Shield className="w-4 h-4 mr-2" />
                        Soft Lock Payment
                      </Button>
                      <Button variant="outline" onClick={() => handleApplyAction('require_verification')} className="font-fredoka">
                        <UserX className="w-4 h-4 mr-2" />
                        Require Verification
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-fredoka">Profile Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 font-verdana">Open Flags</p>
                        <p className="text-2xl font-fredoka font-bold text-amber-600">{selectedProfile?.open_flags || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-verdana">Total Bookings</p>
                        <p className="text-2xl font-fredoka font-bold">{selectedProfile?.lifetime_booking_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-verdana">Recent (30d)</p>
                        <p className="text-2xl font-fredoka font-bold">{selectedProfile?.recent_booking_count || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flags" className="space-y-3">
                {profileFlags.length > 0 ? (
                  profileFlags.map(flag => (
                    <Card key={flag.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(flag.severity)}>{flag.severity}</Badge>
                              <Badge variant="outline">{flag.category?.replace(/_/g, ' ')}</Badge>
                              <Badge variant="outline">{flag.status}</Badge>
                            </div>
                            <p className="font-fredoka font-semibold">{flag.triggered_rule?.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-500 font-verdana mt-1">
                              Created: {new Date(flag.created_date).toLocaleString()}
                            </p>
                          </div>
                          <Badge className="font-fredoka">Confidence: {flag.confidence}%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 font-verdana py-8">No risk flags</p>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-3">
                {profileActions.length > 0 ? (
                  profileActions.map(action => (
                    <Card key={action.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2">{action.action_type?.replace(/_/g, ' ')}</Badge>
                            <p className="text-sm font-verdana text-gray-600">
                              {action.action_direction === 'apply' ? 'Applied' : 'Removed'} by {action.performed_by}
                            </p>
                            <p className="text-xs text-gray-500 font-verdana mt-1">
                              {new Date(action.created_date).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getSeverityColor(action.severity)}>{action.severity}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 font-verdana py-8">No actions taken</p>
                )}
              </TabsContent>

              <TabsContent value="incidents" className="space-y-3">
                {profileIncidents.length > 0 ? (
                  profileIncidents.map(incident => (
                    <Card key={incident.id} className="border-l-4 border-l-red-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                              <Badge variant="outline">{incident.category?.replace(/_/g, ' ')}</Badge>
                              <Badge variant="outline">{incident.status}</Badge>
                            </div>
                            <p className="text-sm font-verdana">{incident.description}</p>
                            <p className="text-xs text-gray-500 font-verdana mt-1">
                              Reported by {incident.reported_by} • {new Date(incident.created_date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 font-verdana py-8">No safety incidents</p>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)} className="font-fredoka">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}