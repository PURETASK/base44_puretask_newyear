import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

export default function VerificationTimeline({ user, cleanerProfile }) {
  const steps = [
    {
      id: 'signup',
      title: 'Account Created',
      completed: true,
      estimatedTime: '0 hours',
      description: 'Welcome to PureTask!'
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      completed: user.kyc_status === 'approved',
      inProgress: user.kyc_status === 'pending' || user.kyc_status === 'consider',
      failed: user.kyc_status === 'rejected',
      estimatedTime: '5-15 minutes',
      description: 'Verifying your government-issued ID'
    },
    {
      id: 'background',
      title: 'Background Check',
      completed: user.background_check_status === 'approved',
      inProgress: user.background_check_status === 'pending' || user.background_check_status === 'consider',
      failed: user.background_check_status === 'rejected',
      estimatedTime: '24-48 hours',
      description: 'Comprehensive background screening'
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      completed: cleanerProfile?.profile_completeness >= 80,
      inProgress: cleanerProfile && cleanerProfile.profile_completeness < 80,
      estimatedTime: '10 minutes',
      description: 'Add bio, services, and profile photo'
    },
    {
      id: 'approval',
      title: 'Final Review & Activation',
      completed: cleanerProfile?.is_active,
      inProgress: user.kyc_status === 'approved' && user.background_check_status === 'approved' && !cleanerProfile?.is_active,
      estimatedTime: '1-2 hours',
      description: 'Admin team final approval'
    }
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const estimatedCompletionTime = () => {
    if (user.background_check_status === 'pending') {
      return '24-48 hours';
    }
    if (user.kyc_status === 'pending') {
      return '15-30 minutes';
    }
    if (cleanerProfile?.is_active) {
      return 'Complete!';
    }
    if (user.kyc_status === 'approved' && user.background_check_status === 'approved') {
      return '1-2 hours';
    }
    return '48-72 hours';
  };

  const getStatusMessage = () => {
    if (user.kyc_status === 'rejected') {
      return 'Identity verification failed. Please contact support for assistance.';
    }
    if (user.background_check_status === 'rejected') {
      return 'Background check did not meet platform requirements. Please contact support.';
    }
    if (user.kyc_status === 'pending') {
      return 'We\'re verifying your identity. This usually takes 5-15 minutes. You\'ll receive an email when complete.';
    }
    if (user.background_check_status === 'pending') {
      return 'Your background check is in progress. This typically takes 24-48 hours. We\'ll email you as soon as it\'s complete.';
    }
    if (user.kyc_status === 'approved' && user.background_check_status === 'approved' && !cleanerProfile?.is_active) {
      return 'Great news! Our team is doing a final review. You\'ll be approved within 1-2 hours and can start accepting bookings!';
    }
    if (cleanerProfile?.profile_completeness < 80) {
      return 'Complete your profile to improve your chances of getting booked once approved!';
    }
    return 'Your application is being processed. Check back soon!';
  };

  const hasErrors = steps.some(s => s.failed);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <span>Verification Progress</span>
          {cleanerProfile?.is_active && (
            <Badge className="bg-emerald-500 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>{completedSteps} of {steps.length} steps complete</span>
            <span className="font-semibold">Est. {estimatedCompletionTime()}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : step.failed ? (
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                ) : step.inProgress ? (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{step.title}</h4>
                  {step.completed && (
                    <Badge className="bg-emerald-500 text-white text-xs">Complete</Badge>
                  )}
                  {step.inProgress && (
                    <Badge className="bg-blue-500 text-white text-xs">In Progress</Badge>
                  )}
                  {step.failed && (
                    <Badge className="bg-red-500 text-white text-xs">Failed</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-1">{step.description}</p>
                <p className="text-xs text-slate-500">Estimated time: {step.estimatedTime}</p>
              </div>
            </div>
          ))}
        </div>

        {!cleanerProfile?.is_active && (
          <div className={`mt-6 p-4 rounded-lg border ${
            hasErrors ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm ${hasErrors ? 'text-red-900' : 'text-blue-900'}`}>
              <strong>What's next?</strong> {getStatusMessage()}
            </p>
          </div>
        )}

        {cleanerProfile?.is_active && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-900">
              <strong>🎉 You're all set!</strong> Your profile is live and you can now accept bookings. Start browsing available jobs!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}