import React from 'react';
import { Shield, Lock, CheckCircle2, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

export default function EscrowStatusBadge({ booking }) {
  const getEscrowStatus = () => {
    if (!booking.payment_held && !booking.payment_captured) {
      return {
        status: 'released',
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: CheckCircle2,
        description: 'Credits returned to your wallet'
      };
    }

    if (booking.payment_held && !booking.payment_captured) {
      return {
        status: 'held',
        label: 'Held in Escrow',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: Lock,
        description: `${booking.escrow_credits_reserved || 0} credits held safely until job completion`
      };
    }

    if (booking.payment_captured) {
      return {
        status: 'captured',
        label: 'Payment Settled',
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: CheckCircle2,
        description: `Final charge: ${booking.final_charge_credits || 0} credits`
      };
    }

    return {
      status: 'unknown',
      label: 'Processing',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: Shield,
      description: 'Payment processing...'
    };
  };

  const escrow = getEscrowStatus();
  const Icon = escrow.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <Badge className={`${escrow.color} border-2 font-fredoka font-semibold px-3 py-1.5 flex items-center gap-2 cursor-help`}>
              <Icon className="w-4 h-4" />
              {escrow.label}
              <HelpCircle className="w-3 h-3 opacity-60" />
            </Badge>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-fredoka font-semibold">Payment Protection</p>
            <p className="text-sm">{escrow.description}</p>
            
            {escrow.status === 'held' && (
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                <p>• Credits are safe and reserved for this job</p>
                <p>• Adjusted after actual hours are calculated</p>
                <p>• Refunded if job is cancelled early</p>
              </div>
            )}

            {escrow.status === 'captured' && booking.refund_credits > 0 && (
              <div className="text-xs text-green-600 mt-2 pt-2 border-t">
                <p>✓ Refunded {booking.refund_credits} credits (actual &lt; estimate)</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}