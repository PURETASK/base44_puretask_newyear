import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TipPrompt({ booking, cleanerName, open, onClose, onTipSubmitted }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const suggestedTips = [
    { label: '15%', amount: booking.total_price * 0.15, percentage: 15 },
    { label: '20%', amount: booking.total_price * 0.20, percentage: 20, popular: true },
    { label: '25%', amount: booking.total_price * 0.25, percentage: 25 }
  ];

  const handleSubmitTip = async () => {
    const tipAmount = selectedAmount || parseFloat(customAmount);
    
    if (!tipAmount || tipAmount <= 0) {
      toast.error('Please enter a valid tip amount');
      return;
    }
    
    setLoading(true);
    
    try {
      await base44.entities.Tip.create({
        booking_id: booking.id,
        client_email: booking.client_email,
        cleaner_email: booking.cleaner_email,
        amount: tipAmount,
        percentage: selectedAmount ? 
          suggestedTips.find(t => t.amount === selectedAmount)?.percentage : null,
        status: 'pending'
      });
      
      // Send notification to cleaner
      await base44.integrations.Core.SendEmail({
        from_name: 'PureTask',
        to: booking.cleaner_email,
        subject: '💰 You received a tip!',
        body: `Great news! You received a $${tipAmount.toFixed(2)} tip from your client for the cleaning on ${booking.date}.

The tip will be included in your next payout.

Keep up the excellent work! 🌟

The PureTask Team`
      });
      
      toast.success(`Tip of $${tipAmount.toFixed(2)} sent to ${cleanerName}!`);
      
      if (onTipSubmitted) {
        onTipSubmitted(tipAmount);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting tip:', error);
      toast.error('Failed to submit tip. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-7 h-7 text-red-500" />
            Show Your Appreciation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
            <p className="text-lg text-slate-700 mb-2">
              <strong>{cleanerName}</strong> did a great job! Want to leave a tip?
            </p>
            <p className="text-sm text-slate-600">
              💯 100% of your tip goes directly to your cleaner
            </p>
          </div>

          {/* Suggested Tip Amounts */}
          <div className="grid grid-cols-3 gap-3">
            {suggestedTips.map((tip) => (
              <motion.button
                key={tip.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedAmount(tip.amount);
                  setCustomAmount('');
                }}
                className={`p-4 rounded-xl border-2 transition-all relative ${
                  selectedAmount === tip.amount
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {tip.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5">
                    Popular
                  </Badge>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    ${tip.amount.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{tip.label}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Custom Amount */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Or enter a custom amount:
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="pl-10 text-lg"
              />
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 italic">
            You can always add a tip later from your booking history
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmitTip}
            disabled={loading || (!selectedAmount && !customAmount)}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Leave Tip
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}