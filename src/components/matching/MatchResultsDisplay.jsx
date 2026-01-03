import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Award, MapPin, CheckCircle } from 'lucide-react';

/**
 * Display SmartMatch results with primary + fallback cleaners
 */
export default function MatchResultsDisplay({ matchResults, onSelectCleaner }) {
  if (!matchResults || !matchResults.scores) {
    return null;
  }

  const { primary, fallbacks, scores } = matchResults;

  return (
    <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="font-fredoka text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-puretask-blue" />
          Smart Match Results
        </CardTitle>
        <p className="text-sm text-gray-600 font-verdana mt-2">
          We found {scores.length} qualified cleaners ranked by compatibility
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {scores.map((result, index) => (
          <div
            key={result.email}
            className={`p-4 rounded-2xl transition-all ${
              index === 0 
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-puretask-blue' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {index === 0 && (
                  <Award className="w-6 h-6 text-puretask-blue" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-fredoka font-bold text-graphite">
                      {result.name || result.email}
                    </span>
                    {index === 0 && (
                      <Badge className="bg-puretask-blue text-white">
                        Best Match
                      </Badge>
                    )}
                    {index > 0 && index <= 2 && (
                      <Badge variant="secondary">
                        Backup #{index}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3" />
                      {Math.round(result.score * 100)}% Match
                    </div>
                  </div>
                </div>
              </div>

              {index === 0 && onSelectCleaner && (
                <Button
                  onClick={() => onSelectCleaner(result.email)}
                  className="brand-gradient text-white rounded-full font-fredoka"
                  size="sm"
                >
                  Select
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}