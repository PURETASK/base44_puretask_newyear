import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Clock, DollarSign, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function AgentApprovalCard({ action, onApprove, onDecline }) {
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [alternativeSlots, setAlternativeSlots] = React.useState([]);

  const actionTypes = {
    accept_booking: { label: 'Accept Booking', icon: Calendar, color: 'bg-green-100 text-green-700' },
    decline_booking: { label: 'Decline Booking', icon: X, color: 'bg-red-100 text-red-700' },
    suggest_reschedule: { label: 'Suggest Reschedule', icon: Clock, color: 'bg-blue-100 text-blue-700' },
    send_message: { label: 'Send Message', icon: Sparkles, color: 'bg-purple-100 text-purple-700' }
  };

  const typeInfo = actionTypes[action.action_type] || actionTypes.accept_booking;
  const Icon = typeInfo.icon;

  // Load alternative slots for reschedule suggestions
  React.useEffect(() => {
    if (action.action_type === 'suggest_reschedule' && action.booking_id) {
      loadAlternativeSlots();
    }
  }, [action.action_type, action.booking_id]);

  const loadAlternativeSlots = async () => {
    setLoadingSlots(true);
    try {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('agentAssistant', {
        action: 'suggestAlternativeSlots',
        booking_id: action.booking_id,
        cleaner_email: user.email
      });
      if (response.data.success) {
        setAlternativeSlots(response.data.alternatives || []);
        if (response.data.alternatives?.length > 0) {
          setSelectedSlot(response.data.alternatives[0]);
        }
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    }
    setLoadingSlots(false);
  };

  return (
    <Card className="border-2 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-fredoka flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {typeInfo.label}
          </CardTitle>
          <Badge className={typeInfo.color}>
            AI Suggested
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* AI Reasoning */}
        {action.ai_reasoning && (
          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs font-fredoka font-semibold text-blue-700 mb-1">AI Analysis:</p>
            <p className="text-sm font-verdana text-gray-700">{action.ai_reasoning}</p>
          </div>
        )}

        {/* Booking Details */}
        {action.booking_data && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-verdana">
                {format(parseISO(action.booking_data.date), 'EEEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-verdana">
                {action.booking_data.start_time} • {action.booking_data.hours} hours
              </span>
            </div>
            {action.booking_data.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-verdana text-gray-700">{action.booking_data.address}</span>
              </div>
            )}
            {action.booking_data.total_price && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-verdana font-semibold text-green-700">
                  {action.booking_data.total_price} credits
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Preview */}
        {action.message_text && (
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-xs font-fredoka font-semibold mb-1">Message to send:</p>
            <p className="text-sm font-verdana text-gray-700 italic">"{action.message_text}"</p>
          </div>
        )}

        {/* Client Risk Warning */}
        {action.client_risk && action.client_risk.level !== 'low' && (
          <div className={`p-2 rounded text-xs border ${
            action.client_risk.level === 'high' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`font-fredoka font-semibold mb-1 ${
              action.client_risk.level === 'high' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              ⚠️ Client Risk: {action.client_risk.level.toUpperCase()}
            </p>
            <ul className={`list-disc list-inside space-y-1 font-verdana ${
              action.client_risk.level === 'high' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {action.client_risk.warnings?.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Learned Preferences Context */}
        {action.learned_context && (
          <div className="p-2 bg-purple-50 rounded text-xs border border-purple-200">
            <p className="font-fredoka font-semibold text-purple-700 mb-1">🧠 Based on Your Preferences:</p>
            <div className="space-y-1 font-verdana text-purple-700">
              {action.learned_context.preference_match_score && (
                <div className="flex items-center gap-2">
                  <span>Match Score:</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {action.learned_context.preference_match_score}%
                  </Badge>
                </div>
              )}
              {action.learned_context.matches_rate_threshold !== undefined && (
                <p>{action.learned_context.matches_rate_threshold ? '✓' : '✗'} Meets your rate threshold</p>
              )}
              {action.learned_context.matches_preferred_types !== undefined && (
                <p>{action.learned_context.matches_preferred_types ? '✓' : '○'} {action.learned_context.matches_preferred_types ? 'Preferred' : 'Different'} cleaning type</p>
              )}
              {action.learned_context.matches_preferred_day !== undefined && (
                <p>{action.learned_context.matches_preferred_day ? '✓' : '○'} {action.learned_context.matches_preferred_day ? 'Your usual' : 'Different'} day</p>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        {action.benefits && action.benefits.length > 0 && (
          <div className="p-2 bg-green-50 rounded text-xs">
            <p className="font-fredoka font-semibold text-green-700 mb-1">Benefits:</p>
            <ul className="list-disc list-inside space-y-1 font-verdana text-green-700">
              {action.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Slots Selection (for reschedule) */}
        {action.action_type === 'suggest_reschedule' && (
          <div className="space-y-2">
            <p className="text-xs font-fredoka font-semibold">Select best alternative time:</p>
            {loadingSlots ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-puretask-blue" />
              </div>
            ) : (
              <div className="space-y-2">
                {alternativeSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSlot === slot
                        ? 'border-puretask-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-fredoka font-semibold text-sm">
                        {format(parseISO(slot.date), 'EEE, MMM d')} at {slot.time}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {slot.efficiency_score}% efficient
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 font-verdana">{slot.reason}</p>
                    {slot.nearby_jobs?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Near: {slot.nearby_jobs.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onApprove(selectedSlot)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={action.action_type === 'suggest_reschedule' && !selectedSlot}
          >
            <Check className="w-4 h-4 mr-2" />
            {action.action_type === 'suggest_reschedule' ? 'Send to Client' : 'Approve & Execute'}
          </Button>
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}