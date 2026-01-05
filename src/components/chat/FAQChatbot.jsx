import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, X, Minimize2, Maximize2, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MessageBubble from '../messaging/MessageBubble';

export default function FAQChatbot({ agentName, title, userType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
  }, [isOpen]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  const initConversation = async () => {
    try {
      setLoading(true);
      
      // Check if there's an existing conversation for this agent
      const existingConversations = await base44.agents.listConversations({
        agent_name: agentName
      });

      if (existingConversations && existingConversations.length > 0) {
        // Use the most recent conversation
        const latest = existingConversations[0];
        setConversation(latest);
        setMessages(latest.messages || []);
      } else {
        // Create new conversation
        const newConv = await base44.agents.createConversation({
          agent_name: agentName,
          metadata: {
            name: `${title} Chat`,
            description: `FAQ assistance for ${userType}`,
            user_type: userType
          }
        });
        setConversation(newConv);
        setMessages(newConv.messages || []);
      }
    } catch (err) {
      console.error('Error initializing conversation:', err);
      setError('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
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
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-lg brand-gradient hover:opacity-90 relative"
        >
          <MessageSquare className="w-7 h-7 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50 ${isMinimized ? 'w-80' : 'w-96 h-[600px]'}`}
    >
      <Card className="border-2 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <CardTitle className="font-fredoka text-lg">{title}</CardTitle>
              <Badge className="bg-green-500 text-white border-0 text-xs">
                AI
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
                  <p className="font-fredoka font-semibold text-graphite mb-2">
                    Hi! How can I help you today?
                  </p>
                  <p className="text-sm text-gray-600 font-verdana">
                    Ask me anything about payments, bookings, or policies!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <MessageBubble key={idx} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 font-verdana">
                  {error}
                </div>
              )}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="brand-gradient"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-verdana">
                Powered by AI • Instant answers 24/7
              </p>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}