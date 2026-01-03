import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, Loader2, CheckCircle, Lightbulb, MapPin, 
  Award, Calendar, Package, FileText, TrendingUp, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIProfileAssistant({ profile, bookings = [], reviews = [], onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState({
    specialties: [],
    serviceAreas: []
  });

  const generateAISuggestions = async () => {
    setLoading(true);
    try {
      // Gather cleaner data for AI analysis
      const completedJobs = bookings.filter(b => b.status === 'approved' || b.status === 'completed');
      const jobTypes = completedJobs.map(b => b.cleaning_type);
      const jobLocations = [...new Set(completedJobs.map(b => b.address).filter(Boolean))];
      const reviewTexts = reviews.map(r => r.comment).filter(Boolean).slice(0, 10);
      
      const analysisPrompt = `
You are an AI assistant helping professional cleaners optimize their profiles. Analyze the following data and provide actionable recommendations:

CLEANER PROFILE:
- Bio: ${profile.bio || 'Not provided'}
- Current Specialties: ${profile.specialty_tags?.join(', ') || 'None'}
- Total Jobs Completed: ${profile.total_jobs || 0}
- Average Rating: ${profile.average_rating || 0}/5
- Service Locations: ${profile.service_locations?.join(', ') || 'None'}
- Years of Experience (self-reported): ${profile.years_of_experience || 0}

JOB HISTORY:
- Completed Jobs: ${completedJobs.length}
- Job Types: ${jobTypes.join(', ')}
- Unique Locations: ${jobLocations.length}

CLIENT REVIEWS (sample):
${reviewTexts.slice(0, 5).map((r, i) => `${i + 1}. "${r}"`).join('\n')}

TASK: Provide recommendations in the following JSON format (no markdown, just JSON):
{
  "specialties": {
    "suggested": ["list of 3-5 specialty tags that match their experience"],
    "reasoning": "brief explanation"
  },
  "experienceYears": {
    "estimated": number (0.5 to 20),
    "reasoning": "explanation based on jobs and reviews"
  },
  "serviceAreas": {
    "suggested": ["3-5 location areas based on job locations"],
    "reasoning": "why these areas make sense"
  },
  "cleaningProcess": {
    "recommendations": ["3-5 specific process improvements"],
    "reasoning": "brief explanation"
  },
  "materials": {
    "recommended": ["5-7 essential cleaning products"],
    "reasoning": "why these are recommended"
  },
  "bioImprovement": {
    "suggested": "improved bio text (2-3 sentences)",
    "highlights": ["3 key selling points to emphasize"]
  },
  "pricingInsight": {
    "recommendation": "pricing strategy suggestion",
    "reasoning": "market positioning advice"
  }
}

Use only these specialty options: Pet-Friendly, Eco-Warrior, Deep Clean Expert, Move-Out Specialist, Same-Day Available, Senior-Friendly, Child-Safe Products, Allergy-Conscious, Organization Pro, Post-Construction
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            specialties: {
              type: "object",
              properties: {
                suggested: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" }
              }
            },
            experienceYears: {
              type: "object",
              properties: {
                estimated: { type: "number" },
                reasoning: { type: "string" }
              }
            },
            serviceAreas: {
              type: "object",
              properties: {
                suggested: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" }
              }
            },
            cleaningProcess: {
              type: "object",
              properties: {
                recommendations: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" }
              }
            },
            materials: {
              type: "object",
              properties: {
                recommended: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" }
              }
            },
            bioImprovement: {
              type: "object",
              properties: {
                suggested: { type: "string" },
                highlights: { type: "array", items: { type: "string" } }
              }
            },
            pricingInsight: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                reasoning: { type: "string" }
              }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success('AI analysis complete!');
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (type, value) => {
    try {
      let updates = {};
      
      switch (type) {
        case 'specialties':
          updates.specialty_tags = value;
          break;
        case 'experience':
          updates.years_of_experience = value;
          break;
        case 'serviceAreas':
          updates.service_locations = value;
          break;
        case 'bio':
          updates.bio = value;
          break;
      }

      await base44.entities.CleanerProfile.update(profile.id, updates);
      toast.success('Profile updated!');
      if (onUpdate) onUpdate({ ...profile, ...updates });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const toggleSpecialty = (specialty) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleServiceArea = (area) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }));
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          AI Profile Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!suggestions ? (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="font-fredoka font-bold text-xl text-graphite mb-2">
              Get AI-Powered Profile Recommendations
            </h3>
            <p className="text-gray-600 font-verdana mb-6 max-w-md mx-auto">
              Our AI will analyze your bio, job history, and reviews to suggest improvements for your profile.
            </p>
            <Button
              onClick={generateAISuggestions}
              disabled={loading}
              className="brand-gradient text-white font-fredoka font-bold px-8 py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-6">
              {/* Specialties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Award className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Recommended Specialties</h3>
                    <p className="text-sm text-gray-600 font-verdana mb-3">{suggestions.specialties.reasoning}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {suggestions.specialties.suggested.map((spec, i) => (
                        <Badge
                          key={i}
                          onClick={() => toggleSpecialty(spec)}
                          className={`cursor-pointer transition-all ${
                            selectedSuggestions.specialties.includes(spec)
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-600 border-2 border-purple-300'
                          }`}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    {selectedSuggestions.specialties.length > 0 && (
                      <Button
                        onClick={() => applySuggestion('specialties', selectedSuggestions.specialties)}
                        size="sm"
                        className="bg-purple-600 text-white font-fredoka"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply Selected
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Experience Years */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Estimated Experience</h3>
                    <p className="text-sm text-gray-600 font-verdana mb-3">{suggestions.experienceYears.reasoning}</p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                        {suggestions.experienceYears.estimated} Years
                      </Badge>
                      <Button
                        onClick={() => applySuggestion('experience', suggestions.experienceYears.estimated)}
                        size="sm"
                        className="bg-blue-600 text-white font-fredoka"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Service Areas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Optimal Service Areas</h3>
                    <p className="text-sm text-gray-600 font-verdana mb-3">{suggestions.serviceAreas.reasoning}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {suggestions.serviceAreas.suggested.map((area, i) => (
                        <Badge
                          key={i}
                          onClick={() => toggleServiceArea(area)}
                          className={`cursor-pointer transition-all ${
                            selectedSuggestions.serviceAreas.includes(area)
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-green-600 border-2 border-green-300'
                          }`}
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                    {selectedSuggestions.serviceAreas.length > 0 && (
                      <Button
                        onClick={() => applySuggestion('serviceAreas', selectedSuggestions.serviceAreas)}
                        size="sm"
                        className="bg-green-600 text-white font-fredoka"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply Selected
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Bio Improvement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Improved Bio</h3>
                    <p className="text-sm text-gray-700 font-verdana mb-3 italic">"{suggestions.bioImprovement.suggested}"</p>
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 font-verdana mb-2">Key highlights to emphasize:</p>
                      <ul className="space-y-1">
                        {suggestions.bioImprovement.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-gray-700 font-verdana flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-indigo-600 mt-0.5 flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() => applySuggestion('bio', suggestions.bioImprovement.suggested)}
                      size="sm"
                      className="bg-indigo-600 text-white font-fredoka"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Use This Bio
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Cleaning Process */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Process Improvements</h3>
                    <p className="text-sm text-gray-600 font-verdana mb-3">{suggestions.cleaningProcess.reasoning}</p>
                    <ul className="space-y-2">
                      {suggestions.cleaningProcess.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700 font-verdana flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Materials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Recommended Materials</h3>
                    <p className="text-sm text-gray-600 font-verdana mb-3">{suggestions.materials.reasoning}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.materials.recommended.map((mat, i) => (
                        <Badge key={i} className="bg-teal-100 text-teal-700 border-2 border-teal-300 justify-start">
                          {mat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Pricing Insight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <DollarSign className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-graphite mb-1">Pricing Strategy</h3>
                    <p className="text-sm text-gray-700 font-verdana mb-2">{suggestions.pricingInsight.recommendation}</p>
                    <p className="text-xs text-gray-600 font-verdana italic">{suggestions.pricingInsight.reasoning}</p>
                  </div>
                </div>
              </motion.div>

              {/* Regenerate Button */}
              <Button
                onClick={generateAISuggestions}
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-fredoka font-bold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate Suggestions
              </Button>
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}