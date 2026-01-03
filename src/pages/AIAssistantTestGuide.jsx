import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, Circle, Sparkles, MessageSquare, Calendar, 
  Target, Bell, Code, Users, Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIAssistantTestGuide() {
  const navigate = useNavigate();
  const [completedTests, setCompletedTests] = useState({});

  const toggleTest = (testId) => {
    setCompletedTests(prev => ({ ...prev, [testId]: !prev[testId] }));
  };

  const testSections = [
    {
      id: 'onboarding',
      title: '1. Onboarding Flow',
      icon: Sparkles,
      color: 'text-purple-600',
      tests: [
        {
          id: 'onboarding-1',
          title: 'First-Time Cleaner Experience',
          steps: [
            'Clear browser localStorage for your app (DevTools → Application → Local Storage)',
            'Logout and login as a NEW cleaner account (or one that hasn\'t seen AI setup)',
            'Navigate to Cleaner Dashboard',
            'Verify "Meet Your AI Assistant" guide appears automatically',
            'Review the 4 feature cards (Communication, Scheduling, Matching, Insights)',
            'Check the stats banner shows "+30% Earnings", "5 hrs/wk", "4.8★"',
            'Click "Start Setup" to launch the wizard'
          ]
        },
        {
          id: 'onboarding-2',
          title: '6-Step Wizard Flow',
          steps: [
            'Step 0: See AI Feature Showcase with 4 tabs',
            'Step 1: Welcome screen with AI capabilities list',
            'Step 2: Schedule optimization settings (enable AI scheduling, gap filling)',
            'Step 3: Communication settings (confirmations, reminders, channels)',
            'Step 4: Specialties & services selection',
            'Step 5: Completion summary with settings review',
            'Verify "Complete Setup" saves settings and closes wizard',
            'Confirm wizard doesn\'t reappear on page refresh'
          ]
        },
        {
          id: 'onboarding-3',
          title: 'Re-Launch Capability',
          steps: [
            'Go to AI Assistant Settings page',
            'Click "View AI Guide" button in header',
            'Verify onboarding wizard re-launches',
            'Test "Maybe Later" skip button',
            'Confirm wizard closes without saving'
          ]
        }
      ]
    },
    {
      id: 'settings',
      title: '2. Settings Page',
      icon: Settings,
      color: 'text-blue-600',
      tests: [
        {
          id: 'settings-1',
          title: 'Communication Tab',
          steps: [
            'Navigate to AI Assistant Settings',
            'Verify 7 message types visible (Booking Confirmation, Pre-Cleaning Reminder, On My Way, Post-Cleaning Summary, Review Request, Tip Request, Re-engagement)',
            'Each message card shows: enable toggle, channels selection, custom template field',
            'Look for AIImpactExplainer badges next to titles',
            'Edit a template and watch live preview update',
            'Verify preview shows example with {client_name}, {date}, {time} replaced',
            'Test timing controls (days_before, hours_after_completion)',
            'Save changes and reload page to confirm persistence'
          ]
        },
        {
          id: 'settings-2',
          title: 'Scheduling Tab',
          steps: [
            'Switch to Scheduling tab',
            'Test "Enable AI Scheduling" toggle',
            'Verify "Prioritize Gap Filling" option appears when enabled',
            'Check "Suggest Days in Advance" slider (1-30 days)',
            'Look for tooltips explaining each setting',
            'Save and verify settings persist'
          ]
        },
        {
          id: 'settings-3',
          title: 'Matching Tab',
          steps: [
            'Go to Matching tab',
            'Review specialty tags selection',
            'Test additional services checkboxes',
            'Verify settings save correctly'
          ]
        },
        {
          id: 'settings-4',
          title: 'Notifications Tab',
          steps: [
            'Navigate to Notifications tab',
            'Test notification preference toggles',
            'Verify "Notify on client not interested" setting',
            'Save and confirm persistence'
          ]
        }
      ]
    },
    {
      id: 'dashboard',
      title: '3. Dashboard Widgets',
      icon: Users,
      color: 'text-green-600',
      tests: [
        {
          id: 'dashboard-1',
          title: 'AI Insights Widget',
          steps: [
            'Go to Cleaner Dashboard',
            'Locate "AI Insights" widget',
            'Verify it shows: Next Best Action, Schedule Optimization Alert, Performance Snapshot',
            'Check Recent AI Activity section',
            'Click "View Full Dashboard" button → navigates to AIActivityDashboard',
            'Click "AI Settings" button → navigates to AIAssistantSettings'
          ]
        },
        {
          id: 'dashboard-2',
          title: 'AI Todo List Widget',
          steps: [
            'Find "AI To-Do List" widget on dashboard',
            'Verify it shows personalized tasks',
            'Test checkbox to mark tasks complete',
            'Click action buttons to navigate to relevant pages',
            'If no tasks, verify "All caught up!" message appears'
          ]
        }
      ]
    },
    {
      id: 'suggestions',
      title: '4. AI Suggestion Flags',
      icon: Target,
      color: 'text-amber-600',
      tests: [
        {
          id: 'suggestions-1',
          title: 'Schedule Page Flags',
          steps: [
            'Navigate to Cleaner Schedule page',
            'Look for AI badges or tooltips on job cards',
            'Check for "AI Suggested" indicators on optimal time slots',
            'Verify gap-filling suggestions appear between bookings'
          ]
        },
        {
          id: 'suggestions-2',
          title: 'Inbox AI Features',
          steps: [
            'Go to Inbox page',
            'Check for AI-generated message summaries',
            'Look for AI response suggestions',
            'Verify conversation insights appear'
          ]
        }
      ]
    },
    {
      id: 'backend',
      title: '5. Backend Automations',
      icon: Code,
      color: 'text-red-600',
      tests: [
        {
          id: 'backend-1',
          title: 'Automated Messages',
          steps: [
            'Create a test booking as a client',
            'Accept booking as cleaner',
            'Verify booking confirmation message sent (check email/SMS/in-app)',
            'Wait for pre-cleaning reminder (or manually trigger cronPreCleaningReminders)',
            'Complete a booking',
            'Check for post-cleaning summary',
            'Wait 24 hours for review request (or manually trigger cronReviewRequests)',
            'Wait 48 hours for tip request if enabled (or manually trigger cronTipRequests)'
          ]
        },
        {
          id: 'backend-2',
          title: 'SMS Integration',
          steps: [
            'Ensure Twilio credentials are set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)',
            'Enable SMS channel in communication settings',
            'Trigger an automated message',
            'Verify SMS received on client\'s phone number',
            'Check MessageDeliveryLog entity for delivery status'
          ]
        },
        {
          id: 'backend-3',
          title: 'Cron Functions',
          steps: [
            'Check scheduled tasks are running: cronPreCleaningReminders, cronReviewRequests, cronTipRequests',
            'Verify they run at correct intervals',
            'Check logs for successful executions',
            'Test edge cases: bookings with missing data, invalid phone numbers'
          ]
        }
      ]
    },
    {
      id: 'analytics',
      title: '6. Analytics Tracking',
      icon: Bell,
      color: 'text-indigo-600',
      tests: [
        {
          id: 'analytics-1',
          title: 'Event Tracking',
          steps: [
            'Complete AI onboarding → verify "ai_onboarding_completed" event tracked',
            'Change AI settings → verify "ai_settings_updated" event tracked',
            'Accept AI-suggested booking → verify "ai_booking_accepted" event tracked',
            'Check AnalyticsEvent entity for all tracked events',
            'Verify events include proper metadata (user_email, timestamp, details)'
          ]
        }
      ]
    }
  ];

  const clearLocalStorage = () => {
    if (confirm('This will clear all localStorage for testing. Continue?')) {
      localStorage.clear();
      alert('localStorage cleared! Please logout and login again.');
    }
  };

  const totalTests = testSections.reduce((sum, section) => sum + section.tests.length, 0);
  const completedCount = Object.values(completedTests).filter(Boolean).length;
  const progressPercent = (completedCount / totalTests) * 100;

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-purple-600" />
                AI Assistant Testing Guide
              </h1>
              <p className="text-gray-600 font-verdana">
                Complete step-by-step testing checklist for all AI features
              </p>
            </div>
            <Button onClick={() => navigate(createPageUrl('CleanerDashboard'))} variant="outline">
              Back to Dashboard
            </Button>
          </div>

          {/* Progress */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-fredoka font-semibold text-graphite">Testing Progress</span>
                <span className="font-fredoka text-purple-600 font-bold">{completedCount}/{totalTests} Tests</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={clearLocalStorage}
            variant="outline"
            className="h-auto py-4 flex-col"
          >
            <Code className="w-6 h-6 mb-2" />
            <span className="font-fredoka">Clear localStorage</span>
            <span className="text-xs text-gray-500">Reset onboarding state</span>
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('AIAssistantSettings'))}
            variant="outline"
            className="h-auto py-4 flex-col"
          >
            <Settings className="w-6 h-6 mb-2" />
            <span className="font-fredoka">AI Settings</span>
            <span className="text-xs text-gray-500">Test settings page</span>
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('CleanerDashboard'))}
            variant="outline"
            className="h-auto py-4 flex-col"
          >
            <Users className="w-6 h-6 mb-2" />
            <span className="font-fredoka">Dashboard</span>
            <span className="text-xs text-gray-500">Test widgets</span>
          </Button>
        </div>

        {/* Test Sections */}
        <div className="space-y-6">
          {testSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="border-2">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center gap-3 font-fredoka">
                    <Icon className={`w-6 h-6 ${section.color}`} />
                    {section.title}
                    <Badge variant="outline" className="ml-auto">
                      {section.tests.filter(t => completedTests[t.id]).length}/{section.tests.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {section.tests.map((test) => (
                      <div key={test.id} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex items-start gap-3 mb-3">
                          <button
                            onClick={() => toggleTest(test.id)}
                            className="mt-1"
                          >
                            {completedTests[test.id] ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3 className="font-fredoka font-semibold text-graphite mb-2">
                              {test.title}
                            </h3>
                            <ol className="space-y-2 text-sm font-verdana text-gray-700">
                              {test.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="font-semibold text-purple-600 min-w-[24px]">
                                    {idx + 1}.
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <Card className="mt-8 border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <p className="font-fredoka font-semibold text-graphite mb-2">
                  Testing Complete?
                </p>
                <p className="text-sm font-verdana text-gray-700 mb-3">
                  Once all tests pass, the AI Assistant is production-ready! Report any issues or unexpected behavior.
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-600 text-white">All Features Implemented</Badge>
                  <Badge className="bg-blue-600 text-white">SMS Integrated</Badge>
                  <Badge className="bg-purple-600 text-white">Analytics Tracked</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}