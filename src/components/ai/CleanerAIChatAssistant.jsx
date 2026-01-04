// CleanerAIChatAssistant - AI Chat Interface for Cleaners
// Context-aware chat assistant integrated into job workflow

import React, { useState, useEffect, useRef } from 'react';
import { aiCleanerChatService, ChatMessage, CleanerContext } from '@/services/aiCleanerChatService';
import type { JobRecord } from '@/types/cleanerJobTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, Sparkles, TrendingUp, HelpCircle, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CleanerAIChatAssistantProps {
  currentJob?: JobRecord;
  cleanerId: string;
  cleanerEmail: string;
  stats?: {
    totalJobs: number;
    reliabilityScore: number;
    avgRating: number;
    totalEarnings: number;
  };
  minimized?: boolean;
  onMinimize?: () => void;
}

export default function CleanerAIChatAssistant({
  currentJob,
  cleanerId,
  cleanerEmail,
  stats,
  minimized = false,
  onMinimize
}: CleanerAIChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const context: CleanerContext = {
    cleanerId,
    cleanerEmail,
    currentJob,
    stats
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentJob 
          ? `👋 Hi! I'm here to help you with this ${currentJob.cleaning_type} cleaning job. Ask me anything or use the quick actions below!`
          : `👋 Hi! I'm your PureTask AI Assistant. How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowQuickActions(false);

    try {
      const response = await aiCleanerChatService.chat([...messages, userMessage], context);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (question: string) => {
    setInput(question);
    setShowQuickActions(false);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = aiCleanerChatService.getQuickActions(currentJob);

  // Minimized view
  if (minimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={onMinimize}
          size="lg"
          className="rounded-full w-16 h-16 bg-info hover:bg-info/90 shadow-lg"
        >
          <Bot className="w-8 h-8" />
        </Button>
        {messages.length > 1 && (
          <Badge className="absolute -top-2 -right-2 bg-error text-white">
            {messages.length - 1}
          </Badge>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="border-info-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-info to-info/80 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <CardTitle className="font-heading text-lg">AI Assistant</CardTitle>
            {currentJob && (
              <Badge variant="secondary" className="ml-2">
                Job #{currentJob.id.slice(0, 8)}
              </Badge>
            )}
          </div>
          {onMinimize && (
            <Button
              onClick={onMinimize}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-info text-white font-body'
                      : 'bg-white border border-gray-200 font-body text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4 text-info" />
                      <span className="text-xs font-heading font-semibold text-info">
                        PureTask AI
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-info" />
                <span className="text-sm font-body text-gray-600">AI is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && messages.length <= 1 && (
          <div className="p-4 bg-white border-t border-gray-200">
            <p className="text-sm font-heading font-semibold text-gray-700 mb-2">
              Quick Actions:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuickAction(action.question)}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 px-3 font-body"
                >
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-info"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="bg-info hover:bg-info/90 text-white font-heading"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {!showQuickActions && (
            <Button
              onClick={() => setShowQuickActions(true)}
              variant="ghost"
              size="sm"
              className="mt-2 text-xs font-body"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Show quick actions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Floating AI Assistant Button (for when not embedded)
export function FloatingAIAssistant({
  currentJob,
  cleanerId,
  cleanerEmail,
  stats
}: CleanerAIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 z-50 w-96"
          >
            <CleanerAIChatAssistant
              currentJob={currentJob}
              cleanerId={cleanerId}
              cleanerEmail={cleanerEmail}
              stats={stats}
              minimized={false}
              onMinimize={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CleanerAIChatAssistant
        currentJob={currentJob}
        cleanerId={cleanerId}
        cleanerEmail={cleanerEmail}
        stats={stats}
        minimized={!isOpen}
        onMinimize={() => setIsOpen(!isOpen)}
      />
    </>
  );
}

