import React from 'react';
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AISettingTooltip({ title, description, benefits = [], considerations = [], learnMoreLink }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center ml-2">
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-puretask-blue transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-fredoka font-semibold text-sm mb-1">{title}</h4>
              <p className="text-xs text-gray-600 font-verdana">{description}</p>
            </div>
            
            {benefits.length > 0 && (
              <div>
                <p className="text-xs font-fredoka font-semibold text-green-700 mb-1">Benefits:</p>
                <ul className="space-y-1">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {considerations.length > 0 && (
              <div>
                <p className="text-xs font-fredoka font-semibold text-yellow-700 mb-1">Considerations:</p>
                <ul className="space-y-1">
                  {considerations.map((consideration, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {learnMoreLink && (
              <a href={learnMoreLink} className="text-xs text-puretask-blue hover:underline font-verdana">
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}