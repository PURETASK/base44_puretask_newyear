import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, Eye, RefreshCw, Download, Filter, Mail, MessageSquare, 
  CheckCircle, XCircle, Clock, AlertCircle, Send, ArrowLeft, Home,
  Calendar, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function AdminMessageLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [resending, setResending] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    opened: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, eventFilter, channelFilter, statusFilter, templateFilter, dateFrom, dateTo, logs]);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      await loadLogs();
    } catch (error) {
      handleError(error, { userMessage: 'Error checking admin access:', showToast: false });
      navigate(createPageUrl('Home'));
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await base44.entities.MessageDeliveryLog.list('-created_date', 500);
      setLogs(allLogs);
      
      // Calculate stats
      setStats({
        total: allLogs.length,
        sent: allLogs.filter(l => l.status === 'sent' || l.status === 'delivered').length,
        delivered: allLogs.filter(l => l.status === 'delivered').length,
        failed: allLogs.filter(l => l.status === 'failed' || l.status === 'bounced').length,
        opened: allLogs.filter(l => l.status === 'opened').length
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading message logs:', showToast: false });
    }
    setLoading(false);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.delivery_id?.toLowerCase().includes(search) ||
        log.recipient_email?.toLowerCase().includes(search) ||
        log.subject?.toLowerCase().includes(search) ||
        log.template_id?.toLowerCase().includes(search)
      );
    }

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(log => log.event_name === eventFilter);
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(log => log.channel === channelFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Template filter
    if (templateFilter !== 'all') {
      filtered = filtered.filter(log => log.template_id === templateFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_date);
        return logDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_date);
        return logDate <= new Date(dateTo);
      });
    }

    setFilteredLogs(filtered);
  };

  const handleResend = async (log) => {
    if (!log.can_retry) {
      alert('This message cannot be resent');
      return;
    }

    const confirmed = window.confirm(`Resend this ${log.channel} message to ${log.recipient_email}?`);
    if (!confirmed) return;

    setResending(log.id);
    try {
      // Create a new delivery log with retry flag
      await base44.entities.MessageDeliveryLog.create({
        delivery_id: `${log.delivery_id}-retry-${Date.now()}`,
        event_name: log.event_name,
        channel: log.channel,
        status: 'pending',
        template_id: log.template_id,
        recipient_email: log.recipient_email,
        recipient_phone: log.recipient_phone,
        subject: log.subject,
        body: log.body,
        metadata: {
          ...log.metadata,
          original_delivery_id: log.delivery_id,
          retry_of: log.id
        },
        retry_count: (log.retry_count || 0) + 1
      });

      // In a real implementation, trigger actual sending via integration
      if (log.channel === 'email') {
        await base44.integrations.Core.SendEmail({
          to: log.recipient_email,
          subject: log.subject,
          body: log.body
        });
      }

      alert('Message resent successfully!');
      await loadLogs();
    } catch (error) {
      handleError(error, { userMessage: 'Error resending message:', showToast: false });
      alert('Failed to resend message: ' + error.message);
    }
    setResending(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-orange-100 text-orange-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'opened':
      case 'clicked':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
      case 'sent':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
      case 'push':
      case 'in_app':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Delivery ID', 'Event', 'Channel', 'Status', 'Recipient', 'Subject', 'Sent At', 'Template'];
    const rows = filteredLogs.map(log => [
      log.delivery_id,
      log.event_name,
      log.channel,
      log.status,
      log.recipient_email,
      log.subject || 'N/A',
      log.sent_at ? format(new Date(log.sent_at), 'yyyy-MM-dd HH:mm:ss') : 'Not sent',
      log.template_id || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading message logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-10">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Navigation */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate(createPageUrl('AdminDashboard'))}
              className="flex items-center gap-2 bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700"
            >
              <Home className="w-4 h-4" />
              Admin Dashboard
            </Button>
            
            <div className="flex-1"></div>
            
            <Button onClick={loadLogs} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                Message Delivery Logs
              </h1>
              <p className="text-lg text-slate-600">Monitor and manage all outgoing messages</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Mail className="w-8 h-8 text-slate-500 mb-2" />
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-600">Total Messages</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <Send className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">{stats.sent}</p>
                <p className="text-sm opacity-90">Sent</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">{stats.delivered}</p>
                <p className="text-sm opacity-90">Delivered</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <Eye className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">{stats.opened}</p>
                <p className="text-sm opacity-90">Opened</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <XCircle className="w-8 h-8 mb-2" />
                <p className="text-3xl font-bold">{stats.failed}</p>
                <p className="text-sm opacity-90">Failed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by ID, email, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                  <SelectItem value="booking_reminder">Booking Reminder</SelectItem>
                  <SelectItem value="job_start_reminder">Job Start Reminder</SelectItem>
                  <SelectItem value="payment_success">Payment Success</SelectItem>
                  <SelectItem value="review_request">Review Request</SelectItem>
                  <SelectItem value="welcome_email">Welcome Email</SelectItem>
                  <SelectItem value="referral_reward">Referral Reward</SelectItem>
                </SelectContent>
              </Select>

              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
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

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Template ID</label>
                <Input
                  placeholder="Filter by template..."
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                />
              </div>
            </div>

            {(searchTerm || eventFilter !== 'all' || channelFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo || templateFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm text-slate-600">
                  Showing {filteredLogs.length} of {logs.length} messages
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setEventFilter('all');
                    setChannelFilter('all');
                    setStatusFilter('all');
                    setTemplateFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Logs Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-mono text-xs text-slate-600">
                          {log.delivery_id?.substring(0, 12)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {log.event_name?.replace(/_/g, ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(log.channel)}
                          <span className="text-sm capitalize">{log.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px] truncate">
                          {log.recipient_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[250px] truncate">
                          {log.subject || <span className="text-slate-400">No subject</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(log.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {log.sent_at ? format(new Date(log.sent_at), 'MMM d, HH:mm') : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono text-slate-500">
                          {log.template_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(log)}
                            disabled={!log.can_retry || resending === log.id}
                            className="hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {resending === log.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No message logs found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Modal */}
        {selectedLog && (
          <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-6 h-6 text-purple-600" />
                  Message Delivery Details
                </DialogTitle>
                <DialogDescription>
                  Delivery ID: {selectedLog.delivery_id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status & Metadata */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Status</label>
                    <Badge className={`${getStatusColor(selectedLog.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(selectedLog.status)}
                      {selectedLog.status}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Channel</label>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(selectedLog.channel)}
                      <span className="capitalize">{selectedLog.channel}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Event Type</label>
                    <p className="text-slate-900">{selectedLog.event_name?.replace(/_/g, ' ')}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Template ID</label>
                    <p className="text-slate-900 font-mono text-sm">{selectedLog.template_id || 'N/A'}</p>
                  </div>
                </div>

                {/* Recipient Info */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Recipient</label>
                  <p className="text-slate-900">{selectedLog.recipient_email}</p>
                  {selectedLog.recipient_phone && (
                    <p className="text-slate-600 text-sm">{selectedLog.recipient_phone}</p>
                  )}
                </div>

                {/* Subject & Body */}
                {selectedLog.subject && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Subject</label>
                    <p className="text-slate-900">{selectedLog.subject}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Message Body</label>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                      {selectedLog.body || 'No content available'}
                    </pre>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Created
                    </label>
                    <p className="text-sm text-slate-600">
                      {format(new Date(selectedLog.created_date), 'MMM d, yyyy HH:mm:ss')}
                    </p>
                  </div>

                  {selectedLog.sent_at && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1">
                        <Send className="w-4 h-4 inline mr-1" />
                        Sent
                      </label>
                      <p className="text-sm text-slate-600">
                        {format(new Date(selectedLog.sent_at), 'MMM d, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}

                  {selectedLog.delivered_at && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Delivered
                      </label>
                      <p className="text-sm text-slate-600">
                        {format(new Date(selectedLog.delivered_at), 'MMM d, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}

                  {selectedLog.opened_at && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1">
                        <Eye className="w-4 h-4 inline mr-1" />
                        Opened
                      </label>
                      <p className="text-sm text-slate-600">
                        {format(new Date(selectedLog.opened_at), 'MMM d, yyyy HH:mm:ss')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {selectedLog.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-red-700 block mb-1">
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Error Details
                    </label>
                    <p className="text-sm text-red-900">{selectedLog.error_message}</p>
                  </div>
                )}

                {/* Provider Info */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Provider</label>
                    <p className="text-sm text-slate-600 capitalize">{selectedLog.provider}</p>
                  </div>

                  {selectedLog.provider_message_id && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1">Provider Message ID</label>
                      <p className="text-sm text-slate-600 font-mono">{selectedLog.provider_message_id}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Retry Count</label>
                    <p className="text-sm text-slate-600">{selectedLog.retry_count || 0}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Can Retry</label>
                    <Badge variant={selectedLog.can_retry ? 'default' : 'secondary'}>
                      {selectedLog.can_retry ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Additional Metadata</label>
                    <pre className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Close
                </Button>
                {selectedLog.can_retry && (
                  <Button 
                    onClick={() => {
                      handleResend(selectedLog);
                      setSelectedLog(null);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Message
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}