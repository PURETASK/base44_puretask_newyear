import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Loader2,
  Eye
} from 'lucide-react';
import { formatBookingDate } from '../utils/dateHelpers';

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const allDisputes = await base44.entities.Dispute.list('-created_date');
      setDisputes(allDisputes);
    } catch (error) {
      console.error('Error loading disputes:', error);
    }
    setLoading(false);
  };

  const handleResolve = async (status) => {
    if (!resolution.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    setResolving(true);
    try {
      const currentUser = await base44.auth.me();
      
      // Update dispute
      await base44.entities.Dispute.update(selectedDispute.id, {
        status: status,
        resolution: resolution.trim(),
        refund_amount: parseFloat(refundAmount) || 0,
        credit_issued: parseFloat(creditAmount) || 0,
        resolved_by: currentUser.email,
        resolved_at: new Date().toISOString()
      });

      // Issue refund if specified
      if (parseFloat(refundAmount) > 0) {
        const booking = await base44.entities.Booking.get(selectedDispute.booking_id);
        await base44.entities.Payment.create({
          booking_id: booking.id,
          client_email: booking.client_email,
          cleaner_email: booking.cleaner_email,
          amount: -parseFloat(refundAmount),
          platform_fee: 0,
          cleaner_payout: 0,
          status: 'completed',
          payment_method: 'refund'
        });
      }

      // Issue credit if specified
      if (parseFloat(creditAmount) > 0) {
        const booking = await base44.entities.Booking.get(selectedDispute.booking_id);
        await base44.entities.Credit.create({
          client_email: booking.client_email,
          amount: parseFloat(creditAmount),
          reason: 'dispute_resolution',
          booking_id: booking.id,
          used: false
        });
      }

      // Update booking status
      const booking = await base44.entities.Booking.get(selectedDispute.booking_id);
      await base44.entities.Booking.update(booking.id, {
        status: status === 'resolved' ? 'completed' : 'disputed'
      });

      setSelectedDispute(null);
      loadDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute. Please try again.');
    }
    setResolving(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'investigating': return 'bg-amber-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      quality_issue: 'Quality Issue',
      no_show: 'No Show',
      late_arrival: 'Late Arrival',
      damage: 'Property Damage',
      safety_concern: 'Safety Concern',
      payment_issue: 'Payment Issue',
      other: 'Other'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'investigating');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved' || d.status === 'closed');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open Disputes</p>
                <p className="text-3xl font-bold text-red-600">{openDisputes.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resolved This Month</p>
                <p className="text-3xl font-bold text-green-600">{resolvedDisputes.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Disputes</p>
                <p className="text-3xl font-bold text-slate-900">{disputes.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Disputes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Open Disputes Requiring Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openDisputes.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg text-slate-600">No open disputes - great job!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openDisputes.map(dispute => (
                <Card key={dispute.id} className="border-2 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status}
                          </Badge>
                          <Badge variant="outline">{getCategoryLabel(dispute.category)}</Badge>
                          <span className="text-sm text-slate-500">
                            Filed by: {dispute.filed_by}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Booking ID: {dispute.booking_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Filed: {formatBookingDate(dispute.created_date)}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setResolution('');
                          setRefundAmount('');
                          setCreditAmount('');
                        }}
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-700">{dispute.description}</p>
                    </div>

                    {dispute.evidence_photos && dispute.evidence_photos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-600 mb-2">Evidence Photos:</p>
                        <div className="flex gap-2">
                          {dispute.evidence_photos.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Evidence ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded border cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Resolve Dispute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dispute Details */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Dispute Details</h4>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Category:</strong> {getCategoryLabel(selectedDispute.category)}
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Filed by:</strong> {selectedDispute.filed_by} ({selectedDispute.user_email})
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Description:</strong> {selectedDispute.description}
                </p>
              </div>

              {/* Evidence Photos */}
              {selectedDispute.evidence_photos && selectedDispute.evidence_photos.length > 0 && (
                <div>
                  <Label>Evidence Photos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDispute.evidence_photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-32 h-32 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Notes */}
              <div>
                <Label>Resolution Notes *</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Explain how this dispute was resolved and any actions taken..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Refund Amount */}
              <div>
                <Label>Refund Amount ($)</Label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="mt-2"
                />
              </div>

              {/* Credit Amount */}
              <div>
                <Label>Credit to Issue ($)</Label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Credits can be used towards future bookings
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispute(null)}
                  className="flex-1"
                  disabled={resolving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleResolve('resolved')}
                  disabled={resolving || !resolution.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {resolving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}