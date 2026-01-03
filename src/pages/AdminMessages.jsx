
import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail, Search, Filter, Eye, RefreshCw, Loader2, Send, CheckCircle,
  XCircle, Clock, AlertCircle, ArrowLeft, Home, Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminMessages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [resending, setResending] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    delivery_id: '',
    event_name: 'all',
    channel: 'all',
    status: 'all',
    template_id: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, messages]);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);
    } catch (error) {
      handleError(error, { userMessage: 'Auth error:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const allMessages = await base44.entities.MessageDeliveryLog.list('-created_date', 500);
      setMessages(allMessages);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading messages:', showToast: false });
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Delivery ID filter
    if (filters.delivery_id.trim()) {
      filtered = filtered.filter(msg => 
        msg.delivery_id?.toLowerCase().includes(filters.delivery_id.toLowerCase())
      );
    }

    // Event name filter
    if (filters.event_name !== 'all') {
      filtered = filtered.filter(msg => msg.event_name === filters.event_name);
    }

    // Channel filter
    if (filters.channel !== 'all') {
      filtered = filtered.filter(msg => msg.channel === filters.channel);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(msg => msg.status === filters.status);
    }

    // Template ID filter
    if (filters.template_id.trim()) {
      filtered = filtered.filter(msg => 
        msg.template_id?.toLowerCase().includes(filters.template_id.toLowerCase())
      );
    }

    // Date range filter
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      filtered = filtered.filter(msg => 
        new Date(msg.created_date) >= fromDate
      );
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(msg => 
        new Date(msg.created_date) <= toDate
      );
    }

    setFilteredMessages(filtered);
  };

  const handleResend = async (message) => {
    if (!message.can_retry) {
      alert('This message cannot be resent');
      return;
    }

    const confirmed = confirm('Are you sure you want to resend this message?');
    if (!confirmed) return;

    setResending(true);
    try {
      // Create a new delivery log entry for the resend
      await base44.entities.MessageDeliveryLog.create({
        delivery_id: `${message.delivery_id}-resend-${Date.now()}`,
        event_name: message.event_name,
        channel: message.channel,
        status: 'pending',
        template_id: message.template_id,
        recipient_email: message.recipient_email,
        recipient_phone: message.recipient_phone,
        subject: message.subject,
        body: message.body,
        metadata: message.metadata,
        provider: message.provider,
        retry_count: (message.retry_count || 0) + 1,
        can_retry: true
      });

      // If email, attempt to send
      if (message.channel === 'email') {
        try {
          await base44.integrations.Core.SendEmail({
            to: message.recipient_email,
            subject: message.subject || 'Message from PureTask',
            body: message.body || 'No content available'
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      alert('Message resend initiated successfully');
      loadMessages();
    } catch (error) {
      handleError(error, { userMessage: 'Error resending message:', showToast: false });
      alert('Failed to resend message');
    }
    setResending(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-red-100 text-red-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'opened':
      case 'clicked':
        return <Eye className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Send className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const clearFilters = () => {
    setFilters({
      delivery_id: '',
      event_name: 'all',
      channel: 'all',
      status: 'all',
      template_id: '',
      date_from: '',
      date_to: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#66B3FF] to-white p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-lg text-white font-verdana">Loading message delivery logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#66B3FF] to-white p-6 lg:p-10">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl('AdminDashboard'))}
              className="bg-white hover:bg-gray-50 rounded-full font-fredoka"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl('Home'))}
              className="bg-white hover:bg-gray-50 rounded-full font-fredoka"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-white mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                Message Delivery Logs
              </h1>
              <p className="text-lg text-white font-verdana" style={{ opacity: 0.9 }}>
                Monitor and manage all system message deliveries
              </p>
            </div>

            <Button onClick={loadMessages} variant="outline" className="bg-white hover:bg-gray-50 rounded-full font-fredoka">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Messages</p>
                  <p className="text-3xl font-bold text-blue-600">{messages.length}</p>
                </div>
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">
                    {messages.filter(m => m.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600">
                    {messages.filter(m => m.status === 'failed' || m.status === 'bounced').length}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Opened</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {messages.filter(m => m.status === 'opened' || m.status === 'clicked').length}
                  </p>
                </div>
                <Eye className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label>Delivery ID</Label>
                <Input
                  placeholder="Search by ID..."
                  value={filters.delivery_id}
                  onChange={(e) => setFilters({...filters, delivery_id: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Event Type</Label>
                <Select value={filters.event_name} onValueChange={(value) => setFilters({...filters, event_name: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                    <SelectItem value="booking_reminder">Booking Reminder</SelectItem>
                    <SelectItem value="job_start_reminder">Job Start Reminder</SelectItem>
                    <SelectItem value="payment_success">Payment Success</SelectItem>
                    <SelectItem value="review_request">Review Request</SelectItem>
                    <SelectItem value="cleaner_notification">Cleaner Notification</SelectItem>
                    <SelectItem value="dispute_opened">Dispute Opened</SelectItem>
                    <SelectItem value="welcome_email">Welcome Email</SelectItem>
                    <SelectItem value="referral_reward">Referral Reward</SelectItem>
                    <SelectItem value="subscription_reminder">Subscription Reminder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Channel</Label>
                <Select value={filters.channel} onValueChange={(value) => setFilters({...filters, channel: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="clicked">Clicked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Template ID</Label>
                <Input
                  placeholder="Search by template..."
                  value={filters.template_id}
                  onChange={(e) => setFilters({...filters, template_id: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              Showing {filteredMessages.length} of {messages.length} messages
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No messages found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-mono text-xs">
                          {message.delivery_id?.substring(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {message.event_name?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(message.channel)}
                            <span className="capitalize">{message.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {message.recipient_email || message.recipient_phone}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(message.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(message.status)}
                              <span className="capitalize">{message.status}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {message.template_id || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {message.sent_at 
                            ? formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedMessage(message)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResend(message)}
                              disabled={!message.can_retry || resending}
                            >
                              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        {selectedMessage && (
          <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Message Delivery Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Delivery ID</Label>
                    <p className="font-mono text-sm">{selectedMessage.delivery_id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Event Type</Label>
                    <p className="text-sm capitalize">{selectedMessage.event_name?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Channel</Label>
                    <p className="text-sm capitalize">{selectedMessage.channel}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Status</Label>
                    <Badge className={getStatusColor(selectedMessage.status)}>
                      {selectedMessage.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Recipient</Label>
                    <p className="text-sm">{selectedMessage.recipient_email || selectedMessage.recipient_phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Provider</Label>
                    <p className="text-sm capitalize">{selectedMessage.provider || 'Internal'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Sent At</Label>
                    <p className="text-sm">
                      {selectedMessage.sent_at 
                        ? new Date(selectedMessage.sent_at).toLocaleString()
                        : 'Not sent yet'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Retry Count</Label>
                    <p className="text-sm">{selectedMessage.retry_count || 0}</p>
                  </div>
                </div>

                {selectedMessage.subject && (
                  <div>
                    <Label className="text-xs text-slate-500">Subject</Label>
                    <p className="text-sm font-medium mt-1">{selectedMessage.subject}</p>
                  </div>
                )}

                {selectedMessage.body && (
                  <div>
                    <Label className="text-xs text-slate-500">Message Body</Label>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm whitespace-pre-wrap">{selectedMessage.body}</p>
                    </div>
                  </div>
                )}

                {selectedMessage.error_message && (
                  <div>
                    <Label className="text-xs text-red-500">Error Message</Label>
                    <div className="mt-1 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-900">{selectedMessage.error_message}</p>
                    </div>
                  </div>
                )}

                {selectedMessage.metadata && (
                  <div>
                    <Label className="text-xs text-slate-500">Metadata</Label>
                    <pre className="mt-1 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs overflow-x-auto">
                      {JSON.stringify(selectedMessage.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMessage(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedMessage.can_retry && (
                    <Button
                      onClick={() => {
                        handleResend(selectedMessage);
                        setSelectedMessage(null);
                      }}
                      disabled={resending}
                      className="flex-1"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                      Resend Message
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
