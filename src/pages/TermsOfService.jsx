import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 lg:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-slate-600 mb-8">Last updated: November 9, 2024</p>

            <div className="prose prose-slate max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                  Welcome to PureTask! These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using PureTask, you agree to be bound by these Terms.
                </p>
              </section>

              {/* Definitions */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Definitions</h2>
                </div>

                <ul className="space-y-2 text-slate-700">
                  <li><strong>"Platform"</strong> refers to the PureTask website and mobile applications</li>
                  <li><strong>"Services"</strong> refers to the marketplace connecting clients with cleaning service providers</li>
                  <li><strong>"Client"</strong> refers to users booking cleaning services</li>
                  <li><strong>"Cleaner"</strong> refers to independent contractors providing cleaning services</li>
                  <li><strong>"Booking"</strong> refers to a scheduled cleaning service</li>
                  <li><strong>"Credits"</strong> refers to the platform currency (10 credits = $1 USD)</li>
                </ul>
              </section>

              {/* Account Registration */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Account Registration</h2>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Eligibility</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>You must be at least 18 years old to use PureTask</li>
                  <li>You must provide accurate, current, and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per person or business entity</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Cleaner Verification</h3>
                <p className="text-slate-700">
                  Cleaners must complete identity verification including:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>Government-issued ID verification</li>
                  <li>Background check authorization</li>
                  <li>Selfie photo for identity confirmation</li>
                  <li>Insurance and bonding documentation (where applicable)</li>
                </ul>
              </section>

              {/* Platform Usage */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Platform Usage</h2>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Permitted Uses</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Booking cleaning services (for clients)</li>
                  <li>Offering cleaning services (for cleaners)</li>
                  <li>Communicating about bookings</li>
                  <li>Providing and viewing reviews</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Prohibited Activities</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Circumventing platform fees by transacting off-platform</li>
                  <li>Creating fake accounts or reviews</li>
                  <li>Harassment, discrimination, or abusive behavior</li>
                  <li>Sharing account credentials</li>
                  <li>Scraping or automated data collection</li>
                  <li>Misrepresenting services, qualifications, or identity</li>
                </ul>
              </section>

              {/* Booking & Payment Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Booking & Payment Terms</h2>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Credit System</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Credits are purchased at a rate of 10 credits = $1 USD</li>
                  <li>Credits are held in escrow when bookings are made</li>
                  <li>Payment to cleaners occurs after job completion and approval</li>
                  <li>Credits are non-refundable except as outlined in our <Link to={createPageUrl('CancellationPolicy')} className="text-emerald-600 hover:underline">Cancellation Policy</Link></li>
                  <li>Credits never expire and remain in your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Pricing</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Cleaner rates are set independently and frozen at booking time</li>
                  <li>Final charge based on actual hours worked (rounded to 15 minutes)</li>
                  <li>Platform fee: 15% of transaction value</li>
                  <li>Cleaners receive 80-85% of booking amount depending on tier</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Cancellation Policy</h3>
                <ul className="space-y-2 text-slate-700">
                  <li><strong>More than 48 hours:</strong> Free cancellation</li>
                  <li><strong>24-48 hours:</strong> 50% cancellation fee</li>
                  <li><strong>Less than 24 hours:</strong> 100% cancellation fee</li>
                  <li><strong>Grace Cancellations:</strong> 2 free cancellations per client</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  See full details in our <Link to={createPageUrl('CancellationPolicy')} className="text-emerald-600 hover:underline">Cancellation Policy</Link>.
                </p>
              </section>

              {/* Service Expectations */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Service Expectations</h2>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">For Clients</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Provide accurate address and access instructions</li>
                  <li>Ensure property is safe for cleaning</li>
                  <li>Disclose any hazards or special requirements</li>
                  <li>Be available for questions or issues during service</li>
                  <li>Treat cleaners with respect and professionalism</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">For Cleaners</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Arrive on time within 15-minute window</li>
                  <li>GPS check-in/out at job location (within 250m)</li>
                  <li>Upload minimum 3 photos as proof of work</li>
                  <li>Complete tasks as described in booking</li>
                  <li>Maintain professional conduct and appearance</li>
                  <li>Provide own cleaning supplies and equipment</li>
                </ul>
              </section>

              {/* Trust & Safety */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Trust & Safety</h2>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">GPS Verification</h3>
                <p className="text-slate-700">
                  Cleaners must check in/out within 250 meters of the job location. GPS data is logged for verification and dispute resolution.
                </p>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Photo Proof</h3>
                <p className="text-slate-700">
                  Cleaners must upload at least 3 photos per job to document work completion. Photos are shared with clients after job approval.
                </p>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Dispute Resolution</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>Disputes must be filed within 48 hours of job completion</li>
                  <li>PureTask reviews evidence from both parties</li>
                  <li>Resolutions may include partial/full refunds or credits</li>
                  <li>PureTask's decision is final</li>
                </ul>
              </section>

              {/* Independent Contractor Status */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-6 h-6 text-amber-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Independent Contractor Status</h2>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <p className="text-amber-900 font-semibold mb-3">Important Legal Notice:</p>
                  <p className="text-amber-900 mb-3">
                    <strong>Cleaners are independent contractors, not employees of PureTask.</strong> PureTask is a marketplace platform connecting clients with independent service providers.
                  </p>
                  <ul className="space-y-2 text-amber-900">
                    <li>• Cleaners set their own rates and availability</li>
                    <li>• Cleaners provide their own equipment and supplies</li>
                    <li>• Cleaners are responsible for their own taxes and insurance</li>
                    <li>• Cleaners determine how to perform services</li>
                    <li>• PureTask does not direct or control work methods</li>
                  </ul>
                </div>
              </section>

              {/* Liability & Disclaimers */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Liability & Disclaimers</h2>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Platform Role</h3>
                <p className="text-slate-700 mb-3">
                  PureTask is a marketplace platform. We do not:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>Employ or supervise cleaners</li>
                  <li>Perform cleaning services</li>
                  <li>Guarantee service quality or results</li>
                  <li>Insure or bond cleaners (unless specifically stated)</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Limitation of Liability</h3>
                <p className="text-slate-700">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, PURETASK SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>Property damage or theft during cleaning services</li>
                  <li>Personal injury related to cleaning services</li>
                  <li>Quality of cleaning services provided</li>
                  <li>Actions or omissions of independent contractors</li>
                  <li>Indirect, incidental, or consequential damages</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  Total liability limited to amount paid for services in question.
                </p>

                <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Indemnification</h3>
                <p className="text-slate-700">
                  You agree to indemnify and hold PureTask harmless from claims arising from your use of the platform or breach of these Terms.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property</h2>
                <p className="text-slate-700">
                  All platform content, trademarks, and intellectual property belong to PureTask. You may not copy, modify, or distribute our content without permission.
                </p>
                <p className="text-slate-700 mt-3">
                  By uploading photos or content, you grant PureTask a license to use, display, and distribute such content for platform operations and marketing.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
                <p className="text-slate-700 mb-3">
                  We may suspend or terminate your account for:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Multiple client complaints or disputes</li>
                  <li>Failure to meet service standards (cleaners)</li>
                  <li>Abuse or harassment of other users</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  You may close your account at any time. Unused credits may be refunded at our discretion.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
                <p className="text-slate-700">
                  We may update these Terms at any time. Significant changes will be communicated via email. Continued use after changes constitutes acceptance.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h2>
                <p className="text-slate-700">
                  These Terms are governed by the laws of the State of California, USA. Disputes shall be resolved through binding arbitration in Sacramento County, California.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-700 mb-2">
                    <strong>Email:</strong> <a href="mailto:legal@puretask.com" className="text-emerald-600 hover:underline">legal@puretask.com</a>
                  </p>
                  <p className="text-slate-700 mb-2">
                    <strong>Support:</strong> <Link to={createPageUrl('Support')} className="text-emerald-600 hover:underline">Visit Support Center</Link>
                  </p>
                  <p className="text-slate-700">
                    <strong>Mail:</strong> PureTask Legal Department, [Address]
                  </p>
                </div>
              </section>

              {/* Acceptance */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mt-8">
                <p className="text-emerald-900 font-semibold mb-2">
                  By using PureTask, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <p className="text-emerald-900 text-sm">
                  If you do not agree to these Terms, please do not use our platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}