import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DraftBookingBanner({ userEmail }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (userEmail) {
      loadDraft();
    }
  }, [userEmail]);

  const loadDraft = async () => {
    try {
      const drafts = await base44.entities.DraftBooking.filter({ 
        client_email: userEmail 
      }, '-updated_date', 1);
      
      if (drafts.length > 0) {
        const recentDraft = drafts[0];
        // Check if not expired
        if (new Date(recentDraft.expires_at) > new Date()) {
          setDraft(recentDraft);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleResume = () => {
    if (draft && draft.cleaner_email) {
      navigate(createPageUrl('BookingFlow') + `?cleaner=${draft.cleaner_email}`);
    }
  };

  const handleDismiss = async () => {
    setDismissed(true);
    // Optionally delete the draft if user explicitly dismisses
    // await base44.entities.DraftBooking.delete(draft.id);
  };

  if (!draft || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300">
          <Clock className="w-5 h-5 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-blue-900 mb-1">
                Resume Your Booking
              </p>
              <p className="text-sm text-blue-700">
                You have an incomplete booking with {draft.cleaner_email?.split('@')[0] || 'a cleaner'}. 
                Pick up where you left off!
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                onClick={handleResume}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Resume
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-blue-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}