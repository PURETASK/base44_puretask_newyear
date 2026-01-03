import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Gift, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreditGrantTool({ clientEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleGrant = async () => {
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
    setResult(null);

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

      // Update client wallet balance
      const newBalance = (clientProfile.credits_balance || 0) + credits;
      await base44.entities.ClientProfile.update(clientProfile.id, {
        credits_balance: newBalance
      });

      // Create ledger entry
      await base44.entities.CreditTransaction.create({
        client_email: clientEmail,
        transaction_type: 'purchase',
        amount_credits: credits,
        note: `Admin credit grant: ${reason}`,
        balance_after: newBalance
      });

      // Log admin action
      await base44.entities.Event.create({
        event_type: 'admin_action',
        user_email: user.email,
        details: `Granted ${credits} credits to ${clientEmail}. Reason: ${reason}`,
        timestamp: new Date().toISOString()
      });

      setResult({
        success: true,
        message: `Successfully granted ${credits} credits to ${clientEmail}`,
        newBalance
      });

      toast.success('Credits granted successfully');
      
      if (onSuccess) onSuccess();

      // Reset form
      setAmount('');
      setReason('');
    } catch (error) {
      console.error('Error granting credits:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to grant credits'
      });
      toast.error('Failed to grant credits');
    }

    setProcessing(false);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
          <Gift className="w-6 h-6 text-fresh-mint" />
          Grant Goodwill Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-puretask-blue" />
          <AlertDescription className="text-blue-900 font-verdana">
            Use this tool to grant credits for goodwill, service recovery, or promotional purposes. All actions are logged in admin_actions.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="client_email" className="font-fredoka text-graphite">Client Email</Label>
            <Input
              id="client_email"
              type="email"
              value={clientEmail || ''}
              disabled
              className="rounded-full font-verdana bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="credit_amount" className="font-fredoka text-graphite">Credit Amount (in credits)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="credit_amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                min="1"
                step="10"
                className="pl-10 rounded-full font-verdana"
              />
            </div>
            <p className="text-xs text-gray-500 font-verdana mt-1">
              Note: 10 credits = $1 USD
            </p>
          </div>

          <div>
            <Label htmlFor="reason" className="font-fredoka text-graphite">Reason for Grant *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Service recovery, goodwill gesture, promotional campaign..."
              rows={3}
              className="rounded-2xl font-verdana"
            />
          </div>

          <Button
            onClick={handleGrant}
            disabled={processing || !clientEmail || !amount || !reason.trim()}
            className="w-full brand-gradient text-white rounded-full font-fredoka font-semibold"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Granting Credits...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Grant {amount || '0'} Credits
              </>
            )}
          </Button>
        </div>

        {result && (
          <Alert className={`rounded-2xl ${result.success ? 'border-fresh-mint bg-green-50' : 'border-red-300 bg-red-50'}`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-fresh-mint" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={`font-verdana ${result.success ? 'text-green-900' : 'text-red-900'}`}>
              {result.message}
              {result.success && result.newBalance && (
                <span className="block mt-1 text-sm">New balance: {Math.round(result.newBalance * 10)} credits</span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}