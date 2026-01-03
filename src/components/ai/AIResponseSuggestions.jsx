import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, Send, Copy, Sparkles, Clock, 
  CheckCircle, Loader2, RefreshCw, Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';

export default function AIResponseSuggestions({ threadId, clientMessage }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingIndex, setSendingIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (clientMessage) {
      generateSuggestions(clientMessage);
    }
  }, [clientMessage]);

  const generateSuggestions = async (message) => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      // Get cleaner profile for context
      const profiles = await base44.entities.CleanerProfile.filter({
        user_email: currentUser.email
      });

      const profile = profiles[0];

      // Get booking context if available
      const threads = await base44.entities.ConversationThread.filter({ id: threadId });
      const thread = threads[0];
      
      let bookingContext = '';
      if (thread?.booking_id) {
        const bookings = await base44.entities.Booking.filter({ id: thread.booking_id });
        if (bookings.length > 0) {
          const booking = bookings[0];
          bookingContext = `Booking: ${format(new Date(booking.date), 'MMM d')} at ${booking.start_time}, ${booking.hours}h, ${booking.address}`;
        }
      }

      // Use AI to generate contextual responses
      const prompt = `You are a professional cleaning service provider. Generate 3 helpful response options for this client inquiry:

Client Message: "${message}"

Context:
- Cleaner: ${profile.full_name}
- Rating: ${profile.average_rating}/5
- ${bookingContext}

Generate 3 response options:
1. Professional and detailed
2. Friendly and warm
3. Quick and concise

Make them natural, helpful, and appropriate for the context.`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            responses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  style: { type: 'string' },
                  tone: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const generated = aiResponse.responses || [];
      setSuggestions(generated.map((r, i) => ({
        id: i,
        text: r.text,
        style: r.style || 'Professional',
        tone: r.tone || 'Helpful'
      })));

    } catch (error) {
      console.error('Error generating suggestions:', error);
      
      // Fallback suggestions based on common patterns
      const fallbackSuggestions = generateFallbackSuggestions(message);
      setSuggestions(fallbackSuggestions);
    }
    setLoading(false);
  };

  const generateFallbackSuggestions = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('available') || lowerMessage.includes('schedule')) {
      return [
        {
          id: 1,
          text: "Yes, I'm available! What date and time works best for you? I typically have openings throughout the week.",
          style: 'Professional',
          tone: 'Eager'
        },
        {
          id: 2,
          text: "I'd be happy to help! Let me know which day you prefer and I'll check my schedule for available time slots.",
          style: 'Warm',
          tone: 'Friendly'
        },
        {
          id: 3,
          text: "Available! What day/time? 😊",
          style: 'Casual',
          tone: 'Quick'
        }
      ];
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      return [
        {
          id: 1,
          text: "My rates depend on the size of your space and type of cleaning. For a detailed quote, could you share your home size (sq ft or bedrooms/bathrooms) and whether you need a basic, deep, or move-out clean?",
          style: 'Professional',
          tone: 'Informative'
        },
        {
          id: 2,
          text: "I'd love to give you an accurate quote! Can you tell me a bit about your space - how many bedrooms and bathrooms, and what type of cleaning you're looking for?",
          style: 'Warm',
          tone: 'Helpful'
        },
        {
          id: 3,
          text: "Rates vary by home size and cleaning type. What are your space details?",
          style: 'Concise',
          tone: 'Direct'
        }
      ];
    }

    if (lowerMessage.includes('supplies') || lowerMessage.includes('products') || lowerMessage.includes('bring')) {
      return [
        {
          id: 1,
          text: "I bring all my own professional cleaning supplies and equipment! If you have specific product preferences or allergies, just let me know and I'm happy to accommodate.",
          style: 'Professional',
          tone: 'Reassuring'
        },
        {
          id: 2,
          text: "Don't worry - I come fully equipped with all supplies! I use high-quality, effective products. If you prefer eco-friendly or have any sensitivities, I can definitely work with that.",
          style: 'Warm',
          tone: 'Accommodating'
        },
        {
          id: 3,
          text: "Yes, I bring everything! Can customize products if needed.",
          style: 'Quick',
          tone: 'Efficient'
        }
      ];
    }

    // Generic helpful responses
    return [
      {
        id: 1,
        text: "Thank you for your message! I'd be happy to help with that. Could you provide a few more details so I can give you the best answer?",
        style: 'Professional',
        tone: 'Polite'
      },
      {
        id: 2,
        text: "Hi! Thanks for reaching out. I'd love to assist you with this. What additional information would be helpful?",
        style: 'Friendly',
        tone: 'Warm'
      },
      {
        id: 3,
        text: "Happy to help! Can you share more details?",
        style: 'Casual',
        tone: 'Brief'
      }
    ];
  };

  const handleSendSuggestion = async (suggestion) => {
    setSendingIndex(suggestion.id);
    try {
      const currentUser = await base44.auth.me();
      
      // Send the suggested response
      await base44.entities.Message.create({
        thread_id: threadId,
        sender_email: currentUser.email,
        content: suggestion.text,
        type: 'user_message',
        timestamp: new Date().toISOString(),
        metadata: {
          ai_suggested: true,
          suggestion_style: suggestion.style
        }
      });

      // Update thread
      const threads = await base44.entities.ConversationThread.filter({ id: threadId });
      if (threads.length > 0) {
        await base44.entities.ConversationThread.update(threadId, {
          last_message_at: new Date().toISOString(),
          last_message_content: suggestion.text.substring(0, 100),
          unread_count_client: (threads[0].unread_count_client || 0) + 1
        });
      }

      // Clear suggestions after sending
      setSuggestions([]);
      
    } catch (error) {
      console.error('Error sending suggestion:', error);
    }
    setSendingIndex(null);
  };

  const handleCopySuggestion = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card className="border-2 border-dashed border-blue-200">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-puretask-blue mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-verdana">AI is generating response suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0 || !clientMessage) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-puretask-blue" />
            AI-Generated Response Suggestions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateSuggestions(clientMessage)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-600 font-verdana">
          Select a response to send or customize it further
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:border-puretask-blue transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {suggestion.style}
                </Badge>
                <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                  {suggestion.tone}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-slate-700 font-verdana mb-3 leading-relaxed">
              {suggestion.text}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSendSuggestion(suggestion)}
                disabled={sendingIndex === suggestion.id}
                className="flex-1 brand-gradient text-white"
              >
                {sendingIndex === suggestion.id ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    Send This
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopySuggestion(suggestion.text)}
              >
                {copied ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        ))}

        <Alert className="bg-blue-50 border-blue-200">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs font-verdana">
            These AI-generated responses are suggestions. Feel free to customize them to match your personal style!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}