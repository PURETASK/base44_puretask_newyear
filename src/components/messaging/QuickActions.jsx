import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Clock, MapPin, Camera, CheckCircle, AlertCircle, Calendar, Home } from 'lucide-react';

const QUICK_RESPONSES = {
  cleaner_to_client: [
    { id: 'on_my_way', label: 'On My Way', icon: MapPin, message: "Hi! I'm on my way to your location now. I'll be there within 15 minutes." },
    { id: 'running_late', label: 'Running Late', icon: Clock, message: "Hi, I'm running a few minutes late due to traffic. I'll be there as soon as possible. Apologies for the delay!" },
    { id: 'arrived', label: 'Arrived', icon: CheckCircle, message: "Hi! I've arrived and am ready to start the cleaning." },
    { id: 'halfway_done', label: 'Halfway Done', icon: Clock, message: "Update: I'm about halfway through the cleaning. Everything is going well!" },
    { id: 'finished', label: 'Finished', icon: CheckCircle, message: "All done! I've uploaded before/after photos. Please take a look and let me know if you need anything touched up." },
    { id: 'question_product', label: 'Product Question', icon: AlertCircle, message: "Quick question: I noticed [item/area]. Would you like me to use a specific product or approach for this?" },
  ],
  client_to_cleaner: [
    { id: 'confirm_time', label: 'Confirm Time', icon: Calendar, message: "Hi! Just confirming our appointment for today. See you soon!" },
    { id: 'parking', label: 'Parking Info', icon: MapPin, message: "Parking information: You can park in [location]. The access code is [code] if needed." },
    { id: 'entry_code', label: 'Entry Code', icon: Home, message: "Entry information: [door code/key location]. Please lock up when you're done." },
    { id: 'focus_area', label: 'Focus Area', icon: AlertCircle, message: "Hi! Please pay special attention to [area/room] today. Thank you!" },
    { id: 'running_late', label: 'Running Late', icon: Clock, message: "Hi, I'm running a bit late. I'll be home around [time]. Feel free to start without me there." },
    { id: 'approval', label: 'Looks Great!', icon: CheckCircle, message: "Everything looks fantastic! Great job, thank you so much!" },
  ]
};

export default function QuickActions({ booking, user, thread, onActionSent }) {
  const [sending, setSending] = React.useState(null);

  const handleQuickResponse = async (response) => {
    setSending(response.id);
    
    try {
      const otherParticipant = thread.participants.find(p => p !== user.email);
      
      await base44.entities.Message.create({
        thread_id: thread.id,
        sender_email: user.email,
        receiver_email: otherParticipant,
        booking_id: booking.id,
        content: response.message,
        type: 'quick_action',
        delivery_status: 'sent'
      });

      await base44.entities.ConversationThread.update(thread.id, {
        last_message_content: response.message.substring(0, 100),
        last_message_timestamp: new Date().toISOString(),
        [user.user_type === 'client' ? 'unread_count_cleaner' : 'unread_count_client']: 
          (user.user_type === 'client' ? thread.unread_count_cleaner : thread.unread_count_client) + 1
      });

      toast.success('Message sent');
      if (onActionSent) onActionSent();
    } catch (error) {
      console.error('Error sending quick response:', error);
      toast.error('Failed to send message');
    }
    
    setSending(null);
  };

  const responses = user.user_type === 'cleaner' 
    ? QUICK_RESPONSES.cleaner_to_client 
    : QUICK_RESPONSES.client_to_cleaner;

  return (
    <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardContent className="p-6">
        <h3 className="text-lg font-fredoka font-bold text-graphite mb-4">Quick Responses</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {responses.map((response) => {
            const Icon = response.icon;
            return (
              <Button
                key={response.id}
                onClick={() => handleQuickResponse(response)}
                disabled={sending === response.id}
                variant="outline"
                className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-blue-100 hover:border-puretask-blue rounded-2xl"
              >
                <Icon className={`w-6 h-6 ${sending === response.id ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-fredoka font-semibold text-center">{response.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}