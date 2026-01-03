import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

export function AnimatedInput({ error, ...props }) {
  return (
    <motion.div
      key={error ? "error-shake" : "no-error"}
      animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
      transition={{ type: "spring", stiffness: 1000, damping: 10 }}
    >
      <Input {...props} className={error ? "border-red-500" : props.className} />
    </motion.div>
  );
}