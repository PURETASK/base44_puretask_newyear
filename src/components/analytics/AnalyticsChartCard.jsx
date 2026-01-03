import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AnalyticsChartCard({ title, data, type = 'line', dataKeys, height = 300 }) {
  const colors = ['#66B3FF', '#28C76F', '#FF9F43', '#EA5455', '#9C27B0'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-fredoka text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            {type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, idx) => (
                  <Line
                    key={key.key}
                    type="monotone"
                    dataKey={key.key}
                    stroke={colors[idx % colors.length]}
                    name={key.name}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, idx) => (
                  <Bar
                    key={key.key}
                    dataKey={key.key}
                    fill={colors[idx % colors.length]}
                    name={key.name}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12 font-verdana">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}