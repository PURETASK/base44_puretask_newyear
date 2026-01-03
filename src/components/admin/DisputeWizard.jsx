import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, User, Briefcase, DollarSign, CheckCircle, 
  XCircle, Scale, Loader2, ArrowRight 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DisputeWizard({ dispute, booking, onResolved }) {
  const [step, setStep] = useState(1); // 1: Review, 2: Decide, 3: Confirm
  const [resolution, setResolution] = useState(null); // 'client_favor', 'cleaner_favor', 'partial'
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [creditSplit, setCreditSplit] = useState({ client: 0, cleaner: 0 });
  const [processing, setProcessing] = useState(false);

  const totalCredits = booking?.final_charge_credits || booking?.total_price || 0;

  const handleSelectResolution = (type) => {
    setResolution(type);
    
    if (type === 'client_favor') {
      setCreditSplit({ client: totalCredits, cleaner: 0 });
    } else if (type === 'cleaner_favor') {
      setCreditSplit({ client: 0, cleaner: totalCredits });
    } else if (type === 'partial') {
      const half = totalCredits / 2;
      setCreditSplit({ client: half, cleaner: half });
    }
    
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    setProcessing(true);

    try {
      const user = await base44.auth.me();

      // Update dispute
      await base44.entities.Dispute.update(dispute.id, {
        status: 'resolved',
        resolution: resolutionNotes,
        resolved_by: user.email,
        resolved_at: new Date().toISOString()
      });

      // Update booking
      await base44.entities.Booking.update(booking.id, {
        status: 'completed',
        dispute_status: resolution
      });

      // Handle credit refund if client favor or partial
      if (creditSplit.client > 0) {
        const clientProfiles = await base44.entities.ClientProfile.filter({ 
          user_email: booking.client_email 
        });
        
        if (clientProfiles.length > 0) {
          const profile = clientProfiles[0];
          const newBalance = (profile.credits_balance || 0) + creditSplit.client;
          
          await base44.entities.ClientProfile.update(profile.id, {
            credits_balance: newBalance
          });

          await base44.entities.CreditTransaction.create({
            client_email: booking.client_email,
            transaction_type: 'refund',
            amount_credits: creditSplit.client,
            booking_id: booking.id,
            note: `Dispute resolved: ${resolution} - ${resolutionNotes}`,
            balance_after: newBalance
          });
        }
      }

      // Handle cleaner earnings if cleaner favor or partial
      if (creditSplit.cleaner > 0) {
        await base44.entities.CleanerEarning.create({
          cleaner_email: booking.cleaner_email,
          booking_id: booking.id,
          credits_earned: creditSplit.cleaner,
          payout_percentage: booking.payout_percentage_at_accept || 0.80,
          usd_due: (creditSplit.cleaner / 10) * (booking.payout_percentage_at_accept || 0.80),
          status: 'pending'
        });
      }

      // Log admin action
      await base44.entities.Event.create({
        event_type: 'admin_action',
        user_email: user.email,
        details: `Resolved dispute ${dispute.id} - ${resolution}: Client gets ${creditSplit.client} credits, Cleaner gets ${creditSplit.cleaner} credits`,
        timestamp: new Date().toISOString()
      });

      toast.success('Dispute resolved successfully');
      
      if (onResolved) onResolved();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-puretask-blue' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-fredoka font-bold ${
            step >= 1 ? 'brand-gradient text-white' : 'bg-gray-200'
          }`}>1</div>
          <span className="font-fredoka font-medium">Review</span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-puretask-blue' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-fredoka font-bold ${
            step >= 2 ? 'brand-gradient text-white' : 'bg-gray-200'
          }`}>2</div>
          <span className="font-fredoka font-medium">Decide</span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-puretask-blue' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-fredoka font-bold ${
            step >= 3 ? 'brand-gradient text-white' : 'bg-gray-200'
          }`}>3</div>
          <span className="font-fredoka font-medium">Confirm</span>
        </div>
      </div>

      {/* Step 1: Review */}
      {step === 1 && (
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Dispute Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <p className="text-sm text-gray-600 font-verdana mb-1">Filed By</p>
                <p className="font-fredoka font-semibold text-graphite">{dispute.filed_by}</p>
                <p className="text-sm text-gray-500 font-verdana">{dispute.user_email}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl">
                <p className="text-sm text-gray-600 font-verdana mb-1">Category</p>
                <Badge className="bg-purple-600 text-white rounded-full font-fredoka">{dispute.category}</Badge>
              </div>
            </div>

            <div>
              <Label className="font-fredoka text-graphite mb-2 block">Dispute Reason</Label>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="font-verdana text-gray-700">{dispute.description}</p>
              </div>
            </div>

            <div>
              <Label className="font-fredoka text-graphite mb-2 block">Booking Amount</Label>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                <p className="text-3xl font-fredoka font-bold text-fresh-mint">
                  {Math.round(totalCredits * 10)} credits
                </p>
                <p className="text-sm text-gray-600 font-verdana">≈ ${totalCredits.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <Button
                onClick={() => handleSelectResolution('client_favor')}
                className="flex-col h-auto p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl"
              >
                <User className="w-8 h-8 mb-2" />
                <span className="font-fredoka font-semibold">Client Favor</span>
                <span className="text-xs mt-1">Full refund</span>
              </Button>

              <Button
                onClick={() => handleSelectResolution('cleaner_favor')}
                className="flex-col h-auto p-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl"
              >
                <Briefcase className="w-8 h-8 mb-2" />
                <span className="font-fredoka font-semibold">Cleaner Favor</span>
                <span className="text-xs mt-1">Full payout</span>
              </Button>

              <Button
                onClick={() => handleSelectResolution('partial')}
                className="flex-col h-auto p-6 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl"
              >
                <Scale className="w-8 h-8 mb-2" />
                <span className="font-fredoka font-semibold">Split Resolution</span>
                <span className="text-xs mt-1">Partial both</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Decide & Configure */}
      {step === 2 && (
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Scale className="w-6 h-6 text-purple-600" />
              Configure Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="border-purple-200 bg-purple-50 rounded-2xl">
              <AlertDescription className="text-purple-900 font-verdana">
                <strong>Selected:</strong> {
                  resolution === 'client_favor' ? 'Client Favor (Full Refund)' :
                  resolution === 'cleaner_favor' ? 'Cleaner Favor (Full Payout)' :
                  'Split Resolution (Partial)'
                }
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-puretask-blue" />
                  <span className="font-fredoka font-semibold text-graphite">Client Refund</span>
                </div>
                <p className="text-3xl font-fredoka font-bold text-puretask-blue">
                  {Math.round(creditSplit.client * 10)} credits
                </p>
                <p className="text-sm text-gray-600 font-verdana">≈ ${creditSplit.client.toFixed(2)}</p>
              </div>

              <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-fresh-mint" />
                  <span className="font-fredoka font-semibold text-graphite">Cleaner Payout</span>
                </div>
                <p className="text-3xl font-fredoka font-bold text-fresh-mint">
                  {Math.round(creditSplit.cleaner * 10)} credits
                </p>
                <p className="text-sm text-gray-600 font-verdana">≈ ${creditSplit.cleaner.toFixed(2)}</p>
              </div>
            </div>

            {resolution === 'partial' && (
              <div>
                <Label className="font-fredoka text-graphite mb-2 block">Adjust Split (Optional)</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      value={creditSplit.client}
                      onChange={(e) => {
                        const clientAmount = parseFloat(e.target.value) || 0;
                        setCreditSplit({ 
                          client: clientAmount, 
                          cleaner: totalCredits - clientAmount 
                        });
                      }}
                      min="0"
                      max={totalCredits}
                      step="0.5"
                      className="rounded-full font-verdana"
                      placeholder="Client refund"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={creditSplit.cleaner}
                      onChange={(e) => {
                        const cleanerAmount = parseFloat(e.target.value) || 0;
                        setCreditSplit({ 
                          cleaner: cleanerAmount, 
                          client: totalCredits - cleanerAmount 
                        });
                      }}
                      min="0"
                      max={totalCredits}
                      step="0.5"
                      className="rounded-full font-verdana"
                      placeholder="Cleaner payout"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="resolution_notes" className="font-fredoka text-graphite">Resolution Notes *</Label>
              <Textarea
                id="resolution_notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain the decision and any actions taken..."
                rows={4}
                className="rounded-2xl font-verdana"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 rounded-full font-fredoka"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!resolutionNotes.trim()}
                className="flex-1 brand-gradient text-white rounded-full font-fredoka font-semibold"
              >
                Review Resolution
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <CheckCircle className="w-6 h-6 text-fresh-mint" />
              Confirm Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
              <AlertDescription className="text-blue-900 font-verdana">
                <strong>Review carefully:</strong> This action will process credits, update earnings, and notify both parties. This cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 bg-soft-cloud rounded-2xl">
                <p className="font-fredoka font-semibold text-graphite mb-2">Resolution Type</p>
                <Badge className="bg-purple-600 text-white rounded-full font-fredoka">
                  {resolution === 'client_favor' ? 'Client Favor' :
                   resolution === 'cleaner_favor' ? 'Cleaner Favor' :
                   'Split Resolution'}
                </Badge>
              </div>

              <div className="p-4 bg-soft-cloud rounded-2xl">
                <p className="font-fredoka font-semibold text-graphite mb-2">Credit Distribution</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600 font-verdana">Client Refund</p>
                    <p className="text-xl font-fredoka font-bold text-puretask-blue">
                      {Math.round(creditSplit.client * 10)} credits
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-verdana">Cleaner Payout</p>
                    <p className="text-xl font-fredoka font-bold text-fresh-mint">
                      {Math.round(creditSplit.cleaner * 10)} credits
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-soft-cloud rounded-2xl">
                <p className="font-fredoka font-semibold text-graphite mb-2">Resolution Notes</p>
                <p className="text-gray-700 font-verdana">{resolutionNotes}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 rounded-full font-fredoka"
                disabled={processing}
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={processing}
                className="flex-1 bg-fresh-mint hover:bg-green-600 text-white rounded-full font-fredoka font-semibold"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm & Apply
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}