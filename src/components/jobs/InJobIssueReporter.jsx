import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InJobIssueReporter({ booking }) {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issue.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Dispute.create({
        booking_id: booking.id,
        filed_by: 'cleaner',
        filed_by_email: booking.cleaner_email,
        category: 'other',
        description: `In-job issue reported: ${issue}`,
        status: 'open'
      });

      toast.success('Issue reported successfully. Support will review it.');
      setOpen(false);
      setIssue('');
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-fredoka text-2xl">Report an Issue</DialogTitle>
          <DialogDescription className="font-verdana">
            Describe any problems or unexpected situations during the job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue" className="font-fredoka font-semibold">
              Issue Description *
            </Label>
            <Textarea
              id="issue"
              placeholder="Describe the issue you encountered..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={5}
              className="font-verdana"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm font-verdana">
            <p className="font-semibold mb-1">Common Issues:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Client not present when expected</li>
              <li>Additional work requested beyond scope</li>
              <li>Unsafe conditions or hazards</li>
              <li>Damaged or missing items</li>
              <li>Access issues (locked doors, pets, etc.)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}