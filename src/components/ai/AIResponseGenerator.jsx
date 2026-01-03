import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Copy, RefreshCw, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIResponseGenerator({ booking, clientMessage, onSend }) {
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const generateResponse = async (scenario) => {
    setLoading(true);
    try {
      const prompt = `You are a professional cleaning service provider responding to a client inquiry.

Booking Details:
- Date: ${booking?.date || 'Not specified'}
- Time: ${booking?.start_time || 'Not specified'}
- Address: ${booking?.address || 'Not specified'}
- Status: ${booking?.status || 'Not specified'}

Client Message: "${clientMessage}"

Generate a ${scenario} response that is:
- Professional yet friendly
- Concise (2-3 sentences)
- Helpful and reassuring
- Uses the cleaner's perspective

Return only the response text, no explanation.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setGeneratedResponse(response);
      setCustomizing(true);
    } catch (error) {
      console.error('Error generating response:', error);
    }
    setLoading(false);
  };

  const quickScenarios = [
    { label: 'On My Way', value: 'on_my_way', icon: MessageSquare, color: 'bg-blue-50 text-blue-700' },
    { label: 'Confirm Details', value: 'confirm_details', icon: MessageSquare, color: 'bg-green-50 text-green-700' },
    { label: 'Running Late', value: 'running_late', icon: MessageSquare, color: 'bg-amber-50 text-amber-700' },
    { label: 'Job Complete', value: 'job_complete', icon: MessageSquare, color: 'bg-purple-50 text-purple-700' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResponse);
  };

  const handleSend = () => {
    if (onSend) {
      onSend(generatedResponse);
    }
    setGeneratedResponse('');
    setCustomizing(false);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-fredoka font-bold text-graphite">AI Response Assistant</h3>
          <Badge className="bg-purple-600 text-white font-fredoka text-xs">Beta</Badge>
        </div>

        {!customizing ? (
          <div>
            <p className="text-sm text-gray-600 font-verdana mb-4">
              Select a response type to generate a professional reply:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickScenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <Button
                    key={scenario.value}
                    onClick={() => generateResponse(scenario.value)}
                    disabled={loading}
                    variant="outline"
                    className={`h-auto py-3 ${scenario.color} border-2 font-fredoka`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 mr-2" />
                    )}
                    {scenario.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-3">
              <label className="text-sm font-verdana font-semibold text-gray-700 mb-2 block">
                Generated Response (Edit as needed)
              </label>
              <Textarea
                value={generatedResponse}
                onChange={(e) => setGeneratedResponse(e.target.value)}
                rows={4}
                className="font-verdana"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                className="flex-1 brand-gradient text-white font-fredoka"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reply
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="font-fredoka"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setGeneratedResponse('');
                  setCustomizing(false);
                }}
                variant="outline"
                className="font-fredoka"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}