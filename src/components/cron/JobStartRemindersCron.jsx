import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sendJobStartReminders } from '../notifications/JobStartNotifications';

export default function JobStartRemindersCron() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);

    const res = await sendJobStartReminders();
    setResult(res);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          Send Job Start Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Sends automated reminders to cleaners about upcoming jobs and check-in requirements.
          Should be run every 5 minutes.
        </p>

        <Button 
          onClick={handleRun}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Send Reminders Now
            </>
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Success!' : 'Error'}
              </p>
            </div>
            {result.success && result.sent && (
              <div className="text-sm text-green-800 space-y-1">
                <p>• 30-min warnings: {result.sent.thirtyMin}</p>
                <p>• Start-time reminders: {result.sent.startTime}</p>
                <p>• Late reminders: {result.sent.fifteenAfter}</p>
              </div>
            )}
            {result.error && (
              <p className="text-sm text-red-800">{result.error}</p>
            )}
          </div>
        )}

        <p className="text-xs text-slate-500">
          <strong>Recommended:</strong> Run every 5 minutes via cron job or scheduled task.
        </p>
      </CardContent>
    </Card>
  );
}