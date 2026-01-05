import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, RefreshCw } from 'lucide-react';
import { seedNotificationTemplates } from '../components/notifications/TemplateSeeder';

export default function AdminNotifications() {
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, logsData] = await Promise.all([
        base44.entities.NotificationTemplate.filter({}, 'code', 100),
        base44.entities.NotificationsLog.filter({}, '-sent_at', 50)
      ]);
      setTemplates(templatesData);
      setLogs(logsData);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading notification data:', showToast: false });
    }
    setLoading(false);
  };

  const handleSeedTemplates = async () => {
    setSeeding(true);
    try {
      const result = await seedNotificationTemplates(base44);
      alert(`Templates seeded: ${result.created} created, ${result.updated} updated`);
      await loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error seeding templates:', showToast: false });
      alert('Failed to seed templates');
    }
    setSeeding(false);
  };

  const toggleTemplate = async (template) => {
    try {
      await base44.entities.NotificationTemplate.update(template.id, {
        is_active: !template.is_active
      });
      await loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error toggling template:', showToast: false });
    }
  };

  const categoryColors = {
    booking: 'bg-blue-100 text-blue-800',
    payment: 'bg-green-100 text-green-800',
    payout: 'bg-purple-100 text-purple-800',
    reliability: 'bg-yellow-100 text-yellow-800',
    dispute: 'bg-red-100 text-red-800',
    admin: 'bg-gray-100 text-gray-800'
  };

  const statusColors = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    retrying: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-soft-cloud">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
              Notification System
            </h1>
            <p className="text-gray-600 font-verdana">
              Manage notification templates and delivery logs
            </p>
          </div>
          <Button
            onClick={handleSeedTemplates}
            disabled={seeding}
            className="brand-gradient text-white rounded-full font-fredoka"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Seed Templates
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Templates */}
          <Card className="rounded-3xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Templates ({templates.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {templates.map((template) => (
                <div key={template.id} className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-puretask-blue">
                          {template.code}
                        </code>
                        <Badge className={categoryColors[template.category]}>
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 font-verdana mb-2">
                        {template.body_template?.substring(0, 100)}...
                      </p>
                      <div className="flex gap-1">
                        {template.channels?.map(ch => (
                          <Badge key={ch} variant="outline" className="text-xs">
                            {ch}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleTemplate(template)}
                      variant={template.is_active ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Logs */}
          <Card className="rounded-3xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl">Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-verdana">
                  No notifications sent yet
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs font-mono text-gray-700">
                        {log.template_code}
                      </code>
                      <Badge className={statusColors[log.delivery_status]}>
                        {log.delivery_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-verdana">
                      <span>{log.user_email}</span>
                      <span>•</span>
                      <span>{new Date(log.sent_at).toLocaleString()}</span>
                    </div>
                    {log.channels_used && (
                      <div className="flex gap-1 mt-2">
                        {log.channels_used.map(ch => (
                          <Badge key={ch} variant="secondary" className="text-xs">
                            {ch}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}