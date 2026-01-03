
import React, { useState, useEffect } from 'react';
import { Booking } from '@/api/entities';
import { CleanerProfile } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingUp, Heart, X } from 'lucide-react'; // Added Heart and X icons

// Mock base44 and Tip entity for demonstration purposes.
// In a real application, base44 would be imported from a central module,
// and Tip would be an actual entity definition.
const base44 = {
  entities: {
    Booking: Booking, // Use the existing Booking entity
    CleanerProfile: CleanerProfile, // Use the existing CleanerProfile entity
    Tip: { // Mock Tip entity with a filter method
      async filter(criteria) {
        // This would typically fetch real tip data from a backend.
        // For now, return mock data or an empty array.
        // Example mock tips:
        const mockTips = [
          { id: 't1', cleaner_email: 'cleaner1@example.com', amount: 5.00, status: 'pending', created_date: new Date('2023-01-15') },
          { id: 't2', cleaner_email: 'cleaner2@example.com', amount: 10.00, status: 'pending', created_date: new Date('2023-02-20') },
          { id: 't3', cleaner_email: 'cleaner1@example.com', amount: 3.50, status: 'pending', created_date: new Date('2023-03-01') },
          { id: 't4', cleaner_email: 'cleaner3@example.com', amount: 7.00, status: 'paid', created_date: new Date('2023-04-10') }, // Paid tip
        ];

        return mockTips.filter(tip => {
          let matches = true;
          if (criteria.cleaner_email && tip.cleaner_email !== criteria.cleaner_email) {
            matches = false;
          }
          if (criteria.status && tip.status !== criteria.status) {
            matches = false;
          }
          return matches;
        });
      },
      // Other Tip methods (get, save, update, delete) would be here
    },
  },
};


