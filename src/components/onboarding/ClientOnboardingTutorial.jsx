import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientOnboardingTutorial({ open, onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Search className="w-16 h-16 text-blue-500" />,
      title: 'Welcome to PureTask!',
      description: 'Let\'s show you how easy it is to book a verified cleaner in 3 simple steps.',
      action: 'Get Started'
    },
    {
      icon: <Search className="w-16 h-16 text-emerald-500" />,
      title: '1. Find Your Perfect Cleaner',
      description: 'Browse verified cleaners or use our Smart Matching to get personalized recommendations. Filter by specialty, ratings, and price.',
      action: 'Next'
    },
    {
      icon: <Calendar className="w-16 h-16 text-purple-500" />,
      title: '2. Book in Minutes',
      description: 'Pick your date, select tasks, and add any special instructions. We\'ll hold payment until the job is done to your satisfaction.',
      action: 'Next'
    },
    {
      icon: <Star className="w-16 h-16 text-amber-500" />,
      title: '3. Relax & Enjoy',
      description: 'Track your cleaner with GPS, get before/after photos, and rate your experience. Your satisfaction is guaranteed!',
      action: 'Start Booking'
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {step + 1} / {steps.length}
            </span>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-6"
            >
              {currentStep.icon}
            </motion.div>

            <DialogTitle className="text-2xl font-bold text-slate-900 mb-4">
              {currentStep.title}
            </DialogTitle>

            <p className="text-slate-600 mb-8">
              {currentStep.description}
            </p>

            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`${step === 0 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-blue-500 to-cyan-500`}
              >
                {currentStep.action}
              </Button>
            </div>

            {step === steps.length - 1 && (
              <button
                onClick={onComplete}
                className="mt-4 text-sm text-slate-500 hover:text-slate-700"
              >
                Skip tutorial
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}