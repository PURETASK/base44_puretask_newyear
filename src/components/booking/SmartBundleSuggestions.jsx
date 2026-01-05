import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Analyzes booking context and suggests relevant bundles
 */
export function analyzeBundleSuggestions({ homeType, squareFeet, hasPets, selectedTasks, bookingHistory = [] }) {
  const suggestions = [];

  // Move-out scenario
  if (selectedTasks.includes('deep_clean') && !selectedTasks.includes('oven')) {
    suggestions.push({
      id: 'moveout',
      name: 'Complete Move-Out Clean',
      reason: 'Perfect for getting your deposit back',
      tasks: ['oven', 'refrigerator', 'interior_walls'],
      savings: 20,
      confidence: 0.9
    });
  }

  // Spring cleaning scenario
  if (selectedTasks.includes('deep_clean') && !selectedTasks.includes('windows')) {
    suggestions.push({
      id: 'spring',
      name: 'Spring Refresh',
      reason: 'Popular combo for seasonal deep clean',
      tasks: ['windows', 'interior_walls'],
      savings: 15,
      confidence: 0.8
    });
  }

  // Kitchen focus
  if (selectedTasks.includes('kitchen') && !selectedTasks.includes('oven') && !selectedTasks.includes('refrigerator')) {
    suggestions.push({
      id: 'kitchen_deep',
      name: 'Kitchen Deep Clean',
      reason: 'Get every inch of your kitchen sparkling',
      tasks: ['oven', 'refrigerator', 'dishes'],
      savings: 15,
      confidence: 0.85
    });
  }

  // Large home bonus
  if (squareFeet > 2000 && !selectedTasks.includes('organizing')) {
    suggestions.push({
      id: 'large_home',
      name: 'Large Home Package',
      reason: 'Extra help for bigger spaces',
      tasks: ['organizing', 'laundry'],
      savings: 10,
      confidence: 0.7
    });
  }

  // Pet owner special
  if (hasPets && !selectedTasks.includes('deep_clean')) {
    suggestions.push({
      id: 'pet_owner',
      name: 'Pet-Friendly Deep Clean',
      reason: 'Remove pet hair and dander thoroughly',
      tasks: ['deep_clean'],
      savings: 15,
      confidence: 0.75
    });
  }

  // Sort by confidence and return top 2
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 2);
}

export default function SmartBundleSuggestions({ 
  homeType, 
  squareFeet, 
  hasPets, 
  selectedTasks,
  appliedBundles,
  onApplyBundle 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const newSuggestions = analyzeBundleSuggestions({
      homeType,
      squareFeet,
      hasPets,
      selectedTasks
    });

    // Filter out already applied or dismissed
    const filtered = newSuggestions.filter(
      s => !appliedBundles.includes(s.id) && !dismissed.includes(s.id)
    );

    setSuggestions(filtered);
  }, [homeType, squareFeet, hasPets, selectedTasks, appliedBundles, dismissed]);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-slate-900">Recommended for You</h3>
      </div>

      <AnimatePresence>
        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-purple-900">{suggestion.name}</h4>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">{suggestion.reason}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {suggestion.tasks.map(task => (
                        <Badge key={task} variant="outline" className="text-xs bg-white border-purple-300 text-purple-800">
                          {task.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Badge className="bg-emerald-500 text-white ml-3 flex-shrink-0">
                    Save ${suggestion.savings}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApplyBundle(suggestion)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Add Bundle
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDismissed([...dismissed, suggestion.id])}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}