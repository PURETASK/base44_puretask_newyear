// Notification Test Page
// Interactive page to test all notification flows

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, MessageSquare, Smartphone, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { jobEventBus } from '@/services/jobEvents';
import { clientNotificationService } from '@/services/clientNotificationService';
import { smsService, ClientSMSTemplates } from '@/services/smsService';
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
      
      // Try to get current user (but don't fail if not logged in)
      let currentUser = null;
      try {
        currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (authError) {
        console.log('Not logged in - using mock data for testing');
      }

      // Check system capabilities
      checkSystemStatus();

      // Initialize notification integration (may fail without auth, that's OK)
      try {
        await notificationIntegration.initialize();
        
        // Initialize real-time notifications if we have a user
        if (currentUser) {
          await notificationIntegration.initializeRealTime(currentUser.email);
        }
      } catch (integrationError) {
        console.log('Notification integration skipped:', integrationError.message);
      }

      // Subscribe to notifications
      clientNotificationService.subscribe((notification) => {
        addNotificationLog('CLIENT_SERVICE', notification);
      });

      realTimeNotificationService.subscribe((notification) => {
        addNotificationLog('REAL_TIME', notification);
      });

      // ALWAYS create test job data (works without auth)
      await createTestData();

    } catch (error) {
      console.error('Failed to initialize:', error);
      // Even if initialization fails, create test data so buttons work
      await createTestData();
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

  const createTestData = async () => {
    try {
      const jobId = 'test_job_' + Date.now();
      const clientEmail = user?.email || 'client@test.com';
      const cleanerEmail = 'cleaner@test.com';

      // Create mock job with CORRECT property names from schema
      const mockJob = {
        id: jobId,
        client_id: clientEmail,
        client_email: clientEmail,
        assigned_cleaner_id: cleanerEmail,
        assigned_cleaner_email: cleanerEmail,
        status: 'OFFERED', // legacy
        state: 'OFFERED',
        sub_state: 'NONE',
        date: new Date().toISOString().split('T')[0],
        time: '09:00', // ✅ CORRECT: scheduled time
        duration_hours: 3, // ✅ CORRECT: not estimated_hours
        pricing_snapshot: { // ✅ CORRECT: price is in snapshot
          total_price: 120,
          hourly_rate: 40,
          base_price: 100,
          breakdown: { base: 100, total: 120 }
        },
        latitude: 34.0522,
        longitude: -118.2437,
        address: '123 Main St, Los Angeles, CA 90012',
        cleaning_type: 'deep',
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1200,
        // Timestamps (all null initially)
        created_at: new Date().toISOString(),
        assigned_at: null,
        start_at: null,
        end_at: null,
        // Flags
        has_pending_extra_time_request: false,
        has_pending_reschedule_request: false,
        requires_before_photos: true,
        requires_after_photos: true,
        before_photos_count: 0,
        after_photos_count: 0
      };

      const mockCleaner = {
        id: 'cleaner_profile_test',
        user_email: cleanerEmail,
        name: 'Jane Smith',
        phone: '+12345678901',
        payout_percentage: 0.8,
        reliability_score: 95
      };

      const mockClient = {
        id: 'client_profile_test',
        user_email: clientEmail,
        first_name: user?.first_name || 'John',
        phone: user?.phone || '+19876543210'
      };

      // Try to create entities in backend (best effort - may fail if not logged in)
      try {
        // Create or update the test job in the backend
        await base44.entities.Booking.create(mockJob);
        console.log('[NotificationTestPage] Created test job in backend:', jobId);

        // Create or update cleaner profile
        const existingCleaners = await base44.entities.CleanerProfile.filter({ 
          user_email: cleanerEmail 
        });
        if (existingCleaners.length === 0) {
          await base44.entities.CleanerProfile.create(mockCleaner);
          console.log('[NotificationTestPage] Created test cleaner profile');
        }

        // Create or update client profile  
        const existingClients = await base44.entities.ClientProfile.filter({ 
          user_email: clientEmail 
        });
        if (existingClients.length === 0) {
          await base44.entities.ClientProfile.create(mockClient);
          console.log('[NotificationTestPage] Created test client profile');
        }
      } catch (backendError) {
        console.log('[NotificationTestPage] Could not create backend entities (not logged in?):', backendError.message);
        console.log('[NotificationTestPage] Using local mock data only');
      }

      setTestJob(mockJob);
      setTestCleaner(mockCleaner);
      setTestClient(mockClient);
    } catch (error) {
      console.error('[NotificationTestPage] Error creating test data:', error);
    }
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
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
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
                  <button onClick={requestPushPermission} className="h-6 text-xs rounded-md px-3 inline-flex items-center justify-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                    Enable
                  </button>
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
          </div>

          {/* Test Data */}
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
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
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h2 className="text-lg font-heading font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={testAllNotifications}
                className="w-full bg-system hover:bg-system-dark text-white font-heading h-8 rounded-md px-3 text-xs inline-flex items-center justify-center transition-colors"
              >
                🎬 Run Full Test
              </button>
              <button
                onClick={clearLogs}
                className="w-full font-heading h-8 rounded-md px-3 text-xs inline-flex items-center justify-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                🗑️ Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Test Buttons */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h2 className="text-xl font-heading font-bold mb-4">Client Notifications</h2>
            <div className="space-y-3">
              <button
                onClick={testJobAccepted}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                Job Accepted
              </button>
              
              <button
                onClick={testCleanerEnRoute}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                🚗 Cleaner En Route
              </button>
              
              <button
                onClick={testCleanerArrived}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                📍 Cleaner Arrived
              </button>
              
              <button
                onClick={testJobStarted}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                🧹 Job Started
              </button>
              
              <button
                onClick={testPhotosUploaded}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                📸 Photos Uploaded
              </button>
              
              <button
                onClick={testExtraTimeRequested}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors bg-amber-50 border border-amber-300 hover:bg-amber-100"
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                Extra Time (URGENT)
              </button>
              
              <button
                onClick={testJobCompleted}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                Job Completed
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h2 className="text-xl font-heading font-bold mb-4">Direct Tests</h2>
            <div className="space-y-3">
              <button
                onClick={testSMSDirect}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled={!systemStatus.sms}
              >
                <MessageSquare className="mr-2 h-4 w-4 text-system" />
                Send Test SMS
              </button>
              
              <button
                onClick={testPushDirect}
                className="w-full justify-start font-body h-9 px-4 py-2 rounded-md inline-flex items-center transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled={!systemStatus.push}
              >
                <Smartphone className="mr-2 h-4 w-4 text-system" />
                Send Test Push
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Notification Log */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
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
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border bg-blue-50 border-blue-200 shadow mt-6 p-6">
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
      </div>
    </div>
  );
}

