// Notification Test Page
// Interactive page to test all notification flows

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, MessageSquare, Smartphone, Mail, Zap, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { jobEventBus } from '@/services/jobEvents';
import { clientNotificationService } from '@/services/clientNotificationService';
import { smsService, ClientSMSTemplates, CleanerSMSTemplates } from '@/services/smsService';
import { pushNotificationService, ClientPushTemplates } from '@/services/pushNotificationService';
import { realTimeNotificationService } from '@/services/realTimeNotificationService';
import { notificationIntegration } from '@/services/notificationIntegration';

export default function NotificationTestPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testJob, setTestJob] = useState(null);
  const [testCleaner, setTestCleaner] = useState(null);
  const [testClient, setTestClient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    inApp: true,
    email: true,
    sms: false,
    push: false,
    realTime: 'polling'
  });

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check system capabilities
      checkSystemStatus();

      // Initialize notification integration
      await notificationIntegration.initialize();

      // Initialize real-time notifications
      await notificationIntegration.initializeRealTime(currentUser.email);

      // Subscribe to notifications
      clientNotificationService.subscribe((notification) => {
        addNotificationLog('CLIENT_SERVICE', notification);
      });

      realTimeNotificationService.subscribe((notification) => {
        addNotificationLog('REAL_TIME', notification);
      });

      // Create test job data
      createTestData();

    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSystemStatus = () => {
    setSystemStatus({
      inApp: true,
      email: true,
      sms: smsService.isEnabled(),
      push: pushNotificationService.isEnabled(),
      realTime: realTimeNotificationService.getMode()
    });
  };

  const createTestData = () => {
    // Create mock job
    const mockJob = {
      id: 'test_job_' + Date.now(),
      client_id: user?.email || 'client@test.com',
      cleaner_id: 'cleaner@test.com',
      status: 'OFFERED',
      state: 'OFFERED',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '12:00',
      estimated_hours: 3,
      total_price: 120,
      latitude: 34.0522,
      longitude: -118.2437,
      address: '123 Main St, Los Angeles, CA 90012',
      cleaning_type: 'deep',
      instant_cash_out_fee: 0.10,
      auto_approval_hours: 18,
      reliability_weight: 0.20,
      pet_fee: 30,
      billing_cap_minutes: 180
    };

    const mockCleaner = {
      id: 'cleaner_profile_1',
      user_email: 'cleaner@test.com',
      name: 'Jane Smith',
      phone: '+12345678901',
      payout_percentage: 0.8,
      reliability_score: 95
    };

    const mockClient = {
      id: 'client_profile_1',
      user_email: user?.email || 'client@test.com',
      first_name: user?.first_name || 'John',
      phone: user?.phone || '+19876543210'
    };

    setTestJob(mockJob);
    setTestCleaner(mockCleaner);
    setTestClient(mockClient);
  };

  const addNotificationLog = (source, data) => {
    setNotifications(prev => [
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        source: source,
        data: data
      },
      ...prev.slice(0, 19) // Keep last 20
    ]);
  };

  // ============================================================================
  // TEST FUNCTIONS
  // ============================================================================

  const testJobAccepted = async () => {
    addNotificationLog('TEST', { action: 'Triggering JOB_ASSIGNED event...' });
    
    await jobEventBus.emit({
      type: 'JOB_ASSIGNED',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email
    });

    addNotificationLog('TEST', { action: 'JOB_ASSIGNED event emitted', status: 'success' });
  };

  const testCleanerEnRoute = async () => {
    addNotificationLog('TEST', { action: 'Triggering CLEANER_EN_ROUTE event...' });
    
    await jobEventBus.emit({
      type: 'CLEANER_EN_ROUTE',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email,
      location: { lat: 34.0522, lng: -118.2437 }
    });

    addNotificationLog('TEST', { action: 'CLEANER_EN_ROUTE event emitted', status: 'success' });
  };

  const testCleanerArrived = async () => {
    addNotificationLog('TEST', { action: 'Triggering CLEANER_ARRIVED event...' });
    
    await jobEventBus.emit({
      type: 'CLEANER_ARRIVED',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email,
      location: { lat: 34.0522, lng: -118.2437 }
    });

    addNotificationLog('TEST', { action: 'CLEANER_ARRIVED event emitted', status: 'success' });
  };

  const testJobStarted = async () => {
    addNotificationLog('TEST', { action: 'Triggering JOB_STARTED event...' });
    
    await jobEventBus.emit({
      type: 'JOB_STARTED',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email,
      location: { lat: 34.0522, lng: -118.2437 }
    });

    addNotificationLog('TEST', { action: 'JOB_STARTED event emitted', status: 'success' });
  };

  const testPhotosUploaded = async () => {
    addNotificationLog('TEST', { action: 'Triggering BEFORE_PHOTO_UPLOADED event...' });
    
    await jobEventBus.emit({
      type: 'BEFORE_PHOTO_UPLOADED',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email,
      photoId: 'photo_' + Date.now()
    });

    addNotificationLog('TEST', { action: 'BEFORE_PHOTO_UPLOADED event emitted', status: 'success' });
  };

  const testExtraTimeRequested = async () => {
    addNotificationLog('TEST', { action: 'Triggering EXTRA_TIME_REQUESTED event (URGENT)...' });
    
    await jobEventBus.emit({
      type: 'EXTRA_TIME_REQUESTED',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email,
      minutesRequested: 30,
      reason: 'Kitchen requires additional deep cleaning'
    });

    addNotificationLog('TEST', { action: 'EXTRA_TIME_REQUESTED event emitted', status: 'success' });
  };

  const testJobCompleted = async () => {
    addNotificationLog('TEST', { action: 'Triggering JOB_COMPLETED event...' });
    
    await jobEventBus.emit({
      type: 'JOB_COMPLETED',
      jobId: testJob.id,
      cleanerId: testCleaner.user_email,
      location: { lat: 34.0522, lng: -118.2437 },
      minutesWorked: 180
    });

    addNotificationLog('TEST', { action: 'JOB_COMPLETED event emitted', status: 'success' });
  };

  const testSMSDirect = async () => {
    if (!systemStatus.sms) {
      alert('SMS not configured. Set VITE_TWILIO_* environment variables.');
      return;
    }

    addNotificationLog('TEST', { action: 'Sending test SMS...' });
    
    const result = await smsService.sendSMS({
      to: testClient.phone,
      message: ClientSMSTemplates.cleanerEnRoute(testCleaner.name, '15 minutes'),
      priority: 'high'
    });

    addNotificationLog('SMS_SERVICE', result);
  };

  const testPushDirect = async () => {
    if (!systemStatus.push) {
      alert('Push notifications not enabled. Click "Enable Push" first.');
      return;
    }

    addNotificationLog('TEST', { action: 'Sending test push notification...' });
    
    const result = await pushNotificationService.showLocalNotification(
      ClientPushTemplates.cleanerEnRoute(testCleaner.name, '15 minutes')
    );

    addNotificationLog('PUSH_SERVICE', { success: result });
  };

  const testAllNotifications = async () => {
    addNotificationLog('TEST', { action: 'Running full job lifecycle test...', status: 'info' });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testJobAccepted();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testCleanerEnRoute();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testCleanerArrived();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testJobStarted();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testPhotosUploaded();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testExtraTimeRequested();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testJobCompleted();
    
    addNotificationLog('TEST', { action: 'Full lifecycle test complete!', status: 'success' });
  };

  const requestPushPermission = async () => {
    const granted = await pushNotificationService.requestPermission();
    if (granted) {
      alert('Push notifications enabled!');
      checkSystemStatus();
    } else {
      alert('Push notifications denied. Enable in browser settings.');
    }
  };

  const clearLogs = () => {
    setNotifications([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-system" />
        <span className="ml-3 text-lg font-heading">Initializing test environment...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-graphite mb-2">
          Notification System Test Page
        </h1>
        <p className="text-gray-600 font-body">
          Trigger notification events and see the system in action
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Status & Test Data */}
        <div className="lg:col-span-1 space-y-6">
          {/* System Status */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Zap className="h-5 w-5 text-system mr-2" />
              <h2 className="text-lg font-heading font-bold">System Status</h2>
            </div>
            <div className="space-y-3 text-sm font-body">
              <div className="flex items-center justify-between">
                <span>In-App Notifications:</span>
                <Badge variant="success" className="text-xs">✅ Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Service:</span>
                <Badge variant="success" className="text-xs">✅ Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SMS Service:</span>
                {systemStatus.sms ? (
                  <Badge variant="success" className="text-xs">✅ Active</Badge>
                ) : (
                  <Badge variant="warning" className="text-xs">⚠️ Dev Mode</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Push Notifications:</span>
                {systemStatus.push ? (
                  <Badge variant="success" className="text-xs">✅ Enabled</Badge>
                ) : (
                  <Button onClick={requestPushPermission} size="sm" variant="outline" className="h-6 text-xs">
                    Enable
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Real-Time Mode:</span>
                <Badge variant="system" className="text-xs">
                  {systemStatus.realTime === 'websocket' && '⚡ WebSocket'}
                  {systemStatus.realTime === 'sse' && '⚡ SSE'}
                  {systemStatus.realTime === 'polling' && '🔄 Polling'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Test Data */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-system mr-2" />
              <h2 className="text-lg font-heading font-bold">Test Data</h2>
            </div>
            <div className="space-y-2 text-xs font-body text-gray-700">
              <div>
                <strong>Job ID:</strong>
                <p className="text-gray-600 truncate">{testJob?.id}</p>
              </div>
              <div>
                <strong>Client:</strong>
                <p className="text-gray-600">{testClient?.first_name} ({testClient?.user_email})</p>
              </div>
              <div>
                <strong>Cleaner:</strong>
                <p className="text-gray-600">{testCleaner?.name} ({testCleaner?.user_email})</p>
              </div>
              <div>
                <strong>Address:</strong>
                <p className="text-gray-600">{testJob?.address}</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-heading font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                onClick={testAllNotifications}
                className="w-full bg-system hover:bg-system-dark text-white font-heading"
                size="sm"
              >
                🎬 Run Full Test
              </Button>
              <Button
                onClick={clearLogs}
                variant="outline"
                className="w-full font-heading"
                size="sm"
              >
                🗑️ Clear Logs
              </Button>
            </div>
          </Card>
        </div>

        {/* Middle Column: Test Buttons */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-heading font-bold mb-4">Client Notifications</h2>
            <div className="space-y-3">
              <Button
                onClick={testJobAccepted}
                className="w-full justify-start font-body"
                variant="outline"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                Job Accepted
              </Button>
              
              <Button
                onClick={testCleanerEnRoute}
                className="w-full justify-start font-body"
                variant="outline"
              >
                🚗 Cleaner En Route
              </Button>
              
              <Button
                onClick={testCleanerArrived}
                className="w-full justify-start font-body"
                variant="outline"
              >
                📍 Cleaner Arrived
              </Button>
              
              <Button
                onClick={testJobStarted}
                className="w-full justify-start font-body"
                variant="outline"
              >
                🧹 Job Started
              </Button>
              
              <Button
                onClick={testPhotosUploaded}
                className="w-full justify-start font-body"
                variant="outline"
              >
                📸 Photos Uploaded
              </Button>
              
              <Button
                onClick={testExtraTimeRequested}
                className="w-full justify-start font-body bg-amber-50 border-amber-300 hover:bg-amber-100"
                variant="outline"
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                Extra Time (URGENT)
              </Button>
              
              <Button
                onClick={testJobCompleted}
                className="w-full justify-start font-body"
                variant="outline"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                Job Completed
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-heading font-bold mb-4">Direct Tests</h2>
            <div className="space-y-3">
              <Button
                onClick={testSMSDirect}
                className="w-full justify-start font-body"
                variant="outline"
                disabled={!systemStatus.sms}
              >
                <MessageSquare className="mr-2 h-4 w-4 text-system" />
                Send Test SMS
              </Button>
              
              <Button
                onClick={testPushDirect}
                className="w-full justify-start font-body"
                variant="outline"
                disabled={!systemStatus.push}
              >
                <Smartphone className="mr-2 h-4 w-4 text-system" />
                Send Test Push
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Notification Log */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold">Notification Log</h2>
              <Badge variant="secondary" className="text-xs">
                {notifications.length} events
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-body text-sm">
                  No events yet. Click a button to test!
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant={
                          notification.source === 'TEST' ? 'secondary' :
                          notification.source === 'CLIENT_SERVICE' ? 'success' :
                          notification.source === 'REAL_TIME' ? 'system' :
                          notification.source === 'SMS_SERVICE' ? 'info' :
                          'default'
                        }
                        className="text-xs"
                      >
                        {notification.source}
                      </Badge>
                      <span className="text-gray-500">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-gray-700 whitespace-pre-wrap break-words">
                      {JSON.stringify(notification.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-heading font-bold text-blue-900 mb-2">
          📝 Testing Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm font-body text-blue-800">
          <li>Check the <strong>System Status</strong> to see which channels are active</li>
          <li>Click <strong>"Run Full Test"</strong> to simulate a complete job lifecycle</li>
          <li>Or click individual buttons to test specific notifications</li>
          <li>Watch the <strong>Notification Log</strong> to see events being processed</li>
          <li>Check your in-app notification bell (top right) for notifications</li>
          <li>Check your email inbox for email notifications</li>
          <li>If SMS/Push enabled, check your phone/browser for those too</li>
          <li>Extra Time Request is URGENT - should always notify even if preferences disabled</li>
        </ol>
      </Card>
    </div>
  );
}

