import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Megaphone, Users, DollarSign, Calendar, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function CreditCampaignManager() {
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('all_clients');
  const [creditAmount, setCreditAmount] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [promoCode, setPromoCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const audienceOptions = [
    { value: 'all_clients', label: 'All Clients', description: 'Every client in the system' },
    { value: 'new_signups', label: 'New Sign-ups (Last 30 Days)', description: 'Recently registered clients' },
    { value: 'inactive_clients', label: 'Inactive Clients (3+ Months)', description: 'No bookings in 90 days' },
    { value: 'zero_balance', label: 'Zero Credit Balance', description: 'Clients with 0 credits' },
    { value: 'first_booking_incomplete', label: 'First Booking Not Completed', description: 'Signed up but no bookings' }
  ];

  const getTargetedClients = async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const allProfiles = await base44.entities.ClientProfile.list();

    switch (targetAudience) {
      case 'all_clients':
        return allProfiles;
      
      case 'new_signups':
        return allProfiles.filter(p => new Date(p.created_date) >= thirtyDaysAgo);
      
      case 'inactive_clients':
        const bookings = await base44.entities.Booking.list();
        const recentBookings = new Set(
          bookings
            .filter(b => new Date(b.created_date) >= ninetyDaysAgo)
            .map(b => b.client_email)
        );
        return allProfiles.filter(p => !recentBookings.has(p.user_email));
      
      case 'zero_balance':
        return allProfiles.filter(p => (p.credits_balance || 0) === 0);
      
      case 'first_booking_incomplete':
        return allProfiles.filter(p => !p.completed_first_booking);
      
      default:
        return allProfiles;
    }
  };

  const handleRunCampaign = async () => {
    if (!campaignName || !creditAmount || !promoCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    const credits = parseFloat(creditAmount);
    if (isNaN(credits) || credits <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const user = await base44.auth.me();
      const targetedClients = await getTargetedClients();

      if (targetedClients.length === 0) {
        toast.error('No clients match the selected audience criteria');
        setProcessing(false);
        return;
      }

      // Confirm with admin
      const confirmed = window.confirm(
        `This will grant ${credits} credits to ${targetedClients.length} client(s). Continue?`
      );

      if (!confirmed) {
        setProcessing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const client of targetedClients) {
        try {
          const currentBalance = client.credits_balance || 0;
          const newBalance = currentBalance + credits;

          // Update balance
          await base44.entities.ClientProfile.update(client.id, {
            credits_balance: newBalance
          });

          // Create transaction
          await base44.entities.CreditTransaction.create({
            client_email: client.user_email,
            transaction_type: 'promo',
            amount_credits: credits,
            note: `Campaign: ${campaignName} (${promoCode})`,
            balance_after: newBalance
          });

          successCount++;
        } catch (error) {
          console.error(`Error granting to ${client.user_email}:`, error);
          errorCount++;
        }
      }

      // Log campaign
      await base44.entities.Event.create({
        event_type: 'admin_action',
        user_email: user.email,
        details: `Ran credit campaign "${campaignName}": ${credits} credits to ${successCount} clients. Audience: ${targetAudience}`,
        timestamp: new Date().toISOString()
      });

      setResult({
        success: true,
        successCount,
        errorCount,
        totalTargeted: targetedClients.length
      });

      toast.success(`Campaign completed! ${successCount} credits granted successfully.`);

      // Reset form
      setCampaignName('');
      setCreditAmount('');
      setPromoCode('');
    } catch (error) {
      console.error('Campaign error:', error);
      toast.error('Failed to run campaign');
      setResult({
        success: false,
        message: error.message
      });
    }

    setProcessing(false);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
          <Megaphone className="w-6 h-6 text-pink-600" />
          Credit Promotion Campaign
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert className="border-pink-200 bg-pink-50 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-pink-600" />
          <AlertDescription className="text-pink-900 font-verdana">
            Create automated credit campaigns to grant credits to specific client segments for marketing and retention purposes.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="font-fredoka text-graphite">Campaign Name *</Label>
              <Input
                type="text"
                placeholder="e.g., Spring Welcome Bonus"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="rounded-full font-verdana"
              />
            </div>

            <div>
              <Label className="font-fredoka text-graphite">Target Audience *</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="rounded-full font-verdana">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-fredoka text-graphite">Credits per Client *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  placeholder="50"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  min="1"
                  className="pl-10 rounded-full font-verdana"
                />
              </div>
            </div>

            <div>
              <Label className="font-fredoka text-graphite">Validity Period (Days)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  placeholder="30"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  min="1"
                  className="pl-10 rounded-full font-verdana"
                />
              </div>
              <p className="text-xs text-gray-500 font-verdana mt-1">Optional expiration period</p>
            </div>

            <div>
              <Label className="font-fredoka text-graphite">Promo Code / Reference *</Label>
              <Input
                type="text"
                placeholder="SPRING2024"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="rounded-full font-verdana uppercase"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-300 text-center">
              <Megaphone className="w-16 h-16 text-pink-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600 font-verdana mb-2">Campaign Preview</p>
              <p className="text-4xl font-fredoka font-bold text-pink-600 mb-1">
                {creditAmount || '0'}
              </p>
              <p className="text-sm text-gray-600 font-verdana mb-4">credits per client</p>
              <Badge className="bg-pink-600 text-white font-fredoka text-sm px-4 py-1 mb-6">
                {audienceOptions.find(o => o.value === targetAudience)?.label || 'Select audience'}
              </Badge>
              <Button
                onClick={handleRunCampaign}
                disabled={processing || !campaignName || !creditAmount || !promoCode}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full font-fredoka font-semibold"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Running Campaign...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-5 h-5 mr-2" />
                    Run Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {result && (
          <Alert className={`rounded-2xl ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={`font-verdana ${result.success ? 'text-green-900' : 'text-red-900'}`}>
              {result.success ? (
                <>
                  <p className="font-medium mb-2">Campaign Completed Successfully!</p>
                  <p className="text-sm">✓ {result.successCount} client(s) received credits</p>
                  {result.errorCount > 0 && (
                    <p className="text-sm text-amber-700">⚠ {result.errorCount} failed</p>
                  )}
                  <p className="text-sm">Total targeted: {result.totalTargeted}</p>
                </>
              ) : (
                <p>Error: {result.message}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}