import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Shield, CheckCircle, Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function PhotoConsent() {
  return (
    <div className="min-h-screen bg-soft-cloud py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-fredoka font-bold text-graphite mb-4">Photo Proof & Consent</h1>
          <p className="text-xl text-gray-600 font-verdana">Transparency through before/after documentation</p>
        </motion.div>

        <div className="space-y-6">
          {/* Why We Require Photos */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Eye className="w-6 h-6 text-puretask-blue" />
                Why Photo Proof Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-600 font-verdana leading-relaxed">
                PureTask's photo proof system is central to our trust model. Before/after photos ensure:
              </p>
              <ul className="space-y-2 font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                  <span><strong>Transparency:</strong> Clients see exactly what was cleaned</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                  <span><strong>Quality:</strong> Visual proof before payment is released</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                  <span><strong>Protection:</strong> Resolves disputes with objective evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                  <span><strong>Reliability:</strong> Photo compliance boosts cleaner scores</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Photo Requirements */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Camera className="w-6 h-6 text-fresh-mint" />
                Photo Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <h3 className="font-fredoka font-semibold text-graphite mb-2">Minimum Requirements</h3>
                  <ul className="space-y-1 font-verdana text-gray-600 text-sm">
                    <li>• <strong>Minimum 3 photos total</strong> (before + after combined)</li>
                    <li>• <strong>Required for:</strong> Deep cleaning and move-out services</li>
                    <li>• <strong>Recommended for:</strong> All bookings to maximize trust</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <h3 className="font-fredoka font-semibold text-graphite mb-2">Photo Guidelines</h3>
                  <ul className="space-y-1 font-verdana text-gray-600 text-sm">
                    <li>• Good lighting and clear focus</li>
                    <li>• Show the cleaned area from similar angles (before/after)</li>
                    <li>• No identifying client information visible (documents, mail, etc.)</li>
                    <li>• Geotagged and timestamped automatically by the app</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Photos Are Protected */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Lock className="w-6 h-6 text-purple-600" />
                Photo Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Secure Storage</h3>
                <p className="text-gray-600 font-verdana">
                  All photos are stored in private AWS S3 buckets with signed, expiring URLs. Only authorized parties (client, cleaner, admin) can view them.
                </p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">EXIF Data Scrubbing</h3>
                <p className="text-gray-600 font-verdana">
                  Metadata (GPS coordinates, device info) is removed before storage to protect privacy, except for verification timestamps.
                </p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Access Restrictions</h3>
                <p className="text-gray-600 font-verdana">
                  Photos are only visible to the booking client, assigned cleaner, and platform admins (for dispute resolution).
                </p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Retention Period</h3>
                <p className="text-gray-600 font-verdana">
                  Photos are retained for 90 days after booking completion, then automatically deleted unless a dispute is open.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Consent */}
          <Card className="border-0 shadow-xl rounded-2xl border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Shield className="w-6 h-6 text-puretask-blue" />
                Client Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-600 font-verdana leading-relaxed">
                By booking a cleaning service on PureTask, you consent to:
              </p>
              <ul className="space-y-2 font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">1</Badge>
                  <span>Cleaners photographing your home's common areas before and after cleaning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">2</Badge>
                  <span>Photos being stored securely and shared with you for approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">3</Badge>
                  <span>Photos being used to resolve disputes if issues arise</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 font-verdana italic mt-4">
                Note: You can request specific areas NOT be photographed in your booking notes (e.g., bedrooms with personal items). Cleaners will respect these requests.
              </p>
            </CardContent>
          </Card>

          {/* Cleaner Consent */}
          <Card className="border-0 shadow-xl rounded-2xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Shield className="w-6 h-6 text-fresh-mint" />
                Cleaner Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-600 font-verdana leading-relaxed">
                By accepting bookings on PureTask, cleaners consent to:
              </p>
              <ul className="space-y-2 font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <Badge className="bg-fresh-mint text-white mt-1 rounded-full font-fredoka">1</Badge>
                  <span>Uploading before/after photos as part of the service completion process</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-fresh-mint text-white mt-1 rounded-full font-fredoka">2</Badge>
                  <span>Photos being shared with the client for approval and quality verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-fresh-mint text-white mt-1 rounded-full font-fredoka">3</Badge>
                  <span>Photo compliance being factored into Reliability Score calculations</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 font-verdana italic mt-4">
                Benefits: Photo compliance increases your score by +10 points and builds client trust.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-8 text-center">
              <h3 className="font-fredoka font-bold text-graphite text-xl mb-2">Questions About Photo Policy?</h3>
              <p className="text-gray-600 font-verdana mb-4">
                We're here to help clarify how photos protect both clients and cleaners.
              </p>
              <p className="font-verdana text-puretask-blue font-semibold">support@puretask.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}