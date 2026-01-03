import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Zap, Clock, CheckCircle, Info, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstantBookSettings({ cleanerProfile, onUpdate }) {
  const [enabled, setEnabled] = useState(cleanerProfile.instant_book_enabled || false);
  const [hours, setHours] = useState(cleanerProfile.instant_book_hours || 48);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        instant_book_enabled: enabled,
        instant_book_hours: hours
      });
      alert('Instant book settings saved!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving instant book settings:', error);
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-600" />
            Instant Book Settings
          </CardTitle>
          <motion.div
            animate={enabled ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Badge className={`font-fredoka ${
              enabled ? 'bg-fresh-mint text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {enabled ? 'ACTIVE' : 'OFF'}
            </Badge>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
          <Info className="w-5 h-5 text-puretask-blue" />
          <AlertTitle className="font-fredoka font-bold text-graphite">What is Instant Book?</AlertTitle>
          <AlertDescription className="font-verdana text-gray-700 mt-2">
            When enabled, bookings within your set timeframe are automatically accepted. 
            This helps you get more jobs without constantly checking the marketplace!
          </AlertDescription>
        </Alert>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-amber-200">
          <div>
            <p className="font-fredoka font-bold text-graphite mb-1">Enable Instant Book</p>
            <p className="text-sm text-gray-600 font-verdana">
              Auto-accept bookings matching your availability
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-fresh-mint"></div>
          </label>
        </div>

        {/* Hours Configuration */}
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-fredoka font-semibold text-graphite mb-3 block">
                Auto-Accept Timeframe
              </label>
              
              <div className="grid grid-cols-4 gap-3">
                {[24, 48, 72, 96].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`p-4 rounded-2xl border-2 font-fredoka font-bold transition-all ${
                      hours === h
                        ? 'border-amber-500 bg-amber-100 text-amber-700 shadow-lg'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-2" />
                    {h}h
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 font-verdana mt-3 text-center">
                Bookings scheduled within <strong>{hours} hours</strong> will be automatically accepted
              </p>
            </div>

            {/* Custom Hours */}
            <div>
              <label className="text-sm font-fredoka font-medium text-graphite mb-2 block">
                Or enter custom hours
              </label>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 48)}
                min={1}
                max={168}
                className="font-verdana"
              />
              <p className="text-xs text-gray-500 font-verdana mt-1">
                Max: 168 hours (1 week)
              </p>
            </div>

            {/* Benefits */}
            <Card className="border-2 border-green-200 bg-green-50 rounded-2xl">
              <CardContent className="p-4">
                <p className="font-fredoka font-semibold text-graphite mb-3 text-sm">Benefits of Instant Book:</p>
                <div className="space-y-2">
                  {[
                    'Get 30% more bookings on average',
                    'Appear higher in search results',
                    'Build your calendar faster',
                    'Clients love the convenience'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-verdana text-gray-700">
                      <CheckCircle className="w-4 h-4 text-fresh-mint" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Alert className="border-amber-300 bg-amber-50 rounded-2xl">
              <AlertDescription className="text-sm text-amber-900 font-verdana">
                ⚠️ Make sure your availability calendar is up to date! Instant bookings will only be accepted for times you've marked as available.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="brand-gradient text-white rounded-full font-fredoka font-semibold shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}