// JobOfferRecommendation - AI-powered job offer analysis
// Helps cleaners make informed decisions about accepting jobs

import React, { useState, useEffect } from 'react';
import { aiCleanerChatService } from '@/services/aiCleanerChatService';
import type { JobRecord } from '@/types/cleanerJobTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Clock, MapPin,
  CheckCircle, AlertTriangle, Zap, Target, Award, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface JobOfferRecommendationProps {
  job: JobRecord;
  cleanerId: string;
  cleanerEmail: string;
  stats?: {
    totalJobs: number;
    reliabilityScore: number;
    avgRating: number;
    totalEarnings: number;
  };
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function JobOfferRecommendation({
  job,
  cleanerId,
  cleanerEmail,
  stats,
  onAccept,
  onDecline
}: JobOfferRecommendationProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    analyzeOffer();
  }, [job.id]);

  const analyzeOffer = async () => {
    try {
      setLoading(true);
      const result = await aiCleanerChatService.analyzeJobOffer(job, {
        cleanerId,
        cleanerEmail,
        currentJob: job,
        stats
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze job offer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-info-border">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-info mx-auto mb-4" />
          <p className="font-body text-gray-600">AI is analyzing this job offer...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const getRecommendationBadge = () => {
    const config = {
      accept: {
        icon: CheckCircle,
        label: 'Recommended',
        variant: 'success' as const,
        color: 'text-success'
      },
      consider: {
        icon: Minus,
        label: 'Consider Carefully',
        variant: 'warning' as const,
        color: 'text-warning'
      },
      pass: {
        icon: AlertTriangle,
        label: 'Not Recommended',
        variant: 'error' as const,
        color: 'text-error'
      }
    };

    const { icon: Icon, label, variant, color } = config[analysis.recommendation];

    return (
      <Badge variant={variant} className="font-heading text-base py-2 px-4">
        <Icon className={`w-5 h-5 mr-2 ${color}`} />
        {label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-info">
        <CardHeader className="bg-gradient-to-r from-info-soft to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Zap className="w-6 h-6 text-info" />
              AI Job Analysis
            </CardTitle>
            {getRecommendationBadge()}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-success-soft border-success-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="text-sm font-body text-gray-600">Estimated Earnings</span>
                </div>
                <p className="text-2xl font-heading font-bold text-success">
                  ${analysis.estimatedEarnings.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-system-soft border-system-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-system" />
                  <span className="text-sm font-body text-gray-600">Time Required</span>
                </div>
                <p className="text-2xl font-heading font-bold text-system">
                  {Math.floor(analysis.estimatedTime / 60)}h {analysis.estimatedTime % 60}m
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reasons */}
          <div>
            <h3 className="font-heading font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-info" />
              Why {analysis.recommendation === 'accept' ? 'You Should Accept' : analysis.recommendation === 'pass' ? 'You Should Pass' : 'Consider This Carefully'}:
            </h3>
            <ul className="space-y-2">
              {analysis.reasons.map((reason: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 font-body text-gray-700"
                >
                  <CheckCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Job Details Toggle */}
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="w-full font-heading"
          >
            {showDetails ? 'Hide' : 'Show'} Job Details
          </Button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t pt-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-4 font-body text-sm">
                <div>
                  <span className="text-gray-600">Date & Time:</span>
                  <p className="font-semibold">{job.date} at {job.time}</p>
                </div>
                <div>
                  <span className="text-gray-600">Cleaning Type:</span>
                  <p className="font-semibold capitalize">{job.cleaning_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Property Size:</span>
                  <p className="font-semibold">{job.bedrooms}BR / {job.bathrooms}BA</p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-semibold">{job.duration_hours} hours</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Address:</span>
                  <p className="font-semibold flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-system" />
                    {job.address}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onAccept}
              disabled={!onAccept}
              className="flex-1 bg-success hover:bg-success/90 text-white font-heading font-semibold"
              size="lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Accept Job
            </Button>
            <Button
              onClick={onDecline}
              disabled={!onDecline}
              variant="outline"
              className="flex-1 font-heading font-semibold"
              size="lg"
            >
              Decline
            </Button>
          </div>

          {/* Recommendation Tip */}
          {analysis.recommendation === 'accept' && (
            <Alert className="bg-success-soft border-success-border">
              <Award className="w-4 h-4 text-success" />
              <AlertDescription className="font-body">
                <strong>Pro Tip:</strong> This job aligns well with your profile. Accepting it could boost your earnings and reliability score!
              </AlertDescription>
            </Alert>
          )}

          {analysis.recommendation === 'consider' && (
            <Alert className="bg-warning-soft border-warning-border">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <AlertDescription className="font-body">
                <strong>Note:</strong> This job has some pros and cons. Review the details carefully before deciding.
              </AlertDescription>
            </Alert>
          )}

          {analysis.recommendation === 'pass' && (
            <Alert className="bg-error-soft border-error-border">
              <AlertTriangle className="w-4 h-4 text-error" />
              <AlertDescription className="font-body">
                <strong>Consider:</strong> There may be better opportunities available. Passing on this won't affect your reliability score.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

