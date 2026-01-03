import React, { useState, useEffect } from 'react';
import { Booking } from '@/api/entities';
import { CleanerProfile } from '@/api/entities';
import { ClientProfile } from '@/api/entities';
import { Review } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Star, Calendar, CheckCircle, DollarSign, Award, Percent } from 'lucide-react';

export default function PlatformMetrics() {
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    completedBookings: 0,
    completionRate: 0,
    averageRating: 0,
    activeCleaners: 0,
    activeClients: 0,
    totalRevenue: 0,
    averageReliability: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const bookings = await Booking.list();
      const cleaners = await CleanerProfile.list();
      const clients = await ClientProfile.list();
      const reviews = await Review.list();

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price * 0.15), 0);
      
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const averageReliability = cleaners.length > 0
        ? cleaners.reduce((sum, c) => sum + c.reliability_score, 0) / cleaners.length
        : 0;

      setMetrics({
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        completionRate: bookings.length > 0 ? (completedBookings.length / bookings.length) * 100 : 0,
        averageRating: averageRating,
        activeCleaners: cleaners.filter(c => c.is_active).length,
        activeClients: clients.length,
        totalRevenue: totalRevenue,
        averageReliability: averageReliability
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">Loading platform metrics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Platform Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1">{metrics.totalBookings}</p>
              <p className="text-sm text-blue-700 font-medium">Total Bookings</p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  {metrics.completedBookings} completed ({metrics.completionRate.toFixed(1)}%)
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-900 mb-1">{metrics.averageRating.toFixed(1)}</p>
              <p className="text-sm text-amber-700 font-medium">Average Rating</p>
              <div className="flex mt-3 pt-3 border-t border-amber-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(metrics.averageRating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-amber-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-900 mb-1">{metrics.activeCleaners}</p>
              <p className="text-sm text-emerald-700 font-medium">Active Cleaners</p>
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="text-xs text-emerald-600">
                  Avg reliability: {metrics.averageReliability.toFixed(0)}/100
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900 mb-1">{metrics.activeClients}</p>
              <p className="text-sm text-purple-700 font-medium">Active Clients</p>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <p className="text-xs text-purple-600">
                  Registered users
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Revenue Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Total Platform Revenue</p>
                  <p className="text-xs text-emerald-500 mt-1">15% platform fee from completed bookings</p>
                </div>
                <p className="text-2xl font-bold text-emerald-900">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Completed Bookings</p>
                  <p className="text-xs text-blue-500 mt-1">Successfully finished jobs</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">{metrics.completedBookings}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
                  <p className="text-xs text-purple-500 mt-1">Jobs completed vs total bookings</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">{metrics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Average Customer Rating</p>
                  <p className="text-xs text-amber-500 mt-1">Based on all reviews</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-900">{metrics.averageRating.toFixed(2)}</p>
                  <p className="text-xs text-amber-600">out of 5.0</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Average Reliability Score</p>
                  <p className="text-xs text-emerald-500 mt-1">Platform-wide cleaner reliability</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-900">{metrics.averageReliability.toFixed(0)}</p>
                  <p className="text-xs text-emerald-600">out of 100</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active Cleaners Ratio</p>
                  <p className="text-xs text-blue-500 mt-1">Currently accepting bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {metrics.activeCleaners > 0 ? '100' : '0'}%
                  </p>
                  <p className="text-xs text-blue-600">{metrics.activeCleaners} active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}