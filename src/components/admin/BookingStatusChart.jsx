import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Briefcase } from 'lucide-react';

const COLORS = {
  scheduled: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  approved: '#059669',
  cancelled: '#ef4444',
  disputed: '#f59e0b',
  awaiting_cleaner_response: '#f97316',
  payment_hold: '#eab308'
};

export default function BookingStatusChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bookings = await base44.entities.Booking.list();

      const statusCounts = {};
      bookings.forEach(booking => {
        const status = booking.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count,
        color: COLORS[status] || '#94a3b8'
      }));

      setData(chartData.sort((a, b) => b.value - a.value));
    } catch (error) {
      console.error('Error loading booking status data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600 font-verdana">Loading booking data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <span className="font-fredoka">Booking Status Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} bookings`} />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-soft-cloud rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <div>
                <p className="text-xs text-gray-600 font-verdana">{item.name}</p>
                <p className="text-sm font-bold text-graphite font-fredoka">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}