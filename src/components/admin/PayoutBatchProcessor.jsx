import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, CheckCircle, AlertCircle, Loader2, Calendar } from 'lucide-react';

export default function PayoutBatchProcessor() {
  const [pendingEarnings, setPendingEarnings] = useState([]);
  const [cleanerSummaries, setCleanerSummaries] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPendingEarnings();
  }, []);

  const loadPendingEarnings = async () => {
    setLoading(true);
    try {
      const earnings = await base44.entities.CleanerEarning.filter({ status: 'pending' });
      setPendingEarnings(earnings);
      
      // Group by cleaner
      const grouped = {};
      earnings.forEach(earning => {
        if (!grouped[earning.cleaner_email]) {
          grouped[earning.cleaner_email] = {
            email: earning.cleaner_email,
            total_credits: 0,
            total_usd: 0,
            job_count: 0,
            earnings: []
          };
        }
        grouped[earning.cleaner_email].total_credits += earning.credits_earned;
        grouped[earning.cleaner_email].total_usd += earning.usd_due;
        grouped[earning.cleaner_email].job_count += 1;
        grouped[earning.cleaner_email].earnings.push(earning);
      });
      
      setCleanerSummaries(Object.values(grouped));
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
    setLoading(false);
  };

  const processPayouts = async () => {
    setProcessing(true);
    setMessage('');
    
    try {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - 7);
      const periodEnd = new Date();
      
      let successCount = 0;
      let failCount = 0;
      
      for (const summary of cleanerSummaries) {
        try {
          // Create payout record
          const payout = await base44.entities.Payout.create({
            cleaner_email: summary.email,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            total_credits: summary.total_credits,
            total_usd: summary.total_usd,
            status: 'processing'
          });
          
          // In production, you would:
          // 1. Get cleaner's stripe_connect_id
          // 2. Create Stripe transfer
          // 3. Update payout with stripe_transfer_id
          
          // For now, simulate success
          await base44.entities.Payout.update(payout.id, {
            status: 'paid',
            stripe_transfer_id: `transfer_${Date.now()}`
          });
          
          // Mark earnings as paid
          for (const earning of summary.earnings) {
            await base44.entities.CleanerEarning.update(earning.id, {
              status: 'paid',
              payout_id: payout.id
            });
          }
          
          successCount++;
        } catch (error) {
          console.error(`Payout failed for ${summary.email}:`, error);
          failCount++;
        }
      }
      
      setMessage(`✅ Processed ${successCount} payouts successfully. ${failCount > 0 ? `${failCount} failed.` : ''}`);
      loadPendingEarnings();
      
    } catch (error) {
      console.error('Batch processing error:', error);
      setMessage('❌ Error processing payouts');
    }
    
    setProcessing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading pending payouts...</p>
        </CardContent>
      </Card>
    );
  }

  const totalUSD = cleanerSummaries.reduce((sum, c) => sum + c.total_usd, 0);
  const totalCredits = cleanerSummaries.reduce((sum, c) => sum + c.total_credits, 0);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Weekly Payout Batch
          </div>
          <Badge className="bg-green-500 text-white">
            {cleanerSummaries.length} Cleaners
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-sm text-slate-600 mb-1">Total Pending USD</p>
            <p className="text-3xl font-bold text-green-600">${totalUSD.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-sm text-slate-600 mb-1">Total Credits Earned</p>
            <p className="text-3xl font-bold text-blue-600">{totalCredits.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-sm text-slate-600 mb-1">Pending Jobs</p>
            <p className="text-3xl font-bold text-purple-600">{pendingEarnings.length}</p>
          </div>
        </div>

        {cleanerSummaries.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900 mb-2">No Pending Payouts</p>
            <p className="text-slate-600">All earnings have been paid out</p>
          </div>
        ) : (
          <>
            {/* Cleaner List */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cleaner</TableHead>
                    <TableHead className="text-right">Jobs</TableHead>
                    <TableHead className="text-right">Credits Earned</TableHead>
                    <TableHead className="text-right">USD Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cleanerSummaries.map((summary, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{summary.email}</TableCell>
                      <TableCell className="text-right">{summary.job_count}</TableCell>
                      <TableCell className="text-right font-mono">
                        {summary.total_credits.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        ${summary.total_usd.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Process Button */}
            <Button
              onClick={processPayouts}
              disabled={processing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payouts...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Process ${totalUSD.toFixed(2)} in Payouts
                </>
              )}
            </Button>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>Note:</strong> In production, this will create Stripe Connect transfers to each cleaner's account. 
                Ensure all cleaners have valid stripe_connect_id before processing.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}