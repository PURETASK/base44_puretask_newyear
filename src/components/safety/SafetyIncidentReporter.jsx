import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Upload, Loader2, CheckCircle } from 'lucide-react';

export default function SafetyIncidentReporter({ bookingId, clientEmail, cleanerEmail, reportedBy = 'client', onSuccess }) {
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [injuriesReported, setInjuriesReported] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'harassment', label: 'Harassment or Threatening Behavior' },
    { value: 'theft', label: 'Theft or Missing Items' },
    { value: 'unsafe_pets', label: 'Unsafe Pets or Animals' },
    { value: 'biohazard', label: 'Biohazard or Unsafe Conditions' },
    { value: 'property_damage', label: 'Property Damage' },
    { value: 'threatening_behavior', label: 'Threatening Behavior' },
    { value: 'privacy_violation', label: 'Privacy Violation' },
    { value: 'other', label: 'Other Safety Concern' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setEvidenceFiles([...evidenceFiles, ...urls]);
      setUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await base44.entities.SafetyIncident.create({
        booking_id: bookingId,
        client_email: clientEmail,
        cleaner_email: cleanerEmail,
        reported_by: reportedBy,
        category,
        severity,
        description,
        evidence_urls: evidenceFiles,
        injuries_reported: injuriesReported,
        requires_escalation: severity === 'critical',
        escalation_level: severity === 'critical' ? 3 : 1,
        status: 'open',
        actions_taken: []
      });
      
      setSubmitted(true);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (error) {
      console.error('Error reporting incident:', error);
      alert('Failed to submit safety report');
    }
    
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <Card className="border-2 border-green-500">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2">
            Safety Report Submitted
          </h3>
          <p className="text-gray-600 font-verdana">
            Our safety team will review this incident and take appropriate action.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-600" />
          Report Safety Incident
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-amber-500 bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <AlertDescription className="font-verdana text-sm">
            Safety incidents are taken very seriously. False reports may result in account restrictions.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-verdana font-semibold">Incident Type *</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg font-verdana"
              required
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="font-verdana font-semibold">Severity *</Label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-3 border rounded-lg font-verdana"
            >
              <option value="medium">Medium - Concerning but not urgent</option>
              <option value="high">High - Serious issue requiring attention</option>
              <option value="critical">Critical - Immediate danger or threat</option>
            </select>
          </div>

          <div>
            <Label className="font-verdana font-semibold">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what happened in detail..."
              className="h-32 font-verdana"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="injuries"
              checked={injuriesReported}
              onChange={(e) => setInjuriesReported(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="injuries" className="font-verdana">
              Injuries were reported or occurred
            </Label>
          </div>

          <div>
            <Label className="font-verdana font-semibold">Evidence (Photos/Videos)</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="font-fredoka w-full"
                  disabled={uploading}
                  onClick={() => document.getElementById('evidence-upload').click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Evidence
                    </>
                  )}
                </Button>
              </label>
              {evidenceFiles.length > 0 && (
                <p className="text-sm text-gray-600 font-verdana mt-2">
                  {evidenceFiles.length} file(s) uploaded
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 font-fredoka text-lg py-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Submit Safety Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}