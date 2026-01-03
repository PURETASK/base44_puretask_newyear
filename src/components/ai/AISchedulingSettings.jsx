import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import AISettingTooltip from './AISettingTooltip';

export default function AISchedulingSettings({ settings, onChange, cleanerProfile }) {
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* AI Scheduling Master Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-puretask-blue" />
            AI-Powered Schedule Optimization
          </CardTitle>
          <CardDescription className="font-verdana">
            Let AI analyze your patterns and suggest optimal booking times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-scheduling" className="font-fredoka font-semibold text-lg cursor-pointer">
                  Enable AI Scheduling
                </Label>
                <AISettingTooltip
                  title="AI Scheduling"
                  description="AI analyzes your booking patterns and suggests optimal time slots to clients"
                  benefits={[
                    'Fills gaps in your schedule automatically',
                    'Maximizes daily earnings',
                    'Reduces travel time between jobs',
                    'Learns your preferences over time'
                  ]}
                  considerations={[
                    'Requires accurate availability settings',
                    'May suggest bookings during less preferred times initially'
                  ]}
                />
              </div>
              <p className="text-sm text-gray-600 font-verdana mt-1">
                When enabled, AI proactively suggests booking times that fill gaps, minimize travel, and match your preferences
              </p>
            </div>
            <Switch
              id="ai-scheduling"
              checked={settings?.ai_scheduling_enabled || false}
              onCheckedChange={(checked) => handleChange('ai_scheduling_enabled', checked)}
            />
          </div>

          {/* Conditional Settings - Only show if AI Scheduling is enabled */}
          {settings?.ai_scheduling_enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              {/* Prioritize Gap Filling */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gap-filling" className="font-fredoka cursor-pointer">
                      Prioritize Filling Schedule Gaps
                    </Label>
                    <AISettingTooltip
                      title="Gap Filling Priority"
                      description="AI suggests bookings that fill empty slots between existing jobs"
                      benefits={[
                        'Maximizes earnings per day',
                        'Reduces downtime',
                        'More efficient use of your time'
                      ]}
                      considerations={[
                        'May book jobs during short breaks',
                        'Could increase fatigue on busy days'
                      ]}
                    />
                  </div>
                  <p className="text-xs text-gray-600 font-verdana mt-1">
                    AI focuses on filling empty time between bookings
                  </p>
                </div>
                <Switch
                  id="gap-filling"
                  checked={settings?.prioritize_gap_filling !== false}
                  onCheckedChange={(checked) => handleChange('prioritize_gap_filling', checked)}
                />
              </div>

              {/* Suggestion Window */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="font-fredoka">Suggestion Window</Label>
                  <AISettingTooltip
                    title="Booking Suggestion Window"
                    description="How far ahead AI can suggest booking slots"
                    benefits={[
                      'Longer windows = more booking opportunities',
                      'Better advance planning'
                    ]}
                    considerations={[
                      'Very long windows may suggest bookings too far out',
                      'Clients may prefer shorter-term bookings'
                    ]}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={settings?.suggest_days_in_advance || 14}
                    onChange={(e) => handleChange('suggest_days_in_advance', parseInt(e.target.value) || 14)}
                    className="w-24"
                  />
                  <span className="text-sm font-verdana text-gray-600">days in advance</span>
                </div>
                <p className="text-xs text-gray-500 font-verdana">
                  AI can suggest bookings up to {settings?.suggest_days_in_advance || 14} days ahead
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Availability Optimization Insights
          </CardTitle>
          <CardDescription className="font-verdana">
            AI learns from your acceptance patterns to suggest improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-verdana mb-1">Most Accepted Time</p>
              <p className="text-lg font-fredoka font-semibold text-gray-800">Weekday Mornings</p>
              <Badge className="mt-2 bg-green-600 text-white">85% acceptance rate</Badge>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-verdana mb-1">Least Accepted Time</p>
              <p className="text-lg font-fredoka font-semibold text-gray-800">Weekend Evenings</p>
              <Badge className="mt-2 bg-yellow-600 text-white">40% acceptance rate</Badge>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm font-fredoka font-semibold text-gray-800 mb-1">
              AI Recommendation:
            </p>
            <p className="text-sm font-verdana text-gray-700">
              Consider adding Tuesday 2-5pm slots. Based on your history, you accept 75% of bookings in this time range.
            </p>
          </div>

          {/* Link to Detailed Schedule */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(createPageUrl('CleanerSchedule'))}
          >
            <Clock className="w-4 h-4 mr-2" />
            Manage Detailed Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}