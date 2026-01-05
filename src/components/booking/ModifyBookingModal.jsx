import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, DollarSign, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function ModifyBookingModal({ booking, open, onClose, userType }) {
  const [modificationType, setModificationType] = useState('reschedule');
  const [newDate, setNewDate] = useState(booking?.date || '');
  const [newTime, setNewTime] = useState(booking?.start_time || '');
  const [newHours, setNewHours] = useState(booking?.hours || 3);
  const [reason, setReason] = useState('');
  const [specialRequest, setSpecialRequest] = useState(booking?.notes || '');
  const [loading, setLoading] = useState(false);
  const [aiCheck, setAiCheck] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const checkAvailability = async () => {
    if (!newDate || !newTime) return;
    
    setCheckingAvailability(true);
    try {
      const response = await base44.functions.invoke('bookingModifications', {
        action: 'checkAvailability',
        booking_id: booking.id,
        cleaner_email: booking.cleaner_email,
        new_date: newDate,
        new_time: newTime,
        new_hours: newHours
      });

      if (response.data.success) {
        setAiCheck(response.data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    }
    setCheckingAvailability(false);
  };

  useEffect(() => {
    if (modificationType === 'reschedule' && newDate && newTime) {
      checkAvailability();
    }
  }, [newDate, newTime, newHours]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('bookingModifications', {
        action: 'requestModification',
        booking_id: booking.id,
        requested_by: userType,
        requester_email: userType === 'client' ? booking.client_email : booking.cleaner_email,
        modification_type: modificationType,
        new_date: newDate,
        new_time: newTime,
        new_hours: newHours,
        special_request_text: specialRequest,
        reason: reason,
        original_date: booking.date,
        original_time: booking.start_time,
        original_hours: booking.hours
      });

      if (response.data.success) {
        toast.success('Modification request sent!');
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error submitting modification:', error);
      toast.error('Failed to submit modification request');
    }
    setLoading(false);
  };

  const priceDifference = aiCheck?.price_difference || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fredoka text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-puretask-blue" />
            Modify Booking
          </DialogTitle>
          <DialogDescription className="font-verdana">
            Request changes to your booking - the other party will need to approve
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Modification Type */}
          <div>
            <Label className="font-fredoka mb-2 block">What would you like to change?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={modificationType === 'reschedule' ? 'default' : 'outline'}
                onClick={() => setModificationType('reschedule')}
                className="h-auto py-3"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button
                variant={modificationType === 'duration_change' ? 'default' : 'outline'}
                onClick={() => setModificationType('duration_change')}
                className="h-auto py-3"
              >
                <Clock className="w-4 h-4 mr-2" />
                Change Duration
              </Button>
              <Button
                variant={modificationType === 'special_request' ? 'default' : 'outline'}
                onClick={() => setModificationType('special_request')}
                className="h-auto py-3"
              >
                Add Special Request
              </Button>
            </div>
          </div>

          {/* Reschedule Fields */}
          {(modificationType === 'reschedule' || modificationType === 'duration_change') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newDate" className="font-fredoka">New Date</Label>
                  <Input
                    id="newDate"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newTime" className="font-fredoka">New Time</Label>
                  <Input
                    id="newTime"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newHours" className="font-fredoka">Duration (hours)</Label>
                <Input
                  id="newHours"
                  type="number"
                  min="1"
                  max="8"
                  step="0.5"
                  value={newHours}
                  onChange={(e) => setNewHours(parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>

              {/* AI Availability Check */}
              {checkingAvailability && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-puretask-blue inline mr-2" />
                  <span className="text-sm font-verdana">Checking availability with AI...</span>
                </div>
              )}

              {aiCheck && !checkingAvailability && (
                <div className={`p-4 rounded-lg border-2 ${aiCheck.available ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-2">
                    {aiCheck.available ? (
                      <div className="w-full">
                        <p className="font-fredoka font-semibold text-green-700 flex items-center gap-2">
                          ✓ Slot Available
                        </p>
                        <p className="text-sm text-gray-700 font-verdana mt-1">{aiCheck.message}</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="font-fredoka font-semibold text-amber-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Potential Conflict
                        </p>
                        <p className="text-sm text-gray-700 font-verdana mt-1">{aiCheck.message}</p>
                        
                        {aiCheck.alternative_slots?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-fredoka font-semibold mb-2">AI Suggested Alternatives:</p>
                            <div className="space-y-2">
                              {aiCheck.alternative_slots.slice(0, 3).map((slot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setNewDate(slot.date);
                                    setNewTime(slot.time);
                                  }}
                                  className="w-full text-left p-2 bg-white rounded border border-amber-200 hover:border-amber-400 text-xs font-verdana"
                                >
                                  {format(parseISO(slot.date), 'MMM d')} at {slot.time} ({slot.reason})
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Difference */}
              {priceDifference !== 0 && (
                <div className={`p-3 rounded-lg border ${priceDifference > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-fredoka font-semibold">Price Adjustment:</span>
                    <span className={`font-verdana ${priceDifference > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                      {priceDifference > 0 ? '+' : ''}{priceDifference} credits
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-verdana mt-1">
                    {priceDifference > 0 ? 'Additional charge will apply' : 'You will receive a partial refund'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Special Request */}
          {modificationType === 'special_request' && (
            <div>
              <Label htmlFor="specialRequest" className="font-fredoka">Special Request</Label>
              <Textarea
                id="specialRequest"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Please focus extra on the kitchen and bathroom today..."
                rows={4}
                className="mt-1"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason" className="font-fredoka">Reason for Change (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Emergency came up, need to adjust timing..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Current vs New Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-fredoka font-semibold mb-3">Summary:</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-verdana text-xs">Current</p>
                <p className="font-verdana">{format(parseISO(booking.date), 'MMM d, yyyy')}</p>
                <p className="font-verdana">{booking.start_time} • {booking.hours}h</p>
              </div>
              {modificationType !== 'special_request' && (
                <div>
                  <p className="text-gray-500 font-verdana text-xs">New</p>
                  <p className="font-verdana">{newDate ? format(parseISO(newDate), 'MMM d, yyyy') : '—'}</p>
                  <p className="font-verdana">{newTime || '—'} • {newHours}h</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || (modificationType === 'reschedule' && (!newDate || !newTime))}
              className="brand-gradient text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}