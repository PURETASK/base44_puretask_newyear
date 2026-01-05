import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPermissions } from '@/components/admin/AdminPermissions';
import { AdminAuditLogger } from '@/components/admin/AdminAuditLogger';
import RiskScoreDisplay from '@/components/risk/RiskScoreDisplay';
import { Users, Loader2, Wallet, AlertTriangle, Shield, Award, ChevronRight, Clock, Star, TrendingUp, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminClientManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    'high-risk': true,
    'watch': true,
    'normal': true,
    'platinum': true,
    'plus': true,
    'standard': true,
    'high-balance': true,
    'medium-balance': true,
    'low-balance': true,
    'active': true,
    'inactive': true
  });
  const [groupBy, setGroupBy] = useState('risk'); // 'risk', 'membership', 'balance', 'activity'

  useEffect(() => {
    checkAdminAndLoad();
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
      await loadClients();
    } catch (error) {
      handleError(error, { userMessage: 'Error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const [profiles, riskProfiles] = await Promise.all([
        base44.entities.ClientProfile.list('-created_date', 200),
        base44.entities.RiskProfile.filter({ user_type: 'client' })
      ]);
      
      // Attach risk profiles to clients
      const clientsWithRisk = profiles.map(client => {
        const riskProfile = riskProfiles.find(r => r.user_email === client.user_email);
        return { ...client, riskProfile };
      });
      
      setClients(clientsWithRisk);
      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading clients:', showToast: false });
      setLoading(false);
    }
  };

  const loadClientDetails = async (client) => {
    try {
      const [bookings, disputes, credits, riskProfiles, subscriptions, memberships] = await Promise.all([
        base44.entities.Booking.filter({ client_email: client.user_email }),
        base44.entities.Dispute.filter({ filed_by_email: client.user_email }),
        base44.entities.Credit.filter({ user_email: client.user_email }),
        base44.entities.RiskProfile.filter({ user_email: client.user_email, user_type: 'client' }),
        base44.entities.CleaningSubscription.filter({ client_email: client.user_email }),
        base44.entities.ClientMembership.filter({ client_email: client.user_email })
      ]);

      const creditBalance = credits.length > 0 ? credits[0].balance : 0;
      const disputeRate = bookings.length > 0 ? (disputes.length / bookings.length) * 100 : 0;

      setClientDetails({
        ...client,
        totalBookings: bookings.length,
        disputes: disputes.length,
        disputeRate,
        creditBalance,
        riskProfile: riskProfiles.length > 0 ? riskProfiles[0] : null,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        activeMemberships: memberships.filter(m => m.status === 'active').length
      });
      
      setSelectedClient(client);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading client details:', showToast: false });
    }
  };

  const handleAdjustCredits = async () => {
    if (!clientDetails) return;
    
    const hasPermission = await AdminPermissions.hasCapability(user.email, 'can_issue_refunds');
    if (!hasPermission) {
      alert('You do not have permission to adjust credits');
      return;
    }

    const amount = prompt('Enter credit amount (positive to add, negative to deduct):');
    if (!amount) return;
    
    const reason = prompt('Reason for adjustment:');
    if (!reason) return;

    try {
      const amountNum = parseFloat(amount);
      
      await AdminAuditLogger.log({
        adminEmail: user.email,
        actionType: 'ADJUST_CREDITS',
        targetType: 'client',
        targetId: clientDetails.user_email,
        metadata: { amount: amountNum, reason }
      });

      await base44.entities.CreditTransaction.create({
        client_email: clientDetails.user_email,
        transaction_type: amountNum > 0 ? 'adjustment' : 'charge',
        amount_credits: amountNum,
        note: `Admin adjustment: ${reason}`
      });

      alert('Credits adjusted successfully');
      loadClientDetails(clientDetails);
    } catch (error) {
      handleError(error, { userMessage: 'Error adjusting credits:', showToast: false });
      alert('Failed to adjust credits');
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getActivityStatus = (client) => {
    if (client.updated_date) {
      const lastUpdate = new Date(client.updated_date);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate < 30 ? 'active' : 'inactive';
    }
    return 'inactive';
  };

  const getCreditBalanceCategory = (balance) => {
    if (balance >= 1000) return 'high-balance';
    if (balance >= 500) return 'medium-balance';
    return 'low-balance';
  };

  const getRiskCategory = (client) => {
    if (!client.riskProfile) return 'normal';
    const tier = client.riskProfile.risk_tier;
    if (tier === 'Blocked' || tier === 'Restricted') return 'high-risk';
    if (tier === 'Watch') return 'watch';
    return 'normal';
  };

  const filteredClients = clients.filter(c =>
    !searchTerm || 
    c.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.client_id && c.client_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group clients based on selected grouping
  const groupedClients = {};
  
  if (groupBy === 'risk') {
    groupedClients['high-risk'] = filteredClients.filter(c => getRiskCategory(c) === 'high-risk');
    groupedClients['watch'] = filteredClients.filter(c => getRiskCategory(c) === 'watch');
    groupedClients['normal'] = filteredClients.filter(c => getRiskCategory(c) === 'normal');
  } else if (groupBy === 'membership') {
    groupedClients['platinum'] = filteredClients.filter(c => c.membership_tier === 'Platinum');
    groupedClients['plus'] = filteredClients.filter(c => c.membership_tier === 'Plus');
    groupedClients['standard'] = filteredClients.filter(c => c.membership_tier === 'Standard');
  } else if (groupBy === 'balance') {
    groupedClients['high-balance'] = filteredClients.filter(c => getCreditBalanceCategory(c.credits_balance || 0) === 'high-balance');
    groupedClients['medium-balance'] = filteredClients.filter(c => getCreditBalanceCategory(c.credits_balance || 0) === 'medium-balance');
    groupedClients['low-balance'] = filteredClients.filter(c => getCreditBalanceCategory(c.credits_balance || 0) === 'low-balance');
  } else if (groupBy === 'activity') {
    groupedClients['active'] = filteredClients.filter(c => getActivityStatus(c) === 'active');
    groupedClients['inactive'] = filteredClients.filter(c => getActivityStatus(c) === 'inactive');
  }

  // Category configurations
  const categoryConfig = {
    'high-risk': { label: 'High Risk', color: 'bg-red-500', borderColor: 'border-red-300', bgColor: 'bg-red-50', icon: AlertTriangle },
    'watch': { label: 'Watch List', color: 'bg-yellow-500', borderColor: 'border-yellow-300', bgColor: 'bg-yellow-50', icon: Shield },
    'normal': { label: 'Normal Risk', color: 'bg-green-500', borderColor: 'border-green-300', bgColor: 'bg-green-50', icon: Shield },
    'platinum': { label: 'Platinum Members', color: 'bg-purple-500', borderColor: 'border-purple-300', bgColor: 'bg-purple-50', icon: Award },
    'plus': { label: 'Plus Members', color: 'bg-blue-500', borderColor: 'border-blue-300', bgColor: 'bg-blue-50', icon: Award },
    'standard': { label: 'Standard Members', color: 'bg-gray-500', borderColor: 'border-gray-300', bgColor: 'bg-gray-50', icon: Award },
    'high-balance': { label: 'High Balance (1000+ credits)', color: 'bg-green-500', borderColor: 'border-green-300', bgColor: 'bg-green-50', icon: Wallet },
    'medium-balance': { label: 'Medium Balance (500-999 credits)', color: 'bg-yellow-500', borderColor: 'border-yellow-300', bgColor: 'bg-yellow-50', icon: Wallet },
    'low-balance': { label: 'Low Balance (<500 credits)', color: 'bg-red-500', borderColor: 'border-red-300', bgColor: 'bg-red-50', icon: Wallet },
    'active': { label: 'Active (Last 30 days)', color: 'bg-green-500', borderColor: 'border-green-300', bgColor: 'bg-green-50', icon: TrendingUp },
    'inactive': { label: 'Inactive (30+ days)', color: 'bg-gray-500', borderColor: 'border-gray-300', bgColor: 'bg-gray-50', icon: Clock }
  };

  // Distribution data for pie chart
  const getDistributionData = () => {
    const data = Object.entries(groupedClients).map(([key, clients]) => ({
      name: categoryConfig[key]?.label || key,
      value: clients.length,
      color: categoryConfig[key]?.color || 'bg-gray-500'
    }));
    return data.filter(d => d.value > 0);
  };

  const distributionData = getDistributionData();

  const getColorFromClass = (colorClass) => {
    const colorMap = {
      'bg-red-500': '#ef4444',
      'bg-yellow-500': '#eab308',
      'bg-green-500': '#22c55e',
      'bg-purple-500': '#a855f7',
      'bg-blue-500': '#3b82f6',
      'bg-gray-500': '#6b7280'
    };
    return colorMap[colorClass] || '#6b7280';
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
        <div>
          <h1 className="text-4xl font-fredoka font-bold text-graphite">Client Management</h1>
          <p className="text-gray-600 font-verdana mt-2">{filteredClients.length} clients</p>
        </div>

        {/* Distribution Chart */}
        <Card className="border-2 border-puretask-blue">
          <CardHeader>
            <CardTitle className="font-fredoka flex items-center gap-2">
              <Users className="w-5 h-5 text-puretask-blue" />
              Client Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorFromClass(entry.color)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {distributionData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="font-fredoka font-semibold">{item.name}</span>
                    </div>
                    <span className="font-verdana text-gray-600">{item.value} clients</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group By Tabs */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={groupBy} onValueChange={setGroupBy}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="risk" className="font-fredoka">Risk Assessment</TabsTrigger>
                <TabsTrigger value="membership" className="font-fredoka">Membership Tier</TabsTrigger>
                <TabsTrigger value="balance" className="font-fredoka">Credit Balance</TabsTrigger>
                <TabsTrigger value="activity" className="font-fredoka">Recent Activity</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <Input
              placeholder="Search by email or client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="font-verdana"
            />
          </CardContent>
        </Card>

        {/* Grouped Clients */}
        <div className="space-y-6">
          {Object.entries(groupedClients).map(([categoryKey, categoryClients]) => {
            if (categoryClients.length === 0) return null;
            const config = categoryConfig[categoryKey];

            return (
              <div key={categoryKey}>
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-all border-2 ${config.borderColor}`}
                  onClick={() => toggleCategory(categoryKey)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: expandedCategories[categoryKey] ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </motion.div>
                        <config.icon className={`w-6 h-6 text-white p-1 rounded ${config.color}`} />
                        <h3 className="text-xl font-fredoka font-bold text-graphite">{config.label}</h3>
                        <Badge className={`${config.bgColor} ${config.borderColor} border font-fredoka`}>
                          {categoryClients.length} clients
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleCategory(categoryKey); }}>
                        {expandedCategories[categoryKey] ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AnimatePresence>
                  {expandedCategories[categoryKey] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 mt-3"
                    >
                      {categoryClients.map((client, idx) => (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => loadClientDetails(client)}>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold text-xl">
                                  {client.user_email[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-fredoka font-bold text-lg text-graphite">{client.user_email}</p>
                                    {client.client_id && (
                                      <Badge variant="outline" className="font-mono text-xs font-semibold flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        {client.client_id}
                                      </Badge>
                                    )}
                                    {client.membership_tier && client.membership_tier !== 'Standard' && (
                                      <Badge className="bg-purple-100 text-purple-800 border-purple-300 border font-fredoka">
                                        {client.membership_tier}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-center gap-1 text-gray-700">
                                      <Wallet className="w-4 h-4 text-green-500" />
                                      <span className="font-verdana">{client.credits_balance || 0} credits</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-700">
                                      <Star className="w-4 h-4 text-yellow-500" />
                                      <span className="font-verdana">{client.total_bookings || 0} bookings</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-700">
                                      <Clock className="w-4 h-4 text-gray-500" />
                                      <span className="font-verdana">{getActivityStatus(client) === 'active' ? 'Active' : 'Inactive'}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="font-fredoka">
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && clientDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedClient(null)}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl flex items-center gap-3">
                <Users className="w-6 h-6 text-puretask-blue" />
                {clientDetails.user_email}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-verdana">Total Bookings</p>
                  <p className="text-2xl font-fredoka font-bold text-graphite">{clientDetails.totalBookings}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-verdana">Dispute Rate</p>
                  <p className="text-2xl font-fredoka font-bold text-red-600">{clientDetails.disputeRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-verdana">Credit Balance</p>
                  <p className="text-2xl font-fredoka font-bold text-fresh-mint">{clientDetails.creditBalance}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-verdana">Active Plans</p>
                  <p className="text-2xl font-fredoka font-bold text-purple-600">
                    {clientDetails.activeSubscriptions + clientDetails.activeMemberships}
                  </p>
                </div>
              </div>

              {/* Risk Profile */}
              {clientDetails.riskProfile && (
                <RiskScoreDisplay riskProfile={clientDetails.riskProfile} />
              )}

              {/* Admin Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleAdjustCredits} className="font-fredoka">
                  <Wallet className="w-4 h-4 mr-2" />
                  Adjust Credits
                </Button>
                <Button onClick={() => setSelectedClient(null)} variant="outline" className="font-fredoka">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}