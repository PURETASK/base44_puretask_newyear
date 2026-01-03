import React, { useState } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import NotificationDispatcher from '../components/notifications/NotificationDispatcher';

export default function AdminTestBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    booking_id: `test_${Date.now()}`,
    client_id: '',
    client_first_name: 'Sarah',
    client_email: '',
    client_phone: '',
    cleaner_id: '',
    cleaner_first_name: 'Maria',
    cleaner_email: '',
    cleaner_phone: '',
    address: '123 Main St, Sacramento, CA 95814',
    start_time_iso: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    price: 139,
    manage_url: ''
  });

  const handleEmit = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Create client and cleaner objects
      const client = {
        id: formData.client_id,
        first_name: formData.client_first_name,
        email: formData.client_email,
        phone: formData.client_phone
      };
      
      const cleaner = {
        id: formData.cleaner_id,
        first_name: formData.cleaner_first_name,
        email: formData.cleaner_email,
        phone: formData.cleaner_phone
      };
      
      // Mock booking object for notification
      const booking = {
        id: formData.booking_id,
        client_email: formData.client_email,
        cleaner_email: formData.cleaner_email,
        date: formData.start_time_iso.split('T')[0],
        start_time: new Date(formData.start_time_iso).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        address: formData.address,
        total_price: formData.price,
        tasks: ['Standard Clean']
      };
      
      // Send booking confirmation to client
      const clientResult = await NotificationDispatcher.sendBookingConfirmation(
        booking,
        { full_name: formData.client_first_name, phone: formData.client_phone },
        { full_name: formData.cleaner_first_name }
      );
      
      // Send job invite to cleaner
      const cleanerResult = await NotificationDispatcher.sendJobInvite(
        booking,
        formData.cleaner_email,
        formData.cleaner_first_name
      );
      
      setMessage(`✅ Event emitted successfully!\n- Client notification: ${clientResult.success ? 'sent' : 'failed'}\n- Cleaner notification: ${cleanerResult.success ? 'sent' : 'failed'}`);
    } catch (error) {
      handleError(error, { userMessage: 'Emit error:', showToast: false });
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

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Test Booking Events</h1>
        <p className="text-lg text-slate-600 mb-8">
          Manually trigger booking.created event
        </p>

        {message && (
          <Alert className="mb-6">
            <AlertDescription className="whitespace-pre-line">{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Client Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle>Client Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Client ID</Label>
                <Input
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  placeholder="client_123"
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.client_first_name}
                  onChange={(e) => setFormData({...formData, client_first_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                  placeholder="+15551234567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cleaner Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle>Cleaner Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Cleaner ID</Label>
                <Input
                  value={formData.cleaner_id}
                  onChange={(e) => setFormData({...formData, cleaner_id: e.target.value})}
                  placeholder="cleaner_456"
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.cleaner_first_name}
                  onChange={(e) => setFormData({...formData, cleaner_first_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.cleaner_email}
                  onChange={(e) => setFormData({...formData, cleaner_email: e.target.value})}
                  placeholder="cleaner@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.cleaner_phone}
                  onChange={(e) => setFormData({...formData, cleaner_phone: e.target.value})}
                  placeholder="+15551234567"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Details */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Booking Details</CardTitle>
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
                <Label>Service Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label>Start Time (ISO)</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_time_iso.slice(0, 16)}
                  onChange={(e) => setFormData({...formData, start_time_iso: new Date(e.target.value).toISOString()})}
                />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Emit Event</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-4">
              This will trigger <code className="bg-slate-100 px-2 py-1 rounded">booking.created</code> event
              and send confirmation emails to both client and cleaner.
            </p>
            <Button
              onClick={handleEmit}
              disabled={loading || !formData.client_email || !formData.cleaner_email}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Emitting Event...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Emit booking.created
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}