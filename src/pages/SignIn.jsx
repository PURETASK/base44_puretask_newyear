import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, LogIn, Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkIfAlreadyLoggedIn();
  }, []);

  const checkIfAlreadyLoggedIn = async () => {
    try {
      const user = await base44.auth.me();
      if (user) {
        // User is already logged in, redirect to appropriate dashboard
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: user.email });
        const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: user.email });
        
        if (cleanerProfiles.length > 0) {
          navigate(createPageUrl('CleanerDashboard'));
        } else if (clientProfiles.length > 0) {
          navigate(createPageUrl('ClientDashboard'));
        } else if (user.role === 'admin') {
          navigate(createPageUrl('AdminDashboard'));
        } else {
          navigate(createPageUrl('Home'));
        }
      }
    } catch (error) {
      // User not logged in, that's fine
    }
    setLoading(false);
  };

  const handleSignIn = () => {
    setSigningIn(true);
    setError(null);
    
    // Redirect using base44.auth.redirectToLogin
    base44.auth.redirectToLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-puretask-blue transition-colors font-verdana">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-2 border-blue-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-fredoka font-bold text-graphite mb-2">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base font-verdana text-gray-600">
              Sign in to your PureTask account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full h-14 text-lg font-fredoka font-semibold rounded-full shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)',
                color: 'white'
              }}
            >
              {signingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-verdana">
                  New to PureTask?
                </span>
              </div>
            </div>

            <Link to={createPageUrl('RoleSelection')}>
              <Button
                variant="outline"
                className="w-full h-12 text-base font-fredoka font-semibold rounded-full border-2 border-puretask-blue text-puretask-blue hover:bg-blue-50"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create an Account
              </Button>
            </Link>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 font-verdana">
                By signing in, you agree to our{' '}
                <Link to={createPageUrl('TermsOfService')} className="text-puretask-blue hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to={createPageUrl('PrivacyPolicy')} className="text-puretask-blue hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-verdana mb-2">
            Need help signing in?
          </p>
          <Link to={createPageUrl('Support')}>
            <Button variant="ghost" className="text-puretask-blue font-fredoka font-semibold">
              Contact Support
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}