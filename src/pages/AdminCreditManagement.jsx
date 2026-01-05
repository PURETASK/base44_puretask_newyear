import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, DollarSign, Gift, ArrowLeft, Home, 
  TrendingUp, Users, Loader2, Search, MinusCircle, Megaphone, History 
} from 'lucide-react';
import { creditsToUSD } from '../components/credits/CreditCalculator';
import PayoutBatchProcessor from '../components/admin/PayoutBatchProcessor';
import TransactionHistoryAdvanced from '../components/admin/TransactionHistoryAdvanced';
import CreditGrantTool from '../components/admin/CreditGrantTool';
import ClientSearchSelector from '../components/admin/ClientSearchSelector';
import ClientCreditHistory from '../components/admin/ClientCreditHistory';
import CreditDebitTool from '../components/admin/CreditDebitTool';
import PendingPayoutsDetails from '../components/admin/PendingPayoutsDetails';
import CreditCampaignManager from '../components/admin/CreditCampaignManager';
import CreditManagementGuide from '../components/admin/CreditManagementGuide';
import { toast } from 'sonner';

export default function AdminCreditManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('grant');
  
  // Stats
  const [stats, setStats] = useState({
    totalClientsWithCredits: 0,
    totalCreditsInCirculation: 0,
    totalUSDValue: 0,
    pendingEarnings: 0,
    pendingPayouts: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);
      loadStats();
    } catch (error) {
      navigate(createPageUrl('Home'));
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [clientProfiles, earnings] = await Promise.all([
        base44.entities.ClientProfile.list(),
        base44.entities.CleanerEarning.filter({ status: 'pending' })
      ]);
      
      const clientsWithCredits = clientProfiles.filter(p => (p.credits_balance || 0) > 0);
      
      const totalCredits = clientProfiles.reduce((sum, p) => 
        sum + (p.credits_balance || 0), 0
      );
      
      const pendingUSD = earnings.reduce((sum, e) => sum + (e.usd_due || 0), 0);
      
      setStats({
        totalClientsWithCredits: clientsWithCredits.length,
        totalCreditsInCirculation: totalCredits,
        totalUSDValue: creditsToUSD(totalCredits),
        pendingEarnings: earnings.length,
        pendingPayouts: pendingUSD
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading stats:', showToast: false });
      toast.error('Failed to load statistics');
    }
    setLoading(false);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleToolSuccess = () => {
    loadStats();
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl('AdminDashboard'))}
              className="bg-white hover:bg-gray-50 rounded-full font-fredoka"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl('Home'))}
              className="bg-white hover:bg-gray-50 rounded-full font-fredoka"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-puretask-blue" />
            Credit System Management
          </h1>
          <p className="text-lg text-gray-600 font-verdana">Monitor credit economy and grant goodwill credits</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-fresh-mint mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalClientsWithCredits}</p>
              <p className="text-sm text-gray-600 font-verdana">Clients with Credits</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Wallet className="w-8 h-8 text-puretask-blue mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalCreditsInCirculation.toLocaleString()}</p>
              <p className="text-sm text-gray-600 font-verdana">Total Credits in Circulation</p>
              <p className="text-xs text-gray-500 font-verdana mt-1">≈ ${stats.totalUSDValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.pendingEarnings}</p>
              <p className="text-sm text-gray-600 font-verdana">Pending Earnings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('payouts')}>
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-amber-600 mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">${stats.pendingPayouts.toFixed(2)}</p>
              <p className="text-sm text-gray-600 font-verdana">Pending Payouts (USD)</p>
              <Badge className="mt-2 bg-amber-600 text-white font-fredoka text-xs">Click for details</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Client Search */}
        <div className="mb-8">
          <ClientSearchSelector 
            onSelectClient={handleClientSelect}
            selectedEmail={selectedClient?.user_email}
          />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white rounded-full p-1 shadow-lg">
            <TabsTrigger value="grant" className="rounded-full font-fredoka data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <Gift className="w-4 h-4 mr-2" />
              Grant Credits
            </TabsTrigger>
            <TabsTrigger value="debit" className="rounded-full font-fredoka data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
              <MinusCircle className="w-4 h-4 mr-2" />
              Debit/Refund
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full font-fredoka data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="campaign" className="rounded-full font-fredoka data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800">
              <Megaphone className="w-4 h-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="payouts" className="rounded-full font-fredoka data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <DollarSign className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="guide" className="rounded-full font-fredoka data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800">
              <Search className="w-4 h-4 mr-2" />
              Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grant" className="space-y-6">
            {selectedClient ? (
              <CreditGrantTool 
                clientEmail={selectedClient.user_email} 
                onSuccess={handleToolSuccess}
              />
            ) : (
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 font-verdana">Search and select a client above to grant credits</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="debit" className="space-y-6">
            {selectedClient ? (
              <CreditDebitTool 
                clientEmail={selectedClient.user_email} 
                onSuccess={handleToolSuccess}
              />
            ) : (
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 font-verdana">Search and select a client above to debit credits</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ClientCreditHistory clientEmail={selectedClient?.user_email} />
          </TabsContent>

          <TabsContent value="campaign" className="space-y-6">
            <CreditCampaignManager />
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <PendingPayoutsDetails />
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <CreditManagementGuide />
          </TabsContent>
        </Tabs>

        {/* Payout Batch Processor */}
        <div className="mb-8">
          <PayoutBatchProcessor />
        </div>

        {/* Enhanced Transaction History - Replace old TransactionHistory */}
        <TransactionHistoryAdvanced />
      </div>
    </div>
  );
}