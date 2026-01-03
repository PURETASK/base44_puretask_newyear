import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

export default function FileDisputeForm({ booking, userType, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    requested_refund_credits: 0
  });

  const clientCategories = [
    { value: 'no_show', label: 'Cleaner No-Show' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'late_arrival', label: 'Late Arrival' },
    { value: 'damage', label: 'Property Damage' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'other', label: 'Other' }
  ];

  const cleanerCategories = [
    { value: 'billing_issue', label: 'Billing/Payment Issue' },
    { value: 'safety_concern', label: 'Unsafe Environment' },
    { value: 'damage', label: 'Personal Item Damage' },
    { value: 'other', label: 'Other Issue' }
  ];

  const categories = userType === 'client' ? clientCategories : cleanerCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Dispute.create({
        booking_id: booking.id,
        filed_by: userType,
        filed_by_email: user.email,
        user_email: user.email,
        category: formData.category,
        description: formData.description,
        requested_refund_credits: userType === 'client' ? formData.requested_refund_credits : 0,
        status: 'open'
      });

      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      console.error('Error filing dispute:', error);
      alert('Failed to file dispute. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-fredoka text-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Report a Problem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-verdana font-semibold text-gray-700 mb-2">
              Issue Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-full border border-gray-300 font-verdana"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-verdana font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe what happened..."
              className="min-h-[120px]"
              required
            />
          </div>

          {userType === 'client' && (
            <div>
              <label className="block text-sm font-verdana font-semibold text-gray-700 mb-2">
                Requested Refund (Credits)
              </label>
              <Input
                type="number"
                value={formData.requested_refund_credits}
                onChange={(e) => setFormData({ ...formData, requested_refund_credits: parseFloat(e.target.value) || 0 })}
                min="0"
                max={booking.final_charge_credits || booking.escrow_credits_reserved || 1000}
              />
              <p className="text-xs text-gray-500 mt-1 font-verdana">
                ${(formData.requested_refund_credits / 10).toFixed(2)} USD
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full brand-gradient text-white rounded-full font-fredoka font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>

          <div className="p-3 bg-blue-50 rounded-2xl">
            <p className="text-xs font-verdana text-blue-800">
              Our support team will review your dispute within 24 hours. You'll be notified of the outcome via message.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}