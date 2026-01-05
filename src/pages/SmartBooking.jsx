import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AddressAutocomplete from '../components/address/AddressAutocomplete';
import { 
  Calendar, Clock, Sparkles, Loader2, 
  XCircle, RefreshCw, Bot, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const cleanerEmail = new URLSearchParams(location.search).get('cleaner');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [responding, setResponding] = useState(false);
  const [cleaner, setCleaner] = useState(null);

  const [formData, setFormData] = useState({
    address: '',
    entry_instructions: '',
    cleaning_type: 'basic',
    estimated_hours: 3,
    preferred_dates: [],
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 1000,
    client_preferences: ''
  });

  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [alternativeMessage, setAlternativeMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (cleanerEmail) {
        const profiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
        if (profiles.length > 0) {
          setCleaner(profiles[0]);
        }
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!formData.address) {
      toast.error('Please enter an address');
      return;
    }

    if (!cleanerEmail) {
      toast.error('No cleaner selected');
      return;
    }

    try {
      setGenerating(true);
      const response = await base44.functions.invoke('suggestBookingSlots', {
        client_email: user.email,
        cleaner_email: cleanerEmail,
        cleaning_type: formData.cleaning_type,
        estimated_hours: formData.estimated_hours,
        preferred_dates: formData.preferred_dates,
        address: formData.address,
        entry_instructions: formData.entry_instructions,
        client_preferences: formData.client_preferences
      });

      if (response.data.success) {
        setSuggestedSlots(response.data.suggested_slots || []);
        setAlternativeMessage(response.data.alternative_message || '');
        toast.success('AI generated optimal time slots!');
      } else {
        toast.error(response.data.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      toast.error('Failed to generate suggestions');
      handleError(error, { showToast: false });
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectSlot = async (slot) => {
    try {
      setResponding(true);
      const response = await base44.functions.invoke('processClientBookingResponse', {
        client_response: 'selected_slot',
        selected_slot: {
          date: slot.date,
          start_time: slot.start_time
        },
        client_email: user.email,
        cleaner_email: cleanerEmail,
        cleaning_type: formData.cleaning_type,
        estimated_hours: formData.estimated_hours,
        address: formData.address,
        entry_instructions: formData.entry_instructions,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        square_feet: formData.square_feet
      });

      if (response.data.success) {
        toast.success('Booking request sent! Awaiting cleaner approval.');
        setTimeout(() => {
          navigate(createPageUrl('ClientBookings'));
        }, 2000);
      } else {
        toast.error(response.data.error || 'Failed to send booking request');
      }
    } catch (error) {
      toast.error('Failed to send booking request');
      handleError(error, { showToast: false });
    } finally {
      setResponding(false);
    }
  };

  const handleNotInterested = async () => {
    try {
      await base44.functions.invoke('processClientBookingResponse', {
        client_response: 'not_interested',
        client_email: user.email,
        cleaner_email: cleanerEmail
      });
      toast.info('We\'ll find other great cleaners for you');
      navigate(createPageUrl('BrowseCleaners'));
    } catch (error) {
      handleError(error, { showToast: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-puretask-blue to-indigo-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-fredoka font-bold text-graphite">AI-Powered Booking</h1>
              <p className="text-gray-600 font-verdana">Let AI find the perfect time for your cleaning</p>
            </div>
          </div>
        </motion.div>

        {/* Cleaner Info */}
        {cleaner && (
          <Card className="mb-6 border-2 border-puretask-blue">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-puretask-blue to-cyan-500 flex items-center justify-center text-white font-fredoka font-bold text-xl">
                  {cleaner.full_name?.[0] || 'C'}
                </div>
                <div>
                  <p className="font-fredoka font-bold text-lg">{cleaner.full_name}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-puretask-blue text-white">{cleaner.tier}</Badge>
                    <Badge variant="outline">⭐ {cleaner.average_rating?.toFixed(1)}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {suggestedSlots.length === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-fredoka">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Address *</Label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(address) => setFormData({ ...formData, address })}
                  placeholder="Enter your address"
                />
              </div>

              <div className="space-y-2">
                <Label>Entry Instructions</Label>
                <Textarea
                  value={formData.entry_instructions}
                  onChange={(e) => setFormData({ ...formData, entry_instructions: e.target.value })}
                  placeholder="How should the cleaner access your home?"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cleaning Type</Label>
                  <select
                    value={formData.cleaning_type}
                    onChange={(e) => setFormData({ ...formData, cleaning_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="basic">Basic Clean</option>
                    <option value="deep">Deep Clean</option>
                    <option value="moveout">Move-Out Clean</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Square Feet</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({ ...formData, square_feet: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Preferences (Optional)</Label>
                <Textarea
                  value={formData.client_preferences}
                  onChange={(e) => setFormData({ ...formData, client_preferences: e.target.value })}
                  placeholder="Any specific requirements or preferences..."
                  rows={2}
                />
              </div>

              <Button
                onClick={handleGenerateSuggestions}
                disabled={generating}
                className="w-full brand-gradient text-white gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI is analyzing schedules...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Suggested Slots */}
        <AnimatePresence>
          {suggestedSlots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-fredoka flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-puretask-blue" />
                      AI Suggested Time Slots
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSuggestions}
                      disabled={generating}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Show More
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {suggestedSlots.map((slot, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-puretask-blue hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleSelectSlot(slot)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-puretask-blue to-cyan-500 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-fredoka font-bold text-lg text-graphite">
                              {new Date(slot.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="font-verdana text-sm">
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                          </div>
                        </div>
                        {slot.fills_gap && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ⚡ Optimal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-verdana mt-2 pl-15">
                        💡 {slot.reasoning}
                      </p>
                    </motion.div>
                  ))}

                  {alternativeMessage && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 font-verdana">{alternativeMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleNotInterested}
                      className="flex-1 gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Not Interested
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {responding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardContent className="p-6 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-puretask-blue mx-auto mb-4" />
                <p className="font-fredoka font-bold text-lg mb-2">Sending Request...</p>
                <p className="text-sm text-gray-600">The cleaner will be notified immediately</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}