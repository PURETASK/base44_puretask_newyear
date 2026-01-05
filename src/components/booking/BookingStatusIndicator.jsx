import React from 'react';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2, 
  MessageSquare, Navigation, Camera, Shield, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function BookingStatusIndicator({ status, context = 'full' }) {
  const statusConfig = {
    created: {
      icon: Clock,
      label: 'Creating',
      color: 'bg-gray-100 text-gray-700',
      description: 'Setting up your booking...',
      userAction: null
    },
    payment_hold: {
      icon: Shield,
      label: 'Payment Secured',
      color: 'bg-blue-100 text-blue-700',
      description: 'Credits held safely in escrow',
      userAction: null
    },
    awaiting_cleaner_response: {
      icon: Loader2,
      label: 'Awaiting Response',
      color: 'bg-yellow-100 text-yellow-700',
      description: 'Cleaner reviewing your request (24h window)',
      userAction: 'Wait for cleaner to accept',
      animated: true
    },
    checking_fallback: {
      icon: Loader2,
      label: 'Finding Cleaner',
      color: 'bg-blue-100 text-blue-700',
      description: 'Checking with alternative cleaners...',
      userAction: 'We\'re on it - you\'ll be notified soon',
      animated: true
    },
    open_to_fallbacks: {
      icon: MessageSquare,
      label: 'Open Request',
      color: 'bg-purple-100 text-purple-700',
      description: 'Multiple cleaners reviewing your request',
      userAction: 'First to accept gets the job!'
    },
    accepted: {
      icon: CheckCircle2,
      label: 'Accepted',
      color: 'bg-green-100 text-green-700',
      description: 'Cleaner accepted your booking!',
      userAction: null
    },
    scheduled: {
      icon: Calendar,
      label: 'Scheduled',
      color: 'bg-blue-100 text-blue-700',
      description: 'All set for your cleaning day',
      userAction: 'Cleaner will notify when on the way'
    },
    on_the_way: {
      icon: Navigation,
      label: 'On The Way',
      color: 'bg-blue-100 text-blue-700',
      description: 'Cleaner is traveling to your location',
      userAction: 'Prepare for arrival'
    },
    in_progress: {
      icon: Loader2,
      label: 'Cleaning',
      color: 'bg-purple-100 text-purple-700',
      description: 'Cleaner is working on your space',
      userAction: 'In progress...',
      animated: true
    },
    completed: {
      icon: Camera,
      label: 'Completed',
      color: 'bg-green-100 text-green-700',
      description: 'Cleaner finished and uploaded photos',
      userAction: 'Review within 12 hours'
    },
    awaiting_client: {
      icon: AlertCircle,
      label: 'Review Needed',
      color: 'bg-orange-100 text-orange-700',
      description: 'Please review the completed job',
      userAction: 'Review now or auto-approves in 12h',
      urgent: true
    },
    approved: {
      icon: CheckCircle2,
      label: 'Approved',
      color: 'bg-green-100 text-green-700',
      description: 'Job approved, payment settled',
      userAction: null
    },
    cancelled: {
      icon: XCircle,
      label: 'Cancelled',
      color: 'bg-red-100 text-red-700',
      description: 'Booking was cancelled',
      userAction: null
    },
    disputed: {
      icon: AlertCircle,
      label: 'Under Review',
      color: 'bg-red-100 text-red-700',
      description: 'Support team reviewing dispute',
      userAction: 'We\'ll contact you within 24h'
    },
    cleaner_declined: {
      icon: XCircle,
      label: 'Declined',
      color: 'bg-red-100 text-red-700',
      description: 'Cleaner declined this request',
      userAction: 'Checking with alternatives...'
    }
  };

  const config = statusConfig[status] || {
    icon: Clock,
    label: status,
    color: 'bg-gray-100 text-gray-700',
    description: 'Processing...',
    userAction: null
  };

  const Icon = config.icon;

  if (context === 'badge-only') {
    return (
      <Badge className={`${config.color} font-fredoka flex items-center gap-1`}>
        <Icon className={`w-3 h-3 ${config.animated ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 ${config.color.replace('text', 'border').replace('bg', 'bg')} border-2`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className={`w-5 h-5 ${config.animated ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-fredoka font-bold text-sm">{config.label}</h4>
            {config.urgent && (
              <Badge className="bg-red-600 text-white font-fredoka text-xs">Urgent</Badge>
            )}
          </div>
          <p className="text-xs font-verdana opacity-90 mb-2">{config.description}</p>
          {config.userAction && (
            <div className="text-xs font-verdana font-semibold opacity-75 flex items-center gap-1">
              <span>→</span>
              <span>{config.userAction}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}