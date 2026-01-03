import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, CheckCircle, AlertCircle, Image as ImageIcon, 
  FileText, Camera, Loader2, Eye, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EnhancedVerificationUpload({ user, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewUrls, setPreviewUrls] = useState({
    id_front: user?.kyc_documents?.id_front || null,
    id_back: user?.kyc_documents?.id_back || null,
    selfie: user?.kyc_documents?.selfie || null
  });
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [error, setError] = useState('');

  const documentTypes = [
    {
      key: 'id_front',
      label: 'ID Front',
      description: 'Front of government-issued ID',
      icon: FileText,
      requirements: [
        'Clear, readable text',
        'All corners visible',
        'No glare or shadows',
        'Valid government ID'
      ]
    },
    {
      key: 'id_back',
      label: 'ID Back',
      description: 'Back of government-issued ID',
      icon: FileText,
      requirements: [
        'Clear, readable text',
        'All corners visible',
        'Barcode visible (if present)',
        'No obstructions'
      ]
    },
    {
      key: 'selfie',
      label: 'Selfie with ID',
      description: 'Photo of you holding your ID',
      icon: Camera,
      requirements: [
        'Your face clearly visible',
        'ID visible and readable',
        'Good lighting',
        'No filters or edits'
      ]
    }
  ];

  const validateFile = (file) => {
    // File size check (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    // File type check
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'File must be JPEG, PNG, or WebP';
    }

    return null;
  };

  const handleFileUpload = async (docType, file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [docType]: 0 }));

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => ({ ...prev, [docType]: e.target.result }));
      };
      reader.readAsDataURL(file);

      // Upload to Base44
      setUploadProgress(prev => ({ ...prev, [docType]: 50 }));
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploadProgress(prev => ({ ...prev, [docType]: 75 }));

      // Update user record
      const currentDocs = user.kyc_documents || {};
      const updatedDocs = { ...currentDocs, [docType]: file_url };

      await base44.auth.updateMe({
        kyc_documents: updatedDocs,
        kyc_documents_submitted: true,
        kyc_status: 'pending' // Set to pending review
      });

      setUploadProgress(prev => ({ ...prev, [docType]: 100 }));
      
      // Success - trigger callback
      setTimeout(() => {
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[docType];
          return updated;
        });
        if (onUploadComplete) onUploadComplete();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload ${docType}: ${error.message}`);
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[docType];
        return updated;
      });
    }

    setUploading(false);
  };

  const handleRemoveDocument = async (docType) => {
    try {
      const currentDocs = user.kyc_documents || {};
      const updatedDocs = { ...currentDocs };
      delete updatedDocs[docType];

      await base44.auth.updateMe({
        kyc_documents: updatedDocs,
        kyc_documents_submitted: Object.keys(updatedDocs).length === 3
      });

      setPreviewUrls(prev => ({ ...prev, [docType]: null }));
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error('Remove error:', error);
      setError('Failed to remove document');
    }
  };

  const allDocsUploaded = Object.values(previewUrls).every(url => url !== null);
  const kycStatus = user?.kyc_status || 'not_submitted';

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={`border-2 ${
        kycStatus === 'approved' ? 'bg-green-50 border-green-300' :
        kycStatus === 'pending' ? 'bg-blue-50 border-blue-300' :
        kycStatus === 'rejected' ? 'bg-red-50 border-red-300' :
        'bg-amber-50 border-amber-300'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {kycStatus === 'approved' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {kycStatus === 'pending' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
            {kycStatus === 'rejected' && <AlertCircle className="w-6 h-6 text-red-600" />}
            {kycStatus === 'not_submitted' && <Upload className="w-6 h-6 text-amber-600" />}
            
            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                {kycStatus === 'approved' && 'Verification Approved'}
                {kycStatus === 'pending' && 'Verification Under Review'}
                {kycStatus === 'rejected' && 'Verification Rejected - Please Resubmit'}
                {kycStatus === 'not_submitted' && 'Verification Required'}
              </p>
              <p className="text-sm text-slate-600">
                {kycStatus === 'approved' && 'Your identity has been verified. You can now accept bookings.'}
                {kycStatus === 'pending' && 'Our team is reviewing your documents. This typically takes 24-48 hours.'}
                {kycStatus === 'rejected' && 'Please upload new, clear documents that meet the requirements.'}
                {kycStatus === 'not_submitted' && 'Upload your ID documents to start accepting cleaning jobs.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-900">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {documentTypes.map((docType) => {
          const Icon = docType.icon;
          const isUploaded = !!previewUrls[docType.key];
          const progress = uploadProgress[docType.key];

          return (
            <Card
              key={docType.key}
              className={`border-2 transition-all ${
                isUploaded 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-slate-200 hover:border-emerald-300 hover:shadow-lg'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className={`w-5 h-5 ${isUploaded ? 'text-green-600' : 'text-slate-600'}`} />
                  {docType.label}
                  {isUploaded && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
                </CardTitle>
                <p className="text-sm text-slate-600">{docType.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview or Upload Area */}
                {isUploaded ? (
                  <div className="relative">
                    <img
                      src={previewUrls[docType.key]}
                      alt={docType.label}
                      className="w-full h-40 object-cover rounded-lg border-2 border-green-300 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedPreview({ type: docType.key, url: previewUrls[docType.key] })}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/90 hover:bg-white"
                        onClick={() => setSelectedPreview({ type: docType.key, url: previewUrls[docType.key] })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {kycStatus !== 'approved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => handleRemoveDocument(docType.key)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">Click to upload</p>
                      <p className="text-xs text-slate-500">JPEG, PNG, WebP (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(docType.key, file);
                      }}
                      disabled={uploading || kycStatus === 'approved'}
                    />
                  </label>
                )}

                {/* Upload Progress */}
                {progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Uploading...</span>
                      <span className="font-semibold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-emerald-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">Requirements:</p>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {docType.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submission Status */}
      {allDocsUploaded && kycStatus === 'pending' && (
        <Card className="bg-blue-50 border-2 border-blue-300">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Under Review</h3>
            <p className="text-slate-600 mb-4">
              Your documents have been submitted and are being reviewed by our team.
              You'll receive an email notification once verification is complete.
            </p>
            <Badge className="bg-blue-600 text-white">
              Expected review time: 24-48 hours
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Modal */}
      {selectedPreview && (
        <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {documentTypes.find(d => d.key === selectedPreview.type)?.label}
              </DialogTitle>
            </DialogHeader>
            <img
              src={selectedPreview.url}
              alt="Document preview"
              className="w-full h-auto rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}