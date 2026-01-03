import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Award, CheckCircle, Clock, Camera, MessageSquare,
  Star, XCircle, AlertTriangle, DollarSign, Zap, Shield, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReliabilityScoreExplained() {
  return (
    <div className="min-h-screen bg-soft-cloud py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-fredoka font-bold text-graphite mb-4">
            Reliability Score Guide
          </h1>
          <p className="text-xl text-gray-600 font-verdana max-w-2xl mx-auto">
            How we calculate your score and what it means for your success
          </p>
        </motion.div>

        {/* Score Overview */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-white text-center">
            <h2 className="text-3xl font-fredoka font-bold mb-2">Your Score Matters</h2>
            <p className="text-lg font-verdana opacity-90">
              Higher scores mean more bookings, higher rates, and better client trust
            </p>
          </div>
        </Card>

        {/* Tier System */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Award className="w-6 h-6 text-amber-600" />
              Tier System
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <TierCard
                tier="Developing"
                score="0-59"
                rateRange="150-350"
                color="bg-gray-100 border-gray-300 text-gray-700"
                features={['Building reputation', 'Learning platform', 'Standard support']}
              />
              <TierCard
                tier="Semi Pro"
                score="60-74"
                rateRange="350-450"
                color="bg-blue-100 border-blue-300 text-blue-700"
                features={['Featured listings', 'Higher visibility', 'Quality badge']}
              />
              <TierCard
                tier="Pro"
                score="75-89"
                rateRange="450-600"
                color="bg-purple-100 border-purple-300 text-purple-700"
                features={['Premium placement', 'Pro badge', 'Priority bookings']}
              />
              <TierCard
                tier="Elite"
                score="90-100"
                rateRange="600-850"
                color="bg-amber-100 border-amber-300 text-amber-700"
                features={['Top of search', '85% payout rate', 'Elite badge']}
                highlight
              />
            </div>
          </CardContent>
        </Card>

        {/* Scoring Components */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Zap className="w-6 h-6 text-fresh-mint" />
              How Your Score is Calculated
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <ComponentExplanation
              icon={CheckCircle}
              name="Attendance Rate"
              points={25}
              description="Show up for every accepted job. No-shows hurt your score significantly."
              color="text-green-600"
            />
            <ComponentExplanation
              icon={Clock}
              name="Punctuality Rate"
              points={20}
              description="GPS check-in within 15 minutes of scheduled start time. Being early is even better!"
              color="text-blue-600"
            />
            <ComponentExplanation
              icon={Camera}
              name="Photo Proof Compliance"
              points={15}
              description="Upload minimum 3 photos (before + after combined) for every job. Shows professionalism."
              color="text-purple-600"
            />
            <ComponentExplanation
              icon={MessageSquare}
              name="Communication Rate"
              points={10}
              description="Respond to messages quickly (within 2 hours). Keep clients informed."
              color="text-cyan-600"
            />
            <ComponentExplanation
              icon={CheckCircle}
              name="Completion Confirmation"
              points={10}
              description="GPS check-out + photo upload when job is done. Complete the full process."
              color="text-green-600"
            />
            <ComponentExplanation
              icon={Star}
              name="Average Rating"
              points={10}
              description="Client star ratings (1-5 scale). Quality work = great reviews."
              color="text-amber-600"
            />

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-fredoka font-semibold text-graphite mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Penalties (Things to Avoid)
              </h3>
              <div className="space-y-3">
                <PenaltyExplanation
                  name="Cancellation Penalty"
                  maxPoints={-20}
                  description="Cancelling within 24 hours of a job. Use the platform responsibly."
                />
                <PenaltyExplanation
                  name="No-Show Penalty"
                  maxPoints={-15}
                  description="Not checking in for accepted jobs. Always communicate if issues arise."
                />
                <PenaltyExplanation
                  name="Dispute Penalty"
                  maxPoints={-10}
                  description="Client disputes where you're at fault. Quality work prevents disputes."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Wins */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Zap className="w-6 h-6 text-puretask-blue" />
              Easy Ways to Improve Your Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <QuickWin
                title="Always Upload Photos"
                description="Take 3+ clear before/after photos. This alone gives you +15 points."
                icon={Camera}
              />
              <QuickWin
                title="Check In On Time"
                description="Use GPS check-in within 15 minutes of start time. Aim to be 5 minutes early!"
                icon={Clock}
              />
              <QuickWin
                title="Complete Full Process"
                description="GPS check-in → clean → upload photos → GPS check-out. Every step matters."
                icon={CheckCircle}
              />
              <QuickWin
                title="Communicate Proactively"
                description="Message clients before arrival, update them during cleaning, confirm completion."
                icon={MessageSquare}
              />
            </div>
          </CardContent>
        </Card>

        {/* Benefits of High Score */}
        <Card className="mb-8 border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <DollarSign className="w-6 h-6 text-purple-600" />
              Why a High Score Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <BenefitItem
                icon={DollarSign}
                text="Charge higher rates (up to 850 credits/hour at Elite tier)"
              />
              <BenefitItem
                icon={TrendingUp}
                text="Appear first in search results and get more booking requests"
              />
              <BenefitItem
                icon={Shield}
                text="Build client trust with verified performance badges"
              />
              <BenefitItem
                icon={Award}
                text="Unlock 85% payout rate at Elite tier (vs 80% standard)"
              />
              <BenefitItem
                icon={Star}
                text="Get access to premium clients and recurring subscription bookings"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 font-fredoka text-graphite">
              <Info className="w-6 h-6 text-gray-600" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <FAQItem
              question="When is my score calculated?"
              answer="Your score is automatically updated nightly at 2 AM. Major changes (like tier upgrades) happen in real-time after completing jobs."
            />
            <FAQItem
              question="How long does it take to reach Elite tier?"
              answer="It depends on consistency. Cleaners who follow best practices (photos, on-time arrival, quality work) typically reach Pro in 2-3 months and Elite in 6-12 months."
            />
            <FAQItem
              question="Can my score go down?"
              answer="Yes. Cancellations, no-shows, late arrivals, and missing photos all negatively impact your score. Consistency is key!"
            />
            <FAQItem
              question="What if I have a valid reason for being late or cancelling?"
              answer="Contact support immediately. We understand emergencies happen and can adjust penalties on a case-by-case basis."
            />
            <FAQItem
              question="Do I need to upload photos for basic cleaning jobs?"
              answer="Photos are required for deep cleaning and move-out jobs. For basic jobs, they're recommended but give you a +15 point boost for compliance."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const TierCard = ({ tier, score, rateRange, color, features, highlight = false }) => (
  <div className={`p-6 rounded-2xl border-2 ${color} ${highlight ? 'shadow-xl scale-105' : 'shadow-md'}`}>
    {highlight && (
      <Badge className="mb-2 bg-amber-600 text-white rounded-full font-fredoka">Best Rate</Badge>
    )}
    <h3 className="font-fredoka font-bold text-xl mb-1">{tier}</h3>
    <p className="text-2xl font-fredoka font-bold mb-1">{score}</p>
    <p className="text-sm font-verdana mb-3">{rateRange} credits/hr</p>
    <ul className="space-y-1 text-xs font-verdana">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-1">
          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ComponentExplanation = ({ icon: Icon, name, points, description, color }) => (
  <div className="flex items-start gap-4 p-4 bg-soft-cloud rounded-2xl">
    <Icon className={`w-6 h-6 ${color} flex-shrink-0 mt-1`} />
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-fredoka font-semibold text-graphite">{name}</h3>
        <Badge className="bg-puretask-blue text-white rounded-full font-fredoka">
          +{points} pts
        </Badge>
      </div>
      <p className="text-sm text-gray-600 font-verdana">{description}</p>
    </div>
  </div>
);

const PenaltyExplanation = ({ name, maxPoints, description }) => (
  <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-200">
    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-fredoka font-semibold text-red-700">{name}</h3>
        <Badge className="bg-red-600 text-white rounded-full font-fredoka">
          {maxPoints} pts
        </Badge>
      </div>
      <p className="text-sm text-red-600 font-verdana">{description}</p>
    </div>
  </div>
);

const QuickWin = ({ title, description, icon: Icon }) => (
  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-puretask-blue flex-shrink-0 mt-1" />
      <div>
        <h4 className="font-fredoka font-semibold text-graphite mb-1">{title}</h4>
        <p className="text-sm text-gray-600 font-verdana">{description}</p>
      </div>
    </div>
  </div>
);

const BenefitItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3 p-3 bg-soft-cloud rounded-2xl">
    <Icon className="w-5 h-5 text-puretask-blue flex-shrink-0" />
    <span className="font-verdana text-gray-700">{text}</span>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <div className="p-4 bg-soft-cloud rounded-2xl">
    <h4 className="font-fredoka font-semibold text-graphite mb-2">{question}</h4>
    <p className="text-sm text-gray-600 font-verdana">{answer}</p>
  </div>
);