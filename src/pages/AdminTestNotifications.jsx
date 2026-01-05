import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, ArrowLeft, Zap, Loader2 } from 'lucide-react';
import NotificationDispatcher from '../components/notifications/NotificationDispatcher';

export default function AdminTestNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('booking');

  // Booking test data
  const [bookingData, setBookingData] = useState({
    booking_id: 'test_' + Date.now(),
    client_email: '',
    client_first_name: 'Test',
    client_phone: '',
    cleaner_email: '',
    cleaner_first_name: 'Maria',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    address: '123 Test St, Sacramento, CA',
    price: '139'
  });

  // Payment test data
  const [paymentData, setPaymentData] = useState({
    booking_id: 'test_' + Date.now(),
    client_email: '',
    amount: '139',
    reason: 'Card declined'
  });

  // Cleaner test data
  const [cleanerData, setCleanerData] = useState({
    cleaner_email: '',
    cleaner_first_name: 'Maria',
    old_score: '75',
    new_score: '82'
  });

  const testBookingConfirmation = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await NotificationDispatcher.sendNotificationFromTemplate(
        'email.client.booking_confirmation',
        bookingData.client_email,
        {
          first_name: bookingData.client_first_name,
          cleaner_name: bookingData.cleaner_first_name,
          date: new Date(bookingData.date).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          }),
          time: bookingData.time,
          address: bookingData.address,
          price: `$${bookingData.price}`,
          booking_id: bookingData.booking_id,
          manage_booking_link: `${window.location.origin}${createPageUrl('BookingHistory')}`,
          link: `${window.location.origin}${createPageUrl('BookingHistory')}`,
          phone: bookingData.client_phone,
          year: new Date().getFullYear()
        }
      );
      
      if (result.success) {
        setMessage(`✅ Notification sent successfully! Check ${bookingData.client_email}`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testPaymentFailed = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await NotificationDispatcher.sendNotificationFromTemplate(
        'email.system.payment_failed',
        paymentData.client_email,
        {
          first_name: 'Test User',
          booking_id: paymentData.booking_id,
          reason: paymentData.reason,
          payment_link: `${window.location.origin}${createPageUrl('Profile')}`,
          link: `${window.location.origin}${createPageUrl('Profile')}`,
          year: new Date().getFullYear()
        }
      );
      
      if (result.success) {
        setMessage(`✅ Payment failure notification sent to ${paymentData.client_email}`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testReliabilityUpdate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await NotificationDispatcher.sendReliabilityScoreUpdate(
        cleanerData.cleaner_email,
        cleanerData.cleaner_first_name,
        parseInt(cleanerData.new_score),
        parseInt(cleanerData.old_score)
      );
      
      if (result.success) {
        setMessage(`✅ Score update notification sent to ${cleanerData.cleaner_email}`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(createPageUrl('AdminDashboard'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-purple-600" />
            Test Notification System
          </h1>
          <p className="text-lg text-slate-600">
            Manually trigger notifications to test your templates
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-md p-1 mb-6">
            <TabsTrigger value="booking">Booking Confirmation</TabsTrigger>
            <TabsTrigger value="payment">Payment Failed</TabsTrigger>
            <TabsTrigger value="reliability">Reliability Score</TabsTrigger>
          </TabsList>

          {/* Booking Confirmation Test */}
          <TabsContent value="booking">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Test Booking Confirmation Email</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Client Email *</Label>
                      <Input
                        type="email"
                        value={bookingData.client_email}
                        onChange={(e) => setBookingData({...bookingData, client_email: e.target.value})}
                        placeholder="client@example.com"
                      />
                    </div>
                    <div>
                      <Label>Client First Name</Label>
                      <Input
                        value={bookingData.client_first_name}
                        onChange={(e) => setBookingData({...bookingData, client_first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Cleaner First Name</Label>
                      <Input
                        value={bookingData.cleaner_first_name}
                        onChange={(e) => setBookingData({...bookingData, cleaner_first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        value={bookingData.price}
                        onChange={(e) => setBookingData({...bookingData, price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Address</Label>
                    <Input
                      value={bookingData.address}
                      onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                    />
                  </div>

                  <Button
                    onClick={testBookingConfirmation}
                    disabled={loading || !bookingData.client_email}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Failed Test */}
          <TabsContent value="payment">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Test Payment Failed Email</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Client Email *</Label>
                    <Input
                      type="email"
                      value={paymentData.client_email}
                      onChange={(e) => setPaymentData({...paymentData, client_email: e.target.value})}
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <Label>Booking ID</Label>
                    <Input
                      value={paymentData.booking_id}
                      onChange={(e) => setPaymentData({...paymentData, booking_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Failure Reason</Label>
                    <Input
                      value={paymentData.reason}
                      onChange={(e) => setPaymentData({...paymentData, reason: e.target.value})}
                    />
                  </div>

                  <Button
                    onClick={testPaymentFailed}
                    disabled={loading || !paymentData.client_email}
                    className="w-full bg-red-500 hover:bg-red-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reliability Score Test */}
          <TabsContent value="reliability">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Test Reliability Score Update</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Cleaner Email *</Label>
                    <Input
                      type="email"
                      value={cleanerData.cleaner_email}
                      onChange={(e) => setCleanerData({...cleanerData, cleaner_email: e.target.value})}
                      placeholder="cleaner@example.com"
                    />
                  </div>
                  <div>
                    <Label>Cleaner First Name</Label>
                    <Input
                      value={cleanerData.cleaner_first_name}
                      onChange={(e) => setCleanerData({...cleanerData, cleaner_first_name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Old Score</Label>
                      <Input
                        type="number"
                        value={cleanerData.old_score}
                        onChange={(e) => setCleanerData({...cleanerData, old_score: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>New Score</Label>
                      <Input
                        type="number"
                        value={cleanerData.new_score}
                        onChange={(e) => setCleanerData({...cleanerData, new_score: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={testReliabilityUpdate}
                    disabled={loading || !cleanerData.cleaner_email}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Reference */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-sm">
              <p><strong>Template IDs:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><code>email.client.booking_confirmation</code> - Booking confirmed</li>
                <li><code>email.client.reminder_24h</code> - 24 hour reminder</li>
                <li><code>email.client.cleaning_completed</code> - Cleaning done</li>
                <li><code>email.client.review_request</code> - Ask for review</li>
                <li><code>email.system.payment_failed</code> - Payment issue</li>
                <li><code>email.cleaner.job_invited</code> - New job opportunity</li>
                <li><code>email.cleaner.reliability_changed</code> - Score update</li>
                <li><code>email.marketing.winback</code> - Re-engagement</li>
              </ul>
              
              <p className="pt-4"><strong>All sent messages are logged to:</strong></p>
              <p className="text-slate-600">Admin Dashboard → Communications → Message Delivery Logs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}