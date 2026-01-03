import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Flag, CheckCircle, XCircle, Loader2, AlertTriangle, Calendar, Shield, Bell, Lock, Ban, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminRiskFlags() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState([]);
  const [filter, setFilter] = useState('open');
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [riskProfiles, setRiskProfiles] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadFlags();
  }, [filter, startDate, endDate]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
    }
  };

  const loadFlags = async () => {
    setLoading(true);
    try {
      let flagList;
      if (filter === 'all') {
        flagList = await base44.entities.RiskFlag.list('-created_date', 200);
      } else {
        flagList = await base44.entities.RiskFlag.filter({ status: filter });
      }
      
      // Apply date range filtering
      if (startDate || endDate) {
        flagList = flagList.filter(flag => {
          const flagDate = new Date(flag.created_date);
          if (startDate && flagDate < new Date(startDate)) return false;
          if (endDate && flagDate > new Date(endDate + 'T23:59:59')) return false;
          return true;
        });
      }

      setFlags(flagList);

      // Load risk profiles for each unique subject
      const uniqueSubjects = [...new Set(flagList.map(f => f.subject_id))];
      await loadRiskProfiles(uniqueSubjects);

      setLoading(false);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading flags:', showToast: false });
      setLoading(false);
    }
  };

  const loadRiskProfiles = async (subjectIds) => {
    try {
      const profiles = {};
      for (const subjectId of subjectIds) {
        const profile = await base44.entities.RiskProfile.filter({ user_email: subjectId });
        if (profile.length > 0) {
          profiles[subjectId] = profile[0];
        }
      }
      setRiskProfiles(profiles);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading risk profiles:', showToast: false });
    }
  };

  const logAuditAction = async (actionType, targetId, metadata) => {
    if (!currentUser) return;
    
    try {
      await base44.entities.AdminAuditLog.create({
        admin_email: currentUser.email,
        action_type: actionType,
        target_type: 'risk_flag',
        target_id: targetId,
        metadata: metadata
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error logging audit action:', showToast: false });
    }
  };

  const sendNotification = async (recipientEmail, type, title, message) => {
    try {
      await base44.entities.Notification.create({
        recipient_email: recipientEmail,
        type: type,
        title: title,
        message: message,
        priority: 'high'
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error sending notification:', showToast: false });
    }
  };

  const handleResolve = async (flagId) => {
    try {
      const flag = flags.find(f => f.id === flagId);
      
      await base44.entities.RiskFlag.update(flagId, {
        status: 'resolved',
        notes: resolutionNotes || 'Resolved by admin'
      });

      // Log audit trail
      await logAuditAction('RESOLVE_RISK_FLAG', flagId, {
        flag_rule: flag?.triggered_rule,
        resolution_notes: resolutionNotes || 'Resolved by admin',
        subject_id: flag?.subject_id
      });
      
      toast.success('Risk flag resolved');
      setResolutionNotes('');
      setSelectedFlag(null);
      loadFlags();
    } catch (error) {
      handleError(error, { userMessage: 'Error resolving flag:', showToast: false });
      toast.error('Failed to resolve flag');
    }
  };

  const handleDismiss = async (flagId) => {
    try {
      const flag = flags.find(f => f.id === flagId);
      
      await base44.entities.RiskFlag.update(flagId, {
        status: 'dismissed',
        notes: 'Dismissed by admin - false positive'
      });

      // Log audit trail
      await logAuditAction('DISMISS_RISK_FLAG', flagId, {
        flag_rule: flag?.triggered_rule,
        reason: 'false positive',
        subject_id: flag?.subject_id
      });
      
      toast.success('Risk flag dismissed');
      loadFlags();
    } catch (error) {
      handleError(error, { userMessage: 'Error dismissing flag:', showToast: false });
      toast.error('Failed to dismiss flag');
    }
  };

  const handleBulkResolve = async () => {
    if (selectedFlags.length === 0) return;
    
    try {
      for (const flagId of selectedFlags) {
        const flag = flags.find(f => f.id === flagId);
        await base44.entities.RiskFlag.update(flagId, {
          status: 'resolved',
          notes: 'Bulk resolved by admin'
        });
        await logAuditAction('BULK_RESOLVE_RISK_FLAG', flagId, {
          flag_rule: flag?.triggered_rule,
          bulk_action: true
        });
      }
      
      toast.success(`${selectedFlags.length} flags resolved`);
      setSelectedFlags([]);
      loadFlags();
    } catch (error) {
      handleError(error, { userMessage: 'Error bulk resolving:', showToast: false });
      toast.error('Failed to resolve flags');
    }
  };

  const handleBulkDismiss = async () => {
    if (selectedFlags.length === 0) return;
    
    try {
      for (const flagId of selectedFlags) {
        const flag = flags.find(f => f.id === flagId);
        await base44.entities.RiskFlag.update(flagId, {
          status: 'dismissed',
          notes: 'Bulk dismissed by admin'
        });
        await logAuditAction('BULK_DISMISS_RISK_FLAG', flagId, {
          flag_rule: flag?.triggered_rule,
          bulk_action: true
        });
      }
      
      toast.success(`${selectedFlags.length} flags dismissed`);
      setSelectedFlags([]);
      loadFlags();
    } catch (error) {
      handleError(error, { userMessage: 'Error bulk dismissing:', showToast: false });
      toast.error('Failed to dismiss flags');
    }
  };

  const handleAutomatedAction = async (flag, action) => {
    setActionTarget(flag);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const executeAutomatedAction = async () => {
    if (!actionTarget || !actionType) return;

    try {
      const actionData = {
        user_type: actionTarget.subject_type === 'client' ? 'client' : 'cleaner',
        user_email: actionTarget.subject_id,
        action_type: actionType,
        action_direction: 'apply',
        reason_code: actionTarget.category,
        severity: actionTarget.severity,
        performed_by: 'admin',
        performed_by_email: currentUser?.email,
        target_type: 'account',
        target_id: actionTarget.subject_id,
        metadata: {
          triggered_by_flag: actionTarget.id,
          triggered_rule: actionTarget.triggered_rule,
          confidence: actionTarget.confidence
        }
      };

      await base44.entities.RiskActionLog.create(actionData);

      // Send notification to user
      await sendNotification(
        actionTarget.subject_id,
        'system_alert',
        'Account Action Taken',
        `An automated action has been applied to your account due to security reasons. Please contact support if you have questions.`
      );

      // Log audit trail
      await logAuditAction('APPLY_AUTOMATED_ACTION', actionTarget.id, {
        action_type: actionType,
        subject_id: actionTarget.subject_id,
        triggered_by_flag: actionTarget.id
      });

      toast.success(`Action "${actionType}" applied successfully`);
      setActionDialogOpen(false);
      setActionTarget(null);
      setActionType(null);
    } catch (error) {
      handleError(error, { userMessage: 'Error executing automated action:', showToast: false });
      toast.error('Failed to apply action');
    }
  };

  const toggleFlagSelection = (flagId) => {
    setSelectedFlags(prev => 
      prev.includes(flagId) 
        ? prev.filter(id => id !== flagId)
        : [...prev, flagId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFlags.length === flags.length) {
      setSelectedFlags([]);
    } else {
      setSelectedFlags(flags.map(f => f.id));
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-amber-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'safety_issue': return 'bg-red-100 text-red-800';
      case 'payment_risk': return 'bg-purple-100 text-purple-800';
      case 'refund_abuse': return 'bg-amber-100 text-amber-800';
      case 'reliability_risk': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-soft-cloud p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Risk Flags</h1>
            <p className="text-gray-600 font-verdana mt-2">Review and manage automated risk detections</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'open' ? 'default' : 'outline'}
              onClick={() => setFilter('open')}
              className="font-fredoka"
            >
              Open ({flags.filter(f => f.status === 'open').length})
            </Button>
            <Button
              variant={filter === 'under_review' ? 'default' : 'outline'}
              onClick={() => setFilter('under_review')}
              className="font-fredoka"
            >
              Under Review
            </Button>
            <Button
              variant={filter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setFilter('resolved')}
              className="font-fredoka"
            >
              Resolved
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="font-fredoka"
            >
              All
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="startDate" className="font-fredoka font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="font-fredoka font-semibold mb-2">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="font-fredoka"
              >
                Clear Dates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedFlags.length > 0 && (
          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-fredoka font-bold text-graphite">
                  {selectedFlags.length} flag{selectedFlags.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkResolve}
                    className="bg-green-600 hover:bg-green-700 font-fredoka"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve Selected
                  </Button>
                  <Button
                    onClick={handleBulkDismiss}
                    variant="outline"
                    className="font-fredoka"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Dismiss Selected
                  </Button>
                  <Button
                    onClick={() => setSelectedFlags([])}
                    variant="ghost"
                    className="font-fredoka"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Total Open</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-graphite">
                {flags.filter(f => f.status === 'open').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-red-600">
                {flags.filter(f => f.severity === 'critical' && f.status === 'open').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-amber-600">
                {flags.filter(f => f.severity === 'high' && f.status === 'open').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-verdana text-gray-600">Auto-Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-fredoka font-bold text-puretask-blue">
                {flags.filter(f => f.detected_by === 'automation').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Flags List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
          </div>
        ) : flags.length > 0 ? (
          <div className="space-y-4">
            {/* Select All */}
            {flags.length > 0 && (
              <div className="flex items-center gap-2 px-2">
                <Checkbox
                  checked={selectedFlags.length === flags.length}
                  onCheckedChange={toggleSelectAll}
                />
                <Label className="font-fredoka text-sm text-gray-600 cursor-pointer" onClick={toggleSelectAll}>
                  Select All ({flags.length})
                </Label>
              </div>
            )}

            {flags.map((flag, idx) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-2 ${
                  flag.severity === 'critical' ? 'border-red-500' :
                  flag.severity === 'high' ? 'border-amber-500' :
                  'border-gray-300'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedFlags.includes(flag.id)}
                        onCheckedChange={() => toggleFlagSelection(flag.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Flag className="w-5 h-5 text-red-600" />
                          <h3 className="font-fredoka font-bold text-lg text-graphite">
                            {flag.triggered_rule.replace(/_/g, ' ')}
                          </h3>
                          <Badge className={`font-fredoka ${getSeverityColor(flag.severity)}`}>
                            {flag.severity}
                          </Badge>
                          <Badge className={`font-fredoka ${getCategoryColor(flag.category)}`}>
                            {flag.category.replace(/_/g, ' ')}
                          </Badge>
                          {riskProfiles[flag.subject_id] && (
                            <Badge className="bg-purple-100 text-purple-800 font-fredoka flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Risk Score: {riskProfiles[flag.subject_id].risk_score}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-3 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Subject</p>
                            <p className="font-verdana text-sm font-semibold">
                              {flag.subject_type}: {flag.subject_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Confidence</p>
                            <p className="font-fredoka text-lg font-bold text-graphite">
                              {flag.confidence}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-verdana">Detected By</p>
                            <p className="font-verdana text-sm capitalize">{flag.detected_by}</p>
                          </div>
                        </div>
                        
                        {flag.metadata && (
                          <div className="bg-blue-50 rounded-lg p-3 text-xs font-verdana mb-3">
                            <p className="font-semibold mb-2">Metadata:</p>
                            <pre className="text-gray-700">{JSON.stringify(flag.metadata, null, 2)}</pre>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 font-verdana">
                          Created: {new Date(flag.created_date).toLocaleString()}
                        </p>
                      </div>
                      
                      {flag.status === 'open' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => setSelectedFlag(flag.id)}
                            className="bg-green-600 hover:bg-green-700 font-fredoka"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                          <Button
                            onClick={() => handleDismiss(flag.id)}
                            variant="outline"
                            className="font-fredoka text-gray-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Dismiss
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="font-fredoka">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleAutomatedAction(flag, 'restricted_account')}>
                                <Lock className="w-4 h-4 mr-2" />
                                Restrict Account
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAutomatedAction(flag, 'blocked_account')}>
                                <Ban className="w-4 h-4 mr-2" />
                                Block Account
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAutomatedAction(flag, 'soft_lock_payment')}>
                                <Shield className="w-4 h-4 mr-2" />
                                Soft Lock Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAutomatedAction(flag, 'require_verification')}>
                                <UserX className="w-4 h-4 mr-2" />
                                Require Verification
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    {/* Resolution Form */}
                    {selectedFlag === flag.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Textarea
                          placeholder="Add resolution notes..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="mb-3 font-verdana"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleResolve(flag.id)}
                            className="bg-green-600 hover:bg-green-700 font-fredoka"
                          >
                            Confirm Resolution
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedFlag(null);
                              setResolutionNotes('');
                            }}
                            variant="outline"
                            className="font-fredoka"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-fredoka font-bold text-graphite">No {filter} flags</p>
            </CardContent>
          </Card>
        )}

        {/* Automated Action Confirmation Dialog */}
        <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-fredoka">Confirm Automated Action</AlertDialogTitle>
              <AlertDialogDescription className="font-verdana">
                Are you sure you want to apply "{actionType?.replace(/_/g, ' ')}" to user <strong>{actionTarget?.subject_id}</strong>?
                <br /><br />
                This action will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create a RiskActionLog entry</li>
                  <li>Send a notification to the user</li>
                  <li>Log an audit trail</li>
                  <li>May restrict user access based on action type</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setActionDialogOpen(false);
                setActionTarget(null);
                setActionType(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={executeAutomatedAction}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm Action
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}