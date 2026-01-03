import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DisputeWindowEnforcement, { useDisputeWindow } from './DisputeWindowEnforcement';
import DisputeProcessExplainer from './DisputeProcessExplainer';

export default function DisputeForm({ booking, onDisputeFiled }) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const disputeWindow = useDisputeWindow(booking);

  const categories = [
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'no_show', label: 'No Show' },
    { value: 'late_arrival', label: 'Late Arrival' },
    { value: 'damage', label: 'Damage/Breakage' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      setEvidencePhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create dispute
      // NOTE: user_email and filed_by were removed from props per outline.
      // This implementation assumes these values are either inferred by the backend/SDK
      // or are not strictly required for this specific interaction.
      await base44.entities.Dispute.create({
        booking_id: booking.id,
        category,
        description: description.trim(),
        evidence_photos: evidencePhotos,
        status: 'open'
      });

      // Update booking status
      await base44.entities.Booking.update(booking.id, {
        status: 'disputed'
      });

      // Log event
      // NOTE: user_email was removed from props per outline.
      await base44.entities.Event.create({
        booking_id: booking.id,
        event_type: 'dispute_opened',
        details: `Dispute filed: ${category}`,
        timestamp: new Date().toISOString()
      });

      // Notify admin
      try {
        // NOTE: filed_by and user_email removed from email body as they are no longer in props.
        await base44.integrations.Core.SendEmail({
          to: 'admin@puretask.com', // Replace with actual admin email
          subject: '🚨 New Dispute Filed',
          body: `A new dispute has been filed:

Booking ID: ${booking.id}
Category: ${category}
Description: ${description}

Please review in the admin dashboard.`
        });
      } catch (notifErr) {
        console.error('Failed to notify admin:', notifErr);
      }

      if (onDisputeFiled) onDisputeFiled();
    } catch (error) {
      console.error('Error filing dispute:', error);
      alert('Failed to file dispute. Please try again.');
    }
    setLoading(false);
  };

  const handleClearForm = () => {
    setCategory('');
    setDescription('');
    setEvidencePhotos([]);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          File a Dispute
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <DisputeProcessExplainer />

        <p className="text-sm text-slate-700">
          Report an issue with this booking. Our support team will review and respond within 24 hours.
        </p>

        {/* Dispute Window Enforcement */}
        <DisputeWindowEnforcement booking={booking}>
          {(windowStatus, hasExistingDispute) => (
            <>
              {/* Show form only if can dispute */}
              {windowStatus.canDispute && !hasExistingDispute ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>Issue Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide detailed information about the issue..."
                        rows={6}
                        className="mt-2"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {description.length}/1000 characters
                      </p>
                    </div>

                    <div>
                      <Label>Evidence Photos (Optional)</Label>
                      <div className="mt-2 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        {uploading && (
                          <p className="text-sm text-blue-600 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </p>
                        )}
                        {evidencePhotos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {evidencePhotos.map((url, idx) => (
                              <div key={idx} className="relative">
                                <img src={url} alt="Evidence" className="w-20 h-20 object-cover rounded border" />
                                <button
                                  onClick={() => setEvidencePhotos(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-900">
                        <strong>What happens next:</strong> Our team will review your dispute within 24 hours.
                        We may contact both parties for additional information. Resolution typically takes 2-3 business days.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleClearForm}
                        className="flex-1"
                        disabled={loading}
                      >
                        Clear Form
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={loading || !category || !description.trim()}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Filing Dispute...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Submit Dispute
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <Alert className="border-slate-200 bg-slate-50">
                  <AlertDescription className="text-slate-700">
                    {windowStatus.notYetCompleted &&
                      'Dispute filing will be available after job completion.'}
                    {windowStatus.expired &&
                      'The dispute window has closed. Please contact support for assistance.'}
                    {hasExistingDispute &&
                      'A dispute has already been filed for this booking.'}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </DisputeWindowEnforcement>
      </CardContent>
    </Card>
  );
}