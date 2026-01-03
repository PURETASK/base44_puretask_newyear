import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, AlertTriangle, Settings, Mail, MessageSquare, 
  Bell, Database, Shield, Zap
} from 'lucide-react';

export default function SetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            PureTask Notification System - Setup Guide
          </h1>
          <p className="text-lg text-slate-600">
            Complete deployment and configuration guide
          </p>
        </div>

        <Alert className="mb-6 border-emerald-200 bg-emerald-50">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <AlertDescription className="text-emerald-900">
            <strong>Status:</strong> All Base44 components are installed and ready. Follow this guide to complete external integrations.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
            <TabsTrigger value="twilio">Twilio SMS</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="admin">Admin Tools</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>System Architecture</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Base44 App (Frontend)</h3>
                        <p className="text-sm text-slate-600">
                          ✅ Email templates stored in database
                          <br />✅ NotificationDispatcher component
                          <br />✅ TemplateRenderer for variable substitution
                          <br />✅ Message delivery logging
                          <br />✅ Admin template management UI
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
                      <Settings className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">External Integrations (To Setup)</h3>
                        <p className="text-sm text-slate-600">
                          🔧 SendGrid for email delivery
                          <br />🔧 Twilio for SMS (optional)
                          <br />🔧 OneSignal/FCM for push (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>What's Already Working</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Mail, text: '15 email templates pre-configured', color: 'text-blue-600' },
                      { icon: Database, text: 'EmailTemplate entity created', color: 'text-emerald-600' },
                      { icon: Settings, text: 'Template management UI at /admin/email-templates', color: 'text-purple-600' },
                      { icon: Zap, text: 'Notification dispatcher ready', color: 'text-amber-600' },
                      { icon: Shield, text: 'Message delivery logging', color: 'text-red-600' },
                      { icon: CheckCircle, text: 'Variable substitution engine', color: 'text-green-600' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm text-slate-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SendGrid Setup */}
          <TabsContent value="sendgrid">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-600" />
                  SendGrid Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">1. Create SendGrid Account</h3>
                    <p className="text-sm text-slate-600">
                      Sign up at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">sendgrid.com</a> and verify your sender domain.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">2. Get API Key</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      Settings → API Keys → Create API Key with "Mail Send" permissions
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <code className="text-slate-100 text-xs">
                        SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">3. Current Integration</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      The system currently uses Base44's built-in email service (<code>base44.integrations.Core.SendEmail</code>).
                      To use SendGrid directly, you would need to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                      <li>Set up n8n workflow to send via SendGrid API</li>
                      <li>Configure dynamic templates in SendGrid UI</li>
                      <li>Map template IDs in your notification flows</li>
                    </ul>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-900 text-sm">
                      <strong>Current Status:</strong> Using Base44's email service. SendGrid integration is optional for advanced features like delivery analytics and A/B testing.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Twilio Setup */}
          <TabsContent value="twilio">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                  Twilio SMS Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">1. Get Twilio Credentials</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                      <li>Account SID</li>
                      <li>Auth Token</li>
                      <li>Phone number with SMS capability</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">2. SMS Templates</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      SMS versions are already defined in your email templates (sms_body field).
                      Example templates:
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg space-y-2">
                      <code className="text-slate-100 text-xs block">
                        ✅ Reminder: cleaning tomorrow at {'{'}{'{'} start_time {'}'}{'}'}
                      </code>
                      <code className="text-slate-100 text-xs block">
                        🚗 Your cleaner is on the way
                      </code>
                      <code className="text-slate-100 text-xs block">
                        ✨ Cleaning complete! Leave a review: {'{'}{'{'} link {'}'}{'}'}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">3. Best Practices</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                      <li>Keep messages under 160 characters</li>
                      <li>Include short links for actions</li>
                      <li>Respect SMS opt-in preferences</li>
                      <li>Store numbers in E.164 format (+15551234567)</li>
                    </ul>
                  </div>

                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-900 text-sm">
                      <strong>Current Status:</strong> SMS templates are ready. Integration with Twilio requires n8n workflow setup or external service.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Push Notifications */}
          <TabsContent value="push">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-purple-600" />
                  Push Notifications Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Recommended: OneSignal</h3>
                    <ul className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                      <li>Create account at onesignal.com</li>
                      <li>Add your web app or mobile app</li>
                      <li>Get App ID and API Key</li>
                      <li>Implement OneSignal SDK in your mobile/web app</li>
                      <li>Set external_user_id on login</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Push Template Examples</h3>
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="font-semibold text-sm mb-1">You're booked ✅</p>
                        <p className="text-sm text-slate-600">Cleaning on Nov 7 at 3:00 PM with Maria.</p>
                        <code className="text-xs text-slate-500 mt-2 block">app://booking/{'{booking_id}'}</code>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="font-semibold text-sm mb-1">New job invite 🔔</p>
                        <p className="text-sm text-slate-600">Nov 7 @ 3:00 PM — $118. Accept now.</p>
                        <code className="text-xs text-slate-500 mt-2 block">app://jobs/{'{job_id}'}</code>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-purple-200 bg-purple-50">
                    <AlertDescription className="text-purple-900 text-sm">
                      <strong>Current Status:</strong> Push templates are defined in email templates (push_title, push_body fields). External push service integration required for delivery.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tools */}
          <TabsContent value="admin">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Available Admin Pages</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold mb-2">📧 Email Templates</h3>
                      <p className="text-sm text-slate-600 mb-2">/admin/email-templates</p>
                      <p className="text-xs text-slate-500">Create, edit, preview, and test email templates</p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h3 className="font-semibold mb-2">📬 Message Logs</h3>
                      <p className="text-sm text-slate-600 mb-2">/admin/messages</p>
                      <p className="text-xs text-slate-500">View delivery logs, track status, resend failed messages</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold mb-2">🧪 Test Booking Events</h3>
                      <p className="text-sm text-slate-600 mb-2">/admin/test-booking</p>
                      <p className="text-xs text-slate-500">Trigger test booking confirmations</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h3 className="font-semibold mb-2">🧹 Test Cleaner Events</h3>
                      <p className="text-sm text-slate-600 mb-2">/admin/test-cleaner</p>
                      <p className="text-xs text-slate-500">Test check-in, arrival, completion flows</p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h3 className="font-semibold mb-2">⚡ Test Notifications</h3>
                      <p className="text-sm text-slate-600 mb-2">/admin/test-notifications</p>
                      <p className="text-xs text-slate-500">Test all notification types with custom data</p>
                    </div>

                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <h3 className="font-semibold mb-2">📚 Template Reference</h3>
                      <p className="text-sm text-slate-600 mb-2">/template-reference</p>
                      <p className="text-xs text-slate-500">Complete guide to templates and variables</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Go-Live Checklist</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[
                      { done: true, text: '✅ EmailTemplate entity created' },
                      { done: true, text: '✅ 15 templates pre-loaded' },
                      { done: true, text: '✅ NotificationDispatcher component' },
                      { done: true, text: '✅ Admin template management UI' },
                      { done: true, text: '✅ Message delivery logging' },
                      { done: false, text: '🔧 SendGrid API key configured (optional)' },
                      { done: false, text: '🔧 Twilio credentials set (optional for SMS)' },
                      { done: false, text: '🔧 Push service configured (optional)' },
                      { done: true, text: '✅ Test notification pages created' },
                      { done: false, text: '🔧 Production smoke tests completed' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          item.done ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                        }`}
                      >
                        <div className="text-lg">{item.done ? '✅' : '🔧'}</div>
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Start */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle>Quick Start: Test the System Now</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-slate-700">
                Your notification system is ready to use! Here's how to test it:
              </p>
              
              <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600">
                <li>
                  Navigate to <strong>Admin Dashboard → Email Templates</strong>
                </li>
                <li>
                  Click the "Test Send" button on any template
                </li>
                <li>
                  Enter your email and test variables
                </li>
                <li>
                  Check your inbox for the email
                </li>
                <li>
                  View delivery logs at <strong>Admin Dashboard → Message Delivery Logs</strong>
                </li>
              </ol>

              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertDescription className="text-emerald-900 text-sm">
                  <strong>Pro Tip:</strong> The system automatically logs all message attempts, tracks delivery status, and allows resending failed messages.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}