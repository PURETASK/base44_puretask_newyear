import React from 'react';
import { MessageSquare, Bell, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function UnreadCountExplainer({ count, context = 'general' }) {
  if (count === 0) return null;

  const messages = {
    general: {
      title: 'New Messages',
      description: `You have ${count} unread message${count > 1 ? 's' : ''} waiting for you`
    },
    booking_request: {
      title: 'Action Required',
      description: `${count} client${count > 1 ? 's are' : ' is'} waiting for your response`
    },
    job_update: {
      title: 'Job Updates',
      description: `${count} important update${count > 1 ? 's' : ''} about your jobs`
    }
  };

  const msg = messages[context] || messages.general;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 flex items-start gap-3"
    >
      <div className="mt-0.5">
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-fredoka font-semibold text-blue-900 text-sm">{msg.title}</h4>
        <p className="text-xs text-gray-700 font-verdana mt-1">{msg.description}</p>
      </div>
      <Badge className="bg-red-500 text-white font-fredoka font-bold">
        {count}
      </Badge>
    </motion.div>
  );
}