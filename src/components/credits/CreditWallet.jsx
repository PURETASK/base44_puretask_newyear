import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Plus, History, DollarSign, Sparkles } from 'lucide-react';
import { usdToCredits, creditsToUSD, CREDITS_PER_USD } from './CreditCalculator';
import { motion } from 'framer-motion';

const CREDIT_PACKAGES = [
  { usd: 50, credits: 50, bonus: 0, popular: false },
  { usd: 100, credits: 100, bonus: 5, popular: true, label: 'Most Popular' },
  { usd: 200, credits: 200, bonus: 15, popular: false },
  { usd: 500, credits: 500, bonus: 50, popular: false, label: 'Best Value' }
];

export default function CreditWallet({ user, onBalanceUpdate }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBalance();
    loadTransactions();
  }, [user]);

  const loadBalance = async () => {
    try {
      const currentUser = await base44.auth.me();
      setBalance(currentUser.wallet_credits_balance || 0);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const txns = await base44.entities.CreditTransaction.filter(
        { client_email: user.email },
        '-created_date',
        20
      );
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handlePurchase = async (pkg) => {
    setLoading(true);
    try {
      const totalCredits = pkg.credits + pkg.bonus;
      
      // Create purchase transaction
      await base44.entities.CreditTransaction.create({
        client_email: user.email,
        transaction_type: 'purchase',
        amount_credits: totalCredits,
        note: `Purchased ${pkg.credits} credits${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''} for $${pkg.usd}`,
        balance_after: balance + totalCredits
      });
      
      // Update user balance
      await base44.auth.updateMe({
        wallet_credits_balance: balance + totalCredits
      });
      
      setBalance(balance + totalCredits);
      if (onBalanceUpdate) onBalanceUpdate(balance + totalCredits);
      
      setShowPurchase(false);
      loadTransactions();
      
      alert(`✅ Successfully added ${totalCredits.toLocaleString()} credits to your wallet!`);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase credits');
    }
    setLoading(false);
  };

  const handleCustomPurchase = async () => {
    const usd = parseFloat(customAmount);
    if (!usd || usd < 10) {
      alert('Minimum purchase is $10');
      return;
    }
    
    await handlePurchase({
      usd: usd,
      credits: usdToCredits(usd),
      bonus: 0
    });
    setCustomAmount('');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'hold': return '🔒';
      case 'release': return '🔓';
      case 'charge': return '📤';
      case 'refund': return '💚';
      default: return '📝';
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-600" />
              Credit Wallet
            </div>
            <Button size="sm" onClick={() => setShowHistory(true)} variant="outline">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 mb-2">Your Balance</p>
            <p className="text-5xl font-bold text-emerald-600 mb-1">
              {balance.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">
              credits (≈ ${creditsToUSD(balance).toFixed(2)})
            </p>
          </div>
          
          <Button 
            onClick={() => setShowPurchase(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Credits
          </Button>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={showPurchase} onOpenChange={setShowPurchase}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>How it works:</strong> 1 credit = $1 USD. Credits are used to book cleanings. 
                You only pay for actual time worked (rounded to 15-min increments).
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {CREDIT_PACKAGES.map((pkg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`relative ${pkg.popular ? 'border-2 border-emerald-500' : 'border'}`}>
                    {pkg.label && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white">{pkg.label}</Badge>
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <p className="text-4xl font-bold text-slate-900 mb-1">
                        {(pkg.credits + pkg.bonus).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600 mb-1">credits</p>
                      {pkg.bonus > 0 && (
                        <p className="text-xs text-emerald-600 font-semibold mb-3">
                          +{pkg.bonus} bonus credits!
                        </p>
                      )}
                      <p className="text-2xl font-bold text-slate-900 mb-4">${pkg.usd}</p>
                      <Button
                        onClick={() => handlePurchase(pkg)}
                        disabled={loading}
                        className={pkg.popular ? 'w-full bg-emerald-500 hover:bg-emerald-600' : 'w-full'}
                      >
                        {loading ? 'Processing...' : 'Purchase'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Custom Amount</p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="number"
                    placeholder="Enter USD amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="10"
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleCustomPurchase} disabled={loading || !customAmount}>
                  Purchase {customAmount && usdToCredits(parseFloat(customAmount)).toLocaleString()} Credits
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Minimum $10</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No transactions yet</p>
            ) : (
              transactions.map((txn) => (
                <Card key={txn.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getTransactionIcon(txn.transaction_type)}</span>
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">
                            {txn.transaction_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-slate-600">{txn.note}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(txn.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${txn.amount_credits > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {txn.amount_credits > 0 ? '+' : ''}{txn.amount_credits.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Balance: {txn.balance_after?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}