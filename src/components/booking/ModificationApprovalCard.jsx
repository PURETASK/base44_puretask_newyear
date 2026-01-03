import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Check, X, Loader2, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function ModificationApprovalCard({ modification, onUpdate }) {
  const [processing, setProcessing] = useState(null);

  const handleResponse = async (approved) => {
    setProcessing(approved ? 'approve' : 'decline');
    try {
      const response = await base44.functions.invoke('bookingModifications', {
        action: 'respondToModification',
        modification_id: modification.id,
        approved: approved
      });

      if (response.data.success) {
        toast.success(approved ? 'Modification approved!' : 'Modification declined');
        if (onUpdate) onUpdate();
      } else {
        toast.error(response.data.message || 'Failed to process response');
      }
    } catch (error) {
      console.error('Error responding to modification:', error);
      toast.error('Failed to respond');
    }
    setProcessing(null);
  };

  const typeLabels = {
    reschedule: 'Reschedule Request',
    duration_change: 'Duration Change',
    special_request: 'Special Request'
  };

  return (
    <Card className="border-2 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-fredoka">
            {typeLabels[modification.modification_type]}
          </CardTitle>
          <Badge className="bg-amber-600 text-white">
            Pending Approval
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm font-verdana">
          <p className="text-gray-600 mb-2">
            Requested by: <span className="font-semibold text-gray-800">{modification.requested_by}</span>
          </p>
          
          {modification.reason && (
            <p className="text-gray-700 mb-3 italic">"{modification.reason}"</p>
          )}
        </div>

        {(modification.modification_type === 'reschedule' || modification.modification_type === 'duration_change') && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-100 rounded">
              <p className="text-xs text-gray-500 mb-1">Current</p>
              <div className="flex items-center gap-1 text-gray-700">
                <Calendar className="w-3 h-3" />
                <span className="font-verdana">{format(parseISO(modification.original_date), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <Clock className="w-3 h-3" />
                <span className="font-verdana">{modification.original_time} • {modification.original_hours}h</span>
              </div>
            </div>

            <div className="p-2 bg-white rounded border border-green-200">
              <p className="text-xs text-green-600 mb-1">Proposed</p>
              <div className="flex items-center gap-1 text-gray-700">
                <Calendar className="w-3 h-3" />
                <span className="font-verdana">{format(parseISO(modification.new_date), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <Clock className="w-3 h-3" />
                <span className="font-verdana">{modification.new_time} • {modification.new_hours}h</span>
              </div>
            </div>
          </div>
        )}

        {modification.special_request_text && (
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-gray-500 mb-1">Special Request:</p>
            <p className="text-sm font-verdana text-gray-700">{modification.special_request_text}</p>
          </div>
        )}

        {modification.price_difference !== 0 && (
          <div className={`p-2 rounded text-sm ${modification.price_difference > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="font-fredoka">Price Change:</span>
              <span className="font-verdana font-semibold">
                {modification.price_difference > 0 ? '+' : ''}{modification.price_difference} credits
              </span>
            </div>
          </div>
        )}

        {modification.ai_availability_check && (
          <div className="p-2 bg-blue-50 rounded border border-blue-200 text-xs">
            <p className="font-fredoka mb-1">AI Analysis:</p>
            <p className="font-verdana text-gray-700">{modification.ai_availability_check.message}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleResponse(true)}
            disabled={processing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {processing === 'approve' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Approve
              </>
            )}
          </Button>
          <Button
            onClick={() => handleResponse(false)}
            disabled={processing}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            {processing === 'decline' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Decline
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}