import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BookingDataInspector() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        alert('Admin access required');
        return;
      }
      setUser(currentUser);
      inspectBookings();
    } catch (error) {
      alert('Please log in as admin');
    }
  };

  const inspectBookings = async () => {
    setLoading(true);
    const foundIssues = [];

    try {
      const allBookings = await base44.entities.Booking.list('-created_date', 100);
      setBookings(allBookings);

      // Check each booking for potential issues
      allBookings.forEach((booking, index) => {
        // Check tasks array
        if (booking.tasks && !Array.isArray(booking.tasks)) {
          foundIssues.push({
            bookingId: booking.id,
            field: 'tasks',
            issue: 'Not an array',
            value: JSON.stringify(booking.tasks)
          });
        }

        // Check task_quantities
        if (booking.task_quantities) {
          try {
            if (typeof booking.task_quantities === 'string') {
              JSON.parse(booking.task_quantities);
            }
          } catch (e) {
            foundIssues.push({
              bookingId: booking.id,
              field: 'task_quantities',
              issue: 'Invalid JSON',
              value: booking.task_quantities
            });
          }
        }

        // Check price_multipliers
        if (booking.price_multipliers && !Array.isArray(booking.price_multipliers)) {
          foundIssues.push({
            bookingId: booking.id,
            field: 'price_multipliers',
            issue: 'Not an array',
            value: JSON.stringify(booking.price_multipliers)
          });
        }

        // Check photos arrays
        if (booking.before_photos && !Array.isArray(booking.before_photos)) {
          foundIssues.push({
            bookingId: booking.id,
            field: 'before_photos',
            issue: 'Not an array',
            value: JSON.stringify(booking.before_photos)
          });
        }

        if (booking.after_photos && !Array.isArray(booking.after_photos)) {
          foundIssues.push({
            bookingId: booking.id,
            field: 'after_photos',
            issue: 'Not an array',
            value: JSON.stringify(booking.after_photos)
          });
        }

        // Check for extremely large fields
        const bookingSize = JSON.stringify(booking).length;
        if (bookingSize > 50000) { // 50KB
          foundIssues.push({
            bookingId: booking.id,
            field: 'overall',
            issue: 'Record too large',
            value: `${(bookingSize / 1024).toFixed(2)} KB`
          });
        }
      });

      setIssues(foundIssues);
    } catch (error) {
      handleError(error, { userMessage: 'Error inspecting bookings:', showToast: false });
      foundIssues.push({
        bookingId: 'N/A',
        field: 'general',
        issue: 'Failed to load bookings',
        value: error.message
      });
      setIssues(foundIssues);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Data Inspector (Admin Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                </div>
                <div className={`p-4 rounded-lg ${issues.length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-slate-600">Issues Found</p>
                  <p className={`text-2xl font-bold ${issues.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {issues.length}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Healthy Records</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {bookings.length - new Set(issues.map(i => i.bookingId)).size}
                  </p>
                </div>
              </div>

              <Button onClick={inspectBookings} className="w-full">
                Re-run Inspection
              </Button>
            </div>
          </CardContent>
        </Card>

        {issues.length === 0 ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ All booking records appear healthy! No data issues detected.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Data Issues Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {issues.map((issue, idx) => (
                  <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-red-900">Booking ID: {issue.bookingId}</p>
                        <p className="text-sm text-red-700">Field: <code className="bg-red-100 px-2 py-1 rounded">{issue.field}</code></p>
                      </div>
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">{issue.issue}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-red-200 mt-2">
                      <p className="text-xs font-mono text-slate-600 break-all">
                        {issue.value.substring(0, 200)}{issue.value.length > 200 && '...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900">
                  <strong>What to do:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copy the problematic Booking IDs above</li>
                    <li>Go to Base44 Dashboard → Data → Booking</li>
                    <li>Search for each booking by ID</li>
                    <li>Either fix the malformed data or delete the record</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}