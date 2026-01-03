import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, Award, Target, Zap, ChevronRight, 
  CheckCircle, Clock, Camera, Star, DollarSign, Info
} from 'lucide-react';
import ReliabilityMeterV2 from './ReliabilityMeterV2';
import { calculateReliabilityScore, getTierDetails, getRecommendedBaseRate } from './ReliabilityScoreCalculatorV2';
import { motion } from 'framer-motion';

/**
 * Reliability Dashboard - Section 4.3
 * Complete dashboard for cleaners to track and improve their score
 */
export default function ReliabilityDashboard({ cleanerEmail }) {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScoreData();
  }, [cleanerEmail]);

  const loadScoreData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateReliabilityScore(cleanerEmail);
      setScoreData(data);
    } catch (err) {
      console.error('Error loading score:', err);
      setError(err.message);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-puretask-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-verdana">Calculating your score...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 rounded-2xl">
        <AlertDescription className="text-red-900 font-verdana">
          Error loading score: {error}
        </AlertDescription>
      </Alert>
    );
  }

  const { total_score, tier, components, total_jobs } = scoreData;
  const tierDetails = getTierDetails(tier);
  const recommendedRate = getRecommendedBaseRate(tier, total_score);
  const nextTier = getNextTier(tier);
  const pointsToNextTier = nextTier ? tierDetails.max + 1 - total_score : 0;

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <ReliabilityMeterV2 
        score={total_score} 
        tier={tier} 
        components={components}
        showDetails={true}
      />

      {/* Tier Progress */}
      {nextTier && (
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Target className="w-6 h-6 text-puretask-blue" />
              Progress to {nextTier}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-verdana text-gray-600">
                    Current: {total_score} / {tierDetails.max + 1}
                  </span>
                  <span className="text-sm font-fredoka font-semibold text-puretask-blue">
                    +{pointsToNextTier} points needed
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full brand-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${(total_score / (tierDetails.max + 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-sm text-gray-600 font-verdana mb-1">Current Rate Range</p>
                  <p className="text-xl font-fredoka font-bold text-puretask-blue">
                    {tierDetails.base_rate_min}-{tierDetails.base_rate_max} credits/hr
                  </p>
                </div>

                {nextTier && (
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <p className="text-sm text-gray-600 font-verdana mb-1">Next Tier Range</p>
                    <p className="text-xl font-fredoka font-bold text-fresh-mint">
                      {getTierDetails(nextTier).base_rate_min}-{getTierDetails(nextTier).base_rate_max} credits/hr
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <Zap className="w-6 h-6 text-fresh-mint" />
            Quick Wins to Boost Your Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {components.photo_proof < 90 && (
              <QuickWinCard
                icon={Camera}
                title="Upload More Photos"
                description="Always upload 3+ before/after photos for +15 points"
                impact="+15 pts"
                color="bg-purple-50 border-purple-200 text-purple-700"
              />
            )}
            {components.punctuality < 90 && (
              <QuickWinCard
                icon={Clock}
                title="Arrive On Time"
                description="GPS check-in within 15 minutes of scheduled start"
                impact="+20 pts"
                color="bg-blue-50 border-blue-200 text-blue-700"
              />
            )}
            {components.completion_confirmation < 90 && (
              <QuickWinCard
                icon={CheckCircle}
                title="Complete Check-Out"
                description="Always GPS check-out + upload photos when done"
                impact="+10 pts"
                color="bg-green-50 border-green-200 text-fresh-mint"
              />
            )}
            {components.attendance < 90 && (
              <QuickWinCard
                icon={CheckCircle}
                title="Maintain Attendance"
                description="Show up for every accepted job"
                impact="+25 pts"
                color="bg-amber-50 border-amber-200 text-amber-700"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
            <Award className="w-6 h-6 text-amber-600" />
            Your {tier} Tier Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <BenefitItem 
              icon={DollarSign}
              text={`Charge ${tierDetails.base_rate_min}-${tierDetails.base_rate_max} credits/hour`}
            />
            <BenefitItem 
              icon={Star}
              text="Featured in search results"
            />
            <BenefitItem 
              icon={CheckCircle}
              text="Verified professional badge"
            />
            {tier === 'Elite' && (
              <>
                <BenefitItem 
                  icon={Zap}
                  text="Priority support & dispute resolution"
                  highlight
                />
                <BenefitItem 
                  icon={DollarSign}
                  text="85% payout rate (vs 80% standard)"
                  highlight
                />
              </>
            )}
          </div>

          {total_jobs < 10 && (
            <Alert className="mt-4 border-blue-200 bg-blue-50 rounded-2xl">
              <Info className="w-4 h-4 text-puretask-blue" />
              <AlertDescription className="text-blue-900 font-verdana">
                Complete {10 - total_jobs} more job{(10 - total_jobs) !== 1 ? 's' : ''} to unlock full tier features and visibility
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recommended Rate */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-6 text-center">
          <DollarSign className="w-12 h-12 text-puretask-blue mx-auto mb-3" />
          <h3 className="font-fredoka font-bold text-graphite text-xl mb-2">
            Recommended Rate
          </h3>
          <p className="text-4xl font-fredoka font-bold text-puretask-blue mb-2">
            {recommendedRate} credits/hr
          </p>
          <p className="text-sm text-gray-600 font-verdana">
            Based on your {tier} tier and {total_score} reliability score
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const QuickWinCard = ({ icon: Icon, title, description, impact, color }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`p-4 rounded-2xl border ${color} flex items-start gap-3`}
  >
    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-fredoka font-semibold text-graphite">{title}</h4>
        <Badge className="bg-fresh-mint text-white rounded-full font-fredoka">
          {impact}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 font-verdana">{description}</p>
    </div>
  </motion.div>
);

const BenefitItem = ({ icon: Icon, text, highlight = false }) => (
  <div className={`flex items-center gap-3 p-3 rounded-2xl ${
    highlight ? 'bg-amber-50 border border-amber-200' : 'bg-soft-cloud'
  }`}>
    <Icon className={`w-5 h-5 ${highlight ? 'text-amber-600' : 'text-puretask-blue'}`} />
    <span className={`font-verdana ${highlight ? 'font-semibold text-amber-900' : 'text-gray-700'}`}>
      {text}
    </span>
    {highlight && <Badge className="ml-auto bg-amber-600 text-white rounded-full font-fredoka">Elite</Badge>}
  </div>
);

const getNextTier = (currentTier) => {
  const tiers = ['Developing', 'Semi Pro', 'Pro', 'Elite'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};