import React, { useState } from 'react';
import { CleanerProfile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck } from 'lucide-react';

export default function BackupCleanerFinder({ booking, onReassign }) {
  const [finding, setFinding] = useState(false);
  const [foundCleaner, setFoundCleaner] = useState(null);

  const findBackup = async () => {
    setFinding(true);
    // In a real app, this would be a more complex query on the backend.
    // We'd filter by location, availability for the booking time, and tier.
    const allCleaners = await CleanerProfile.list('-reliability_score');
    
    const backup = allCleaners.find(c => 
      c.user_email !== booking.cleaner_email && 
      c.user_email !== booking.client_email &&
      c.is_active
      // Add availability check here in a real implementation
    );

    if (backup) {
      setFoundCleaner(backup);
      onReassign(backup.user_email);
    }
    setFinding(false);
  };

  return (
    <div>
      <Button onClick={findBackup} disabled={finding}>
        {finding ? <Loader2 className="animate-spin" /> : 'Find Backup Cleaner'}
      </Button>
      {foundCleaner && (
        <div className="mt-4 p-4 bg-emerald-100 rounded-lg text-emerald-800">
          <UserCheck className="w-5 h-5 mr-2 inline-block" />
          Reassigned to {foundCleaner.user_email.split('@')[0]}
        </div>
      )}
    </div>
  );
}