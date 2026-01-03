import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
          <h1 className="text-5xl font-fredoka font-bold text-graphite mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 font-verdana">How we protect and handle your information</p>
          <p className="text-sm text-gray-500 font-verdana mt-2">Last Updated: November 2024</p>
        </motion.div>

        <div className="space-y-6">
          {/* Information We Collect */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Database className="w-6 h-6 text-puretask-blue" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Account Information</h3>
                <p className="text-gray-600 font-verdana">Name, email, phone number, and payment details when you create an account.</p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Location Data (GPS)</h3>
                <p className="text-gray-600 font-verdana">
                  <strong>Why:</strong> To verify cleaners arrive on-time at the correct address.<br/>
                  <strong>When:</strong> Only during check-in and check-out for active bookings.<br/>
                  <strong>Consent:</strong> You grant explicit permission when booking or accepting jobs.
                </p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Photos</h3>
                <p className="text-gray-600 font-verdana">Before/after cleaning photos uploaded by cleaners, stored securely with signed URLs and expiring links.</p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Service Information</h3>
                <p className="text-gray-600 font-verdana">Booking details, addresses, cleaning preferences, reliability scores, ratings, and reviews.</p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Eye className="w-6 h-6 text-fresh-mint" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Facilitate bookings between clients and cleaners</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Process payments and payouts securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Calculate and display Reliability Scores for quality assurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Verify GPS check-ins for trust and transparency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Send booking confirmations, reminders, and receipts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Resolve disputes and provide customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fresh-mint mt-1">✓</span>
                  <span>Improve platform security and prevent fraud</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Lock className="w-6 h-6 text-purple-600" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Encryption</h3>
                <p className="text-gray-600 font-verdana">All data is encrypted in transit (SSL/TLS) and at rest using industry-standard protocols.</p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Access Controls</h3>
                <p className="text-gray-600 font-verdana">Role-based access ensures cleaners, clients, and admins only see data relevant to their role.</p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">PII Minimization</h3>
                <p className="text-gray-600 font-verdana">We collect only what's necessary. Personal data is masked in logs and system outputs.</p>
              </div>
              <div>
                <h3 className="font-fredoka font-semibold text-graphite mb-2">Secure Photo Storage</h3>
                <p className="text-gray-600 font-verdana">Photos use tokenized URLs with expiring signed links. EXIF data is scrubbed before storage.</p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <FileText className="w-6 h-6 text-amber-600" />
                Your Rights (CCPA/GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 font-verdana text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-puretask-blue mt-1">•</span>
                  <span><strong>Access:</strong> Request a copy of all data we hold about you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-puretask-blue mt-1">•</span>
                  <span><strong>Correction:</strong> Update inaccurate or incomplete information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-puretask-blue mt-1">•</span>
                  <span><strong>Deletion:</strong> Request account deletion and data anonymization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-puretask-blue mt-1">•</span>
                  <span><strong>Export:</strong> Download your data in a portable format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-puretask-blue mt-1">•</span>
                  <span><strong>Opt-out:</strong> Unsubscribe from marketing communications anytime</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 font-verdana mt-4 italic">
                To exercise your rights, contact privacy@puretask.com
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Database className="w-6 h-6 text-gray-600" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 font-verdana text-gray-600 space-y-2">
              <p><strong>Active Accounts:</strong> Data retained while your account is active.</p>
              <p><strong>Deleted Accounts:</strong> Personal data anonymized within 30 days; booking records retained for legal/tax compliance (7 years).</p>
              <p><strong>Backups:</strong> Daily database snapshots retained for 14-30 days with restoration capability.</p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
                <Mail className="w-6 h-6 text-blue-600" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 font-verdana text-gray-600 space-y-3">
              <p><strong>Stripe:</strong> Payment processing and cleaner payouts (subject to Stripe's privacy policy)</p>
              <p><strong>Email/SMS Providers:</strong> Transactional notifications via SendGrid/Twilio</p>
              <p><strong>Cloud Storage:</strong> Secure photo storage on AWS S3 with signed URLs</p>
              <p className="text-sm text-gray-500 italic">We never sell your data to third parties.</p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6 text-center">
              <h3 className="font-fredoka font-bold text-graphite mb-2">Questions About Privacy?</h3>
              <p className="text-gray-600 font-verdana mb-4">Contact our privacy team for any concerns or data requests.</p>
              <p className="font-verdana text-puretask-blue">privacy@puretask.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}