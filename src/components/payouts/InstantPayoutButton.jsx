import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { 
  requestInstantPayout, 
  calculatePendingUSD,
  MIN_INSTANT_PAYOUT_USD,
  INSTANT_PAYOUT_FEE_PCT
} from './PayoutService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function InstantPayoutButton({ cleanerEmail, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [pendingUSD, setPendingUSD] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingAmount();
  }, [cleanerEmail]);

  const loadPendingAmount = async () => {
    try {
      const amount = await calculatePendingUSD(cleanerEmail);
      setPendingUSD(amount);
    } catch (err) {
      console.error('Error loading pending amount:', err);
    }
  };

  const handleRequestPayout = async () => {
    setLoading(true);
    setError('');
    try {
      await requestInstantPayout(cleanerEmail);
      setShowConfirmation(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const feeUSD = pendingUSD * INSTANT_PAYOUT_FEE_PCT;
  const netUSD = pendingUSD - feeUSD;
  const canRequestPayout = pendingUSD >= MIN_INSTANT_PAYOUT_USD;

  return (
    <>
      <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-fredoka font-bold text-xl text-graphite">Pending Earnings</h3>
              <p className="text-3xl font-fredoka font-bold text-puretask-blue mt-1">
                ${pendingUSD.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-puretask-blue opacity-50" />
          </div>

          {canRequestPayout ? (
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={loading}
              className="w-full brand-gradient text-white rounded-full font-fredoka font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Cash Out Now
            </Button>
          ) : (
            <div className="text-center">
              <Badge variant="secondary" className="font-verdana">
                Minimum ${MIN_INSTANT_PAYOUT_USD} required
              </Badge>
            </div>
          )}

          <p className="text-xs text-gray-600 text-center mt-3 font-verdana">
            Weekly payouts are free every Friday
          </p>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-2xl">Confirm Instant Payout</DialogTitle>
            <DialogDescription className="font-verdana">
              Get your money now with a small fee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-verdana text-gray-600">Pending Earnings</span>
              <span className="font-fredoka font-bold text-lg">${pendingUSD.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <span className="font-verdana text-gray-600">Instant Payout Fee ({(INSTANT_PAYOUT_FEE_PCT * 100).toFixed(0)}%)</span>
              <span className="font-fredoka font-bold text-lg text-red-600">-${feeUSD.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <span className="font-verdana font-semibold text-gray-800">You'll Receive</span>
              <span className="font-fredoka font-bold text-2xl text-green-600">${netUSD.toFixed(2)}</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-verdana text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="flex-1 rounded-full font-fredoka"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestPayout}
                disabled={loading}
                className="flex-1 brand-gradient text-white rounded-full font-fredoka font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Confirm Cash Out
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center font-verdana">
              Funds typically arrive in 1-2 business days
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}