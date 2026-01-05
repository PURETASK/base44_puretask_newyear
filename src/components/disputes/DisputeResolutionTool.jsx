import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Scale, X } from 'lucide-react';

export default function DisputeResolutionTool({ dispute, booking, onResolved }) {
  const [resolving, setResolving] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [refundCredits, setRefundCredits] = useState(dispute.requested_refund_credits || 0);
  const [notes, setNotes] = useState('');

  const handleResolve = async () => {
    if (!outcome) {
      alert('Please select an outcome');
      return;
    }

    setResolving(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Dispute.update(dispute.id, {
        resolved_outcome: outcome,
        final_refund_credits: outcome === 'no_action' || outcome === 'cleaner_favor' ? 0 : refundCredits,
        resolution: notes,
        resolved_by: user.email,
        resolved_at: new Date().toISOString(),
        status: 'resolved'
      });

      if (onResolved) {
        onResolved();
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute. Please try again.');
    }
    setResolving(false);
  };

  const outcomeOptions = [
    { value: 'client_favor', label: 'Client Wins (Full Refund)', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'split', label: 'Split Decision (Partial Refund)', icon: Scale, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cleaner_favor', label: 'Cleaner Wins (No Refund)', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
    { value: 'no_action', label: 'No Action (Invalid/Duplicate)', icon: X, color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-fredoka text-xl flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Resolve Dispute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dispute Info */}
        <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-verdana text-gray-600">Filed By:</span>
            <Badge>{dispute.filed_by}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-verdana text-gray-600">Category:</span>
            <Badge variant="secondary">{dispute.category}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-verdana text-gray-600">Requested Refund:</span>
            <span className="font-fredoka font-semibold">
              {dispute.requested_refund_credits || 0} credits
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-verdana text-gray-700">{dispute.description}</p>
          </div>
        </div>

        {/* Outcome Selection */}
        <div>
          <label className="block text-sm font-verdana font-semibold text-gray-700 mb-3">
            Select Outcome
          </label>
          <div className="space-y-2">
            {outcomeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setOutcome(option.value)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    outcome === option.value
                      ? 'border-puretask-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${outcome === option.value ? 'text-puretask-blue' : 'text-gray-400'}`} />
                    <span className="font-fredoka font-semibold text-graphite">
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Refund Amount (if applicable) */}
        {outcome && outcome !== 'no_action' && outcome !== 'cleaner_favor' && (
          <div>
            <label className="block text-sm font-verdana font-semibold text-gray-700 mb-2">
              Final Refund Amount (Credits)
            </label>
            <Input
              type="number"
              value={refundCredits}
              onChange={(e) => setRefundCredits(parseFloat(e.target.value) || 0)}
              min="0"
              max={booking.final_charge_credits || booking.escrow_credits_reserved || 1000}
            />
            <p className="text-xs text-gray-500 mt-1 font-verdana">
              ${(refundCredits / 10).toFixed(2)} USD
            </p>
          </div>
        )}

        {/* Resolution Notes */}
        <div>
          <label className="block text-sm font-verdana font-semibold text-gray-700 mb-2">
            Resolution Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain the resolution decision..."
            className="min-h-[100px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleResolve}
            disabled={!outcome || resolving}
            className="flex-1 brand-gradient text-white rounded-full font-fredoka font-semibold"
          >
            {resolving ? 'Processing...' : 'Resolve Dispute'}
          </Button>
        </div>

        {/* Warning */}
        {outcome === 'client_favor' && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm font-verdana text-yellow-800">
              Full refund will reverse cleaner earnings and may impact their reliability score.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}