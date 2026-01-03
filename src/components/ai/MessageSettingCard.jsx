import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import MessagePreview from './MessagePreview';
import AISettingTooltip from './AISettingTooltip';
import AIImpactExplainer from './AIImpactExplainer';

export default function MessageSettingCard({
  title,
  description,
  settings,
  onChange,
  defaultTemplate,
  tooltipContent = {},
  timingConfig = null,
  additionalToggles = []
}) {
  const [isExpanded, setIsExpanded] = useState(settings?.enabled || false);
  const [localTemplate, setLocalTemplate] = useState(settings?.custom_template || defaultTemplate);
  const debounceTimer = React.useRef(null);

  const handleToggle = (checked) => {
    onChange({ ...settings, enabled: checked });
    setIsExpanded(checked);
  };

  const handleChannelToggle = (channel, checked) => {
    const currentChannels = settings?.channels || [];
    const newChannels = checked
      ? [...currentChannels, channel]
      : currentChannels.filter(c => c !== channel);
    onChange({ ...settings, channels: newChannels });
  };

  const handleTemplateChange = (value) => {
    setLocalTemplate(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange({ ...settings, custom_template: value });
    }, 800);
  };

  React.useEffect(() => {
    setLocalTemplate(settings?.custom_template || defaultTemplate);
  }, [settings?.custom_template, defaultTemplate]);

  const handleTimingChange = (value) => {
    const key = timingConfig.type === 'days_before' ? 'days_before' : 'hours_after_completion';
    onChange({ ...settings, [key]: parseInt(value) || 0 });
  };

  const handleResetTemplate = () => {
    onChange({ ...settings, custom_template: defaultTemplate });
  };

  const handleAdditionalToggle = (key, checked) => {
    onChange({ ...settings, [key]: checked });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <CardTitle className="font-fredoka text-lg">{title}</CardTitle>
            <AISettingTooltip
              title={title}
              description={tooltipContent.description || description}
              benefits={tooltipContent.benefits || []}
              considerations={tooltipContent.considerations || []}
            />
            <AIImpactExplainer
              settingName={title}
              impact="positive"
              impactAreas={['client_satisfaction', 'bookings']}
              description="Automated professional communication improves client experience"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings?.enabled || false}
              onCheckedChange={handleToggle}
            />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <CardDescription className="font-verdana">{description}</CardDescription>
      </CardHeader>

      {isExpanded && settings?.enabled && (
        <CardContent className="pt-6 space-y-6">
          {/* Timing Configuration */}
          {timingConfig && (
            <div className="space-y-2">
              <Label className="font-fredoka">{timingConfig.label}</Label>
              <Input
                type="number"
                min="1"
                value={settings?.[timingConfig.type === 'days_before' ? 'days_before' : 'hours_after_completion'] || ''}
                onChange={(e) => handleTimingChange(e.target.value)}
                className="w-32"
              />
            </div>
          )}

          {/* Additional Toggles */}
          {additionalToggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center space-x-2">
              <Switch
                id={`${title}-${toggle.key}`}
                checked={settings?.[toggle.key] || false}
                onCheckedChange={(checked) => handleAdditionalToggle(toggle.key, checked)}
              />
              <div className="flex-1">
                <Label htmlFor={`${title}-${toggle.key}`} className="font-fredoka cursor-pointer">
                  {toggle.label}
                </Label>
                <p className="text-xs text-gray-600 font-verdana">{toggle.description}</p>
              </div>
            </div>
          ))}

          {/* Channel Selection */}
          <div className="space-y-3">
            <Label className="font-fredoka">Send via:</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-sms`}
                  checked={settings?.channels?.includes('sms') || false}
                  onCheckedChange={(checked) => handleChannelToggle('sms', checked)}
                />
                <Label htmlFor={`${title}-sms`} className="font-verdana cursor-pointer">SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-email`}
                  checked={settings?.channels?.includes('email') || false}
                  onCheckedChange={(checked) => handleChannelToggle('email', checked)}
                />
                <Label htmlFor={`${title}-email`} className="font-verdana cursor-pointer">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-in_app`}
                  checked={settings?.channels?.includes('in_app') || false}
                  onCheckedChange={(checked) => handleChannelToggle('in_app', checked)}
                />
                <Label htmlFor={`${title}-in_app`} className="font-verdana cursor-pointer">In-App</Label>
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-fredoka">Message Template</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTemplate}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset to Default
              </Button>
            </div>
            <Textarea
              value={localTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="min-h-[100px] font-verdana text-sm"
              placeholder={defaultTemplate}
            />
            <p className="text-xs text-gray-500 font-verdana">
              {localTemplate?.length || 0} characters
            </p>
          </div>

          {/* Live Preview */}
          <MessagePreview
            template={localTemplate || defaultTemplate}
            channels={settings?.channels || ['email']}
          />
        </CardContent>
      )}
    </Card>
  );
}