import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Mail, MessageSquare, Bell, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateReference() {
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const emailTemplates = {
    "email.client.booking_confirmation": {
      subject: "Your cleaning is booked for {{start_time}} ✅",
      variables: ["client.first_name", "cleaner.first_name", "start_time", "address", "price", "manage_url", "year"]
    },
    "email.client.reminder_24h": {
      subject: "Reminder: cleaning tomorrow at {{start_time}}",
      variables: ["client.first_name", "start_time", "address", "cleaner.first_name", "manage_url", "year"]
    },
    "email.client.reminder_1h": {
      subject: "Cleaner arriving soon ⏱️",
      variables: ["client.first_name", "cleaner.first_name", "start_time", "manage_url", "year"]
    },
    "email.client.cleaning_completed": {
      subject: "Cleaning completed — receipt enclosed",
      variables: ["price", "cleaner.first_name", "photos_url", "review_url", "year"]
    },
    "email.client.payment_failed": {
      subject: "Payment failed — update payment method",
      variables: ["booking_id", "reason", "payment_url", "year"]
    },
    "email.cleaner.new_job_invitation": {
      subject: "New cleaning opportunity — claim it",
      variables: ["cleaner.first_name", "start_time", "address", "price", "accept_url", "year"]
    },
    "email.account.password_reset": {
      subject: "Reset your PureTask password",
      variables: ["reset_url", "year"]
    },
    "email.marketing.winback": {
      subject: "We miss you 💚 — take 20% off your next cleaning",
      variables: ["discount_label", "promo_code", "booking_url", "promo_expires", "year"]
    }
  };

  const smsTemplates = {
    "sms.client.reminder_24h": "Reminder: your cleaner arrives tomorrow at {{start_time}}. Address: {{address}}. Manage: {{manage_url}}",
    "sms.client.reminder_1h": "Your cleaner {{cleaner.first_name}} arrives in ~1 hour. Manage: {{manage_url}}",
    "sms.cleaner.new_job_invitation": "New job: {{start_time}}, {{address}}. Pay: ${{price}}. Accept: {{accept_url}}",
    "sms.client.cleaning_completed": "Your cleaning is complete! Total: ${{price}}. Review: {{review_url}}",
    "sms.client.payment_failed": "Payment failed for booking {{booking_id}} ({{reason}}). Update card: {{payment_url}}",
    "sms.account.password_reset": "Reset your PureTask password: {{reset_url}} (expires in 15 min)"
  };

  const pushTemplates = {
    "push.client.booking_confirmation": {
      title: "You're booked ✅",
      body: "Cleaning on {{date}} at {{time}} with {{cleaner_name}}.",
      deep_link: "app://booking/{{booking_id}}"
    },
    "push.client.reminder_24h": {
      title: "Tomorrow's cleaning",
      body: "{{time}} with {{cleaner_name}}. Need to change?",
      deep_link: "app://booking/{{booking_id}}/manage"
    },
    "push.client.reminder_1h": {
      title: "Starts in 1 hour",
      body: "We'll ping you when {{cleaner_name}} arrives.",
      deep_link: "app://booking/{{booking_id}}"
    },
    "push.client.completed": {
      title: "Cleaning complete ✨",
      body: "See photos & leave a quick rating.",
      deep_link: "app://booking/{{booking_id}}/review"
    },
    "push.cleaner.job_invited": {
      title: "New job invite 🔔",
      body: "{{date}} @ {{time}} — ${{pay}}. Accept now.",
      deep_link: "app://jobs/{{job_id}}"
    }
  };

  const variables = {
    "Common": ["year"],
    "Client": [
      "client.id",
      "client.first_name",
      "client.email",
      "client.phone",
      "client.email_opt_in (bool)",
      "client.sms_opt_in (bool)",
      "client.push_opt_in (bool)"
    ],
    "Cleaner": [
      "cleaner.id",
      "cleaner.first_name",
      "cleaner.email",
      "cleaner.phone"
    ],
    "Booking": [
      "booking_id",
      "start_time (localized)",
      "address",
      "price (number/string)",
      "manage_url (client)",
      "photos_url (client)",
      "review_url (client)",
      "accept_url (cleaner)"
    ],
    "Billing": [
      "payment_url",
      "reason (for failures)"
    ],
    "Auth": [
      "reset_url (expires in 15 minutes)"
    ],
    "Marketing": [
      "booking_url",
      "discount_label (e.g., '20% off')",
      "promo_code",
      "promo_expires"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Code className="w-10 h-10 text-blue-600" />
            PureTask Template Reference
          </h1>
          <p className="text-lg text-slate-600">
            Complete guide to all email, SMS, and push notification templates
          </p>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1">
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Templates
            </TabsTrigger>
            <TabsTrigger value="push">
              <Bell className="w-4 h-4 mr-2" />
              Push Templates
            </TabsTrigger>
            <TabsTrigger value="variables">
              <Code className="w-4 h-4 mr-2" />
              Variables
            </TabsTrigger>
          </TabsList>

          {/* Email Templates */}
          <TabsContent value="email" className="space-y-4">
            {Object.entries(emailTemplates).map(([key, template]) => (
              <Card key={key} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <code className="text-sm">{key}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(key, key)}
                    >
                      {copiedText === key ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">Subject:</p>
                    <p className="font-semibold">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Required Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map(v => (
                        <Badge key={v} variant="outline" className="font-mono">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* SMS Templates */}
          <TabsContent value="sms" className="space-y-4">
            {Object.entries(smsTemplates).map(([key, body]) => (
              <Card key={key} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <code className="text-sm">{key}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(body, key)}
                    >
                      {copiedText === key ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="text-sm font-mono">{body}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Character count: {body.length} (recommended &lt; 160)
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Push Templates */}
          <TabsContent value="push" className="space-y-4">
            {Object.entries(pushTemplates).map(([key, template]) => (
              <Card key={key} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-600" />
                      <code className="text-sm">{key}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(JSON.stringify(template, null, 2), key)}
                    >
                      {copiedText === key ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Title:</p>
                      <p className="font-semibold">{template.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Body:</p>
                      <p className="text-sm">{template.body}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Deep Link:</p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">{template.deep_link}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Variables */}
          <TabsContent value="variables" className="space-y-4">
            {Object.entries(variables).map(([category, vars]) => (
              <Card key={category} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-3">
                    {vars.map(v => (
                      <div key={v} className="flex items-center gap-2">
                        <code className="flex-1 bg-slate-100 px-3 py-2 rounded text-sm">
                          {v}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`{{${v}}}`, v)}
                        >
                          {copiedText === v ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Usage Examples */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">In Email HTML:</p>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
{`<p>Hi {{client.first_name}},</p>
<p>Your cleaning is on {{start_time}}</p>
<p><a href="{{manage_url}}">Manage Booking</a></p>`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">In SMS:</p>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
{`Reminder: cleaning tomorrow at {{start_time}} with {{cleaner.first_name}}`}
                    </pre>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">In Code (JavaScript):</p>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
{`const variables = {
  'client.first_name': 'Sarah',
  'cleaner.first_name': 'Maria',
  'start_time': 'Fri, Nov 7 · 3:00 PM',
  'address': '123 Main St',
  'price': 139,
  'manage_url': 'https://app.puretask.app/booking/ABC123'
};

await sendNotification('email.client.booking_confirmation', 
  'client@example.com', 
  variables
);`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}