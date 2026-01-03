import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const AnimatedButton = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="inline-block"
    >
      <Button ref={ref} className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  );
});

AnimatedButton.displayName = 'AnimatedButton';