import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Check, Users, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateReferralCode } from './ReferralSystem';
import { motion } from 'framer-motion';

export default function ReferralWidget({ userEmail }) {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalEarned: 0 });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      // Get or create referral code
      const referrals = await base44.entities.Referral.filter({
        referrer_email: userEmail
      });
      
      if (referrals.length === 0) {
        const code = await generateReferralCode(userEmail);
        setReferralCode(code);
      } else {
        // Get the most recent active referral code
        const activeReferral = referrals.find(r => r.status === 'pending' || r.status === 'completed');
        setReferralCode(activeReferral?.referral_code || referrals[0].referral_code);
      }
      
      // Calculate stats
      const pending = referrals.filter(r => r.status === 'pending' && r.referee_email).length;
      const completed = referrals.filter(r => r.status === 'completed').length;
      const totalEarned = completed * 20; // $20 per completed referral
      
      setStats({ pending, completed, totalEarned });
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
    setLoading(false);
  };

  const getReferralLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${createPageUrl('ClientSignup')}?ref=${referralCode}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const referralLink = getReferralLink();
    const subject = encodeURIComponent('Get $20 off your first cleaning with PureTask!');
    const body = encodeURIComponent(`I've been using PureTask for professional cleaning and thought you might like it too!

Use my referral link to get $20 off your first booking:
${referralLink}

PureTask connects you with verified, highly-rated cleaners with GPS tracking and photo proof. It's been a game-changer for me!`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Get $20 off your first cleaning with PureTask! ${getReferralLink()}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-emerald-600" />
            Give $20, Get $20
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Refer friends and you'll both get $20 in credits!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-white rounded-lg border-2 border-emerald-200 shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-xs text-slate-600 mt-1">Completed</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-amber-200 shadow-sm">
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-slate-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
              <p className="text-3xl font-bold text-blue-600">${stats.totalEarned}</p>
              <p className="text-xs text-slate-600 mt-1">Earned</p>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <Input
                value={getReferralLink()}
                readOnly
                className="flex-1 bg-white border-2 border-slate-200"
                onClick={(e) => e.target.select()}
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={shareViaEmail}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Email
            </Button>
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              className="border-2 border-slate-300 hover:bg-slate-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share on 𝕏
            </Button>
          </div>

          {/* How it works */}
          <div className="p-4 bg-white rounded-lg border-2 border-emerald-200">
            <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              How it works:
            </p>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Share your unique referral link with friends</li>
              <li>They sign up and book their first cleaning</li>
              <li>You both get $20 in credits automatically!</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-xs text-slate-500">
                💡 Tip: The more you share, the more you save on future cleanings!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}