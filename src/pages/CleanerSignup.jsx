import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Shield, Award, DollarSign, Loader2, Mail, HelpCircle } from 'lucide-react';
import EarningsCalculator from '../components/cleaner/EarningsCalculator';
import { useAnalytics } from '../components/analytics/AnalyticsTracker';
import { analytics } from '../components/analytics/AnalyticsService'; // Added import

export default function CleanerSignup() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Changed analytics call from trackEvent to analytics.auth
    analytics.auth('cleaner_signup_start');
    
    checkIfLoggedIn();
  }, []);

  const checkIfLoggedIn = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        trackEvent('cleaner_signup_already_logged_in', {
          user_email: currentUser.email
        });
        navigate(createPageUrl('CleanerOnboarding'));
        return;
      }
    } catch (error) {
      // User not logged in
    }
    setChecking(false);
  };

  const handleSignup = () => {
    setLoading(true);
    setError('');
    
    trackEvent('cleaner_signup_button_clicked', {
      action: 'redirect_to_login'
    });
    
    // Redirect using base44.auth.redirectToLogin with full URL
    const nextUrl = window.location.origin + createPageUrl('CleanerOnboarding');
    base44.auth.redirectToLogin(nextUrl);
  };

  // The outline indicated changes to a 'handleSignupSubmit' function which is not present in this file.
  // The existing `handleSignup` function primarily handles redirecting for external login,
  // and does not process form data like `email` or `service_areas` directly within this component.
  // Therefore, the suggested analytics.auth('cleaner_signup_success', { email: formData.email, service_areas: formData.service_locations?.length || 0 });
  // cannot be accurately placed here without significant logical changes to the component's flow,
  // which would go beyond simply implementing the outline. This kind of tracking typically
  // occurs after a successful form submission on the subsequent onboarding page.

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Signup */}
          <Card className="p-10 shadow-2xl border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Become a PureTask Cleaner</h1>
              <p className="text-slate-600">Join our verified marketplace</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Verification Required</p>
                  <p className="text-sm text-slate-600">ID verification and background check</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Set Your Own Rates</p>
                  <p className="text-sm text-slate-600">Full control over pricing</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                <Award className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Build Your Reputation</p>
                  <p className="text-sm text-slate-600">Earn Elite tier status</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1">Sign-Up Process:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click "Continue with Google" below</li>
                    <li>Sign in with your Google account</li>
                    <li>Check your email for confirmation (if needed)</li>
                    <li>Complete your cleaner profile and verification</li>
                  </ol>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-lg py-6 shadow-lg"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Continue with Google'
              )}
            </Button>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <button
                  onClick={handleSignup}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Sign In
                </button>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <Link to={createPageUrl('ResendConfirmation')} className="text-emerald-600 hover:text-emerald-700">
                  Didn't receive confirmation email?
                </Link>
              </div>
            </div>
          </Card>

          {/* Right Column - Earnings Calculator */}
          <div>
            <EarningsCalculator />
          </div>
        </div>
      </div>
    </div>
  );
}