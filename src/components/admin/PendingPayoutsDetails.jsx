import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Loader2, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function PendingPayoutsDetails() {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUSD, setTotalUSD] = useState(0);

  useEffect(() => {
    loadPendingEarnings();
  }, []);

  const loadPendingEarnings = async () => {
    setLoading(true);
    try {
      const pendingEarnings = await base44.entities.CleanerEarning.filter({ status: 'pending' });
      
      const sorted = pendingEarnings.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );

      setEarnings(sorted);
      
      const total = sorted.reduce((sum, e) => sum + (e.usd_due || 0), 0);
      setTotalUSD(total);
    } catch (error) {
      console.error('Error loading pending earnings:', error);
    }
    setLoading(false);
  };

  const getEarningTypeColor = (type) => {
    const colors = {
      job_completed: 'bg-green-100 text-green-800',
      client_no_show_comp: 'bg-blue-100 text-blue-800',
      cancellation_comp: 'bg-purple-100 text-purple-800',
      bonus: 'bg-amber-100 text-amber-800',
      adjustment: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const viewBooking = (bookingId) => {
    navigate(createPageUrl('AdminBookingsConsoleV2'));
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <DollarSign className="w-6 h-6 text-amber-600" />
            Pending Payouts Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <DollarSign className="w-6 h-6 text-amber-600" />
            Pending Payouts Details
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-verdana">Total Pending</p>
            <p className="text-3xl font-fredoka font-bold text-amber-600">${totalUSD.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-verdana">
            Showing <span className="font-medium text-graphite">{earnings.length}</span> pending earning{earnings.length !== 1 ? 's' : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPendingEarnings}
            className="rounded-full font-fredoka"
          >
            Refresh
          </Button>
        </div>

        {earnings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-verdana text-lg">No pending payouts</p>
            <p className="text-sm text-gray-400 font-verdana mt-1">All earnings have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-fredoka">Cleaner</TableHead>
                  <TableHead className="font-fredoka">Type</TableHead>
                  <TableHead className="font-fredoka">Booking ID</TableHead>
                  <TableHead className="font-fredoka text-right">Credits</TableHead>
                  <TableHead className="font-fredoka text-right">Payout %</TableHead>
                  <TableHead className="font-fredoka text-right">USD Due</TableHead>
                  <TableHead className="font-fredoka">Date</TableHead>
                  <TableHead className="font-fredoka">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id} className="hover:bg-gray-50">
                    <TableCell className="font-verdana text-sm font-medium">
                      {earning.cleaner_email}
                    </TableCell>
                    <TableCell>
                      <Badge className={getEarningTypeColor(earning.earning_type)}>
                        {earning.earning_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-verdana text-sm text-gray-600">
                      {earning.booking_id ? (
                        <span className="font-mono text-xs">{earning.booking_id.slice(0, 8)}...</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-fredoka font-semibold text-puretask-blue">
                      {earning.credits_earned?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right font-verdana text-sm">
                      {((earning.payout_percentage || 0) * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-right font-fredoka font-bold text-green-600">
                      ${(earning.usd_due || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-verdana text-sm text-gray-600">
                      {format(new Date(earning.created_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {earning.booking_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewBooking(earning.booking_id)}
                          className="h-8 px-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}