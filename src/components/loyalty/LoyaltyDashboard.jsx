import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Gift, Star, Sparkles, Check, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LOYALTY_TIERS, REWARDS_CATALOG, redeemReward } from './LoyaltyService';
import { toast } from 'sonner';

export default function LoyaltyDashboard({ clientEmail }) {
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    loadData();
  }, [clientEmail]);

  const loadData = async () => {
    try {
      const profiles = await base44.entities.ClientProfile.filter({ user_email: clientEmail });
      if (profiles.length > 0) setProfile(profiles[0]);

      const rewardRecords = await base44.entities.LoyaltyReward.filter({
        client_email: clientEmail,
        status: 'available'
      });
      setRewards(rewardRecords);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    }
    setLoading(false);
  };

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    const result = await redeemReward(clientEmail, rewardId);
    if (result.success) {
      toast.success('Reward redeemed successfully!');
      loadData();
    } else {
      toast.error(result.error || 'Failed to redeem reward');
    }
    setRedeeming(null);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const currentTier = profile?.loyalty_tier || 'Bronze';
  const currentPoints = profile?.loyalty_points || 0;
  const tierInfo = LOYALTY_TIERS[currentTier];
  const progressToNext = profile?.points_to_next_tier > 0 
    ? ((tierInfo.max - profile.points_to_next_tier) / tierInfo.max) * 100 
    : 100;

  const tierColors = {
    Bronze: 'bg-amber-600',
    Silver: 'bg-gray-400',
    Gold: 'bg-yellow-500',
    Platinum: 'bg-purple-600'
  };

  return (
    <div className="space-y-6">
      {/* Tier Status */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 ${tierColors[currentTier]} rounded-xl flex items-center justify-center shadow-lg`}>
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-fredoka">{currentTier} Tier</CardTitle>
                <CardDescription className="font-verdana">
                  {currentPoints} points • Rank: Top {currentTier === 'Platinum' ? '5' : currentTier === 'Gold' ? '15' : currentTier === 'Silver' ? '35' : '50'}%
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-puretask-blue text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.points_to_next_tier > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-verdana">Progress to Next Tier</span>
                <span className="font-fredoka font-semibold">{profile.points_to_next_tier} points to go</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
            </div>
          )}
          
          <div>
            <p className="text-sm font-fredoka font-semibold mb-2">Your Benefits:</p>
            <div className="space-y-1">
              {tierInfo.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="font-verdana">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Rewards */}
      {rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-fredoka flex items-center gap-2">
              <Gift className="w-5 h-5 text-puretask-blue" />
              Your Active Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rewards.map(reward => (
              <div key={reward.id} className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-fredoka font-semibold">{reward.reward_name}</p>
                    <p className="text-xs text-gray-600 font-verdana">{reward.reward_description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.ceil((new Date(reward.expires_at) - new Date()) / (1000 * 60 * 60 * 24))}d
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rewards Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Redeem Rewards
          </CardTitle>
          <CardDescription className="font-verdana">
            Exchange your points for exclusive perks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {REWARDS_CATALOG.map(reward => {
              const canAfford = currentPoints >= reward.points_cost;
              return (
                <motion.div
                  key={reward.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 ${canAfford ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-fredoka font-semibold">{reward.name}</h3>
                      <p className="text-xs text-gray-600 font-verdana mt-1">{reward.description}</p>
                    </div>
                    <Badge className={canAfford ? 'bg-puretask-blue' : 'bg-gray-400'}>
                      {reward.points_cost} pts
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || redeeming === reward.id}
                    className={`w-full mt-2 ${canAfford ? 'brand-gradient' : 'bg-gray-300'} text-white`}
                  >
                    {redeeming === reward.id ? 'Redeeming...' : canAfford ? 'Redeem' : `Need ${reward.points_cost - currentPoints} more`}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Ways to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🧹</span>
              </div>
              <div>
                <p className="font-fredoka font-semibold text-sm">Complete a Booking</p>
                <p className="text-xs text-gray-600 font-verdana">+100 points</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <p className="font-fredoka font-semibold text-sm">Leave a Review</p>
                <p className="text-xs text-gray-600 font-verdana">+25 points</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <div>
                <p className="font-fredoka font-semibold text-sm">Refer a Friend</p>
                <p className="text-xs text-gray-600 font-verdana">+200 points</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🎂</span>
              </div>
              <div>
                <p className="font-fredoka font-semibold text-sm">Birthday Bonus</p>
                <p className="text-xs text-gray-600 font-verdana">+100 points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}