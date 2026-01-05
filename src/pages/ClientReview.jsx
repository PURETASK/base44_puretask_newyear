import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, Loader2, AlertTriangle, Camera, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import HoursComparisonDisplay from '../components/booking/HoursComparisonDisplay';
import StatusFlowExplainer from '../components/status/StatusFlowExplainer';

const CLEANING_TYPE_COLORS = {
  basic: { bg: 'bg-blue-500', text: 'text-blue-500' },
  deep: { bg: 'bg-purple-500', text: 'text-purple-500' },
  moveout: { bg: 'bg-orange-500', text: 'text-orange-500' }
};

export default function ClientReview() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJob();
  }, []);

  const loadJob = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('job_id');
      if (!jobId) {
        navigate(createPageUrl('BookingHistory'));
        return;
      }

      const jobs = await base44.entities.Booking.filter({ id: jobId, client_email: currentUser.email });
      if (jobs.length === 0) {
        navigate(createPageUrl('BookingHistory'));
        return;
      }

      setJob(jobs[0]);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading job:', showToast: false });
      navigate(createPageUrl('BookingHistory'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const actualHours = job.actual_hours || job.hours;
      const estimatedHours = job.hours;
      const totalRateCPH = job.snapshot_total_rate_cph || 300;
      const additionalServicesCost = job.additional_services_cost_credits || 0;

      const finalCharge = (actualHours * totalRateCPH) + additionalServicesCost;
      const escrowReserved = job.escrow_credits_reserved || ((estimatedHours * totalRateCPH) + additionalServicesCost);
      const refund = Math.max(0, escrowReserved - finalCharge);

      await base44.entities.Booking.update(job.id, {
        status: 'approved',
        final_charge_credits: finalCharge,
        refund_credits: refund,
        client_confirmed: true
      });

      await base44.entities.Event.create({
        booking_id: job.id,
        event_type: 'review_submitted',
        user_email: user.email,
        details: `Client approved job. Final charge: ${finalCharge} credits. Refund: ${refund} credits.`
      });

      const clientProfile = await base44.entities.ClientProfile.filter({ user_email: user.email });
      if (clientProfile.length > 0) {
        const currentBalance = clientProfile[0].credits_balance || 0;
        const newBalance = currentBalance + refund;
        await base44.entities.ClientProfile.update(clientProfile[0].id, {
          credits_balance: newBalance
        });
      }

      alert('Job approved! Credits have been released to the cleaner.');
      navigate(createPageUrl('BookingHistory'));
    } catch (error) {
      alert('Failed to approve job');
      setSubmitting(false);
    }
  };

  const handleReportIssue = () => {
    navigate(createPageUrl(`Support?booking_id=${job.id}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const actualHours = job.actual_hours || job.hours;
  const estimatedHours = job.hours;
  const totalRateCPH = job.snapshot_total_rate_cph || 300;
  const additionalServicesCost = job.additional_services_cost_credits || 0;
  const finalCharge = (actualHours * totalRateCPH) + additionalServicesCost;
  const escrowReserved = job.escrow_credits_reserved || ((estimatedHours * totalRateCPH) + additionalServicesCost);
  const refund = Math.max(0, escrowReserved - finalCharge);
  const colors = CLEANING_TYPE_COLORS[job.cleaning_type] || CLEANING_TYPE_COLORS.basic;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Review Your Cleaning</h1>
          <p className="text-gray-600 font-verdana">Your cleaner has completed the job. Please review and approve.</p>

          {/* Status Flow Explainer */}
          <div className="mt-6">
            <StatusFlowExplainer currentStatus="awaiting_client" />
          </div>
          
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <Badge className={`${colors.bg} text-white`}>{job.cleaning_type}</Badge>
            <span className="text-sm font-verdana text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              {format(new Date(job.date), 'MMMM d, yyyy')}
            </span>
            <span className="text-sm font-verdana text-gray-600">
              <MapPin className="w-4 h-4 inline mr-1" />
              {job.address}
            </span>
          </div>
        </div>

        {/* Before & After Photos */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-purple-500" />
              Before & After Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-fredoka font-bold text-graphite mb-3">Before</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(job.before_photos || []).map((url, idx) => (
                    <img key={idx} src={url} alt={`Before ${idx + 1}`} className="w-full h-40 object-cover rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(url, '_blank')} />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-fredoka font-bold text-graphite mb-3">After</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(job.after_photos || []).map((url, idx) => (
                    <img key={idx} src={url} alt={`After ${idx + 1}`} className="w-full h-40 object-cover rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(url, '_blank')} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hours Comparison */}
        <div className="mb-6">
          <HoursComparisonDisplay booking={job} />
        </div>

        {/* Time & Credits Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Time Worked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-verdana">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-In:</span>
                  <span className="font-semibold">{job.check_in_time ? format(new Date(job.check_in_time), 'p') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-Out:</span>
                  <span className="font-semibold">{job.check_out_time ? format(new Date(job.check_out_time), 'p') : 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-fredoka font-bold text-puretask-blue text-lg">
                    {actualHours.toFixed(2)} hours
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-fresh-mint" />
                Credits Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-verdana">
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Held:</span>
                  <span className="font-semibold">{Math.round(escrowReserved)} credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Charge:</span>
                  <span className="font-semibold">{Math.round(finalCharge)} credits</span>
                </div>
                {refund > 0 && (
                  <div className="flex justify-between text-fresh-mint pt-2 border-t">
                    <span className="font-bold">Refund:</span>
                    <span className="font-fredoka font-bold text-lg">+{Math.round(refund)} credits</span>
                  </div>
                )}
                {refund === 0 && actualHours > estimatedHours && (
                  <p className="text-xs text-gray-500 pt-2 border-t">
                    Job took longer than estimated, but you're only charged for estimated time.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Completed */}
        {job.notes && (
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg">Tasks Completed & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="font-verdana text-gray-700 whitespace-pre-wrap">
                  {job.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleReportIssue}
            variant="outline"
            className="flex-1 font-fredoka border-red-300 text-red-600 hover:bg-red-50"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report an Issue
          </Button>
          <Button
            onClick={handleApprove}
            disabled={submitting}
            className="flex-1 bg-fresh-mint hover:bg-green-600 text-white font-fredoka font-bold"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            Approve & Release Credits
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 font-verdana mt-6">
          By approving, you confirm the cleaning meets your expectations and authorize credit release.
        </p>
      </div>
    </div>
  );
}