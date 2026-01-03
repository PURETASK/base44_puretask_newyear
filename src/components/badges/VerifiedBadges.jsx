import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Camera, FileCheck } from 'lucide-react';

export default function VerifiedBadges({ profile, user }) {
  // If we have user data, use it; otherwise fall back to profile-level verification flags
  const kycVerified = user?.kyc_status === 'approved' || profile?.kyc_verified;
  const bgcVerified = user?.background_check_status === 'approved' || profile?.background_check_verified;
  const insuranceVerified = user?.insurance_verified || profile?.insurance_verified;
  const photoVerified = profile?.product_photos_verified;

  return (
    <div className="flex flex-wrap gap-2">
      {kycVerified && (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
          <CheckCircle className="w-3 h-3 mr-1" />
          ID Verified
        </Badge>
      )}
      {bgcVerified && (
        <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
          <Shield className="w-3 h-3 mr-1" />
          Background Checked
        </Badge>
      )}
      {insuranceVerified && (
        <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">
          <FileCheck className="w-3 h-3 mr-1" />
          Insured
        </Badge>
      )}
      {photoVerified && (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
          <Camera className="w-3 h-3 mr-1" />
          Products Verified
        </Badge>
      )}
    </div>
  );
}