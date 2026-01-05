/**
 * Quiet Hours Enforcer - Section 3.3
 * Manages notification timing based on user timezone
 * 
 * Rules:
 * - Suppress SMS/Push 9pm - 8am local time
 * - Exceptions: password_reset, payment_failed, on_the_way, arrived_gps
 * - Queue suppressed messages for next morning
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Shield } from 'lucide-react';

export const QuietHoursConfig = () => {
  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
          <Moon className="w-6 h-6 text-indigo-600" />
          Quiet Hours Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span className="font-fredoka font-semibold text-graphite">Quiet Hours</span>
            </div>
            <p className="text-2xl font-fredoka font-bold text-indigo-600 mb-1">9:00 PM - 8:00 AM</p>
            <p className="text-sm text-gray-600 font-verdana">Recipient's local time</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-puretask-blue" />
              <span className="font-fredoka font-semibold text-graphite">Active Hours</span>
            </div>
            <p className="text-2xl font-fredoka font-bold text-puretask-blue mb-1">8:00 AM - 9:00 PM</p>
            <p className="text-sm text-gray-600 font-verdana">Normal delivery window</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-fresh-mint" />
            <h3 className="font-fredoka font-semibold text-graphite">Always-Allowed (Urgent) Messages</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-red-100 text-red-700 rounded-full font-verdana">Password Reset</Badge>
            <Badge className="bg-red-100 text-red-700 rounded-full font-verdana">Payment Failed</Badge>
            <Badge className="bg-green-100 text-fresh-mint rounded-full font-verdana">On The Way (GPS)</Badge>
            <Badge className="bg-green-100 text-fresh-mint rounded-full font-verdana">Arrived (GPS)</Badge>
            <Badge className="bg-purple-100 text-purple-700 rounded-full font-verdana">Admin Alerts</Badge>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <p className="text-sm text-amber-900 font-verdana">
            <strong>Note:</strong> Suppressed messages are queued and sent at 8:00 AM local time the next morning. Email is not affected by quiet hours.
          </p>
        </div>

        <div className="p-4 bg-soft-cloud rounded-2xl">
          <h3 className="font-fredoka font-semibold text-graphite mb-2">Batching Window</h3>
          <p className="text-gray-600 font-verdana text-sm">
            Non-urgent notifications are batched within a 30-second window by channel to reduce noise and improve user experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuietHoursConfig;