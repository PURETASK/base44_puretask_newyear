import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Shield, Camera, MapPin, Calendar, CheckCircle,
  ChevronRight, ChevronLeft, Clock, DollarSign, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WIZARD_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to PureTask!',
    description: "Let's show you how to book your first cleaning in 3 simple steps",
    icon: Sparkles,
    color: 'emerald'
  },
  {
    id: 'browse',
    title: 'Browse Verified Cleaners',
    description: 'All cleaners are background-checked, identity-verified, and rated by clients',
    icon: Shield,
    color: 'blue',
    features: [
      { icon: Star, text: 'View reliability scores and ratings' },
      { icon: DollarSign, text: 'Compare transparent pricing' },
      { icon: MapPin, text: 'Filter by location and availability' }
    ]
  },
  {
    id: 'booking',
    title: 'Book with Confidence',
    description: 'Select your date, time, and tasks. Payment is held in escrow until job completion.',
    icon: Calendar,
    color: 'purple',
    features: [
      { icon: Clock, text: 'Choose your preferred date & time' },
      { icon: CheckCircle, text: 'Select specific cleaning tasks' },
      { icon: Shield, text: 'Secure payment, only charged for actual hours' }
    ]
  },
  {
    id: 'tracking',
    title: 'Track & Verify',
    description: 'GPS check-in/out and photo proof ensure quality and accountability',
    icon: Camera,
    color: 'amber',
    features: [
      { icon: MapPin, text: 'GPS verification when cleaner arrives' },
      { icon: Camera, text: 'Before/after photos of the cleaning' },
      { icon: CheckCircle, text: 'Real-time job progress updates' }
    ]
  },
  {
    id: 'ready',
    title: "You're All Set!",
    description: 'Ready to book your first cleaning? Browse our verified cleaners now.',
    icon: Zap,
    color: 'green'
  }
];

export default function FirstTimeWizard({ open, onClose, onComplete }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
    navigate(createPageUrl('BrowseCleaners'));
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              First Time Guide
            </Badge>
            <span className="text-sm text-slate-500">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border-2 border-${step.color}-200 bg-gradient-to-br from-${step.color}-50 to-white`}>
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 rounded-full flex items-center justify-center mb-4 shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <DialogTitle className="text-3xl font-bold text-slate-900 mb-2">
                    {step.title}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-slate-600 max-w-lg">
                    {step.description}
                  </DialogDescription>
                </div>

                {step.features && (
                  <div className="space-y-4 mb-6">
                    {step.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200"
                      >
                        <div className={`w-10 h-10 bg-${step.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`w-5 h-5 text-${step.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">{feature.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {isLastStep && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                      <div>
                        <p className="font-semibold text-emerald-900 mb-2">
                          🎉 You're ready to book your first cleaning!
                        </p>
                        <ul className="text-sm text-emerald-800 space-y-1">
                          <li>• All cleaners are verified and rated</li>
                          <li>• GPS tracking and photo proof included</li>
                          <li>• Only pay for actual hours worked</li>
                          <li>• 100% satisfaction guarantee</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-600"
          >
            Skip Tutorial
          </Button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handleBack}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className={`bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 hover:from-${step.color}-600 hover:to-${step.color}-700`}
            >
              {isLastStep ? (
                <>
                  Browse Cleaners
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {WIZARD_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? `bg-${step.color}-500 w-6`
                  : idx < currentStep
                  ? 'bg-emerald-300'
                  : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}