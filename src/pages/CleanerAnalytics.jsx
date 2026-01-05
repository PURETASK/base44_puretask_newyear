import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Star, Clock, Camera, Target, CheckCircle, BarChart3, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function CleanerAnalytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'cleaner') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      const profiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }

      const userBookings = await base44.entities.Booking.filter({ 
        cleaner_email: currentUser.email 
      }, '-date');
      setBookings(userBookings);
    } catch (error) {
      handleError(error, { userMessage: 'Error loading analytics:', showToast: false });
    }
    setLoading(false);
  };

  const calculateStats = () => {
    const completed = bookings.filter(b => b.status === 'completed');
    const totalEarnings = completed.reduce((sum, b) => sum + (b.total_price * 0.85), 0);
    const avgRating = profile?.average_rating || 5.0;
    
    const earningsByMonth = {};
    completed.forEach(b => {
      const month = new Date(b.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      earningsByMonth[month] = (earningsByMonth[month] || 0) + (b.total_price * 0.85);
    });

    const monthlyData = Object.entries(earningsByMonth)
      .map(([month, earnings]) => ({
        month,
        earnings: Math.round(earnings * 10),
        usd: earnings
      }))
      .slice(-6);

    const serviceTypes = {
      basic: completed.filter(b => b.cleaning_type === 'basic').length,
      deep: completed.filter(b => b.cleaning_type === 'deep').length,
      moveout: completed.filter(b => b.cleaning_type === 'moveout').length
    };

    return {
      totalJobs: completed.length,
      totalEarnings: Math.round(totalEarnings * 10),
      avgRating,
      monthlyData,
      serviceTypes,
      reliabilityScore: profile?.reliability_score || 75
    };
  };

  const stats = calculateStats();

  const COLORS = ['#0078FF', '#00D4FF', '#28C76F', '#FFA500'];

  const pieData = [
    { name: 'Basic', value: stats.serviceTypes.basic },
    { name: 'Deep', value: stats.serviceTypes.deep },
    { name: 'Move-Out', value: stats.serviceTypes.moveout }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600 font-verdana">Track your performance and earnings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-white rounded-2xl">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-10 h-10 text-puretask-blue mx-auto mb-3" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalJobs}</p>
                <p className="text-sm text-gray-600 font-verdana">Completed Jobs</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-white rounded-2xl">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-10 h-10 text-fresh-mint mx-auto mb-3" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.totalEarnings}</p>
                <p className="text-sm text-gray-600 font-verdana">Total Earnings (credits)</p>
                <p className="text-xs text-gray-500 font-verdana">≈ ${(stats.totalEarnings / 10).toFixed(0)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-amber-50 to-white rounded-2xl">
              <CardContent className="p-6 text-center">
                <Star className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600 font-verdana">Average Rating</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-white rounded-2xl">
              <CardContent className="p-6 text-center">
                <Target className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{stats.reliabilityScore}</p>
                <p className="text-sm text-gray-600 font-verdana">Reliability Score</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList className="bg-white shadow-md rounded-full p-1 font-fredoka">
            <TabsTrigger value="earnings" className="rounded-full">Earnings Trend</TabsTrigger>
            <TabsTrigger value="services" className="rounded-full">Service Distribution</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-full">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="font-fredoka text-graphite">Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" style={{ fontFamily: 'Verdana' }} />
                    <YAxis stroke="#6B7280" style={{ fontFamily: 'Verdana' }} />
                    <Tooltip 
                      contentStyle={{ 
                        fontFamily: 'Verdana', 
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Fredoka' }} />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#0078FF" 
                      strokeWidth={3}
                      dot={{ fill: '#0078FF', r: 6 }}
                      name="Credits Earned"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="font-fredoka text-graphite">Service Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        fontFamily: 'Verdana',
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Clock className="w-10 h-10 text-puretask-blue mx-auto mb-3" />
                  <p className="text-3xl font-fredoka font-bold text-puretask-blue mb-1">
                    {profile?.on_time_rate || 100}%
                  </p>
                  <p className="text-sm text-gray-600 font-verdana">On-Time Rate</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Camera className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-fredoka font-bold text-purple-600 mb-1">
                    {profile?.photo_compliance_rate || 100}%
                  </p>
                  <p className="text-sm text-gray-600 font-verdana">Photo Compliance</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-fresh-mint mx-auto mb-3" />
                  <p className="text-3xl font-fredoka font-bold text-fresh-mint mb-1">98%</p>
                  <p className="text-sm text-gray-600 font-verdana">Completion Rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}