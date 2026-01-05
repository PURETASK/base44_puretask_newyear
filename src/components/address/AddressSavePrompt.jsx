import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressSavePrompt({ address, latitude, longitude, userEmail, onAddressSaved }) {
  const [saving, setSaving] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const handleSaveAddress = async () => {
    if (!address || !latitude || !longitude || !userEmail) return;

    setSaving(true);
    try {
      // Check if user already has a default address
      const profiles = await base44.entities.ClientProfile.filter({
        user_email: userEmail
      });

      if (profiles.length > 0) {
        const profile = profiles[0];
        
        // Only show if they don't have a default address yet
        if (!profile.default_address) {
          await base44.entities.ClientProfile.update(profile.id, {
            default_address: address,
            latitude: latitude,
            longitude: longitude
          });

          setSavedAddress(address);
          
          if (onAddressSaved) {
            onAddressSaved(address);
          }
        } else {
          // They already have an address, dismiss
          setDismissed(true);
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    setSaving(false);
  };

  if (dismissed || savedAddress) return null;

  return (
    <AnimatePresence>
      {address && latitude && longitude && !savedAddress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Save this address for future bookings?</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    We'll auto-fill this address next time to make booking faster
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveAddress}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {saving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save Address
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDismissed(true)}
                      className="text-slate-600"
                    >
                      Not now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {savedAddress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <Save className="w-5 h-5" />
                <p className="font-semibold">Address saved! We'll remember this for next time.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}