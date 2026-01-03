import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart, Star, MapPin, DollarSign, Calendar, Loader2, Trash2,
  Edit2, Save, X, Sparkles, TrendingUp, Search, Plus, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function FavoriteCleaners() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cleanerProfiles, setCleanerProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || currentUser.user_type !== 'client') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Load favorites
      const favs = await base44.entities.FavoriteCleaner.filter({
        client_email: currentUser.email
      }, '-created_date');
      setFavorites(favs);

      // Load cleaner profiles for all favorites
      if (favs.length > 0) {
        const cleanerEmails = favs.map(f => f.cleaner_email);
        const profiles = await base44.entities.CleanerProfile.filter({
          user_email: { $in: cleanerEmails }
        });
        setCleanerProfiles(profiles);
      }
    } catch (error) {
      handleError(error, { userMessage: 'Error loading favorites:', showToast: false });
      toast.error('Failed to load favorites');
    }
    setLoading(false);
  };

  const handleRemoveFavorite = async (favoriteId) => {
    if (!confirm('Remove this cleaner from your favorites?')) return;

    try {
      await base44.entities.FavoriteCleaner.delete(favoriteId);
      toast.success('Removed from favorites');
      loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error removing favorite:', showToast: false });
      toast.error('Failed to remove favorite');
    }
  };

  const handleEditNotes = (favorite) => {
    setEditingNotes(favorite.id);
    setNotesText(favorite.notes || '');
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await base44.entities.FavoriteCleaner.update(editingNotes, {
        notes: notesText
      });
      toast.success('Notes saved');
      setEditingNotes(null);
      loadData();
    } catch (error) {
      handleError(error, { userMessage: 'Error saving notes:', showToast: false });
      toast.error('Failed to save notes');
    }
    setSavingNotes(false);
  };

  const getCleanerProfile = (cleanerEmail) => {
    return cleanerProfiles.find(p => p.user_email === cleanerEmail);
  };

  const filteredFavorites = favorites.filter(fav => {
    if (!searchQuery) return true;
    const profile = getCleanerProfile(fav.cleaner_email);
    return (
      fav.cleaner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cloud flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-puretask-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cloud p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-graphite mb-2 flex items-center gap-3">
            <Heart className="w-10 h-10 text-red-500" fill="currentColor" />
            My Favorite Cleaners
          </h1>
          <p className="text-lg text-gray-600 font-verdana">
            Quick access to your trusted cleaning professionals
          </p>
        </div>

        {/* Search */}
        {favorites.length > 0 && (
          <Card className="mb-6 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search your favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 font-verdana"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {favorites.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl">
              <CardContent className="p-6 text-center">
                <Heart className="w-10 h-10 text-red-500 mx-auto mb-3" fill="currentColor" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">{favorites.length}</p>
                <p className="text-sm text-gray-600 font-verdana">Favorite Cleaners</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <CardContent className="p-6 text-center">
                <Star className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                  {(cleanerProfiles.reduce((sum, p) => sum + (p.average_rating || 5), 0) / Math.max(cleanerProfiles.length, 1)).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 font-verdana">Average Rating</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <p className="text-3xl font-fredoka font-bold text-graphite mb-1">
                  {Math.round(cleanerProfiles.reduce((sum, p) => sum + (p.reliability_score || 75), 0) / Math.max(cleanerProfiles.length, 1))}
                </p>
                <p className="text-sm text-gray-600 font-verdana">Avg Reliability</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Favorites List */}
        {filteredFavorites.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredFavorites.map((favorite, idx) => {
                const profile = getCleanerProfile(favorite.cleaner_email);
                
                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 border-red-200 hover:shadow-xl transition-all rounded-2xl">
                      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-2xl">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold text-xl">
                              {profile?.full_name?.[0] || favorite.cleaner_email[0].toUpperCase()}
                            </div>
                            <div>
                              <CardTitle className="font-fredoka text-graphite">
                                {profile?.full_name || favorite.cleaner_email}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {profile?.tier && (
                                  <Badge className={`rounded-full font-fredoka ${
                                    profile.tier === 'Elite' ? 'bg-amber-500 text-white' :
                                    profile.tier === 'Pro' ? 'bg-purple-500 text-white' :
                                    profile.tier === 'Semi Pro' ? 'bg-blue-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {profile.tier}
                                  </Badge>
                                )}
                                {profile?.average_rating && (
                                  <Badge className="bg-amber-100 text-amber-700 rounded-full font-fredoka">
                                    <Star className="w-3 h-3 mr-1" fill="currentColor" />
                                    {profile.average_rating.toFixed(1)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-4">
                        {/* Cleaner Info */}
                        {profile && (
                          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 font-verdana mb-1">Base Rate</p>
                              <p className="font-fredoka font-bold text-puretask-blue">
                                {profile.base_rate_credits_per_hour || 300} credits/hr
                              </p>
                              <p className="text-xs text-gray-500 font-verdana">
                                ≈ ${((profile.base_rate_credits_per_hour || 300) / 10).toFixed(0)}/hr
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-verdana mb-1">Reliability</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-fresh-mint h-2 rounded-full"
                                    style={{ width: `${profile.reliability_score || 75}%` }}
                                  />
                                </div>
                                <span className="font-fredoka font-bold text-graphite text-sm">
                                  {profile.reliability_score || 75}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Personal Notes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-fredoka font-semibold text-graphite">Personal Notes</p>
                            {editingNotes !== favorite.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditNotes(favorite)}
                                className="rounded-full"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>

                          {editingNotes === favorite.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                placeholder="Add personal notes about this cleaner..."
                                rows={3}
                                className="rounded-2xl font-verdana text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveNotes}
                                  disabled={savingNotes}
                                  className="flex-1 bg-fresh-mint text-white rounded-full font-fredoka"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingNotes(null)}
                                  className="rounded-full font-fredoka"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 font-verdana italic p-3 bg-gray-50 rounded-2xl">
                              {favorite.notes || 'No notes yet - click Edit to add'}
                            </p>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          <Button
                            onClick={() => navigate(createPageUrl(`BookingFlow?cleaner=${favorite.cleaner_email}`))}
                            className="brand-gradient text-white rounded-full font-fredoka font-semibold"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                          
                          <Button
                            onClick={() => navigate(createPageUrl(`CleanerProfile?email=${favorite.cleaner_email}`))}
                            variant="outline"
                            className="rounded-full font-fredoka border-2"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-600 hover:bg-red-50 rounded-full font-fredoka"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Remove from Favorites
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="border-0 shadow-xl rounded-2xl">
            <CardContent className="p-12 text-center">
              <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-fredoka font-bold text-graphite mb-2">
                {searchQuery ? 'No matching favorites found' : 'No Favorite Cleaners Yet'}
              </h3>
              <p className="text-gray-600 font-verdana mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search'
                  : 'Browse cleaners and click the heart icon to add them to your favorites for quick booking'}
              </p>
              
              {!searchQuery && (
                <Button
                  onClick={() => navigate(createPageUrl('BrowseCleaners'))}
                  className="brand-gradient text-white rounded-full font-fredoka font-semibold shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Cleaners
                </Button>
              )}
              
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="rounded-full font-fredoka"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        {favorites.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-fredoka text-graphite flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite mb-1">Book Recurring</p>
                    <p className="text-sm text-gray-600 font-verdana">
                      Convert any booking with your favorite to recurring and save 10%
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Edit2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite mb-1">Add Notes</p>
                    <p className="text-sm text-gray-600 font-verdana">
                      Keep track of preferences, special instructions, or what worked well
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite mb-1">Quick Booking</p>
                    <p className="text-sm text-gray-600 font-verdana">
                      Skip browsing - book your favorites instantly with one click
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-fredoka font-semibold text-graphite mb-1">Track Performance</p>
                    <p className="text-sm text-gray-600 font-verdana">
                      Watch your favorites improve their reliability scores over time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}