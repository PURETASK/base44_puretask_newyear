import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Smartphone, Bell } from 'lucide-react';

export default function ReengagementPreview({ settings, cleanerName }) {
  const template = settings?.custom_template || 
    "Hi {client_name}! I noticed it's been a while since your last cleaning. I'd love to help you get your space refreshed again! {discount_text} - {cleaner_name}";

  const discountPct = settings?.discount_percentage || 0;
  const discountText = discountPct > 0 
    ? `Book now and get ${discountPct}% off your next cleaning!` 
    : '';

  const previewMessage = template
    .replace(/{client_name}/g, 'Sarah')
    .replace(/{cleaner_name}/g, cleanerName || 'Your cleaner')
    .replace(/{discount_text}/g, discountText);

  const channels = settings?.channels || ['email', 'in_app'];

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-purple-50">
        <CardTitle className="font-fredoka text-lg flex items-center gap-2">
          📧 Message Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-white border-2 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-verdana whitespace-pre-wrap">
            {previewMessage}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <p className="text-sm text-gray-600 font-verdana w-full mb-1">Will be sent via:</p>
          {channels.map(channel => (
            <Badge key={channel} variant="outline" className="gap-1">
              {channel === 'sms' && <Smartphone className="w-3 h-3" />}
              {channel === 'email' && <Mail className="w-3 h-3" />}
              {channel === 'in_app' && <Bell className="w-3 h-3" />}
              {channel}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}