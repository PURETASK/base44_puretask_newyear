import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Mail, MessageSquare, Phone, Clock, CheckCircle2, 
  Send, ThumbsUp, Star, Calendar, Sparkles, AlertCircle,
  Save, RotateCcw, Info, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function AICommunicationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [settings, setSettings] = useState({
    ai_scheduling_enabled: false,
    prioritize_gap_filling: true,
    suggest_days_in_advance: 14,
    notify_client_not_interested: true,
    booking_confirmation: {
      enabled: true,
      channels: ['in_app', 'email'],
      custom_template: "Hi {client_name}! Your cleaning is confirmed for {date} at {time}. Looking forward to making your space sparkle! - {cleaner_name}"
    },
    pre_cleaning_reminder: {
      enabled: true,
      days_before: 1,
      channels: ['sms', 'in_app'],
      custom_template: "Hi {client_name}! Just a reminder that I'll be cleaning your place tomorrow at {time}. Please ensure access is available. Thanks! - {cleaner_name}"
    },
    on_my_way: {
      enabled: true,
      channels: ['sms', 'in_app'],
      include_eta: true,
      custom_template: "Hi {client_name}! I'm on my way to your place. ETA: {eta} minutes. See you soon! - {cleaner_name}"
    },
    post_cleaning_summary: {
      enabled: true,
      channels: ['in_app', 'email'],
      custom_template: "Hi {client_name}! Your cleaning is complete. Thank you for trusting me with your space! I hope you love the results. - {cleaner_name}"
    },
    review_request: {
      enabled: true,
      hours_after_completion: 24,
      channels: ['in_app', 'email'],
      custom_template: "Hi {client_name}! I hope you're enjoying your clean space! If you have a moment, I'd really appreciate your feedback. It helps me improve my service. - {cleaner_name}"
    },
    tip_request: {
      enabled: false,
      hours_after_completion: 48,
      channels: ['in_app', 'email'],
      custom_template: "Hi {client_name}! I'm so glad I could help make your space shine! If you were happy with the service, I'd be grateful for a tip. It really helps support my work. - {cleaner_name}"
    },
    reengagement: {
      enabled: false,
      inactive_weeks: 8,
      target_few_bookings: 1,
      channels: ['email', 'in_app'],
      discount_percentage: 0,
      custom_template: "Hi {client_name}! I noticed it's been a while since your last cleaning. I'd love to help you get your space refreshed again! {discount_text} - {cleaner_name}"
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0) {
        setCleanerProfile(profiles[0]);
        if (profiles[0].communication_settings) {
          setSettings({ ...settings, ...profiles[0].communication_settings });
        }
      }
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        communication_settings: settings
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      ai_scheduling_enabled: false,
      prioritize_gap_filling: true,
      suggest_days_in_advance: 14,
      notify_client_not_interested: true,
      booking_confirmation: {
        enabled: true,
        channels: ['in_app', 'email'],
        custom_template: "Hi {client_name}! Your cleaning is confirmed for {date} at {time}. Looking forward to making your space sparkle! - {cleaner_name}"
      },
      pre_cleaning_reminder: {
        enabled: true,
        days_before: 1,
        channels: ['sms', 'in_app'],
        custom_template: "Hi {client_name}! Just a reminder that I'll be cleaning your place tomorrow at {time}. Please ensure access is available. Thanks! - {cleaner_name}"
      },
      on_my_way: {
        enabled: true,
        channels: ['sms', 'in_app'],
        include_eta: true,
        custom_template: "Hi {client_name}! I'm on my way to your place. ETA: {eta} minutes. See you soon! - {cleaner_name}"
      },
      post_cleaning_summary: {
        enabled: true,
        channels: ['in_app', 'email'],
        custom_template: "Hi {client_name}! Your cleaning is complete. Thank you for trusting me with your space! I hope you love the results. - {cleaner_name}"
      },
      review_request: {
        enabled: true,
        hours_after_completion: 24,
        channels: ['in_app', 'email'],
        custom_template: "Hi {client_name}! I hope you're enjoying your clean space! If you have a moment, I'd really appreciate your feedback. It helps me improve my service. - {cleaner_name}"
      },
      tip_request: {
        enabled: false,
        hours_after_completion: 48,
        channels: ['in_app', 'email'],
        custom_template: "Hi {client_name}! I'm so glad I could help make your space shine! If you were happy with the service, I'd be grateful for a tip. It really helps support my work. - {cleaner_name}"
      },
      reengagement: {
        enabled: false,
        inactive_weeks: 8,
        target_few_bookings: 1,
        channels: ['email', 'in_app'],
        discount_percentage: 0,
        custom_template: "Hi {client_name}! I noticed it's been a while since your last cleaning. I'd love to help you get your space refreshed again! {discount_text} - {cleaner_name}"
      }
    });
    toast.info('Settings reset to defaults');
  };

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
  };

  const toggleChannel = (messagePath, channel) => {
    const currentChannels = settings[messagePath]?.channels || [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    updateSetting(`${messagePath}.channels`, newChannels);
  };

  const countActiveAutomations = () => {
    let count = 0;
    if (settings.ai_scheduling_enabled) count++;
    if (settings.booking_confirmation?.enabled) count++;
    if (settings.pre_cleaning_reminder?.enabled) count++;
    if (settings.on_my_way?.enabled) count++;
    if (settings.post_cleaning_summary?.enabled) count++;
    if (settings.review_request?.enabled) count++;
    if (settings.tip_request?.enabled) count++;
    if (settings.reengagement?.enabled) count++;
    return count;
  };

  const ChannelSelector = ({ messagePath, availableChannels = ['sms', 'email', 'in_app'] }) => {
    const channels = settings[messagePath]?.channels || [];
    
    return (
      <div className="space-y-2">
        <Label>Channels</Label>
        <div className="flex flex-wrap gap-2">
          {availableChannels.map(channel => (
            <div
              key={channel}
              onClick={() => toggleChannel(messagePath, channel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                channels.includes(channel)
                  ? 'border-puretask-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {channel === 'sms' && <Phone className="w-4 h-4" />}
              {channel === 'email' && <Mail className="w-4 h-4" />}
              {channel === 'in_app' && <MessageSquare className="w-4 h-4" />}
              <span className="text-sm font-medium capitalize">{channel.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MessagePreview = ({ template }) => {
    const sampleData = {
      client_name: 'Sarah Johnson',
      cleaner_name: cleanerProfile?.full_name || 'You',
      date: 'January 15, 2025',
      time: '10:00 AM',
      address: '123 Main St',
      eta: '15',
      hours: '3',
      discount_text: 'Use code WELCOME15 for 15% off!',
      review_link: 'https://puretask.com/review/123'
    };

    let preview = template;
    Object.keys(sampleData).forEach(key => {
      preview = preview.replace(new RegExp(`{${key}}`, 'g'), sampleData[key]);
    });

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600 font-medium">Preview</span>
        </div>
        <p className="text-sm text-gray-700">{preview}</p>
        <p className="text-xs text-gray-500 mt-2">
          {template.length} characters {template.length > 160 && '• SMS may be split into multiple messages'}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-puretask-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-puretask-blue to-indigo-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-fredoka font-bold text-graphite">AI Communication Automation</h1>
                <p className="text-gray-600 font-verdana">Configure how and when AI communicates with your clients</p>
              </div>
            </div>
          </div>
          <Badge className="bg-puretask-blue text-white font-fredoka">
            {countActiveAutomations()} Active
          </Badge>
        </div>
      </div>

      {/* AI Scheduling Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-puretask-blue" />
            <CardTitle className="font-fredoka">AI-Driven Scheduling</CardTitle>
          </div>
          <CardDescription>Let AI suggest optimal booking times to clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable AI Scheduling Suggestions</Label>
              <p className="text-sm text-gray-600">AI will analyze your schedule and suggest optimal times to clients</p>
            </div>
            <Switch
              checked={settings.ai_scheduling_enabled}
              onCheckedChange={(checked) => updateSetting('ai_scheduling_enabled', checked)}
            />
          </div>

          {settings.ai_scheduling_enabled && (
            <>
              <div className="space-y-2">
                <Label>Suggest bookings up to (days in advance)</Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.suggest_days_in_advance}
                  onChange={(e) => updateSetting('suggest_days_in_advance', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Prioritize Gap-Filling</Label>
                  <p className="text-sm text-gray-600">Prefer times that reduce travel between bookings</p>
                </div>
                <Switch
                  checked={settings.prioritize_gap_filling}
                  onCheckedChange={(checked) => updateSetting('prioritize_gap_filling', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Notify on Client Decline</Label>
                  <p className="text-sm text-gray-600">Get notified when clients choose "not interested"</p>
                </div>
                <Switch
                  checked={settings.notify_client_not_interested}
                  onCheckedChange={(checked) => updateSetting('notify_client_not_interested', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Confirmation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <CardTitle className="font-fredoka">Booking Confirmation</CardTitle>
          </div>
          <CardDescription>Automatically confirm bookings with clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Confirmation Messages</Label>
            <Switch
              checked={settings.booking_confirmation?.enabled}
              onCheckedChange={(checked) => updateSetting('booking_confirmation.enabled', checked)}
            />
          </div>

          {settings.booking_confirmation?.enabled && (
            <>
              <ChannelSelector messagePath="booking_confirmation" />
              
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.booking_confirmation?.custom_template}
                  onChange={(e) => updateSetting('booking_confirmation.custom_template', e.target.value)}
                  rows={3}
                  placeholder="Your confirmation message..."
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{date}'}, {'{time}'}, {'{cleaner_name}'}
                </p>
              </div>

              <MessagePreview template={settings.booking_confirmation?.custom_template} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Pre-Cleaning Reminder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <CardTitle className="font-fredoka">Pre-Cleaning Reminder</CardTitle>
          </div>
          <CardDescription>Send reminders before scheduled cleanings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Reminders</Label>
            <Switch
              checked={settings.pre_cleaning_reminder?.enabled}
              onCheckedChange={(checked) => updateSetting('pre_cleaning_reminder.enabled', checked)}
            />
          </div>

          {settings.pre_cleaning_reminder?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Send reminder (days before)</Label>
                <Input
                  type="number"
                  min="0"
                  max="7"
                  value={settings.pre_cleaning_reminder?.days_before}
                  onChange={(e) => updateSetting('pre_cleaning_reminder.days_before', parseInt(e.target.value))}
                />
              </div>

              <ChannelSelector messagePath="pre_cleaning_reminder" />
              
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.pre_cleaning_reminder?.custom_template}
                  onChange={(e) => updateSetting('pre_cleaning_reminder.custom_template', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{time}'}, {'{cleaner_name}'}
                </p>
              </div>

              <MessagePreview template={settings.pre_cleaning_reminder?.custom_template} />
            </>
          )}
        </CardContent>
      </Card>

      {/* On My Way */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <CardTitle className="font-fredoka">"On My Way" Notification</CardTitle>
          </div>
          <CardDescription>Alert clients when you're heading to their location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable "On My Way" Messages</Label>
            <Switch
              checked={settings.on_my_way?.enabled}
              onCheckedChange={(checked) => updateSetting('on_my_way.enabled', checked)}
            />
          </div>

          {settings.on_my_way?.enabled && (
            <>
              <ChannelSelector messagePath="on_my_way" availableChannels={['sms', 'in_app']} />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Include GPS-based ETA</Label>
                  <p className="text-sm text-gray-600">Show estimated arrival time</p>
                </div>
                <Switch
                  checked={settings.on_my_way?.include_eta}
                  onCheckedChange={(checked) => updateSetting('on_my_way.include_eta', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.on_my_way?.custom_template}
                  onChange={(e) => updateSetting('on_my_way.custom_template', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{eta}'}, {'{cleaner_name}'}
                </p>
              </div>

              <MessagePreview template={settings.on_my_way?.custom_template} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Post-Cleaning Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="font-fredoka">Post-Cleaning Summary</CardTitle>
          </div>
          <CardDescription>Send a thank you message after completing cleanings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Summary Messages</Label>
            <Switch
              checked={settings.post_cleaning_summary?.enabled}
              onCheckedChange={(checked) => updateSetting('post_cleaning_summary.enabled', checked)}
            />
          </div>

          {settings.post_cleaning_summary?.enabled && (
            <>
              <ChannelSelector messagePath="post_cleaning_summary" />
              
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.post_cleaning_summary?.custom_template}
                  onChange={(e) => updateSetting('post_cleaning_summary.custom_template', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{cleaner_name}'}
                </p>
              </div>

              <MessagePreview template={settings.post_cleaning_summary?.custom_template} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Request */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <CardTitle className="font-fredoka">Review Request</CardTitle>
          </div>
          <CardDescription>Request feedback from satisfied clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Review Requests</Label>
            <Switch
              checked={settings.review_request?.enabled}
              onCheckedChange={(checked) => updateSetting('review_request.enabled', checked)}
            />
          </div>

          {settings.review_request?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Send request (hours after completion)</Label>
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.review_request?.hours_after_completion}
                  onChange={(e) => updateSetting('review_request.hours_after_completion', parseInt(e.target.value))}
                />
              </div>

              <ChannelSelector messagePath="review_request" />
              
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.review_request?.custom_template}
                  onChange={(e) => updateSetting('review_request.custom_template', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{cleaner_name}'}, {'{review_link}'}
                </p>
              </div>

              <MessagePreview template={settings.review_request?.custom_template} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Tip Request */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <CardTitle className="font-fredoka">Tip Request</CardTitle>
          </div>
          <CardDescription>Politely request tips from satisfied clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Tip Requests</Label>
            <Switch
              checked={settings.tip_request?.enabled}
              onCheckedChange={(checked) => updateSetting('tip_request.enabled', checked)}
            />
          </div>

          {settings.tip_request?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Send request (hours after completion)</Label>
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.tip_request?.hours_after_completion}
                  onChange={(e) => updateSetting('tip_request.hours_after_completion', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Recommended: 48-72 hours after completion</p>
              </div>

              <ChannelSelector messagePath="tip_request" availableChannels={['email', 'in_app']} />
              
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.tip_request?.custom_template}
                  onChange={(e) => updateSetting('tip_request.custom_template', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{cleaner_name}'}
                </p>
              </div>

              <MessagePreview template={settings.tip_request?.custom_template} />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Respectful tipping culture</p>
                    <p className="text-xs text-blue-700 mt-1">Tip requests are sent politely and include an easy way to tip directly through the platform</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Re-engagement Campaign */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-indigo-600" />
            <CardTitle className="font-fredoka">Re-engagement Campaign</CardTitle>
          </div>
          <CardDescription>Win back inactive clients automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Re-engagement</Label>
            <Switch
              checked={settings.reengagement?.enabled}
              onCheckedChange={(checked) => updateSetting('reengagement.enabled', checked)}
            />
          </div>

          {settings.reengagement?.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inactive after (weeks)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    value={settings.reengagement?.inactive_weeks}
                    onChange={(e) => updateSetting('reengagement.inactive_weeks', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target clients with ≤ bookings</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.reengagement?.target_few_bookings}
                    onChange={(e) => updateSetting('reengagement.target_few_bookings', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Offer discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.reengagement?.discount_percentage}
                  onChange={(e) => updateSetting('reengagement.discount_percentage', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Set to 0 for no discount</p>
              </div>

              <ChannelSelector messagePath="reengagement" />
              
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  value={settings.reengagement?.custom_template}
                  onChange={(e) => updateSetting('reengagement.custom_template', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Available variables: {'{client_name}'}, {'{cleaner_name}'}, {'{discount_text}'}
                </p>
              </div>

              <MessagePreview template={settings.reengagement?.custom_template} />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Campaign runs weekly</p>
                    <p className="text-xs text-amber-700 mt-1">Clients won't receive more than one message per month to avoid spam</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="sticky bottom-4 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>

          <Button
            onClick={saveSettings}
            disabled={saving}
            className="brand-gradient text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}