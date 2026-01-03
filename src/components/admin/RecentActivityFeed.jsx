import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertCircle, Calendar, DollarSign, Star, Shield } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_ICONS = {
  booking_created: Calendar,
  booking_confirmed: CheckCircle,
  booking_completed: CheckCircle,
  review_submitted: Star,
  payment_success: DollarSign,
  dispute_opened: AlertCircle,
  cleaner_verified: Shield,
  admin_action: Shield
};

const EVENT_COLORS = {
  booking_created: 'bg-blue-100 text-blue-800',
  booking_confirmed: 'bg-emerald-100 text-emerald-800',
  booking_completed: 'bg-green-100 text-green-800',
  review_submitted: 'bg-amber-100 text-amber-800',
  payment_success: 'bg-emerald-100 text-emerald-800',
  dispute_opened: 'bg-red-100 text-red-800',
  cleaner_verified: 'bg-purple-100 text-purple-800',
  admin_action: 'bg-indigo-100 text-indigo-800'
};

export default function RecentActivityFeed({ limit = 10 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const recentEvents = await base44.entities.Event.list('-timestamp', limit);
      setEvents(recentEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600 font-verdana">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-slate-700" />
            <span className="font-fredoka">Recent Activity</span>
          </div>
          <Badge className="bg-slate-200 text-slate-700 font-fredoka">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {events.length > 0 ? (
            events.map((event, index) => {
              const Icon = EVENT_ICONS[event.event_type] || Activity;
              const colorClass = EVENT_COLORS[event.event_type] || 'bg-slate-100 text-slate-800';
              
              return (
                <div
                  key={event.id || index}
                  className="flex items-start gap-3 p-4 bg-soft-cloud hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-graphite font-fredoka truncate">
                        {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <Badge variant="outline" className="text-xs font-verdana">
                        {event.user_email?.split('@')[0]}
                      </Badge>
                    </div>
                    {event.details && (
                      <p className="text-xs text-gray-600 font-verdana truncate mb-1">{event.details}</p>
                    )}
                    <p className="text-xs text-gray-500 font-verdana">
                      {format(new Date(event.timestamp || event.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-verdana">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}