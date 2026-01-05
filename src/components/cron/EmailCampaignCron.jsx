import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { processEmailCampaigns, initializeDefaultCampaigns } from '../email/EmailCampaignScheduler';

export default function EmailCampaignCron() {
  const [running, setRunning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    
    try {
      const res = await processEmailCampaigns();
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    }
    
    setRunning(false);
  };

  const handleInitialize = async () => {
    setInitializing(true);
    
    try {
      await initializeDefaultCampaigns();
      setResult({
        success: true,
        message: 'Email campaigns initialized successfully'
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    }
    
    setInitializing(false);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 mr-2 text-blue-500" />
          Email Campaign Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Process and send scheduled nurture emails to users based on their activity.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleRun}
            disabled={running || initializing}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Emails
              </>
            )}
          </Button>

          <Button
            onClick={handleInitialize}
            disabled={running || initializing}
            variant="outline"
          >
            {initializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Init...
              </>
            ) : (
              'Initialize Campaigns'
            )}
          </Button>
        </div>

        {result && (
          <Alert className={result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? 'text-emerald-900' : 'text-red-900'}>
              {result.success ? (
                result.message || `Sent ${result.emailsSent} emails with ${result.errors} errors`
              ) : (
                `Error: ${result.error}`
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600">
          <strong>Campaigns:</strong>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>Post-Booking Follow-up (review request + re-booking)</li>
            <li>Signup Nurture (welcome series for non-bookers)</li>
            <li>Subscription Upsell (after 2nd booking)</li>
            <li>Referral Reminder (after successful referral)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}