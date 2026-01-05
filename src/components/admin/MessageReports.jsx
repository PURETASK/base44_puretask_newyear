
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Flag, CheckCircle, XCircle, Eye, Loader2, Trash2 } from 'lucide-react';
import { formatBookingDate } from '../utils/dateHelpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function MessageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null); // New state for viewing message
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const allReports = await base44.entities.ReportedMessage.list('-created_date');
      
      // Load message details for each report
      const reportsWithMessages = await Promise.all(
        allReports.map(async (report) => {
          try {
            const message = await base44.entities.Message.get(report.message_id);
            return { ...report, message };
          } catch (error) {
            // If message is not found (e.g., already deleted), or any other error
            console.warn(`Message ${report.message_id} not found for report ${report.id}.`, error);
            return { ...report, message: null };
          }
        })
      );
      
      setReports(reportsWithMessages);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
    setLoading(false);
  };

  const handleViewMessage = (report) => {
    setSelectedMessage(report.message);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message permanently? This will remove it for all participants and cannot be undone.')) {
      return;
    }

    try {
      const currentUser = await base44.auth.me();
      
      // Fetch the message and its thread to get all participants
      const message = await base44.entities.Message.get(messageId);
      if (!message) {
        alert('Message not found.');
        return;
      }
      
      const thread = await base44.entities.ConversationThread.get(message.thread_id);
      if (!thread) {
        alert('Conversation thread not found for this message.');
        return;
      }

      // Update the message to mark it as deleted for all participants
      await base44.entities.Message.update(messageId, {
        deleted_for: thread.participants // Assuming participants is an array of user IDs/emails
      });

      // Log the admin action
      await base44.entities.Event.create({
        event_type: 'admin_action',
        user_email: currentUser.email,
        details: `Admin deleted reported message ${messageId} from thread ${message.thread_id}`
      });

      alert('Message successfully deleted for all participants.');
      setSelectedMessage(null); // Close message view dialog
      loadReports(); // Refresh the list of reports
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please check console for details.');
    }
  };

  const handleResolve = async (status) => {
    if (!resolution.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    setResolving(true);
    try {
      const currentUser = await base44.auth.me();
      
      await base44.entities.ReportedMessage.update(selectedReport.id, {
        status: status,
        resolution: resolution.trim(),
        reviewed_by: currentUser.email
      });

      setSelectedReport(null);
      setResolution('');
      loadReports();
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Failed to resolve report');
    }
    setResolving(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-500';
      case 'reviewing': return 'bg-amber-500';
      case 'resolved': return 'bg-green-500';
      case 'dismissed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      spam: 'Spam',
      harassment: 'Harassment',
      inappropriate_content: 'Inappropriate Content',
      scam: 'Scam',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'reviewing');
  const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'dismissed');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Reports</p>
                <p className="text-3xl font-bold text-red-600">{pendingReports.length}</p>
              </div>
              <Flag className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resolved This Month</p>
                <p className="text-3xl font-bold text-green-600">{resolvedReports.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Pending Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg text-slate-600">No pending reports!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map(report => (
                <Card key={report.id} className="border-2 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Reported by: {report.reporter_email}
                        </p>
                        <p className="text-sm text-slate-600 mb-1">
                          Reported user: {report.reported_user_email}
                        </p>
                        <p className="text-sm text-slate-600">
                          Date: {formatBookingDate(report.created_date)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {report.message && ( // Only show if message data is available
                          <Button
                            onClick={() => handleViewMessage(report)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Message
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setSelectedReport(report);
                            setResolution('');
                          }}
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>

                    {report.description && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-700">{report.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reported Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>From:</strong> {selectedMessage.sender_email}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>To:</strong> {selectedMessage.receiver_email}
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  <strong>Sent:</strong> {formatBookingDate(selectedMessage.created_date)}
                </p>
                <div className="bg-white p-4 rounded border border-slate-200">
                  <p className="text-slate-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
                {selectedMessage.attachment_url && (
                  <div className="mt-3">
                    <a
                      href={selectedMessage.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Report Details */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Report Details</h4>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Reason:</strong> {getReasonLabel(selectedReport.reason)}
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Reporter:</strong> {selectedReport.reporter_email}
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Reported User:</strong> {selectedReport.reported_user_email}
                </p>
                {selectedReport.description && (
                  <p className="text-sm text-slate-700">
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                )}
              </div>

              {/* Resolution Notes */}
              <div>
                <Label>Resolution Notes *</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Explain how this report was handled and any actions taken..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="flex-1"
                  disabled={resolving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleResolve('dismissed')}
                  disabled={resolving || !resolution.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {resolving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleResolve('resolved')}
                  disabled={resolving || !resolution.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {resolving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
