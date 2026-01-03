import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, TrendingUp } from 'lucide-react';

const TIER_COLORS = {
  'Elite': '#10b981',
  'Pro': '#3b82f6',
  'Semi Pro': '#f59e0b',
  'Developing': '#94a3b8'
};

export default function CleanerTierDistribution() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cleaners = await base44.entities.CleanerProfile.list();
      const activeCleaners = cleaners.filter(c => c.is_active);

      const tierCounts = {
        'Elite': 0,
        'Pro': 0,
        'Semi Pro': 0,
        'Developing': 0
      };

      let totalScore = 0;

      activeCleaners.forEach(cleaner => {
        const tier = cleaner.tier || 'Developing';
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
        totalScore += cleaner.reliability_score || 75;
      });

      const chartData = Object.entries(tierCounts).map(([tier, count]) => ({
        tier,
        count,
        color: TIER_COLORS[tier],
        percentage: activeCleaners.length > 0 ? ((count / activeCleaners.length) * 100).toFixed(1) : 0
      }));

      setData(chartData);
      setStats({
        total: activeCleaners.length,
        avgScore: activeCleaners.length > 0 ? (totalScore / activeCleaners.length).toFixed(1) : 0
      });
    } catch (error) {
      console.error('Error loading cleaner tier data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600 font-verdana">Loading cleaner data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="font-fredoka">Cleaner Tier Distribution</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-verdana">Avg Reliability</p>
            <p className="text-2xl font-bold text-purple-600 font-fredoka">{stats.avgScore}/100</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="tier" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(value, name, props) => [
                `${value} cleaners (${props.payload.percentage}%)`,
                props.payload.tier
              ]}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-4 gap-3 mt-6">
          {data.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl text-center border-2"
              style={{ borderColor: item.color, backgroundColor: `${item.color}10` }}
            >
              <p className="text-2xl font-bold font-fredoka" style={{ color: item.color }}>
                {item.count}
              </p>
              <p className="text-xs text-gray-600 font-verdana mt-1">{item.tier}</p>
              <p className="text-xs font-bold mt-1 font-fredoka" style={{ color: item.color }}>
                {item.percentage}%
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-verdana mb-1">Total Active Cleaners</p>
              <p className="text-3xl font-bold text-purple-900 font-fredoka">{stats.total}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}