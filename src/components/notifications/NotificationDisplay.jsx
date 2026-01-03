import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell, Check, CheckCheck, Calendar, MessageSquare, AlertCircle,
  DollarSign, Star, XCircle, Clock, Shield, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const NOTIFICATION_ICONS = {
  new_booking: Calendar,
  booking_update: Calendar,
  booking_accepted: Check,
  booking_declined: XCircle,
  booking_cancelled: XCircle,
  booking_completed: CheckCheck,
  dispute_filed: AlertCircle,
  dispute_resolved: Shield,
  message_received: MessageSquare,
  payment_received: DollarSign,
  payout_processed: Wallet,
  review_received: Star,
  system_alert: Bell,
  credit_added: Wallet,
  credit_refunded: Wallet
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function NotificationDisplay({ onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      if (!user) return;

      const allNotifications = await base44.entities.Notification.filter(
        { recipient_email: user.email },
        '-created_date',
        50
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await base44.entities.Notification.update(notificationId, { is_read: true });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(
        unreadIds.map(id => base44.entities.Notification.update(id, { is_read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.link) {
      navigate(createPageUrl(notification.link));
      if (onClose) onClose();
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl border-2 border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-puretask-blue" />
            <h3 className="font-fredoka font-bold text-lg text-graphite">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              className="text-xs font-fredoka text-puretask-blue hover:text-puretask-blue/80"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-fredoka transition-all ${
                filter === f
                  ? 'bg-puretask-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-verdana">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-puretask-blue" />
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-verdana">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-fredoka font-semibold mb-1">No notifications</p>
            <p className="text-sm">
              {filter === 'unread'
                ? "You're all caught up!"
                : filter === 'read'
                ? 'No read notifications'
                : "You'll see notifications here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredNotifications.map((notification, idx) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                const isUnread = !notification.is_read;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${
                      isUnread ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          PRIORITY_COLORS[notification.priority]
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm font-fredoka font-semibold ${
                              isUnread ? 'text-graphite' : 'text-gray-600'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {isUnread && (
                            <div className="w-2 h-2 bg-puretask-blue rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p
                          className={`text-sm font-verdana mb-2 ${
                            isUnread ? 'text-gray-700' : 'text-gray-500'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-verdana">
                            {moment(notification.created_date).fromNow()}
                          </span>
                          {notification.priority === 'urgent' && (
                            <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>
                          )}
                          {notification.priority === 'high' && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              Important
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}