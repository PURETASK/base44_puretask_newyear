import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export default function MessageButton({ recipientEmail, bookingId, variant = "outline", size = "sm", className = "" }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const currentUser = await base44.auth.me();

      // Check if a thread already exists for this booking
      if (bookingId) {
        const threads = await base44.entities.ConversationThread.filter({ booking_id: bookingId });
        if (threads.length > 0) {
          navigate(createPageUrl('ChatThread') + `?thread_id=${threads[0].id}`);
          return;
        }
      }

      // Check if a general thread exists between these users
      const allThreads = await base44.entities.ConversationThread.filter({
        participants: { $in: [currentUser.email] }
      });
      const existingThread = allThreads.find(thread => 
        thread.participants.includes(recipientEmail) &&
        (!bookingId || !thread.booking_id)
      );

      if (existingThread) {
        navigate(createPageUrl('ChatThread') + `?thread_id=${existingThread.id}`);
        return;
      }

      // Create new thread via messaging function
      const response = await base44.functions.invoke('messaging', {
        action: 'createConversation',
        participants: [currentUser.email, recipientEmail],
        subject: bookingId ? `Booking #${bookingId}` : 'General Inquiry',
        booking_id: bookingId
      });

      if (response.data.success) {
        navigate(createPageUrl('ChatThread') + `?thread_id=${response.data.thread.id}`);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleClick} className={className}>
      <MessageSquare className="w-4 h-4 mr-2" />
      Message
    </Button>
  );
}