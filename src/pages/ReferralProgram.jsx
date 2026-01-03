import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, Gift, DollarSign, Copy, Check, Share2, Mail, MessageSquare,
  TrendingUp, Sparkles, Star, Loader2, CheckCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ReferralProgram() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalEarned: 0
  });

  const referralCode = user?.email ? btoa(user.email).substring(0, 8).toUpperCase() : 'LOADING';
  const referralLink = `${window.location.origin}${createPageUrl('RoleSelection')}?ref=${referralCode}`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Load referrals
      const myReferrals = await base44.entities.ClientReferral.filter({
        referrer_email: currentUser.email
      }, '-created_date');
      setReferrals(myReferrals);

      // Calculate stats
      const pending = myReferrals.filter(r => r.status === 'pending').length;
      const completed = myReferrals.filter(r => r.status === 'rewarded').length;
      const totalEarned = myReferrals
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + (r.reward_amount_credits || 0), 0);

      setStats({
        totalReferrals: myReferrals.length,
        pendingReferrals: pending,
        completedReferrals: completed,
        totalEarned
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading referrals:', showToast: false });
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = 'Join PureTask - Get 500 credits free!';
    const body = `Hey! I've been using PureTask for all my cleaning needs and thought you'd love it too.\n\nUse my referral code ${referralCode} when you sign up and we both get 500 credits (worth $50)!\n\n${referralLink}\n\nPureTask connects you with verified, reliable cleaners with GPS tracking, photo proof, and payment protection.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaSMS = () => {
    const message = `Check out PureTask! Use my code ${referralCode} when signing up and we both get 500 credits ($50 value). ${referralLink}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Gift className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">
              Refer & Earn
            </h1>
            <p className="text-xl text-gray-600 font-verdana">
              Give 500 credits, Get 500 credits
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalReferrals}</p>
              <p className="text-sm text-gray-600 font-verdana">Total Referrals</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.pendingReferrals}</p>
              <p className="text-sm text-gray-600 font-verdana">Pending</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-fresh-mint mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.completedReferrals}</p>
              <p className="text-sm text-gray-600 font-verdana">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-10 h-10 text-puretask-blue mx-auto mb-3" />
              <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalEarned}</p>
              <p className="text-sm text-gray-600 font-verdana">Credits Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 border-2 border-purple-300 shadow-xl rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-t-2xl">
            <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
              <Share2 className="w-6 h-6 text-purple-600" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm font-fredoka font-medium text-graphite mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-4 bg-white rounded-2xl border-2 border-purple-300 font-mono text-2xl font-bold text-center text-purple-600">
                  {referralCode}
                </div>
                <Button
                  onClick={copyToClipboard}
                  className="bg-purple-600 text-white rounded-full font-fredoka h-14 px-6"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-fredoka font-medium text-graphite mb-2">Full Referral Link</p>
              <div className="flex items-center gap-3">
                <Input
                  value={referralLink}
                  readOnly
                  className="flex-1 font-verdana text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="rounded-full font-fredoka border-2 border-purple-500 text-purple-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 pt-4">
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="rounded-full font-fredoka border-2"
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
              <Button
                onClick={shareViaSMS}
                variant="outline"
                className="rounded-full font-fredoka border-2"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Share via SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8 border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
            <CardTitle className="font-fredoka text-graphite">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: 1,
                  icon: Share2,
                  title: 'Share Your Link',
                  description: 'Send your unique referral code to friends, family, or colleagues',
                  color: 'text-purple-600',
                  bg: 'bg-purple-50'
                },
                {
                  step: 2,
                  icon: Users,
                  title: 'They Sign Up',
                  description: 'They create an account and complete their first booking using your code',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50'
                },
                {
                  step: 3,
                  icon: Gift,
                  title: 'You Both Earn',
                  description: 'You both receive 500 credits (worth $50) instantly!',
                  color: 'text-green-600',
                  bg: 'bg-green-50'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${item.bg} rounded-2xl p-6`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.bg} border-2 ${item.color.replace('text-', 'border-')}`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${item.color.replace('text-', 'bg-')} text-white rounded-full font-fredoka`}>
                      Step {item.step}
                    </Badge>
                  </div>
                  <h3 className="font-fredoka font-bold text-graphite text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 font-verdana">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
            <CardTitle className="font-fredoka text-graphite">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((referral, idx) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-soft-cloud rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold">
                        {referral.referee_email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-fredoka font-semibold text-graphite">{referral.referee_email}</p>
                        <p className="text-sm text-gray-600 font-verdana capitalize">
                          {referral.referee_type || 'client'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {referral.status === 'rewarded' ? (
                        <>
                          <Badge className="bg-fresh-mint text-white rounded-full font-fredoka mb-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Rewarded
                          </Badge>
                          <p className="text-sm font-fredoka font-bold text-fresh-mint">
                            +{referral.reward_amount_credits || 500} credits
                          </p>
                        </>
                      ) : referral.status === 'first_booking_complete' ? (
                        <Badge className="bg-amber-500 text-white rounded-full font-fredoka">
                          Processing
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-300 text-gray-700 rounded-full font-fredoka">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-fredoka font-bold text-graphite mb-2">
                  No referrals yet
                </h3>
                <p className="text-gray-600 font-verdana mb-6">
                  Share your referral link to start earning rewards!
                </p>
                <Button
                  onClick={copyToClipboard}
                  className="brand-gradient text-white rounded-full font-fredoka font-semibold"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Referral Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bonus Tiers */}
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
          <CardHeader>
            <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-600" />
              Bonus Tiers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { referrals: 5, bonus: 1000, reached: stats.completedReferrals >= 5 },
                { referrals: 10, bonus: 2500, reached: stats.completedReferrals >= 10 },
                { referrals: 25, bonus: 7500, reached: stats.completedReferrals >= 25 }
              ].map((tier, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border-2 ${
                    tier.reached
                      ? 'bg-green-100 border-fresh-mint'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-fredoka font-bold text-graphite">{tier.referrals} Referrals</p>
                    {tier.reached && (
                      <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-2xl font-fredoka font-bold text-purple-600 mb-1">
                    +{tier.bonus}
                  </p>
                  <p className="text-xs text-gray-600 font-verdana">bonus credits</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}