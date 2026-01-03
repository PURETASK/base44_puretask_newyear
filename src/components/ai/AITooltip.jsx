import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AIBadge from './AIBadge';

export default function AITooltip({ variant, reason, children }) {
  if (!reason) {
    return <AIBadge variant={variant} />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">
            <AIBadge variant={variant} />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <p className="text-xs font-verdana">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}