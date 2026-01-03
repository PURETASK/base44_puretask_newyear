import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign, CreditCard, Zap, TrendingUp, CheckCircle, Shield,
  Info, Sparkles, Loader2, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { initiateCreditPurchase, CREDIT_PACKAGES } from '../components/payments/StripeService';
import { analytics } from '../components/analytics/AnalyticsService';
import CreditSystemExplainer from '../components/credits/CreditSystemExplainer';

export default function BuyCredits() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.ClientProfile.filter({ 
        user_email: currentUser.email 
      });

      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
      }

      analytics.pageView('BuyCredits');
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handlePurchase = async (pkg) => {
    if (!user || !clientProfile) {
      toast.error('Please log in to purchase credits');
      return;
    }

    setPurchasing(true);
    setSelectedPackage(pkg);

    try {
      analytics.payment('initiated', {
        package_id: pkg.id,
        amount_usd: pkg.usd,
        credits: pkg.credits,
        bonus: pkg.bonus
      });

      const result = await initiateCreditPurchase(pkg, user);

      if (result.success) {
        toast.success(`Successfully purchased ${result.credits} credits!`);
        
        analytics.payment('success', {
          package_id: pkg.id,
          amount_usd: pkg.usd,
          credits: result.credits,
          new_balance: result.newBalance
        });

        // Reload profile data
        await loadData();
      }
    } catch (error) {
      handleError(error, { userMessage: 'Purchase error:', showToast: false });
      toast.error('Purchase failed. Please try again.');
      
      analytics.payment('failed', {
        package_id: pkg.id,
        error_message: error.message
      });
    }

    setPurchasing(false);
    setSelectedPackage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Buy Credits</h1>
          <p className="text-lg text-slate-600">
            Choose a package that fits your cleaning needs
          </p>
        </div>

        {/* Current Balance */}
        {clientProfile && (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 mb-1">Current Balance</p>
                  <p className="text-4xl font-bold">
                    {clientProfile.credits_balance || 0} credits
                  </p>
                  <p className="text-sm text-emerald-100 mt-1">
                    ≈ ${((clientProfile.credits_balance || 0) / 1).toFixed(2)} USD value
                  </p>
                </div>
                <DollarSign className="w-16 h-16 text-emerald-100" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* How Credits Work */}
        <div className="mb-8">
          <CreditSystemExplainer />
        </div>

        {/* Credit Packages */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {CREDIT_PACKAGES.map((pkg, idx) => {
            const totalCredits = pkg.credits + pkg.bonus;
            const savingsPercentage = pkg.bonus > 0 
              ? Math.round((pkg.bonus / pkg.credits) * 100) 
              : 0;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={`relative border-2 transition-all hover:shadow-xl ${
                    pkg.popular 
                      ? 'border-emerald-500 shadow-lg' 
                      : 'border-slate-200'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-emerald-500 text-white px-4 py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className={pkg.popular ? 'bg-emerald-50' : ''}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-3xl font-bold">${pkg.usd}</span>
                      {savingsPercentage > 0 && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Save {savingsPercentage}%
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-4xl font-bold text-slate-900">
                          {totalCredits}
                        </p>
                        <p className="text-slate-600">credits</p>
                      </div>
                      
                      {pkg.bonus > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">{pkg.credits} base</span>
                          <span className="text-emerald-600 font-semibold">
                            + {pkg.bonus} bonus
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-slate-600 mt-3">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>≈ ${(totalCredits / 1).toFixed(0)} booking value</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Secure payment via Stripe</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Credits never expire</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasing}
                      className={`w-full ${
                        pkg.popular
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : 'bg-slate-700 hover:bg-slate-800'
                      }`}
                      size="lg"
                    >
                      {purchasing && selectedPackage?.id === pkg.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Trust */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Secure Payment Processing
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  All payments are processed securely through Stripe. We never store your credit card information.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    PCI Compliant
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    256-bit SSL Encryption
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Fraud Protection
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}