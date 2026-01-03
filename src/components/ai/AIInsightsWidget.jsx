import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, TrendingUp, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function AIInsightsWidget({ cleanerProfile }) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityExpanded, setActivityExpanded] = useState(false);

  useEffect(() => {
    if (cleanerProfile?.user_email) {
      loadInsights();
    }
  }, [cleanerProfile?.user_email]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      // Call backend function to get AI insights
      const response = await base44.functions.invoke('agentAssistant', {
        action: 'get_dashboard_insights',
        cleaner_email: cleanerProfile.user_email
      });
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      setInsights({
        next_best_action: null,
        schedule_alerts: [],
        recent_activity: [],
        performance_snapshot: {
          score: cleanerProfile?.reliability_score || 75,
          tier: cleanerProfile?.tier || 'Semi Pro'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-puretask-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <CardTitle className="font-fredoka text-xl">AI Assistant Insights</CardTitle>
          </div>
          <p className="text-sm text-blue-100 font-verdana">Smart recommendations for your business</p>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Next Best Action */}
          {insights?.next_best_action ? (
            <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4 shadow-sm">
              <p className="text-xs text-gray-500 font-verdana mb-1">Next Best Action:</p>
              <p className="text-sm font-fredoka font-semibold text-gray-800 mb-3">
                {insights.next_best_action.description}
              </p>
              {insights.next_best_action.action_button && (
                <Button
                  size="sm"
                  className="brand-gradient text-white"
                  onClick={() => navigate(insights.next_best_action.action_link)}
                >
                  {insights.next_best_action.action_button}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg border-l-4 border-green-500 p-4">
              <p className="text-sm font-fredoka text-green-800">
                ✓ You're all caught up! Your schedule looks great.
              </p>
            </div>
          )}

          {/* Schedule Optimization Alert */}
          {insights?.schedule_alerts?.length > 0 && (
            <div className="bg-yellow-50 rounded-lg border-l-4 border-yellow-500 p-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-fredoka font-semibold text-gray-800 mb-1">
                    Schedule Optimization
                  </p>
                  <p className="text-xs text-gray-600 font-verdana">
                    {insights.schedule_alerts[0].message}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => navigate(createPageUrl('CleanerSchedule'))}
              >
                Optimize Schedule
              </Button>
            </div>
          )}

          {/* Performance Snapshot */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-verdana mb-1">Reliability Score</p>
                <p className="text-2xl font-fredoka font-bold text-gray-800">
                  {insights?.performance_snapshot?.score || 75}/100
                </p>
                <Badge className="mt-1 bg-blue-600 text-white">
                  {insights?.performance_snapshot?.tier || 'Semi Pro'}
                </Badge>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </div>

          {/* AI Activity Summary */}
          <div className="border-t pt-4">
            <button
              onClick={() => setActivityExpanded(!activityExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <p className="text-sm font-fredoka font-semibold text-gray-700">Recent AI Activity</p>
              <ChevronRight className={`w-4 h-4 transition-transform ${activityExpanded ? 'rotate-90' : ''}`} />
            </button>
            
            {activityExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-2"
              >
                {insights?.recent_activity?.length > 0 ? (
                  insights.recent_activity.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-verdana">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{activity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 font-verdana">No recent activity</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(createPageUrl('AIAssistantSettings'))}
              className="flex-1"
            >
              Manage AI Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(createPageUrl('AIActivityDashboard'))}
              className="flex-1"
            >
              View Full Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}