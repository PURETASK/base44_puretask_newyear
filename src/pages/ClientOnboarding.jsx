import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import ClientQuestionnaire from '../components/onboarding/ClientQuestionnaire';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.ClientProfile.filter({
        user_email: currentUser.email
      });

      if (profiles.length > 0) {
        setClientProfile(profiles[0]);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading data:', showToast: false });
      navigate(createPageUrl('SignIn'));
    }
    setLoading(false);
  };

  const handleComplete = async (formData) => {
    setSaving(true);
    try {
      const profileData = {
        ...formData,
        user_email: user.email,
        onboarding_completed: true
      };

      if (clientProfile) {
        // Update existing profile
        await base44.entities.ClientProfile.update(clientProfile.id, profileData);
      } else {
        // Create new profile
        await base44.entities.ClientProfile.create(profileData);
      }

      // Navigate to dashboard
      navigate(createPageUrl('ClientDashboard'));
    } catch (error) {
      handleError(error, { userMessage: 'Error saving profile:', showToast: false });
      alert('Failed to save your profile. Please try again.');
    }
    setSaving(false);
  };

  const handleSkip = () => {
    navigate(createPageUrl('ClientDashboard'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-puretask-blue mx-auto mb-4" />
          <p className="text-gray-500 font-verdana">Loading...</p>
        </div>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 brand-gradient rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-xl font-fredoka font-semibold text-graphite">Saving your profile...</p>
          <p className="text-gray-500 font-verdana mt-2">Just a moment!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-fredoka font-bold text-graphite">Welcome to PureTask!</h1>
          </motion.div>
          <p className="text-lg font-verdana text-gray-600 max-w-2xl mx-auto">
            Let's set up your profile so we can match you with the perfect cleaners and make booking a breeze!
          </p>
        </div>

        {/* Questionnaire */}
        <ClientQuestionnaire
          initialData={clientProfile || {}}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}