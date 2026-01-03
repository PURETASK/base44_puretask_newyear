import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { processEmailCampaigns } from './EmailCampaignScheduler';

export default function EmailCampaignCron() {
  const [running, setRunning] = useState(false);
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
          Processes and sends scheduled email campaigns to users based on their actions.
        </p>

        <Button
          onClick={handleRun}
          disabled={running}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Emails...
            </>
          ) : (
            'Run Email Campaigns'
          )}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? 'text-emerald-900' : 'text-red-900'}>
              {result.success ? (
                <>
                  <strong>Success!</strong> Sent {result.emailsSent} emails{result.errors > 0 && `, ${result.errors} errors`}.
                </>
              ) : (
                <>
                  <strong>Error:</strong> {result.error}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}