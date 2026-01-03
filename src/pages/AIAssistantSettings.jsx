import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Sparkles, ArrowLeft, MessageSquare, Calendar, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { analytics } from '../components/analytics/AnalyticsService';
import AIAssistantOnboardingWizard from '../components/ai/AIAssistantOnboardingWizard';
import MessageSettingCard from '../components/ai/MessageSettingCard';
import ReliabilityImpactWidget from '../components/ai/ReliabilityImpactWidget';
import AISettingTooltip from '../components/ai/AISettingTooltip';
import AISchedulingSettings from '../components/ai/AISchedulingSettings';
import SmartMatchingSettings from '../components/ai/SmartMatchingSettings';

// Default message templates
const DEFAULT_TEMPLATES = {
  booking_confirmation: "Hi {client_name}! Your cleaning is confirmed for {date} at {time}. Looking forward to making your space sparkle! - {cleaner_name}",
  pre_cleaning_reminder: "Hi {client_name}! Just a reminder that I'll be cleaning your place tomorrow at {time}. Please ensure access is available. Thanks! - {cleaner_name}",
  on_my_way: "Hi {client_name}! I'm on my way to your place. ETA: {eta} minutes. See you soon! - {cleaner_name}",
  post_cleaning_summary: "Hi {client_name}! Your cleaning is complete. Thank you for trusting me with your space! I hope you love the results. - {cleaner_name}",
  review_request: "Hi {client_name}! I hope you're enjoying your clean space! If you have a moment, I'd really appreciate your feedback. It helps me improve my service. - {cleaner_name}",
  tip_request: "Hi {client_name}! I'm so glad I could help make your space shine! If you were happy with the service, I'd be grateful for a tip. It really helps support my work. - {cleaner_name}",
  reengagement: "Hi {client_name}! I noticed it's been a while since your last cleaning. I'd love to help you get your space refreshed again! {discount_text} - {cleaner_name}"
};

