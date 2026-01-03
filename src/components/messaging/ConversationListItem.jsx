import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConversationListItem({ thread, currentUser, onClick, isSelected }) {
  const getOtherParticipant = () => {
    return thread.participants?.find(p => p !== currentUser?.email) || 'Unknown';
  };

  const getUnreadCount = () => {
    if (!currentUser) return 0;
    const userType = currentUser.user_type || 'client';
    if (userType === 'client') return thread.unread_count_client || 0;
    if (userType === 'cleaner') return thread.unread_count_cleaner || 0;
    return 0;
  };

  const otherParticipant = getOtherParticipant();
  const unreadCount = getUnreadCount();
  const isUnread = unreadCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 cursor-pointer transition-all rounded-2xl mb-2 ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-md' 
          : isUnread
            ? 'bg-blue-50 border-2 border-blue-200 hover:shadow-lg'
            : 'bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-fredoka font-bold text-lg flex-shrink-0 ${
          isUnread ? 'brand-gradient' : 'bg-gray-400'
        }`}>
          {otherParticipant[0]?.toUpperCase() || 'U'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={`font-fredoka ${isUnread ? 'font-bold text-graphite' : 'font-semibold text-gray-700'} truncate`}>
              {otherParticipant}
            </p>
            {unreadCount > 0 && (
              <Badge className="bg-puretask-blue text-white rounded-full font-fredoka h-5 px-2 ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>

          {thread.subject && (
            <p className={`text-sm font-verdana mb-1 truncate ${isUnread ? 'text-gray-700 font-semibold' : 'text-gray-600'}`}>
              {thread.subject}
            </p>
          )}

          <p className={`text-sm font-verdana truncate ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
            {thread.last_message_content || 'No messages yet'}
          </p>

          {thread.last_message_timestamp && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-verdana">
                {formatDistanceToNow(new Date(thread.last_message_timestamp), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Read indicator */}
        {!isUnread && (
          <CheckCheck className="w-5 h-5 text-fresh-mint flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}