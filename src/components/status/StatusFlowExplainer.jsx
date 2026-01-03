import React, { useState } from 'react';
import { GitBranch, ChevronDown, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function StatusFlowExplainer({ currentStatus }) {
  const [expanded, setExpanded] = useState(false);

  const statusFlow = [
    { 
      status: 'created', 
      label: 'Created',
      description: 'Booking created, payment processing',
      icon: Clock,
      color: 'gray'
    },
    { 
      status: 'payment_hold', 
      label: 'Payment Hold',
      description: 'Credits held in escrow for protection',
      icon: Clock,
      color: 'yellow'
    },
    { 
      status: 'awaiting_cleaner_response', 
      label: 'Awaiting Response',
      description: 'Waiting for cleaner to accept (24h)',
      icon: Clock,
      color: 'blue'
    },
    { 
      status: 'accepted', 
      label: 'Accepted',
      description: 'Cleaner accepted, job confirmed',
      icon: CheckCircle2,
      color: 'green'
    },
    { 
      status: 'scheduled', 
      label: 'Scheduled',
      description: 'Job scheduled, waiting for job day',
      icon: Clock,
      color: 'blue'
    },
    { 
      status: 'on_the_way', 
      label: 'On The Way',
      description: 'Cleaner is traveling to location',
      icon: Clock,
      color: 'blue'
    },
    { 
      status: 'in_progress', 
      label: 'In Progress',
      description: 'Cleaner checked in, cleaning started',
      icon: Clock,
      color: 'purple'
    },
    { 
      status: 'completed', 
      label: 'Completed',
      description: 'Cleaner finished, awaiting your review',
      icon: Clock,
      color: 'orange'
    },
    { 
      status: 'awaiting_client', 
      label: 'Awaiting Review',
      description: 'Review within 12h or auto-approves',
      icon: AlertCircle,
      color: 'orange'
    },
    { 
      status: 'approved', 
      label: 'Approved',
      description: 'Job approved, payment settled',
      icon: CheckCircle2,
      color: 'green'
    }
  ];

  const currentIndex = statusFlow.findIndex(s => s.status === currentStatus);

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-lg font-fredoka flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Booking Journey
          </CardTitle>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent>
              <div className="relative">
                {statusFlow.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = step.status === currentStatus;
                  const isPast = idx < currentIndex;
                  const isFuture = idx > currentIndex;

                  const colorClasses = {
                    gray: 'bg-gray-100 text-gray-600 border-gray-300',
                    blue: 'bg-blue-100 text-blue-600 border-blue-300',
                    green: 'bg-green-100 text-green-600 border-green-300',
                    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-300',
                    orange: 'bg-orange-100 text-orange-600 border-orange-300',
                    purple: 'bg-purple-100 text-purple-600 border-purple-300'
                  };

                  return (
                    <div key={step.status} className="relative">
                      {idx > 0 && (
                        <div className={`absolute left-4 -top-3 w-0.5 h-6 ${
                          isPast ? 'bg-green-400' : 'bg-gray-300'
                        }`} />
                      )}
                      
                      <div className={`flex items-start gap-3 mb-4 p-3 rounded-lg ${
                        isCurrent 
                          ? 'bg-blue-50 border-2 border-blue-400 shadow-lg' 
                          : isPast
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200 opacity-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isCurrent 
                            ? 'bg-blue-500 border-blue-600' 
                            : isPast
                            ? 'bg-green-500 border-green-600'
                            : 'bg-gray-300 border-gray-400'
                        }`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-fredoka font-semibold text-gray-800">{step.label}</h5>
                            {isCurrent && (
                              <Badge className="bg-blue-600 text-white font-fredoka text-xs">Current</Badge>
                            )}
                            {isPast && (
                              <Badge className="bg-green-600 text-white font-fredoka text-xs">✓</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-verdana">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-blue-800 font-verdana">
                <Info className="w-4 h-4 inline mr-1" />
                <strong>Note:</strong> Some steps may be skipped based on booking type (instant book, recurring, etc.)
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}