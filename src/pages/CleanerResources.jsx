import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GraduationCap, Tag, BookOpen, Video, FileText, TrendingUp, 
  DollarSign, Star, Award, Sparkles, Link as LinkIcon, Copy, CheckCircle,
  Shield, Camera, Clock, MessageSquare, Package, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';


export default function CleanerResources() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to get current user, but don't restrict access if not logged in
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // User not logged in - that's okay, show public resources
        setUser(null);
      }

      setDiscounts([]);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading resources:', showToast: false });
    }
    setLoading(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const educationTopics = [
    {
      title: 'Maximizing Your Earnings',
      icon: DollarSign,
      color: 'emerald',
      tips: [
        'Upload product verification photos - cleaners with photos get 34% more bookings',
        'Maintain a 95%+ on-time rate to reach Pro or Elite tier',
        'Respond to messages within 2 hours for better client trust',
        'Upload high-quality before/after photos every job',
        'Keep your calendar updated to avoid booking conflicts',
        'Offer recurring booking discounts to build steady income'
      ]
    },
    {
      title: 'Improving Your Reliability Score',
      icon: TrendingUp,
      color: 'blue',
      tips: [
        'Check in within 15 minutes of scheduled start time (grace period)',
        'Upload before/after photos for every job (100% compliance)',
        'Maintain 4.5+ star average rating',
        'Keep dispute rate under 5%',
        'Avoid no-shows and last-minute cancellations',
        'Respond professionally to any client concerns'
      ]
    },
    {
      title: 'Getting 5-Star Reviews',
      icon: Star,
      color: 'amber',
      tips: [
        'Communicate before arrival (text or call)',
        'Take clear, well-lit before/after photos',
        'Go the extra mile - fold towels, straighten pillows',
        'Use quality products that clients notice',
        'Ask if there are any special requests or concerns',
        'Follow up after the job to ensure satisfaction'
      ]
    },
    {
      title: 'Product Selection Guide',
      icon: Sparkles,
      color: 'purple',
      tips: [
        'Match products to your tier - Developing: standard, Pro: eco/professional, Elite: premium',
        'Always ask about allergies before using fragranced products',
        'Invest in microfiber cloths - clients notice the difference',
        'Keep a backup kit for clients with sensitivities',
        'Consider eco-friendly options - 68% of clients prefer them',
        'Use partner discount codes below to save 15-30% on supplies'
      ]
    },
    {
      title: 'Safety & Professionalism',
      icon: Shield,
      color: 'red',
      tips: [
        'Always wear closed-toe shoes and bring cleaning gloves',
        'Keep liability insurance current (required for Pro/Elite)',
        'Respect client privacy - no photos of personal items',
        'GPS check-in proves you arrived on time',
        'If you find damage or issues, photograph and report immediately',
        'Maintain professional boundaries and communication'
      ]
    },
    {
      title: 'Photo Best Practices',
      icon: Camera,
      color: 'cyan',
      tips: [
        'Take photos from the same angle for before/after comparison',
        'Ensure good lighting - open curtains or turn on lights',
        'Capture wide shots showing the whole area',
        'Focus on the most improved areas (kitchen counters, bathroom sinks)',
        'Avoid photos with client personal items visible',
        'Upload immediately after finishing each area'
      ]
    }
  ];

  const videoTutorials = [
    { title: 'Getting Started on PureTask', duration: '5:32', views: '1.2K' },
    { title: 'Maximizing Your Profile', duration: '8:15', views: '890' },
    { title: 'Photo Tips for Higher Ratings', duration: '6:47', views: '2.1K' },
    { title: 'Handling Difficult Situations', duration: '10:23', views: '654' },
    { title: 'Product Recommendations by Tier', duration: '12:05', views: '1.8K' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-soft-cloud">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-fredoka font-bold text-graphite">Cleaner Resources</h1>
              <p className="text-lg text-gray-600 font-verdana">Education, discounts, and tips to grow your business</p>
            </div>
          </div>
        </motion.div>

        {/* Not logged in notice */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
              <AlertDescription className="flex items-center justify-between font-verdana">
                <span>
                  <strong>Ready to join?</strong> Sign up as a cleaner to access exclusive partner discounts and your personal dashboard.
                </span>
                <Button onClick={() => navigate(createPageUrl('RoleSelection'))} className="ml-4 brand-gradient text-white rounded-full font-fredoka font-semibold">
                  Sign Up
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-fredoka font-semibold text-graphite text-lg mb-4">Quick Access</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 rounded-full font-fredoka border-2"
                  onClick={() => navigate(createPageUrl('MaterialsList'))}
                >
                  <Package className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-fredoka font-semibold text-graphite">Materials List</div>
                    <div className="text-xs text-gray-600 font-verdana">Recommended supplies & tools</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 rounded-full font-fredoka border-2"
                  onClick={() => navigate(createPageUrl('ReliabilityScoreExplained'))}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-fredoka font-semibold text-graphite">Score Guide</div>
                    <div className="text-xs text-gray-600 font-verdana">How your score is calculated</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        <Tabs defaultValue="discounts" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1 rounded-full">
            <TabsTrigger value="discounts" className="data-[state=active]:brand-gradient data-[state=active]:text-white rounded-full font-fredoka">
              <Tag className="w-4 h-4 mr-2" />
              Partner Discounts
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:brand-gradient data-[state=active]:text-white rounded-full font-fredoka">
              <BookOpen className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:brand-gradient data-[state=active]:text-white rounded-full font-fredoka">
              <Video className="w-4 h-4 mr-2" />
              Video Tutorials
            </TabsTrigger>
          </TabsList>

          {/* Partner Discounts Tab */}
          <TabsContent value="discounts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-xl mb-6 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl">
                  <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
                    <Tag className="w-6 h-6 text-fresh-mint" />
                    Exclusive Partner Discounts
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-verdana mt-2">
                    Save 15-30% on professional cleaning supplies with our partner discounts. Use these codes at checkout.
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {discounts.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {discounts.map((discount) => (
                        <Card key={discount.id} className="border-2 border-emerald-200 hover:border-emerald-400 transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900">{discount.partner_name}</h3>
                                <Badge className="mt-2 bg-emerald-500 text-white">
                                  {discount.discount_percentage}% OFF
                                </Badge>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {discount.product_category.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-4">{discount.description}</p>
                            
                            <div className="bg-slate-50 p-3 rounded-lg mb-3">
                              <p className="text-xs text-slate-500 mb-1">Discount Code:</p>
                              <div className="flex items-center justify-between">
                                <code className="text-lg font-bold text-emerald-600">{discount.discount_code}</code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyCode(discount.discount_code)}
                                  className="ml-2"
                                >
                                  {copiedCode === discount.discount_code ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {discount.partner_url && (
                              <a 
                                href={discount.partner_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                              >
                                <LinkIcon className="w-4 h-4" />
                                Visit Store
                              </a>
                            )}

                            {discount.expiry_date && (
                              <p className="text-xs text-slate-500 mt-3">
                                Expires: {new Date(discount.expiry_date).toLocaleDateString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-lg text-slate-600 mb-2">No active discounts right now</p>
                      <p className="text-sm text-slate-500">Check back soon for exclusive partner offers!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How to Use Discounts */}
              <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
                <AlertDescription className="font-verdana">
                  <strong>How to use these discounts:</strong> Click "Visit Store", shop for your supplies, and enter the discount code at checkout. These codes are exclusive to PureTask cleaners!
                </AlertDescription>
              </Alert>
            </motion.div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <div className="space-y-6">
              {educationTopics.map((topic, index) => (
                <motion.div
                  key={topic.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r from-${topic.color}-400 to-${topic.color}-600`} />
                    <CardHeader className={`bg-${topic.color}-50`}>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${topic.color}-500 rounded-lg flex items-center justify-center`}>
                          <topic.icon className="w-6 h-6 text-white" />
                        </div>
                        {topic.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {topic.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-3">
                            <CheckCircle className={`w-5 h-5 text-${topic.color}-500 mt-0.5 flex-shrink-0`} />
                            <span className="text-slate-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Video Tutorials Tab */}
          <TabsContent value="videos">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-6 h-6 text-purple-600" />
                  Video Tutorials
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Learn best practices from top-performing cleaners
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {videoTutorials.map((video, index) => (
                    <Card key={index} className="border-2 border-slate-200 hover:border-purple-400 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{video.title}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {video.duration}
                                </Badge>
                                <span className="text-xs text-slate-500">{video.views} views</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Watch</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500">More tutorials coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}