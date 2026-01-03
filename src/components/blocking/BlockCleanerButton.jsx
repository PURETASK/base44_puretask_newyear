import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ban, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BlockCleanerButton({ cleanerEmail, clientEmail, onBlocked }) {
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for blocking this cleaner');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.BlockedCleaner.create({
        client_email: clientEmail,
        cleaner_email: cleanerEmail,
        reason: reason.trim()
      });

      // Also remove from favorites if exists
      const favorites = await base44.entities.FavoriteCleaner.filter({
        client_email: clientEmail,
        cleaner_email: cleanerEmail
      });
      if (favorites.length > 0) {
        await base44.entities.FavoriteCleaner.delete(favorites[0].id);
      }

      setShowDialog(false);
      if (onBlocked) onBlocked();
    } catch (error) {
      console.error('Error blocking cleaner:', error);
      alert('Failed to block cleaner. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <Ban className="w-4 h-4 mr-2" />
        Block Cleaner
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block This Cleaner?</DialogTitle>
            <DialogDescription>
              This cleaner will no longer appear in your search results and cannot accept your bookings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reason for blocking (required)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you're blocking this cleaner..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlock}
                disabled={loading || !reason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Blocking...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Block Cleaner
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}