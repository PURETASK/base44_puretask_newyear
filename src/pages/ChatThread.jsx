import React, { useState, useEffect, useRef } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Paperclip, Loader2, Sparkles } from 'lucide-react';
import MessageBubble from '../components/messaging/MessageBubble';
import AIResponseGenerator from '../components/ai/AIResponseGenerator';
import { toast } from 'sonner';

export default function ChatThread() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [userType, setUserType] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const threadId = urlParams.get('thread_id');

  useEffect(() => {
    if (threadId) {
      loadConversation();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setUserType(currentUser.user_type);

      // Get thread and messages
      const response = await base44.functions.invoke('messaging', {
        action: 'getMessages',
        thread_id: threadId
      });

      if (response.data.success) {
        let threadData = response.data.thread;
        
        // Enrich with client profile if this is a cleaner viewing the thread
        if (currentUser.user_type === 'cleaner' && threadData.booking_id) {
          try {
            const bookings = await base44.entities.Booking.filter({ id: threadData.booking_id });
            if (bookings.length > 0) {
              const booking = bookings[0];
              const clientProfiles = await base44.entities.ClientProfile.filter({
                user_email: booking.client_email
              });
              if (clientProfiles.length > 0) {
                const profile = clientProfiles[0];
                threadData.metadata = {
                  ...threadData.metadata,
                  booking: {
                    ...booking,
                    client_focus_areas: profile.focus_areas,
                    client_avoid_areas: profile.avoid_areas,
                    client_pet_temperament: profile.pet_temperament,
                    client_product_allergies: profile.product_allergies
                  }
                };
              }
            }
          } catch (e) {
            console.log('Could not enrich with client profile:', e);
          }
        }
        
        setThread(threadData);
        setMessages(response.data.messages);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading conversation:', showToast: false });
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const response = await base44.functions.invoke('messaging', {
        action: 'addMessage',
        thread_id: threadId,
        content: newMessage,
        type: 'user_message'
      });

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error sending message:', showToast: false });
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;

      const response = await base44.functions.invoke('messaging', {
        action: 'addMessage',
        thread_id: threadId,
        content: file.type.startsWith('image/') ? '📷 Image' : '📎 Attachment',
        file_urls: [fileUrl],
        type: 'user_message'
      });

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
      }
      
      toast.success('File uploaded');
    } catch (error) {
      handleError(error, { userMessage: 'Error uploading file:', showToast: false });
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getOtherParticipant = () => {
    if (!thread || !user) return 'Chat';
    const others = thread.participants.filter(p => p !== user.email);
    return others[0] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-puretask-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-graphite font-fredoka">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Inbox'))}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-xl font-fredoka font-bold text-graphite">
                {thread?.subject || getOtherParticipant()}
              </h1>
              <p className="text-sm text-slate-600 font-verdana">
                {getOtherParticipant()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-verdana">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUserEmail={user?.email}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* AI Response Generator */}
      {showAI && userType === 'cleaner' && messages.length > 0 && (
        <div className="bg-gray-50 border-t border-slate-200">
          <div className="container mx-auto px-4 py-4 max-w-5xl">
            <AIResponseGenerator
              booking={thread?.metadata?.booking}
              clientMessage={messages[messages.length - 1]?.content}
              onSend={(aiResponse) => {
                setNewMessage(aiResponse);
                setShowAI(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-200 sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-end gap-3">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
              className="rounded-full flex-shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </Button>

            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[44px] max-h-32 rounded-2xl resize-none"
              rows={1}
            />

            {userType === 'cleaner' && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowAI(!showAI)}
                className="rounded-full flex-shrink-0"
                title="AI Response Assistant"
              >
                <Sparkles className="w-5 h-5" />
              </Button>
            )}

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="brand-gradient text-white rounded-full flex-shrink-0"
              size="icon"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-slate-500 mt-2 text-center font-verdana">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}