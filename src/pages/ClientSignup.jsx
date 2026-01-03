import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, CheckCircle, Loader2, Mail, HelpCircle, Shield } from 'lucide-react';
import { useAnalytics } from '../components/analytics/AnalyticsTracker';
import { analytics } from '../components/analytics/AnalyticsService'; // New import

export default function ClientSignup() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics(); // Keep for now, as useAnalytics might track other things not covered by the new analytics service
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Track signup page view using the new analytics service
    analytics.auth('signup_start');
    
    // Original analytics call (can be removed if analytics.auth fully replaces it)
    // trackEvent('client_signup_start', {
    //   source: 'direct',
    //   referrer: document.referrer
    // });
    
    checkIfLoggedIn();
  }, []);

  const checkIfLoggedIn = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        // User is already logged in, go to complete signup
        analytics.auth('signup_already_logged_in', {
          user_email: currentUser.email
        });
        
        // Check if onboarding is complete
        const profiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });
        if (profiles.length === 0 || !profiles[0].onboarding_completed) {
          navigate(createPageUrl('ClientOnboarding'));
        } else {
          navigate(createPageUrl('ClientDashboard'));
        }
        return;
      }
    } catch (error) {
      // User not logged in, that's fine
    }
    setChecking(false);
  };

  const handleSignup = () => {
    setLoading(true);
    setError('');
    
    // Track button click using the new analytics service
    analytics.auth('signup_redirect_initiated', {
      action: 'redirect_to_login'
    });
    
    // Redirect using base44.auth.redirectToLogin with full URL
    const nextUrl = window.location.origin + createPageUrl('ClientOnboarding');
    base44.auth.redirectToLogin(nextUrl);
  };

  // This function is added as per the outline.
  // In the current ClientSignup component's flow, which uses Google redirect,
  // there isn't a direct form submission with 'formData' to trigger 'signup_success' here.
  // The 'signup_success' event with email would typically be fired after a successful
  // account creation/authentication, often on the redirect target page (ClientSignupComplete).
  const handleSignupSubmit = async (formData) => {
    // The outline requested to keep existing signup logic here,
    // but this function's signature (taking formData) does not align with
    // the existing handleSignup's logic (which initiates a Google redirect
    // and doesn't involve form data at this stage).
    // This function is defined as per outline but remains currently unused in this component's active flow.
    
    console.warn('handleSignupSubmit was called (likely for analytics tracking, but not integrated into core signup flow). Data:', formData);

    analytics.auth('signup_success', {
      email: formData.email
    });
    // No other "existing code" from the current handleSignup is placed here
    // as this function's signature and intent (with formData) does not align
    // with the current component's Google redirect logic.
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-10 shadow-2xl border-0">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to PureTask</h1>
          <p className="text-slate-600">Sign up to book premium cleaning services</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-slate-700">All cleaners pass background checks</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-slate-700">Before/after photos for every job</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-slate-700">Satisfaction guaranteed</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-2">Quick Sign-Up Process:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Continue with Google" below</li>
                <li>Sign in with your Google account</li>
                <li>Check your email for confirmation (if needed)</li>
                <li>You'll be automatically redirected back to complete your profile</li>
              </ol>
              <div className="mt-3 pt-3 border-t border-blue-200 flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Privacy First:</strong> We use Google sign-in for security. We never access 
                  your Google data beyond your email and name for account creation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg py-6 shadow-lg"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to Login...
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
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <Link to={createPageUrl('ResendConfirmation')} className="text-blue-600 hover:text-blue-700">
              Didn't receive confirmation email?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}