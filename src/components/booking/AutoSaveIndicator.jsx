import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CheckCircle } from 'lucide-react';

export default function AutoSaveIndicator({ isSaving, lastSaved }) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence mode="wait">
        {isSaving && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
          >
            <Cloud className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-fredoka">Saving...</span>
          </motion.div>
        )}
        
        {showSaved && !isSaving && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-fredoka">Saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}