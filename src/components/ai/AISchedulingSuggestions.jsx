import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, TrendingUp, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AISchedulingSuggestions({ cleanerEmail }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, [cleanerEmail]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      
      // Get cleaner profile
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: cleanerEmail });
      if (profiles.length === 0) return;
      
      const profile = profiles[0];
      
      // Get client preferences that match cleaner's specialties
      const allClients = await base44.entities.ClientProfile.list();
      
      // Get cleaner's bookings to analyze gaps
      const bookings = await base44.entities.Booking.filter({ cleaner_email: cleanerEmail });
      
      // Generate AI suggestions using LLM
      const prompt = `You are an AI scheduling assistant for a cleaning professional.
      
Cleaner Profile:
- Specialties: ${profile.specialty_tags?.join(', ') || 'General cleaning'}
- Tier: ${profile.tier}
- Service Locations: ${profile.service_locations?.join(', ') || 'Not specified'}
- Instant Book: ${profile.instant_book_enabled ? 'Yes' : 'No'}
- Current Bookings: ${bookings.length}

Analyze the cleaner's schedule for the next 14 days and suggest optimal booking slots that:
1. Fill gaps in their schedule
2. Match clients with similar preferences
3. Maximize earnings by grouping nearby locations
4. Consider the cleaner's typical acceptance patterns

Return a JSON array of 3-5 suggestions with this structure:
[
  {
    "client_name": "Potential Client Name",
    "date": "2025-01-15",
    "time": "10:00 AM",
    "duration": 3,
    "location": "Area name",
    "reason": "Why this is a good match",
    "estimated_earnings": 120,
    "match_score": 85,
    "client_preferences": ["pet-friendly", "eco-products"]
  }
]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  client_name: { type: "string" },
                  date: { type: "string" },
                  time: { type: "string" },
                  duration: { type: "number" },
                  location: { type: "string" },
                  reason: { type: "string" },
                  estimated_earnings: { type: "number" },
                  match_score: { type: "number" },
                  client_preferences: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
    setLoading(false);
  };

  const handleAccept = async (suggestion) => {
    setProcessing(suggestion);
    // In a real implementation, this would reach out to the client
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuggestions(prev => prev.filter(s => s !== suggestion));
    setProcessing(null);
  };

  const handleDecline = (suggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-puretask-blue mx-auto mb-2" />
          <p className="text-sm text-gray-600">Analyzing optimal time slots...</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-verdana">No scheduling suggestions at the moment.</p>
          <Button onClick={loadSuggestions} variant="outline" className="mt-3">
            Refresh Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-puretask-blue" />
                    <CardTitle className="text-lg font-fredoka">AI Suggested Booking</CardTitle>
                  </div>
                  <Badge className="bg-puretask-blue text-white font-fredoka">
                    {suggestion.match_score}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-verdana">{suggestion.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="font-verdana">{suggestion.date} at {suggestion.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="font-verdana">{suggestion.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="font-verdana">{suggestion.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-fresh-mint" />
                      <span className="font-verdana font-bold text-fresh-mint">
                        ${suggestion.estimated_earnings} estimated
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.client_preferences?.map((pref, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 font-verdana">
                    <span className="font-semibold">Why this is a good match:</span> {suggestion.reason}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAccept(suggestion)}
                    disabled={processing === suggestion}
                    className="flex-1 brand-gradient text-white font-fredoka"
                  >
                    {processing === suggestion ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reaching Out...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Express Interest
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDecline(suggestion)}
                    disabled={processing === suggestion}
                    variant="outline"
                    className="flex-1 font-fredoka"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Not Interested
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button onClick={loadSuggestions} variant="outline" className="w-full font-fredoka">
        <Sparkles className="w-4 h-4 mr-2" />
        Refresh Suggestions
      </Button>
    </div>
  );
}