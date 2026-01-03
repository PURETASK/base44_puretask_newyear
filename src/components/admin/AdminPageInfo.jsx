import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageDescriptions } from './pageDescriptions';

export default function AdminPageInfo({ currentPageName }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pageInfo = pageDescriptions[currentPageName];

  if (!pageInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-2 border-purple-500 shadow-2xl bg-purple-50">
        <CardHeader 
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer py-3 px-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <CardTitle className="text-lg font-fredoka">Admin Info: {pageInfo.title}</CardTitle>
            </div>
            <button className="hover:opacity-70 transition-opacity">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-4 space-y-3">
                <div>
                  <Badge className="bg-purple-600 text-white mb-2 font-fredoka">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Page Overview
                  </Badge>
                  <p className="text-sm text-gray-700 font-verdana">
                    {pageInfo.description}
                  </p>
                </div>

                {pageInfo.features && pageInfo.features.length > 0 && (
                  <div>
                    <Badge className="bg-pink-600 text-white mb-2 font-fredoka">
                      Key Features ({pageInfo.features.length})
                    </Badge>
                    <ul className="space-y-1">
                      {pageInfo.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-700 font-verdana flex items-start gap-2">
                          <span className="text-purple-600 font-bold mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-gray-500 font-verdana italic">
                    🔒 This panel is only visible to admins
                  </p>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}