const calculatePayoutAmount = async (cleanerEmail, startDate, endDate) => {
  try {
    // Get completed bookings
    const bookings = await base44.entities.Booking.filter({
      cleaner_email: cleanerEmail,
      status: 'completed'
    });
    
    // Filter by date range
    const filteredBookings = bookings.filter(b => {
      const completedDate = new Date(b.completed_at || b.updated_date);
      return completedDate >= new Date(startDate) && completedDate <= new Date(endDate);
    });
    
    // Get tips for this period
    const tips = await base44.entities.Tip.filter({
      cleaner_email: cleanerEmail,
      status: 'pending' // Only consider pending tips for payout
    });
    
    const filteredTips = tips.filter(t => {
      const tipDate = new Date(t.created_date);
      return tipDate >= new Date(startDate) && tipDate <= new Date(endDate);
    });
    
    // Calculate base payout (85% of booking price)
    const basePayout = filteredBookings.reduce((sum, b) => sum + (b.total_price * 0.85), 0);
    
    // Add all tips (100% goes to cleaner)
    const tipTotal = filteredTips.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      base: basePayout,
      tips: tipTotal,
      total: basePayout + tipTotal,
      booking_count: filteredBookings.length,
      tip_count: filteredTips.length,
      bookings: filteredBookings,
      tip_records: filteredTips
    };
  } catch (error) {
    console.error('Error calculating payout:', error);
    return {
      base: 0,
      tips: 0,
      total: 0,
      booking_count: 0,
      tip_count: 0,
      bookings: [],
      tip_records: []
    };
  }
};

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOwed: 0,
    platformRevenue: 0
  });
  const [selectedPayoutDetails, setSelectedPayoutDetails] = useState(null);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const completedBookings = await base44.entities.Booking.filter({ status: 'completed' });
      const cleanerProfiles = await base44.entities.CleanerProfile.list();
      const pendingTips = await base44.entities.Tip.filter({ status: 'pending' });

      // Calculate payouts per cleaner
      const payoutMap = {};
      let totalOwed = 0;
      let platformRevenue = 0;

      completedBookings.forEach(booking => {
        if (!payoutMap[booking.cleaner_email]) {
          payoutMap[booking.cleaner_email] = {
            email: booking.cleaner_email,
            totalEarnings: 0, // This will include both bookings and tips
            baseEarnings: 0, // Earnings purely from bookings
            totalTips: 0, // Sum of tips
            jobCount: 0,
            profile: cleanerProfiles.find(p => p.user_email === booking.cleaner_email)
          };
        }

        const cleanerEarningsFromBooking = booking.total_price * 0.85; // 85% to cleaner
        const platformFeeFromBooking = booking.total_price * 0.15; // 15% platform fee

        payoutMap[booking.cleaner_email].baseEarnings += cleanerEarningsFromBooking;
        payoutMap[booking.cleaner_email].totalEarnings += cleanerEarningsFromBooking;
        payoutMap[booking.cleaner_email].jobCount += 1;

        totalOwed += cleanerEarningsFromBooking;
        platformRevenue += platformFeeFromBooking;
      });

      // Add tips to payoutMap
      pendingTips.forEach(tip => {
        if (!payoutMap[tip.cleaner_email]) {
          payoutMap[tip.cleaner_email] = {
            email: tip.cleaner_email,
            totalEarnings: 0,
            baseEarnings: 0,
            totalTips: 0,
            jobCount: 0,
            profile: cleanerProfiles.find(p => p.user_email === tip.cleaner_email)
          };
        }
        payoutMap[tip.cleaner_email].totalTips += tip.amount;
        payoutMap[tip.cleaner_email].totalEarnings += tip.amount; // Tips go 100% to cleaner
        totalOwed += tip.amount;
      });

      setPayouts(Object.values(payoutMap));
      setStats({ totalOwed, platformRevenue });
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
    setLoading(false);
  };

  const handleViewDetails = async (cleanerEmail) => {
    // For simplicity, using a broad date range. In a real app, this would be user-selected.
    const startDate = new Date('1970-01-01');
    const endDate = new Date(); // Today
    const details = await calculatePayoutAmount(cleanerEmail, startDate, endDate);
    setSelectedPayoutDetails(details);
  };

  if (loading) {
    return <div className="p-6">Loading payout data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">${stats.totalOwed.toFixed(2)}</p>
            <p className="text-sm text-slate-600">Total Owed to Cleaners (incl. Tips)</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">${stats.platformRevenue.toFixed(2)}</p>
            <p className="text-sm text-slate-600">Platform Revenue (15% from bookings)</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Cleaner Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cleaner</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Jobs Completed</TableHead>
                <TableHead>Base Earnings</TableHead>
                <TableHead>Tips</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead> {/* For the Details button */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map(payout => (
                <TableRow key={payout.email}>
                  <TableCell>{payout.email}</TableCell>
                  <TableCell>
                    {payout.profile && (
                      <Badge className={
                        payout.profile.tier === 'Elite' ? 'bg-amber-500' :
                        payout.profile.tier === 'Pro' ? 'bg-blue-500' :
                        'bg-slate-500'
                      }>
                        {payout.profile.tier}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{payout.jobCount}</TableCell>
                  <TableCell>${payout.baseEarnings.toFixed(2)}</TableCell>
                  <TableCell>${payout.totalTips.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">${payout.totalEarnings.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payout.email)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payouts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No completed jobs or pending tips to payout</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Payout Breakdown (using the snippet) */}
      {selectedPayoutDetails && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payout Details for {selectedPayoutDetails.bookings[0]?.cleaner_email || selectedPayoutDetails.tip_records[0]?.cleaner_email || 'Cleaner'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedPayoutDetails(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Base Earnings */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base Earnings
                </span>
                <span className="font-bold text-emerald-900">${selectedPayoutDetails.base.toFixed(2)}</span>
              </div>
              <p className="text-xs text-emerald-700">
                {selectedPayoutDetails.booking_count} completed jobs (85% of booking price)
              </p>
            </div>

            {/* Show tips in payout breakdown */}
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-purple-900 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Tips
                </span>
                <span className="font-bold text-purple-900">${selectedPayoutDetails.tips.toFixed(2)}</span>
              </div>
              <p className="text-xs text-purple-700">
                {selectedPayoutDetails.tip_count} tips from satisfied clients (100% to you)
              </p>
            </div>

            {/* Total Payout */}
            <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-slate-900">Total Payout</span>
                <span className="text-lg font-bold text-slate-900">${selectedPayoutDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
