import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function ResendConfirmation() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Use Base44's auth system to resend confirmation
      // This will trigger Base44 to send a new confirmation email
      await base44.auth.redirectToLogin(window.location.origin + createPageUrl('Home'));
    } catch (err) {
      console.error('Error resending confirmation:', err);
      setError('Unable to process your request. Please try logging in again or contact support.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-500" />
              Email Not Confirmed?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                If you closed the confirmation window or didn't receive a confirmation email, 
                you can request a new one by clicking the button below.
              </p>
            </div>

            {message && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">What to do:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                  <li>Click "Continue to Login" below</li>
                  <li>Try to sign in with your account</li>
                  <li>Base44 will automatically send you a new confirmation link if needed</li>
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the confirmation link in the email</li>
                </ol>
              </div>

              <Button
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Continue to Login
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Still having issues?</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Check your spam/junk folder for the confirmation email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Make sure you're checking the correct email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Wait a few minutes - emails can sometimes be delayed</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">Need more help?</p>
              <Link to={createPageUrl('Support')}>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}