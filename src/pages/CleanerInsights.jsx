import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Target, Zap, Loader2 } from 'lucide-react';
import ReliabilityMeterV2 from '../components/reliability/ReliabilityMeterV2';

export default function CleanerInsights() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [cleanerProfile] = await base44.entities.CleanerProfile.filter({
        user_email: currentUser.email
      });
      setProfile(cleanerProfile);

      const bookings = await base44.entities.Booking.filter({
        cleaner_email: currentUser.email
      }, '-date', 100);

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recent = completedBookings.filter(
        b => new Date(b.date) >= last30Days
      );

      // Earnings trend (last 8 weeks)
      const weeklyEarnings = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekBookings = completedBookings.filter(b => {
          const date = new Date(b.date);
          return date >= weekStart && date < weekEnd;
        });

        weeklyEarnings.push({
          week: `Week ${8 - i}`,
          earnings: weekBookings.reduce((sum, b) => sum + (b.total_price * 0.85), 0),
          bookings: weekBookings.length
        });
      }

      // Reviews distribution
      const reviews = await base44.entities.Review.filter({
        cleaner_email: currentUser.email
      });

      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating: `${rating} ⭐`,
        count: reviews.filter(r => r.rating === rating).length
      }));

      // Task performance
      const taskCounts = {};
      completedBookings.forEach(b => {
        (b.tasks || []).forEach(task => {
          taskCounts[task] = (taskCounts[task] || 0) + 1;
        });
      });

      const topTasks = Object.entries(taskCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([task, count]) => ({
          task: task.replace(/_/g, ' '),
          count
        }));

      // Recommendations
      const recommendations = [];
      
      if ((cleanerProfile.photo_proof_rate || 0) < 95) {
        recommendations.push({
          type: 'warning',
          title: 'Photo Compliance Low',
          description: `You're at ${cleanerProfile.photo_proof_rate || 0}%. Upload before/after photos for every booking to reach 100%.`,
          impact: '+5 reliability points'
        });
      }

      if ((cleanerProfile.punctuality_rate || 0) < 95) {
        recommendations.push({
          type: 'warning',
          title: 'Punctuality Can Improve',
          description: `Arrive within 15 minutes of scheduled time. Currently at ${cleanerProfile.punctuality_rate || 0}%.`,
          impact: '+3 reliability points'
        });
      }

      if ((cleanerProfile.total_reviews || 0) < 10) {
        recommendations.push({
          type: 'info',
          title: 'Get More Reviews',
          description: 'After each booking, politely ask clients to leave a review. More reviews = more bookings!',
          impact: 'Increased visibility'
        });
      }

      if (cleanerProfile.tier === 'Semi Pro' && cleanerProfile.reliability_score >= 78) {
        recommendations.push({
          type: 'success',
          title: 'Ready for Pro Tier!',
          description: `Complete ${Math.max(0, 30 - (cleanerProfile.total_jobs || 0))} more jobs to unlock Pro status and higher rates.`,
          impact: 'Higher earnings'
        });
      }

      setInsights({
        weeklyEarnings,
        ratingDistribution,
        topTasks,
        recommendations,
        recentBookings: recent.length,
        avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0,
        totalEarnings: completedBookings.reduce((sum, b) => sum + (b.total_price * 0.85), 0)
      });
    } catch (error) {
      handleError(error, { userMessage: 'Error loading insights:', showToast: false });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!profile || !insights) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Unable to load insights</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Insights</h1>
        <p className="text-lg text-slate-600 mb-8">Track your progress and discover ways to improve</p>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 flex items-center justify-center">
              <ReliabilityMeterV2
                score={profile.reliability_score}
                tier={profile.tier}
                size="small"
                showLabel={true}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-3xl font-bold text-slate-900">{insights.recentBookings}</p>
              <p className="text-sm text-slate-600">Last 30 Days</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Zap className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-3xl font-bold text-slate-900">{insights.avgRating.toFixed(1)}⭐</p>
              <p className="text-sm text-slate-600">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Target className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-3xl font-bold text-slate-900">${insights.totalEarnings.toFixed(0)}</p>
              <p className="text-sm text-slate-600">Total Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Ways to Improve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    rec.type === 'warning'
                      ? 'border-amber-200 bg-amber-50'
                      : rec.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />}
                    {rec.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />}
                    {rec.type === 'info' && <Target className="w-5 h-5 text-blue-600 mt-0.5" />}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-slate-700 mb-2">{rec.description}</p>
                      <Badge className="text-xs">{rec.impact}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Earnings Trend */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Earnings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={insights.weeklyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={insights.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Tasks */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Most Booked Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={insights.topTasks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="task" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={insights.weeklyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={2} name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}