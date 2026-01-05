import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MessageBubble from './MessageBubble';
import { Send, Paperclip, Loader2, User, X } from 'lucide-react';

export default function ChatConversation({ conversationId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
      markAsRead();
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    setIsLoading(true);
    try {
      // Load thread details
      const thread = await base44.entities.ConversationThread.filter({ id: conversationId });
      if (thread[0]) {
        const otherEmail = thread[0].participants?.find(p => p !== currentUser?.email);
        setOtherParticipant(otherEmail);
      }

      // Load messages
      const conversationMessages = await base44.entities.Message.filter(
        { thread_id: conversationId },
        'created_date'
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
    setIsLoading(false);
  };

  const markAsRead = async () => {
    try {
      const userType = currentUser?.user_type || 'client';
      const updates = {};
      
      if (userType === 'client') {
        updates.unread_count_client = 0;
      } else if (userType === 'cleaner') {
        updates.unread_count_cleaner = 0;
      }

      await base44.entities.ConversationThread.update(conversationId, updates);

      // Mark messages as read
      const unreadMessages = await base44.entities.Message.filter({
        thread_id: conversationId,
        receiver_email: currentUser.email,
        is_read: false
      });

      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({
        url: file_url,
        name: file.name,
        type: file.type
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
    setIsUploading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessageContent.trim() && !uploadedFile) return;

    setIsSending(true);
    try {
      const messageType = uploadedFile 
        ? (uploadedFile.type.startsWith('image/') ? 'image' : 'attachment')
        : 'text';

      const newMessage = await base44.entities.Message.create({
        thread_id: conversationId,
        sender_email: currentUser.email,
        receiver_email: otherParticipant,
        content: newMessageContent.trim(),
        type: messageType,
        attachment_url: uploadedFile?.url || null,
        is_read: false,
        delivery_status: 'sent'
      });

      // Update thread with last message
      await base44.entities.ConversationThread.update(conversationId, {
        last_message_content: newMessageContent.trim() || 'Sent an attachment',
        last_message_timestamp: new Date().toISOString(),
        [`unread_count_${currentUser.user_type === 'client' ? 'cleaner' : 'client'}`]: 
          (await base44.entities.ConversationThread.filter({ id: conversationId }))[0]?.[`unread_count_${currentUser.user_type === 'client' ? 'cleaner' : 'client'}`] + 1 || 1
      });

      setMessages(prev => [...prev, newMessage]);
      setNewMessageContent('');
      setUploadedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setIsSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-soft-cloud">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-soft-cloud">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold text-lg">
            {otherParticipant?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-fredoka font-bold text-graphite">
              {otherParticipant || 'Unknown User'}
            </h2>
            <p className="text-sm text-gray-500 font-verdana">Active conversation</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <User className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-xl font-fredoka font-bold text-gray-600 mb-2">
              Start the conversation
            </p>
            <p className="text-gray-500 font-verdana">
              Send a message to {otherParticipant}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.sender_email === currentUser.email}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File Preview */}
      {uploadedFile && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-blue-300">
            {uploadedFile.type.startsWith('image/') ? (
              <img src={uploadedFile.url} alt="Preview" className="w-16 h-16 rounded object-cover" />
            ) : (
              <Paperclip className="w-8 h-8 text-gray-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-fredoka font-semibold text-graphite truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-500 font-verdana">Ready to send</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUploadedFile(null)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t-2 border-gray-200 p-6 shadow-lg">
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending}
            className="flex-shrink-0 border-2 border-gray-300 hover:border-puretask-blue"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </Button>

          <Textarea
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1 min-h-[48px] max-h-32 resize-none font-verdana"
            rows={1}
          />

          <Button
            onClick={handleSendMessage}
            disabled={(!newMessageContent.trim() && !uploadedFile) || isSending}
            className="flex-shrink-0 brand-gradient text-white font-fredoka font-bold px-6"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 font-verdana mt-3">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}