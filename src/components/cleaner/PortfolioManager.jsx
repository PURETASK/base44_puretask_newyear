import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, Plus, X, Upload, Loader2, Star, 
  ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'living_room', label: 'Living Room', icon: '🛋️' },
  { value: 'office', label: 'Office', icon: '💼' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
  { value: 'deep_clean', label: 'Deep Clean', icon: '✨' },
  { value: 'move_out', label: 'Move-Out', icon: '📦' },
  { value: 'post_construction', label: 'Post-Construction', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '📸' }
];

export default function PortfolioManager({ portfolioItems = [], onPortfolioUpdated }) {
  const [items, setItems] = useState(portfolioItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    before_photo_url: '',
    after_photo_url: '',
    category: 'kitchen',
    date: new Date().toISOString().split('T')[0],
    featured: false
  });

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (type === 'before') setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewItem({
        ...newItem,
        [type === 'before' ? 'before_photo_url' : 'after_photo_url']: file_url
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo');
    } finally {
      if (type === 'before') setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  const addItem = () => {
    if (!newItem.title || !newItem.before_photo_url || !newItem.after_photo_url) {
      alert('Please fill in title and upload both photos');
      return;
    }

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    if (onPortfolioUpdated) {
      onPortfolioUpdated(updatedItems);
    }

    setNewItem({
      title: '',
      description: '',
      before_photo_url: '',
      after_photo_url: '',
      category: 'kitchen',
      date: new Date().toISOString().split('T')[0],
      featured: false
    });
    setShowAddForm(false);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    if (onPortfolioUpdated) {
      onPortfolioUpdated(updatedItems);
    }
    if (currentIndex >= updatedItems.length) {
      setCurrentIndex(Math.max(0, updatedItems.length - 1));
    }
  };

  const toggleFeatured = (index) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, featured: !item.featured } : item
    );
    setItems(updatedItems);
    if (onPortfolioUpdated) {
      onPortfolioUpdated(updatedItems);
    }
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const categoryConfig = CATEGORIES.find(c => c.value === newItem.category);

  return (
    <Card className="border-2 border-pink-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
        <CardTitle className="font-fredoka text-graphite flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-600" />
            Portfolio ({items.length} {items.length === 1 ? 'item' : 'items'})
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white font-fredoka"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Work
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Add New Item Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-pink-200 rounded-xl p-6 space-y-4 bg-pink-50"
            >
              <h3 className="font-fredoka font-bold text-graphite text-lg">Add Portfolio Item</h3>
              
              <div>
                <Label htmlFor="title" className="font-fredoka">Title *</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., Kitchen Deep Clean Transformation"
                  className="rounded-xl font-verdana"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-fredoka">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe the work you did..."
                  rows={3}
                  className="rounded-xl font-verdana"
                />
              </div>

              <div>
                <Label htmlFor="category" className="font-fredoka">Category *</Label>
                <select
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-2 border rounded-xl font-verdana"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div>
                  <Label className="font-fredoka">Before Photo *</Label>
                  {newItem.before_photo_url ? (
                    <div className="relative">
                      <img
                        src={newItem.before_photo_url}
                        alt="Before"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-300"
                      />
                      <Button
                        onClick={() => setNewItem({ ...newItem, before_photo_url: '' })}
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-all">
                        {uploadingBefore ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-verdana text-gray-600">Upload Before</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'before')}
                        disabled={uploadingBefore}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* After Photo */}
                <div>
                  <Label className="font-fredoka">After Photo *</Label>
                  {newItem.after_photo_url ? (
                    <div className="relative">
                      <img
                        src={newItem.after_photo_url}
                        alt="After"
                        className="w-full h-48 object-cover rounded-xl border-2 border-green-400"
                      />
                      <Button
                        onClick={() => setNewItem({ ...newItem, after_photo_url: '' })}
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-all">
                        {uploadingAfter ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-verdana text-gray-600">Upload After</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'after')}
                        disabled={uploadingAfter}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="font-fredoka"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addItem}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-fredoka"
                >
                  Add to Portfolio
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portfolio Display */}
        {items.length > 0 ? (
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-fredoka font-bold text-gray-600 mb-2">BEFORE</p>
                    <img
                      src={items[currentIndex].before_photo_url}
                      alt="Before"
                      className="w-full h-64 object-cover rounded-xl shadow-lg border-2 border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-fredoka font-bold text-green-600 mb-2">AFTER</p>
                    <img
                      src={items[currentIndex].after_photo_url}
                      alt="After"
                      className="w-full h-64 object-cover rounded-xl shadow-lg border-2 border-green-400"
                    />
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-fredoka font-bold text-lg text-graphite mb-1">
                      {items[currentIndex].title}
                    </h4>
                    {items[currentIndex].description && (
                      <p className="text-sm text-gray-600 font-verdana mb-2">
                        {items[currentIndex].description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-pink-100 text-pink-700 font-fredoka">
                        {CATEGORIES.find(c => c.value === items[currentIndex].category)?.icon}{' '}
                        {CATEGORIES.find(c => c.value === items[currentIndex].category)?.label}
                      </Badge>
                      {items[currentIndex].date && (
                        <Badge variant="outline" className="font-verdana">
                          {new Date(items[currentIndex].date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleFeatured(currentIndex)}
                      size="icon"
                      variant="outline"
                      className={items[currentIndex].featured ? 'bg-amber-50 border-amber-400' : ''}
                    >
                      <Star className={`w-4 h-4 ${items[currentIndex].featured ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      onClick={() => removeItem(currentIndex)}
                      size="icon"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  onClick={prevItem}
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex gap-2">
                  {items.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex ? 'bg-pink-500 w-6' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  onClick={nextItem}
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-fredoka font-semibold mb-2">No portfolio items yet</p>
            <p className="text-sm font-verdana">Add your best work to showcase your cleaning skills!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}