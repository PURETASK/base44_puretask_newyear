import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Zap, CreditCard, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const QUICK_PACKAGES = [
  { usd: 25, credits: 250, bonus: 0, popular: false },
  { usd: 50, credits: 500, bonus: 25, popular: true },
  { usd: 100, credits: 1000, bonus: 100, popular: false },
];

export default function InsufficientCreditsDialog({ 
  open, 
  onClose, 
  requiredCredits, 
  currentBalance,
  onPurchaseComplete 
}) {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const shortfall = Math.max(0, requiredCredits - currentBalance);
  const recommendedPackage = QUICK_PACKAGES.find(pkg => 
    (pkg.credits + pkg.bonus) >= shortfall
  ) || QUICK_PACKAGES[QUICK_PACKAGES.length - 1];

  const handleQuickPurchase = async (pkg) => {
    setPurchasing(true);
    setSelectedPackage(pkg);

    try {
      // Get current user
      const user = await base44.auth.me();
      
      // Get client profile
      const profiles = await base44.entities.ClientProfile.filter({ 
        user_email: user.email 
      });
      
      if (profiles.length === 0) {
        throw new Error('Client profile not found');
      }

      const profile = profiles[0];
      const totalCredits = pkg.credits + pkg.bonus;
      const newBalance = (profile.credits_balance || 0) + totalCredits;

      // Update client profile with new balance
      await base44.entities.ClientProfile.update(profile.id, {
        credits_balance: newBalance
      });

      // Record transaction
      await base44.entities.CreditTransaction.create({
        client_email: user.email,
        transaction_type: 'purchase',
        amount_credits: totalCredits,
        balance_after: newBalance,
        note: `Purchased ${pkg.credits} credits${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''} for $${pkg.usd}`
      });

      toast.success(`Successfully purchased ${totalCredits} credits!`);
      
      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete(newBalance);
      }

      // Close dialog after short delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to complete purchase. Please try again.');
    }

    setPurchasing(false);
    setSelectedPackage(null);
  };

  const handleViewAllPackages = () => {
    onClose();
    navigate(createPageUrl('BuyCredits'));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            Insufficient Credits
          </DialogTitle>
          <DialogDescription>
            You need more credits to complete this booking
          </DialogDescription>
        </DialogHeader>

        {/* Credit Status */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-900">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Current Balance:</span>
              <Badge variant="outline" className="text-lg">
                {currentBalance} credits
              </Badge>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Required:</span>
              <Badge variant="outline" className="text-lg">
                {requiredCredits} credits
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-700">Shortfall:</span>
              <Badge className="bg-amber-500 text-white text-lg">
                {shortfall} credits needed
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Purchase Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-lg">Quick Top-Up Options</h3>
          </div>

          <div className="grid gap-4">
            {QUICK_PACKAGES.map((pkg, idx) => {
              const totalCredits = pkg.credits + pkg.bonus;
              const isRecommended = pkg === recommendedPackage;
              const isSufficient = totalCredits >= shortfall;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className={`relative border-2 transition-all ${
                      isRecommended 
                        ? 'border-emerald-500 shadow-lg' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white">
                          Recommended
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-8 h-8 text-emerald-600" />
                            <div>
                              <p className="text-3xl font-bold text-slate-900">
                                ${pkg.usd}
                              </p>
                              <p className="text-sm text-slate-500">
                                {pkg.credits} credits
                                {pkg.bonus > 0 && (
                                  <span className="text-emerald-600 font-semibold ml-1">
                                    +{pkg.bonus} bonus
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {pkg.bonus > 0 && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {Math.round((pkg.bonus / pkg.credits) * 100)}% bonus
                            </Badge>
                          )}

                          {isSufficient && (
                            <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                              Covers shortfall
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => handleQuickPurchase(pkg)}
                          disabled={purchasing}
                          className={`${
                            isRecommended
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : 'bg-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {purchasing && selectedPackage === pkg ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Buy Now
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* How Credits Work */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-900">
            <div className="flex items-start gap-2">
              <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">How Credits Work for Bookings</p>
                <ul className="text-sm space-y-1 text-blue-800">
                  <li>• Credits are held in escrow when you book</li>
                  <li>• Only charged for actual hours worked (rounded to 15 min)</li>
                  <li>• Unused credits automatically refunded</li>
                  <li>• 10 credits = $1 USD equivalent</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Alternative Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleViewAllPackages}
            className="flex-1"
            disabled={purchasing}
          >
            View All Packages
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={purchasing}
          >
            Cancel Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}