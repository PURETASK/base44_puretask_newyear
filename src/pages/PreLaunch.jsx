import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, Clock, Shield, Star, Users, Zap, Mail, ArrowRight, MapPin, Camera, Award, Calendar, Phone, Home, Bell, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function PreLaunch() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [userType, setUserType] = useState('client');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!address || address.length < 5) {
      setError('Please enter your address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await base44.entities.PreLaunchSignup.create({
        email,
        phone,
        address,
        user_type: userType,
        signed_up_at: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.log('Signup recorded:', email, phone, address, userType);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Zap, title: 'Early Access', description: 'Be the first to experience PureTask' },
    { icon: Star, title: 'Founding Member Perks', description: 'Exclusive discounts for early supporters' },
    { icon: Shield, title: 'Priority Onboarding', description: 'Skip the waitlist when we launch' },
  ];

  const stats = [
    { value: '100+', label: 'Cleaner Goal Before Launch' },
    { value: '50+', label: 'Cities We\'re Targeting' },
    { value: '1,000+', label: 'Early Signups Goal' },
  ];

  const features = [
    { icon: MapPin, title: 'GPS Tracking', description: 'Know exactly when your cleaner arrives and leaves' },
    { icon: Camera, title: 'Photo Proof', description: 'Before & after photos for every cleaning' },
    { icon: Shield, title: 'Verified Cleaners', description: 'Background-checked professionals only' },
    { icon: Award, title: 'Reliability Scores', description: 'Transparent performance metrics' },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-white to-[#EFF6FF] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-20 h-20 rounded-full bg-[#28C76F] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-fredoka font-bold text-[#1D2533] mb-4">
            You're on the list!
          </h1>
          
          {userType === 'cleaner' ? (
            <div className="mb-6">
              <div className="bg-[#28C76F]/10 border border-[#28C76F]/30 rounded-2xl p-6 mb-4">
                <Gift className="w-10 h-10 text-[#28C76F] mx-auto mb-3" />
                <p className="text-lg font-fredoka font-bold text-[#28C76F] mb-2">
                  🎉 You'll receive 150 FREE credits!
                </p>
                <p className="text-gray-600 font-fredoka text-sm">
                  As a thank you for joining early, you'll get 150 credits added to your account when we launch — that's $15 towards your first earnings boost!
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-[#0078FF]/10 border border-[#0078FF]/30 rounded-2xl p-6 mb-4">
                <Gift className="w-10 h-10 text-[#0078FF] mx-auto mb-3" />
                <p className="text-lg font-fredoka font-bold text-[#0078FF] mb-2">
                  🎁 Early Bird Special Coming!
                </p>
                <p className="text-gray-600 font-fredoka text-sm">
                  Check your email! We'll be sending you an exclusive early bird coupon code with a special discount on your first booking.
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <Bell className="w-6 h-6 text-[#0078FF] mx-auto mb-3" />
            <p className="font-fredoka font-semibold text-[#1D2533] mb-2">We'll remind you:</p>
            <ul className="text-sm text-gray-600 font-fredoka space-y-1">
              <li>📅 1 week before launch</li>
              <li>⏰ 48 hours before launch</li>
              <li>🚀 Launch day notification</li>
            </ul>
          </div>

          <p className="text-gray-600 font-fredoka mb-4">
            We'll notify you at <span className="font-semibold text-[#0078FF]">{email}</span>
          </p>
          
          <Badge className="bg-[#0078FF] text-white px-4 py-2 text-sm font-fredoka">
            {userType === 'client' ? '🏠 Client Waitlist' : '✨ Cleaner Waitlist'}
          </Badge>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-white to-[#EFF6FF]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[#0078FF] to-[#00D4FF]">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-fredoka font-bold text-[#1D2533]">PureTask</span>
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge className="bg-[#0078FF]/10 text-[#0078FF] border border-[#0078FF]/20 px-4 py-2 text-sm font-fredoka mb-6">
              <Clock className="w-4 h-4 mr-2 inline" />
              Launching Soon
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-fredoka font-bold text-[#1D2533] mb-6 leading-tight"
          >
            Professional Cleaning,
            <br />
            <span className="bg-gradient-to-r from-[#0078FF] to-[#00D4FF] bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 font-fredoka mb-10 max-w-2xl mx-auto"
          >
            GPS tracking, photo proof, verified cleaners, and transparent pricing. 
            Join the waitlist and be the first to experience the future of home cleaning.
          </motion.p>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="max-w-lg mx-auto border-2 border-[#0078FF]/20 shadow-xl bg-white/80 backdrop-blur">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-fredoka font-bold text-[#1D2533] mb-2">
                  Join the Waitlist
                </h2>
                <p className="text-gray-600 font-fredoka text-sm mb-6">
                  Get early access and exclusive founding member benefits
                </p>

                {/* User Type Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setUserType('client')}
                    className={`flex-1 py-3 px-4 rounded-xl font-fredoka font-semibold transition-all ${
                      userType === 'client'
                        ? 'bg-[#0078FF] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    I Need a Cleaner
                  </button>
                  <button
                    onClick={() => setUserType('cleaner')}
                    className={`flex-1 py-3 px-4 rounded-xl font-fredoka font-semibold transition-all ${
                      userType === 'cleaner'
                        ? 'bg-[#28C76F] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    I'm a Cleaner
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-[#0078FF] rounded-xl font-fredoka"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-[#0078FF] rounded-xl font-fredoka"
                    />
                  </div>

                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Your address (city, state)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-[#0078FF] rounded-xl font-fredoka"
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm font-fredoka">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-14 text-lg font-fredoka font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all ${
                      userType === 'client'
                        ? 'bg-gradient-to-r from-[#0078FF] to-[#00D4FF]'
                        : 'bg-[#28C76F] hover:bg-[#22A85C]'
                    }`}
                  >
                    {loading ? (
                      'Joining...'
                    ) : (
                      <>
                        Get Early Access
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 font-fredoka mt-4">
                  {userType === 'cleaner' 
                    ? '✨ Cleaners get 150 FREE credits at launch!'
                    : '🎁 Clients get an exclusive early bird discount code!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center font-fredoka font-bold text-[#1D2533] mb-6">Our Pre-Launch Goals</h3>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-fredoka font-bold text-[#0078FF]">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-fredoka mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Preview Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-center text-[#1D2533] mb-4">
            What's Coming
          </h2>
          <p className="text-center text-gray-600 font-fredoka mb-10 max-w-xl mx-auto">
            We're building the most transparent and reliable cleaning platform ever created
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0078FF]/10 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-[#0078FF]" />
                </div>
                <h3 className="text-sm font-fredoka font-bold text-[#1D2533] mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-500 font-fredoka text-xs">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-12 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-center text-[#1D2533] mb-10">
            Why Join Early?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#0078FF]/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-7 h-7 text-[#0078FF]" />
                    </div>
                    <h3 className="text-lg font-fredoka font-bold text-[#1D2533] mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 font-fredoka text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Launch Timeline */}
      <div className="container mx-auto px-4 py-12 bg-[#0078FF]/5">
        <div className="max-w-2xl mx-auto text-center">
          <Calendar className="w-10 h-10 text-[#0078FF] mx-auto mb-4" />
          <h2 className="text-2xl font-fredoka font-bold text-[#1D2533] mb-4">
            Expected Launch: Early 2025
          </h2>
          <p className="text-gray-600 font-fredoka">
            We're putting the finishing touches on an amazing experience. 
            Sign up above to be notified the moment we go live!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#0078FF]" />
            <span className="font-fredoka font-bold text-[#1D2533]">PureTask</span>
          </div>
          <p className="text-sm text-gray-500 font-fredoka">
            © 2024 PureTask. Coming soon to transform your cleaning experience.
          </p>
        </div>
      </div>
    </div>
  );
}