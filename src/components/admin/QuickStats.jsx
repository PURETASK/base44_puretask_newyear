import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickStats({ stats, loading }) {
  const statCards = [
    {
      title: 'Active Cleaners',
      value: stats.activeCleaners,
      subtitle: `${stats.totalCleaners} total`,
      icon: '👨‍🔧',
      color: 'from-emerald-500 to-green-600',
      headerBg: '#10B981',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      subtitle: 'Awaiting review',
      icon: '🔍',
      color: stats.pendingVerifications > 0 ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-cyan-600',
      headerBg: stats.pendingVerifications > 0 ? '#F59E0B' : '#3B82F6',
      alert: stats.pendingVerifications > 0
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      subtitle: `${stats.activeBookings} active now`,
      icon: '📅',
      color: 'from-purple-500 to-pink-600',
      headerBg: '#A855F7',
      trend: '+12.3%',
      trendUp: true
    },
    {
      title: 'Open Issues',
      value: stats.openDisputes + stats.openTickets,
      subtitle: `${stats.openDisputes} disputes • ${stats.openTickets} tickets`,
      icon: '⚠️',
      color: (stats.openDisputes + stats.openTickets) > 0 ? 'from-red-500 to-rose-600' : 'from-slate-500 to-gray-600',
      headerBg: (stats.openDisputes + stats.openTickets) > 0 ? '#EF4444' : '#64748B',
      alert: (stats.openDisputes + stats.openTickets) > 0
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(0)}`,
      subtitle: `Total: $${stats.totalRevenue.toFixed(0)}`,
      icon: '💰',
      color: 'from-green-500 to-emerald-600',
      headerBg: '#22C55E',
      trend: '+18.7%',
      trendUp: true
    },
    {
      title: 'Avg Reliability',
      value: `${stats.avgReliabilityScore.toFixed(0)}/100`,
      subtitle: `${stats.avgRating.toFixed(1)}/5.0 rating`,
      icon: '⭐',
      color: 'from-indigo-500 to-purple-600',
      headerBg: '#6366F1'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg rounded-2xl animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden">
            {/* Bright colored header section */}
            <div 
              className="h-3 w-full"
              style={{ backgroundColor: stat.headerBg }}
            ></div>
            
            {/* Card content with gradient background */}
            <div className={`bg-gradient-to-br ${stat.color} text-white relative`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{stat.icon}</span>
                  {stat.alert && (
                    <Badge className="bg-white/20 text-white animate-pulse rounded-full font-fredoka">
                      {stat.value}
                    </Badge>
                  )}
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? 'text-white' : 'text-white/80'}`}>
                      {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  )}
                </div>
                <p className="text-3xl font-fredoka font-bold mb-1">{stat.value}</p>
                <p className="text-sm opacity-90 font-verdana mb-1">{stat.title}</p>
                <p className="text-xs opacity-75 font-verdana">{stat.subtitle}</p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}