export default function AIAssistantSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [cleanerProfile, setCleanerProfile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for all settings
  const [communicationSettings, setCommunicationSettings] = useState({});
  const [schedulingSettings, setSchedulingSettings] = useState({});
  const [matchingSettings, setMatchingSettings] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        const profile = profiles[0];
        setCleanerProfile(profile);
        
        // Initialize communication settings
        setCommunicationSettings(profile.communication_settings || {
          booking_confirmation: { enabled: true, channels: ['email', 'in_app'], custom_template: DEFAULT_TEMPLATES.booking_confirmation },
          pre_cleaning_reminder: { enabled: true, days_before: 1, channels: ['sms', 'in_app'], custom_template: DEFAULT_TEMPLATES.pre_cleaning_reminder },
          on_my_way: { enabled: true, channels: ['sms', 'in_app'], include_eta: true, custom_template: DEFAULT_TEMPLATES.on_my_way },
          post_cleaning_summary: { enabled: true, channels: ['in_app', 'email'], custom_template: DEFAULT_TEMPLATES.post_cleaning_summary },
          review_request: { enabled: true, hours_after_completion: 24, channels: ['in_app', 'email'], custom_template: DEFAULT_TEMPLATES.review_request },
          tip_request: { enabled: false, hours_after_completion: 48, channels: ['in_app', 'email'], custom_template: DEFAULT_TEMPLATES.tip_request },
          reengagement: { enabled: false, inactive_weeks: 8, target_few_bookings: 1, discount_percentage: 0, channels: ['email', 'in_app'], custom_template: DEFAULT_TEMPLATES.reengagement },
          ai_scheduling_enabled: false,
          prioritize_gap_filling: true,
          suggest_days_in_advance: 14,
          notify_client_not_interested: true
        });

        // Initialize scheduling settings
        setSchedulingSettings({
          ai_scheduling_enabled: profile.communication_settings?.ai_scheduling_enabled || false,
          prioritize_gap_filling: profile.communication_settings?.prioritize_gap_filling !== false,
          suggest_days_in_advance: profile.communication_settings?.suggest_days_in_advance || 14
        });

        // Initialize matching settings
        setMatchingSettings({
          specialty_tags: profile.specialty_tags || [],
          offers_additional_services: profile.offers_additional_services || [],
          service_locations: profile.service_locations || []
        });
      }
    } catch (error) {
      handleError(error, { userMessage: 'Failed to load cleaner profile:', showToast: false });
      toast.error('Failed to load your settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCommunicationChange = (key, value) => {
    setCommunicationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSchedulingChange = (key, value) => {
    setSchedulingSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleMatchingChange = (key, value) => {
    setMatchingSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!cleanerProfile) {
      toast.error('Profile not found');
      return;
    }
    
    try {
      setSaving(true);
      
      // Merge communication and scheduling settings
      const mergedCommunicationSettings = {
        ...communicationSettings,
        ...schedulingSettings
      };

      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        communication_settings: mergedCommunicationSettings,
        specialty_tags: matchingSettings.specialty_tags,
        offers_additional_services: matchingSettings.offers_additional_services,
        service_locations: matchingSettings.service_locations
      });

      toast.success('AI Assistant settings saved successfully!');
      setHasUnsavedChanges(false);
      
      // Track analytics
      analytics.track('ai_settings_saved', {
        ai_scheduling_enabled: schedulingSettings.ai_scheduling_enabled,
        communication_messages_enabled: Object.keys(communicationSettings).filter(k => communicationSettings[k]?.enabled).length,
        specialties_count: matchingSettings.specialty_tags?.length || 0
      });
      
      // Reload data
      await loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Failed to save settings:', showToast: false });
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Profile'))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-fredoka font-bold text-graphite">AI Assistant Settings</h1>
                <p className="text-gray-600 font-verdana">Configure how your AI Assistant helps manage your business</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className="brand-gradient text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Reliability Impact Widget */}
        <div className="mb-6">
          <ReliabilityImpactWidget cleanerProfile={cleanerProfile} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="communication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Matching
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4">
            <MessageSettingCard
              title="Booking Confirmation"
              description="Automatically confirm bookings with clients"
              settings={communicationSettings.booking_confirmation}
              onChange={(value) => handleCommunicationChange('booking_confirmation', value)}
              defaultTemplate={DEFAULT_TEMPLATES.booking_confirmation}
              tooltipContent={{
                description: "Send automatic confirmation messages when a booking is accepted",
                benefits: ["Reduces client anxiety", "Looks professional", "Decreases no-shows"],
                considerations: ["Requires accurate schedule management"]
              }}
            />

            <MessageSettingCard
              title="Pre-Cleaning Reminder"
              description="Remind clients about upcoming cleanings"
              settings={communicationSettings.pre_cleaning_reminder}
              onChange={(value) => handleCommunicationChange('pre_cleaning_reminder', value)}
              defaultTemplate={DEFAULT_TEMPLATES.pre_cleaning_reminder}
              tooltipContent={{
                description: "Send reminders before scheduled cleanings",
                benefits: ["Reduces no-shows by 40%", "Ensures access is ready", "Professional touch"],
                considerations: ["May be seen as unnecessary by some clients"]
              }}
              timingConfig={{ type: 'days_before', label: 'Send reminder how many days before?' }}
            />

            <MessageSettingCard
              title="On My Way"
              description="Notify clients when you're heading to their location"
              settings={communicationSettings.on_my_way}
              onChange={(value) => handleCommunicationChange('on_my_way', value)}
              defaultTemplate={DEFAULT_TEMPLATES.on_my_way}
              tooltipContent={{
                description: "Let clients know you're en route with estimated arrival time",
                benefits: ["Improves client communication", "Reduces anxiety", "Shows professionalism"],
                considerations: ["Requires manual triggering or GPS integration"]
              }}
              additionalToggles={[
                { key: 'include_eta', label: 'Include ETA', description: 'Show estimated time of arrival' }
              ]}
            />

            <MessageSettingCard
              title="Post-Cleaning Summary"
              description="Send a completion message after finishing"
              settings={communicationSettings.post_cleaning_summary}
              onChange={(value) => handleCommunicationChange('post_cleaning_summary', value)}
              defaultTemplate={DEFAULT_TEMPLATES.post_cleaning_summary}
              tooltipContent={{
                description: "Notify clients when cleaning is complete",
                benefits: ["Professional closure", "Prompts reviews", "Client satisfaction"],
                considerations: ["Should be sent after photos are uploaded"]
              }}
            />

            <MessageSettingCard
              title="Review Request"
              description="Ask satisfied clients for reviews"
              settings={communicationSettings.review_request}
              onChange={(value) => handleCommunicationChange('review_request', value)}
              defaultTemplate={DEFAULT_TEMPLATES.review_request}
              tooltipContent={{
                description: "Request feedback after successful cleanings",
                benefits: ["Increases review count", "Improves rating visibility", "Shows you care"],
                considerations: ["Don't request too soon after completion"]
              }}
              timingConfig={{ type: 'hours_after', label: 'Send request how many hours after completion?' }}
            />

            <MessageSettingCard
              title="Tip Request"
              description="Politely request tips from satisfied clients"
              settings={communicationSettings.tip_request}
              onChange={(value) => handleCommunicationChange('tip_request', value)}
              defaultTemplate={DEFAULT_TEMPLATES.tip_request}
              tooltipContent={{
                description: "Ask for tips after excellent service",
                benefits: ["Can increase earnings", "Shows value of your work"],
                considerations: ["Use sparingly", "Only after great reviews", "May feel pushy"]
              }}
              timingConfig={{ type: 'hours_after', label: 'Send request how many hours after completion?' }}
            />

            <MessageSettingCard
              title="Re-engagement Campaign"
              description="Win back inactive clients with personalized messages"
              settings={communicationSettings.reengagement}
              onChange={(value) => handleCommunicationChange('reengagement', value)}
              defaultTemplate={DEFAULT_TEMPLATES.reengagement}
              tooltipContent={{
                description: "Automatically reach out to clients who haven't booked in a while",
                benefits: ["Recovers lost clients", "Increases booking rate", "Shows you care"],
                considerations: ["Can seem automated if overused", "May annoy some clients"]
              }}
              additionalToggles={[
                { key: 'discount_percentage', label: 'Offer Discount (%)', description: 'Optional discount to incentivize rebooking' }
              ]}
            />
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling">
            <AISchedulingSettings
              settings={schedulingSettings}
              onChange={(newSettings) => {
                setSchedulingSettings(newSettings);
                setHasUnsavedChanges(true);
              }}
              cleanerProfile={cleanerProfile}
            />
          </TabsContent>

          {/* Matching Tab */}
          <TabsContent value="matching">
            <SmartMatchingSettings
              settings={matchingSettings}
              onChange={(newSettings) => {
                setMatchingSettings(newSettings);
                setHasUnsavedChanges(true);
              }}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Notification Preferences</CardTitle>
                <CardDescription>Manage how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="not-interested" className="font-fredoka cursor-pointer">
                      Client "Not Interested" Alerts
                    </Label>
                    <p className="text-sm text-gray-600 font-verdana mt-1">
                      Receive notifications when clients decline AI scheduling suggestions
                    </p>
                  </div>
                  <Switch
                    id="not-interested"
                    checked={communicationSettings?.notify_client_not_interested !== false}
                    onCheckedChange={(checked) => {
                      setCommunicationSettings(prev => ({
                        ...prev,
                        notify_client_not_interested: checked
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Save Button (Mobile) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full brand-gradient text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}