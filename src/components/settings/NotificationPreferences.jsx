// Notification Preferences Component
// Allows users to control how they receive notifications

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Bell, Mail, MessageSquare, Smartphone, Clock, Moon } from 'lucide-react';
import { pushNotificationService } from '@/services/pushNotificationService';
import { smsService } from '@/services/smsService';

export default function NotificationPreferences() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    in_app: true,
    email: true,
    sms: true,
    push: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });

  const [capabilities, setCapabilities] = useState({
    push: false,
    sms: false
  });

  useEffect(() => {
    loadPreferences();
    checkCapabilities();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load preferences from database
      const prefs = await base44.entities.NotificationPreferences?.filter({
        user_email: currentUser.email
      }).catch(() => []);

      if (prefs && prefs.length > 0) {
        setPreferences(prefs[0]);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCapabilities = () => {
    // Check if push notifications are supported
    const pushSupported = pushNotificationService.isSupported();
    const pushEnabled = pushNotificationService.isEnabled();

    // Check if SMS is configured
    const smsEnabled = smsService.isEnabled();

    setCapabilities({
      push: pushSupported,
      sms: smsEnabled
    });
  };

  const savePreferences = async () => {
    try {
      setSaving(true);

      // Check if preferences exist
      const existingPrefs = await base44.entities.NotificationPreferences?.filter({
        user_email: user.email
      }).catch(() => []);

      if (existingPrefs && existingPrefs.length > 0) {
        // Update existing
        await base44.entities.NotificationPreferences.update(existingPrefs[0].id, preferences);
      } else {
        // Create new
        await base44.entities.NotificationPreferences?.create({
          user_email: user.email,
          ...preferences
        }).catch(() => {
          console.log('NotificationPreferences entity not found, skipping');
        });
      }

      // Show success message
      alert('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const requestPushPermission = async () => {
    const granted = await pushNotificationService.requestPermission();
    
    if (granted) {
      setPreferences(prev => ({ ...prev, push: true }));
      alert('Push notifications enabled!');
    } else {
      alert('Push notifications were denied. Please enable them in your browser settings.');
    }

    checkCapabilities();
  };

  const handleToggle = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-system" />
        <span className="ml-2 text-gray-600">Loading preferences...</span>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-6 w-6 text-system mr-3" />
          <div>
            <h2 className="text-2xl font-heading font-bold text-graphite">Notification Preferences</h2>
            <p className="text-sm text-gray-600 font-body">Choose how you want to be notified about job updates</p>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-system" />
              <div>
                <Label className="text-base font-heading font-semibold">In-App Notifications</Label>
                <p className="text-sm text-gray-600 font-body">Show notifications inside the PureTask app</p>
              </div>
            </div>
            <Switch
              checked={preferences.in_app}
              onCheckedChange={(checked) => handleToggle('in_app', checked)}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-system" />
              <div>
                <Label className="text-base font-heading font-semibold">Email Notifications</Label>
                <p className="text-sm text-gray-600 font-body">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) => handleToggle('email', checked)}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-system" />
              <div>
                <Label className="text-base font-heading font-semibold">SMS Notifications</Label>
                <p className="text-sm text-gray-600 font-body">
                  Receive urgent updates via text message
                  {!capabilities.sms && <span className="block text-xs text-amber-600 mt-1">⚠️ SMS not configured yet</span>}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.sms}
              onCheckedChange={(checked) => handleToggle('sms', checked)}
              disabled={!capabilities.sms}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-system" />
              <div>
                <Label className="text-base font-heading font-semibold">Push Notifications</Label>
                <p className="text-sm text-gray-600 font-body">
                  Receive browser notifications (even when app is closed)
                  {!capabilities.push && <span className="block text-xs text-amber-600 mt-1">⚠️ Not supported in your browser</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {capabilities.push && !pushNotificationService.isEnabled() && (
                <Button
                  onClick={requestPushPermission}
                  size="sm"
                  variant="outline"
                  className="mr-2"
                >
                  Enable
                </Button>
              )}
              <Switch
                checked={preferences.push}
                onCheckedChange={(checked) => handleToggle('push', checked)}
                disabled={!capabilities.push || !pushNotificationService.isEnabled()}
              />
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Moon className="h-5 w-5 text-system" />
                <div>
                  <Label className="text-base font-heading font-semibold">Quiet Hours</Label>
                  <p className="text-sm text-gray-600 font-body">Mute non-urgent notifications during specific hours</p>
                </div>
              </div>
              <Switch
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => handleToggle('quiet_hours_enabled', checked)}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="flex items-center space-x-4 ml-8 mt-3">
                <div>
                  <Label className="text-sm font-body">Start</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => handleToggle('quiet_hours_start', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-system focus:border-system"
                  />
                </div>
                <div>
                  <Label className="text-sm font-body">End</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => handleToggle('quiet_hours_end', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-system focus:border-system"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="bg-system hover:bg-system-dark text-white font-heading"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </Card>

      {/* Notification Types Card */}
      <Card className="p-6">
        <h3 className="text-lg font-heading font-bold text-graphite mb-4">What you'll be notified about</h3>
        <div className="space-y-2 text-sm font-body text-gray-700">
          <div className="flex items-start">
            <span className="mr-2">🚗</span>
            <span>When your cleaner is on the way</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">📍</span>
            <span>When your cleaner arrives</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">🧹</span>
            <span>When cleaning starts and completes</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">📸</span>
            <span>When before/after photos are uploaded</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">⏰</span>
            <span><strong>When extra time is requested</strong> (requires your approval)</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">💳</span>
            <span>Payment confirmations</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">⭐</span>
            <span>Reminders to review your cleaner</span>
          </div>
        </div>
      </Card>

      {/* System Status Card */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-sm font-heading font-bold text-gray-700 mb-3">System Status</h3>
        <div className="space-y-2 text-xs font-body text-gray-600">
          <div className="flex items-center justify-between">
            <span>In-App Notifications:</span>
            <span className="text-success font-semibold">✅ Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Email Service:</span>
            <span className="text-success font-semibold">✅ Active (Base44)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>SMS Service:</span>
            <span className={capabilities.sms ? 'text-success font-semibold' : 'text-amber-600'}>
              {capabilities.sms ? '✅ Active (Twilio)' : '⚠️ Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Push Notifications:</span>
            <span className={capabilities.push ? 'text-success font-semibold' : 'text-amber-600'}>
              {capabilities.push ? (pushNotificationService.isEnabled() ? '✅ Enabled' : '⚠️ Not enabled') : '❌ Not supported'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

