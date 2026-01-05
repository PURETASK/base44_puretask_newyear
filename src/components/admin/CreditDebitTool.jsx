import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, MinusCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreditDebitTool({ clientEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleDebit = async () => {
    if (!clientEmail || !amount || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const credits = parseFloat(amount);
    if (isNaN(credits) || credits <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }

    setProcessing(true);

    try {
      const user = await base44.auth.me();
      
      // Find client profile
      const profiles = await base44.entities.ClientProfile.filter({ user_email: clientEmail });
      if (profiles.length === 0) {
        toast.error('Client profile not found');
        setProcessing(false);
        return;
      }

      const clientProfile = profiles[0];
      const currentBalance = clientProfile.credits_balance || 0;

      // Check if client has enough credits
      if (currentBalance < credits) {
        toast.error(`Insufficient balance. Client only has ${currentBalance} credits.`);
        setProcessing(false);
        return;
      }

      // Update client wallet balance (deduct)
      const newBalance = currentBalance - credits;
      await base44.entities.ClientProfile.update(clientProfile.id, {
        credits_balance: newBalance
      });

      // Create ledger entry with negative amount
      await base44.entities.CreditTransaction.create({
        client_email: clientEmail,
        transaction_type: 'refund',
        amount_credits: -credits, // Negative for debit
        note: `Admin debit: ${reason}`,
        balance_after: newBalance
      });

      // Log admin action
      await base44.entities.Event.create({
        event_type: 'admin_action',
        user_email: user.email,
        details: `Debited ${credits} credits from ${clientEmail}. Reason: ${reason}`,
        timestamp: new Date().toISOString()
      });

      toast.success(`Successfully debited ${credits} credits from ${clientEmail}`);
      
      if (onSuccess) onSuccess();

      // Reset form
      setAmount('');
      setReason('');
    } catch (error) {
      console.error('Error debiting credits:', error);
      toast.error('Failed to debit credits');
    }

    setProcessing(false);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl border-2 border-red-200">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
          <MinusCircle className="w-6 h-6 text-red-600" />
          Debit/Refund Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert className="border-red-300 bg-red-50 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-900 font-verdana">
            <strong>Use with caution:</strong> This will remove credits from the client's account. 
            Use for refunds, corrections, or penalties. All actions are logged.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="debit_client_email" className="font-fredoka text-graphite">Client Email</Label>
            <Input
              id="debit_client_email"
              type="email"
              value={clientEmail || ''}
              disabled
              className="rounded-full font-verdana bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="debit_amount" className="font-fredoka text-graphite">Credits to Debit</Label>
            <div className="relative">
              <MinusCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
              <Input
                id="debit_amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50"
                min="1"
                step="10"
                className="pl-10 rounded-full font-verdana border-red-200 focus:border-red-300"
              />
            </div>
            <p className="text-xs text-gray-500 font-verdana mt-1">
              Amount will be deducted from client's balance
            </p>
          </div>

          <div>
            <Label htmlFor="debit_reason" className="font-fredoka text-graphite">Reason for Debit *</Label>
            <Textarea
              id="debit_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Refund for cancelled booking, penalty for violation, correction of error..."
              rows={3}
              className="rounded-2xl font-verdana border-red-200 focus:border-red-300"
            />
          </div>

          <Button
            onClick={handleDebit}
            disabled={processing || !clientEmail || !amount || !reason.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full font-fredoka font-semibold"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MinusCircle className="w-5 h-5 mr-2" />
                Debit {amount || '0'} Credits
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}