import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Shield, Gift, AlertTriangle } from 'lucide-react';

export default function CancellationPolicy() {
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Cancellation Policy</h1>
            <p className="text-slate-600 mb-8">Last updated: November 9, 2024</p>

            <div className="prose prose-slate max-w-none">
              {/* Overview */}
              <section className="mb-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                  We understand that plans change. This policy explains the cancellation fees for both clients and cleaners, designed to be fair while protecting everyone's time.
                </p>
              </section>

              {/* Client Cancellations */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Client Cancellation Fees</h2>
                </div>

                <p className="text-slate-700 mb-6">
                  Cancellation fees are based on how much notice you give before the scheduled cleaning time:
                </p>

                {/* Fee Structure */}
                <div className="grid gap-4 mb-6">
                  {/* Free Cancellation */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-green-900 mb-1">
                            Free Cancellation
                          </h3>
                          <p className="text-green-800">More than 48 hours before booking</p>
                        </div>
                        <Badge className="bg-green-600 text-white text-lg">
                          0% Fee
                        </Badge>
                      </div>
                      <p className="text-sm text-green-800">
                        Full refund of escrowed credits back to your account
                      </p>
                    </CardContent>
                  </Card>

                  {/* Partial Fee */}
                  <Card className="border-2 border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-amber-900 mb-1">
                            Partial Fee
                          </h3>
                          <p className="text-amber-800">24-48 hours before booking</p>
                        </div>
                        <Badge className="bg-amber-600 text-white text-lg">
                          50% Fee
                        </Badge>
                      </div>
                      <p className="text-sm text-amber-800">
                        Half of booking amount charged, remaining 50% refunded
                      </p>
                    </CardContent>
                  </Card>

                  {/* Full Fee */}
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-red-900 mb-1">
                            Full Fee
                          </h3>
                          <p className="text-red-800">Less than 24 hours before booking</p>
                        </div>
                        <Badge className="bg-red-600 text-white text-lg">
                          100% Fee
                        </Badge>
                      </div>
                      <p className="text-sm text-red-800">
                        Full booking amount charged, no refund (cleaner has reserved the time)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Example Calculation */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Example Calculation
                  </h3>
                  <div className="space-y-2 text-sm text-blue-900">
                    <p>
                      <strong>Booking:</strong> $150 for 3-hour cleaning on Saturday at 10:00 AM
                    </p>
                    <div className="grid gap-2 mt-3">
                      <p>• Cancel on <strong>Thursday 9:00 AM</strong> (49h notice) → <span className="text-green-700 font-semibold">$0 fee (free cancellation)</span></p>
                      <p>• Cancel on <strong>Friday 9:00 AM</strong> (25h notice) → <span className="text-amber-700 font-semibold">$75 fee (50%)</span></p>
                      <p>• Cancel on <strong>Saturday 8:00 AM</strong> (2h notice) → <span className="text-red-700 font-semibold">$150 fee (100%)</span></p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Grace Cancellations */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Grace Cancellations</h2>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">
                    2 Free "Grace" Cancellations
                  </h3>
                  <p className="text-purple-900 mb-4">
                    We understand emergencies happen! Every client gets <strong>2 grace cancellations</strong> that can be used to waive any cancellation fee, regardless of timing.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-semibold text-purple-900">How It Works:</p>
                        <ul className="text-sm text-purple-800 space-y-1 mt-2">
                          <li>• Use when you need to cancel with short notice</li>
                          <li>• Waives the 50% or 100% cancellation fee</li>
                          <li>• Automatically offered when applicable during cancellation</li>
                          <li>• Tracked in your account settings</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-semibold text-purple-900">Important Notes:</p>
                        <ul className="text-sm text-purple-800 space-y-1 mt-2">
                          <li>• Once used, grace cancellations don't replenish</li>
                          <li>• Not applicable to no-shows (must cancel before booking time)</li>
                          <li>• Can only be used for client-initiated cancellations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 text-sm">
                  <strong>Pro tip:</strong> Save your grace cancellations for true emergencies. For planned changes, try to give 48+ hours notice for free cancellation.
                </p>
              </section>

              {/* Cleaner Cancellations */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Cleaner Cancellations</h2>

                <p className="text-slate-700 mb-4">
                  When a cleaner cancels a confirmed booking:
                </p>

                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <strong>No charge to client</strong> - Full refund of escrowed credits
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <strong>Reliability score impact</strong> - Cancellations affect cleaner's rating
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <strong>Backup cleaner offered</strong> - We'll try to match you with another verified cleaner
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-1" />
                    <div>
                      <strong>Multiple cancellations</strong> - May result in account suspension
                    </div>
                  </li>
                </ul>
              </section>

              {/* No-Shows */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-slate-900 m-0">No-Show Policy</h2>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">
                    Client No-Show
                  </h3>
                  <p className="text-red-900 mb-3">
                    If a client is not present or accessible at the scheduled time:
                  </p>
                  <ul className="space-y-2 text-red-900">
                    <li>• Cleaner will wait 15 minutes and attempt contact</li>
                    <li>• <strong>100% booking fee charged</strong> (no grace cancellations applicable)</li>
                    <li>• Full payment released to cleaner for their time</li>
                    <li>• Repeated no-shows may result in account restrictions</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mt-4">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">
                    Cleaner No-Show
                  </h3>
                  <p className="text-amber-900 mb-3">
                    If a cleaner doesn't arrive within 30 minutes of scheduled time:
                  </p>
                  <ul className="space-y-2 text-amber-900">
                    <li>• Client receives <strong>full refund + 50 bonus credits</strong></li>
                    <li>• Serious reliability score penalty for cleaner</li>
                    <li>• Account suspension after multiple no-shows</li>
                    <li>• We'll help find a backup cleaner if possible</li>
                  </ul>
                </div>
              </section>

              {/* Rescheduling */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Rescheduling</h2>
                <p className="text-slate-700 mb-3">
                  Rescheduling to a different date/time follows the same fee structure as cancellations:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>• <strong>More than 48 hours:</strong> Free rescheduling</li>
                  <li>• <strong>24-48 hours:</strong> 50% fee applies (unless using grace cancellation)</li>
                  <li>• <strong>Less than 24 hours:</strong> 100% fee applies (unless using grace cancellation)</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  Cleaners can propose alternative times, subject to mutual agreement and availability.
                </p>
              </section>

              {/* Refund Processing */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Refund Processing</h2>
                <ul className="space-y-2 text-slate-700">
                  <li>• Refunds issued as credits to your PureTask account immediately</li>
                  <li>• Credits can be used for future bookings</li>
                  <li>• Cash refunds to original payment method upon request (3-5 business days)</li>
                  <li>• Partial refunds calculated automatically based on timing</li>
                </ul>
              </section>

              {/* Weather & Emergencies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Weather & Emergencies</h2>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <p className="text-slate-700 mb-3">
                    In case of severe weather, natural disasters, or other emergencies:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Cancellation fees may be waived at PureTask's discretion</li>
                    <li>• Safety always comes first for both parties</li>
                    <li>• Contact support for emergency cancellation assistance</li>
                    <li>• Document emergency situations when possible</li>
                  </ul>
                </div>
              </section>

              {/* Contact for Help */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions or Concerns?</h2>
                <p className="text-slate-700 mb-4">
                  If you have questions about cancellation fees or need assistance with a cancellation:
                </p>
                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                  <p className="text-emerald-900 mb-2">
                    <strong>Email:</strong> <a href="mailto:support@puretask.com" className="text-emerald-600 hover:underline">support@puretask.com</a>
                  </p>
                  <p className="text-emerald-900">
                    <strong>Support Center:</strong> <Link to={createPageUrl('Support')} className="text-emerald-600 hover:underline">Visit Help Center</Link>
                  </p>
                </div>
              </section>

              {/* Summary Table */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Reference</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-3 text-left">Notice Given</th>
                        <th className="border border-slate-300 p-3 text-left">Cancellation Fee</th>
                        <th className="border border-slate-300 p-3 text-left">Grace Available?</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-3">More than 48 hours</td>
                        <td className="border border-slate-300 p-3 text-green-700 font-semibold">0% (Free)</td>
                        <td className="border border-slate-300 p-3">N/A</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">24-48 hours</td>
                        <td className="border border-slate-300 p-3 text-amber-700 font-semibold">50%</td>
                        <td className="border border-slate-300 p-3">Yes</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">Less than 24 hours</td>
                        <td className="border border-slate-300 p-3 text-red-700 font-semibold">100%</td>
                        <td className="border border-slate-300 p-3">Yes</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">No-Show</td>
                        <td className="border border-slate-300 p-3 text-red-700 font-semibold">100%</td>
                        <td className="border border-slate-300 p-3">No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}