import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JobSummaryModal({ open, onOpenChange, booking, elapsedTime }) {
  const navigate = useNavigate();

  if (!booking) return null;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const actualHours = booking.actual_hours || (elapsedTime / 3600);
  const estimatedPayout = booking.snapshot_total_rate_cph 
    ? (actualHours * booking.snapshot_total_rate_cph * (booking.payout_percentage_at_accept || 0.80)).toFixed(2)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-fresh-mint" />
            </div>
            <DialogTitle className="font-fredoka text-2xl mb-2">
              Job Complete!
            </DialogTitle>
            <p className="text-gray-600 font-verdana text-sm">
              Great work! Here's a summary of your completed job.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-puretask-blue" />
                <span className="font-fredoka font-semibold text-graphite">Time Worked</span>
              </div>
              <span className="text-xl font-fredoka font-bold text-puretask-blue">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="text-sm font-verdana text-gray-700 space-y-1">
              <p>Estimated: {booking.hours}h</p>
              <p>Actual: {actualHours.toFixed(2)}h</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-fresh-mint" />
                <span className="font-fredoka font-semibold text-graphite">Estimated Payout</span>
              </div>
              <span className="text-xl font-fredoka font-bold text-fresh-mint">
                {estimatedPayout} credits
              </span>
            </div>
            <p className="text-xs font-verdana text-gray-600">
              Final amount will be calculated after client approval
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm font-verdana">
            <p className="font-semibold mb-2">What's Next?</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Client will review the completed work</li>
              <li>Photos will be verified</li>
              <li>Payment will be processed to your account</li>
              <li>You'll receive a notification when approved</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl('CleanerPayouts'))}
            className="flex-1"
          >
            View Earnings
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl('CleanerSchedule'))}
            className="flex-1 brand-gradient"
          >
            Back to Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}