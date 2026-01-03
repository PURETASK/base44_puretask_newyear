import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Sparkles, Shield, Clock, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Centralized pricing values so you have one source of truth
const CLIENT_PRICING = {
  minCredits: 350,
  maxCredits: 450,
  creditsPerDollar: 10, // 10 credits = $1
};

const CLEANER_EARNINGS = {
  minDollar: 28,
  maxDollar: 51,
};

// Reusable bullet row component
function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3 font-verdana text-gray-700">
      <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0 text-[#28C76F]" />
      <span>{children}</span>
    </li>
  );
}

export default function RoleSelection() {
  const handleSignIn = async () => {
    try {
      // Check if user is already logged in
      const user = await base44.auth.me();
      if (user) {
        // User is already logged in, redirect to appropriate dashboard
        if (user.user_type === 'client' || user.role === 'client') {
          window.location.href = createPageUrl('ClientDashboard');
        } else if (user.user_type === 'cleaner' || user.role === 'cleaner') {
          window.location.href = createPageUrl('CleanerDashboard');
        } else if (user.role === 'admin') {
          window.location.href = createPageUrl('AdminDashboard');
        } else {
          window.location.href = createPageUrl('Home');
        }
      } else {
        // User is not logged in, redirect to login page
        base44.auth.redirectToLogin();
      }
    } catch (error) {
      // User is not logged in, redirect to login page
      console.log('User not logged in, redirecting to login');
      base44.auth.redirectToLogin();
    }
  };

  // Derived display strings from constants
  const clientCreditsRange = `${CLIENT_PRICING.minCredits}-${CLIENT_PRICING.maxCredits} credits/hr`;
  const clientDollarRange = `≈ $${CLIENT_PRICING.minCredits / CLIENT_PRICING.creditsPerDollar}-${
    CLIENT_PRICING.maxCredits / CLIENT_PRICING.creditsPerDollar
  }/hour`;

  const cleanerEarningsRange = `$${CLEANER_EARNINGS.minDollar}-${CLEANER_EARNINGS.maxDollar}/hour`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F9FC]">
      <div className="max-w-6xl w-full">
        {/* Back Button */}
        <Link
          to={createPageUrl('Home')}
          aria-label="Back to PureTask home"
          className="inline-flex items-center gap-2 hover:opacity-80 mb-8 font-verdana text-[#1D2533]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[#0078FF] to-[#00D4FF]">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-fredoka font-bold text-[#1D2533]">
              Join PureTask
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-verdana">
            Choose how you'd like to get started
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-2xl transition-all duration-300 h-full rounded-2xl border-2 border-[#0078FF] bg-gradient-to-br from-[#EFF6FF] to-white">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg bg-gradient-to-br from-[#0078FF] to-[#00D4FF]">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-fredoka font-bold mb-2 text-[#1D2533]">
                  I Need a Cleaner
                </CardTitle>
                <p className="text-gray-600 font-verdana">
                  Book verified professionals for your home or business
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <Bullet>Browse verified cleaners by reliability score</Bullet>
                  <Bullet>GPS tracking & photo proof for every job</Bullet>
                  <Bullet>Pay only after you approve the work</Bullet>
                  <Bullet>Transparent credit-based pricing</Bullet>
                </ul>

                <div className="rounded-2xl p-4 bg-[#DBEAFE] border border-[#93C5FD]">
                  <p className="text-sm font-verdana mb-2 text-[#1D2533]">
                    <strong className="font-fredoka">Average Price:</strong>
                  </p>
                  <p className="text-2xl font-fredoka font-bold text-[#0078FF]">
                    {clientCreditsRange}
                  </p>
                  <p className="text-xs text-gray-600 font-verdana">
                    {clientDollarRange}
                  </p>
                </div>

                <Link to={createPageUrl('ClientSignup')} className="block">
                  <Button className="w-full text-lg py-6 rounded-full font-fredoka font-semibold shadow-lg hover:shadow-xl text-white bg-gradient-to-r from-[#0078FF] to-[#00D4FF]">
                    Sign Up as Client
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cleaner Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-2xl transition-all duration-300 h-full rounded-2xl border-2 border-[#28C76F] bg-gradient-to-br from-[#F0FDF4] to-white">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg bg-[#28C76F]">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-fredoka font-bold mb-2 text-[#1D2533]">
                  I'm a Cleaner
                </CardTitle>
                <p className="text-gray-600 font-verdana">
                  Build your business with flexible hours and fair pay
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <Bullet>Earn 80–85% of every booking</Bullet>
                  <Bullet>Set your own rates and schedule</Bullet>
                  <Bullet>Weekly payouts + instant cash-out option</Bullet>
                  <Bullet>Build reputation through reliability scoring</Bullet>
                </ul>

                <div className="rounded-2xl p-4 bg-[#DCFCE7] border border-[#86EFAC]">
                  <p className="text-sm font-verdana mb-2 text-[#1D2533]">
                    <strong className="font-fredoka">Average Earnings:</strong>
                  </p>
                  <p className="text-2xl font-fredoka font-bold text-[#28C76F]">
                    {cleanerEarningsRange}
                  </p>
                  <p className="text-xs text-gray-600 font-verdana">
                    Based on your tier & performance
                  </p>
                </div>

                <Link to={createPageUrl('CleanerSignup')} className="block">
                  <Button className="w-full text-lg py-6 rounded-full font-fredoka font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-opacity text-white bg-[#28C76F]">
                    Sign Up as Cleaner
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4 font-verdana">
            Already have an account?{' '}
            <button
              onClick={handleSignIn}
              className="font-fredoka font-semibold hover:underline text-[#0078FF]"
            >
              Sign In
            </button>
            {' · '}
            <Link
              to={createPageUrl('PreLaunch')}
              className="font-fredoka font-semibold hover:underline text-[#8B5CF6]"
            >
              Pre-Launch Signup
            </Link>
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-verdana">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0078FF]" />
              <span>Verified Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#28C76F]" />
              <span>Trusted by Thousands</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D4FF]" />
              <span>Quick Signup</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}