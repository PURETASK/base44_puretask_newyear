import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';

export default function RateLimitError({ onRetry }) {
  return (
    <Alert className="border-amber-500 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold mb-1">Too many requests</p>
            <p className="text-sm">Please wait a moment before trying again. The system is processing your previous requests.</p>
          </div>
          <Clock className="w-5 h-5 text-amber-500 ml-4" />
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function handleRateLimitError(error, setError) {
  if (error.response?.status === 429) {
    setError('Too many requests. Please wait a moment and try again.');
    return true;
  }
  return false;
}