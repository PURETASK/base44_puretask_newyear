
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/api/entities';
import { CleanerProfile } from '@/api/entities';
import { Shield, MapPin, Star, Award, CheckCircle, FileText } from 'lucide-react';
import ReliabilityMeter from '../reliability/ReliabilityMeter';

export default function CleanerDetailsModal({ cleaner, profile, onClose, onUpdate }) {
  if (!cleaner) return null;

  const handleApproveKYC = async () => {
    await User.update(cleaner.id, { kyc_status: 'approved' });
    onUpdate();
  };

  const handleRejectKYC = async () => {
    await User.update(cleaner.id, { kyc_status: 'rejected' });
    onUpdate();
  };

  const handleApproveBGC = async () => {
    await User.update(cleaner.id, { background_check_status: 'approved' });
    onUpdate();
  };

  const handleRejectBGC = async () => {
    await User.update(cleaner.id, { background_check_status: 'rejected' });
    onUpdate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {cleaner.full_name?.[0]}
            </div>
            {cleaner.full_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Existing KYC and BGC Cards */}
              <div className="space-y-6">
                {/* KYC Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">KYC Verification</h3>
                      </div>
                      <Badge className={
                        cleaner.kyc_status === 'approved' ? 'bg-emerald-500' :
                        cleaner.kyc_status === 'rejected' ? 'bg-red-500' :
                        'bg-amber-500'
                      }>
                        {cleaner.kyc_status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      {cleaner.id_front_url && (
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">ID Front</p>
                          <img
                            src={cleaner.id_front_url}
                            alt="ID Front"
                            className="w-full h-40 object-cover rounded-lg border-2 border-slate-200"
                          />
                        </div>
                      )}
                      {cleaner.id_back_url && (
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">ID Back</p>
                          <img
                            src={cleaner.id_back_url}
                            alt="ID Back"
                            className="w-full h-40 object-cover rounded-lg border-2 border-slate-200"
                          />
                        </div>
                      )}
                      {cleaner.selfie_url && (
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Selfie</p>
                          <img
                            src={cleaner.selfie_url}
                            alt="Selfie"
                            className="w-full h-40 object-cover rounded-lg border-2 border-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    {cleaner.kyc_status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleApproveKYC}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                          Approve KYC
                        </Button>
                        <Button
                          onClick={handleRejectKYC}
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300"
                        >
                          Reject KYC
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Background Check Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-lg">Background Check</h3>
                      </div>
                      <Badge className={
                        cleaner.background_check_status === 'approved' ? 'bg-emerald-500' :
                        cleaner.background_check_status === 'rejected' ? 'bg-red-500' :
                        'bg-amber-500'
                      }>
                        {cleaner.background_check_status}
                      </Badge>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-slate-600">
                        Background check should verify criminal records, employment history, and identity confirmation.
                      </p>
                    </div>

                    {cleaner.background_check_status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleApproveBGC}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                          Approve BGC
                        </Button>
                        <Button
                          onClick={handleRejectBGC}
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300"
                        >
                          Reject BGC
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Product Verification and Insurance */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Product Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Product Preference:</span>
                      <Badge variant="outline" className="capitalize">
                        {profile?.product_preference?.replace('-', ' ') || 'Not specified'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Product Photos Verified:</span>
                      <Badge className={profile?.product_photos_verified ? 'bg-green-500' : 'bg-amber-500'}>
                        {profile?.product_photos_verified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {profile?.product_verification_photos && profile.product_verification_photos.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Product Photos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.product_verification_photos.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                        />
                      ))}
                    </div>
                    {!profile.product_photos_verified && (
                      <Button
                        onClick={async () => {
                          try {
                            await CleanerProfile.update(profile.id, {
                              product_photos_verified: true
                            });
                            onUpdate();
                            onClose();
                          } catch (error) {
                            console.error('Error verifying product photos:', error);
                          }
                        }}
                        className="w-full mt-2 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Product Photos
                      </Button>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Insurance Certificate</h3>
                  {cleaner.insurance_certificate_url ? (
                    <div className="space-y-2">
                      <a
                        href={cleaner.insurance_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">View Certificate</span>
                        </div>
                      </a>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Insurance Verified:</span>
                        <Badge className={cleaner.insurance_verified ? 'bg-green-500' : 'bg-amber-500'}>
                          {cleaner.insurance_verified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                      {!cleaner.insurance_verified && (
                        <Button
                          onClick={async () => {
                            try {
                              await User.update(cleaner.id, {
                                insurance_verified: true
                              });
                              onUpdate();
                              onClose();
                            } catch (error) {
                              console.error('Error verifying insurance:', error);
                            }
                          }}
                          className="w-full bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Insurance
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
                      No insurance certificate uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            {profile ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Email</p>
                        <p className="font-medium text-slate-900">{cleaner.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Phone</p>
                        <p className="font-medium text-slate-900">{cleaner.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Hourly Rate</p>
                        <p className="font-medium text-slate-900">${profile.hourly_rate}/hour</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Tier</p>
                        <Badge>{profile.tier}</Badge>
                      </div>
                    </div>

                    {profile.bio && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-600 mb-2">Bio</p>
                        <p className="text-slate-700">{profile.bio}</p>
                      </div>
                    )}

                    {profile.service_tags && profile.service_tags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-600 mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.service_tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.service_locations && profile.service_locations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-600 mb-2">Service Locations</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.service_locations.map((loc, idx) => (
                            <Badge key={idx} variant="outline" className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {loc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-slate-500">No profile created yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {profile ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-6">
                      <ReliabilityMeter score={profile.reliability_score} size="large" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-sm text-emerald-600 mb-1">On-Time Rate</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.on_time_rate}%</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 mb-1">Photo Compliance</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.photo_compliance_rate}%</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 mb-1">Average Rating</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.average_rating.toFixed(1)}</p>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-sm text-amber-600 mb-1">Total Jobs</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.total_jobs}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600 mb-1">Dispute Rate</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.dispute_rate}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">No-Show Rate</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.no_show_rate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-slate-500">No performance data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
