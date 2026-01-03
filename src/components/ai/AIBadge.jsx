import React from 'react';
import { Sparkles, Bot, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AIBadge({ variant = 'recommended', className = '' }) {
  const variants = {
    recommended: {
      icon: Sparkles,
      text: 'AI Recommended',
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    automated: {
      icon: Bot,
      text: 'AI Automated',
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    suggestion: {
      icon: Lightbulb,
      text: 'AI Suggestion',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  };

  const config = variants[variant] || variants.recommended;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} font-fredoka text-xs px-2 py-1 border`}>
      <Icon className="w-3 h-3 mr-1 inline" />
      {config.text}
    </Badge>
  );
}