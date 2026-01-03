import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const BOOKING_STEPS = [
  { id: 1, label: 'Date & Time', description: 'Choose when' },
  { id: 2, label: 'Services & Address', description: 'What & where' },
  { id: 3, label: 'Review Details', description: 'Confirm booking' },
  { id: 4, label: 'Payment', description: 'Secure checkout' }
];

export default function BookingProgressTracker({ currentStep, completedSteps = [] }) {
  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {BOOKING_STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep === step.id
                      ? 'bg-emerald-500 text-white shadow-lg scale-110'
                      : completedSteps.includes(step.id) || currentStep > step.id
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {completedSteps.includes(step.id) || currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : currentStep === step.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  {currentStep === step.id && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-500 opacity-20"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </motion.div>
                <div className="mt-2 text-center hidden md:block">
                  <p className={`text-sm font-semibold ${
                    currentStep === step.id ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
              
              {idx < BOOKING_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-all ${
                  currentStep > step.id
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Mobile step label */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-sm font-semibold text-emerald-600">
            Step {currentStep}: {BOOKING_STEPS[currentStep - 1].label}
          </p>
          <p className="text-xs text-slate-500">{BOOKING_STEPS[currentStep - 1].description}</p>
        </div>
      </CardContent>
    </Card>
  );
}