import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import AIBadge from '../components/ai/AIBadge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Plus, Archive, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Inbox() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = threads.filter(thread => 
        thread.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.last_message_content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredThreads(filtered);
    } else {
      setFilteredThreads(threads);
    }
  }, [searchQuery, threads]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Determine user type
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
      const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
      
      if (cleanerProfiles.length > 0) {
        setUserType('cleaner');
      } else if (clientProfiles.length > 0) {
        setUserType('client');
      } else if (currentUser.role === 'admin') {
        setUserType('admin');
      }

      // Load conversations
      const allThreads = await base44.entities.ConversationThread.filter({
        participants: { $in: [currentUser.email] },
        is_active: true
      });

      // Sort by last message timestamp
      allThreads.sort((a, b) => {
        const aTime = new Date(a.last_message_at || 0);
        const bTime = new Date(b.last_message_at || 0);
        return bTime - aTime;
      });

      setThreads(allThreads);
      setFilteredThreads(allThreads);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading inbox:', showToast: false });
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = (thread) => {
    if (userType === 'client') return thread.unread_count_client || 0;
    if (userType === 'cleaner') return thread.unread_count_cleaner || 0;
    if (userType === 'admin') return thread.unread_count_admin || 0;
    return 0;
  };

  const getOtherParticipant = (thread) => {
    const others = thread.participants.filter(p => p !== user?.email);
    return others[0] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-puretask-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-graphite font-fredoka">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">Messages</h1>
            <p className="text-slate-600 font-verdana">All your conversations in one place</p>
          </div>
          <Button className="brand-gradient text-white rounded-full font-fredoka font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            New Message
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-slate-200"
            />
          </div>
        </div>

        {/* Conversation List */}
        {filteredThreads.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-fredoka font-semibold text-graphite mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-slate-600 font-verdana">
              {searchQuery ? 'Try a different search term' : 'Start a conversation to get connected'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredThreads.map((thread, index) => {
              const unreadCount = getUnreadCount(thread);
              const otherParticipant = getOtherParticipant(thread);
              
              return (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:shadow-md",
                      unreadCount > 0 && "border-l-4 border-l-puretask-blue bg-blue-50"
                    )}
                    onClick={() => navigate(createPageUrl('ChatThread') + `?thread_id=${thread.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {otherParticipant[0].toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-fredoka font-semibold text-graphite truncate">
                            {thread.subject || otherParticipant}
                          </h3>
                          <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                            {thread.last_message_at && new Date(thread.last_message_at).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 font-verdana truncate mb-2">
                          {thread.last_message_content || 'No messages yet'}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          {thread.booking_id && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              Booking
                            </Badge>
                          )}
                          {thread.metadata?.is_agent_conversation && (
                            <AIBadge variant="automated" className="text-xs" />
                          )}
                          {unreadCount > 0 && (
                            <Badge className="bg-puretask-blue text-white font-fredoka">
                              {unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}