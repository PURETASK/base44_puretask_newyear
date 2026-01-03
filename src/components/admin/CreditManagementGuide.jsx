import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Gift, MinusCircle, History, Megaphone, DollarSign, 
  CheckCircle, AlertTriangle, Info, Search 
} from 'lucide-react';

export default function CreditManagementGuide() {
  const sections = [
    {
      icon: <Search className="w-6 h-6 text-blue-600" />,
      title: 'Client Search',
      color: 'from-blue-50 to-cyan-50',
      badge: 'Required First',
      description: 'Start by searching for a client using the search bar at the top.',
      steps: [
        'Type the client\'s name, email, or client ID',
        'Select the correct client from the dropdown results',
        'The selected client will be shown at the top',
        'You can then proceed to grant/debit credits or view their history'
      ],
      tips: [
        'Search requires at least 2 characters',
        'Results are limited to 10 matches for performance',
        'Click the X button to clear your selection'
      ]
    },
    {
      icon: <Gift className="w-6 h-6 text-green-600" />,
      title: 'Grant Credits',
      color: 'from-green-50 to-emerald-50',
      badge: 'Most Common',
      description: 'Add credits to a client\'s account for goodwill, service recovery, or promotions.',
      steps: [
        'Select a client using the search bar',
        'Enter the number of credits to grant (e.g., 100 credits = $10)',
        'Provide a clear reason for the grant (required for audit trail)',
        'Click "Grant Credits" to complete the transaction'
      ],
      tips: [
        'All grants are logged in the admin audit log',
        'Credits are added immediately to the client\'s balance',
        'Use clear, descriptive reasons for future reference',
        'Common reasons: service recovery, goodwill gesture, promotion'
      ],
      warnings: [
        'Cannot be undone - use the Debit tab if you need to reverse'
      ]
    },
    {
      icon: <MinusCircle className="w-6 h-6 text-red-600" />,
      title: 'Debit/Refund Credits',
      color: 'from-red-50 to-orange-50',
      badge: 'Use with Caution',
      description: 'Remove credits from a client\'s account for refunds, corrections, or penalties.',
      steps: [
        'Select a client using the search bar',
        'Enter the number of credits to debit',
        'Provide a detailed reason (required)',
        'System will verify client has sufficient balance',
        'Click "Debit Credits" to complete'
      ],
      tips: [
        'System prevents debiting more than the client has',
        'Use for: refunds, error corrections, policy violations',
        'All debits are logged with negative amounts in transactions'
      ],
      warnings: [
        'This action removes credits permanently',
        'Ensure you have proper authorization',
        'Double-check the amount before confirming'
      ]
    },
    {
      icon: <History className="w-6 h-6 text-purple-600" />,
      title: 'Credit History',
      color: 'from-purple-50 to-pink-50',
      badge: 'Audit Trail',
      description: 'View complete transaction history for any client account.',
      steps: [
        'Select a client using the search bar',
        'History tab shows all credit transactions',
        'Sorted by most recent first',
        'Includes: date, type, amount, balance after, and notes'
      ],
      tips: [
        'Use for investigating client inquiries',
        'Great for auditing credit usage patterns',
        'Transaction types are color-coded for easy scanning',
        'Shows current balance at the top'
      ]
    },
    {
      icon: <Megaphone className="w-6 h-6 text-pink-600" />,
      title: 'Credit Campaigns',
      color: 'from-pink-50 to-rose-50',
      badge: 'Bulk Operations',
      description: 'Run automated promotional campaigns to grant credits to multiple clients at once.',
      steps: [
        'Choose target audience (e.g., all clients, new signups, inactive users)',
        'Set credit amount per client',
        'Enter campaign name and promo code',
        'Optionally set validity period',
        'Review the preview showing how many clients will be affected',
        'Click "Run Campaign" and confirm'
      ],
      tips: [
        'System shows preview of affected clients before running',
        'All campaigns are logged in admin actions',
        'Great for: welcome bonuses, retention campaigns, seasonal promotions',
        'Use descriptive promo codes for tracking (e.g., SPRING2024)'
      ],
      warnings: [
        'Cannot be undone for all clients at once',
        'Confirm you\'re targeting the right audience',
        'Test with small audiences first'
      ]
    },
    {
      icon: <DollarSign className="w-6 h-6 text-amber-600" />,
      title: 'Pending Payouts',
      color: 'from-amber-50 to-orange-50',
      badge: 'Financial Overview',
      description: 'View detailed breakdown of all pending cleaner earnings awaiting payout.',
      steps: [
        'Click the "Pending Payouts" stat card or tab',
        'View list of all pending cleaner earnings',
        'See breakdown by cleaner, booking, amount, and date',
        'Total pending amount shown at the top',
        'Click booking ID to view full booking details'
      ],
      tips: [
        'Use for reconciliation before processing payouts',
        'Verify individual earnings before batch processing',
        'Filter by date or cleaner for specific reviews',
        'Earnings move to "paid" status after payout processing'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-fredoka font-bold text-graphite mb-2">
            Credit Management Guide
          </h2>
          <p className="text-lg text-gray-600 font-verdana">
            Complete instructions for managing the platform's credit economy
          </p>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Alert className="border-indigo-200 bg-indigo-50 rounded-2xl">
        <Info className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-indigo-900 font-verdana">
          <strong>Pro Tip:</strong> Always start by using the Client Search to select a client before performing any credit operations. 
          All actions are logged for security and compliance.
        </AlertDescription>
      </Alert>

      {/* Feature Sections */}
      {sections.map((section, index) => (
        <Card key={index} className="border-0 shadow-xl rounded-2xl">
          <CardHeader className={`bg-gradient-to-r ${section.color} rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 font-fredoka text-graphite">
                {section.icon}
                {section.title}
              </CardTitle>
              {section.badge && (
                <Badge className="bg-graphite text-white font-fredoka">
                  {section.badge}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-700 font-verdana leading-relaxed">
              {section.description}
            </p>

            {/* Steps */}
            <div>
              <h4 className="font-fredoka font-semibold text-graphite mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                How to Use:
              </h4>
              <ol className="space-y-2 ml-6">
                {section.steps.map((step, i) => (
                  <li key={i} className="text-sm text-gray-700 font-verdana list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {section.tips && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-fredoka font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Tips:
                </h4>
                <ul className="space-y-1 ml-6">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-blue-800 font-verdana list-disc">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {section.warnings && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-fredoka font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Important:
                </h4>
                <ul className="space-y-1 ml-6">
                  {section.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-800 font-verdana list-disc">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Best Practices */}
      <Card className="border-0 shadow-xl rounded-2xl border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 font-verdana">
                <strong>Always provide clear reasons:</strong> Future admins need to understand why actions were taken
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 font-verdana">
                <strong>Double-check client selection:</strong> Verify you have the correct client before granting or debiting
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 font-verdana">
                <strong>Review history before actions:</strong> Check the client's credit history to understand context
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 font-verdana">
                <strong>Use campaigns for bulk operations:</strong> Don't grant credits one-by-one for multiple clients
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 font-verdana">
                <strong>Monitor pending payouts regularly:</strong> Review before processing to catch any anomalies
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}