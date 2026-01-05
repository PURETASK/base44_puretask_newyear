import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';

export default function RevenueChart() {
  const [data, setData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bookings = await base44.entities.Booking.list();
      const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'approved');

      // Group by month
      const monthlyData = {};
      let total = 0;

      completedBookings.forEach(booking => {
        const date = new Date(booking.created_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const revenue = booking.total_price || 0;
        const platformFee = revenue * 0.15; // 15% platform fee
        const cleanerPayout = revenue * 0.85; // 85% to cleaner
        
        total += platformFee;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthName,
            revenue: 0,
            platformFee: 0,
            cleanerPayout: 0,
            bookings: 0
          };
        }

        monthlyData[monthKey].revenue += revenue;
        monthlyData[monthKey].platformFee += platformFee;
        monthlyData[monthKey].cleanerPayout += cleanerPayout;
        monthlyData[monthKey].bookings += 1;
      });

      const chartData = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      setData(chartData);
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600 font-verdana">Loading revenue data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span className="font-fredoka">Revenue Overview</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-verdana">Total Platform Revenue</p>
            <p className="text-2xl font-bold text-emerald-600 font-fredoka">${totalRevenue.toFixed(2)}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(value) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="platformFee"
              stroke="#10b981"
              strokeWidth={3}
              name="Platform Fee (15%)"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="cleanerPayout"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Cleaner Payout (85%)"
              dot={{ r: 3 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-200">
            <p className="text-xs text-emerald-600 mb-1 font-verdana">Avg Monthly Revenue</p>
            <p className="text-xl font-bold text-emerald-900 font-fredoka">
              ${data.length > 0 ? (data.reduce((sum, d) => sum + d.platformFee, 0) / data.length).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-center border border-blue-200">
            <p className="text-xs text-blue-600 mb-1 font-verdana">Total Bookings</p>
            <p className="text-xl font-bold text-blue-900 font-fredoka">
              {data.reduce((sum, d) => sum + d.bookings, 0)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-2xl text-center border border-purple-200">
            <p className="text-xs text-purple-600 mb-1 font-verdana">Avg Per Booking</p>
            <p className="text-xl font-bold text-purple-900 font-fredoka">
              ${data.length > 0 ? ((data.reduce((sum, d) => sum + d.revenue, 0) / data.reduce((sum, d) => sum + d.bookings, 0))).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}