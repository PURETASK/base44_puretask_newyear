import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, X, Sparkles, Loader2, HelpCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../messaging/MessageBubble';

export default function OnboardingAIAssistant({ currentStep, stepName }) {
  const [isOpen, setIsOpen] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    // Update suggested questions based on current step
    updateSuggestedQuestions(stepName);
  }, [stepName]);

  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateSuggestedQuestions = (step) => {
    const questionsByStep = {
      'basic-info': [
        'What should I include in my bio?',
        'How much experience do I need?',
        'What are specialty tags?'
      ],
      'services': [
        'What services should I offer?',
        'How do I price my services?',
        'What are additional services?'
      ],
      'pricing': [
        'How does the payout percentage work?',
        'What is a competitive rate?',
        'When do I get paid?'
      ],
      'availability': [
        'How do I set my availability?',
        'What is instant booking?',
        'Can I change my schedule later?'
      ],
      'photos': [
        'Why do I need photos?',
        'What photos should I upload?',
        'How do I take good before/after photos?'
      ],
      'policies': [
        'What are the cancellation policies?',
        'How does the reliability score work?',
        'What happens if I miss a booking?'
      ]
    };

    setSuggestedQuestions(questionsByStep[step] || [
      'How do I get started?',
      'What do I need to know?',
      'Tell me about the reliability score'
    ]);
  };

  const initConversation = async () => {
    try {
      setLoading(true);
      
      const newConv = await base44.agents.createConversation({
        agent_name: 'cleanerOnboardingAssistant',
        metadata: {
          name: 'Onboarding Assistant',
          description: 'Help with cleaner onboarding',
          current_step: currentStep,
          step_name: stepName
        }
      });
      
      setConversation(newConv);
      setMessages(newConv.messages || []);
      
      // Send initial greeting with context
      await base44.agents.addMessage(newConv, {
        role: 'user',
        content: `I'm on step ${currentStep} of onboarding: ${stepName}. Please greet me and let me know how you can help.`
      });
    } catch (err) {
      console.error('Error initializing conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || !conversation) return;

    const userMessage = messageText.trim();
    setInput('');
    setLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 flex items-center justify-center"
      >
        <HelpCircle className="w-8 h-8 text-white" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-50 w-96 h-[600px]"
    >
      <Card className="border-2 shadow-2xl flex flex-col h-full">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <CardTitle className="font-fredoka text-lg">Onboarding Assistant</CardTitle>
              <Badge className="bg-green-500 text-white border-0 text-xs">AI</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs mt-1 opacity-90">Step {currentStep}: {stepName}</p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              
              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && !loading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-verdana flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Suggested questions:
                  </p>
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(question)}
                      className="w-full text-left px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-all font-verdana"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-verdana">
            AI assistant • Real-time help
          </p>
        </div>
      </Card>
    </motion.div>
  );
}