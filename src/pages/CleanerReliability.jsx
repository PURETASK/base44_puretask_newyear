import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ReliabilityDashboardV2 from '../components/reliability/ReliabilityDashboardV2';
import MilestoneTracker from '../components/reliability/MilestoneTracker';

export default function CleanerReliability() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 font-verdana">Please sign in to view your reliability metrics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-soft-cloud">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
            My Reliability Score
          </h1>
          <p className="text-gray-600 font-verdana">
            Track your performance metrics and unlock achievements
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ReliabilityDashboardV2 cleanerEmail={user.email} />
          <MilestoneTracker cleanerEmail={user.email} />
        </div>
      </div>
    </div>
  );
}