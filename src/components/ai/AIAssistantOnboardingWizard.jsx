import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { analytics } from '../analytics/AnalyticsService';
import AIFeatureShowcase from './AIFeatureShowcase';

const SPECIALTY_OPTIONS = ['Pet-Friendly', 'Eco-Warrior', 'Deep Clean Expert', 'Move-Out Specialist'];
const SERVICE_OPTIONS = [
  { value: 'windows', label: 'Windows' },
  { value: 'oven', label: 'Oven' },
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'inside_cabinets', label: 'Inside Cabinets' },
  { value: 'laundry', label: 'Laundry' }
];

export default function AIAssistantOnboardingWizard({ cleanerProfile, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [settings, setSettings] = useState({
    // Communication
    booking_confirmation_enabled: true,
    pre_cleaning_reminder_enabled: true,
    channels: ['email', 'in_app'],
    
    // Scheduling
    ai_scheduling_enabled: false,
    prioritize_gap_filling: true,
    
    // Matching
    specialty_tags: [],
    offers_additional_services: []
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setSettings(prev => ({
      ...prev,
      specialty_tags: prev.specialty_tags.includes(specialty)
        ? prev.specialty_tags.filter(s => s !== specialty)
        : [...prev.specialty_tags, specialty]
    }));
  };

  const handleServiceToggle = (service) => {
    setSettings(prev => ({
      ...prev,
      offers_additional_services: prev.offers_additional_services.includes(service)
        ? prev.offers_additional_services.filter(s => s !== service)
        : [...prev.offers_additional_services, service]
    }));
  };

  const handleComplete = async () => {
    try {
      // Save settings to CleanerProfile
      await base44.entities.CleanerProfile.update(cleanerProfile.id, {
        communication_settings: {
          booking_confirmation: {
            enabled: settings.booking_confirmation_enabled,
            channels: settings.channels,
            custom_template: "Hi {client_name}! Your cleaning is confirmed for {date} at {time}. Looking forward to making your space sparkle! - {cleaner_name}"
          },
          pre_cleaning_reminder: {
            enabled: settings.pre_cleaning_reminder_enabled,
            days_before: 1,
            channels: settings.channels,
            custom_template: "Hi {client_name}! Just a reminder that I'll be cleaning your place tomorrow at {time}. Please ensure access is available. Thanks! - {cleaner_name}"
          },
          ai_scheduling_enabled: settings.ai_scheduling_enabled,
          prioritize_gap_filling: settings.prioritize_gap_filling,
          suggest_days_in_advance: 14
        },
        specialty_tags: settings.specialty_tags,
        offers_additional_services: settings.offers_additional_services,
        ai_onboarding_completed: true
      });

      // Track completion
      analytics.track('ai_onboarding_completed', {
        steps_completed: 5,
        time_taken_seconds: Math.floor((Date.now() - startTime) / 1000),
        ai_scheduling_enabled: settings.ai_scheduling_enabled,
        specialties_selected: settings.specialty_tags.length,
        services_selected: settings.offers_additional_services.length
      });
      
      // Mark as seen
      localStorage.setItem(`ai_onboarding_seen_${cleanerProfile.user_email}`, 'true');
      
      toast.success('AI Assistant is now active!');
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding settings:', error);
      toast.error('Failed to complete setup. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-fredoka font-bold">AI Assistant Setup</h2>
              <p className="text-blue-100 text-sm font-verdana">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-fredoka font-bold mb-2">Welcome to Your AI Assistant!</h3>
                  <p className="text-gray-600 font-verdana">
                    Your AI Assistant helps you maximize bookings, communicate professionally, and earn more. Let's set it up!
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                  <p className="font-fredoka font-semibold text-gray-800">What your AI can do:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-verdana">Automate client communication at every stage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-verdana">Fill schedule gaps intelligently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-verdana">Match you with ideal clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-verdana">Track your performance metrics</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Step 2: Communication */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-fredoka font-bold mb-2">How should your AI communicate?</h3>
                  <p className="text-gray-600 font-verdana text-sm">
                    Your AI will send these messages automatically. You can customize them later.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="booking-conf" className="font-fredoka cursor-pointer">
                        Booking Confirmations
                      </Label>
                      <p className="text-xs text-gray-600 font-verdana mt-1">
                        Automatically confirm bookings with clients
                      </p>
                    </div>
                    <Switch
                      id="booking-conf"
                      checked={settings.booking_confirmation_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, booking_confirmation_enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="pre-clean" className="font-fredoka cursor-pointer">
                        Pre-Cleaning Reminders
                      </Label>
                      <p className="text-xs text-gray-600 font-verdana mt-1">
                        Remind clients 1 day before their cleaning
                      </p>
                    </div>
                    <Switch
                      id="pre-clean"
                      checked={settings.pre_cleaning_reminder_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pre_cleaning_reminder_enabled: checked }))}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-fredoka mb-3">Send messages via:</p>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email"
                          checked={settings.channels.includes('email')}
                          onCheckedChange={(checked) => {
                            setSettings(prev => ({
                              ...prev,
                              channels: checked 
                                ? [...prev.channels, 'email']
                                : prev.channels.filter(c => c !== 'email')
                            }));
                          }}
                        />
                        <Label htmlFor="email" className="font-verdana cursor-pointer">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="in_app"
                          checked={settings.channels.includes('in_app')}
                          onCheckedChange={(checked) => {
                            setSettings(prev => ({
                              ...prev,
                              channels: checked 
                                ? [...prev.channels, 'in_app']
                                : prev.channels.filter(c => c !== 'in_app')
                            }));
                          }}
                        />
                        <Label htmlFor="in_app" className="font-verdana cursor-pointer">In-App</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Scheduling */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-fredoka font-bold mb-2">Let's optimize your schedule</h3>
                  <p className="text-gray-600 font-verdana text-sm">
                    AI suggests booking times that maximize your daily earnings and minimize travel.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <Label htmlFor="ai-sched" className="font-fredoka cursor-pointer">
                        Enable AI Scheduling
                      </Label>
                      <p className="text-xs text-gray-600 font-verdana mt-1">
                        Let AI suggest optimal booking times to clients
                      </p>
                    </div>
                    <Switch
                      id="ai-sched"
                      checked={settings.ai_scheduling_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ai_scheduling_enabled: checked }))}
                    />
                  </div>

                  {settings.ai_scheduling_enabled && (
                    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg ml-4">
                      <div className="flex-1">
                        <Label htmlFor="gap-fill" className="font-fredoka cursor-pointer">
                          Prioritize Gap Filling
                        </Label>
                        <p className="text-xs text-gray-600 font-verdana mt-1">
                          Fill empty slots between bookings first
                        </p>
                      </div>
                      <Switch
                        id="gap-fill"
                        checked={settings.prioritize_gap_filling}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, prioritize_gap_filling: checked }))}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Specialties */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-fredoka font-bold mb-2">What are you great at?</h3>
                  <p className="text-gray-600 font-verdana text-sm">
                    This helps AI match you with clients who need your expertise.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-fredoka mb-3">My specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTY_OPTIONS.map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() => handleSpecialtyToggle(specialty)}
                          className={`px-4 py-2 rounded-full font-fredoka text-sm transition-all ${
                            settings.specialty_tags.includes(specialty)
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-fredoka mb-3">Additional services I offer:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICE_OPTIONS.map((service) => (
                        <div key={service.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.value}
                            checked={settings.offers_additional_services.includes(service.value)}
                            onCheckedChange={() => handleServiceToggle(service.value)}
                          />
                          <Label htmlFor={service.value} className="font-verdana cursor-pointer">
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Completion */}
            {currentStep === 6 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-fredoka font-bold mb-2">You're all set!</h3>
                  <p className="text-gray-600 font-verdana">
                    Your AI Assistant is now active. You can adjust settings anytime from your profile.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 space-y-2">
                  <p className="font-fredoka font-semibold text-gray-800">Quick Summary:</p>
                  <ul className="space-y-1 text-sm font-verdana text-gray-700">
                    <li>✓ {settings.booking_confirmation_enabled || settings.pre_cleaning_reminder_enabled ? 
                      `${(settings.booking_confirmation_enabled ? 1 : 0) + (settings.pre_cleaning_reminder_enabled ? 1 : 0)} automated messages enabled` : 
                      'No automated messages enabled'}</li>
                    <li>✓ AI Scheduling: {settings.ai_scheduling_enabled ? 'Enabled' : 'Disabled'}</li>
                    <li>✓ {settings.specialty_tags.length} specialties selected</li>
                    <li>✓ {settings.offers_additional_services.length} additional services selected</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="brand-gradient text-white">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="brand-gradient text-white">
              Complete Setup
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}