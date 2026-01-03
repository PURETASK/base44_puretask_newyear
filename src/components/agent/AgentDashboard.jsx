import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Calendar, TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';
import AgentApprovalCard from './AgentApprovalCard';
import AgentChatInterface from './AgentChatInterface';
import { toast } from 'sonner';

export default function AgentDashboard({ cleanerEmail }) {
  const [pendingActions, setPendingActions] = useState([]);
  const [agentActive, setAgentActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [dailySummary, setDailySummary] = useState(null);

  useEffect(() => {
    loadPendingActions();
    loadDailySummary();
  }, [cleanerEmail]);

  const loadPendingActions = async () => {
    try {
      const response = await base44.functions.invoke('agentAssistant', {
        action: 'getPendingActions',
        cleaner_email: cleanerEmail
      });

      if (response.data.success) {
        setPendingActions(response.data.actions);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
    setLoading(false);
  };

  const loadDailySummary = async () => {
    try {
      const response = await base44.functions.invoke('agentAssistant', {
        action: 'getLatestSummary',
        cleaner_email: cleanerEmail
      });

      if (response.data.success && response.data.summary) {
        setDailySummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleApproval = async (actionId, approved) => {
    try {
      const response = await base44.functions.invoke('agentAssistant', {
        action: 'respondToAction',
        action_id: actionId,
        approved: approved
      });

      if (response.data.success) {
        toast.success(approved ? 'Action approved! Agent is processing...' : 'Action declined');
        loadPendingActions();
      }
    } catch (error) {
      console.error('Error responding to action:', error);
      toast.error('Failed to respond');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-fredoka">Your AI Assistant</CardTitle>
                <p className="text-sm text-gray-600 font-verdana">Managing your schedule 24/7</p>
              </div>
            </div>
            <Badge className={agentActive ? 'bg-green-600' : 'bg-gray-400'}>
              {agentActive ? 'Active' : 'Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-verdana text-gray-600">Pending Approvals</span>
              </div>
              <p className="text-2xl font-fredoka font-bold text-blue-600">{pendingActions.length}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-verdana text-gray-600">Auto-Actions Today</span>
              </div>
              <p className="text-2xl font-fredoka font-bold text-green-600">{dailySummary?.auto_actions_count || 0}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-verdana text-gray-600">Schedule Optimization</span>
              </div>
              <p className="text-2xl font-fredoka font-bold text-purple-600">98%</p>
            </div>
          </div>

          <Button 
            onClick={() => setChatOpen(true)}
            className="w-full mt-4 brand-gradient text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Chat with AI Assistant
          </Button>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      {dailySummary && (
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka flex items-center gap-2">
              <Clock className="w-5 h-5 text-puretask-blue" />
              Latest Daily Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm font-verdana">
              <p className="text-gray-600 mb-2">
                Generated: {new Date(dailySummary.created_date).toLocaleString()}
              </p>
              
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: dailySummary.summary_html }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-fredoka font-semibold">Actions Awaiting Your Approval</h3>
          {pendingActions.map(action => (
            <AgentApprovalCard 
              key={action.id} 
              action={action}
              onApprove={() => handleApproval(action.id, true)}
              onDecline={() => handleApproval(action.id, false)}
            />
          ))}
        </div>
      )}

      {pendingActions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="font-fredoka text-lg">All caught up!</p>
            <p className="text-sm text-gray-600 font-verdana">No pending actions right now</p>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      {chatOpen && (
        <AgentChatInterface 
          cleanerEmail={cleanerEmail}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}