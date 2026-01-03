import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator({ name }) {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
        <span className="text-sm text-slate-600">{name} is typing</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-slate-400 rounded-full"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}