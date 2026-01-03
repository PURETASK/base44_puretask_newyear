import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import LoyaltyDashboard from '../components/loyalty/LoyaltyDashboard';
import { Loader2 } from 'lucide-react';

export default function LoyaltyDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading user:', showToast: false });
      navigate(createPageUrl('SignIn'));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-fredoka font-bold text-graphite mb-2">Loyalty Rewards</h1>
          <p className="text-gray-600 font-verdana">Earn points, unlock rewards, and enjoy exclusive benefits</p>
        </div>
        
        <LoyaltyDashboard clientEmail={user?.email} />
      </div>
    </div>
  );
}