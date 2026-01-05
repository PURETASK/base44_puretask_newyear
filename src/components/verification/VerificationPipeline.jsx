import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

export default function VerificationPipeline({ user, onVerificationComplete }) {
  const [kycStatus, setKycStatus] = useState('pending');
  const [bgcStatus, setBgcStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setKycStatus(user.kyc_status || 'pending');
      setBgcStatus(user.background_check_status || 'pending');
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'consider':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-red-500';
      case 'consider':
        return 'bg-amber-500';
      case 'pending':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'consider':
        return 'Under Review';
      case 'pending':
        return 'Pending Review';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KYC Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(kycStatus)}
            <div>
              <p className="font-semibold text-slate-900">Identity Verification (KYC)</p>
              <p className="text-sm text-slate-600">ID document and liveness check</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(kycStatus)} text-white`}>
            {getStatusText(kycStatus)}
          </Badge>
        </div>

        {/* Background Check Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(bgcStatus)}
            <div>
              <p className="font-semibold text-slate-900">Background Check</p>
              <p className="text-sm text-slate-600">Criminal record and employment verification</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(bgcStatus)} text-white`}>
            {getStatusText(bgcStatus)}
          </Badge>
        </div>

        {/* Overall Status Message */}
        {kycStatus === 'pending' || bgcStatus === 'pending' ? (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Verification in Progress</strong>
              <p className="text-sm mt-1">
                Your documents are being reviewed. This typically takes 24-48 hours. 
                You'll receive an email once the verification is complete.
              </p>
            </AlertDescription>
          </Alert>
        ) : kycStatus === 'approved' && bgcStatus === 'approved' ? (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900">
              <strong>Verification Complete!</strong>
              <p className="text-sm mt-1">
                You're all set to start accepting bookings on PureTask.
              </p>
            </AlertDescription>
          </Alert>
        ) : (kycStatus === 'rejected' || bgcStatus === 'rejected') ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Verification Failed</strong>
              <p className="text-sm mt-1">
                Unfortunately, we couldn't verify your account. Please contact support for more information.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Additional Review Required</strong>
              <p className="text-sm mt-1">
                Your application is under additional review. We'll contact you within 48 hours.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Timeline */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-slate-900 mb-3">Verification Process</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${kycStatus !== 'pending' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Step 1: Identity Verification</p>
                <p className="text-xs text-slate-600">ID scan and liveness detection (5-15 minutes)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${bgcStatus !== 'pending' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Step 2: Background Check</p>
                <p className="text-xs text-slate-600">Criminal records and employment verification (24-48 hours)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${(kycStatus === 'approved' && bgcStatus === 'approved') ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Step 3: Approval & Activation</p>
                <p className="text-xs text-slate-600">Account activated and ready to accept bookings</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}