import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ToggleVerifiedBadge({ cleaner, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !cleaner.admin_verified;
      await base44.entities.CleanerProfile.update(cleaner.id, {
        admin_verified: newStatus
      });
      
      toast.success(`Verified badge ${newStatus ? 'enabled' : 'disabled'} for ${cleaner.full_name}`);
      
      if (onUpdate) {
        onUpdate({ ...cleaner, admin_verified: newStatus });
      }
    } catch (error) {
      console.error('Error toggling verified badge:', error);
      toast.error('Failed to update verified status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {cleaner.admin_verified ? (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-fredoka">
          <Award className="w-4 h-4 mr-1" />
          Verified
        </Badge>
      ) : (
        <Badge variant="outline" className="text-gray-500 font-fredoka">
          Not Verified
        </Badge>
      )}
      
      <Button
        onClick={handleToggle}
        disabled={loading}
        size="sm"
        variant={cleaner.admin_verified ? "outline" : "default"}
        className="font-fredoka"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          cleaner.admin_verified ? 'Remove Badge' : 'Verify'
        )}
      </Button>
    </div>
  );
}