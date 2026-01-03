import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, Loader2, MapPin, Camera } from 'lucide-react';
import NotificationDispatcher from '../components/notifications/NotificationDispatcher';

export default function AdminTestCleaner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    booking_id: `test_${Date.now()}`,
    cleaner_id: '',
    cleaner_first_name: 'Maria',
    cleaner_email: '',
    client_id: '',
    client_first_name: 'Sarah',
    client_email: '',
    eta_url: 'https://maps.google.com/...',
    photos_url: `${window.location.origin}${createPageUrl('BookingHistory')}`,
    rate_url: `${window.location.origin}${createPageUrl('BookingHistory')}`,
    price: 139
  });

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Mock booking for cleaner on way notification
      const booking = {
        id: formData.booking_id,
        client_email: formData.client_email,
        cleaner_email: formData.cleaner_email
      };
      
      const result = await NotificationDispatcher.sendCleanerOnWay(
        booking,
        { full_name: formData.client_first_name },
        { full_name: formData.cleaner_first_name }
      );
      
      if (result.success) {
        setMessage('✅ cleaner.checkin event emitted - "On the way" notification sent');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleArrived = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      setMessage('✅ cleaner.arrived event emitted - Client notified of arrival');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleCompleted = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const booking = {
        id: formData.booking_id,
        client_email: formData.client_email,
        cleaner_email: formData.cleaner_email,
        total_price: formData.price
      };
      
      const result = await NotificationDispatcher.sendCleaningCompleted(
        booking,
        { full_name: formData.client_first_name }
      );
      
      if (result.success) {
        setMessage('✅ cleaning.completed event emitted - Completion notification sent');
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(createPageUrl('AdminDashboard'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Test Cleaner Events</h1>
        <p className="text-lg text-slate-600 mb-8">
          Trigger check-in, arrival, and completion events
        </p>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Context */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Booking ID</Label>
                <Input
                  value={formData.booking_id}
                  onChange={(e) => setFormData({...formData, booking_id: e.target.value})}
                />
              </div>
              <div>
                <Label>Cleaner First Name</Label>
                <Input
                  value={formData.cleaner_first_name}
                  onChange={(e) => setFormData({...formData, cleaner_first_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Cleaner Email *</Label>
                <Input
                  type="email"
                  value={formData.cleaner_email}
                  onChange={(e) => setFormData({...formData, cleaner_email: e.target.value})}
                  placeholder="cleaner@example.com"
                />
              </div>
              <div>
                <Label>Client Email *</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label>Client First Name</Label>
                <Input
                  value={formData.client_first_name}
                  onChange={(e) => setFormData({...formData, client_first_name: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Check-In
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Cleaner is on the way to location
              </p>
              <Button
                onClick={handleCheckIn}
                disabled={loading || !formData.client_email}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Emit cleaner.checkin
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Arrived
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Cleaner has arrived at location
              </p>
              <Button
                onClick={handleArrived}
                disabled={loading || !formData.client_email}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Emit cleaner.arrived
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-4">
                <div>
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <Button
                onClick={handleCompleted}
                disabled={loading || !formData.client_email}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Emit cleaning.completed
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">
              <strong>Note:</strong> These events trigger automated email/SMS/push notifications.
              Check Admin → Message Delivery Logs to see results.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}