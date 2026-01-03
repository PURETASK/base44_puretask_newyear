import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FavoriteButton({ cleanerEmail, user, size = 'default', className = '' }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFavoriteStatus();
  }, [cleanerEmail, user]);

  const checkFavoriteStatus = async () => {
    if (!user || !cleanerEmail) {
      setChecking(false);
      return;
    }

    try {
      const favorites = await base44.entities.FavoriteCleaner.filter({
        client_email: user.email,
        cleaner_email: cleanerEmail
      });

      if (favorites.length > 0) {
        setIsFavorite(true);
        setFavoriteId(favorites[0].id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
    setChecking(false);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        await base44.entities.FavoriteCleaner.delete(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const newFavorite = await base44.entities.FavoriteCleaner.create({
          client_email: user.email,
          cleaner_email: cleanerEmail,
          notes: ''
        });
        setIsFavorite(true);
        setFavoriteId(newFavorite.id);
        toast.success('Added to favorites!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
    setLoading(false);
  };

  if (checking) {
    return null;
  }

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      <Button
        onClick={handleToggleFavorite}
        disabled={loading}
        size={size}
        variant="ghost"
        className={`rounded-full ${className}`}
      >
        <motion.div
          animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-gray-400'} transition-colors`}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </motion.div>
      </Button>
    </motion.div>
  );
}