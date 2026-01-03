import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TopCleanersTable({ limit = 10 }) {
  const navigate = useNavigate();
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopCleaners();
  }, []);

  const loadTopCleaners = async () => {
    try {
      const allCleaners = await base44.entities.CleanerProfile.filter(
        { is_active: true },
        '-reliability_score',
        limit
      );
      setCleaners(allCleaners);
    } catch (error) {
      console.error('Error loading top cleaners:', error);
    }
    setLoading(false);
  };

  const getTierColor = (tier) => {
    const colors = {
      'Elite': 'bg-emerald-100 text-emerald-800',
      'Pro': 'bg-blue-100 text-blue-800',
      'Semi Pro': 'bg-amber-100 text-amber-800',
      'Developing': 'bg-slate-100 text-slate-800'
    };
    return colors[tier] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600 font-verdana">Loading top cleaners...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-600" />
          <span className="font-fredoka">Top Performers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {cleaners.map((cleaner, index) => (
            <div
              key={cleaner.id}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-md ${
                index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300' :
                index === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-100 border-2 border-slate-300' :
                index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300' :
                'bg-soft-cloud hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold font-fredoka text-lg">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-graphite font-fredoka truncate">{cleaner.full_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getTierColor(cleaner.tier)}>
                    {cleaner.tier}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-semibold font-verdana">{cleaner.average_rating?.toFixed(1) || '5.0'}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-verdana">• {cleaner.total_jobs || 0} jobs</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-emerald-600 font-fredoka">{cleaner.reliability_score || 75}</p>
                <p className="text-xs text-gray-600 font-verdana">reliability</p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(createPageUrl(`CleanerProfile?email=${cleaner.user_email}`))}
                className="rounded-full"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}