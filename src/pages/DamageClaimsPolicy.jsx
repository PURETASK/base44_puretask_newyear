import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Camera, FileText, Clock, CheckCircle, XCircle, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function DamageClaimsPolicy() {
  return (
    <div className="min-h-screen bg-soft-cloud py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-fredoka font-bold text-graphite mb-4">Damage & Claims Policy</h1>
          <p className="text-xl text-gray-600 font-verdana">How we handle property damage and claims</p>
        </motion.div>

        <div className="space-y-6">
          {/* Overview */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Shield className="w-6 h-6 text-puretask-blue" />
                Our Commitment to Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-600 font-verdana leading-relaxed">
                While damage during cleaning is rare, PureTask takes property protection seriously. All cleaners are verified, and we have clear processes for reporting and resolving damage claims.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-fresh-mint mx-auto mb-2" />
                  <p className="font-fredoka font-semibold text-graphite">Background Checked</p>
                  <p className="text-sm text-gray-600 font-verdana mt-1">All cleaners verified</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <Camera className="w-8 h-8 text-puretask-blue mx-auto mb-2" />
                  <p className="font-fredoka font-semibold text-graphite">Photo Documentation</p>
                  <p className="text-sm text-gray-600 font-verdana mt-1">Before/after proof</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-fredoka font-semibold text-graphite">48-Hour Window</p>
                  <p className="text-sm text-gray-600 font-verdana mt-1">Fast claims process</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Report Damage */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                How to Report Damage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-fredoka font-semibold text-graphite mb-1">Report Within 48 Hours</h3>
                    <p className="text-gray-600 font-verdana">
                      Damage must be reported within 48 hours of cleaning completion. After this window, claims cannot be processed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-fredoka font-semibold text-graphite mb-1">Open a Dispute</h3>
                    <p className="text-gray-600 font-verdana">
                      In your booking details, click "There's a problem" to open a formal dispute. This pauses payment release.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-fredoka font-semibold text-graphite mb-1">Provide Evidence</h3>
                    <p className="text-gray-600 font-verdana mb-2">
                      Upload clear photos of the damage and describe what happened. Include:
                    </p>
                    <ul className="text-sm text-gray-600 font-verdana space-y-1 ml-4">
                      <li>• Photos of the damaged item/area</li>
                      <li>• Description of the damage</li>
                      <li>• Estimated repair/replacement cost</li>
                      <li>• Any receipts or quotes for repairs</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-fredoka font-semibold text-graphite mb-1">Review & Resolution</h3>
                    <p className="text-gray-600 font-verdana">
                      Our support team will review within 24-48 hours and work with both parties to reach a fair resolution.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage & Limitations */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <FileText className="w-6 h-6 text-purple-600" />
                Coverage & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">What's Covered</h3>
                <ul className="space-y-2 font-verdana text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                    <span>Accidental damage caused during cleaning (broken items, spills on furniture)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                    <span>Damage to surfaces from improper cleaning product use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-fresh-mint mt-0.5 flex-shrink-0" />
                    <span>Lost or misplaced items during service</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Not Covered</h3>
                <ul className="space-y-2 font-verdana text-gray-600">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Pre-existing damage or wear and tear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Damage reported after 48-hour window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Items not visible or mentioned in before photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>High-value items over $500 without prior notice</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 mt-4">
                <p className="text-sm text-amber-900 font-verdana">
                  <strong>Tip:</strong> For valuable or fragile items, mention them in booking notes and request extra care. Consider moving items before service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resolution Process */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Scale className="w-6 h-6 text-fresh-mint" />
                Resolution Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-600 font-verdana leading-relaxed mb-4">
                PureTask reviews all claims fairly and transparently:
              </p>
              <ul className="space-y-3 font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">Step 1</Badge>
                  <span>Evidence review (photos, cleaner notes, before/after comparison)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">Step 2</Badge>
                  <span>Contact both parties for statements and additional information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">Step 3</Badge>
                  <span>Determine responsibility and appropriate compensation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-puretask-blue text-white mt-1 rounded-full font-fredoka">Step 4</Badge>
                  <span>Process refunds/payouts and close the dispute</span>
                </li>
              </ul>

              <p className="text-sm text-gray-500 font-verdana italic mt-6">
                Resolution time: Typically 24-48 hours for straightforward cases; complex claims may take 3-5 business days.
              </p>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-8 text-center">
              <h3 className="font-fredoka font-bold text-graphite text-xl mb-2">Need Help with a Claim?</h3>
              <p className="text-gray-600 font-verdana mb-4">
                Our support team is here to assist with damage reports and dispute resolution.
              </p>
              <p className="font-verdana text-puretask-blue font-semibold mb-2">claims@puretask.com</p>
              <p className="text-sm text-gray-500 font-verdana">Response time: Within 24 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}