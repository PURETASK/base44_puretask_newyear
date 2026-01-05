import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Check, X, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSchedulingWidget({ cleanerEmail, onUpdate }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, [cleanerEmail]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      
      const profile = await base44.entities.CleanerProfile.filter({ 
        user_email: cleanerEmail 
      }).then(p => p[0]);

      if (!profile?.communication_settings?.ai_scheduling_enabled) {
        setLoading(false);
        return;
      }

      // Get existing bookings
      const bookings = await base44.entities.Booking.filter({ 
        cleaner_email: cleanerEmail,
        status: { $in: ['scheduled', 'accepted'] }
      });

      // Generate suggestions
      const prompt = `Analyze this cleaner's schedule and suggest 2 optimal booking opportunities for the next 7 days.

Current bookings: ${bookings.length}
Cleaner tier: ${profile.tier}
Service areas: ${profile.service_locations?.join(', ') || 'Not specified'}

Return ONLY a valid JSON array with 2 suggestions:
[
  {
    "date": "2025-01-05",
    "time": "10:00 AM",
    "duration": 3,
    "reason": "Fill morning gap",
    "match_score": 85
  }
]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  time: { type: "string" },
                  duration: { type: "number" },
                  reason: { type: "string" },
                  match_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions?.slice(0, 2) || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
    setLoading(false);
  };

  const handleAccept = async (suggestion) => {
    setProcessing(suggestion);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuggestions(prev => prev.filter(s => s !== suggestion));
    setProcessing(null);
    if (onUpdate) onUpdate();
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-puretask-blue mx-auto mb-2" />
          <p className="text-xs text-gray-600">Analyzing schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-fredoka flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-puretask-blue" />
            Smart Scheduling
          </CardTitle>
          <Badge className="bg-puretask-blue text-white text-xs">AI</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-3 border-2 border-blue-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-sm font-verdana font-semibold">
                      {format(parseISO(suggestion.date), 'MMM d')} at {suggestion.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-verdana">
                    {suggestion.reason} • {suggestion.duration}h booking
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {suggestion.match_score}%
                </Badge>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(suggestion)}
                  disabled={processing === suggestion}
                  className="flex-1 brand-gradient text-white text-xs h-7"
                >
                  {processing === suggestion ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Interested
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSuggestions(prev => prev.filter(s => s !== suggestion))}
                  disabled={processing === suggestion}
                  className="text-xs h-7"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}