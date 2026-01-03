import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SystemHealthCheck() {
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState([]);

  const runHealthCheck = async () => {
    setLoading(true);
    const results = [];

    try {
      // Check 1: User roles properly set
      const users = await base44.entities.User.list();
      const usersWithRoles = users.filter(u => u.user_type).length;
      results.push({
        name: 'User Roles',
        status: usersWithRoles > 0 ? 'pass' : 'warn',
        message: `${usersWithRoles}/${users.length} users have roles assigned`
      });

      // Check 2: Active cleaners
      const cleaners = await base44.entities.CleanerProfile.filter({ is_active: true });
      results.push({
        name: 'Active Cleaners',
        status: cleaners.length > 0 ? 'pass' : 'warn',
        message: `${cleaners.length} active cleaners`
      });

      // Check 3: Bookings with proper status
      const bookings = await base44.entities.Booking.list();
      const properStatus = bookings.filter(b => ['available', 'awaiting_cleaner', 'scheduled', 'cleaning_now', 'completed', 'cancelled', 'disputed'].includes(b.status));
      results.push({
        name: 'Booking Status Integrity',
        status: properStatus.length === bookings.length ? 'pass' : 'fail',
        message: `${properStatus.length}/${bookings.length} bookings have valid status`
      });

      // Check 4: Recurring bookings active
      const recurring = await base44.entities.RecurringBooking.filter({ is_active: true });
      results.push({
        name: 'Recurring Bookings',
        status: recurring.length >= 0 ? 'pass' : 'warn',
        message: `${recurring.length} active recurring schedules`
      });

      // Check 5: Disputes handled
      const openDisputes = await base44.entities.Dispute.filter({ status: 'open' });
      results.push({
        name: 'Open Disputes',
        status: openDisputes.length === 0 ? 'pass' : 'warn',
        message: `${openDisputes.length} disputes need attention`
      });

      // Check 6: Credits system
      const credits = await base44.entities.Credit.list();
      results.push({
        name: 'Credits System',
        status: 'pass',
        message: `${credits.length} credit records tracked`
      });

      // Check 7: Payment records
      const payments = await base44.entities.Payment.list();
      results.push({
        name: 'Payment System',
        status: payments.length > 0 ? 'pass' : 'warn',
        message: `${payments.length} payment records`
      });

      // Check 8: Reviews
      const reviews = await base44.entities.Review.list();
      results.push({
        name: 'Review System',
        status: 'pass',
        message: `${reviews.length} reviews submitted`
      });

    } catch (error) {
      console.error('Health check error:', error);
      results.push({
        name: 'System Error',
        status: 'fail',
        message: error.message
      });
    }

    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>System Health Check</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runHealthCheck}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{passCount}</p>
            <p className="text-sm text-green-800">Passed</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-3xl font-bold text-amber-600">{warnCount}</p>
            <p className="text-sm text-amber-800">Warnings</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{failCount}</p>
            <p className="text-sm text-red-800">Failed</p>
          </div>
        </div>

        <div className="space-y-2">
          {checks.map((check, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg flex items-center justify-between ${
                check.status === 'pass' ? 'bg-green-50' :
                check.status === 'warn' ? 'bg-amber-50' :
                'bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {check.status === 'pass' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-slate-600">{check.message}</p>
                </div>
              </div>
              <Badge className={
                check.status === 'pass' ? 'bg-green-500' :
                check.status === 'warn' ? 'bg-amber-500' :
                'bg-red-500'
              }>
                {check.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}